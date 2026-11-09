function toArabicNumbers(num) {
    if (num === null || num === undefined || isNaN(num)) return '٠';
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/\d/g, d => arabicDigits[d]);
}

function toEnglishNumbers(str) {
    if (!str) return '0';
    const arabicDigits = {'٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9'};
    let converted = str.toString().replace(/[٠-٩]/g, d => arabicDigits[d]);
    let digitsOnly = converted.replace(/[^\d]/g, '');
    return digitsOnly === '' ? '0' : digitsOnly;
}



function saveData() {
    localStorage.setItem('court_stats_data_v17', JSON.stringify(dataStore));
}

function manualSaveData() {
    saveData();
    alert("تم حفظ البيانات بنجاح! ✔️");
}

function switchType(type) {
    currentType = type;
    let menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) menuToggle.checked = false;

    let displayName = dataStore[type] ? (dataStore[type].title || type) : type;
    localStorage.setItem('lastSelectedType', type);
    
    let titleElem = document.getElementById('current-type-title');
    if (titleElem) titleElem.innerText = 'تفاصيل: ' + displayName;

    // التحكم في إظهار أو إخفاء الفوتر
    const distFooterBox = document.getElementById('distribution-footer-box');
    const stdFooterBox = document.getElementById('standard-footer-box');
    
    if (currentType === 'توزيع_الأحكام') {
        if (distFooterBox) distFooterBox.style.display = 'block';
        if (stdFooterBox) stdFooterBox.style.display = 'none';
    } else if (currentType === 'الإحصاء_القضائي_النهائي') {
        if (distFooterBox) distFooterBox.style.display = 'none';
        if (stdFooterBox) stdFooterBox.style.display = 'none';
    } else {
        if (distFooterBox) distFooterBox.style.display = 'none';
        if (stdFooterBox) stdFooterBox.style.display = 'block';
    }

    // [هام جداً]: تحديد الحاوية وإعادة ضبط الهيكل الأساسي للجدول العادي إذا لم نكن في صفحة الإحصاء
    let container = document.querySelector('.table-container') || document.getElementById('vertical-records-container');
    
    if (currentType === 'الإحصاء_القضائي_النهائي') {
        renderFinalReportViewContent(container);
    } else {
        // إعادة الهيكل الأساسي لجدول الأقسام العادية إذا كان قد تم استبداله بصفحة التقرير
        if (container && (container.innerHTML.includes('جدول الإجمالي العام الشامل') || container.innerHTML.includes('final-standard-summary-body'))) {
            // إعادة كتابة الهيكل HTML الأصلي لجداول القسم العادي وتوزيع الأحكام
            location.reload(); // أو إعادة بناء الهيكل البرمجي هنا مباشرة لضمان عدم بقاء آثار التقرير
        } else {
            renderTable(); // الدالة الطبيعية لرسم بيانات القسم
        }
    }

    updateDropdownDynamicMenu();
}

function addNewRow() {
    let section = dataStore[currentType];
    if (!section.rows) section.rows = [];
    section.rows.push({
        date: '',
        moajalParts: [0, 0, 0],
        shatb: 0,
        mawdoui: 0,
        sh: [0, 0, 0, 0],
        ith: [0, 0, 0, 0],
        farai: 0,
        solh: 0,
        waqf: 0
    });
    saveData();
    renderTable();
}

function removeRow(index) {
    let rows = dataStore[currentType].rows;
    rows.splice(index, 1);
    saveData();
    renderTable();
}

function resetCurrentPage() {
    if (confirm("هل أنت متأكد من تصفير أرقام هذه الصفحة؟")) {
        let section = dataStore[currentType];
        if(section.type === 'distribution') {
            section.tables = [{
                rows: [
                    { member: 'رئيس الدائرة', values: new Array(13).fill(0) },
                    { member: 'عضو اليمين', values: new Array(13).fill(0) },
                    { member: 'عضو اليسار', values: new Array(13).fill(0) },
                    { member: 'عضو رابع', values: new Array(13).fill(0) }
                   
                ]
            }];
        } else {
            section.rows = [];
        }
        saveData();
        renderTable();
    }
}

function resetAllData() {
    if (confirm("هل أنت متأكد من إزالة جميع الإحصائيات والبيانات لكافة الأقسام نهائياً؟")) {
        localStorage.removeItem('court_stats_data_v17');
        dataStore = JSON.parse(JSON.stringify(defaultData));
        currentType = 'جزئي';
        document.getElementById('menu-toggle').checked = false;
        updateDropdownDynamicMenu();
        renderTable();
    }
}

function toggleFooter() {
    const footer = document.getElementById('main-footer');
    if (footer) footer.classList.toggle('hidden');
}

