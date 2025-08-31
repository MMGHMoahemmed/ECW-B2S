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
                submission.activities.forEach((activity, index) => {
                    flattened.push({
                        subKey: subKey,
                        activityIndex: index,
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
            table.destroy();
        }

        table = new Tabulator(tableContainer, {
            data: data,
            layout: "fitData",
            history: true,
            height: 600 ,
            movableColumns: true,
            resizableRows: true,
            autoColumns: false,
            groupHeader: function(value, count, data, group) {
                return "<div style='text-align: right; width:100%;'>" + value + " (" + count + " الأنشطة)" + "</div>";
            },
            columns: [
                {
                    title: "حذف النشاط",
                    field: "deleteActivity",
                    hozAlign: "center",
                    frozen: true,
                    width:80,
                    formatter: function(cell, formatterParams, onRendered) {
                        return "<button class='delete-btn'>حذف</button>";
                    },
                    cellClick: function(e, cell) {
                        const rowData = cell.getRow().getData();
                        const { subKey, activityIndex } = rowData;
                        if (confirm("هل أنت متأكد أنك تريد حذف هذا النشاط؟")) {
                            deleteActivity(subKey, activityIndex);
                        }
                    }
                },
                {
                    title: "حذف كامل الادخال",
                    field: "deleteSubmission",
                    hozAlign: "center",
                    frozen: true,
                    width:100,
                    formatter: function(cell, formatterParams, onRendered) {
                        return "<button class='delete-all-btn'>حذف كامل الادخال</button>";
                    },
                    cellClick: function(e, cell) {
                        const rowData = cell.getRow().getData();
                        const { subKey } = rowData;
                        if (confirm("هل أنت متأكد أنك تريد حذف هذا الإرسال بالكامل؟")) {
                            deleteSubmission(subKey);
                        }
                    }
                },
                { title: "تاريخ النشاط", field: "activity_date", hozAlign: "right", sorter: "date", headerFilter: "input", frozen: true, editor: "input",width :120, resizable:true },
                { title: "المديرية", field: "directorate", hozAlign: "right", sorter: "string", headerFilter: "input", frozen: true, editor: "input",width:80, resizable:true },
                { title: "المنطقة", field: "district_area", hozAlign: "right", sorter: "string", headerFilter: "input", editor: "input",frozen: true,resizable:true,width:80, },
                { title: "نوع النشاط", field: "activity_type", hozAlign: "right", sorter: "string", headerFilter: "input", editor: "input",frozen: true,resizable:true },
                { title: "اسم المتطوع", field: "volunteer_name", hozAlign: "right", sorter: "string", headerFilter: "input", editor: "input",frozen: true,resizable:true},
                { title: "الجلسات", field: "sessions", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum", editor: "number" },
                { title: "مواد توعية", field: "iec_materials", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum", editor: "number" },
                { title: "بنات (مقيم)", field: "girls_resident", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum", editor: "number" },
                { title: "بنات (عائد)", field: "girls_returnee", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum", editor: "number" },
                { title: "بنات (نازح)", field: "girls_displaced", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum", editor: "number" },
                { title: "بنين (مقيم)", field: "boys_resident", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum", editor: "number" },
                { title: "بنين (عائد)", field: "boys_returnee", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum", editor: "number" },
                { title: "بنين (نازح)", field: "boys_displaced", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum", editor: "number" },
                { title: "نساء (مقيم)", field: "women_resident", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum", editor: "number" },
                { title: "نساء (عائد)", field: "women_returnee", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum", editor: "number" },
                { title: "نساء (نازح)", field: "women_displaced", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum", editor: "number" },
                { title: "رجال (مقيم)", field: "men_resident", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum", editor: "number" },
                { title: "رجال (عائد)", field: "men_returnee", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum", editor: "number" },
                { title: "رجال (نازح)", field: "men_displaced", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum", editor: "number" },
                { title: "إجمالي المستفيدين", field: "total_beneficiaries", hozAlign: "right", sorter: "number", headerFilter: "number", bottomCalc: "sum" }
            ],
            cellEdited: function(cell) {
                const rowData = cell.getRow().getData();
                const { subKey, activityIndex } = rowData;
                updateFirebaseData(subKey, activityIndex, rowData);
            }
        });
    }

    function updateFirebaseData(subKey, activityIndex, updatedData) {
        const submissionRef = database.ref(`submissions/${subKey}`);
        submissionRef.once('value', (snapshot) => {
            const submission = snapshot.val();
            if (submission && submission.activities && submission.activities[activityIndex]) {
                const activityToUpdate = submission.activities[activityIndex];
                activityToUpdate.activity_date = updatedData.activity_date;
                activityToUpdate.activity_type = updatedData.activity_type;
                activityToUpdate.district_area = updatedData.district_area;
                activityToUpdate.sessions = updatedData.sessions;
                activityToUpdate.iec_materials = updatedData.iec_materials;
                activityToUpdate.girls_resident = updatedData.girls_resident;
                activityToUpdate.girls_returnee = updatedData.girls_returnee;
                activityToUpdate.girls_displaced = updatedData.girls_displaced;
                activityToUpdate.boys_resident = updatedData.boys_resident;
                activityToUpdate.boys_returnee = updatedData.boys_returnee;
                activityToUpdate.boys_displaced = updatedData.boys_displaced;
                activityToUpdate.women_resident = updatedData.women_resident;
                activityToUpdate.women_returnee = updatedData.women_returnee;
                activityToUpdate.women_displaced = updatedData.women_displaced;
                activityToUpdate.men_resident = updatedData.men_resident;
                activityToUpdate.men_returnee = updatedData.men_returnee;
                activityToUpdate.men_displaced = updatedData.men_displaced;

                submissionRef.set(submission).then(() => {
                    console.log("Data updated successfully");
                }).catch((error) => {
                    console.error("Error updating data: ", error);
                });
            }
        });
    }

    function deleteActivity(subKey, activityIndex) {
        const submissionRef = database.ref(`submissions/${subKey}`);
        submissionRef.once('value', (snapshot) => {
            const submission = snapshot.val();
            if (submission && submission.activities && submission.activities.length > 1) {
                submission.activities.splice(activityIndex, 1);
                submissionRef.set(submission).then(() => {
                    console.log("Activity deleted successfully");
                }).catch((error) => {
                    console.error("Error deleting activity: ", error);
                });
            } else {
                deleteSubmission(subKey);
            }
        });
    }

    function deleteSubmission(subKey) {
        const submissionRef = database.ref(`submissions/${subKey}`);
        submissionRef.remove().then(() => {
            console.log("Submission deleted successfully");
        }).catch((error) => {
            console.error("Error deleting submission: ", error);
        });
    }

    // --- Export Functions ---
    downloadCsvBtn.addEventListener('click', () => {
        table.download("csv", "data.csv");
    });

    downloadXlsxBtn.addEventListener('click', () => {
        table.download("xlsx", "data.xlsx", { sheetName: "My Data" });
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
