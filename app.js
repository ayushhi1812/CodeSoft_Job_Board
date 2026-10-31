let S={jobs:seed.slice(),apps:[],view:"find",sel:"s1",q:"",loc:"",cat:"",type:""};
try{const raw=localStorage.getItem("hirewell");if(raw){const d=JSON.parse(raw);if(d&&d.jobs){S.jobs=d.jobs;S.apps=d.apps||[]}}}catch(e){}
function save(){try{localStorage.setItem("hirewell",JSON.stringify({jobs:S.jobs,apps:S.apps}))}catch(e){}}
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ago=t=>{const d=Math.floor((Date.now()-t)/864e5);return d<1?"Today":d===1?"Yesterday":d+" days ago"};
const opts=(a,all)=>(all?`<option value="">${all}</option>`:"")+a.map(x=>`<option>${x}</option>`).join("");
function toast(m){const t=$("#toast");t.textContent=m;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>t.hidden=true,2600)}
function nav(v){S.view=v;render();window.scrollTo(0,0)}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>nav(b.dataset.view));

function filtered(){const q=S.q.toLowerCase(),l=S.loc.toLowerCase();
 return S.jobs.filter(j=>(!q||(j.title+" "+j.company+" "+j.desc).toLowerCase().includes(q))&&(!l||j.location.toLowerCase().includes(l))&&(!S.cat||j.category===S.cat)&&(!S.type||j.type===S.type)).sort((a,b)=>b.posted-a.posted)}

function render(){
 document.querySelectorAll("nav button").forEach(b=>b.toggleAttribute("aria-current",b.dataset.view===S.view)||b.removeAttribute("aria-current"));
 document.querySelectorAll("nav button").forEach(b=>{if(b.dataset.view===S.view)b.setAttribute("aria-current","page")});
 ({find:renderFind,post:renderPost,dash:renderDash})[S.view]();
}

function renderFind(){
 $("#app").innerHTML=`<div class="hero"><h1>Find work that fits your life</h1><p>Search open roles, read the details and apply in a minute.</p></div>
 <div class="filters">
  <input id="fq" type="search" placeholder="Job title, company or keyword" aria-label="Search jobs" value="${esc(S.q)}">
  <input id="fl" type="search" placeholder="Location (try “Remote”)" aria-label="Location" value="${esc(S.loc)}">
  <select id="fc" aria-label="Category">${opts(CATS,"All categories")}</select>
  <select id="ft" aria-label="Job type">${opts(TYPES,"All types")}</select>
 </div>
 <div class="layout"><div><p class="count" id="cnt"></p><div id="list"></div></div><div id="detail"></div></div>`;
 $("#fc").value=S.cat;$("#ft").value=S.type;
 const upd=()=>{S.q=$("#fq").value;S.loc=$("#fl").value;S.cat=$("#fc").value;S.type=$("#ft").value;drawList()};
 ["#fq","#fl"].forEach(s=>$(s).oninput=upd);["#fc","#ft"].forEach(s=>$(s).onchange=upd);
 drawList();
}
function drawList(){
 const r=filtered();
 if(r.length&&!r.some(j=>j.id===S.sel))S.sel=r[0].id;
 $("#cnt").textContent=r.length+(r.length===1?" job found":" jobs found");
 $("#list").innerHTML=r.length?r.map(j=>`<button class="job" data-id="${j.id}" aria-pressed="${j.id===S.sel}">
  <h3>${esc(j.title)}</h3><div class="co">${esc(j.company)} – ${esc(j.location)}</div>
  <div class="tags"><span class="tag">${esc(j.type)}</span><span class="tag">${esc(j.category)}</span><span class="tag">${ago(j.posted)}</span></div></button>`).join(""):
  `<div class="empty">No jobs match these filters. Clear a filter or search a broader keyword.</div>`;
 document.querySelectorAll(".job").forEach(b=>b.onclick=()=>{S.sel=b.dataset.id;drawList();if(innerWidth<=860)$("#detail").scrollIntoView({behavior:"smooth"})});
 const j=S.jobs.find(x=>x.id===S.sel&&r.includes(x));
 $("#detail").innerHTML=j?`<article class="panel"><h2>${esc(j.title)}</h2>
  <p style="margin:6px 0 0;color:var(--muted)">${esc(j.company)} – ${esc(j.location)}</p>
  <div class="tags"><span class="tag">${esc(j.type)}</span><span class="tag">${esc(j.category)}</span>${j.salary?`<span class="tag">${esc(j.salary)}</span>`:""}</div>
  <div class="desc">${esc(j.desc)}</div>
  ${S.apps.some(a=>a.jobId===j.id&&a.mine)?`<p><strong>You applied to this job.</strong></p>`:`<button class="btn" id="applyBtn">Apply now</button>`}</article>`:"";
 const ab=$("#applyBtn");if(ab)ab.onclick=()=>openApply(j);
}