function updateDropdownDynamicMenu() {
    const dropdownList = document.getElementById('dropdown-menu-list');
    if (!dropdownList) return;
    
    let htmlContent = '';
    const basicKeys = [
        { key: 'جزئي', label: 'المدني الجزئي', icon: '⚖️' },
        { key: 'حكومة', label: 'مدني الحكومة', icon: '🏛️' },
        { key: 'مستعجل', label: 'مدني مستعجل', icon: '⚡' },
        { key: 'تنفيذ', label: 'مدني تنفيذ', icon: '⚙️' },
        { key: 'توزيع_الأحكام', label: 'توزيع الأحكام', icon: '📊' }
    ];

    // إضافة الأقسام الأساسية (باستثناء توزيع الأحكام إذا أردت، أو تركها حسب رغبتك)
    basicKeys.forEach(item => {
        let isActive = (currentType === item.key) ? 'active' : '';
        htmlContent += `<li><button onclick="switchType('${item.key}')" class="dropdown-action-btn ${isActive}"><span>${item.label}</span> <span>${item.icon}</span></button></li>`;
    });

    // إضافة باقي التخصصات المخصصة من dataStore مع استبعاد "توزيع_الأحكام" و "الإحصاء_القضائي_النهائي"
    Object.keys(dataStore).forEach(key => {
        if (!['جزئي', 'حكومة', 'مستعجل', 'تنفيذ', 'توزيع_الأحكام', 'الإحصاء_القضائي_النهائي'].includes(key)) {
            let title = dataStore[key].title || key;
            let isActive = (currentType === key) ? 'active' : '';
            htmlContent += `<li><button onclick="switchType('${key}')" class="dropdown-action-btn ${isActive}"><span>${title}</span> <span>📁</span></button></li>`;
        }
    });

    // الخيارات الثابتة (إضافة تخصص، إزالة تخصص، الإحصاء القضائي النهائي، وإزالة جميع الإحصائيات)
    htmlContent += `
       <li><button onclick="addNewCustomPage()" class="dropdown-action-btn"><span>إضافة تخصص جديد</span> <span>➕</span></button></li>
       <li><button onclick="removeCurrentPage()" class="dropdown-action-btn"><span>إزالة التخصص الحالي</span> <span>🗑️</span></button></li>
       <li><button onclick="switchType('الإحصاء_القضائي_النهائي')" class="dropdown-action-btn ${(currentType === 'الإحصاء_القضائي_النهائي') ? 'active' : ''}"><span>الإحصاء القضائي النهائي</span> <span>📊</span></button></li>
       <li><button onclick="resetAllData()" class="reset-all-btn dropdown-action-btn" style="color: #ffcccc;"><span>إزالة جميع الإحصائيات</span> <span>❌</span></button></li>
    `;

    dropdownList.innerHTML = htmlContent;
}
function removeCurrentPage() {
    const basicTypes = ['جزئي', 'حكومة', 'مستعجل', 'تنفيذ'];
    if (basicTypes.includes(currentType)) {
        alert("لا يمكن حذف الأقسام الأساسية للنظام.");
        return;
    }
    if (confirm(`هل أنت متأكد من إزالة التخصص الحالي (${dataStore[currentType].title || currentType})؟`)) {
        delete dataStore[currentType];
        saveData();
        currentType = 'جزئي';
        document.getElementById('menu-toggle').checked = false;
        updateDropdownDynamicMenu();
        renderTable();
    }
}
// دالة العرض الرئيسية الشاملة للديسكتوب والموبايل
function renderTable() {
    let section = dataStore[currentType];
    let displayName = section ? (section.title || currentType) : currentType;
    document.getElementById('current-type-title').innerText = 'تفاصيل: ' + displayName;

    const desktopWrapper = document.querySelector('.table-container');
    const mobileContainer = document.getElementById('vertical-records-container');
    const cardBox = document.querySelector('.card');

    // التحقق هل القسم الحالي هو "توزيع الأحكام"
    if (section && section.type === 'distribution') {
        if (desktopWrapper) desktopWrapper.style.display = 'none';
        if (mobileContainer) mobileContainer.style.display = 'none';

        let existingDistView = document.getElementById('distribution-view-container');
        if (!existingDistView) {
            existingDistView = document.createElement('div');
            existingDistView.id = 'distribution-view-container';
            existingDistView.style.width = '100%';
            cardBox.appendChild(existingDistView);
        }
        existingDistView.style.display = 'block';

        renderDistributionViewContent(existingDistView);
        updateDropdownDynamicMenu();
        return;
    } else {
        if (desktopWrapper) desktopWrapper.style.display = 'block';
        if (mobileContainer) mobileContainer.style.display = 'block';
        let existingDistView = document.getElementById('distribution-view-container');
        if (existingDistView) existingDistView.style.display = 'none';
    }

    const desktopTbody = document.getElementById('desktop-table-body');
    if (desktopTbody) {
        desktopTbody.innerHTML = '';
        let rows = section.rows || [];

        rows.forEach((row, index) => {
            const desktopTr = document.createElement('tr');
            let rowHTML = `
                <td class="date-cell" style="position: relative;">
                <input type="text" placeholder="اختر التاريخ أو اكتبه" value="${row.date || ''}" oninput="handleRowInput(this, ${index}, 'date', null)" style="width:100%; padding:2px;" onfocus="this.type='date'" onblur="if(!this.value)this.type='text';">
                <button class="delete-row-btn" onclick="removeRow(${index})" title="حذف الصف" 
    style="position: absolute; right: -20px; top: 25%; border:none; border-radius:3px; width:22px; height:22px; cursor:pointer; font-size:12px; display:flex; align-items:center; justify-content:center; padding:0; z-index: 10;">
    ✕
                     </button>
                </td>
                <td><input type="text" inputmode="numeric" value="${toArabicNumbers(row.moajalParts[0])}" oninput="handleRowInput(this, ${index}, 'moajalParts', 0)"></td>
                <td><input type="text" inputmode="numeric" value="${toArabicNumbers(row.moajalParts[1])}" oninput="handleRowInput(this, ${index}, 'moajalParts', 1)"></td>
                <td><input type="text" inputmode="numeric" value="${toArabicNumbers(row.moajalParts[2])}" oninput="handleRowInput(this, ${index}, 'moajalParts', 2)"></td>
                <td><input type="text" inputmode="numeric" value="${toArabicNumbers(row.shatb)}" oninput="handleRowInput(this, ${index}, 'shatb', null)"></td>
                <td><input type="text" inputmode="numeric" value="${toArabicNumbers(row.mawdoui)}" oninput="handleRowInput(this, ${index}, 'mawdoui', null)"></td>
                <td><input type="text" inputmode="numeric" value="${toArabicNumbers(row.sh[0])}" oninput="handleRowSubInput(this, ${index}, 'sh', 0)"></td>
                <td><input type="text" inputmode="numeric" value="${toArabicNumbers(row.sh[1])}" oninput="handleRowSubInput(this, ${index}, 'sh', 1)"></td>
                <td><input type="text" inputmode="numeric" value="${toArabicNumbers(row.sh[2])}" oninput="handleRowSubInput(this, ${index}, 'sh', 2)"></td>
                <td><input type="text" inputmode="numeric" value="${toArabicNumbers(row.sh[3])}" oninput="handleRowSubInput(this, ${index}, 'sh', 3)"></td>
                <td><input type="text" inputmode="numeric" value="${toArabicNumbers(row.ith[0])}" oninput="handleRowSubInput(this, ${index}, 'ith', 0)"></td>
                <td><input type="text" inputmode="numeric" value="${toArabicNumbers(row.ith[1])}" oninput="handleRowSubInput(this, ${index}, 'ith', 1)"></td>
                <td><input type="text" inputmode="numeric" value="${toArabicNumbers(row.ith[2])}" oninput="handleRowSubInput(this, ${index}, 'ith', 2)"></td>
                <td><input type="text" inputmode="numeric" value="${toArabicNumbers(row.ith[3])}" oninput="handleRowSubInput(this, ${index}, 'ith', 3)"></td>
                <td><input type="text" inputmode="numeric" value="${toArabicNumbers(row.farai)}" oninput="handleRowInput(this, ${index}, 'farai', null)"></td>
                <td><input type="text" inputmode="numeric" value="${toArabicNumbers(row.solh)}" oninput="handleRowInput(this, ${index}, 'solh', null)"></td>
                <td><input type="text" inputmode="numeric" value="${toArabicNumbers(row.waqf)}" oninput="handleRowInput(this, ${index}, 'waqf', null)"></td>
            `;
            desktopTr.innerHTML = rowHTML;
            desktopTbody.appendChild(desktopTr);
        });
    }

    if (mobileContainer) {
        mobileContainer.innerHTML = '';
        let rows = section.rows || [];

        rows.forEach((row, index) => {
            let cardDiv = document.createElement('div');
            cardDiv.className = 'mobile-card';
            cardDiv.innerHTML = `
                <div class="mobile-card-header">
                    <span>صف رقم (${index + 1}) - ${row.date || ' '}</span>
                    <button onclick="removeRow(${index})" style="background:#dc3545; color:white; border:none; padding:2px 8px; border-radius:4px; cursor:pointer;">حذف</button>
                </div>
                <div class="mobile-card-grid">
                    <div class="mobile-card-item full-width">
                        <label>التاريخ:</label>
                        <input type="text" value="${row.date || ''}" placeholder="التاريخ" oninput="handleRowInput(this, ${index}, 'date', null)" style="width: 100% !important;">
                    </div>
                    <div class="mobile-card-item"><label>المؤجل:</label><input type="text" inputmode="numeric" value="${toArabicNumbers(row.moajalParts[0])}" oninput="handleRowInput(this, ${index}, 'moajalParts', 0)"></div>
                    <div class="mobile-card-item"><label>القديم:</label><input type="text" inputmode="numeric" value="${toArabicNumbers(row.moajalParts[1])}" oninput="handleRowInput(this, ${index}, 'moajalParts', 1)"></div>
                    <div class="mobile-card-item"><label>المحجوز:</label><input type="text" inputmode="numeric" value="${toArabicNumbers(row.moajalParts[2])}" oninput="handleRowInput(this, ${index}, 'moajalParts', 2)"></div>
                    <div class="mobile-card-item"><label>الشطب:</label><input type="text" inputmode="numeric" value="${toArabicNumbers(row.shatb)}" oninput="handleRowInput(this, ${index}, 'shatb', null)"></div>
                    <div class="mobile-card-item"><label>موضوعي:</label><input type="text" inputmode="numeric" value="${toArabicNumbers(row.mawdoui)}" oninput="handleRowInput(this, ${index}, 'mawdoui', null)"></div>
                    <div class="mobile-card-item"><label>اختصاص:</label><input type="text" inputmode="numeric" value="${toArabicNumbers(row.sh[0])}" oninput="handleRowSubInput(this, ${index}, 'sh', 0)"></div>
                    <div class="mobile-card-item"><label>عدم قبول:</label><input type="text" inputmode="numeric" value="${toArabicNumbers(row.sh[1])}" oninput="handleRowSubInput(this, ${index}, 'sh', 1)"></div>
                    <div class="mobile-card-item"><label>عدم جواز:</label><input type="text" inputmode="numeric" value="${toArabicNumbers(row.sh[2])}" oninput="handleRowSubInput(this, ${index}, 'sh', 2)"></div>
                    <div class="mobile-card-item"><label>اعتبار:</label><input type="text" inputmode="numeric" value="${toArabicNumbers(row.sh[3])}" oninput="handleRowSubInput(this, ${index}, 'sh', 3)"></div>
                    <div class="mobile-card-item"><label>خبير:</label><input type="text" inputmode="numeric" value="${toArabicNumbers(row.ith[0])}" oninput="handleRowSubInput(this, ${index}, 'ith', 0)"></div>
                    <div class="mobile-card-item"><label>تحقيق:</label><input type="text" inputmode="numeric" value="${toArabicNumbers(row.ith[1])}" oninput="handleRowSubInput(this, ${index}, 'ith', 1)"></div>
                    <div class="mobile-card-item"><label>استجواب:</label><input type="text" inputmode="numeric" value="${toArabicNumbers(row.ith[2])}" oninput="handleRowSubInput(this, ${index}, 'ith', 2)"></div>
                    <div class="mobile-card-item"><label>يمين:</label><input type="text" inputmode="numeric" value="${toArabicNumbers(row.ith[3])}" oninput="handleRowSubInput(this, ${index}, 'ith', 3)"></div>
                    <div class="mobile-card-item"><label>فرعي:</label><input type="text" inputmode="numeric" value="${toArabicNumbers(row.farai)}" oninput="handleRowInput(this, ${index}, 'farai', null)"></div>
                    <div class="mobile-card-item"><label>صلح:</label><input type="text" inputmode="numeric" value="${toArabicNumbers(row.solh)}" oninput="handleRowInput(this, ${index}, 'solh', null)"></div>
                    <div class="mobile-card-item"><label>وقف جزاء:</label><input type="text" inputmode="numeric" value="${toArabicNumbers(row.waqf)}" oninput="handleRowInput(this, ${index}, 'waqf', null)" style="width: 100% !important;"></div>
                </div>
            `;
            mobileContainer.appendChild(cardDiv);
        });
    }

    recalculateAll();
}

