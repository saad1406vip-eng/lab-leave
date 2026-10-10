/* ============================================================
   1. دوال التاريخ (محسّنة للجوال)
   ============================================================ */
function formatLocalDate(d) {
  if (!d || isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseLocalDate(str) {
  if (!str) return null;
  str = String(str).trim();
  
  // صيغة YYYY-MM-DD أو YYYY/MM/DD
  let match = str.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if (match) {
    const d = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    if (!isNaN(d.getTime())) return d;
  }
  
  // صيغة MM/DD/YYYY (أمريكي)
  match = str.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
  if (match) {
    const d = new Date(parseInt(match[3]), parseInt(match[1]) - 1, parseInt(match[2]));
    if (!isNaN(d.getTime())) return d;
  }
  
  // محاولة أخيرة
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d;
  
  return null;
}

function formatArabicDate(str) {
  if (!str) return "";
  const d = parseLocalDate(str);
  if (!d) return str;
  const months = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/* ============================================================
   2. البيانات الافتراضية
   ============================================================ */
const DEFAULT_EMERGENCY = 5;
const DEFAULT_ANNUAL = 30;

const DEFAULT_EMPLOYEES = [
  {id:"01231051", csvId:"0123105", name:"سعد علي سعد القرني", section:"CHEM/REC", role:"رئيس القسم", fixedMorning:true},
  {id:"7670327", csvId:"7670327", name:"بدر محمد ماكن القرني", section:"CHEM/REC", role:"مشرف فنيين", fixedMorning:true},
  {id:"01231243", csvId:"0123124", name:"محمد دخيل الله محمد الغامدي", section:"CHEM/VIRO/HERMONE", role:"فني", fixedMorning:true},
  {id:"66540", csvId:"665540", name:"حسام سعيد عبدالله القرني", section:"CHEM/VIRO/HERMONE", role:"فني", group:2},
  {id:"7670350", csvId:"7670350", name:"منصور محمد منصور القرني", section:"CHEM/VIRO/HERMONE", role:"فني", group:2},
  {id:"7221400", csvId:"7221400", name:"محمد سهلان سعد العلياني", section:"CHEM/VIRO/HERMONE", role:"فني", group:2},
  {id:"7219250", csvId:"7219250", name:"مسفر عائض محمد القرني", section:"CHEM/VIRO/HERMONE", role:"فني", group:1},
  {id:"7221389", csvId:"7221389", name:"محمد ناصر محمد القرني", section:"CHEM/VIRO/HERMONE", role:"فني", group:1},
  {id:"7245417", csvId:"7245417", name:"د. حاتم خليفة كرار", section:"BB/HEMA", role:"مرجع طبي + جودة", fixedMorning:true, noLeave:true},
  {id:"46139", csvId:"46139", name:"فهد عبدالله محمد القرني", section:"BB/HEMA", role:"فني", group:2},
  {id:"0124959", csvId:"0124959", name:"محمد سعد عبدالله القرني", section:"BB/HEMA", role:"فني", group:3},
  {id:"62526", csvId:"62526", name:"محمد صالح محمد الخثعمي", section:"BB/HEMA", role:"فني", group:3},
  {id:"7707014", csvId:"7707014", name:"سعد عيد سعيد ال سعد القرني", section:"BB/HEMA", role:"فني", group:3},
  {id:"0123074", csvId:"0123074", name:"سلطان محمد دخيل القرني", section:"BB/HEMA", role:"فني", group:1},
  {id:"7241475", csvId:"7241475", name:"نايف عبدالله محبوب القرني", section:"BB/HEMA", role:"فني", group:1},
  {id:"7669825", csvId:"7669825", name:"عبدالعزيز راشد جديع البريدي", section:"MICRO/PARA", role:"فني", fixedMorning:true},
  {id:"65269", csvId:"65269", name:"محمد خلف أحمد الخثعمي", section:"MICRO/PARA", role:"فني", fixedMorning:true},
  {id:"7670368", csvId:"7670368", name:"نايف محمد عبدالله العلياني", section:"MICRO/PARA", role:"فني", group:3}
];

const DEFAULT_GROUPS = {
  1: { name: "القروب 1", members: ["مسفر عائض محمد القرني", "سلطان محمد دخيل القرني", "محمد ناصر محمد القرني", "نايف عبدالله محبوب القرني"] },
  2: { name: "القروب 2", members: ["منصور محمد منصور القرني", "حسام سعيد عبدالله القرني", "محمد سهلان سعد العلياني", "فهد عبدالله محمد القرني"] },
  3: { name: "القروب 3", members: ["محمد صالح محمد الخثعمي", "سعد عيد سعيد ال سعد القرني", "محمد سعد عبدالله القرني", "نايف محمد عبدالله العلياني"] }
};

const DEFAULT_SECTIONS = {
  "CHEM/REC": { min: 1 },
  "CHEM/VIRO/HERMONE": { min: 3 },
  "BB/HEMA": { min: 2 },
  "MICRO/PARA": { min: 1 }
};

const DEFAULT_ROTATION = [
  { month: "أكتوبر 2026", year: 2026, monthNum: 10, evening: ["مسفر", "سلطان"], night: ["محمد ناصر", "نايف محبوب"], weekendMorning: ["محمد صالح", "نايف محمد"] },
  { month: "نوفمبر 2026", year: 2026, monthNum: 11, evening: ["منصور", "فهد"], night: ["حسام", "سهلان"], weekendMorning: ["سعد عيد", "عبدالعزيز"] },
  { month: "ديسمبر 2026", year: 2026, monthNum: 12, evening: ["محمد صالح", "سعد عيد"], night: ["محمد سعد", "نايف محمد"], weekendMorning: ["مسفر", "محمد ناصر"] },
  { month: "يناير 2027", year: 2027, monthNum: 1, evening: ["محمد ناصر", "نايف محبوب"], night: ["مسفر", "سلطان"], weekendMorning: ["حسام", "منصور"] },
  { month: "فبراير 2027", year: 2027, monthNum: 2, evening: ["حسام", "سهلان"], night: ["منصور", "فهد"], weekendMorning: ["دخيل", "عبدالعزيز"] },
  { month: "مارس 2027", year: 2027, monthNum: 3, evening: ["محمد سعد", "نايف محمد"], night: ["محمد صالح", "سعد عيد"], weekendMorning: ["سلطان", "نايف محبوب"] },
  { month: "أبريل 2027", year: 2027, monthNum: 4, evening: ["مسفر", "سلطان"], night: ["محمد ناصر", "نايف محبوب"], weekendMorning: ["سهلان", "فهد"] }
];

const MAX_ON_LEAVE_PER_SECTION = 1;

/* ============================================================
   3. الحالة
   ============================================================ */
let state = {
  year: 2026,
  usedEmergency: {},
  usedAnnual: {},
  leaveLog: [],
  schedules: {},
  archive: [],
  customRotation: null,
  employees: null,
  groups: null,
  sections: null
};

const STORAGE_KEY = "labLeaveState_v9";

/* ============================================================
   4. الدوال المساعدة
   ============================================================ */
function getEmployees() { return state.employees || DEFAULT_EMPLOYEES; }
function getGroups() { return state.groups || DEFAULT_GROUPS; }
function getSections() { return state.sections || DEFAULT_SECTIONS; }
function getActiveRotation() { return state.customRotation || DEFAULT_ROTATION; }

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (e) { console.error("فشل الحفظ:", e); }
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = Object.assign(state, parsed);
    }
  } catch (e) { console.error("فشل التحميل:", e); }
}

function getUsedEmergency(empId) { return state.usedEmergency[empId] || 0; }
function getUsedAnnual(empId) { return state.usedAnnual[empId] || 0; }
function getRemainingEmergency(empId) { return DEFAULT_EMERGENCY - getUsedEmergency(empId); }
function getRemainingAnnual(empId) { return DEFAULT_ANNUAL - getUsedAnnual(empId); }

/* ============================================================
   5. الروتيشن
   ============================================================ */
function generateRotationTimeline(count = 6) {
  const START_YEAR = 2026;
  const START_MONTH = 10;
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  if (year < START_YEAR || (year === START_YEAR && month < START_MONTH)) {
    year = START_YEAR;
    month = START_MONTH;
  }
  const monthsSinceStart = (year - START_YEAR) * 12 + (month - START_MONTH);
  const monthNames = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  const rot = getActiveRotation();
  const timeline = [];
  for (let i = 0; i < count; i++) {
    const idx = monthsSinceStart + i;
    const cycleIdx = ((idx % rot.length) + rot.length) % rot.length;
    const r = rot[cycleIdx];
    const actualYear = START_YEAR + Math.floor((START_MONTH - 1 + idx) / 12);
    const actualMonth = ((START_MONTH - 1 + idx) % 12) + 1;
    timeline.push({ ...r, year: actualYear, monthNum: actualMonth, displayName: `${monthNames[actualMonth - 1]} ${actualYear}` });
  }
  return timeline;
}

