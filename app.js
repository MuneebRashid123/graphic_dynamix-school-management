const navButtons = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".view");
const breadcrumbCurrent = document.getElementById("breadcrumbCurrent");
const sidebar = document.getElementById("sidebar");
const toast = document.getElementById("toast");
let toastTimer;

const viewTitles = {
  overview: "Overview",
  schools: "Schools",
  subscriptions: "Subscriptions",
  invoices: "Invoices",
  payments: "Payments",
  plans: "Plans & pricing",
  customer: "My subscription",
  "customer-invoices": "Invoices & payments",
  "user-accounts": "Staff accounts"
};

function showView(name) {
  const target = document.getElementById(`view-${name}`);
  if (!target) return;
  views.forEach(view => view.classList.toggle("active", view === target));
  navButtons.forEach(button => button.classList.toggle("active", button.dataset.view === name));
  breadcrumbCurrent.textContent = viewTitles[name] || "Overview";
  sidebar.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

navButtons.forEach(button => button.addEventListener("click", () => showView(button.dataset.view)));
document.querySelectorAll("[data-view-go]").forEach(button => {
  button.addEventListener("click", () => showView(button.dataset.viewGo));
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

document.querySelectorAll("[data-toast]").forEach(button => {
  button.addEventListener("click", () => showToast(button.dataset.toast));
});

document.getElementById("mobileMenu").addEventListener("click", () => sidebar.classList.toggle("open"));
document.getElementById("profileSwitch").addEventListener("click", () => {
  if (document.body.classList.contains("school-portal-mode")) {
    showToast("School accounts cannot access Graphic Dynamix administration.");
  } else showToast("Use “Open School Portal” to preview a school workspace.");
});

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.hidden = false;
}
function closeModal(modal) {
  if (modal) modal.hidden = true;
}
document.getElementById("openSchoolModal").addEventListener("click", () => openModal("schoolModal"));
document.querySelectorAll("[data-close-modal]").forEach(button => {
  button.addEventListener("click", () => closeModal(button.closest(".modal-backdrop")));
});
document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
  backdrop.addEventListener("click", event => {
    if (event.target === backdrop) closeModal(backdrop);
  });
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") document.querySelectorAll(".modal-backdrop").forEach(closeModal);
});

