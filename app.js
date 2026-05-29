const employees = [
  { name: "林嘉仪", id: "MC-1024", dept: "产品部", role: "产品经理", status: "在职", attendance: "98%", initial: "林" },
  { name: "周启航", id: "MC-1031", dept: "研发部", role: "后端工程师", status: "在职", attendance: "96%", initial: "周" },
  { name: "陈雨晴", id: "MC-1042", dept: "研发部", role: "前端工程师", status: "试用", attendance: "94%", initial: "陈" },
  { name: "王思远", id: "MC-1066", dept: "销售部", role: "客户经理", status: "在职", attendance: "92%", initial: "王" },
  { name: "赵明哲", id: "MC-1089", dept: "人事部", role: "HRBP", status: "在职", attendance: "99%", initial: "赵" },
  { name: "许知夏", id: "MC-1097", dept: "财务部", role: "会计主管", status: "离职", attendance: "0%", initial: "许" }
];

const departments = [
  { name: "研发部", total: 82, present: 78, absent: 4 },
  { name: "产品部", total: 34, present: 33, absent: 1 },
  { name: "销售部", total: 76, present: 70, absent: 6 },
  { name: "人事部", total: 18, present: 18, absent: 0 },
  { name: "财务部", total: 16, present: 15, absent: 1 }
];

const records = [
  { name: "林嘉仪", type: "正常", time: "09:01 - 18:08", badge: "good" },
  { name: "周启航", type: "漏打卡", time: "09:04 - 未打卡", badge: "warn" },
  { name: "陈雨晴", type: "外勤", time: "客户现场 10:00 - 17:30", badge: "good" },
  { name: "王思远", type: "迟到", time: "09:42 - 18:21", badge: "danger" },
  { name: "赵明哲", type: "正常", time: "08:55 - 18:02", badge: "good" }
];

const rules = [
  { title: "标准班", detail: "09:00 - 18:00，午休 12:00 - 13:30" },
  { title: "弹性班", detail: "08:00 - 10:00 到岗，满 8 小时" },
  { title: "销售外勤", detail: "支持定位打卡与客户拜访备注" }
];

let approvals = [
  { name: "周启航", type: "漏打卡补卡", detail: "5 月 29 日下班卡，提交原因：会议超时" },
  { name: "王思远", type: "迟到说明", detail: "5 月 29 日上班迟到，提交原因：客户临时来访" },
  { name: "许知夏", type: "离职交接确认", detail: "待确认考勤结算与剩余年假" }
];

const navItems = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".view");
const employeeTable = document.querySelector("#employeeTable");
const departmentList = document.querySelector("#departmentList");
const recordList = document.querySelector("#recordList");
const ruleList = document.querySelector("#ruleList");
const approvalBoard = document.querySelector("#approvalBoard");
const searchInput = document.querySelector("#searchInput");
const deptFilter = document.querySelector("#deptFilter");
const toast = document.querySelector("#toast");
const modal = document.querySelector("#employeeModal");
let activeStatus = "all";
let clockedIn = false;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1800);
}

function renderDepartments() {
  const selected = deptFilter.value;
  const items = departments.filter((dept) => selected === "all" || dept.name === selected);
  departmentList.innerHTML = items
    .map((dept) => {
      const rate = Math.round((dept.present / dept.total) * 100);
      return `
        <article class="dept-row">
          <div>
            <div class="dept-title"><span>${dept.name}</span><span>${rate}%</span></div>
            <div class="progress-track"><span style="width:${rate}%"></span></div>
          </div>
          <span class="badge ${dept.absent > 3 ? "warn" : "good"}">${dept.present}/${dept.total}</span>
        </article>
      `;
    })
    .join("");
}

function renderEmployees() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = employees.filter((person) => {
    const hit = [person.name, person.id, person.dept, person.role].join(" ").toLowerCase().includes(query);
    const statusHit = activeStatus === "all" || person.status === activeStatus;
    return hit && statusHit;
  });

  employeeTable.innerHTML = filtered
    .map((person) => {
      const badgeClass = person.status === "在职" ? "good" : person.status === "试用" ? "warn" : "danger";
      return `
        <tr>
          <td><div class="person"><span class="avatar">${person.initial}</span><strong>${person.name}</strong></div></td>
          <td>${person.id}</td>
          <td>${person.dept}</td>
          <td>${person.role}</td>
          <td><span class="badge ${badgeClass}">${person.status}</span></td>
          <td>${person.attendance}</td>
          <td><button class="ghost-button" data-profile="${person.name}">查看</button></td>
        </tr>
      `;
    })
    .join("");

  if (!filtered.length) {
    employeeTable.innerHTML = `<tr><td colspan="7">没有匹配的员工记录</td></tr>`;
  }
}