function findRotationForMonth(year, monthNum) {
  const rot = getActiveRotation();
  const START_YEAR = 2026;
  const START_MONTH = 10;
  const monthsSinceStart = (year - START_YEAR) * 12 + (month - START_MONTH);
  const cycleIdx = ((monthsSinceStart % rot.length) + rot.length) % rot.length;
  return rot[cycleIdx];
}

/* ============================================================
   6. الإعدادات
   ============================================================ */
function openSettings() {
  document.getElementById("settingsModal").classList.add("active");
  renderEmployeesList();
  renderSectionsList();
  renderGroupsList();
  renderSettingsSchedules();
  renderRotationView();
  renderMonthSelector();
  populateManualDropdowns();
}

function closeSettings() {
  document.getElementById("settingsModal").classList.remove("active");
}

function switchTab(tabName) {
  document.querySelectorAll(".settings-tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".settings-tab-content").forEach(t => t.classList.remove("active"));
  const tab = document.querySelector(`.settings-tab[onclick="switchTab('${tabName}')"]`);
  if (tab) tab.classList.add("active");
  const content = document.getElementById(`tab-${tabName}`);
  if (content) content.classList.add("active");
}

function populateManualDropdowns() {
  const empSel = document.getElementById("manualEmp");
  const coverSel = document.getElementById("manualCover");
  if (!empSel || !coverSel) return;
  
  empSel.innerHTML = "";
  coverSel.innerHTML = "";
  
  getEmployees().forEach(e => {
    if (e.noLeave) return;
    const o1 = document.createElement("option");
    o1.value = e.id; o1.textContent = `${e.name} (${e.section})`;
    empSel.appendChild(o1);
    
    const o2 = o1.cloneNode(true);
    coverSel.appendChild(o2);
  });
}

/* ============================================================
   7. إدارة الموظفين
   ============================================================ */
function renderEmployeesList() {
  const container = document.getElementById("employeesList");
  const emps = getEmployees();
  if (emps.length === 0) {
    container.innerHTML = `<p style="color:#999; text-align:center;">لا يوجد موظفون</p>`;
    return;
  }
  let html = "";
  emps.forEach(emp => {
    const groupName = emp.group ? (getGroups()[emp.group]?.name || emp.group) : "بدون قروب";
    html += `<div class="emp-mini-row">
      <div class="emp-info">
        <b>${emp.name}</b><br>
        الرقم: ${emp.id} | القسم: ${emp.section} | ${groupName}
      </div>
      <div class="emp-actions">
        <button class="small warning" onclick="editEmployee('${emp.id}')">✏️</button>
        <button class="small danger" onclick="deleteEmployee('${emp.id}')">🗑️</button>
      </div>
    </div>`;
  });
  container.innerHTML = html;
}

let currentEditEmpId = null;

function openAddEmployee() {
  currentEditEmpId = null;
  document.getElementById("empFormTitle").textContent = "➕ إضافة موظف";
  document.getElementById("empFormName").value = "";
  document.getElementById("empFormId").value = "";
  document.getElementById("empFormId").disabled = false;
  populateSectionDropdown();
  populateGroupDropdown();
  const firstSection = Object.keys(getSections())[0] || "";
  document.getElementById("empFormSection").value = firstSection;
  document.getElementById("empFormStatus").innerHTML = "";
  document.getElementById("empFormModal").classList.add("active");
}

function editEmployee(empId) {
  const emp = getEmployees().find(e => e.id === empId);
  if (!emp) return;
  currentEditEmpId = empId;
  document.getElementById("empFormTitle").textContent = "✏️ تعديل موظف";
  document.getElementById("empFormName").value = emp.name;
  document.getElementById("empFormId").value = emp.id;
  document.getElementById("empFormId").disabled = true;
  populateSectionDropdown();
  populateGroupDropdown();
  document.getElementById("empFormSection").value = emp.section;
  document.getElementById("empFormGroup").value = emp.group || "";
  document.getElementById("empFormStatus").innerHTML = "";
  document.getElementById("empFormModal").classList.add("active");
}

function populateSectionDropdown() {
  const sel = document.getElementById("empFormSection");
  sel.innerHTML = "";
  Object.keys(getSections()).forEach(secName => {
    const opt = document.createElement("option");
    opt.value = secName;
    opt.textContent = secName;
    sel.appendChild(opt);
  });
}

function populateGroupDropdown() {
  const sel = document.getElementById("empFormGroup");
  sel.innerHTML = `<option value="">بدون قروب</option>`;
  Object.keys(getGroups()).forEach(gId => {
    const opt = document.createElement("option");
    opt.value = gId;
    opt.textContent = getGroups()[gId].name;
    sel.appendChild(opt);
  });
}

function closeEmpForm() {
  document.getElementById("empFormModal").classList.remove("active");
}

function saveEmployee() {
  const name = document.getElementById("empFormName").value.trim();
  const id = document.getElementById("empFormId").value.trim();
  const section = document.getElementById("empFormSection").value;
  const group = document.getElementById("empFormGroup").value;
  const statusDiv = document.getElementById("empFormStatus");
  
  if (!name) { statusDiv.innerHTML = `<div class="alert danger">❌ الاسم مطلوب</div>`; return; }
  if (!id) { statusDiv.innerHTML = `<div class="alert danger">❌ الرقم الوظيفي مطلوب</div>`; return; }
  if (!section) { statusDiv.innerHTML = `<div class="alert danger">❌ القسم مطلوب</div>`; return; }
  
  if (!state.employees) state.employees = JSON.parse(JSON.stringify(getEmployees()));
  
  if (currentEditEmpId) {
    const emp = state.employees.find(e => e.id === currentEditEmpId);
    if (!emp) { statusDiv.innerHTML = `<div class="alert danger">❌ لم يتم العثور على الموظف</div>`; return; }
    emp.name = name;
    emp.section = section;
    emp.group = group ? parseInt(group) : null;
  } else {
    if (state.employees.find(e => e.id === id)) {
      statusDiv.innerHTML = `<div class="alert danger">❌ الرقم الوظيفي موجود مسبقاً</div>`;
      return;
    }
    state.employees.push({
      id: id,
      csvId: id.replace(/^0+/, ""),
      name: name,
      section: section,
      role: "فني",
      group: group ? parseInt(group) : null
    });
  }
  
  if (group) updateGroupMembers(parseInt(group));
  
  saveState();
  statusDiv.innerHTML = `<div class="alert success">✅ تم الحفظ بنجاح</div>`;
  renderEmployeesList();
  populateLeaveEmpDropdown();
  populateFilterSectionDropdown();
  setTimeout(() => { closeEmpForm(); }, 800);
}

function updateGroupMembers(groupId) {
  if (!state.groups) state.groups = JSON.parse(JSON.stringify(getGroups()));
  const group = state.groups[groupId];
  if (!group) return;
  group.members = state.employees.filter(e => e.group === groupId).map(e => e.name);
}

function deleteEmployee(empId) {
  if (!confirm("هل أنت متأكد من حذف هذا الموظف نهائياً؟")) return;
  if (!state.employees) state.employees = JSON.parse(JSON.stringify(getEmployees()));
  state.employees = state.employees.filter(e => e.id !== empId);
  if (!state.groups) state.groups = JSON.parse(JSON.stringify(getGroups()));
  Object.keys(state.groups).forEach(gId => {
    state.groups[gId].members = state.groups[gId].members.filter(m => {
      return !!state.employees.find(e => e.name === m);
    });
  });
  saveState();
  renderEmployeesList();
  populateLeaveEmpDropdown();
  populateFilterSectionDropdown();
}

/* ============================================================
   8. إدارة الأقسام
   ============================================================ */
function renderSectionsList() {
  const container = document.getElementById("sectionsList");
  const sections = getSections();
  let html = "";
  Object.keys(sections).forEach(secName => {
    html += `<div class="section-mini-row">
      <div>
        <b>${secName}</b><br>
        <span style="font-size:12px; color:#718096;">الحد الأدنى الآمن: ${sections[secName].min}</span>
      </div>
      <div>
        <button class="small warning" onclick="editSection('${secName}')">✏️</button>
        <button class="small danger" onclick="deleteSection('${secName}')">🗑️</button>
      </div>
    </div>`;
  });
  container.innerHTML = html;
}

let currentEditSectionName = null;

function openAddSection() {
  currentEditSectionName = null;
  document.getElementById("sectionFormTitle").textContent = "➕ إضافة قسم";
  document.getElementById("sectionFormName").value = "";
  document.getElementById("sectionFormName").disabled = false;
  document.getElementById("sectionFormMin").value = 1;
  document.getElementById("sectionFormStatus").innerHTML = "";
  document.getElementById("sectionFormModal").classList.add("active");
}

function editSection(secName) {
  currentEditSectionName = secName;
  document.getElementById("sectionFormTitle").textContent = "✏️ تعديل قسم";
  document.getElementById("sectionFormName").value = secName;
  document.getElementById("sectionFormName").disabled = false;
  document.getElementById("sectionFormMin").value = getSections()[secName].min;
  document.getElementById("sectionFormStatus").innerHTML = "";
  document.getElementById("sectionFormModal").classList.add("active");
}

function closeSectionForm() {
  document.getElementById("sectionFormModal").classList.remove("active");
}

function saveSection() {
  const name = document.getElementById("sectionFormName").value.trim();
  const min = parseInt(document.getElementById("sectionFormMin").value);
  const statusDiv = document.getElementById("sectionFormStatus");
  
  if (!name) { statusDiv.innerHTML = `<div class="alert danger">❌ اسم القسم مطلوب</div>`; return; }
  if (!min || min < 1) { statusDiv.innerHTML = `<div class="alert danger">❌ الحد الأدنى يجب أن يكون 1 على الأقل</div>`; return; }
  
  if (!state.sections) state.sections = JSON.parse(JSON.stringify(getSections()));
  
  if (currentEditSectionName) {
    if (name !== currentEditSectionName) {
      state.sections[name] = state.sections[currentEditSectionName];
      delete state.sections[currentEditSectionName];
      if (state.employees) {
        state.employees.forEach(e => {
          if (e.section === currentEditSectionName) e.section = name;
        });
      }
    }
    state.sections[name].min = min;
  } else {
    if (state.sections[name]) {
      statusDiv.innerHTML = `<div class="alert danger">❌ اسم القسم موجود مسبقاً</div>`;
      return;
    }
    state.sections[name] = { min: min };
  }
  
  saveState();
  statusDiv.innerHTML = `<div class="alert success">✅ تم الحفظ بنجاح</div>`;
  renderSectionsList();
  populateFilterSectionDropdown();
  setTimeout(() => { closeSectionForm(); }, 800);
}

function deleteSection(secName) {
  if (!confirm(`هل أنت متأكد من حذف القسم "${secName}"؟`)) return;
  if (!state.sections) state.sections = JSON.parse(JSON.stringify(getSections()));
  delete state.sections[secName];
  saveState();
  renderSectionsList();
  populateFilterSectionDropdown();
}

/* ============================================================
   9. إدارة القروبات
   ============================================================ */
function renderGroupsList() {
  const container = document.getElementById("groupsList");
  const groups = getGroups();
  let html = "";
  Object.keys(groups).forEach(gId => {
    const g = groups[gId];
    html += `<div class="group-edit-card">
      <div class="group-header">
        <b>${g.name}</b>
        <div>
          <button class="small warning" onclick="editGroup('${gId}')">✏️</button>
          <button class="small danger" onclick="deleteGroup('${gId}')">🗑️</button>
        </div>
      </div>
      <div style="font-size:12px; color:#4a5568;">الأعضاء: ${g.members.join(" • ") || "لا يوجد"}</div>
    </div>`;
  });
  container.innerHTML = html;
}

let currentEditGroupId = null;

function openAddGroup() {
  currentEditGroupId = null;
  document.getElementById("groupFormTitle").textContent = "➕ إضافة قروب";
  document.getElementById("groupFormName").value = "";
  document.getElementById("groupFormStatus").innerHTML = "";
  document.getElementById("groupFormModal").classList.add("active");
}

function editGroup(gId) {
  currentEditGroupId = gId;
  document.getElementById("groupFormTitle").textContent = "✏️ تعديل قروب";
  document.getElementById("groupFormName").value = getGroups()[gId].name;
  document.getElementById("groupFormStatus").innerHTML = "";
  document.getElementById("groupFormModal").classList.add("active");
}

function closeGroupForm() {
  document.getElementById("groupFormModal").classList.remove("active");
}

function saveGroup() {
  const name = document.getElementById("groupFormName").value.trim();
  const statusDiv = document.getElementById("groupFormStatus");
  
  if (!name) { statusDiv.innerHTML = `<div class="alert danger">❌ اسم القروب مطلوب</div>`; return; }
  
  if (!state.groups) state.groups = JSON.parse(JSON.stringify(getGroups()));
  
  if (currentEditGroupId) {
    state.groups[currentEditGroupId].name = name;
  } else {
    const existingIds = Object.keys(state.groups).map(Number);
    const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    state.groups[newId] = { name: name, members: [] };
  }
  
  saveState();
  statusDiv.innerHTML = `<div class="alert success">✅ تم الحفظ بنجاح</div>`;
  renderGroupsList();
  populateGroupDropdown();
  setTimeout(() => { closeGroupForm(); }, 800);
}

function deleteGroup(gId) {
  if (!confirm(`هل أنت متأكد من حذف القروب؟`)) return;
  if (!state.groups) state.groups = JSON.parse(JSON.stringify(getGroups()));
  delete state.groups[gId];
  if (state.employees) {
    state.employees.forEach(e => {
      if (e.group == gId) e.group = null;
    });
  }
  saveState();
  renderGroupsList();
  populateGroupDropdown();
}

/* ============================================================
   10. عرض الروتيشن
   ============================================================ */
function renderRotationView() {
  const container = document.getElementById("rotationView");
  const months = generateRotationTimeline(6);
  let html = "";
  months.forEach((r, i) => {
    html += `<div class="rotation-view-card ${i === 0 ? 'current' : ''}">
      <div class="month-name">${r.displayName}</div>
      <div class="shift-line">🌙 مسائي: <b>${r.evening.join(" - ")}</b></div>
      <div class="shift-line">⭐ ليلي: <b>${r.night.join(" - ")}</b></div>
      <div class="shift-line">📅 ويكند: <b>${r.weekendMorning.join(" - ")}</b></div>
    </div>`;
  });
  container.innerHTML = html;
}

let currentEditMonthIdx = 0;

function renderMonthSelector() {
  const rot = getActiveRotation();
  const container = document.getElementById("monthSelector");
  const monthNames = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  let html = "";
  rot.forEach((r, idx) => {
    const displayName = `${monthNames[r.monthNum - 1]} ${r.year}`;
    html += `<div class="month-btn ${idx === currentEditMonthIdx ? 'active' : ''}" onclick="selectEditMonth(${idx})">${displayName}</div>`;
  });
  container.innerHTML = html;
  renderMonthEditPanels();
}

function selectEditMonth(idx) {
  currentEditMonthIdx = idx;
  renderMonthSelector();
}

function renderMonthEditPanels() {
  const rot = getActiveRotation();
  const container = document.getElementById("monthEditPanels");
  const monthNames = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  const candidateEmps = getEmployees().filter(e => !e.noLeave && e.role === "فني");
  
  let html = "";
  rot.forEach((r, idx) => {
    const displayName = `${monthNames[r.monthNum - 1]} ${r.year}`;
    html += `<div class="month-edit-panel ${idx === currentEditMonthIdx ? 'active' : ''}" id="monthPanel_${idx}">
      <h4 style="color:#1a3a5c; text-align:center;">📅 ${displayName}</h4>
      
      <div class="shift-edit-box">
        <div class="shift-title" style="color:#e67e22;">🌙 المسائي (اختر 2 بالضبط):</div>
        <div class="checkbox-grid">
          ${candidateEmps.map(e => {
            const shortName = e.name.split(" ")[0];
            const checked = r.evening.some(n => e.name.includes(n));
            return `<label><input type="checkbox" class="evening_${idx}" value="${shortName}" ${checked ? 'checked' : ''}> ${e.name}</label>`;
          }).join("")}
        </div>
      </div>
      
      <div class="shift-edit-box">
        <div class="shift-title" style="color:#8e44ad;">⭐ الليلي (اختر 2 بالضبط):</div>
        <div class="checkbox-grid">
          ${candidateEmps.map(e => {
            const shortName = e.name.split(" ")[0];
            const checked = r.night.some(n => e.name.includes(n));
            return `<label><input type="checkbox" class="night_${idx}" value="${shortName}" ${checked ? 'checked' : ''}> ${e.name}</label>`;
          }).join("")}
        </div>
      </div>
      
      <div class="shift-edit-box">
        <div class="shift-title" style="color:#27ae60;">📅 صباح الويكند (اختر 2 بالضبط):</div>
        <div class="checkbox-grid">
          ${candidateEmps.map(e => {
            const shortName = e.name.split(" ")[0];
            const checked = r.weekendMorning.some(n => e.name.includes(n));
            return `<label><input type="checkbox" class="weekend_${idx}" value="${shortName}" ${checked ? 'checked' : ''}> ${e.name}</label>`;
          }).join("")}
        </div>
      </div>
    </div>`;
  });
  container.innerHTML = html;
}

function saveRotationEdits() {
  const rot = getActiveRotation();
  const statusDiv = document.getElementById("rotationEditStatus");
  const newRot = [];
  
  for (let idx = 0; idx < rot.length; idx++) {
    const evening = Array.from(document.querySelectorAll(`.evening_${idx}:checked`)).map(c => c.value);
    const night = Array.from(document.querySelectorAll(`.night_${idx}:checked`)).map(c => c.value);
    const weekend = Array.from(document.querySelectorAll(`.weekend_${idx}:checked`)).map(c => c.value);
    
    if (evening.length !== 2) { statusDiv.innerHTML = `<div class="alert danger">❌ ${rot[idx].month}: يجب اختيار 2 للمسائي</div>`; return; }
    if (night.length !== 2) { statusDiv.innerHTML = `<div class="alert danger">❌ ${rot[idx].month}: يجب اختيار 2 لليلي</div>`; return; }
    if (weekend.length !== 2) { statusDiv.innerHTML = `<div class="alert danger">❌ ${rot[idx].month}: يجب اختيار 2 لصباح الويكند</div>`; return; }
    
    newRot.push({ ...rot[idx], evening, night, weekendMorning: weekend });
  }
  
  state.customRotation = newRot;
  saveState();
  statusDiv.innerHTML = `<div class="alert success">✅ تم الحفظ بنجاح.</div>`;
  renderRotationView();
  renderMonthSelector();
  setTimeout(() => { statusDiv.innerHTML = ""; }, 3000);
}

function resetRotationToDefault() {
  if (!confirm("استعادة الروتيشن الافتراضي؟")) return;
  state.customRotation = null;
  saveState();
  currentEditMonthIdx = 0;
  renderRotationView();
  renderMonthSelector();
  document.getElementById("rotationEditStatus").innerHTML = `<div class="alert success">✅ تم استعادة الروتيشن الافتراضي.</div>`;
  setTimeout(() => { document.getElementById("rotationEditStatus").innerHTML = ""; }, 3000);
}

/* ============================================================
   11. رفع الجداول
   ============================================================ */
let detectedNewEmployees = [];
let detectedNewSections = [];

function extractMonthFromFilename(filename) {
  const match = filename.match(/_(\d{1,2})-(\d{4})/);
  if (match) {
    const month = parseInt(match[1]);
    const year = parseInt(match[2]);
    if (month >= 1 && month <= 12 && year >= 2020 && year <= 2100) {
      return { year, month };
    }
  }
  return null;
}

async function handleScheduleUpload(event) {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;
  
  detectedNewEmployees = [];
  detectedNewSections = [];
  
  let successCount = 0;
  let failCount = 0;
  let messages = [];
  
  for (const file of files) {
    const result = await processFile(file);
    if (result.success) {
      successCount++;
      messages.push(`✅ ${file.name}: ${result.msg}`);
    } else {
      failCount++;
      messages.push(`❌ ${file.name}: ${result.msg}`);
    }
  }
  
  saveState();
  setStatus("success", `<b>تم رفع ${successCount} من ${files.length} ملفات:</b><br>${messages.join("<br>")}`);
  renderUploadedSchedules();
  renderSettingsSchedules();
  updateSummary();
  updateDateLimits();
  
  if (detectedNewEmployees.length > 0 || detectedNewSections.length > 0) {
    showNewDetected();
  }
  
  event.target.value = "";
}

function processFile(file) {
  return new Promise((resolve) => {
    const fileName = file.name.toLowerCase();
    const monthInfo = extractMonthFromFilename(file.name);
    
    if (!monthInfo) {
      resolve({ success: false, msg: "لم يتم التعرف على الشهر من اسم الملف (النمط: _MM-YYYY)" });
      return;
    }
    
    if (fileName.endsWith(".csv") || fileName.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = e => {
        const result = parseAndSaveCSV(e.target.result, monthInfo, file.name);
        resolve(result);
      };
      reader.readAsText(file, "UTF-8");
    } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const csv = XLSX.utils.sheet_to_csv(firstSheet, { FS: "," });
          const result = parseAndSaveCSV(csv, monthInfo, file.name);
          resolve(result);
        } catch (err) {
          resolve({ success: false, msg: "فشل قراءة Excel: " + err.message });
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      resolve({ success: false, msg: "صيغة غير مدعومة" });
    }
  });
}