const demoSchools = [
  { id: "GD-SCH-001", name: "Al Noor Public School", email: "admin@alnoor.example", phone: "0300 0000001", plan: "Standard", billing: "Monthly", status: "Active" },
  { id: "GD-SCH-002", name: "Bright Star Academy", email: "office@brightstar.example", phone: "0300 0000002", plan: "Standard", billing: "Monthly", status: "Active" },
  { id: "GD-SCH-003", name: "Greenfield School", email: "accounts@greenfield.example", phone: "0300 0000003", plan: "Professional", billing: "Yearly", status: "Payment pending" }
];
let createdSchools = [];
let activeSchool = demoSchools[0];
let activeRole = "admin";
const schoolForm = document.getElementById("schoolForm");
function allSchools() { return [...demoSchools, ...createdSchools]; }
function renderLoginSchools() {
  const select = document.getElementById("loginSchool");
  if (!select) return;
  const selected = select.value;
  select.innerHTML = allSchools().map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join("");
  if (allSchools().some(s => s.id === selected)) select.value = selected;
  if (!select.value && allSchools().length) select.value = allSchools()[0].id;
}
function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char])); }
function renderSchoolRow(school) {
  const tbody = document.querySelector("#schoolsTable tbody");
  if (!tbody) return;
  const row = document.createElement("tr"); row.dataset.status = school.status || "Active";
  const initials = school.name.split(/\s+/).slice(0,2).map(word => word[0] || "").join("").toUpperCase();
  row.innerHTML = `<td><div class="school-cell"><span class="school-logo logo-orange">${escapeHtml(initials)}</span><span><strong>${escapeHtml(school.name)}</strong><small>${escapeHtml(school.id)}</small></span></div></td><td>${escapeHtml(school.phone || "—")}</td><td>${escapeHtml(school.plan)}</td><td>${escapeHtml(school.billing)}</td><td>Not set</td><td><span class="status active-status">Active</span></td><td><button class="small-button open-school-row" type="button">Open portal</button></td>`;
  row.querySelector(".open-school-row").addEventListener("click", () => { activeSchool = school; switchInterface("school"); });
  tbody.prepend(row);
}
schoolForm.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(event.target);
  const school = {
    id: `GD-SCH-${String(allSchools().length + 1).padStart(3,"0")}`,
    name: data.get("schoolName").trim(), contact: data.get("contactPerson").trim(),
    email: data.get("schoolEmail").trim().toLowerCase(), phone: data.get("schoolPhone").trim(),
    plan: data.get("plan"), billing: data.get("billing"), status: "Active"
  };
  if (allSchools().some(item => item.email.toLowerCase() === school.email)) {
    showToast("A demo school already uses that email. Please enter a different email."); return;
  }
  createdSchools.push(school);
  try { localStorage.setItem("gd-demo-schools", JSON.stringify(createdSchools)); } catch (_) {}
  renderSchoolRow(school); renderLoginSchools();
  closeModal(document.getElementById("schoolModal")); event.target.reset();
  document.getElementById("loginSchool").value = school.id;
  document.getElementById("loginRole").value = "school-admin"; updateLoginRole();
  document.getElementById("loginEmail").value = school.email;
  showToast(`School created in this browser demo. Demo password: Demo123!`);
  document.getElementById("schoolCredentialNotice")?.remove();
  const notice = document.createElement("p"); notice.id = "schoolCredentialNotice"; notice.className = "modal-note";
  notice.textContent = `Demo login for ${school.name}: ${school.email} · password Demo123! — demo only, not a secure account.`;
  document.querySelector("#schoolModal .modal-card").appendChild(notice);
});

document.getElementById("openPaymentModal").addEventListener("click", () => openModal("paymentModal"));
document.getElementById("quickPaymentForm").addEventListener("submit", event => {
  event.preventDefault();
  closeModal(document.getElementById("paymentModal"));
  event.target.reset();
  showToast("Preview only: payment submission was not saved or verified.");
});
document.getElementById("paymentForm").addEventListener("submit", event => {
  event.preventDefault();
  event.target.reset();
  showToast("Preview only: connect Supabase to securely submit payment details.");
});

document.querySelectorAll("[data-approve]").forEach(button => {
  button.addEventListener("click", () => {
    showToast("Review only: verify the actual bank receipt before approving. No payment was changed.");
  });
});

document.querySelectorAll("[data-search-table]").forEach(input => {
  input.addEventListener("input", () => {
    const table = document.getElementById(input.dataset.searchTable);
    if (!table) return;
    const query = input.value.trim().toLowerCase();
    table.querySelectorAll("tbody tr").forEach(row => {
      row.hidden = !row.textContent.toLowerCase().includes(query);
    });
  });
});

const schoolSearch = document.getElementById("schoolSearch");
const schoolFilter = document.getElementById("schoolFilter");
function filterSchools() {
  const query = (schoolSearch.value || "").trim().toLowerCase();
  const status = schoolFilter.value;
  document.querySelectorAll("#schoolsTable tbody tr").forEach(row => {
    const matchesQuery = row.textContent.toLowerCase().includes(query);
    const matchesStatus = status === "all" || row.dataset.status === status;
    row.hidden = !(matchesQuery && matchesStatus);
  });
}
schoolSearch.addEventListener("input", filterSchools);
schoolFilter.addEventListener("change", filterSchools);

