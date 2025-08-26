document.addEventListener('DOMContentLoaded', () => {
    // Navigation Elements
    const menuBtn = document.getElementById('menu-btn');
    const navMenu = document.getElementById('nav-menu');
    const sections = document.querySelectorAll('main > section');

    // Form Elements
    const form = document.getElementById('data-collection-form');
    const tableBody = document.querySelector('#volunteer-activities-table tbody');
    const addRowBtn = document.getElementById('add-row');
    const saveDraftBtn = document.getElementById('save-draft');
    const draftsList = document.getElementById('drafts-list');
    const sentList = document.getElementById('sent-list');
    const loadedDraftKeyInput = document.getElementById('loaded-draft-key');

    // --- Navigation Logic ---
    const showSection = (targetId) => {
        sections.forEach(section => {
            if (targetId === 'all' || section.id === targetId) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });
        navMenu.classList.remove('open'); // Close menu after selection
    };

    menuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('open');
    });

    navMenu.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            const targetSection = e.target.dataset.section;
            if (targetSection) {
                e.preventDefault();
                showSection(targetSection);
            }
        }
    });

    // --- Core Application Logic ---
    const calculateTotals = () => {
        const totals = {
            sessions: 0, ied_materials: 0,
            girls_resident: 0, girls_returnee: 0, girls_displaced: 0,
            boys_resident: 0, boys_returnee: 0, boys_displaced: 0,
            women_resident: 0, women_returnee: 0, women_displaced: 0,
            men_resident: 0, men_returnee: 0, men_displaced: 0
        };

        tableBody.querySelectorAll('tr').forEach(row => {
            totals.sessions += parseInt(row.querySelector('[name="sessions"]').value) || 0;
            totals.ied_materials += parseInt(row.querySelector('[name="iec_materials"]').value) || 0;
            totals.girls_resident += parseInt(row.querySelector('[name="girls_resident"]').value) || 0;
            totals.girls_returnee += parseInt(row.querySelector('[name="girls_returnee"]').value) || 0;
            totals.girls_displaced += parseInt(row.querySelector('[name="girls_displaced"]').value) || 0;
            totals.boys_resident += parseInt(row.querySelector('[name="boys_resident"]').value) || 0;
            totals.boys_returnee += parseInt(row.querySelector('[name="boys_returnee"]').value) || 0;
            totals.boys_displaced += parseInt(row.querySelector('[name="boys_displaced"]').value) || 0;
            totals.women_resident += parseInt(row.querySelector('[name="women_resident"]').value) || 0;
            totals.women_returnee += parseInt(row.querySelector('[name="women_returnee"]').value) || 0;
            totals.women_displaced += parseInt(row.querySelector('[name="women_displaced"]').value) || 0;
            totals.men_resident += parseInt(row.querySelector('[name="men_resident"]').value) || 0;
            totals.men_returnee += parseInt(row.querySelector('[name="men_returnee"]').value) || 0;
            totals.men_displaced += parseInt(row.querySelector('[name="men_displaced"]').value) || 0;
        });

        document.getElementById('total-sessions').textContent = totals.sessions;
        document.getElementById('total-iec').textContent = totals.ied_materials;
        document.getElementById('total-girls-resident').textContent = totals.girls_resident;
        document.getElementById('total-girls-returnee').textContent = totals.girls_returnee;
        document.getElementById('total-girls-displaced').textContent = totals.girls_displaced;
        document.getElementById('total-boys-resident').textContent = totals.boys_resident;
        document.getElementById('total-boys-returnee').textContent = totals.boys_returnee;
        document.getElementById('total-boys-displaced').textContent = totals.boys_displaced;
        document.getElementById('total-women-resident').textContent = totals.women_resident;
        document.getElementById('total-women-returnee').textContent = totals.women_returnee;
        document.getElementById('total-women-displaced').textContent = totals.women_displaced;
        document.getElementById('total-men-resident').textContent = totals.men_resident;
        document.getElementById('total-men-returnee').textContent = totals.men_returnee;
        document.getElementById('total-men-displaced').textContent = totals.men_displaced;
    };

    const addRow = () => {
        const newRow = tableBody.querySelector('tr').cloneNode(true);
        newRow.querySelectorAll('input, select').forEach(input => {
            if (input.type === 'number' || input.type === 'text' || input.type === 'date') {
                input.value = '';
            }
        });
        tableBody.appendChild(newRow);
    };

    const getFormData = () => {
        console.log('--- Reading form data ---');
        const directorate = document.getElementById('directorate').value;
        const messages = document.getElementById('messages').value;
        const volunteer_name = document.getElementById('volunteer-name').value;
        console.log('Messages value:', messages);

        const activities = [];
        tableBody.querySelectorAll('tr').forEach((row, index) => {
            const activity_date = row.querySelector('[name="activity_date"]').value;
            const district_area = row.querySelector('[name="district_area"]').value;
            console.log(`Row ${index} - Date: ${activity_date}, District: ${district_area}`);

            activities.push({
                activity_type: row.querySelector('[name="activity_type"]').value,
                district_area: district_area,
                sessions: row.querySelector('[name="sessions"]').value,
                iec_materials: row.querySelector('[name="iec_materials"]').value,
                girls_resident: row.querySelector('[name="girls_resident"]').value,
                girls_returnee: row.querySelector('[name="girls_returnee"]').value,
                girls_displaced: row.querySelector('[name="girls_displaced"]').value,
                boys_resident: row.querySelector('[name="boys_resident"]').value,
                boys_returnee: row.querySelector('[name="boys_returnee"]').value,
                boys_displaced: row.querySelector('[name="boys_displaced"]').value,
                women_resident: row.querySelector('[name="women_resident"]').value,
                women_returnee: row.querySelector('[name="women_returnee"]').value,
                women_displaced: row.querySelector('[name="women_displaced"]').value,
                men_resident: row.querySelector('[name="men_resident"]').value,
                men_returnee: row.querySelector('[name="men_returnee"]').value,
                men_displaced: row.querySelector('[name="men_displaced"]').value,
                activity_date: activity_date
            });
        });
        const draftId = loadedDraftKeyInput.value;
        const formData = { directorate, messages, volunteer_name, activities, savedAt: new Date().toISOString(), draftId };
        console.log('Final form data object:', formData);
        return formData;
    };

    const saveDraft = () => {
        const data = getFormData();
        let draftId = loadedDraftKeyInput.value;

        if (draftId) {
            localforage.setItem(draftId, data).then(() => {
                alert('تم تحديث المسودة بنجاح!');
                loadDrafts();
            });
        } else {
            draftId = `draft_${Date.now()}`;
            localforage.setItem(draftId, data).then(() => {
                alert('تم حفظ المسودة بنجاح!');
                loadDrafts();
            });
        }
    };

    const loadDrafts = () => {
        draftsList.innerHTML = '';
        localforage.keys().then(keys => {
            keys.forEach(key => {
                if (key.startsWith('draft_')) {
                    localforage.getItem(key).then(data => {
                        const li = document.createElement('li');
                        const text = document.createElement('span');
                        text.textContent = `مسودة محفوظة في ${new Date(data.savedAt).toLocaleString()}`;
                        li.appendChild(text);

                        const btnContainer = document.createElement('div');
                        const loadBtn = document.createElement('button');
                        loadBtn.textContent = 'تحميل';
                        loadBtn.onclick = () => {
                            loadDraft(key);
                            showSection('form-section');
                        };
                        btnContainer.appendChild(loadBtn);

                        const deleteBtn = document.createElement('button');
                        deleteBtn.textContent = 'حذف';
                        deleteBtn.className = 'delete-btn';
                        deleteBtn.onclick = () => deleteDraft(key);
                        btnContainer.appendChild(deleteBtn);
                        
                        li.appendChild(btnContainer);
                        draftsList.appendChild(li);
                    });
                }
            });
        });
    };

    const loadDraft = (key) => {
        localforage.getItem(key).then(data => {
            console.log('--- Loading draft data ---', data);
            document.getElementById('directorate').value = data.directorate;
            document.getElementById('messages').value = data.messages;
            document.getElementById('volunteer-name').value = data.volunteer_name;
            loadedDraftKeyInput.value = key;

            const templateRow = tableBody.querySelector('tr').cloneNode(true);
            templateRow.querySelectorAll('input').forEach(input => input.value = '');
            
            tableBody.innerHTML = '';

            if (data.activities && data.activities.length > 0) {
                data.activities.forEach(activity => {
                    const newRow = templateRow.cloneNode(true);
                    newRow.querySelector('[name="activity_type"]').value = activity.activity_type;
                    newRow.querySelector('[name="district_area"]').value = activity.district_area;
                    newRow.querySelector('[name="sessions"]').value = activity.sessions;
                    newRow.querySelector('[name="iec_materials"]').value = activity.iec_materials;
                    newRow.querySelector('[name="girls_resident"]').value = activity.girls_resident;
                    newRow.querySelector('[name="girls_returnee"]').value = activity.girls_returnee;
                    newRow.querySelector('[name="girls_displaced"]').value = activity.girls_displaced;
                    newRow.querySelector('[name="boys_resident"]').value = activity.boys_resident;
                    newRow.querySelector('[name="boys_returnee"]').value = activity.boys_returnee;
                    newRow.querySelector('[name="boys_displaced"]').value = activity.boys_displaced;
                    newRow.querySelector('[name="women_resident"]').value = activity.women_resident;
                    newRow.querySelector('[name="women_returnee"]').value = activity.women_returnee;
                    newRow.querySelector('[name="women_displaced"]').value = activity.women_displaced;
                    newRow.querySelector('[name="men_resident"]').value = activity.men_resident;
                    newRow.querySelector('[name="men_returnee"]').value = activity.men_returnee;
                    newRow.querySelector('[name="men_displaced"]').value = activity.men_displaced;
                    newRow.querySelector('[name="activity_date"]').value = activity.activity_date;
                    tableBody.appendChild(newRow);
                });
            } else {
                tableBody.appendChild(templateRow);
            }
            calculateTotals();
        });
    };

    const deleteDraft = (key) => {
        localforage.removeItem(key).then(() => {
            alert('تم حذف المسودة!');
            loadDrafts();
        });
    };

    const showSentFormModal = (submission) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        const content = document.createElement('div');
        content.className = 'modal-content';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'modal-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => overlay.remove();

        let html = `<h3>تفاصيل الإرسال</h3>
                    <p><strong>المديرية:</strong> ${submission.directorate}</p>
                    <p><strong>اسم المتطوع:</strong> ${submission.volunteer_name}</p>
                    <p><strong>الرسائل:</strong> ${submission.messages || 'لا يوجد'}</p>
                    <h4>الأنشطة</h4>`;
        
        if (submission.activities && submission.activities.length > 0) {
            html += '<div class="table-container"><table><thead>' +
                    '<tr><th>النشاط</th><th>المنطقة</th><th>الجلسات</th><th>مواد توعية</th>' +
                    '<th>بنات(م)</th><th>بنات(ع)</th><th>بنات(ن)</th>' +
                    '<th>بنين(م)</th><th>بنين(ع)</th><th>بنين(ن)</th>' +
                    '<th>نساء(م)</th><th>نساء(ع)</th><th>نساء(ن)</th>' +
                    '<th>رجال(م)</th><th>رجال(ع)</th><th>رجال(ن)</th>' +
                    '<th>التاريخ</th></tr></thead><tbody>';

            submission.activities.forEach(act => {
                html += `<tr>
                            <td>${act.activity_type}</td>
                            <td>${act.district_area}</td>
                            <td>${act.sessions}</td>
                            <td>${act.iec_materials}</td>
                            <td>${act.girls_resident}</td>
                            <td>${act.girls_returnee}</td>
                            <td>${act.girls_displaced}</td>
                            <td>${act.boys_resident}</td>
                            <td>${act.boys_returnee}</td>
                            <td>${act.boys_displaced}</td>
                            <td>${act.women_resident}</td>
                            <td>${act.women_returnee}</td>
                            <td>${act.women_displaced}</td>
                            <td>${act.men_resident}</td>
                            <td>${act.men_returnee}</td>
                            <td>${act.men_displaced}</td>
                            <td>${act.activity_date}</td>
                         </tr>`;
            });

            html += '</tbody></table></div>';
        }

        content.innerHTML = html;
        content.prepend(closeBtn);
        overlay.appendChild(content);
        document.body.appendChild(overlay);
    };

    const loadSentForms = () => {
        sentList.innerHTML = '';
        database.ref('submissions').limitToLast(20).on('value', (snapshot) => {
            sentList.innerHTML = '';
            snapshot.forEach((childSnapshot) => {
                const submission = childSnapshot.val();
                const li = document.createElement('li');
                
                const text = document.createElement('span');
                text.textContent = `تم الإرسال في ${new Date(submission.savedAt).toLocaleString()} - المديرية: ${submission.directorate}`;
                li.appendChild(text);

                const viewBtn = document.createElement('button');
                viewBtn.textContent = 'عرض';
                viewBtn.onclick = () => showSentFormModal(submission);
                li.appendChild(viewBtn);

                sentList.prepend(li);
            });
        });
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = getFormData();
        database.ref('submissions').push(data)
            .then(() => {
                alert('تم إرسال النموذج بنجاح!');
                form.reset();
                loadedDraftKeyInput.value = '';

                const templateRow = tableBody.querySelector('tr').cloneNode(true);
                templateRow.querySelectorAll('input').forEach(input => input.value = '');
                tableBody.innerHTML = '';
                tableBody.appendChild(templateRow);

                calculateTotals();

                if (data.draftId) {
                    localforage.removeItem(data.draftId).then(() => {
                        loadDrafts();
                    });
                }
            })
            .catch(error => {
                console.error('خطأ في إرسال النموذج: ', error);
                alert('خطأ في إرسال النموذج. يرجى المحاولة مرة أخرى.');
            });
    });

    // --- Event Listeners ---
    addRowBtn.addEventListener('click', addRow);
    saveDraftBtn.addEventListener('click', saveDraft);
    tableBody.addEventListener('input', calculateTotals);

    // --- Initial Load ---
    loadDrafts();
    loadSentForms();
    calculateTotals();
    showSection('form-section'); // Show the form by default
});