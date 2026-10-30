/* ============================================================
   script4.js - الجزء الرابع والأخير: العرض والتهيئة الأولية
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

function closeModal() { 
  document.getElementById("empModal").classList.remove("active"); 
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

// ====== التهيئة الأولية عند تحميل الصفحة ======
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
  
  const today = formatLocalDate(new Date());
  const leaveFrom = document.getElementById("leaveFrom");
  const leaveTo = document.getElementById("leaveTo");
  if (leaveFrom && !leaveFrom.value) leaveFrom.value = today;
  if (leaveTo && !leaveTo.value) leaveTo.value = today;
}

// إغلاق النوافذ عند النقر خارجها
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) e.target.classList.remove("active");
});

// تشغيل التطبيق
window.addEventListener("DOMContentLoaded", init);