document.querySelectorAll("[data-filter-table]").forEach(select => {
  select.addEventListener("change", () => {
    const table = document.getElementById(select.dataset.filterTable);
    if (!table) return;
    table.querySelectorAll("tbody tr").forEach(row => {
      row.hidden = select.value !== "all" && row.dataset.status !== select.value;
    });
  });
});

document.querySelectorAll("[data-invoice-filter]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-invoice-filter]").forEach(item => item.classList.remove("selected"));
    button.classList.add("selected");
    const status = button.dataset.invoiceFilter;
    document.querySelectorAll("#invoicesTable tbody tr").forEach(row => {
      row.hidden = status !== "all" && row.dataset.status !== status;
    });
  });
});

document.querySelectorAll("[data-plan-period]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-plan-period]").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    const yearly = button.dataset.planPeriod === "yearly";
    document.querySelectorAll(".plan-price strong").forEach(price => {
      price.textContent = `₨ ${yearly ? price.dataset.yearly : price.dataset.monthly}`;
    });
    document.querySelectorAll(".plan-period").forEach(period => {
      period.textContent = yearly ? "/ year" : "/ month";
    });
  });
});

document.querySelectorAll("[data-edit-plan]").forEach(button => {
  button.addEventListener("click", () => showToast(`${button.dataset.editPlan} plan editing will be connected to the database later.`));
});
document.getElementById("newPlan").addEventListener("click", () => showToast("Plan creation is a UI preview. Database connection will be added later."));
document.getElementById("generateInvoice").addEventListener("click", () => showToast("Invoice generation will be implemented after the database is connected."));

// School-management prototype interactions (sample data only; no backend connected).
Object.assign(viewTitles, {
  students: "Students", teachers: "Teachers & staff", attendance: "Attendance", fees: "Fees",
  classes: "Classes", exams: "Exams & results", reports: "Reports"
});

document.querySelectorAll("[data-open-form]").forEach(button => {
  button.addEventListener("click", () => {
    const panel = document.getElementById(button.dataset.openForm);
    if (panel) { panel.classList.remove("hidden-panel"); panel.scrollIntoView({ behavior: "smooth", block: "start" }); }
  });
});
document.querySelectorAll("[data-close-panel]").forEach(button => {
  button.addEventListener("click", () => document.getElementById(button.dataset.closePanel)?.classList.add("hidden-panel"));
});

const attendanceClass = document.getElementById("attendanceClass");
const attendanceRows = document.getElementById("attendanceRows");
const attendanceDate = document.getElementById("attendanceDate");
if (attendanceDate) attendanceDate.value = new Date().toISOString().slice(0, 10);
function updateAttendanceSummary() {
  if (!attendanceRows) return;
  const visible = [...attendanceRows.querySelectorAll("tr")].filter(row => !row.hidden);
  const present = visible.filter(row => row.querySelector("select")?.value === "Present").length;
  document.getElementById("presentCount").textContent = present;
  document.getElementById("absentCount").textContent = visible.length - present;
  document.getElementById("attendanceTotal").textContent = visible.length;
  const rate = visible.length ? Math.round(present / visible.length * 100) : 0;
  const report = document.getElementById("reportAttendance");
  if (report) report.textContent = rate + "%";
}
function filterAttendanceClass() {
  if (!attendanceRows) return;
  attendanceRows.querySelectorAll("tr").forEach(row => { row.hidden = row.dataset.class !== attendanceClass.value; });
  updateAttendanceSummary();
}
attendanceClass?.addEventListener("change", filterAttendanceClass);
attendanceRows?.addEventListener("change", updateAttendanceSummary);
filterAttendanceClass();
document.getElementById("markAllPresent")?.addEventListener("click", () => {
  [...attendanceRows.querySelectorAll("tr")].filter(row => !row.hidden).forEach(row => row.querySelector("select").value = "Present");
  updateAttendanceSummary(); showToast("All visible students marked present in this preview.");
});
document.getElementById("saveAttendance")?.addEventListener("click", () => {
  updateAttendanceSummary(); showToast(`Attendance preview updated for ${attendanceDate.value}. It has not been saved to a database.`);
});

