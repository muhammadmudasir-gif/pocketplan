const $=s=>document.querySelector(s), monthEl=$('#month');
const today=new Date(); const monthKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
monthEl.value=monthKey(today); $('#date').value=today.toISOString().slice(0,10);
const key=()=>`pocketplan-v1-${monthEl.value}`;
let entries=[];let settings=JSON.parse(localStorage.getItem('pocketplan-settings')||'{"currency":"USD","budgets":{}}');
const symbols={USD:'$',PKR:'Rs ',EUR:'€',GBP:'£',INR:'₹',CAD:'$'};
const money=n=>`${symbols[settings.currency]||'$'}${Number(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
function load(){entries=JSON.parse(localStorage.getItem(key())||'[]');render()}
function save(){localStorage.setItem(key(),JSON.stringify(entries));render()}
function render(){const spent=entries.reduce((s,e)=>s+Number(e.amount),0),budget=Number(settings.budgets[monthEl.value]||0),remaining=budget-spent;$('#budgetDisplay').textContent=money(budget);$('#spent').textContent=money(spent);$('#remaining').textContent=money(remaining);$('#remaining').style.color=remaining<0?'var(--orange)':'var(--text)';$('#progress').style.width=`${budget?Math.min(100,spent/budget*100):0}%`;$('#progress').style.background=spent>budget?'var(--orange)':'var(--mint)';$('#expenses').innerHTML='';$('#empty').style.display=entries.length?'none':'block';[...entries].sort((a,b)=>b.date.localeCompare(a.date)).forEach((e,i)=>{const d=document.createElement('div');d.className='expense';d.innerHTML=`<div><div class="expense-title"></div><div class="expense-meta"></div></div><div class="expense-amount"></div><button class="delete" aria-label="Delete expense">×</button>`;d.querySelector('.expense-title').textContent=e.description;d.querySelector('.expense-meta').textContent=`${e.category} · ${new Date(`${e.date}T12:00:00`).toLocaleDateString(undefined,{month:'short',day:'numeric'})}`;d.querySelector('.expense-amount').textContent=money(e.amount);d.querySelector('.delete').onclick=()=>{entries.splice(entries.indexOf(e),1);save()};$('#expenses').append(d)})}
$('#expenseForm').onsubmit=e=>{e.preventDefault();entries.push({id:crypto.randomUUID(),description:$('#description').value.trim(),amount:Number($('#amount').value),category:$('#category').value,date:$('#date').value});save();e.target.reset();$('#date').value=today.toISOString().slice(0,10)};
$('#editBudget').onclick=()=>{$('#budgetInput').value=settings.budgets[monthEl.value]||'';$('#currency').value=settings.currency;$('#budgetDialog').showModal()};
$('#budgetForm').onsubmit=e=>{if(e.submitter?.id==='saveBudget'){e.preventDefault();settings.currency=$('#currency').value;settings.budgets[monthEl.value]=Number($('#budgetInput').value);localStorage.setItem('pocketplan-settings',JSON.stringify(settings));$('#budgetDialog').close();render()}};
monthEl.onchange=load;
$('#export').onclick=()=>{const csv=['Date,Description,Category,Amount',...entries.map(e=>[e.date,`"${e.description.replaceAll('"','""')}"`,e.category,e.amount].join(','))].join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=`pocketplan-${monthEl.value}.csv`;a.click();URL.revokeObjectURL(a.href)};
$('#clear').onclick=()=>{if(entries.length&&confirm(`Delete all ${entries.length} expenses for ${monthEl.value}? This cannot be undone.`)){entries=[];save()}};
load();
