/* ============================================================
   script2.js - الفحص + الإجازات + الطباعة + التهيئة
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

function updateDateSummary() {
  const from = document.getElementById("leaveFrom").value;
  const to = document.getElementById("leaveTo").value;
  const summary = document.getElementById("dateSummary");
  if (!summary) return;
  
  if (from && to) {
    const d1 = parseLocalDate(from);
    const d2 = parseLocalDate(to);
    if (!d1 || !d2) { summary.classList.remove("active"); return; }
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
  if (!d) return { allowed: false, reason: "تاريخ غير صحيح", requiresCover: false, shiftType: null };
  const dow = d.getDay();
  const isWeekend = (dow === 5 || dow === 6);

  let foundSection = null;
  for (const sec of Object.keys(day)) {
    if (day[sec] && day[sec].includes(emp.csvId)) {
      foundSection = sec;
      break;
    }
  }

  if (!foundSection) {
    return { allowed: true, reason: "يوم راحة (O)", requiresCover: false, shiftType: null };
  }

  const month = parseInt(dateKey.split("-")[1]);
  const year = parseInt(dateKey.split("-")[0]);
  const rot = findRotationForMonth(year, month);

  let shiftType = "M";
  let shiftCount = 0;

  if (rot && rot.evening && rot.evening.some(n => emp.name.includes(n))) {
    shiftType = "E";
    shiftCount = day[foundSection].filter(id => {
      const e = getEmployees().find(x => x.csvId === id);
      return e && rot.evening.some(n => e.name.includes(n));
    }).length;
  } else if (rot && rot.night && rot.night.some(n => emp.name.includes(n))) {
    shiftType = "N";
    shiftCount = day[foundSection].filter(id => {
      const e = getEmployees().find(x => x.csvId === id);
      return e && rot.night.some(n => e.name.includes(n));
    }).length;
  } else if (isWeekend && rot && rot.weekendMorning && rot.weekendMorning.some(n => emp.name.includes(n))) {
    shiftType = "WE";
    shiftCount = day[foundSection].filter(id => {
      const e = getEmployees().find(x => x.csvId === id);
      return e && rot.weekendMorning.some(n => e.name.includes(n));
    }).length;
  } else {
    shiftType = "M";
    shiftCount = day[foundSection].length;
  }

  if (shiftType === "E" || shiftType === "N" || shiftType === "WE") {
    if (shiftCount >= 2) {
      return { allowed: true, reason: `يوجد ${shiftCount} في ${getShiftName(shiftType)} - يُسمح مع إقرار`, requiresCover: true, shiftType };
    } else {
      return { allowed: false, reason: `يوجد ${shiftCount} فقط في ${getShiftName(shiftType)} - لا يمكن التغطية`, requiresCover: false, shiftType };
    }
  }

  const min = getSections()[emp.section]?.min || 1;
  const morningCount = day[emp.section] ? day[emp.section].length : 0;
  
  if (morningCount - 1 < min) {
    return { allowed: false, reason: `القسم سيصبح ${morningCount - 1} (الحد الأدنى ${min})`, requiresCover: true, shiftType };
  } else if (morningCount - 1 === min) {
    return { allowed: true, reason: `القسم على الحد الأدنى (${min}) - يُسمح مع إقرار`, requiresCover: true, shiftType };
  }
  return { allowed: true, reason: `القسم كافٍ (${morningCount - 1} من ${min})`, requiresCover: false, shiftType };
}

function getShiftName(type) {
  if (type === "E") return "المسائي";
  if (type === "N") return "الليلي";
  if (type === "WE") return "ويكند الصباح";
  if (type === "R1") return "R1 (رمضان صباحي)";
  if (type === "R2") return "R2 (رمضان ذروة عصرية)";
  if (type === "R3") return "R3 (رمضان ذروة ليلية)";
  if (type === "R4") return "R4 (رمضان ليلي)";
  return "الصباحي";
}

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
          html += `<div class="alert danger">⚠️ لا يوجد موظف بديل في نفس القسم.</div>`;
        } else {
          html += `<div class="row">
            <label style="width:100%;">المغطي: <select id="coverEmp">${coverEmps.map(e => `<option value="${e.id}">${e.name}</option>`).join("")}</select></label>
            <button class="warning" onclick="printCoverForm('${emp.id}', document.getElementById('coverEmp').value, '${from}', '${to}')" style="width:100%;">🖨️ طباعة إقرار</button>
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
    console.error("خطأ:", err);
    result.innerHTML = `<div class="alert danger">❌ خطأ: <b>${err.message}</b></div>`;
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
      <div><b>الموظف صاحب الإجازة</b>الاسم: ${emp.name}<br><br>التوقيع: ....................</div>
      <div><b>الموظف المغطي</b>الاسم: ${cover.name}<br><br>التوقيع: ....................</div>
      <div><b>مشرف الفنيين</b>الاسم: بدر محمد القرني<br><br>التوقيع: ....................</div>
    </div>
    
    <div class="footer">نسخة: ملف الموظف - نسخة: قسم المختبر - نسخة: الموارد البشرية</div>
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
