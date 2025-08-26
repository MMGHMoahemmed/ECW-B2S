document.addEventListener('DOMContentLoaded', () => {
    // --- HTML Elements ---
    const directorateFilter = document.getElementById('directorate-filter');
    const volunteerFilter = document.getElementById('volunteer-filter');
    const startDateFilter = document.getElementById('start-date-filter');
    const endDateFilter = document.getElementById('end-date-filter');
    const resetFiltersBtn = document.getElementById('reset-filters');

    const cardsContainer = document.querySelector('.dashboard-grid');
    const chartsContainer = document.querySelector('.charts-grid');
    const tableBody = document.getElementById('data-table-body');
    const paginationContainer = document.getElementById('pagination-controls');

    // --- State Variables ---
    let allActivities = [];
    let districtChart, activityChart, beneficiaryChart;
    let currentPage = 1;
    const rowsPerPage = 10;

    // --- Data Fetching ---
    const submissionsRef = database.ref('submissions');
    submissionsRef.on('value', (snapshot) => {
        const submissions = snapshot.val() || {};
        processAllSubmissions(submissions);
        updateDashboard();
    });

    function processAllSubmissions(submissions) {
        allActivities = [];
        const directorates = new Set();
        const volunteers = new Set();

        for (const key in submissions) {
            const submission = submissions[key];
            volunteers.add(submission.volunteer_name);
            directorates.add(submission.directorate);

            if (submission.activities) {
                submission.activities.forEach(activity => {
                    allActivities.push({ 
                        ...activity, 
                        volunteer_name: submission.volunteer_name, 
                        directorate: submission.directorate 
                    });
                });
            }
        }
        populateFilters(Array.from(directorates), Array.from(volunteers));
    }

    function populateFilters(directorates, volunteers) {
        // Populate only if they haven't been populated before to avoid duplicates on real-time updates
        if (directorateFilter.length <= 1) {
            directorates.forEach(d => directorateFilter.add(new Option(d, d)));
        }
        if (volunteerFilter.length <= 1) {
            volunteers.forEach(v => volunteerFilter.add(new Option(v, v)));
        }
    }

    // --- Filtering Logic ---
    function getFilteredData() {
        const directorate = directorateFilter.value;
        const volunteer = volunteerFilter.value;
        const startDate = startDateFilter.value;
        const endDate = endDateFilter.value;

        return allActivities.filter(activity => {
            const activityDate = new Date(activity.activity_date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            const directorateMatch = directorate === 'all' || activity.directorate === directorate;
            const volunteerMatch = volunteer === 'all' || activity.volunteer_name === volunteer;
            const dateMatch = (!start || activityDate >= start) && (!end || activityDate <= end);

            return directorateMatch && volunteerMatch && dateMatch;
        });
    }

    // --- Dashboard Update ---
    function updateDashboard() {
        const filteredActivities = getFilteredData();
        updateCards(filteredActivities);
        updateCharts(filteredActivities);
        renderTable(filteredActivities, 1);
    }

    function updateCards(activities) {
        const totalRecords = activities.length;
        const totalBeneficiaries = activities.reduce((sum, act) => sum + (parseInt(act.girls_resident) || 0) + (parseInt(act.girls_returnee) || 0) + (parseInt(act.girls_displaced) || 0) + (parseInt(act.boys_resident) || 0) + (parseInt(act.boys_returnee) || 0) + (parseInt(act.boys_displaced) || 0) + (parseInt(act.women_resident) || 0) + (parseInt(act.women_returnee) || 0) + (parseInt(act.women_displaced) || 0) + (parseInt(act.men_resident) || 0) + (parseInt(act.men_returnee) || 0) + (parseInt(act.men_displaced) || 0), 0);
        const volunteers = new Set(activities.map(a => a.volunteer_name));
        const districts = new Set(activities.map(a => a.directorate));

        cardsContainer.innerHTML = `
            <div class="card"><h3>إجمالي الأنشطة</h3><p>${totalRecords}</p></div>
            <div class="card"><h3>إجمالي المستفيدين</h3><p>${totalBeneficiaries}</p></div>
            <div class="card"><h3>المتطوعون النشطون</h3><p>${volunteers.size}</p></div>
            <div class="card"><h3>المديريات النشطة</h3><p>${districts.size}</p></div>
        `;
    }

    function updateCharts(activities) {
        const districtCounts = {};
        const activityCounts = {};
        const beneficiaryCounts = { girls: 0, boys: 0, women: 0, men: 0 };

        activities.forEach(activity => {
            districtCounts[activity.directorate] = (districtCounts[activity.directorate] || 0) + 1;
            activityCounts[activity.activity_type] = (activityCounts[activity.activity_type] || 0) + 1;
            beneficiaryCounts.girls += (parseInt(activity.girls_resident) || 0) + (parseInt(activity.girls_returnee) || 0) + (parseInt(activity.girls_displaced) || 0);
            beneficiaryCounts.boys += (parseInt(activity.boys_resident) || 0) + (parseInt(activity.boys_returnee) || 0) + (parseInt(activity.boys_displaced) || 0);
            beneficiaryCounts.women += (parseInt(activity.women_resident) || 0) + (parseInt(activity.women_returnee) || 0) + (parseInt(activity.women_displaced) || 0);
            beneficiaryCounts.men += (parseInt(activity.men_resident) || 0) + (parseInt(activity.men_returnee) || 0) + (parseInt(activity.men_displaced) || 0);
        });

        renderChart(districtChart, 'district-chart', 'bar', 'الأنشطة حسب المديرية', districtCounts);
        renderChart(activityChart, 'activity-chart', 'pie', 'الأنشطة حسب النوع', activityCounts);
        renderChart(beneficiaryChart, 'beneficiary-chart', 'doughnut', 'المستفيدون حسب الفئة', beneficiaryCounts, ['بنات', 'اولاد', 'نساء', 'رجال']);
    }

    function renderChart(chartInstance, canvasId, type, label, data, customLabels) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const chartData = customLabels ? Object.values(data) : Object.values(data);
        const labels = customLabels || Object.keys(data);

        if (window[canvasId+'Chart']) window[canvasId+'Chart'].destroy();

        window[canvasId+'Chart'] = new Chart(ctx, {
            type: type,
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: chartData,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)'
                    ]
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    // --- Table & Pagination ---
    function renderTable(activities, page) {
        currentPage = page;
        tableBody.innerHTML = '';
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedActivities = activities.slice(start, end);

        if (paginatedActivities.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6">لا توجد بيانات تطابق هذه الفلاتر.</td></tr>';
        } else {
            paginatedActivities.forEach(act => {
                const totalBeneficiaries = (parseInt(act.girls_resident) || 0) + (parseInt(act.girls_returnee) || 0) + (parseInt(act.girls_displaced) || 0) + (parseInt(act.boys_resident) || 0) + (parseInt(act.boys_returnee) || 0) + (parseInt(act.boys_displaced) || 0) + (parseInt(act.women_resident) || 0) + (parseInt(act.women_returnee) || 0) + (parseInt(act.women_displaced) || 0) + (parseInt(act.men_resident) || 0) + (parseInt(act.men_returnee) || 0) + (parseInt(act.men_displaced) || 0);
                const row = `
                    <tr>
                        <td>${act.activity_date || '-'}</td>
                        <td>${act.directorate || '-'}</td>
                        <td>${act.district_area || '-'}</td>
                        <td>${act.activity_type || '-'}</td>
                        <td>${act.volunteer_name || '-'}</td>
                        <td>${totalBeneficiaries}</td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        }
        renderPagination(activities.length, page);
    }

    function renderPagination(totalRows, page) {
        paginationContainer.innerHTML = '';
        const pageCount = Math.ceil(totalRows / rowsPerPage);
        if (pageCount <= 1) return;

        for (let i = 1; i <= pageCount; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = (i === page) ? 'active' : '';
            btn.addEventListener('click', () => renderTable(getFilteredData(), i));
            paginationContainer.appendChild(btn);
        }
    }

    // --- Event Listeners ---
    [directorateFilter, volunteerFilter, startDateFilter, endDateFilter].forEach(el => {
        el.addEventListener('change', updateDashboard);
    });

    resetFiltersBtn.addEventListener('click', () => {
        directorateFilter.value = 'all';
        volunteerFilter.value = 'all';
        startDateFilter.value = '';
        endDateFilter.value = '';
        updateDashboard();
    });
});