document.getElementById("studentForm")?.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(event.target);
  const row = document.createElement("tr");
  row.innerHTML = `<td></td><td><strong></strong></td><td></td><td></td><td></td><td><span class="status active-status">Active</span></td>`;
  const cells = row.querySelectorAll("td");
  cells[0].textContent = data.get("rollNo"); cells[1].querySelector("strong").textContent = data.get("studentName");
  cells[2].textContent = data.get("studentClass"); cells[3].textContent = data.get("guardian"); cells[4].textContent = data.get("phone") || "—";
  document.getElementById("studentsRows").appendChild(row);
  document.getElementById("studentCount").textContent = document.querySelectorAll("#studentsRows tr").length;
  document.getElementById("reportStudents").textContent = document.getElementById("studentCount").textContent;
  event.target.reset(); document.getElementById("studentFormPanel").classList.add("hidden-panel"); showToast("Sample student added to this page only.");
});
document.getElementById("teacherForm")?.addEventListener("submit", event => {
  event.preventDefault(); const data = new FormData(event.target); const row = document.createElement("tr");
  row.innerHTML = `<td></td><td><strong></strong></td><td></td><td></td><td><span class="status pending-status">Not marked</span></td>`;
  const cells = row.querySelectorAll("td"); cells[0].textContent = data.get("staffId"); cells[1].querySelector("strong").textContent = data.get("teacherName"); cells[2].textContent = data.get("role"); cells[3].textContent = data.get("phone") || "—";
  document.getElementById("teachersRows").appendChild(row); document.getElementById("teacherCount").textContent = document.querySelectorAll("#teachersRows tr").length;
  event.target.reset(); document.getElementById("teacherFormPanel").classList.add("hidden-panel"); showToast("Sample teacher added to this page only.");
});
function updateFeesSummary() {
  const rows = [...document.querySelectorAll("#feesTable tbody tr")];
  const paid = rows.filter(row => row.querySelector(".fee-status .status")?.textContent === "Paid").length;
  document.getElementById("feesCollected").textContent = "₨ " + (paid * 10000).toLocaleString("en-US");
  document.getElementById("feesUnpaid").textContent = rows.length - paid;
  document.getElementById("reportFees").textContent = Math.round(paid / Math.max(rows.length, 1) * 100) + "%";
}
document.getElementById("feesTable")?.addEventListener("click", event => {
  const button = event.target.closest(".toggle-fee"); if (!button) return;
  const status = button.closest("tr").querySelector(".fee-status .status");
  const paid = status.textContent.trim() === "Paid";
  status.textContent = paid ? "Unpaid" : "Paid"; status.className = "status " + (paid ? "pending-status" : "active-status");
  button.textContent = paid ? "Mark paid" : "Mark unpaid"; updateFeesSummary();
});
document.getElementById("resetFees")?.addEventListener("click", () => {
  document.querySelectorAll("#feesTable tbody tr").forEach((row, i) => {
    const paid = i === 0 || i === 2; const status = row.querySelector(".fee-status .status");
    status.textContent = paid ? "Paid" : "Unpaid"; status.className = "status " + (paid ? "active-status" : "pending-status"); row.querySelector(".toggle-fee").textContent = paid ? "Mark unpaid" : "Mark paid";
  }); updateFeesSummary(); showToast("Demo fee records reset.");
});
document.getElementById("calculateResults")?.addEventListener("click", () => {
  document.querySelectorAll("#resultsTable tbody tr").forEach(row => {
    const marks = [...row.querySelectorAll(".mark-input")].map(input => Math.max(0, Math.min(100, Number(input.value) || 0)));
    const total = marks.reduce((sum, value) => sum + value, 0); const pct = total / 2;
    row.querySelector(".result-total").textContent = total; row.querySelector(".result-percent").textContent = pct + "%";
    const grade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : pct >= 50 ? "D" : "Fail";
    const gradeCell = row.querySelector(".result-grade"); gradeCell.innerHTML = `<span class="status ${pct >= 50 ? "active-status" : "overdue-status"}">${grade}</span>`;
  }); showToast("Results calculated from the marks shown.");
});
document.getElementById("downloadReport")?.addEventListener("click", () => {
  const csv = "Report,Value\nStudents," + document.getElementById("reportStudents").textContent + "\nAttendance," + document.getElementById("reportAttendance").textContent + "\nFee collection," + document.getElementById("reportFees").textContent + "\n";
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" }); const url = URL.createObjectURL(blob); const link = document.createElement("a");
  link.href = url; link.download = "graphic-dynamix-demo-report.csv"; link.click(); URL.revokeObjectURL(url);
});

