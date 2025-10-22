const stateKey = 'taskCollab_v1';
const $ = id => document.getElementById(id);


function load(){
try{
const raw = localStorage.getItem(stateKey);
if(raw) state = JSON.parse(raw);
}catch(e){ console.warn('load failed', e); }
}
function save(){ localStorage.setItem(stateKey, JSON.stringify(state)); }


function renderMembers(){
const sel = $('newTaskAssignee'); if(!sel) return;
sel.innerHTML = '';
state.members.forEach(m => { const o = document.createElement('option'); o.value = m; o.textContent = m; sel.appendChild(o); });
const list = $('roommateList'); list.innerHTML = '';
state.members.forEach(m => { const div = document.createElement('div'); div.textContent = m; list.appendChild(div); });
}


function addRoommate(name){ if(!name) return; state.members.push(name); save(); renderMembers(); }
$('addRoommateBtn').onclick = () => { const name = $('roommateInput').value.trim(); if(!name) return alert('Enter a name'); addRoommate(name); $('roommateInput').value=''; };


function renderTasks(){ ['todo','doing','done'].forEach(c=>{ const wrap = $(c+'Col'); if(!wrap) return; wrap.innerHTML=''; state.tasks.filter(t=>t.col===c).forEach(t=>{ const el = document.createElement('div'); el.className = 'task' + (t.col==='done'?' done':''); el.dataset.id = t.id; el.textContent = `${t.title} (${t.assignee})`; el.onclick = ()=> moveTask(t.id); wrap.appendChild(el); }); }); }


$('addTaskBtn').onclick = () => {
const text = $('newTaskText').value.trim(); if(!text) return alert('Enter task name');
const ass = $('newTaskAssignee').value || (state.members[0] || 'Unassigned');
const col = $('newTaskColumn').value;
state.tasks.push({ id: Date.now(), title: text, assignee: ass, col });
$('newTaskText').value = '';
save(); renderTasks();
};


function moveTask(id){ const t = state.tasks.find(x=>x.id===id); if(!t) return; if(t.col==='todo') t.col='doing'; else if(t.col==='doing') t.col='done'; else t.col='todo'; save(); renderTasks(); }


function renderBudget(){ const list = $('expenseList'); list.innerHTML=''; state.expenses.forEach(e=>{ const div = document.createElement('div'); div.textContent = `${e.name}: $${Number(e.amt).toFixed(2)}`; list.appendChild(div); }); }


$('addExpenseBtn').onclick = () => { const name = $('expenseName').value.trim(); const amt = parseFloat($('expenseAmt').value); if(!name || isNaN(amt)) return alert('Enter valid expense and amount'); state.expenses.push({ id:Date.now(), name, amt }); $('expenseName').value=''; $('expenseAmt').value=''; save(); renderBudget(); };


function checkReminders(){ const el = $('reminderStatus'); if(!el) return; const tday = state.settings.trashDay; if(tday === null){ el.textContent = 'Set your trash day or detect your location for local reminders.'; return; } const today = new Date().getDay(); el.textContent = today===tday ? `It's trash day! 🗑️` : `Next trash day: ${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][tday]}`; }


$('trashDaySelect').onchange = e => { state.settings.trashDay = +e.target.value; save(); checkReminders(); };


$('detectLocBtn').onclick = () => {
if(!navigator.geolocation) return alert('Geolocation not supported');
navigator.geolocation.getCurrentPosition(pos => {
// For privacy and simplicity we set trash day to today's weekday (demo).
const today = new Date().getDay();
state.settings.trashDay = today;
save(); checkReminders(); alert('Location detected — demo sets trash day to today.');
}, err => { alert('Location access denied or failed.'); });
};


// init
load(); renderMembers(); renderTasks(); renderBudget(); checkReminders();


// Expose addRoommate for dev console if needed
window._tc = { state, save };