function handleRowInput(inputElem, index, field, subIdx) {
    let row = dataStore[currentType].rows[index];
    if (subIdx !== null) {
        let val = parseInt(toEnglishNumbers(inputElem.value), 10) || 0;
        row[field][subIdx] = val;
    } else if (field === 'date') {
        row.date = inputElem.value;
    } else {
        let val = parseInt(toEnglishNumbers(inputElem.value), 10) || 0;
        row[field] = val;
    }
    saveData();
    recalculateAll();
}

function handleRowSubInput(inputElem, index, field, subIdx) {
    let val = parseInt(toEnglishNumbers(inputElem.value), 10) || 0;
    dataStore[currentType].rows[index][field][subIdx] = val;
    saveData();
    recalculateAll();
}

// دوال تخصيص وإدارة قسم "توزيع الأحكام"
function addNewDistributionTable() {
    let section = dataStore[currentType];
    if (!section.tables) section.tables = [];
    
    section.tables.push({
        rows: [
            { member: 'رئيس الدائرة', values: new Array(13).fill(0) },
            { member: 'عضو اليمين', values: new Array(13).fill(0) },
            { member: 'عضو اليسار', values: new Array(13).fill(0) },
            { member: 'عضو رابع', values: new Array(13).fill(0) }
          
        ]
    });
    saveData();
    renderTable();
}