function parseAndSaveCSV(text, monthInfo, fileName) {
  text = text.replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { success: false, msg: "الملف فارغ" };

  const headers = lines[0].split(",").map(h => h.trim());
  const dayCols = [];
  headers.forEach((h, i) => {
    const n = parseInt(h);
    if (!isNaN(n) && i >= 3) dayCols.push({ index: i, day: n });
  });

  if (dayCols.length === 0) return { success: false, msg: "لم يتم العثور على أعمدة الأيام" };

  const { year, month } = monthInfo;
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;

  const newSchedule = {};
  dayCols.forEach(dc => {
    const key = `${year}-${String(month).padStart(2, '0')}-${String(dc.day).padStart(2, '0')}`;
    newSchedule[key] = {};
    Object.keys(getSections()).forEach(s => newSchedule[key][s] = []);
  });

  const emps = getEmployees();
  const sections = getSections();
  let matched = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map(c => c.trim());
    if (cols.length < 3) continue;
    const csvName = cols[0];
    const csvJobNo = cols[1];
    const csvSection = cols[2];
    const csvId = csvJobNo.replace(/^0+/, "");

    let emp = emps.find(e =>
      e.csvId === csvJobNo || e.csvId.replace(/^0+/, "") === csvId ||
      e.id === csvJobNo || e.id.replace(/^0+/, "") === csvId ||
      e.name === csvName
    );

    if (!emp) {
      if (!detectedNewEmployees.find(d => d.jobNo === csvJobNo)) {
        detectedNewEmployees.push({ name: csvName, jobNo: csvJobNo, section: csvSection });
      }
      continue;
    }
    matched++;

    let sectionKey = emp.section;
    if (!sections[sectionKey]) {
      let candidate = null;
      if (csvSection.includes("CHEM") && csvSection.includes("VIRO")) candidate = "CHEM/VIRO/HERMONE";
      else if (csvSection.includes("B/B") || csvSection.includes("HEMA")) candidate = "BB/HEMA";
      else if (csvSection.includes("MICRO")) candidate = "MICRO/PARA";
      else if (csvSection.includes("REC")) candidate = "CHEM/REC";
      
      if (!candidate || !sections[candidate]) {
        if (!detectedNewSections.find(s => s.name === csvSection)) {
          detectedNewSections.push({ name: csvSection, min: 1 });
        }
        continue;
      }
      sectionKey = candidate;
    }

    dayCols.forEach(dc => {
      const val = (cols[dc.index] || "").toUpperCase().trim();
      const key = `${year}-${String(month).padStart(2, '0')}-${String(dc.day).padStart(2, '0')}`;
      if (val === "M" || val === "E" || val === "N") {
        if (!newSchedule[key][sectionKey].includes(emp.csvId)) {
          newSchedule[key][sectionKey].push(emp.csvId);
        }
      }
    });
  }

  state.schedules[monthKey] = {
    data: newSchedule,
    uploadedAt: new Date().toISOString(),
    fileName: fileName,
    matched: matched,
    total: lines.length - 1
  };

  return { success: true, msg: `${formatArabicDate(monthKey + "-01")} (${matched} موظف، ${dayCols.length} يوم)` };
}