// Expanded school-management screens from the supplied reference image.
Object.assign(viewTitles, {
  "school-home": "School Command Center", "student-management": "Student Management",
  "staff-management": "Staff Management", "fee-management": "Fee Management",
  finance: "Finance", "school-exams": "Exams", homework: "Homework",
  timetables: "Timetables", meetings: "Parents-Teachers Meeting", holidays: "Holidays",
  notifications: "Notifications", roles: "Roles & Permissions", events: "Events", settings: "Settings"
});

// Keep the nav and view collections current for all newly-added screens.
const expandedNavButtons = document.querySelectorAll(".nav-item");
expandedNavButtons.forEach(button => {
  button.addEventListener("click", () => showView(button.dataset.view));
});
document.querySelectorAll("[data-view-go]").forEach(button => {
  button.addEventListener("click", () => showView(button.dataset.viewGo));
});

document.querySelectorAll(".demo-add-form").forEach(form => {
  form.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(form);
    const tableBody = document.getElementById(form.dataset.targetTable);
    const row = document.createElement("tr");
    const values = [data.get("roll") || "NEW", data.get("name") || "New record", data.get("class") || "—", data.get("guardian") || "—"];
    if (form.dataset.targetTable === "staffManagementRows") values.push("Not marked", "Active");
    else values.push("—", "Active");
    values.forEach((value, index) => {
      const cell = document.createElement("td");
      if (index === 1) { const strong = document.createElement("strong"); strong.textContent = value; cell.appendChild(strong); }
      else cell.textContent = value;
      row.appendChild(cell);
    });
    if (form.dataset.targetTable === "studentManagementRows") row.cells[5].innerHTML = '<span class="status active-status">Active</span>';
    if (form.dataset.targetTable === "staffManagementRows") { row.cells[2].textContent = data.get("class") || "Teacher"; row.cells[3].textContent = data.get("guardian") || "—"; row.cells[4].textContent = "Not marked"; row.cells[5].innerHTML = '<span class="status active-status">Active</span>'; }
    tableBody.appendChild(row);
    form.reset();
    form.closest(".form-panel").classList.add("hidden-panel");
    showToast("Demo record added on this page only. It is not saved to a database.");
  });
});

document.querySelectorAll("[data-approval]").forEach(button => {
  button.addEventListener("click", () => {
    const row = button.closest(".approval-row");
    const action = button.dataset.approval;
    row.classList.add("approval-reviewed");
    row.querySelectorAll("button").forEach(item => item.disabled = true);
    const label = document.createElement("span");
    label.className = "status " + (action === "approve" ? "active-status" : "overdue-status");
    label.textContent = action === "approve" ? "Approved (demo)" : "Rejected (demo)";
    row.appendChild(label);
    const count = document.querySelectorAll(".approval-row:not(.approval-reviewed)").length;
    document.getElementById("approvalCount").textContent = `${count} Pending`;
    showToast(`Request ${action === "approve" ? "approved" : "rejected"} in this preview only.`);
  });
});

