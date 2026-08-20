/* PittCo Fishing — fisherman-focused lake intelligence panel for Lake Directory profiles. */
(function(){
'use strict';
const RAW='https://raw.githubusercontent.com/elitearcher70-art/pittco-fishing/main/';
let intel=null;
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function fmt(n,d=0){return Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:d}):'—'}
async function loadIntel(){
  if(intel)return intel;
  try{intel=await fetch(RAW+'data/lake-intel.json?v=1',{cache:'no-store'}).then(r=>r.ok?r.json():null)}catch(e){intel=null}
  return intel;
}
function ensureStyles(){
  if(document.getElementById('pittcoLakeIntelStyles'))return;
  const s=document.createElement('style');s.id='pittcoLakeIntelStyles';s.textContent='.lakeIntel{margin:13px 0 3px;border:1px solid #46334f;background:#09090e;border-radius:14px;padding:11px}.lakeIntel h3{font-size:15px;margin:0 0 9px}.intelGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}.intelStat{border:1px solid #302936;background:#0d0d13;border-radius:10px;padding:8px}.intelStat b{display:block;font-size:14px;color:#fff}.intelStat small{display:block;color:#aaa5b2;font-size:7px;margin-top:3px}.intelSection{margin-top:10px}.intelSection b{font-size:9px;color:#d670ff;text-transform:uppercase;letter-spacing:.05em}.intelSection p{font-size:9px;line-height:1.45;color:#ddd7e1;margin:5px 0 0}.intelChips{display:flex;gap:4px;flex-wrap:wrap;margin-top:6px}.intelChip{font-size:7px;border:1px solid #3d3344;background:#101016;border-radius:999px;padding:4px 6px;color:#ddd}.intelSource{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-top:10px;padding-top:8px;border-top:1px solid #2c2630;font-size:7px;color:#9f99a5}.intelSource a{color:#d670ff;text-decoration:none;font-weight:800}@media(max-width:370px){.intelGrid{grid-template-columns:1fr}}';document.head.appendChild(s)
}
function stat(label,value){if(value===undefined||value===null)return'';return '<div class="intelStat"><b>'+esc(value)+'</b><small>'+esc(label)+'</small></div>'}
function chips(items){return (items||[]).map(x=>'<span class="intelChip">'+esc(x)+'</span>').join('')}
function render(id){
  const panel=document.querySelector('.panel');if(!panel)return;
  let box=document.getElementById('lakeIntel');if(!box){box=document.createElement('section');box.id='lakeIntel';box.className='lakeIntel';const privacy=panel.querySelector('.privacy');privacy?panel.insertBefore(box,privacy):panel.appendChild(box)}
  const d=intel&&intel.lakes&&intel.lakes[id];
  if(!d){box.innerHTML='<h3>Lake Intelligence</h3><p style="font-size:9px;color:#aaa5b2;line-height:1.45;margin:0">Detailed fisherman data is being verified for this lake. PittCo will only publish lake specifications and operational data when an authoritative source is confirmed.</p>';return}
  const stats=[stat('SURFACE AREA',fmt(d.surface_acres)+' ac'),stat('SHORELINE',fmt(d.shoreline_miles,1)+' mi'),stat('MAX DEPTH',d.max_depth_ft!=null?fmt(d.max_depth_ft,1)+' ft':null),stat('LAKE LENGTH',d.lake_length_miles!=null?fmt(d.lake_length_miles,1)+' mi':null),stat('DAM HEIGHT',d.dam_height_ft!=null?fmt(d.dam_height_ft,0)+' ft':null),stat('VOLUME / STORAGE',d.volume_acre_ft!=null?fmt(d.volume_acre_ft)+' ac-ft':(d.storage_acre_ft!=null?fmt(d.storage_acre_ft)+' ac-ft':null))].join('');
  box.innerHTML='<h3>Lake Intelligence</h3><div class="intelGrid">'+stats+'</div>'+
    '<div class="intelSection"><b>Managing agency</b><p>'+esc(d.manager||'Not verified')+'</p></div>'+
    (d.counties?'<div class="intelSection"><b>Counties</b><p>'+esc(d.counties.join(', '))+'</p></div>':'')+
    '<div class="intelSection"><b>Key fish</b><div class="intelChips">'+chips(d.fish)+'</div></div>'+
    '<div class="intelSection"><b>Access & facilities</b><div class="intelChips">'+chips(d.facilities)+'</div></div>'+
    (d.regulation_note?'<div class="intelSection"><b>Regulation note</b><p>'+esc(d.regulation_note)+'</p></div>':'')+
    (d.dam_note?'<div class="intelSection"><b>Dam / generation</b><p>'+esc(d.dam_note)+'</p></div>':'')+
    (d.angler_note?'<div class="intelSection"><b>Angler notes</b><p>'+esc(d.angler_note)+'</p></div>':'')+
    '<div class="intelSource"><span>Verified static specs • updated '+esc((intel&&intel.updated)||'')+'</span>'+(d.official_report_url?'<a href="'+esc(d.official_report_url)+'" target="_blank" rel="noopener">Official source ↗</a>':'')+'</div>';
}
async function init(){
  ensureStyles();await loadIntel();
  if(typeof openLake==='function'){
    const original=openLake;
    openLake=function(id){const r=original.apply(this,arguments);setTimeout(()=>render(id),0);return r};
  }
}
init();
})();