function setStatus(type, msg) {
  const el = document.getElementById("scheduleStatus");
  if (el) el.innerHTML = `<div class="alert ${type}">${msg}</div>`;
}

function loadSampleSchedule() {
  const year = 2026, month = 11;
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  const daysInMonth = new Date(year, month, 0).getDate();
  
  const newSchedule = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    newSchedule[key] = {};
    Object.keys(getSections()).forEach(s => newSchedule[key][s] = []);
  }
  
  const rot = findRotationForMonth(year, month);
  
  getEmployees().forEach(emp => {
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dow = new Date(year, month - 1, d).getDay();
      const isWeekend = (dow === 5 || dow === 6);
      let val = "M";
      if (rot.evening.some(n => emp.name.includes(n))) val = isWeekend ? "O" : "E";
      else if (rot.night.some(n => emp.name.includes(n))) val = isWeekend ? "O" : "N";
      else if (isWeekend && rot.weekendMorning.some(n => emp.name.includes(n))) val = "M";
      else if (isWeekend) val = "O";
      else val = "M";
      
      if (val === "M" || val === "E" || val === "N") {
        if (!newSchedule[key][emp.section].includes(emp.csvId)) {
          newSchedule[key][emp.section].push(emp.csvId);
        }
      }
    }
  });
  
  state.schedules[monthKey] = {
    data: newSchedule,
    uploadedAt: new Date().toISOString(),
    fileName: "sample_11-2026",
    matched: getEmployees().length,
    total: getEmployees().length
  };
  
  saveState();
  updateDateLimits();
  setStatus("success", `✅ تم تحميل الجدول التجريبي (نوفمبر 2026)`);
  renderUploadedSchedules();
  renderSettingsSchedules();
  updateSummary();
}

function clearAllSchedules() {
  if (!confirm("مسح كل الجداول المرفوعة؟")) return;
  state.schedules = {};
  saveState();
  setStatus("warning", "🗑️ تم مسح كل الجداول");
  renderUploadedSchedules();
  renderSettingsSchedules();
  updateSummary();
  updateDateLimits();
}