document.querySelectorAll(".ledger-toggle").forEach(button => {
  button.addEventListener("click", () => {
    const row = button.closest("tr");
    const status = row.querySelector(".status");
    const paid = status.textContent.trim() !== "Paid";
    status.textContent = paid ? "Paid" : "Pending";
    status.className = "status " + (paid ? "active-status" : "pending-status");
    row.dataset.feeStatus = paid ? "paid" : "pending";
    button.textContent = paid ? "Mark pending" : "Mark paid";
    const filter = document.getElementById("feeLedgerFilter");
    if (filter && filter.value !== "all") row.hidden = row.dataset.feeStatus !== filter.value;
    showToast("Fee status changed in this demo only.");
  });
});
document.getElementById("feeLedgerFilter")?.addEventListener("change", event => {
  document.querySelectorAll("#feeLedger tbody tr").forEach(row => row.hidden = event.target.value !== "all" && row.dataset.feeStatus !== event.target.value);
});
document.getElementById("saveSchoolSettings")?.addEventListener("click", () => showToast("Settings preview complete. Connect Supabase later to save settings permanently."));


// Local-only login demonstration. Replace with Supabase Auth + Row Level Security for production.
try { createdSchools = JSON.parse(localStorage.getItem("gd-demo-schools") || "[]"); } catch (_) { createdSchools = []; }
const loginRole = document.getElementById("loginRole");
const loginSchool = document.getElementById("loginSchool");
const loginSchoolLabel = document.getElementById("loginSchoolLabel");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginError = document.getElementById("loginError");
let demoStaffAccounts = [];
try { demoStaffAccounts = JSON.parse(localStorage.getItem("gd-demo-staff-accounts") || "[]"); } catch (_) { demoStaffAccounts = []; }
function renderStaffAccounts() {
  const tbody = document.querySelector("#staffAccountsTable tbody");
  if (!tbody) return;
  const schoolId = activeSchool?.id || "";
  const records = demoStaffAccounts.filter(account => account.schoolId === schoolId);
  document.getElementById("staffAccountsSchoolName").textContent = `${activeSchool?.name || "Selected school"} · ${records.length} account(s)`;
  tbody.innerHTML = records.length ? records.map(account => `<tr><td><strong>${escapeHtml(account.name)}</strong></td><td>${escapeHtml(account.email)}</td><td>${escapeHtml(account.role === "teacher" ? "Teacher" : "Accountant")}</td><td><code>${escapeHtml(account.password)}</code></td><td><button type="button" class="small-button remove-demo-account" data-account-id="${escapeHtml(account.id)}">Remove</button></td></tr>`).join("") : '<tr><td colspan="5">No staff accounts created for this school yet.</td></tr>';
  tbody.querySelectorAll(".remove-demo-account").forEach(button => button.addEventListener("click", () => {
    demoStaffAccounts = demoStaffAccounts.filter(account => account.id !== button.dataset.accountId);
    try { localStorage.setItem("gd-demo-staff-accounts", JSON.stringify(demoStaffAccounts)); } catch (_) {}
    renderStaffAccounts(); showToast("Demo account removed from this browser.");
  }));
}
document.getElementById("staffAccountForm")?.addEventListener("submit", event => {
  event.preventDefault();
  if (!activeSchool || activeRole !== "school-admin") { showToast("Only the School Admin can create staff accounts in this demo."); return; }
  const data = new FormData(event.currentTarget);
  const email = String(data.get("staffEmail")).trim().toLowerCase();
  if (demoStaffAccounts.some(account => account.schoolId === activeSchool.id && account.email === email)) { showToast("This email already has an account at this school."); return; }
  const account = { id: `ACC-${Date.now()}`, schoolId: activeSchool.id, name: String(data.get("staffName")).trim(), email, role: data.get("staffRole"), password: String(data.get("staffPassword")) };
  demoStaffAccounts.push(account);
  try { localStorage.setItem("gd-demo-staff-accounts", JSON.stringify(demoStaffAccounts)); } catch (_) {}
  event.currentTarget.reset(); renderStaffAccounts();
  showToast(`${account.role === "teacher" ? "Teacher" : "Accountant"} demo account created. Share the demo credentials securely.`);
});
document.getElementById("backFromAccounts")?.addEventListener("click", () => showView("school-home"));

