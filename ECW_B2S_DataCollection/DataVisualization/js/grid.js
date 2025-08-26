document.addEventListener('DOMContentLoaded', () => {
    const tableContainer = document.getElementById('data-grid-table');
    const downloadCsvBtn = document.getElementById('download-csv');
    const downloadXlsxBtn = document.getElementById('download-xlsx');
    const downloadPdfBtn = document.getElementById('download-pdf');

    const groupBySelect = document.getElementById('group-by-select');
    const applyGroupingBtn = document.getElementById('apply-grouping');

    let table;

    // --- Data Fetching and Transformation ---
    const submissionsRef = database.ref('submissions');
    submissionsRef.on('value', (snapshot) => {
        const submissions = snapshot.val() || {};
        const flattenedData = flattenSubmissions(submissions);
        initializeTabulator(flattenedData);
    });

    function flattenSubmissions(submissions) {
        const flattened = [];
        for (const subKey in submissions) {
            const submission = submissions[subKey];
            if (submission.activities) {
                submission.activities.forEach(activity => {
                    flattened.push({
                        directorate: submission.directorate || '-',
                        volunteer_name: submission.volunteer_name || '-',
                        activity_date: activity.activity_date || '-',
                        activity_type: activity.activity_type || '-',
                        district_area: activity.district_area || '-',
                        sessions: parseInt(activity.sessions) || 0,
                        iec_materials: parseInt(activity.iec_materials) || 0,
                        girls_resident: parseInt(activity.girls_resident) || 0,
                        girls_returnee: parseInt(activity.girls_returnee) || 0,
                        girls_displaced: parseInt(activity.girls_displaced) || 0,
                        boys_resident: parseInt(activity.boys_resident) || 0,
                        boys_returnee: parseInt(activity.boys_returnee) || 0,
                        boys_displaced: parseInt(activity.boys_displaced) || 0,
                        women_resident: parseInt(activity.women_resident) || 0,
                        women_returnee: parseInt(activity.women_returnee) || 0,
                        women_displaced: parseInt(activity.women_displaced) || 0,
                        men_resident: parseInt(activity.men_resident) || 0,
                        men_returnee: parseInt(activity.men_returnee) || 0,
                        men_displaced: parseInt(activity.men_displaced) || 0,
                        // Calculate total beneficiaries for this activity
                        total_beneficiaries: (
                            (parseInt(activity.girls_resident) || 0) + (parseInt(activity.girls_returnee) || 0) + (parseInt(activity.girls_displaced) || 0) +
                            (parseInt(activity.boys_resident) || 0) + (parseInt(activity.boys_returnee) || 0) + (parseInt(activity.boys_displaced) || 0) +
                            (parseInt(activity.women_resident) || 0) + (parseInt(activity.women_returnee) || 0) + (parseInt(activity.women_displaced) || 0) +
                            (parseInt(activity.men_resident) || 0) + (parseInt(activity.men_returnee) || 0) + (parseInt(activity.men_displaced) || 0)
                        )
                    });
                });
            }
        }
        return flattened;
    }

    // --- Tabulator Initialization ---
    function initializeTabulator(data) {
        if (table) {
            table.destroy(); // Destroy existing table if it exists
        }

        table = new Tabulator(tableContainer, {
            data: data,
            layout:"fitDataFill", //fit columns to width of table (optional)
            //responsiveLayout: "hide", //hide columns that dont fit on the table
            addRowPos: "top", //when adding a row, add it to the top of the table
            history: true, //allow undo and redo actions on the table
            //pagination: "local", //paginate the data
            //paginationSize: 10, //allow 10 rows per page of data
            //paginationSizeSelector: [5, 10, 20, 50, 100], //allow the user to select the number of rows per page
            movableColumns: true, //allow column order to be changed
            resizableRows: true, //allow row height to be changed
            autoColumns: false, //disable auto-generation of columns
            //groupBy: ["directorate", "volunteer_name"], //group by directorate and then volunteer
            groupHeader: function(value, count, data, group){
                // Tabulator RTL fix for group header
                return "<div style=\"text-align: right; width:100%;\">" + value + " (" + count + " الأنشطة)" + "</div>";
            },
            columns: [
                { title: "تاريخ النشاط", field: "activity_date", hozAlign: "right", sorter: "date", headerFilter: "input", frozen: true },
                { title: "المديرية", field: "directorate", hozAlign: "right", sorter: "string", headerFilter: "input", frozen: true },
                { title: "المنطقة", field: "district_area", hozAlign: "right", sorter: "string", headerFilter: "input" },
                { title: "نوع النشاط", field: "activity_type", hozAlign: "right", sorter: "string", headerFilter: "input" },
                { title: "اسم المتطوع", field: "volunteer_name", hozAlign: "right", sorter: "string", headerFilter: "input" },
                { title: "الجلسات", field: "sessions", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum" },
                { title: "مواد توعية", field: "iec_materials", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum" },
                { title: "بنات (مقيم)", field: "girls_resident", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum" },
                { title: "بنات (عائد)", field: "girls_returnee", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum" },
                { title: "بنات (نازح)", field: "girls_displaced", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum" },
                { title: "بنين (مقيم)", field: "boys_resident", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum" },
                { title: "بنين (عائد)", field: "boys_returnee", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum" },
                { title: "بنين (نازح)", field: "boys_displaced", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum" },
                { title: "نساء (مقيم)", field: "women_resident", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum" },
                { title: "نساء (عائد)", field: "women_returnee", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum" },
                { title: "نساء (نازح)", field: "women_displaced", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum" },
                { title: "رجال (مقيم)", field: "men_resident", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum" },
                { title: "رجال (عائد)", field: "men_returnee", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum" },
                { title: "رجال (نازح)", field: "men_displaced", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum" },
                { title: "إجمالي المستفيدين", field: "total_beneficiaries", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum" }
            ],
            // Add custom filter function for date range if needed
            // headerFilters: true, // Enable header filters
        });
    }

    // --- Export Functions ---
    downloadCsvBtn.addEventListener('click', () => {
        table.download("csv", "data.csv");
    });

    downloadXlsxBtn.addEventListener('click', () => {
        table.download("xlsx", "data.xlsx", {sheetName:"My Data"});
    });

    downloadPdfBtn.addEventListener('click', () => {
        table.download("pdf", "data.pdf", {
            orientation: "landscape",
            title: "بيانات الأنشطة",
        });
    });

    applyGroupingBtn.addEventListener('click', () => {
        const selectedField = groupBySelect.value;
        if (selectedField) {
            table.setGroupBy(selectedField);
        } else {
            table.setGroupBy(false);
        }
    });
});
