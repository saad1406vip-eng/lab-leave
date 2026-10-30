/* ============================================================
   script1.js - الجزء الأول: البيانات، الإعدادات، الروتيشن
   ============================================================ */

/* ===== 1. دوال التاريخ ===== */
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
  let match = str.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if (match) {
    const d = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    if (!isNaN(d.getTime())) return d;
  }
  match = str.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
  if (match) {
    const d = new Date(parseInt(match[3]), parseInt(match[1]) - 1, parseInt(match[2]));
    if (!isNaN(d.getTime())) return d;
  }
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

/* ===== 2. البيانات الافتراضية ===== */
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

/* ===== 3. الحالة ===== */
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

const STORAGE_KEY = "labLeaveState_v10";

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

/* ===== 4. الروتيشن ===== */
function generateRotationTimeline(count = 6) {
  const START_YEAR = 2026;
  const START_MONTH = 10;
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  if (year < START_YEAR || (year === START_YEAR && month < START_MONTH)) {
    year = START_YEAR; month = START_MONTH;
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
  const monthsSinceStart = (year - START_YEAR) * 12 + (monthNum - START_MONTH);
  const cycleIdx = ((monthsSinceStart % rot.length) + rot.length) % rot.length;
  return rot[cycleIdx];
}

/* ===== 5. الإعدادات ===== */
function openSettings() {
  document.getElementById("settingsModal").classList.add("active");
  renderEmployeesList();
  renderSectionsList();
  renderGroupsList();
  renderSettingsSchedules();
  renderRotationView();
  renderMonthSelector();
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

/* ===== 6. إدارة الموظفين ===== */
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

/* ===== 7. إدارة الأقسام ===== */
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

/* ===== 8. إدارة القروبات ===== */
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

/* ===== 9. عرض الروتيشن ===== */
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