function renderRecords() {
  recordList.innerHTML = records
    .map(
      (record) => `
      <article class="record-row">
        <div>
          <div class="row-title"><span>${record.name}</span></div>
          <small>${record.time}</small>
        </div>
        <span class="badge ${record.badge}">${record.type}</span>
      </article>
    `
    )
    .join("");
}

function renderRules() {
  ruleList.innerHTML = rules
    .map(
      (rule) => `
      <article class="rule-row">
        <div>
          <strong>${rule.title}</strong>
          <p>${rule.detail}</p>
        </div>
        <span class="badge good">启用</span>
      </article>
    `
    )
    .join("");
}

function renderApprovals() {
  approvalBoard.innerHTML = approvals
    .map(
      (item, index) => `
      <article class="approval-card">
        <span class="badge warn">${item.type}</span>
        <h2>${item.name}</h2>
        <p>${item.detail}</p>
        <footer>
          <button class="ghost-button" data-reject="${index}">驳回</button>
          <button class="primary-button" data-approve="${index}">通过</button>
        </footer>
      </article>
    `
    )
    .join("");

  if (!approvals.length) {
    approvalBoard.innerHTML = `<article class="approval-card"><h2>审批已清空</h2><p>当前没有待处理事项</p></article>`;
  }
}

function renderTimeline() {
  const items = clockedIn
    ? [
        ["上班打卡", "09:00 已记录"],
        ["午休", "12:00 - 13:30"],
        ["下班打卡", "18:00 待完成"]
      ]
    : [
        ["上班打卡", "等待打卡"],
        ["午休", "12:00 - 13:30"],
        ["下班打卡", "18:00 待完成"]
      ];
  document.querySelector("#timeline").innerHTML = items
    .map(([title, detail]) => `<div class="timeline-row"><strong>${title}</strong><small>${detail}</small></div>`)
    .join("");
}

function updateClock() {
  const now = new Date();
  document.querySelector("#clockTime").textContent = now.toLocaleTimeString("zh-CN", { hour12: false });
}

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navItems.forEach((nav) => nav.classList.remove("active"));
    views.forEach((view) => view.classList.remove("active"));
    item.classList.add("active");
    document.querySelector(`#${item.dataset.view}`).classList.add("active");
  });
});

document.querySelectorAll(".segmented button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".segmented button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    activeStatus = button.dataset.status;
    renderEmployees();
  });
});

searchInput.addEventListener("input", renderEmployees);
deptFilter.addEventListener("change", renderDepartments);

document.querySelector("#clockInButton").addEventListener("click", () => {
  clockedIn = true;
  document.querySelector("#clockStatus").textContent = "上班卡已记录";
  renderTimeline();
  showToast("打卡成功，记录已同步");
});

document.querySelector("#toggleTheme").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

document.querySelector("#openEmployeeModal").addEventListener("click", () => modal.showModal());

document.querySelector("#saveEmployee").addEventListener("click", (event) => {
  const name = document.querySelector("#newName").value.trim();
  const role = document.querySelector("#newRole").value.trim();
  if (!name || !role) return;
  event.preventDefault();
  employees.unshift({
    name,
    id: `MC-${1100 + employees.length}`,
    dept: document.querySelector("#newDept").value,
    role,
    status: "试用",
    attendance: "100%",
    initial: name.slice(0, 1)
  });
  renderEmployees();
  modal.close();
  document.querySelector(".modal-card").reset();
  showToast("员工档案已创建");
});

document.querySelector("#employeeTable").addEventListener("click", (event) => {
  const button = event.target.closest("[data-profile]");
  if (button) showToast(`${button.dataset.profile} 的档案已打开`);
});

approvalBoard.addEventListener("click", (event) => {
  const action = event.target.dataset.approve ?? event.target.dataset.reject;
  if (action === undefined) return;
  const approved = event.target.dataset.approve !== undefined;
  approvals.splice(Number(action), 1);
  renderApprovals();
  showToast(approved ? "审批已通过" : "审批已驳回");
});

document.querySelector("#approveAll").addEventListener("click", () => {
  approvals = [];
  renderApprovals();
  showToast("全部审批已通过");
});

document.querySelector("#addRuleButton").addEventListener("click", () => {
  rules.push({ title: "临时班次", detail: "适用于项目冲刺、活动保障与特殊值班" });
  renderRules();
  showToast("班次规则已新增");
});

document.querySelector("#attendanceDate").addEventListener("change", () => showToast("考勤日期已切换"));

renderDepartments();
renderEmployees();
renderRecords();
renderRules();
renderApprovals();
renderTimeline();
updateClock();
window.setInterval(updateClock, 1000);