function removeDistributionTable(tableIndex) {
    let section = dataStore[currentType];
    if (section.tables.length > 1) {
        section.tables.splice(tableIndex, 1);
        saveData();
        renderTable();
    } else {
        alert("يجب أن يبقى جدول واحد على الأقل!");
    }
}

function handleDistributionInput(inputElem, tableIdx, rowIdx, colIdx) {
    let val = parseInt(toEnglishNumbers(inputElem.value), 10) || 0;
    dataStore[currentType].tables[tableIdx].rows[rowIdx].values[colIdx] = val;
    saveData();
    recalculateDistributionTotals();
}

function renderDistributionViewContent(container) {
    let section = dataStore[currentType];
    let colNames = [
        'محرر الأسباب', 'موضوعي', 'اختصاص', 'عدم قبول', 'عدم جواز', 
        'اعتبار', 'وقف تعليقي', 'خبير', 'تحقيق', 'استجواب', 
        'يمين', 'فرعي', 'صلح', 'أخري'
    ];

    let html = `
        <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <button onclick="addNewDistributionTable()" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">➕ إضافة جدول جديد</button>
        </div>
        <div style="width: 100%; display: flex; flex-direction: column; gap: 20px;">
    `;

    section.tables.forEach((tbl, tIdx) => {
        html += `
            <div style="background: #ffffff; border: 2px solid #007bff; border-radius: 8px; padding: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">
                    <span style="font-weight: bold; color: #0056b3; font-size: 16px;">جدول توزيع الأحكام رقم (${tIdx + 1})</span>
                    <button onclick="removeDistributionTable(${tIdx})" style="background: #dc3545; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">حذف الجدول ×</button>
                </div>
                
                <!-- عرض الجدول للديسكتوب -->
                <div class="table-container desktop-only-view" style="overflow-x: auto;">
                    <table class="desktop-table" style="width: 100%;">
                        <thead>
                            <tr>
                                ${colNames.map(c => `<th>${c}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
        `;

        tbl.rows.forEach((r, rIdx) => {
            html += `<tr>`;
            html += `<td style="background: #e6f0ff; font-weight: bold; color: #0056b3;">${r.member}</td>`;
            for (let cIdx = 0; cIdx < 13; cIdx++) {
                let val = toArabicNumbers(r.values[cIdx]);
                html += `<td><input type="text" inputmode="numeric" value="${val}" oninput="handleDistributionInput(this, ${tIdx}, ${rIdx}, ${cIdx})"></td>`;
            }
            html += `</tr>`;
        });

        html += `</tbody></table></div>`;

        // عرض بطاقات الأعضاء للموبايل بنفس تصميم الصفحات الأخرى
        html += `<div class="mobile-only-view" style="display: none; flex-direction: column; gap: 12px;">`;
        tbl.rows.forEach((r, rIdx) => {
            html += `
                <div class="mobile-card" style="background: #f8f9fa; border: 1px solid #b0c4de; border-radius: 8px; padding: 10px;">
                    <div class="mobile-card-header" style="background: #e6f0ff; color: #0056b3; font-weight: bold; padding: 6px 10px; border-radius: 6px; margin-bottom: 8px; text-align: center;">
                        ${r.member}
                    </div>
                    <div class="mobile-card-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
            `;
            for (let cIdx = 0; cIdx < 13; cIdx++) {
                let val = toArabicNumbers(r.values[cIdx]);
                html += `
                    <div class="mobile-card-item" style="display: flex; flex-direction: column; gap: 2px;">
                        <label style="font-size: 11px; color: #333; font-weight: bold;">${colNames[cIdx + 1]}:</label>
                        <input type="text" inputmode="numeric" value="${val}" oninput="handleDistributionInput(this, ${tIdx}, ${rIdx}, ${cIdx})" style="width: 100% !important; text-align: center;">
                    </div>
                `;
            }
            html += `</div></div>`;
        });
        html += `</div></div>`;
    });

    

    container.innerHTML = html;
    recalculateDistributionTotals();
}

function recalculateDistributionTotals() {
    let section = dataStore['توزيع_الأحكام'];
    if (!section || section.type !== 'distribution') return;
    
    let memberTotals = {
        'رئيس الدائرة': new Array(13).fill(0),
        'عضو اليمين': new Array(13).fill(0),
        'عضو اليسار': new Array(13).fill(0),
        'عضو رابع': new Array(13).fill(0)
    };

    // مصفوفة لحفظ إجمالي الأعمدة بالكامل (لكل الأعضاء عبر كل الجداول)
    let grandTotals = new Array(13).fill(0);

    section.tables.forEach(tbl => {
        tbl.rows.forEach(r => {
            if (memberTotals[r.member]) {
                for (let i = 0; i < 13; i++) {
                    let val = (r.values[i] || 0);
                    memberTotals[r.member][i] += val;
                    grandTotals[i] += val; // جمع القيم للإجمالي الشامل
                }
            }
        });
    });

    let tbody = document.getElementById('distribution-summary-body');
    if (!tbody) return;

    let summaryHtml = '';
    
    // 1. طباعة صفوف الأعضاء
    Object.keys(memberTotals).forEach(memberName => {
        summaryHtml += `<tr>`;
        summaryHtml += `<td style="background: #0056b3; color: white; font-weight: bold;">${memberName}</td>`;
        memberTotals[memberName].forEach(sumVal => {
            summaryHtml += `<td style="background: #ffffff; font-weight: bold;">${toArabicNumbers(sumVal)}</td>`;
        });
        summaryHtml += `</tr>`;
    });

    // 2. طباعة صف الإجمالي الشامل في نهاية الجدول
    summaryHtml += `<tr style="background-color: #d1ecf1; border-top: 2px solid #0056b3;">`;
    summaryHtml += `<td style="background: #17a2b8; color: white; font-weight: bold; text-align: center;">الإجمالي العام</td>`;
    grandTotals.forEach(totalVal => {
        summaryHtml += `<td style="font-weight: bold; color: #004085;">${toArabicNumbers(totalVal)}</td>`;
    });
    summaryHtml += `</tr>`;

    tbody.innerHTML = summaryHtml;
}

function recalculateAll() {
    let totMoajal = 0, totShatb = 0, totMawdoui = 0, totShakli = 0, totIthbat = 0, totFarai = 0, totSolh = 0, totWaqf = 0;

    let rows = dataStore[currentType].rows || [];
    rows.forEach(r => {
        totMoajal += (r.moajalParts[0] + r.moajalParts[1] + r.moajalParts[2]);
        totShatb += r.shatb;
        totMawdoui += r.mawdoui;
        totShakli += r.sh.reduce((a, b) => a + b, 0);
        totIthbat += r.ith.reduce((a, b) => a + b, 0);
        totFarai += r.farai;
        totSolh += r.solh;
        totWaqf += r.waqf;
    });

    let totalMoqadam = totMoajal + totShatb + totMawdoui + totShakli + totIthbat + totFarai + totSolh + totWaqf;

    if(document.getElementById('tot-moajal')) document.getElementById('tot-moajal').innerText = toArabicNumbers(totMoajal);
    if(document.getElementById('tot-shatb')) document.getElementById('tot-shatb').innerText = toArabicNumbers(totShatb);
    if(document.getElementById('tot-mawdoui')) document.getElementById('tot-mawdoui').innerText = toArabicNumbers(totMawdoui);
    if(document.getElementById('tot-shakli')) document.getElementById('tot-shakli').innerText = toArabicNumbers(totShakli);
    if(document.getElementById('tot-ithbat')) document.getElementById('tot-ithbat').innerText = toArabicNumbers(totIthbat);
    if(document.getElementById('tot-farai')) document.getElementById('tot-farai').innerText = toArabicNumbers(totFarai);
    if(document.getElementById('tot-solh')) document.getElementById('tot-solh').innerText = toArabicNumbers(totSolh);
    if(document.getElementById('tot-waqf')) document.getElementById('tot-waqf').innerText = toArabicNumbers(totWaqf);
    if(document.getElementById('tot-moqadam')) document.getElementById('tot-moqadam').innerText = toArabicNumbers(totalMoqadam);

    if(document.getElementById('d-tot-moajal')) document.getElementById('d-tot-moajal').innerText = toArabicNumbers(totMoajal);
    if(document.getElementById('d-tot-shatb')) document.getElementById('d-tot-shatb').innerText = toArabicNumbers(totShatb);
    if(document.getElementById('d-tot-mawdoui')) document.getElementById('d-tot-mawdoui').innerText = toArabicNumbers(totMawdoui);
    if(document.getElementById('d-tot-shakli')) document.getElementById('d-tot-shakli').innerText = toArabicNumbers(totShakli);
    if(document.getElementById('d-tot-ithbat')) document.getElementById('d-tot-ithbat').innerText = toArabicNumbers(totIthbat);
    if(document.getElementById('d-tot-farai')) document.getElementById('d-tot-farai').innerText = toArabicNumbers(totFarai);
    if(document.getElementById('d-tot-solh')) document.getElementById('d-tot-solh').innerText = toArabicNumbers(totSolh);
    if(document.getElementById('d-tot-waqf')) document.getElementById('d-tot-waqf').innerText = toArabicNumbers(totWaqf);
    if(document.getElementById('d-tot-moqadam')) document.getElementById('d-tot-moqadam').innerText = 'مقدم: ' + toArabicNumbers(totalMoqadam);

    let globalMoqadam = 0, globalMoajal = 0, globalShatb = 0, globalMahkoum = 0, globalMawdoui = 0, globalShakli = 0, globalIthbat = 0, globalFarai = 0, globalSolh = 0, globalWaqf = 0;

    Object.keys(dataStore).forEach(k => {
        let sec = dataStore[k];
        if(sec.type === 'standard') {
            let sRows = sec.rows || [];
            sRows.forEach(r => {
                let mParts = (r.moajalParts[0] + r.moajalParts[1] + r.moajalParts[2]);
                let sTotal = r.sh.reduce((a, b) => a + b, 0);
                let iTotal = r.ith.reduce((a, b) => a + b, 0);
                
                let qatai = r.mawdoui + sTotal;
                let mahkoum = qatai + iTotal + r.farai + r.solh + r.waqf;
                let moqadam = mParts + r.shatb + mahkoum;

                globalMoqadam += moqadam;
                globalMoajal += mParts;
                globalShatb += r.shatb;
                globalMahkoum += mahkoum;
                globalMawdoui += r.mawdoui;
                globalShakli += sTotal;
                globalIthbat += iTotal;
                globalFarai += r.farai;
                globalSolh += r.solh;
                globalWaqf += r.waqf;
            });
        }
    });

    if(document.getElementById('f-moqadam')) document.getElementById('f-moqadam').innerText = toArabicNumbers(globalMoqadam);
    if(document.getElementById('f-moajal')) document.getElementById('f-moajal').innerText = toArabicNumbers(globalMoajal);
    if(document.getElementById('f-shatb')) document.getElementById('f-shatb').innerText = toArabicNumbers(globalShatb);
    if(document.getElementById('f-mahkoum')) document.getElementById('f-mahkoum').innerText = toArabicNumbers(globalMahkoum);
    if(document.getElementById('f-mawdoui')) document.getElementById('f-mawdoui').innerText = toArabicNumbers(globalMawdoui);
    if(document.getElementById('f-shakli')) document.getElementById('f-shakli').innerText = toArabicNumbers(globalShakli);
    if(document.getElementById('f-ithbat')) document.getElementById('f-ithbat').innerText = toArabicNumbers(globalIthbat);
    if(document.getElementById('f-farai')) document.getElementById('f-farai').innerText = toArabicNumbers(globalFarai);
    if(document.getElementById('f-solh')) document.getElementById('f-solh').innerText = toArabicNumbers(globalSolh);
    if(document.getElementById('f-waqf')) document.getElementById('f-waqf').innerText = toArabicNumbers(globalWaqf);
    if(document.getElementById('f-qatai-sub')) document.getElementById('f-qatai-sub').innerText = toArabicNumbers(globalMawdoui + globalShakli);
}
// الهيكل الافتراضي للبيانات ليشمل الأقسام العادية وقسم "توزيع الأحكام"
const defaultData = {
    'جزئي': { title: 'المدني الجزئي', rows: [], type: 'standard' },
    'حكومة': { title: 'مدني الحكومة', rows: [], type: 'standard' },
    'مستعجل': { title: 'مدني مستعجل', rows: [], type: 'standard' },
    'تنفيذ': { title: 'مدني تنفيذ', rows: [], type: 'standard' },
    'توزيع_الأحكام': { 
        title: 'توزيع الأحكام', 
        type: 'distribution',
        tables: [
            {
                rows: [
                    { member: 'رئيس الدائرة', values: new Array(13).fill(0) },
                    { member: 'عضو اليمين', values: new Array(13).fill(0) },
                    { member: 'عضو اليسار', values: new Array(13).fill(0) },
                    { member: 'عضو رابع', values: new Array(13).fill(0) }
                  
                ]
            }
        ]
    }
};

let dataStore = JSON.parse(localStorage.getItem('court_stats_data_v17')) || defaultData;
let currentType = localStorage.getItem('lastSelectedType') || 'جزئي';

// 3. [هام جداً]: تنفيذ العرض وبدء التشغيل فور تحميل المستند لمنع اختفاء الجداول عند الريفريش
document.addEventListener('DOMContentLoaded', () => {
    // استدعاء دالة التبديل أو العرض بناءً على آخر صفحة تم حفظها
    if (typeof switchType === 'function') {
        switchType(currentType);
    }
});
// ميزة تفريغ الخلية عند النقر وإعادة الصفر عند الخروج إذا تركت فارغة
document.addEventListener('focus', function(e) {
    if (e.target && e.target.tagName === 'INPUT' && e.target.type === 'text') {
        let cleanVal = toEnglishNumbers(e.target.value);
        if (cleanVal === '0' || e.target.value === '٠' || e.target.value === '0') {
            e.target.value = '';
        }
    }
}, true);

document.addEventListener('blur', function(e) {
    if (e.target && e.target.tagName === 'INPUT' && e.target.type === 'text') {
        if (e.target.value.trim() === '') {
            e.target.value = toArabicNumbers(0);
            let event = new Event('input', { bubbles: true });
            e.target.dispatchEvent(event);
        }
    }
}, true);

function exportToExcel() {
    const table = document.querySelector('.desktop-table');
    if (!table) {
        alert("لا يوجد جدول متاح للتصدير!");
        return;
    }

    let htmlContent = `
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="utf-8">
            <style>
                table { border-collapse: collapse; width: 100%; direction: rtl; }
                th, td { border: 1px solid #b0c4de; padding: 6px; text-align: center; font-family: 'Segoe UI', Tahoma, sans-serif; }
                th { background-color: #0056b3; color: #ffffff; }
            </style>
        </head>
        <body>
            <h2 style="text-align: center; color: #0056b3;">إحصاءات القضايا</h2>
            ${table.outerHTML}
        </body>
        </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], {
        type: 'application/vnd.ms-excel;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Court_Statistics_${currentType}_${new Date().toISOString().slice(0,10)}.xls`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function exportToWord() {
    alert("ميزة التصدير لملف Word جاهزة للاستخدام.");
}
function renderFinalReportViewContent(container) {
    let colNamesDistribution = [
        'محرر الأسباب', 'موضوعي', 'شكلي', 'اختصاص', 'عدم قبول', 'عدم جواز', 
        'اعتبار', 'وقف تعليقي', 'إثبات', 'خبير', 'تحقيق', 'استجواب', 
        'يمين', 'فرعي', 'صلح', 'أخرى'
    ];

    let html = `
        <div style="width: 100%; display: flex; flex-direction: column; gap: 25px;">
            
            <!-- 1. جدول الإجمالي العام لجميع التخصصات -->
            <div style="background: #ffffff; border: none solid #0056b3; border-radius: 8px; padding: 1px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <h3 style="color: #0056b3; margin-bottom: 12px; font-size: 16px; text-align: center;">📊جدول الإجمالي العام الشامل</h3>
                <div style="overflow-x: auto;">
                    <table class="desktop-table" style="width: 100%;">
                        <thead>
                            <tr>
                                <th rowspan="2">القسم / التخصص</th>
                                <th rowspan="2">المقدم</th>
                                <th rowspan="2">المؤجل</th>
                                <th rowspan="2">الشطب</th>
                                <th rowspan="2">المحكوم فيه</th>
                                <th colspan="2">قطعي</th>
                                <th rowspan="2">إثبات</th>
                                <th rowspan="2">فرعي</th>
                                <th rowspan="2">صلح</th>
                                <th rowspan="2">وقف جزاء</th>
                            </tr>
                            <tr>
                                <th>موضوعي</th>
                               -<th>شكلي</th>
                            </tr>
                        </thead>
                        <tbody id="final-standard-summary-body">
                            <!-- سيتم تعبئتها برمجياً -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 2. جدول التجميع الشامل للأعضاء (بالتقسيم الجديد المطلوب) -->
            <div style="background: #ffffff; border: none solid #0056b3; border-radius: 8px; padding: 1px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <h3 style="color: #0056b3; margin-bottom: 12px; font-size: 16px; text-align: center;">👥 جدول التجميع الشامل للأعضاء (التقسيم النهائي)</h3>
                <div style="overflow-x: auto;">
                    <table class="desktop-table" style="width: 100%;">
                        <thead>
                            <tr>
                                <th rowspan="2">محرر الأسباب</th>
                                <th rowspan="2">موضوعي</th>
                                <th colspan="5">شكلي</th>
                                <th colspan="4">إثبات</th>
                                <th rowspan="2">فرعي</th>
                                <th rowspan="2">صلح</th>
                                <th rowspan="2">أخرى</th>
                            </tr>
                            <tr>
                                <th>اختصاص</th>
                                <th>عدم قبول</th>
                                <th>عدم جواز</th>
                                <th>اعتبار</th>
                                <th>وقف تعليقي</th>
                                <th>خبير</th>
                                <th>تحقيق</th>
                                <th>استجواب</th>
                                <th>يمين</th>
                            </tr>
                        </thead>
                        <tbody id="final-distribution-summary-body">
                            <!-- سيتم تعبئتها برمجياً -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 3. جدول بيان الجلسات المستقل لكل صف/نوع -->
            <div style="background: #ffffff; border: 2px solid #0056b3; border-radius: 8px; padding: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <h3 style="color: #0056b3; margin-bottom: 12px; font-size: 16px; text-align: center;">📅عدد الجلسات</h3>
                <div style="overflow-x: auto;">
                    <table class="desktop-table" style="width: 100%;">
                        <thead>
                            <tr>
                                <th>اسم القسم / التخصص</th>
                                <th>عدد الجلسات (التواريخ الفريدة غير المكررة)</th>
                            </tr>
                        </thead>
                        <tbody id="final-sessions-summary-body">
                            <!-- سيتم تعبئتها برمجياً -->
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    `;

    container.innerHTML = html;
    calculateFinalReportData();
}
function calculateFinalReportData() {
    // 1. تعبئة جدول الإجمالي العام للصفوف العادية
    let standardTbody = document.getElementById('final-standard-summary-body');
    if (standardTbody) {
        let htmlStd = '';
        Object.keys(dataStore).forEach(key => {
            // [هام جداً]: تخطي صفحة الإحصاء النهائي وأي مفتاح غير معتاد لمنع خطأ rows
            if (key === 'الإحصاء_القضائي_النهائي' || key === 'توزيع_الأحكام') return;
            let sec = dataStore[key];
            if (!sec || !sec.rows) return; // حماية إضافية ضد أي كائن غير محدد
            if (sec.type === 'standard') {
                let sRows = sec.rows || [];
                let tMoq = 0, tMoaj = 0, tShatb = 0, tMahk = 0, tMawd = 0, tShak = 0, tIthb = 0, tFar = 0, tSolh = 0, tWaqf = 0;
                
                sRows.forEach(r => {
                    let mParts = (r.moajalParts[0] + r.moajalParts[1] + r.moajalParts[2]);
                    let sTotal = r.sh.reduce((a, b) => a + b, 0);
                    let iTotal = r.ith.reduce((a, b) => a + b, 0);
                    let qatai = r.mawdoui + sTotal;
                    let mahkoum = qatai + iTotal + r.farai + r.solh + r.waqf;
                    let moqadam = mParts + r.shatb + mahkoum;

                    tMoq += moqadam;
                    tMoaj += mParts;
                    tShatb += r.shatb;
                    tMahk += mahkoum;
                    tMawd += r.mawdoui;
                    tShak += sTotal;
                    tIthb += iTotal;
                    tFar += r.farai;
                    tSolh += r.solh;
                    tWaqf += r.waqf;
                });

                htmlStd += `<tr>
                    <td style="background: #e6f0ff; font-weight: bold; color: #0056b3;">${sec.title || key}</td>
                    <td>${toArabicNumbers(tMoq)}</td>
                    <td>${toArabicNumbers(tMoaj)}</td>
                    <td>${toArabicNumbers(tShatb)}</td>
                    <td>${toArabicNumbers(tMahk)}</td>
                    <td>${toArabicNumbers(tMawd)}</td>
                    <td>${toArabicNumbers(tShak)}</td>
                    <td>${toArabicNumbers(tIthb)}</td>
                    <td>${toArabicNumbers(tFar)}</td>
                    <td>${toArabicNumbers(tSolh)}</td>
                    <td>${toArabicNumbers(tWaqf)}</td>
                </tr>`;
            }
        });
        standardTbody.innerHTML = htmlStd || `<tr><td colspan="11" style="text-align:center;">لا توجد بيانات متاحة</td></tr>`;
    }

    // 2. تجميع وتعبئة جدول التجميع الشامل للأعضاء (بالتقسيم الجديد)
    let distSection = dataStore['توزيع_الأحكام'];
    let distTbody = document.getElementById('final-distribution-summary-body');
    if (distTbody && distSection && distSection.tables) {
        let memberTotals = {
            'رئيس الدائرة': new Array(13).fill(0),
            'عضو اليمين': new Array(13).fill(0),
            'عضو اليسار': new Array(13).fill(0),
            'عضو رابع': new Array(13).fill(0)
        };
        let grandTotals = new Array(13).fill(0);

        distSection.tables.forEach(tbl => {
            tbl.rows.forEach(r => {
                if (memberTotals[r.member]) {
                    for (let i = 0; i < 13; i++) {
                        let val = (r.values[i] || 0);
                        memberTotals[r.member][i] += val;
                        grandTotals[i] += val;
                    }
                }
            });
        });

        let htmlDist = '';
        Object.keys(memberTotals).forEach(memberName => {
            let vals = memberTotals[memberName];
            htmlDist += `<tr>
                <td style="background: #0056b3; color: white; font-weight: bold;">${memberName}</td>
                <td>${toArabicNumbers(vals[0])}</td> <!-- موضوعي -->
                <td>${toArabicNumbers(vals[1])}</td> <!-- اختصاص -->
                <td>${toArabicNumbers(vals[2])}</td> <!-- عدم قبول -->
                <td>${toArabicNumbers(vals[3])}</td> <!-- عدم جواز -->
                <td>${toArabicNumbers(vals[4])}</td> <!-- اعتبار -->
                <td>${toArabicNumbers(vals[5])}</td> <!-- وقف تعليقي -->
                <td>${toArabicNumbers(vals[6])}</td> <!-- خبير -->
                <td>${toArabicNumbers(vals[7])}</td> <!-- تحقيق -->
                <td>${toArabicNumbers(vals[8])}</td> <!-- استجواب -->
                <td>${toArabicNumbers(vals[9])}</td> <!-- يمين -->
                <td>${toArabicNumbers(vals[10])}</td> <!-- فرعي -->
                <td>${toArabicNumbers(vals[11])}</td> <!-- صلح -->
                <td>${toArabicNumbers(vals[12])}</td> <!-- أخرى -->
            </tr>`;
        });

        // صف التجميع العام في نهاية جدول الأعضاء
        htmlDist += `<tr style="background-color: #d1ecf1; border-top: 2px solid #0056b3;">
            <td style="background: #17a2b8; color: white; font-weight: bold; text-align: center;">التجميع الشامل</td>`;
        grandTotals.forEach(val => {
            htmlDist += `<td style="font-weight: bold; color: #004085;">${toArabicNumbers(val)}</td>`;
        });
        htmlDist += `</tr>`;

        distTbody.innerHTML = htmlDist;
    }

    // 3. جدول بيان الجلسات (حساب التواريخ الفريدة لكل صف بمعزل عن غيره)
    let sessionsTbody = document.getElementById('final-sessions-summary-body');
    if (sessionsTbody) {
        let htmlSessions = '';
        Object.keys(dataStore).forEach(key => {
            let sec = dataStore[key];
            // نفترض أن الصفوف تحتوي على حقل تاريخ الجلسة باسم sessionDate أو date (حسب هيكل بياناتك)
            let rows = sec.rows || [];
            let uniqueDates = new Set();
            
            rows.forEach(r => {
                // استبدل r.sessionDate بالمسمى الفعلي لحقل التاريخ لديك إن وجد
                let d = r.sessionDate || r.date; 
                if (d) uniqueDates.add(d);
            });

            // إذا لم يكن حقل التاريخ معتمداً بهذا الاسم، يمكننا حساب عدد الصفوف الفريدة كبديل آمن أو الاعتماد على التواريخ
            let sessionCount = uniqueDates.size > 0 ? uniqueDates.size : rows.length;

            htmlSessions += `<tr>
                <td style="background: #e6f0ff; font-weight: bold; color: #0056b3;">${sec.title || key}</td>
                <td style="font-weight: bold; text-align: center;">${toArabicNumbers(sessionCount)} جلسة</td>
            </tr>`;
        });
        sessionsTbody.innerHTML = htmlSessions;
    }
}
updateDropdownDynamicMenu();
renderTable();