function deleteSchedule(monthKey) {
  if (!confirm(`حذف جدول ${formatArabicDate(monthKey + "-01")}؟`)) return;
  delete state.schedules[monthKey];
  saveState();
  renderUploadedSchedules();
  renderSettingsSchedules();
  updateSummary();
  updateDateLimits();
}

function renderUploadedSchedules() {
  const container = document.getElementById("uploadedSchedulesList");
  if (!container) return;
  const keys = Object.keys(state.schedules).sort();
  if (keys.length === 0) {
    container.innerHTML = `<div class="no-schedules">لا توجد جداول مرفوعة بعد</div>`;
    return;
  }
  let html = "";
  keys.forEach(key => {
    const s = state.schedules[key];
    const daysCount = Object.keys(s.data).length;
    html += `<div class="schedule-item">
      <div class="schedule-info">
        <b>✅ ${formatArabicDate(key + "-01")}</b>
        <div class="meta">${daysCount} يوم | ${s.matched} موظف مطابق</div>
      </div>
      <div class="schedule-actions">
        <button class="small danger" onclick="deleteSchedule('${key}')">🗑️</button>
      </div>
    </div>`;
  });
  container.innerHTML = html;
}

function renderSettingsSchedules() {
  const container = document.getElementById("settingsSchedulesList");
  if (!container) return;
  const keys = Object.keys(state.schedules).sort();
  if (keys.length === 0) {
    container.innerHTML = `<p style="color:#999; text-align:center;">لا توجد جداول مرفوعة</p>`;
    return;
  }
  let html = "";
  keys.forEach(key => {
    const s = state.schedules[key];
    const daysCount = Object.keys(s.data).length;
    html += `<div class="schedule-item">
      <div class="schedule-info">
        <b>✅ ${formatArabicDate(key + "-01")}</b>
        <div class="meta">${daysCount} يوم | ${s.matched} موظف | ${s.fileName}</div>
      </div>
      <div class="schedule-actions">
        <button class="small danger" onclick="deleteSchedule('${key}')">🗑️ حذف</button>
      </div>
    </div>`;
  });
  container.innerHTML = html;
}

/* ============================================================
   12. حدود حقول التاريخ
   ============================================================ */
function updateDateLimits() {
  const keys = Object.keys(state.schedules).sort();
  const fromInput = document.getElementById("leaveFrom");
  const toInput = document.getElementById("leaveTo");
  if (!fromInput || !toInput) return;
  
  if (keys.length === 0) {
    fromInput.min = "";
    fromInput.max = "";
    toInput.min = "";
    toInput.max = "";
    return;
  }
  
  const firstKey = keys[0];
  const lastKey = keys[keys.length - 1];
  
  const [fy, fm] = firstKey.split("-").map(Number);
  const [ly, lm] = lastKey.split("-").map(Number);
  
  const firstDay = `${fy}-${String(fm).padStart(2, '0')}-01`;
  const lastDayOfLastMonth = new Date(ly, lm, 0).getDate();
  const lastDay = `${ly}-${String(lm).padStart(2, '0')}-${String(lastDayOfLastMonth).padStart(2, '0')}`;
  
  fromInput.min = firstDay;
  fromInput.max = lastDay;
  toInput.min = firstDay;
  toInput.max = lastDay;
}

/* ============================================================
   13. اكتشاف الموظفين الجدد
   ============================================================ */
function showNewDetected() {
  const content = document.getElementById("newDetectedContent");
  let html = "";
  
  if (detectedNewSections.length > 0) {
    html += `<h4 style="color:#1a3a5c;">📂 أقسام جديدة (${detectedNewSections.length}):</h4>`;
    detectedNewSections.forEach(s => {
      html += `<div class="new-emp-item"><b>${s.name}</b> - الحد الأدنى المقترح: ${s.min}</div>`;
    });
  }
  
  if (detectedNewEmployees.length > 0) {
    html += `<h4 style="color:#1a3a5c; margin-top:15px;">👥 موظفون جدد (${detectedNewEmployees.length}):</h4>`;
    detectedNewEmployees.forEach(e => {
      html += `<div class="new-emp-item"><b>${e.name}</b> - الرقم: ${e.jobNo} - القسم: ${e.section}</div>`;
    });
  }
  
  content.innerHTML = html;
  document.getElementById("newDetectedModal").classList.add("active");
}

function closeNewDetected() {
  document.getElementById("newDetectedModal").classList.remove("active");
  detectedNewEmployees = [];
  detectedNewSections = [];
}

function addAllDetected() {
  if (!state.sections) state.sections = JSON.parse(JSON.stringify(getSections()));
  if (!state.employees) state.employees = JSON.parse(JSON.stringify(getEmployees()));
  
  detectedNewSections.forEach(s => {
    state.sections[s.name] = { min: s.min };
  });
  
  detectedNewEmployees.forEach(e => {
    let sectionKey = e.section;
    let candidate = null;
    if (e.section.includes("CHEM") && e.section.includes("VIRO")) candidate = "CHEM/VIRO/HERMONE";
    else if (e.section.includes("B/B") || e.section.includes("HEMA")) candidate = "BB/HEMA";
    else if (e.section.includes("MICRO")) candidate = "MICRO/PARA";
    else if (e.section.includes("REC")) candidate = "CHEM/REC";
    
    if (candidate && state.sections[candidate]) sectionKey = candidate;
    else if (!state.sections[sectionKey]) {
      state.sections[sectionKey] = { min: 1 };
    }
    
    if (!state.employees.find(emp => emp.id === e.jobNo)) {
      state.employees.push({
        id: e.jobNo,
        csvId: e.jobNo.replace(/^0+/, ""),
        name: e.name,
        section: sectionKey,
        role: "فني",
        group: null
      });
    }
  });
  
  saveState();
  closeNewDetected();
  
  setStatus("success", "✅ تم إضافة العناصر الجديدة. الرجاء إعادة رفع الجداول لتطبيقها.");
  populateLeaveEmpDropdown();
  populateFilterSectionDropdown();
  renderEmployeesList();
  renderSectionsList();
}

/* ============================================================
   14. عرض الموظفين
   ============================================================ */
function populateLeaveEmpDropdown() {
  const sel = document.getElementById("leaveEmp");
  if (!sel) return;
  sel.innerHTML = "";
  getEmployees().forEach(e => {
    if (e.noLeave) return;
    const o1 = document.createElement("option");
    o1.value = e.id; o1.textContent = `${e.name} (${e.section})`;
    sel.appendChild(o1);
  });
}

function populateFilterSectionDropdown() {
  const sel = document.getElementById("filterSection");
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = `<option value="all">الكل</option>`;
  Object.keys(getSections()).forEach(s => {
    const opt = document.createElement("option");
    opt.value = s; opt.textContent = s;
    sel.appendChild(opt);
  });
  sel.value = current || "all";
}

function getEmpStatus(emp) {
  if (emp.noLeave) return { text: "—", color: "blue" };
  if (emp.fixedMorning) return { text: "صباحي ثابت", color: "green" };
  if (emp.group) return { text: getGroups()[emp.group]?.name || "قروب", color: "purple" };
  return { text: "عادي", color: "blue" };
}

