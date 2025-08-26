document.addEventListener('DOMContentLoaded', () => {
    const totalRecordsEl = document.getElementById('total-records');
    const todayRecordsEl = document.getElementById('today-records');
    const totalVolunteersEl = document.getElementById('total-volunteers');
    const totalDistrictsEl = document.getElementById('total-districts');

    const districtChartCanvas = document.getElementById('district-chart').getContext('2d');
    const activityChartCanvas = document.getElementById('activity-chart').getContext('2d');
    const beneficiaryChartCanvas = document.getElementById('beneficiary-chart').getContext('2d');

    let districtChart, activityChart, beneficiaryChart;

    const submissionsRef = database.ref('submissions');

    submissionsRef.on('value', (snapshot) => {
        const submissions = snapshot.val();
        if (submissions) {
            processData(submissions);
        }
    });

    function processData(submissions) {
        let totalRecords = 0;
        let todayRecords = 0;
        const volunteers = new Set();
        const districts = new Set();
        const districtCounts = {};
        const activityCounts = {};
        const beneficiaryCounts = {
            girls: 0, boys: 0, women: 0, men: 0
        };

        const today = new Date().toISOString().slice(0, 10);

        for (const key in submissions) {
            const submission = submissions[key];
            volunteers.add(submission.volunteer_name);
            districts.add(submission.directorate);

            if (submission.activities) {
                // A submission counts as 1 for the directorate
                districtCounts[submission.directorate] = (districtCounts[submission.directorate] || 0) + 1;

                submission.activities.forEach(activity => {
                    totalRecords++;

                    if (activity.activity_date === today) {
                        todayRecords++;
                    }

                    // Activity Chart Data
                    activityCounts[activity.activity_type] = (activityCounts[activity.activity_type] || 0) + 1;

                    // Beneficiary Chart Data
                    beneficiaryCounts.girls += parseInt(activity.girls_resident || 0) + parseInt(activity.girls_returnee || 0) + parseInt(activity.girls_displaced || 0);
                    beneficiaryCounts.boys += parseInt(activity.boys_resident || 0) + parseInt(activity.boys_returnee || 0) + parseInt(activity.boys_displaced || 0);
                    beneficiaryCounts.women += parseInt(activity.women_resident || 0) + parseInt(activity.women_returnee || 0) + parseInt(activity.women_displaced || 0);
                    beneficiaryCounts.men += parseInt(activity.men_resident || 0) + parseInt(activity.men_returnee || 0) + parseInt(activity.men_displaced || 0);
                });
            }
        }

        // Update Cards
        totalRecordsEl.textContent = totalRecords;
        todayRecordsEl.textContent = todayRecords;
        totalVolunteersEl.textContent = volunteers.size;
        totalDistrictsEl.textContent = districts.size;

        // Update Charts
        renderDistrictChart(districtCounts);
        renderActivityChart(activityCounts);
        renderBeneficiaryChart(beneficiaryCounts);
    }

    function renderDistrictChart(data) {
        if (districtChart) districtChart.destroy();
        districtChart = new Chart(districtChartCanvas, {
            type: 'bar',
            data: {
                labels: Object.keys(data),
                datasets: [{
                    label: 'الإدخالات حسب المديرية',
                    data: Object.values(data),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function renderActivityChart(data) {
        if (activityChart) activityChart.destroy();
        activityChart = new Chart(activityChartCanvas, {
            type: 'pie',
            data: {
                labels: Object.keys(data),
                datasets: [{
                    label: 'الأنشطة حسب النوع',
                    data: Object.values(data),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    function renderBeneficiaryChart(data) {
        if (beneficiaryChart) beneficiaryChart.destroy();
        beneficiaryChart = new Chart(beneficiaryChartCanvas, {
            type: 'doughnut',
            data: {
                labels: ['بنات', 'اولاد', 'نساء', 'رجال'],
                datasets: [{
                    label: 'المستفيدون حسب الفئة',
                    data: [data.girls, data.boys, data.women, data.men],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
});