function updateLoginRole() {
  const role = loginRole.value;
  const needsSchool = role !== "admin";
  loginSchool.hidden = !needsSchool; loginSchoolLabel.hidden = !needsSchool;
  renderLoginSchools();
  if (role === "admin") loginEmail.value = "admin@graphicdynamix.demo";
  else {
    const school = allSchools().find(item => item.id === loginSchool.value) || allSchools()[0];
    if (school) loginEmail.value = role === "teacher" ? `teacher@${school.id.toLowerCase()}.demo` : role === "accountant" ? `accounts@${school.id.toLowerCase()}.demo` : school.email;
  }
  loginPassword.value = "Demo123!"; loginError.hidden = true;
}
loginRole.addEventListener("change", updateLoginRole);
loginSchool.addEventListener("change", updateLoginRole);
document.getElementById("togglePassword").addEventListener("click", event => {
  loginPassword.type = loginPassword.type === "password" ? "text" : "password";
  event.currentTarget.textContent = loginPassword.type === "password" ? "Show" : "Hide";
});
document.getElementById("fillDemoLogin").addEventListener("click", updateLoginRole);
document.getElementById("loginForm").addEventListener("submit", event => {
  event.preventDefault();
  const role = loginRole.value; const email = loginEmail.value.trim().toLowerCase(); const password = loginPassword.value;
  if ((role === "admin" || role === "school-admin") && password !== "Demo123!") { loginError.textContent = "For the Graphic Dynamix / School Admin demo login, use password Demo123!. Staff demo accounts use the password created by the School Admin."; loginError.hidden = false; return; }
  if (role === "admin" && email !== "admin@graphicdynamix.demo") { loginError.textContent = "Use admin@graphicdynamix.demo for the Graphic Dynamix demo administrator."; loginError.hidden = false; return; }
  const school = allSchools().find(item => item.id === loginSchool.value) || allSchools()[0];
  if (role !== "admin" && !school) { loginError.textContent = "Create a school first, then select it here."; loginError.hidden = false; return; }
  if (role === "school-admin" && email !== school.email.toLowerCase()) { loginError.textContent = `Use the email assigned to ${school.name}.`; loginError.hidden = false; return; }
  if (role === "teacher" && email !== `teacher@${school.id.toLowerCase()}.demo`) { loginError.textContent = "Use the demo teacher email shown after selecting your school."; loginError.hidden = false; return; }
  if (role === "accountant" && email !== `accounts@${school.id.toLowerCase()}.demo`) { loginError.textContent = "Use the demo accountant email shown after selecting your school."; loginError.hidden = false; return; }
  if (role !== "admin" && role !== "school-admin") {
    const staffAccount = demoStaffAccounts.find(account => account.schoolId === school.id && account.email === email && account.role === role && account.password === password);
    if (!staffAccount) { loginError.textContent = "No matching staff demo account found for this school. Ask the School Admin to create your account."; loginError.hidden = false; return; }
  }
  activeRole = role; activeSchool = school;
  document.getElementById("loginScreen").hidden = true; document.getElementById("appShell").hidden = false; document.body.classList.remove("auth-required");
  if (role === "admin") { switchInterface("admin"); showToast("Signed in to Graphic Dynamix demo admin."); }
  else { switchInterface("school"); if (role === "teacher") showToast("Teacher demo: use attendance and assigned school screens."); if (role === "accountant") showToast("Accountant demo: use fee management for this school."); }
});
renderLoginSchools();
createdSchools.forEach(renderSchoolRow);
updateLoginRole();