function renderEmployees() {
  const filter = document.getElementById("filterSection").value;
  const tbody = document.querySelector("#empTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  getEmployees().filter(e => filter === "all" || e.section === filter).forEach((emp, i) => {
    const remEm = emp.noLeave ? "—" : getRemainingEmergency(emp.id);
    const remAn = emp.noLeave ? "—" : getRemainingAnnual(emp.id);
    const status = getEmpStatus(emp);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i+1}</td>
      <td style="text-align:right; cursor:pointer; color:#2c5282; font-weight:600;" onclick="showEmpDetails('${emp.id}')">${emp.name} 👁️</td>
      <td>${emp.section}</td>
      <td><span class="badge ${status.color}">${status.text}</span></td>
      <td>${emp.noLeave ? '—' : `<span class="badge ${remEm > 2 ? 'green' : 'yellow'}">${remEm}</span>`}</td>
      <td>${emp.noLeave ? '—' : `<span class="badge ${remAn > 10 ? 'green' : remAn > 5 ? 'yellow' : 'red'}">${remAn}</span>`}</td>
      <td>${emp.noLeave ? '' : `<button class="small" onclick="quickLeave('${emp.id}')">📝 طلب</button>`}</td>`;
    tbody.appendChild(tr);
  });
}

function showEmpDetails(empId) {
  const emp = getEmployees().find(e => e.id === empId);
  if (!emp) return;
  const remEm = getRemainingEmergency(empId);
  const remAn = getRemainingAnnual(empId);
  const usedEm = getUsedEmergency(empId);
  const usedAn = getUsedAnnual(empId);
  const empLeaves = state.leaveLog.filter(l => l.empId === empId);

  let html = `
    <h3>👤 ${emp.name}</h3>
    <p><b>الرقم الوظيفي:</b> ${emp.id} | <b>القسم:</b> ${emp.section} | <b>الدور:</b> ${emp.role}</p>
    <div class="summary-grid">
      <div class="summary-item"><div class="value" style="color:#e67e22;">${remEm}</div><div class="label">اضطرارية متبقية</div></div>
      <div class="summary-item"><div class="value" style="color:#2c5282;">${remAn}</div><div class="label">اعتيادية متبقية</div></div>
      <div class="summary-item"><div class="value" style="color:#e74c3c;">${usedEm}</div><div class="label">اضطرارية مستهلكة</div></div>
      <div class="summary-item"><div class="value" style="color:#c0392b;">${usedAn}</div><div class="label">اعتيادية مستهلكة</div></div>
    </div>
    <h4 style="color:#1a3a5c;">📋 سجل الإجازات (${empLeaves.length})</h4>
  `;
  if (empLeaves.length === 0) {
    html += `<p style="color:#999;">لا توجد إجازات مسجلة</p>`;
  } else {
    html += `<table><thead><tr><th>النوع</th><th>من</th><th>إلى</th><th>الأيام</th><th>المغطي</th></tr></thead><tbody>`;
    empLeaves.forEach(l => {
      html += `<tr><td>${l.type}</td><td>${l.from}</td><td>${l.to}</td><td>${l.days}</td><td>${l.coverName}</td></tr>`;
    });
    html += `</tbody></table>`;
  }
  document.getElementById("modalContent").innerHTML = html;
  document.getElementById("empModal").classList.add("active");
}

function closeModal() { document.getElementById("empModal").classList.remove("active"); }

/* ============================================================
   15. ملخص الفترة
   ============================================================ */
function updateDateSummary() {
  const from = document.getElementById("leaveFrom").value;
  const to = document.getElementById("leaveTo").value;
  const summary = document.getElementById("dateSummary");
  if (!summary) return;
  
  if (from && to) {
    const d1 = parseLocalDate(from);
    const d2 = parseLocalDate(to);
    if (!d1 || !d2) {
      summary.classList.remove("active");
      return;
    }
    if (d1 > d2) {
      summary.innerHTML = `<b style="color:#e74c3c;">⚠️ تاريخ البداية بعد النهاية</b>`;
      summary.classList.add("active");
      return;
    }
    const days = Math.round((d2 - d1) / (1000*60*60*24)) + 1;
    summary.innerHTML = `📅 <b>${formatArabicDate(from)}</b> → <b>${formatArabicDate(to)}</b> &nbsp;|&nbsp; المدة: <b>${days} يوم</b>`;
    summary.classList.add("active");
  } else {
    summary.classList.remove("active");
  }
}

/* ============================================================
   16. الفحص التلقائي
   ============================================================ */
function getScheduleForDate(dateKey) {
  const monthKey = dateKey.substring(0, 7);
  return state.schedules[monthKey] ? state.schedules[monthKey].data : null;
}

function checkDayForEmp(emp, dateKey) {
  const dayData = getScheduleForDate(dateKey);
  if (!dayData || !dayData[dateKey]) {
    return { allowed: false, reason: `لا يوجد جدول لشهر ${dateKey.substring(0, 7)}`, requiresCover: false, shiftType: null };
  }
  
  const day = dayData[dateKey];
  const d = parseLocalDate(dateKey);
  const dow = d.getDay();
  const isWeekend = (dow === 5 || dow === 6);

  let shiftType = null;
  let shiftCount = 0;
  const sections = getSections();

  for (const sec of Object.keys(day)) {
    if (day[sec] && day[sec].includes(emp.csvId)) {
      const month = parseInt(dateKey.split("-")[1]);
      const year = parseInt(dateKey.split("-")[0]);
      const rot = findRotationForMonth(year, month);
      if (rot) {
        if (rot.evening.some(n => emp.name.includes(n))) {
          shiftType = "E";
          shiftCount = day[sec].filter(id => {
            const e = getEmployees().find(x => x.csvId === id);
            return e && rot.evening.some(n => e.name.includes(n));
          }).length;
        } else if (rot.night.some(n => emp.name.includes(n))) {
          shiftType = "N";
          shiftCount = day[sec].filter(id => {
            const e = getEmployees().find(x => x.csvId === id);
            return e && rot.night.some(n => e.name.includes(n));
          }).length;
        } else if (isWeekend && rot.weekendMorning.some(n => emp.name.includes(n))) {
          shiftType = "WE";
          shiftCount = day[sec].filter(id => {
            const e = getEmployees().find(x => x.csvId === id);
            return e && rot.weekendMorning.some(n => e.name.includes(n));
          }).length;
        } else {
          shiftType = "M";
          shiftCount = day[sec].length;
        }
      }
    }
  }

  if (!shiftType) return { allowed: true, reason: "يوم راحة (O)", requiresCover: false, shiftType: null };

  if (shiftType === "E" || shiftType === "N" || shiftType === "WE") {
    if (shiftCount >= 2) {
      return { allowed: true, reason: `يوجد ${shiftCount} في ${getShiftName(shiftType)} - يُسمح مع إقرار`, requiresCover: true, shiftType };
    } else {
      return { allowed: false, reason: `يوجد ${shiftCount} فقط في ${getShiftName(shiftType)}`, requiresCover: false, shiftType };
    }
  }

  const min = sections[emp.section]?.min || 1;
  const morningCount = day[emp.section] ? day[emp.section].length : 0;
  if (morningCount - 1 < min) {
    return { allowed: false, reason: `القسم سيصبح ${morningCount - 1} (الحد الأدنى ${min})`, requiresCover: true, shiftType };
  } else if (morningCount - 1 === min) {
    return { allowed: true, reason: `القسم على الحد الأدنى (${min})`, requiresCover: true, shiftType };
  }
  return { allowed: true, reason: `القسم كافٍ (${morningCount - 1} من ${min})`, requiresCover: false, shiftType };
}

function getShiftName(type) {
  if (type === "E") return "المسائي";
  if (type === "N") return "الليلي";
  if (type === "WE") return "ويكند الصباح";
  return "الصباحي";
}

/* ============================================================
   17. فحص طلب الإجازة
   ============================================================ */
function simulateLeave() {
  const result = document.getElementById("leaveResult");
  if (!result) return;
  
  try {
    if (Object.keys(state.schedules).length === 0) {
      result.innerHTML = `<div class="alert danger">⚠️ يجب رفع الجداول أولاً</div>`;
      return;
    }

    const empId = document.getElementById("leaveEmp").value;
    const type = document.getElementById("leaveType").value;
    const from = document.getElementById("leaveFrom").value;
    const to = document.getElementById("leaveTo").value;
    const emp = getEmployees().find(e => e.id === empId);

    if (!emp) { result.innerHTML = `<div class="alert danger">⚠️ الموظف غير موجود</div>`; return; }
    if (emp.noLeave) { result.innerHTML = `<div class="alert danger">⚠️ لا تنطبق عليه إجازات الفنيين</div>`; return; }
    if (!from || !to) { result.innerHTML = `<div class="alert danger">⚠️ حدد الفترة (من وإلى)</div>`; return; }

    const d1 = parseLocalDate(from);
    const d2 = parseLocalDate(to);

    if (!d1 || !d2) { result.innerHTML = `<div class="alert danger">⚠️ صيغة التاريخ غير صحيحة</div>`; return; }
    if (d1 > d2) { result.innerHTML = `<div class="alert danger">⚠️ تاريخ البداية بعد النهاية</div>`; return; }

    const days = Math.round((d2 - d1) / (1000*60*60*24)) + 1;

    const avail = type === "emergency" ? getRemainingEmergency(empId) : getRemainingAnnual(empId);
    if (avail < days) {
      result.innerHTML = `<div class="alert danger">❌ رصيد ${type === "emergency" ? "الاضطرارية" : "الاعتيادية"} غير كافٍ.<br>المتاح: <b>${avail}</b> | المطلوب: <b>${days}</b></div>`;
      return;
    }
    if (type === "annual" && days > 15) {
      result.innerHTML = `<div class="alert danger">❌ لا يمكن طلب أكثر من <b>15 يوماً</b> اعتيادياً في الطلب الأول.<br>المطلوب: <b>${days}</b> يوم.</div>`;
      return;
    }

    let current = new Date(d1.getTime());
    let dayResults = [];
    let blockedDays = [];
    let safeDays = [];
    let safetyCounter = 0;
    
    while (current <= d2 && safetyCounter < 100) {
      safetyCounter++;
      const key = formatLocalDate(current);
      const check = checkDayForEmp(emp, key);
      dayResults.push({ date: key, ...check });
      if (!check.allowed) blockedDays.push({ date: key, ...check });
      else safeDays.push({ date: key, ...check });
      current.setDate(current.getDate() + 1);
    }

    const sameSectionOnLeave = state.leaveLog.filter(log => {
      if (log.empId === emp.id) return false;
      const otherEmp = getEmployees().find(e => e.id === log.empId);
      if (!otherEmp || otherEmp.section !== emp.section) return false;
      const lf = parseLocalDate(log.from), lt = parseLocalDate(log.to);
      if (!lf || !lt) return false;
      return (d1 <= lt && d2 >= lf);
    });

    if (sameSectionOnLeave.length >= MAX_ON_LEAVE_PER_SECTION) {
      result.innerHTML = `<div class="alert danger">❌ يوجد موظف من نفس القسم في إجازة:<br><b>${sameSectionOnLeave.map(l => l.empName + " (" + l.from + " → " + l.to + ")").join("<br>")}</b></div>`;
      return;
    }

    const requiresCover = dayResults.some(d => d.requiresCover && d.allowed);

    let html = `<div class="alert ${blockedDays.length > 0 ? 'danger' : (requiresCover ? 'warning' : 'success')}">`;
    html += `<b>الموظف:</b> ${emp.name}<br>`;
    html += `<b>القسم:</b> ${emp.section}<br>`;
    html += `<b>النوع:</b> ${type === "emergency" ? "اضطرارية" : "اعتيادية"}<br>`;
    html += `<b>المدة:</b> ${days} يوم (${formatArabicDate(from)} → ${formatArabicDate(to)})<br><br>`;

    if (blockedDays.length > 0) {
      html += `<b>🔴 أيام ممنوعة (${blockedDays.length}):</b><br>`;
      blockedDays.slice(0, 10).forEach(d => { html += `• ${d.date} → ${d.reason}<br>`; });
      if (blockedDays.length > 10) html += `<i>... و ${blockedDays.length - 10} يوم</i><br>`;
      html += `<br><b>الحل:</b> اختر تواريخ لا تشمل الأيام الممنوعة.`;
    } else if (requiresCover) {
      html += `<b>🟡 الإجازة ممكنة مع إقرار تعهد.</b><br><b>الأسباب:</b><br>`;
      dayResults.filter(d => d.requiresCover).slice(0, 5).forEach(d => { html += `• ${d.date} → ${d.reason}<br>`; });
    } else {
      html += `<b>✅ الإجازة آمنة تماماً.</b>`;
    }
    html += `</div>`;

    if (blockedDays.length > 0 && safeDays.length > 0) {
      html += `<div class="safe-days"><b>📅 الأيام الآمنة في نفس الفترة (${safeDays.length}):</b><br>${safeDays.slice(0, 15).map(d => `<span class="day-tag">${d.date}</span>`).join("")}</div>`;
    }

    if (blockedDays.length === 0) {
      if (requiresCover) {
        const coverEmps = getEmployees().filter(e => e.id !== emp.id && e.section === emp.section && e.role !== "مرجع طبي + جودة");
        if (coverEmps.length === 0) {
          html += `<div class="alert danger">⚠️ لا يوجد موظف بديل في نفس القسم لتغطية الإجازة.</div>`;
        } else {
          html += `<div class="row">
            <label style="width:100%;">المغطي: <select id="coverEmp">${coverEmps.map(e => `<option value="${e.id}">${e.name}</option>`).join("")}</select></label>
            <button class="warning" onclick="printCoverForm('${emp.id}', document.getElementById('coverEmp').value, '${from}', '${to}')" style="width:100%;">🖨️ طباعة إقرار التعهد</button>
            <button class="success" onclick="approveLeave('${emp.id}', '${type}', '${from}', '${to}', ${days}, document.getElementById('coverEmp').value)" style="width:100%;">✅ اعتماد مع الإقرار</button>
          </div>`;
        }
      } else {
        html += `<div class="row"><button class="success" onclick="approveLeave('${emp.id}', '${type}', '${from}', '${to}', ${days}, '')" style="width:100%;">✅ اعتماد الإجازة</button></div>`;
      }
    } else {
      html += `<div class="alert info">💡 يمكنك تعديل التواريخ لتصبح ضمن الأيام الآمنة.</div>`;
    }

    result.innerHTML = html;
  } catch (err) {
    console.error("خطأ في simulateLeave:", err);
    result.innerHTML = `<div class="alert danger">
      ❌ حدث خطأ غير متوقع:<br>
      <b>${err.message}</b>
    </div>`;
  }
}

function approveLeave(empId, type, from, to, days, coverId) {
  const emp = getEmployees().find(e => e.id === empId);
  const cover = coverId ? getEmployees().find(e => e.id === coverId) : null;
  if (type === "emergency") state.usedEmergency[empId] = getUsedEmergency(empId) + days;
  else state.usedAnnual[empId] = getUsedAnnual(empId) + days;
  state.leaveLog.push({
    empId: emp.id, empName: emp.name, section: emp.section,
    type: type === "emergency" ? "اضطرارية" : "اعتيادية",
    from, to, days,
    coverName: cover ? cover.name : "—", coverId: cover ? cover.id : "",
    status: cover ? "معتمد بتعهد" : "معتمد",
    date: new Date().toLocaleDateString("ar-SA"), year: state.year
  });
  saveState();
  renderEmployees();
  renderLog();
  updateSummary();
  document.getElementById("leaveResult").innerHTML = `<div class="alert success">✅ تم اعتماد الإجازة من ${formatArabicDate(from)} إلى ${formatArabicDate(to)}</div>`;
}

/* ============================================================
   18. سجل الإجازات
   ============================================================ */
function renderLog() {
  const tbody = document.querySelector("#logTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  if (state.leaveLog.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="color:#999; padding:20px;">لا توجد إجازات معتمدة</td></tr>`;
    return;
  }
  state.leaveLog.forEach((log, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i+1}</td>
      <td style="text-align:right;">${log.empName}</td>
      <td><span class="badge ${log.type === 'اضطرارية' ? 'yellow' : 'blue'}">${log.type}</span></td>
      <td>${log.from}</td>
      <td>${log.to}</td>
      <td>${log.days}</td>
      <td>${log.coverName}</td>
      <td><span class="badge green">${log.status}</span></td>
      <td><button class="small danger" onclick="cancelLeave(${i})">إلغاء</button></td>`;
    tbody.appendChild(tr);
  });
}

function cancelLeave(index) {
  const log = state.leaveLog[index];
  if (log.type === "اضطرارية") state.usedEmergency[log.empId] = getUsedEmergency(log.empId) - log.days;
  else state.usedAnnual[log.empId] = getUsedAnnual(log.empId) - log.days;
  state.leaveLog.splice(index, 1);
  saveState();
  renderEmployees();
  renderLog();
  updateSummary();
}

function clearLog() {
  if (!confirm("مسح كل السجل؟")) return;
  state.leaveLog.forEach(log => {
    if (log.type === "اضطرارية") state.usedEmergency[log.empId] = getUsedEmergency(log.empId) - log.days;
    else state.usedAnnual[log.empId] = getUsedAnnual(log.empId) - log.days;
  });
  state.leaveLog = [];
  saveState();
  renderEmployees();
  renderLog();
  updateSummary();
}

/* ============================================================
   19. تصدير
   ============================================================ */
function exportAll() {
  let csv = "الاسم,القسم,النوع,من,إلى,الأيام,المغطي,الحالة,السنة\n";
  state.leaveLog.forEach(l => {
    csv += `"${l.empName}","${l.section}","${l.type}","${l.from}","${l.to}",${l.days},"${l.coverName}","${l.status}",${l.year || state.year}\n`;
  });
  csv += "\n\nملخص الأرصدة\n";
  csv += "الاسم,الرقم الوظيفي,القسم,اضطرارية مستهلكة,اضطرارية متبقية,اعتيادية مستهلكة,اعتيادية متبقية\n";
  getEmployees().forEach(e => {
    if (e.noLeave) return;
    csv += `"${e.name}","${e.id}","${e.section}",${getUsedEmergency(e.id)},${getRemainingEmergency(e.id)},${getUsedAnnual(e.id)},${getRemainingAnnual(e.id)}\n`;
  });
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `LabLeave_Report_${state.year}.csv`;
  link.click();
}

/* ============================================================
   20. سنة جديدة + أرشيف
   ============================================================ */
function startNewYear() {
  if (!confirm(`بدء سنة جديدة (${state.year + 1})؟`)) return;
  state.archive.push({
    year: state.year,
    leaveLog: JSON.parse(JSON.stringify(state.leaveLog)),
    usedEmergency: JSON.parse(JSON.stringify(state.usedEmergency)),
    usedAnnual: JSON.parse(JSON.stringify(state.usedAnnual))
  });
  state.year++;
  state.usedEmergency = {};
  state.usedAnnual = {};
  state.leaveLog = [];
  saveState();
  renderEmployees();
  renderLog();
  updateSummary();
  alert(`✅ تم بدء سنة ${state.year}`);
}

function openArchive() {
  let html = "";
  if (state.archive.length === 0) html = `<p style="color:#999;">لا يوجد أرشيف.</p>`;
  else {
    state.archive.forEach((arc, i) => {
      html += `<div style="background:#f8fafc; padding:15px; border-radius:10px; margin-bottom:12px;">
        <h4 style="margin:0 0 8px; color:#1a3a5c;">📅 سنة ${arc.year} (${arc.leaveLog.length} إجازة)</h4>
        <button class="small" onclick="exportArchive(${i})">📤 تصدير</button>
        <button class="small danger" onclick="deleteArchive(${i})">🗑️ حذف</button>
      </div>`;
    });
  }
  document.getElementById("archiveContent").innerHTML = html;
  document.getElementById("archiveModal").classList.add("active");
}

function closeArchive() { document.getElementById("archiveModal").classList.remove("active"); }

function exportArchive(index) {
  const arc = state.archive[index];
  let csv = `أرشيف سنة ${arc.year}\n`;
  csv += "الاسم,النوع,من,إلى,الأيام,المغطي,الحالة\n";
  arc.leaveLog.forEach(l => {
    csv += `"${l.empName}","${l.type}","${l.from}","${l.to}",${l.days},"${l.coverName}","${l.status}"\n`;
  });
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Archive_${arc.year}.csv`;
  link.click();
}