function openApply(j){
 const d=$("#applyDlg");
 d.innerHTML=`<h2 style="font-size:22px">Apply to ${esc(j.title)}</h2><p style="color:var(--muted);margin:4px 0 16px">${esc(j.company)}</p>
 <div class="field"><label for="an">Full name</label><input id="an" autocomplete="name"></div>
 <div class="field"><label for="ae">Email</label><input id="ae" type="email" autocomplete="email"></div>
 <div class="field"><label for="ar">Resume link</label><input id="ar" type="url" placeholder="https://"></div>
 <div class="field"><label for="am">Why you’re a good fit</label><textarea id="am"></textarea></div>
 <p class="err" id="aerr" role="alert"></p>
 <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:12px"><button class="btn ghost" id="ac">Cancel</button><button class="btn" id="as">Send application</button></div>`;
 d.showModal();
 $("#ac").onclick=()=>d.close();
 $("#as").onclick=()=>{
  const n=$("#an").value.trim(),e=$("#ae").value.trim();
  if(!n||!/^\S+@\S+\.\S+$/.test(e)){$("#aerr").textContent="Enter your name and a valid email address.";return}
  S.apps.push({id:"a"+Date.now(),jobId:j.id,name:n,email:e,resume:$("#ar").value.trim(),note:$("#am").value.trim(),at:Date.now(),mine:true});
  save();d.close();toast("Application sent");drawList();
 };
}

function renderPost(){
 $("#app").innerHTML=`<div class="hero"><h1>Post a job opening</h1><p>Your listing goes live right away and applications show up under My postings.</p></div>
 <form class="card" id="pf" novalidate>
  <div class="row"><div class="field"><label for="pt">Job title</label><input id="pt"></div><div class="field"><label for="pc">Company</label><input id="pc"></div></div>
  <div class="row"><div class="field"><label for="pl">Location</label><input id="pl" placeholder="City or Remote"></div><div class="field"><label for="ps">Pay (optional)</label><input id="ps" placeholder="₹10–15 LPA"></div></div>
  <div class="row"><div class="field"><label for="pk">Category</label><select id="pk">${opts(CATS)}</select></div><div class="field"><label for="py">Job type</label><select id="py">${opts(TYPES)}</select></div></div>
  <div class="field"><label for="pd">Description</label><textarea id="pd" style="min-height:160px"></textarea></div>
  <p class="err" id="perr" role="alert"></p>
  <button class="btn" type="submit">Publish job</button>
 </form>`;
 $("#pf").onsubmit=ev=>{ev.preventDefault();
  const v=id=>$("#"+id).value.trim();
  if(!v("pt")||!v("pc")||!v("pl")||v("pd").length<20){$("#perr").textContent="Add a title, company, location and a description of at least 20 characters.";return}
  const j={id:"j"+Date.now(),title:v("pt"),company:v("pc"),location:v("pl"),salary:v("ps"),category:v("pk"),type:v("py"),desc:v("pd"),posted:Date.now(),mine:true};
  S.jobs.unshift(j);S.sel=j.id;save();toast("Job published");nav("dash");
 };
}

function renderDash(){
 const mine=S.jobs.filter(j=>j.mine);
 $("#app").innerHTML=`<div class="hero"><h1>My postings</h1><p>Review applicants and close roles you’ve filled.</p></div>`+
 (mine.length?mine.map(j=>{const ap=S.apps.filter(a=>a.jobId===j.id);return `<section class="dash-job">
  <div class="dash-head"><div><h3>${esc(j.title)}</h3><div style="color:var(--muted)">${esc(j.company)} – ${esc(j.location)} – ${ago(j.posted)}</div></div>
  <div><strong>${ap.length}</strong> ${ap.length===1?"applicant":"applicants"} <button class="btn danger sm" data-del="${j.id}" style="margin-left:8px">Close job</button></div></div>
  ${ap.map(a=>`<div class="applicant"><strong>${esc(a.name)}</strong> – <a href="mailto:${esc(a.email)}">${esc(a.email)}</a>${/^https?:\/\//.test(a.resume)?` – <a href="${esc(a.resume)}" target="_blank" rel="noopener">Resume</a>`:""}<br><small>${ago(a.at)}</small>${a.note?`<div>${esc(a.note)}</div>`:""}</div>`).join("")}
 </section>`}).join(""):`<div class="empty">You haven’t posted a job yet. <br><br><button class="btn" id="gp">Post your first job</button></div>`);
 document.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{
  if(!confirm("Close this job? It will be removed from search."))return;
  S.jobs=S.jobs.filter(j=>j.id!==b.dataset.del);S.apps=S.apps.filter(a=>a.jobId!==b.dataset.del);save();toast("Job closed");renderDash();
 });
 const g=$("#gp");if(g)g.onclick=()=>nav("post");
}
render();