// Preview switch between the Graphic Dynamix owner dashboard and a school's own workspace.
const schoolPortalViews = new Set([
  "school-home", "student-management", "staff-management", "fee-management", "finance",
  "school-exams", "homework", "timetables", "meetings", "holidays", "notifications",
  "roles", "events", "settings", "user-accounts"
]);
const adminViews = new Set(["overview", "schools", "subscriptions", "invoices", "payments", "plans", "customer", "customer-invoices", "students", "teachers", "attendance", "fees", "classes", "exams", "reports"]);
const interfaceSwitch = document.getElementById("interfaceSwitch");
function switchInterface(mode) {
  const schoolMode = mode === "school";
  document.body.classList.toggle("school-portal-mode", schoolMode);
  document.getElementById("brandTitle").textContent = schoolMode ? (activeSchool?.name || "School workspace") : "graphic dynamix";
  document.getElementById("brandSubtitle").textContent = schoolMode ? "SCHOOL PORTAL" : "SCHOOL SAAS · ADMIN";
  document.getElementById("profileName").textContent = schoolMode ? (activeRole === "teacher" ? "Teacher" : activeRole === "accountant" ? "Accountant" : "School Administrator") : "Graphic Dynamix";
  document.getElementById("profileRole").textContent = schoolMode ? (activeSchool?.name || "School workspace") : "Super administrator";
  document.getElementById("helpText").textContent = schoolMode ? "Manage your school's daily operations and records." : "Manage your schools and subscriptions with confidence.";
  interfaceSwitch.innerHTML = '<span class="switch-icon">↗</span><span class="switch-label">Open School Portal</span>';
  interfaceSwitch.hidden = schoolMode;
  document.body.dataset.activeSchoolId = schoolMode ? (activeSchool?.id || "") : "";
  document.body.dataset.activeRole = activeRole;
  document.querySelectorAll(".nav-item").forEach(button => {
    const name = button.dataset.view;
    let allowed = schoolMode ? schoolPortalViews.has(name) : adminViews.has(name);
    if (schoolMode && activeRole === "teacher") allowed = ["school-home", "attendance", "timetables", "homework", "notifications"].includes(name);
    if (schoolMode && activeRole === "accountant") allowed = ["school-home", "fee-management", "finance", "notifications"].includes(name);
    button.hidden = !allowed;
  });
  document.querySelectorAll(".nav-section-label").forEach(label => {
    label.hidden = schoolMode ? !label.textContent.includes("SCHOOL COMMAND CENTER") : label.textContent.includes("SCHOOL COMMAND CENTER");
  });
  document.querySelector(".workspace-label:not(.nav-section-label)").hidden = schoolMode;
  document.querySelector(".help-card strong").textContent = schoolMode ? "School workspace" : "Need a hand?";
  if (schoolMode) {
    // Demo tenant scope: persist each school's demo records under a unique key.
    // Real isolation must be enforced by Supabase Auth + RLS, not client-side code.
    window.GD_SCHOOL_SCOPE = {
      schoolId: activeSchool?.id || "",
      role: activeRole,
      storageKey: `gd-school-demo:${activeSchool?.id || "unknown"}`
    };
    renderStaffAccounts();
    showView(activeRole === "teacher" ? "attendance" : activeRole === "accountant" ? "fee-management" : "school-home");
    showToast(`${activeSchool?.name || "School"} workspace opened in demo mode.`);
  } else {
    showView("overview");
    showToast("Returned to the Graphic Dynamix administrator dashboard.");
  }
}
interfaceSwitch?.addEventListener("click", () => { if (!document.body.classList.contains("school-portal-mode") && activeRole === "admin") { activeSchool = allSchools()[0]; switchInterface("school"); } });


// Prominent school-portal entry point on the admin dashboard.
document.querySelectorAll("[data-open-school-portal]").forEach(button => {
  button.addEventListener("click", () => switchInterface("school"));
});