function deleteArchive(index) {
  if (!confirm("حذف هذا الأرشيف؟")) return;
  state.archive.splice(index, 1);
  saveState();
  openArchive();
}

/* ============================================================
   21. طباعة الإقرار (من الإعدادات - اختياري)
   ============================================================ */
function printManualCover() {
  const empId = document.getElementById("manualEmp").value;
  const coverId = document.getElementById("manualCover").value;
  const from = document.getElementById("manualFrom").value;
  const to = document.getElementById("manualTo").value;
  const notes = document.getElementById("manualNotes").value;
  const statusDiv = document.getElementById("manualCoverStatus");
  
  if (!empId || !coverId) { statusDiv.innerHTML = `<div class="alert danger">❌ اختر الموظفين</div>`; return; }
  if (empId === coverId) { statusDiv.innerHTML = `<div class="alert danger">❌ لا يمكن أن يكون نفس الموظف</div>`; return; }
  if (!from || !to) { statusDiv.innerHTML = `<div class="alert danger">❌ حدد التواريخ</div>`; return; }
  
  const emp = getEmployees().find(e => e.id === empId);
  const cover = getEmployees().find(e => e.id === coverId);
  
  openPrintWindow(emp, cover, from, to, notes);
  statusDiv.innerHTML = `<div class="alert success">✅ تم فتح نافذة الطباعة</div>`;
  setTimeout(() => { statusDiv.innerHTML = ""; }, 3000);
}

