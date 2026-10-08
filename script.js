const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const money = n => "₦" + Number(n || 0).toLocaleString("en-NG");

document.querySelector("#year").textContent = new Date().getFullYear();

// Mobile navigation
$("#menuToggle").addEventListener("click", () => {
  const open = $("#navMenu").classList.toggle("open");
  $("#menuToggle").setAttribute("aria-expanded", open);
});
$$(".nav-menu a").forEach(a => a.addEventListener("click", () => $("#navMenu").classList.remove("open")));

// Theme
const savedTheme = sessionStorage.getItem("budgetTheme");
if (savedTheme === "dark") document.body.classList.add("dark");
$("#themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  sessionStorage.setItem("budgetTheme", document.body.classList.contains("dark") ? "dark" : "light");
});

// Clock
function updateClock(){
  $("#dateTime").textContent = new Intl.DateTimeFormat("en-NG", {
    dateStyle:"medium", timeStyle:"medium"
  }).format(new Date());
}
updateClock(); setInterval(updateClock, 1000);

// Visitor counter: local browser demo only
let visitors = Number(localStorage.getItem("budgetVisitors") || 0) + 1;
localStorage.setItem("budgetVisitors", visitors);
$("#visitorCount").textContent = visitors;

// Knowledge check
$$(".quiz-options button").forEach(btn => btn.addEventListener("click", () => {
  const result = $("#quizResult");
  const correct = btn.dataset.answer === "correct";
  result.textContent = correct ? "Correct! Transport to school is generally an essential need." : "Not quite. Think about whether the item is necessary for basic living, safety or education.";
  result.className = "feedback " + (correct ? "correct" : "wrong");
}));

// Needs vs wants
const classifyItems = [
  {name:"New headphones", emoji:"🎧", answer:"want"},
  {name:"School transport", emoji:"🚌", answer:"need"},
  {name:"Concert ticket", emoji:"🎟️", answer:"want"},
  {name:"Required textbook", emoji:"📚", answer:"need"},
  {name:"Latest game release", emoji:"🎮", answer:"want"}
];
let classIndex = 0;
function showItem(){
  const item = classifyItems[classIndex];
  $("#itemName").textContent = item.name;
  $("#itemEmoji").textContent = item.emoji;
  $("#classificationFeedback").textContent = "Choose an answer to continue.";
  $("#classificationFeedback").className = "feedback";
}
$$(".choice").forEach(btn => btn.addEventListener("click", () => {
  const item = classifyItems[classIndex];
  const correct = btn.dataset.choice === item.answer;
  $("#classificationFeedback").textContent = correct
    ? "Correct! Now ask whether the purchase can wait."
    : `Try again. For this example, it is usually a ${item.answer}.`;
  $("#classificationFeedback").className = "feedback " + (correct ? "correct" : "wrong");
  if (correct) setTimeout(() => { classIndex = (classIndex + 1) % classifyItems.length; showItem(); }, 900);
}));

// 50-30-20 calculator
function calculateRule(){
  const income = Math.max(0, Number($("#incomeInput").value) || 0);
  const values = [income*.5, income*.3, income*.2];
  $("#needsAmount").textContent = money(values[0]);
  $("#wantsAmount").textContent = money(values[1]);
  $("#savingsAmount").textContent = money(values[2]);
  $("#needsBar").style.width = "50%";
  $("#wantsBar").style.width = "30%";
  $("#savingsBar").style.width = "20%";
  $("#expenseBalance").textContent = money(income - Number($("#expenseTotal").dataset.value || 0));
}
$("#calculateRule").addEventListener("click", calculateRule);

// Savings goal
function calculateGoal(){
  const target = Math.max(0, Number($("#goalTarget").value) || 0);
  const current = Math.max(0, Number($("#goalCurrent").value) || 0);
  const monthly = Math.max(0, Number($("#goalMonthly").value) || 0);
  const remaining = Math.max(0, target - current);
  const pct = target ? Math.min(100, current / target * 100) : 0;
  const months = remaining === 0 ? 0 : (monthly > 0 ? Math.ceil(remaining / monthly) : Infinity);
  $("#goalTitle").textContent = $("#goalName").value.trim() || "Savings goal";
  $("#goalCurrentDisplay").textContent = money(current);
  $("#goalTargetDisplay").textContent = money(target);
  $("#goalRemaining").textContent = money(remaining);
  $("#goalMonths").textContent = months === Infinity ? "Set contribution" : `${months} month${months === 1 ? "" : "s"}`;
  $("#goalBar").style.width = pct + "%";
  $("#goalTip").textContent = remaining === 0 ? "Goal reached! Consider setting a new goal." : "Tip: review your contribution whenever your income or expenses change.";
}
$("#calculateGoal").addEventListener("click", calculateGoal);

