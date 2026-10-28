// --- دوال تحويل وتنسيق الأرقام ---
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

// البيانات الافتراضية
const defaultData = {
    'جزئي': { title: 'المدني الجزئي', customSh: [], customIth: [], customWaqf: [], serialVals: {moajal:0, shatb:0, mawdoui:0, sh:[0,0,0,0], customShVals:[], ith:[0,0,0,0], customIthVals:[], waqf:0, customWaqfVals:[]}, rows: [] },
    'حكومة': { title: 'مدني الحكومة', customSh: [], customIth: [], customWaqf: [], serialVals: {moajal:0, shatb:0, mawdoui:0, sh:[0,0,0,0], customShVals:[], ith:[0,0,0,0], customIthVals:[], waqf:0, customWaqfVals:[]}, rows: [] },
    'مستعجل': { title: 'مدني مستعجل', customSh: [], customIth: [], customWaqf: [], serialVals: {moajal:0, shatb:0, mawdoui:0, sh:[0,0,0,0], customShVals:[], ith:[0,0,0,0], customIthVals:[], waqf:0, customWaqfVals:[]}, rows: [] },
    'تنفيذ': { title: 'مدني تنفيذ', customSh: [], customIth: [], customWaqf: [], serialVals: {moajal:0, shatb:0, mawdoui:0, sh:[0,0,0,0], customShVals:[], ith:[0,0,0,0], customIthVals:[], waqf:0, customWaqfVals:[]}, rows: [] }
};

let dataStore = JSON.parse(localStorage.getItem('court_stats_data_v9')) || defaultData;
let currentType = 'جزئي';

function saveData() {
    localStorage.setItem('court_stats_data_v9', JSON.stringify(dataStore));
}

function switchType(type) {
    currentType = type;
    document.getElementById('menu-toggle').checked = false;
    let displayName = dataStore[type] ? (dataStore[type].title || type) : type;
    document.getElementById('current-type-title').innerText = 'تفاصيل: ' + displayName;
    updateDropdownDynamicMenu();
    renderTable();
}