/* ============================================================
   22. طباعة الإقرار (من طلب الإجازة)
   ============================================================ */
function printCoverForm(empId, coverId, from, to) {
  const emp = getEmployees().find(e => e.id === empId);
  const cover = getEmployees().find(e => e.id === coverId);
  if (!cover) { alert("اختر المغطي"); return; }
  openPrintWindow(emp, cover, from, to, "");
}

function openPrintWindow(emp, cover, from, to, notes) {
  const today = new Date().toLocaleDateString("ar-SA");
  const logoPath = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '') + '/logo.svg';
  
  const printWindow = window.open("", "_blank", "width=900,height=1100");
  if (!printWindow) { alert("الرجاء السماح بالنوافذ المنبثقة"); return; }
  
  const notesSection = notes ? `<div class="field"><b>ملاحظات:</b> ${notes}</div>` : "";
  
  const content = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>إقرار وتعهد تغطية عمل</title>
<style>
  @page { size: A4; margin: 15mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 20px; line-height: 2; color: #000; margin: 0; }
  .form { border: 2px solid #000; padding: 30px; max-width: 800px; margin: auto; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1a3a5c; padding-bottom: 15px; margin-bottom: 20px; }
  .logo { width: 110px; height: auto; }
  .title-center { text-align: center; flex: 1; padding: 0 15px; }
  .title-center h1 { margin: 0; font-size: 20px; color: #1a3a5c; }
  .title-center h2 { margin: 3px 0; font-size: 15px; color: #333; font-weight: normal; }
  .title-center p { margin: 3px 0; font-size: 13px; color: #555; }
  .info-box { text-align: left; font-size: 12px; color: #555; min-width: 120px; }
  .form-title { text-align: center; font-size: 22px; margin: 25px 0 20px; padding-bottom: 8px; border-bottom: 2px solid #000; }
  .field { margin: 18px 0; font-size: 15px; }
  .line { border-bottom: 1px dotted #000; display: inline-block; min-width: 200px; padding: 0 8px; }
  .signatures { display: flex; justify-content: space-between; margin-top: 70px; gap: 15px; }
  .signatures > div { text-align: center; flex: 1; font-size: 14px; }
  .signatures b { display: block; margin-bottom: 25px; font-size: 15px; }
  .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #555; }
</style>
</head>
<body>
  <div class="form">
    <div class="header">
      <img src="${logoPath}" class="logo" alt="شعار" onerror="this.style.display='none';">
      <div class="title-center">
        <h1>المملكة العربية السعودية</h1>
        <h2>وزارة الصحة - تجمع عسير الصحي</h2>
        <h2>مستشفى سبت العلايا العام</h2>
        <p>قسم المختبر وبنك الدم</p>
      </div>
      <div class="info-box">
        <div>التاريخ: ${today}</div>
        <div>الرقم: ..........</div>
      </div>
    </div>
    
    <h1 class="form-title">إقرار وتعهد تغطية عمل</h1>
    
    <div class="field">أقر أنا / <span class="line">${cover.name}</span> (الرقم الوظيفي: ${cover.id})</div>
    <div class="field">بأنني أتعهد بتغطية عمل زميلي / <span class="line">${emp.name}</span> (الرقم الوظيفي: ${emp.id})</div>
    <div class="field">خلال فترة إجازته من <span class="line">${from}</span> إلى <span class="line">${to}</span></div>
    <div class="field">في قسم: <span class="line">${emp.section}</span></div>
    ${notesSection}
    <div class="field">على أن أتحمل كامل المسؤولية عن سير العمل في القسم خلال هذه الفترة.</div>
    <div class="field">وهذا إقرار مني بذلك.</div>
    
    <div class="signatures">
      <div>
        <b>الموظف صاحب الإجازة</b>
        الاسم: ${emp.name}<br><br>
        التوقيع: ....................
      </div>
      <div>
        <b>الموظف المغطي</b>
        الاسم: ${cover.name}<br><br>
        التوقيع: ....................
      </div>
      <div>
        <b>مشرف الفنيين</b>
        الاسم: بدر محمد القرني<br><br>
        التوقيع: ....................
      </div>
    </div>
    
    <div class="footer">
      نسخة: ملف الموظف - نسخة: قسم المختبر - نسخة: الموارد البشرية
    </div>
  </div>
  
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 700);
    };
  <\/script>
</body>
</html>`;
  
  printWindow.document.write(content);
  printWindow.document.close();
}

/* ============================================================
   23. التهيئة
   ============================================================ */
function init() {
  loadState();
  
  if (!state.sections) state.sections = JSON.parse(JSON.stringify(DEFAULT_SECTIONS));
  if (!state.employees) state.employees = JSON.parse(JSON.stringify(DEFAULT_EMPLOYEES));
  if (!state.groups) state.groups = JSON.parse(JSON.stringify(DEFAULT_GROUPS));
  if (!state.schedules) state.schedules = {};
  
  saveState();
  
  populateLeaveEmpDropdown();
  populateFilterSectionDropdown();
  renderEmployees();
  renderLog();
  renderUploadedSchedules();
  updateSummary();
  updateDateLimits();
  
  // ضبط تواريخ افتراضية = اليوم
  const today = formatLocalDate(new Date());
  const leaveFrom = document.getElementById("leaveFrom");
  const leaveTo = document.getElementById("leaveTo");
  if (leaveFrom && !leaveFrom.value) leaveFrom.value = today;
  if (leaveTo && !leaveTo.value) leaveTo.value = today;
}

function quickLeave(id) {
  document.getElementById("leaveEmp").value = id;
  document.querySelectorAll(".card")[2].scrollIntoView({behavior:"smooth"});
}

function updateSummary() {
  const empSet = new Set();
  Object.values(state.schedules).forEach(s => {
    Object.values(s.data).forEach(day => {
      Object.values(day).forEach(arr => arr.forEach(id => empSet.add(id)));
    });
  });
  const monthsCount = Object.keys(state.schedules).length;
  const el = document.getElementById("logSummary");
  if (!el) return;
  el.innerHTML = `
    <div class="summary-grid">
      <div class="summary-item"><div class="value">${monthsCount}</div><div class="label">جداول مرفوعة</div></div>
      <div class="summary-item"><div class="value">${empSet.size}</div><div class="label">موظفون في الجداول</div></div>
      <div class="summary-item"><div class="value">${state.leaveLog.length}</div><div class="label">إجازات معتمدة</div></div>
    </div>
  `;
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) e.target.classList.remove("active");
});

init();