// Expense planner using sessionStorage
let expenses = JSON.parse(sessionStorage.getItem("budgetExpenses") || "[]");
let editIndex = -1;
function saveExpenses(){ sessionStorage.setItem("budgetExpenses", JSON.stringify(expenses)); }
function renderExpenses(){
  const tbody = $("#expenseTable tbody");
  tbody.innerHTML = "";
  let total = 0;
  expenses.forEach((e,i) => {
    total += Number(e.amount);
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${e.date}</td><td>${e.category}</td><td>${e.description}</td><td>${money(e.amount)}</td>
      <td><button class="filter-btn" data-edit="${i}">Edit</button> <button class="filter-btn" data-delete="${i}">Delete</button></td>`;
    tbody.appendChild(tr);
  });
  $("#expenseTotal").textContent = money(total);
  $("#expenseTotal").dataset.value = total;
  const income = Number($("#incomeInput").value) || 0;
  $("#expenseBalance").textContent = money(income - total);
  $$("[data-delete]").forEach(b => b.onclick = () => { expenses.splice(Number(b.dataset.delete),1); saveExpenses(); renderExpenses(); });
  $$("[data-edit]").forEach(b => {
    b.onclick = () => {
      const e = expenses[Number(b.dataset.edit)];
      $("#expenseDate").value=e.date; $("#expenseCategory").value=e.category; $("#expenseDescription").value=e.description; $("#expenseAmount").value=e.amount;
      editIndex = Number(b.dataset.edit); $("#expenseSubmit").textContent="Update expense";
    };
  });
}
$("#expenseForm").addEventListener("submit", e => {
  e.preventDefault();
  const item = {
    date:$("#expenseDate").value,
    category:$("#expenseCategory").value,
    description:$("#expenseDescription").value.trim(),
    amount:Number($("#expenseAmount").value)
  };
  if(editIndex >= 0){ expenses[editIndex]=item; editIndex=-1; $("#expenseSubmit").textContent="Add expense"; }
  else expenses.push(item);
  saveExpenses(); renderExpenses(); e.target.reset();
});
renderExpenses();

// Infographic filters
$$("[data-info-filter]").forEach(btn => btn.addEventListener("click", () => {
  $$("[data-info-filter]").forEach(x => x.classList.remove("active")); btn.classList.add("active");
  const filter = btn.dataset.infoFilter;
  $$(".info-card").forEach(card => card.hidden = filter !== "all" && card.dataset.infoTopic !== filter);
}));

// Chatbot
const responses = [
  {keys:["start","budget"], text:"Start by writing down your monthly income, list your regular expenses, separate needs from wants, then decide how much you can save."},
  {keys:["50","30","20"], text:"The 50-30-20 guideline suggests 50% for needs, 30% for wants and 20% for savings or debt goals. It is a flexible guideline, not a universal rule."},
  {keys:["save","saving"], text:"Choose a specific target, decide how much you can contribute each month, and track progress. Even a small consistent contribution can build a habit."},
  {keys:["need"], text:"A need is generally something essential for basic living, safety, health or education. Context matters."},
  {keys:["want"], text:"A want is something useful or enjoyable that is usually possible to delay, reduce or replace."},
  {keys:["expense","spend"], text:"Try tracking every expense for a week. Group the entries into categories and look for patterns before deciding what to change."}
];
function botReply(input){
  const lower=input.toLowerCase();
  const hit=responses.find(r=>r.keys.some(k=>lower.includes(k)));
  return hit ? hit.text : "I can help with budgeting basics, the 50-30-20 guideline, saving, needs vs wants and expense tracking. Try one of those topics.";
}
function sendChat(text){
  if(!text.trim()) return;
  const box=$("#chatMessages");
  const user=document.createElement("div"); user.className="user-message"; user.textContent=text; box.appendChild(user);
  setTimeout(()=>{const bot=document.createElement("div");bot.className="bot-message";bot.textContent=botReply(text);box.appendChild(bot);box.scrollTop=box.scrollHeight;},250);
}
$("#chatForm").addEventListener("submit",e=>{e.preventDefault();sendChat($("#chatInput").value);$("#chatInput").value="";});
$$(".suggestions button").forEach(b=>b.addEventListener("click",()=>sendChat(b.textContent)));

// Forms
$("#feedbackForm").addEventListener("submit", e => {
  e.preventDefault();
  if(!e.target.checkValidity()){e.target.reportValidity();return;}
  $("#feedbackMessage").textContent="Thanks! Your feedback has been validated for this frontend demo.";
  e.target.reset();
});
$("#contactForm").addEventListener("submit", e => {
  e.preventDefault();
  if(!e.target.checkValidity()){e.target.reportValidity();return;}
  $("#contactMessage").textContent="Message validated successfully. This static demo does not send messages to a server.";
  e.target.reset();
});

// Search/filter across learning sections
function applySearch(){
  const q=$("#contentSearch").value.toLowerCase().trim();
  const topic=$("#topicFilter").value;
  let count=0;
  $$(".searchable").forEach(section=>{
    const text=(section.innerText+" "+(section.dataset.keywords||"")).toLowerCase();
    const match=(!q || text.includes(q)) && (topic==="all" || section.dataset.topic===topic);
    section.hidden=!match;
    if(match) count++;
  });
  $("#searchMessage").hidden=count>0;
}
$("#contentSearch").addEventListener("input",applySearch);
$("#topicFilter").addEventListener("change",applySearch);

// Default date for expense form
$("#expenseDate").value = new Date().toISOString().slice(0,10);
