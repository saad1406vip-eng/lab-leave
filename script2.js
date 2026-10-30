/* ============================================================
   script2.js - الجزء الثاني: رفع الجداول واكتشاف الجديد
   ============================================================ */

let detectedNewEmployees = [];
let detectedNewSections = [];

function extractMonthFromFilename(filename) {
  const name = filename.replace(/\.(csv|txt|xlsx|xls)$/i, '');
  const patterns = [
    /_(\d{1,2})-(\d{4})/, /_(\d{1,2})_(\d{4})/, /_(\d{1,2})\.(\d{4})/,
    /(\d{1,2})-(\d{4})/, /(\d{1,2})_(\d{4})/, /(\d{1,2})\.(\d{4})/,
    /(\d{4})-(\d{1,2})/, /(\d{4})_(\d{1,2})/
  ];
  
  for (const pattern of patterns) {
    const match = name.match(pattern);
    if (match) {
      let month = parseInt(match[1]);
      let year = parseInt(match[2]);
      if (month > 12 && year <= 12) [month, year] = [year, month];
      if (month >= 1 && month <= 12 && year >= 2020 && year <= 2100) {
        return { year, month };
      }
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
  let messages = [];
  
  for (const file of files) {
    const result = await processFile(file);
    if (result.success) {
      successCount++;
      messages.push(`✅ ${file.name}: ${result.msg}`);
    } else {
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
      resolve({ success: false, msg: "لم يتم التعرف على الشهر (مثال: Laboratory_Schedule_11-2026.csv)" });
      return;
    }
    
    if (fileName.endsWith(".csv") || fileName.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const result = parseAndSaveCSV(e.target.result, monthInfo, file.name);
          resolve(result);
        } catch (err) {
          resolve({ success: false, msg: "خطأ: " + err.message });
        }
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
          resolve({ success: false, msg: "فشل Excel: " + err.message });
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      resolve({ success: false, msg: "صيغة غير مدعومة" });
    }
  });
}

function parseAndSaveCSV(text, monthInfo, fileName) {
  if (!monthInfo || !monthInfo.year || !monthInfo.month) {
    return { success: false, msg: "بيانات الشهر غير صحيحة" };
  }
  
  const year = monthInfo.year;
  const month = monthInfo.month;
  
  text = text.replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { success: false, msg: "الملف فارغ" };

  const firstLine = lines[0];
  let separator = ",";
  if (firstLine.split(";").length > firstLine.split(",").length) separator = ";";
  if (firstLine.split("\t").length > firstLine.split(separator).length) separator = "\t";

  const headers = lines[0].split(separator).map(h => h.trim().replace(/^"|"$/g, ''));
  const dayCols = [];
  headers.forEach((h, i) => {
    const n = parseInt(h);
    if (!isNaN(n) && i >= 3) dayCols.push({ index: i, day: n });
  });

  if (dayCols.length === 0) return { success: false, msg: "لم يتم العثور على أعمدة الأيام" };

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
    const cols = lines[i].split(separator).map(c => c.trim().replace(/^"|"$/g, ''));
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
      if (["M", "E", "N", "R1", "R2", "R3", "R4"].includes(val)) {
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
      if (rot && rot.evening && rot.evening.some(n => emp.name.includes(n))) val = isWeekend ? "O" : "E";
      else if (rot && rot.night && rot.night.some(n => emp.name.includes(n))) val = isWeekend ? "O" : "N";
      else if (isWeekend && rot && rot.weekendMorning && rot.weekendMorning.some(n => emp.name.includes(n))) val = "M";
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

function updateDateLimits() {
  const keys = Object.keys(state.schedules).sort();
  const fromInput = document.getElementById("leaveFrom");
  const toInput = document.getElementById("leaveTo");
  if (!fromInput || !toInput) return;
  
  if (keys.length === 0) {
    fromInput.min = ""; fromInput.max = "";
    toInput.min = ""; toInput.max = "";
    return;
  }
  
  const firstKey = keys[0];
  const lastKey = keys[keys.length - 1];
  const [fy, fm] = firstKey.split("-").map(Number);
  const [ly, lm] = lastKey.split("-").map(Number);
  
  const firstDay = `${fy}-${String(fm).padStart(2, '0')}-01`;
  const lastDayOfLastMonth = new Date(ly, lm, 0).getDate();
  const lastDay = `${ly}-${String(lm).padStart(2, '0')}-${String(lastDayOfLastMonth).padStart(2, '0')}`;
  
  fromInput.min = firstDay; fromInput.max = lastDay;
  toInput.min = firstDay; toInput.max = lastDay;
}

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