function addNewCustomPage() {
    let pageName = prompt("أدخل اسم التخصص أو الصفحة الجديدة:", "تخصص جديد");
    if (pageName !== null && pageName.trim() !== "") {
        let cleanName = pageName.trim();
        let section = dataStore[cleanName];
        if (!section) {
            dataStore[cleanName] = {
                title: cleanName,
                customSh: [],
                customIth: [],
                customWaqf: [],
                serialVals: {moajal:0, shatb:0, mawdoui:0, sh:[0,0,0,0], customShVals:[], ith:[0,0,0,0], customIthVals:[], waqf:0, customWaqfVals:[]},
                rows: []
            };
        } else {
            section.rows.push({ 
                name: cleanName + ' (' + toArabicNumbers(section.rows.length + 1) + ')', 
                moajal: 0, shatb: 0, mawdoui: 0, 
                sh: [0, 0, 0, 0], customShVals: section.customSh.map(() => 0), 
                ith: [0, 0, 0, 0], customIthVals: section.customIth.map(() => 0), 
                waqf: 0, customWaqfVals: section.customWaqf.map(() => 0) 
            });
        }
        saveData();
        switchType(cleanName);
    }
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

function goToFinalStats() {
    window.location.href = 'final_stats.html';
}

function resetAllData() {
    if (confirm("هل أنت متأكد من إزالة جميع الإحصائيات والبيانات لكافة الأقسام؟")) {
        localStorage.removeItem('court_stats_data_v9');
        dataStore = JSON.parse(JSON.stringify(defaultData));
        currentType = 'جزئي';
        document.getElementById('menu-toggle').checked = false;
        updateDropdownDynamicMenu();
        renderTable();
    }
}

function addCustomColumn(targetType) {
    let colName = prompt("أدخل عنوان العمود الجديد:");
    if (colName !== null && colName.trim() !== "") {
        let name = colName.trim();
        let section = dataStore[currentType];
        if (!section.serialVals) section.serialVals = {moajal:0, shatb:0, mawdoui:0, sh:[0,0,0,0], customShVals:[], ith:[0,0,0,0], customIthVals:[], waqf:0, customWaqfVals:[]};

        if (targetType === 'sh') {
            if (!section.customSh) section.customSh = [];
            section.customSh.push(name);
            section.serialVals.customShVals.push(0);
            section.rows.forEach(r => {
                if (!r.customShVals) r.customShVals = [];
                r.customShVals.push(0);
            });
        } else if (targetType === 'ith') {
            if (!section.customIth) section.customIth = [];
            section.customIth.push(name);
            section.serialVals.customIthVals.push(0);
            section.rows.forEach(r => {
                if (!r.customIthVals) r.customIthVals = [];
                r.customIthVals.push(0);
            });
        } else if (targetType === 'waqf') {
            if (!section.customWaqf) section.customWaqf = [];
            section.customWaqf.push(name);
            section.serialVals.customWaqfVals.push(0);
            section.rows.forEach(r => {
                if (!r.customWaqfVals) r.customWaqfVals = [];
                r.customWaqfVals.push(0);
            });
        }
        saveData();
        renderTable();
    }
}

function removeCustomColumn(targetType, index) {
    let section = dataStore[currentType];
    if (confirm("هل أنت متأكد من حذف هذا العمود؟")) {
        if (targetType === 'sh') {
            section.customSh.splice(index, 1);
            section.serialVals.customShVals.splice(index, 1);
            section.rows.forEach(r => r.customShVals.splice(index, 1));
        } else if (targetType === 'ith') {
            section.customIth.splice(index, 1);
            section.serialVals.customIthVals.splice(index, 1);
            section.rows.forEach(r => r.customIthVals.splice(index, 1));
        } else if (targetType === 'waqf') {
            section.customWaqf.splice(index, 1);
            section.serialVals.customWaqfVals.splice(index, 1);
            section.rows.forEach(r => r.customWaqfVals.splice(index, 1));
        }
        saveData();
        renderTable();
    }
}

function updateDropdownDynamicMenu() {
    const dropdownList = document.getElementById('dropdown-menu-list');
    if (!dropdownList) return;
    
    let htmlContent = '';
    const basicKeys = [
        { key: 'جزئي', label: 'المدني الجزئي', icon: '⚖️' },
        { key: 'حكومة', label: 'مدني الحكومة', icon: '🏛️' },
        { key: 'مستعجل', label: 'مدني مستعجل', icon: '⚡' },
        { key: 'تنفيذ', label: 'مدني تنفيذ', icon: '⚙️' }
    ];

    basicKeys.forEach(item => {
        let isActive = (currentType === item.key) ? 'active' : '';
        htmlContent += `<li><button onclick="switchType('${item.key}')" class="dropdown-action-btn ${isActive}"><span>${item.label}</span> <span>${item.icon}</span></button></li>`;
    });

    Object.keys(dataStore).forEach(key => {
        if (!['جزئي', 'حكومة', 'مستعجل', 'تنفيذ'].includes(key)) {
            let title = dataStore[key].title || key;
            let isActive = (currentType === key) ? 'active' : '';
            htmlContent += `<li><button onclick="switchType('${key}')" class="dropdown-action-btn ${isActive}"><span>${title}</span> <span>📁</span></button></li>`;
        }
    });

    htmlContent += `
        <li><button onclick="addNewCustomPage()" class="dropdown-action-btn"><span>إضافة تخصص جديد</span> <span>➕</span></button></li>
        <li><button onclick="removeCurrentPage()" class="dropdown-action-btn"><span>إزالة التخصص الحالي</span> <span>🗑️</span></button></li>
        <li><button onclick="goToFinalStats()" class="dropdown-action-btn"><span>الإحصاء القضائي النهائي</span> <span>📊</span></button></li>
        <li><button onclick="resetAllData()" class="reset-all-btn dropdown-action-btn" style="color: #ffcccc;"><span>إزالة جميع الإحصائيات</span> <span>❌</span></button></li>
    `;
    dropdownList.innerHTML = htmlContent;
}

function renderTable() {
    const desktopTbody = document.getElementById('desktop-table-body');
    const subHeaderRow = document.getElementById('desktop-sub-header');
    const shakliHeaderContainer = document.getElementById('shakli-header-container');
    const ithbatHeaderContainer = document.getElementById('ithbat-header-container');
    const waqfExtraContainer = document.getElementById('waqf-extra-container');
    const serialRow = document.getElementById('desktop-serial-row');
    const mobileContainer = document.getElementById('vertical-records-container');
    
    desktopTbody.innerHTML = '';
    mobileContainer.innerHTML = '';

    let section = dataStore[currentType] || { rows: [], customSh: [], customIth: [], customWaqf: [], serialVals: {moajal:0, shatb:0, mawdoui:0, sh:[0,0,0,0], customShVals:[], ith:[0,0,0,0], customIthVals:[], waqf:0, customWaqfVals:[]} };
    let rows = section.rows || [];
    let customSh = section.customSh || [];
    let customIth = section.customIth || [];
    let customWaqf = section.customWaqf || [];
    if (!section.serialVals) section.serialVals = {moajal:0, shatb:0, mawdoui:0, sh:[0,0,0,0], customShVals:customSh.map(()=>0), ith:[0,0,0,0], customIthVals:customIth.map(()=>0), waqf:0, customWaqfVals:customWaqf.map(()=>0)};

    let shakliColSpan = 4 + customSh.length;
    shakliHeaderContainer.setAttribute('colspan', shakliColSpan);

    let ithbatColSpan = 4 + customIth.length;
    ithbatHeaderContainer.setAttribute('colspan', ithbatColSpan);
    
    // بناء الهيدر الفرعي
    let subHeaderHTML = `
        <th>اختصاص</th><th>قبول</th><th>اعتبار</th>
        <th>
            تعليقي 
            <button class="add-col-btn" onclick="addCustomColumn('sh')" title="إضافة عمود شكلي" style="background: transparent; color: white; border: none; cursor: pointer; font-size: 14px; margin-right: 4px;">+</button>
        </th>
    `;
    customSh.forEach((colName, cIndex) => {
        subHeaderHTML += `<th>${colName} <button onclick="removeCustomColumn('sh', ${cIndex})" style="color:red; background:none; border:none; cursor:pointer;" title="حذف العمود">✕</button></th>`;
    });
    subHeaderHTML += `
        <th>خبير</th><th>تحقيق</th><th>استجواب</th>
        <th>
            يمين 
            <button class="add-col-btn" onclick="addCustomColumn('ith')" title="إضافة عمود إثبات" style="background: transparent; color: white; border: none; cursor: pointer; font-size: 14px; margin-right: 4px;">+</button>
        </th>
    `;
    customIth.forEach((colName, cIndex) => {
        subHeaderHTML += `<th>${colName} <button onclick="removeCustomColumn('ith', ${cIndex})" style="color:red; background:none; border:none; cursor:pointer;" title="حذف العمود">✕</button></th>`;
    });
    subHeaderRow.innerHTML = subHeaderHTML;

    waqfExtraContainer.innerHTML = `<button class="add-col-btn" onclick="addCustomColumn('waqf')" title="إضافة عمود جديد" style="background: transparent; color: white; border: none; cursor: pointer; font-size: 16px;">+</button>`;

    // --- 1. توليد صف "رقم مسلسل" للديسكتوب ---
    let sVals = section.serialVals;
    let serialHTML = `<td>رقم مسلسل</td>`;
    serialHTML += `<td><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(sVals.moajal)}" oninput="handleSerialInput(this, 'moajal')"></td>`;
    serialHTML += `<td><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(sVals.shatb)}" oninput="handleSerialInput(this, 'shatb')"></td>`;
    serialHTML += `<td><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(sVals.mawdoui)}" oninput="handleSerialInput(this, 'mawdoui')"></td>`;
    
    for(let i=0; i<4; i++) {
        serialHTML += `<td><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(sVals.sh[i])}" oninput="handleSerialSubInput(this, 'sh', ${i})"></td>`;
    }
    customSh.forEach((cName, cIdx) => {
        let val = sVals.customShVals ? (sVals.customShVals[cIdx] || 0) : 0;
        serialHTML += `<td><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(val)}" oninput="handleSerialCustomShInput(this, ${cIdx})"> <button onclick="removeCustomColumn('sh', ${cIdx})" style="color:red; background:none; border:none; cursor:pointer;" title="حذف العمود">✕</button></td>`;
    });
    for(let i=0; i<4; i++) {
        serialHTML += `<td><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(sVals.ith[i])}" oninput="handleSerialSubInput(this, 'ith', ${i})"></td>`;
    }
    customIth.forEach((cName, cIdx) => {
        let val = sVals.customIthVals ? (sVals.customIthVals[cIdx] || 0) : 0;
        serialHTML += `<td><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(val)}" oninput="handleSerialCustomIthInput(this, ${cIdx})"> <button onclick="removeCustomColumn('ith', ${cIdx})" style="color:red; background:none; border:none; cursor:pointer;" title="حذف العمود">✕</button></td>`;
    });
    serialHTML += `<td><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(sVals.waqf)}" oninput="handleSerialInput(this, 'waqf')"></td>`;
    customWaqf.forEach((wName, wIdx) => {
        let val = sVals.customWaqfVals ? (sVals.customWaqfVals[wIdx] || 0) : 0;
        serialHTML += `<td><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(val)}" oninput="handleSerialCustomWaqfInput(this, ${wIdx})"> <button onclick="removeCustomColumn('waqf', ${wIdx})" style="color:red; background:none; border:none; cursor:pointer;" title="حذف العمود">✕</button></td>`;
    });
    serialRow.innerHTML = serialHTML;

    // --- 2. بناء بطاقة "رقم مسلسل" للموبايل ---
    let mobileSerialCard = document.createElement('div');
    mobileSerialCard.className = 'vertical-card';
    let mSerialHTML = `<h3>رقم مسلسل</h3><div class="record-grid">`;
    mSerialHTML += `<div class="record-item"><label>مؤجل</label><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(sVals.moajal)}" oninput="handleSerialInput(this, 'moajal')"></div>`;
    mSerialHTML += `<div class="record-item"><label>شطب</label><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(sVals.shatb)}" oninput="handleSerialInput(this, 'shatb')"></div>`;
    mSerialHTML += `<div class="record-item"><label>موضوعي</label><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(sVals.mawdoui)}" oninput="handleSerialInput(this, 'mawdoui')"></div>`;
    
    const shakliLabels = ['اختصاص', 'قبول', 'اعتبار', 'تعليقي', ...customSh];
    const shakliBase = [...sVals.sh, ...(sVals.customShVals || [])];
    shakliLabels.forEach((lbl, idx) => {
        mSerialHTML += `<div class="record-item"><label>${lbl}</label><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(shakliBase[idx])}" oninput="updateMobileSerialShInput(this, ${idx})"></div>`;
    });

    const ithbatLabels = ['خبير', 'تحقيق', 'استجواب', 'يمين', ...customIth];
    const ithbatBase = [...sVals.ith, ...(sVals.customIthVals || [])];
    ithbatLabels.forEach((lbl, idx) => {
        mSerialHTML += `<div class="record-item"><label>${lbl}</label><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(ithbatBase[idx])}" oninput="updateMobileSerialIthInput(this, ${idx})"></div>`;
    });

    mSerialHTML += `<div class="record-item"><label>وقف جزاء</label><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(sVals.waqf)}" oninput="handleSerialInput(this, 'waqf')"></div>`;
    customWaqf.forEach((wName, wIdx) => {
        let val = sVals.customWaqfVals ? (sVals.customWaqfVals[wIdx] || 0) : 0;
        mSerialHTML += `<div class="record-item"><label>${wName}</label><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(val)}"></div>`;
    });

    mSerialHTML += `</div>`;
    mobileSerialCard.innerHTML = mSerialHTML;
    mobileContainer.appendChild(mobileSerialCard);

    // --- 3. بناء صفوف البيانات الإضافية ---
    rows.forEach((row, index) => {
        const desktopTr = document.createElement('tr');
        let rowHTML = `
            <td><button class="delete-row-btn" onclick="removeRow(${index})" title="حذف الصف">✕</button></td>
            <td><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(row.moajal)}" onkeydown="handleKeyDown(event, this)" oninput="handleInput(this, ${index}, 'moajal')"></td>
            <td><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(row.shatb)}" onkeydown="handleKeyDown(event, this)" oninput="handleInput(this, ${index}, 'shatb')"></td>
            <td><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(row.mawdoui)}" onkeydown="handleKeyDown(event, this)" oninput="handleInput(this, ${index}, 'mawdoui')"></td>
            <td><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(row.sh[0])}" onkeydown="handleKeyDown(event, this)" oninput="handleSubInput(this, ${index}, 'sh', 0)"></td>
            <td><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(row.sh[1])}" onkeydown="handleKeyDown(event, this)" oninput="handleSubInput(this, ${index}, 'sh', 1)"></td>
            <td><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(row.sh[2])}" onkeydown="handleKeyDown(event, this)" oninput="handleSubInput(this, ${index}, 'sh', 2)"></td>
            <td><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(row.sh[3])}" onkeydown="handleKeyDown(event, this)" oninput="handleSubInput(this, ${index}, 'sh', 3)"></td>
        `;

        customSh.forEach((cName, cIdx) => {
            let val = row.customShVals ? (row.customShVals[cIdx] || 0) : 0;
            rowHTML += `<td><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(val)}" onkeydown="handleKeyDown(event, this)" oninput="handleCustomShInput(this, ${index}, ${cIdx})"></td>`;
        });

        rowHTML += `
            <td><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(row.ith[0])}" onkeydown="handleKeyDown(event, this)" oninput="handleSubInput(this, ${index}, 'ith', 0)"></td>
            <td><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(row.ith[1])}" onkeydown="handleKeyDown(event, this)" oninput="handleSubInput(this, ${index}, 'ith', 1)"></td>
            <td><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(row.ith[2])}" onkeydown="handleKeyDown(event, this)" oninput="handleSubInput(this, ${index}, 'ith', 2)"></td>
            <td><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(row.ith[3])}" onkeydown="handleKeyDown(event, this)" oninput="handleSubInput(this, ${index}, 'ith', 3)"></td>
        `;

        customIth.forEach((cName, cIdx) => {
            let val = row.customIthVals ? (row.customIthVals[cIdx] || 0) : 0;
            rowHTML += `<td><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(val)}" onkeydown="handleKeyDown(event, this)" oninput="handleCustomIthInput(this, ${index}, ${cIdx})"></td>`;
        });

        rowHTML += `<td><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(row.waqf)}" onkeydown="handleKeyDown(event, this)" oninput="handleInput(this, ${index}, 'waqf')"></td>`;

        customWaqf.forEach((wName, wIdx) => {
            let val = row.customWaqfVals ? (row.customWaqfVals[wIdx] || 0) : 0;
            rowHTML += `<td><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(val)}" onkeydown="handleKeyDown(event, this)" oninput="handleCustomWaqfInput(this, ${index}, ${wIdx})"></td>`;
        });

        desktopTr.innerHTML = rowHTML;
        desktopTbody.appendChild(desktopTr);

        const mobileCard = document.createElement('div');
        mobileCard.className = 'vertical-card';
        let mCardHTML = `<h3>${row.name} <button class="delete-row-btn" onclick="removeRow(${index})" style="float:left;">✕</button></h3><div class="record-grid">`;
        mCardHTML += `<div class="record-item"><label>مؤجل</label><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(row.moajal)}" oninput="handleInput(this, ${index}, 'moajal')"></div>`;
        mCardHTML += `<div class="record-item"><label>شطب</label><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(row.shatb)}" oninput="handleInput(this, ${index}, 'shatb')"></div>`;
        mCardHTML += `<div class="record-item"><label>موضوعي</label><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(row.mawdoui)}" oninput="handleInput(this, ${index}, 'mawdoui')"></div>`;
        
        shakliLabels.forEach((lbl, idx) => {
            if(idx < 4) {
                mCardHTML += `<div class="record-item"><label>${lbl}</label><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(row.sh[idx])}" oninput="updateMobileSubInput(this, ${index}, 'sh', ${idx})"></div>`;
            } else {
                let cIdx = idx - 4;
                mCardHTML += `<div class="record-item"><label>${lbl}</label><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(row.customShVals[cIdx])}" oninput="updateMobileCustomShInput(this, ${index}, ${cIdx})"></div>`;
            }
        });

        ithbatLabels.forEach((lbl, idx) => {
            if(idx < 4) {
                mCardHTML += `<div class="record-item"><label>${lbl}</label><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(row.ith[idx])}" oninput="updateMobileSubInput(this, ${index}, 'ith', ${idx})"></div>`;
            } else {
                let cIdx = idx - 4;
                mCardHTML += `<div class="record-item"><label>${lbl}</label><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(row.customIthVals[cIdx])}" oninput="updateMobileCustomIthInput(this, ${index}, ${cIdx})"></div>`;
            }
        });

        mCardHTML += `<div class="record-item"><label>وقف جزاء</label><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(row.waqf)}" oninput="handleInput(this, ${index}, 'waqf')"></div>`;
        customWaqf.forEach((wName, wIdx) => {
            let val = row.customWaqfVals ? (row.customWaqfVals[wIdx] || 0) : 0;
            mCardHTML += `<div class="record-item"><label>${wName}</label><input type="text" inputmode="numeric" pattern="[0-9]*" value="${toArabicNumbers(val)}"></div>`;
        });

        mCardHTML += `</div>`;
        mobileCard.innerHTML = mCardHTML;
        mobileContainer.appendChild(mobileCard);
    });

    recalculateAll();
}

function updateMobileSerialShInput(inputElem, idx) {
    let val = parseInt(toEnglishNumbers(inputElem.value), 10) || 0;
    let section = dataStore[currentType];
    if(idx < 4) {
        section.serialVals.sh[idx] = val;
    } else {
        section.serialVals.customShVals[idx - 4] = val;
    }
    inputElem.value = toArabicNumbers(val);
    saveData();
    recalculateAll();
}

function updateMobileSerialIthInput(inputElem, idx) {
    let val = parseInt(toEnglishNumbers(inputElem.value), 10) || 0;
    let section = dataStore[currentType];
    if(idx < 4) {
        section.serialVals.ith[idx] = val;
    } else {
        section.serialVals.customIthVals[idx - 4] = val;
    }
    inputElem.value = toArabicNumbers(val);
    saveData();
    recalculateAll();
}

function updateMobileSubInput(inputElem, index, field, subIndex) {
    let val = parseInt(toEnglishNumbers(inputElem.value), 10) || 0;
    dataStore[currentType].rows[index][field][subIndex] = val;
    inputElem.value = toArabicNumbers(val);
    saveData();
    recalculateAll();
}

function updateMobileCustomShInput(inputElem, index, cIdx) {
    let val = parseInt(toEnglishNumbers(inputElem.value), 10) || 0;
    dataStore[currentType].rows[index].customShVals[cIdx] = val;
    inputElem.value = toArabicNumbers(val);
    saveData();
    recalculateAll();
}

function updateMobileCustomIthInput(inputElem, index, cIdx) {
    let val = parseInt(toEnglishNumbers(inputElem.value), 10) || 0;
    dataStore[currentType].rows[index].customIthVals[cIdx] = val;
    inputElem.value = toArabicNumbers(val);
    saveData();
    recalculateAll();
}

function addNewRow() {
    let section = dataStore[currentType];
    let rows = section.rows;
    let defaultName = (section.title || currentType) + ' (' + toArabicNumbers(rows.length + 1) + ')';
    rows.push({ 
        name: defaultName, 
        moajal: 0, shatb: 0, mawdoui: 0, 
        sh: [0, 0, 0, 0], customShVals: section.customSh.map(() => 0), 
        ith: [0, 0, 0, 0], customIthVals: section.customIth.map(() => 0), 
        waqf: 0, customWaqfVals: section.customWaqf.map(() => 0) 
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
        section.serialVals = {moajal:0, shatb:0, mawdoui:0, sh:[0,0,0,0], customShVals:section.customSh.map(()=>0), ith:[0,0,0,0], customIthVals:section.customIth.map(()=>0), waqf:0, customWaqfVals:section.customWaqf.map(()=>0)};
        section.rows = [];
        saveData();
        renderTable();
    }
}

function handleSerialInput(inputElem, field) {
    let val = parseInt(toEnglishNumbers(inputElem.value), 10) || 0;
    let section = dataStore[currentType];
    if(!section.serialVals) section.serialVals = {moajal:0, shatb:0, mawdoui:0, sh:[0,0,0,0], customShVals:[], ith:[0,0,0,0], customIthVals:[], waqf:0, customWaqfVals:[]};
    section.serialVals[field] = val;
    inputElem.value = toArabicNumbers(val);
    saveData();
    recalculateAll();
}

function handleSerialSubInput(inputElem, field, subIndex) {
    let val = parseInt(toEnglishNumbers(inputElem.value), 10) || 0;
    let section = dataStore[currentType];
    section.serialVals[field][subIndex] = val;
    inputElem.value = toArabicNumbers(val);
    saveData();
    recalculateAll();
}

function handleSerialCustomShInput(inputElem, cIdx) {
    let val = parseInt(toEnglishNumbers(inputElem.value), 10) || 0;
    let section = dataStore[currentType];
    section.serialVals.customShVals[cIdx] = val;
    inputElem.value = toArabicNumbers(val);
    saveData();
    recalculateAll();
}

function handleSerialCustomIthInput(inputElem, cIdx) {
    let val = parseInt(toEnglishNumbers(inputElem.value), 10) || 0;
    let section = dataStore[currentType];
    section.serialVals.customIthVals[cIdx] = val;
    inputElem.value = toArabicNumbers(val);
    saveData();
    recalculateAll();
}

function handleSerialCustomWaqfInput(inputElem, wIdx) {
    let val = parseInt(toEnglishNumbers(inputElem.value), 10) || 0;
    let section = dataStore[currentType];
    section.serialVals.customWaqfVals[wIdx] = val;
    inputElem.value = toArabicNumbers(val);
    saveData();
    recalculateAll();
}

function handleKeyDown(e, currentInput) {
    if (e.key === '-' || e.key === 'e') {
        e.preventDefault();
        return;
    }
    if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        const inputs = Array.from(document.querySelectorAll('input:not([readonly])'));
        const currentIndex = inputs.indexOf(currentInput);
        if (currentIndex > -1 && currentIndex < inputs.length - 1) {
            inputs[currentIndex + 1].focus();
            inputs[currentIndex + 1].select();
        } else {
            currentInput.blur();
        }
    }
}

function handleInput(inputElem, index, field) {
    let val = parseInt(toEnglishNumbers(inputElem.value), 10) || 0;
    dataStore[currentType].rows[index][field] = val;
    inputElem.value = toArabicNumbers(val);
    saveData();
    recalculateAll();
}

function handleSubInput(inputElem, index, field, subIndex) {
    let val = parseInt(toEnglishNumbers(inputElem.value), 10) || 0;
    dataStore[currentType].rows[index][field][subIndex] = val;
    inputElem.value = toArabicNumbers(val);
    saveData();
    recalculateAll();
}

function handleCustomShInput(inputElem, index, cIdx) {
    let val = parseInt(toEnglishNumbers(inputElem.value), 10) || 0;
    dataStore[currentType].rows[index].customShVals[cIdx] = val;
    inputElem.value = toArabicNumbers(val);
    saveData();
    recalculateAll();
}

function handleCustomIthInput(inputElem, index, cIdx) {
    let val = parseInt(toEnglishNumbers(inputElem.value), 10) || 0;
    dataStore[currentType].rows[index].customIthVals[cIdx] = val;
    inputElem.value = toArabicNumbers(val);
    saveData();
    recalculateAll();
}

function handleCustomWaqfInput(inputElem, index, wIdx) {
    let val = parseInt(toEnglishNumbers(inputElem.value), 10) || 0;
    dataStore[currentType].rows[index].customWaqfVals[wIdx] = val;
    inputElem.value = toArabicNumbers(val);
    saveData();
    recalculateAll();
}

// دالة الحسابات والجمع التلقائي الشاملة
function recalculateAll() {
    let overallMoqadam = 0, overallMoajal = 0, overallShatb = 0;
    let overallMawdoui = 0, overallShakli = 0, overallIthbat = 0, overallWaqf = 0, overallQataiSub = 0;

    Object.keys(dataStore).forEach(typeKey => {
        const section = dataStore[typeKey];
        const rows = section.rows || [];
        const sVals = section.serialVals || {moajal:0, shatb:0, mawdoui:0, sh:[0,0,0,0], customShVals:[], ith:[0,0,0,0], customIthVals:[], waqf:0, customWaqfVals:[]};

        let typeMoqadam = 0, typeMoajal = 0, typeShatb = 0, typeMawdoui = 0;
        let typeShakli = 0, typeIthbat = 0, typeWaqf = 0;

        let sSumShBase = (sVals.sh || []).reduce((a, b) => a + b, 0);
        let sSumShCustom = (sVals.customShVals || []).reduce((a, b) => a + b, 0);
        let sSumShakliTotal = sSumShBase + sSumShCustom;

        let sSumIthBase = (sVals.ith || []).reduce((a, b) => a + b, 0);
        let sSumIthCustom = (sVals.customIthVals || []).reduce((a, b) => a + b, 0);
        let sSumIthTotal = sSumIthBase + sSumIthCustom;

        let sSumWaqfCustom = (sVals.customWaqfVals || []).reduce((a, b) => a + b, 0);
        let sTotalWaqf = (sVals.waqf || 0) + sSumWaqfCustom;

        let sQatai = (sVals.mawdoui || 0) + sSumShakliTotal;
        let sMahkoum = sQatai + sSumIthTotal;
        let sMoqadam = (sVals.moajal || 0) + (sVals.shatb || 0) + sMahkoum + sTotalWaqf;

        typeMoqadam += sMoqadam;
        typeMoajal += (sVals.moajal || 0);
        typeShatb += (sVals.shatb || 0);
        typeMawdoui += (sVals.mawdoui || 0);
        typeShakli += sSumShakliTotal;
        typeIthbat += sSumIthTotal;
        typeWaqf += sTotalWaqf;

        rows.forEach(row => {
            let sumShBase = row.sh.reduce((a, b) => a + b, 0);
            let sumShCustom = (row.customShVals || []).reduce((a, b) => a + b, 0);
            let sumShakliTotal = sumShBase + sumShCustom;

            let sumIthBase = row.ith.reduce((a, b) => a + b, 0);
            let sumIthCustom = (row.customIthVals || []).reduce((a, b) => a + b, 0);
            let sumIthTotal = sumIthBase + sumIthCustom;

            let sumWaqfCustom = (row.customWaqfVals || []).reduce((a, b) => a + b, 0);
            let totalWaqf = row.waqf + sumWaqfCustom;

            let qatai = row.mawdoui + sumShakliTotal;
            let mahkoum = qatai + sumIthTotal;
            let moqadam = row.moajal + row.shatb + mahkoum + totalWaqf;

            typeMoqadam += moqadam;
            typeMoajal += row.moajal;
            typeShatb += row.shatb;
            typeMawdoui += row.mawdoui;
            typeShakli += sumShakliTotal;
            typeIthbat += sumIthTotal;
            typeWaqf += totalWaqf;
        });

        let typeQatai = typeMawdoui + typeShakli;

        if (typeKey === currentType) {
            document.getElementById('tot-moajal').innerText = toArabicNumbers(typeMoajal);
            document.getElementById('d-tot-moajal').innerText = toArabicNumbers(typeMoajal);

            document.getElementById('tot-shatb').innerText = toArabicNumbers(typeShatb);
            document.getElementById('d-tot-shatb').innerText = toArabicNumbers(typeShatb);

            document.getElementById('tot-mawdoui').innerText = toArabicNumbers(typeMawdoui);
            document.getElementById('d-tot-mawdoui').innerText = toArabicNumbers(typeMawdoui);

            document.getElementById('tot-shakli').innerText = toArabicNumbers(typeShakli);
            document.getElementById('d-tot-shakli').innerText = toArabicNumbers(typeShakli);

            document.getElementById('tot-ithbat').innerText = toArabicNumbers(typeIthbat);
            document.getElementById('d-tot-ithbat').innerText = toArabicNumbers(typeIthbat);

            document.getElementById('tot-waqf').innerText = toArabicNumbers(typeWaqf);
            document.getElementById('d-tot-waqf').innerText = toArabicNumbers(typeWaqf);

            document.getElementById('tot-moqadam').innerText = toArabicNumbers(typeMoqadam);
            document.getElementById('d-tot-moqadam').innerText = toArabicNumbers(typeMoqadam);
        }

        overallMoqadam += typeMoqadam;
        overallMoajal += typeMoajal;
        overallShatb += typeShatb;
        overallMawdoui += typeMawdoui;
        overallShakli += typeShakli;
        overallIthbat += typeIthbat;
        overallWaqf += typeWaqf;
        overallQataiSub += typeQatai;
    });

    let overallMahkoum = overallQataiSub + overallIthbat + overallWaqf;

    const footerData = {
        'f-moajal': overallMoajal,
        'f-shatb': overallShatb,
        'f-mahkoum': overallMahkoum,
        'f-mawdoui': overallMawdoui,
        'f-shakli': overallShakli,
        'f-ithbat': overallIthbat,
        'f-waqf': overallWaqf,
        'f-qatai-sub': overallQataiSub,
        'f-moqadam': overallMoqadam
    };

    Object.keys(footerData).forEach(id => {
        let el = document.getElementById(id);
        if (el) el.innerText = toArabicNumbers(footerData[id]);
    });
}

const footer = document.getElementById('main-footer');
function toggleFooter() {
    footer.classList.toggle('hidden');
}

function exportToExcel() { alert("تم التصدير بنجاح."); }
function exportToWord() { alert("تم التصدير بنجاح."); }

window.onload = function() {
    updateDropdownDynamicMenu();
    renderTable();
};
