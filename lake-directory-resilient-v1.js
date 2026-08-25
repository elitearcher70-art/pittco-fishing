/* PittCo Fishing — resilient Lake Master Catalog loader */
(function(){
'use strict';
var RAW='https://raw.githubusercontent.com/elitearcher70-art/pittco-fishing/main/';
function byId(id){return document.getElementById(id)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]})}
function stateTokens(v){return String(v||'').split('/').map(function(x){return x.trim()}).filter(Boolean)}
function currentTier(){var on=document.querySelector('[data-tier].on');return on?on.getAttribute('data-tier')||'':''}
function readJSON(k,f){try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch(e){return f}}
function currentHome(){var s=readJSON('pittco-user-settings-v1',{});return s.homeLake||''}
function favs(){return readJSON('pittco-favorite-lakes',[])}
function routeTo(file,id){return '/?route='+encodeURIComponent(file+'?lake='+id)}
function renderCatalog(list){
  window.catalog=list;
  var region=byId('region'),state=byId('state');
  if(region){var regions=Array.from(new Set(list.map(function(x){return x.region}))).sort();region.innerHTML='<option value="">All regions</option>'+regions.map(function(x){return '<option>'+esc(x)+'</option>'}).join('')}
  if(state){var states=Array.from(new Set([].concat.apply([],list.map(function(x){return stateTokens(x.state)})))).sort();state.innerHTML='<option value="">All states</option>'+states.map(function(x){return '<option>'+esc(x)+'</option>'}).join('')}
  if(typeof window.render==='function'){window.render();return}
  var grid=byId('grid'),count=byId('count');if(!grid)return;
  var home=currentHome(),fs=favs(),q=(byId('q')&&byId('q').value||'').trim().toLowerCase(),reg=region&&region.value||'',st=state&&state.value||'',tier=currentTier();
  var a=list.filter(function(x){var hay=[x.name,x.state,x.region].join(' ').toLowerCase();return(!q||hay.indexOf(q)>=0)&&(!reg||x.region===reg)&&(!st||stateTokens(x.state).indexOf(st)>=0)&&(!tier||tier==='favorites'?fs.indexOf(x.id)>=0:x.tier===tier)});
  if(count)count.textContent=a.length+' '+(a.length===1?'lake':'lakes')+' • '+list.length+' nationwide seeds';
  grid.innerHTML=a.map(function(x){return '<article class="card"><div class="stateLine">'+esc(x.state)+' • '+esc(x.region)+'</div><h3>'+esc(x.name)+'</h3><div class="sub">'+(x.tier==='national'?'National tournament fishery':x.tier==='priority'?'Priority bass fishery':'Regional bass fishery')+'</div><span class="tag '+(home===x.id?'homeTag':'')+'">'+(home===x.id?'⌂ Home Lake':'Lake Profile')+'</span><div class="cardActions"><button class="btn primary" data-profile="'+esc(x.id)+'">Profile</button><button class="btn secondary" data-mapfix="'+esc(x.id)+'">Map</button></div></article>'}).join('');
  grid.querySelectorAll('[data-profile]').forEach(function(b){b.onclick=function(){location.href=routeTo('lake-profile.html',b.dataset.profile)}});
  grid.querySelectorAll('[data-mapfix]').forEach(function(b){b.onclick=function(){location.href=routeTo('map.html',b.dataset.mapfix)}})
}
async function load(){
  var count=byId('count'),grid=byId('grid');
  try{var r=await fetch(RAW+'data/lakes.json?v=master-catalog-20260825',{cache:'no-store'});if(!r.ok)throw Error(r.status);var j=await r.json(),list=j.lakes||[];if(!list.length)throw Error('empty');renderCatalog(list)}
  catch(e){if(count)count.textContent='Catalog temporarily unavailable';if(grid)grid.innerHTML='<div class="empty">Lake catalog could not be loaded. Tap back and retry.</div>'}
}
function patchActions(){
  document.addEventListener('click',function(e){var b=e.target.closest('[data-map]');if(b){e.preventDefault();location.href=routeTo('map.html',b.dataset.map);return}var o=e.target.closest('[data-open]');if(o){e.preventDefault();location.href=routeTo('lake-profile.html',o.dataset.open)}} ,true);
}
function patchWeather(){
  window.fetchWeather=async function(x){try{var r=await fetch('/api/weather?lat='+encodeURIComponent(x.lat)+'&lon='+encodeURIComponent(x.lon),{cache:'no-store'});if(!r.ok)throw Error(r.status);var j=await r.json(),c=j.current||{};if(byId('wt'))byId('wt').textContent=Math.round(Number(c.temperature_2m))+'°';if(byId('ww'))byId('ww').textContent=Math.round(Number(c.wind_speed_10m||0))+' mph';if(byId('wh'))byId('wh').textContent=Math.round(Number(c.relative_humidity_2m||0))+'%';if(byId('wr'))byId('wr').textContent=Number(c.precipitation||0).toFixed(2)+' in';if(byId('wxStatus'))byId('wxStatus').textContent='Live conditions'}catch(e){if(byId('wxStatus'))byId('wxStatus').textContent='Live weather temporarily unavailable.'}}
}
function init(){patchActions();patchWeather();setTimeout(function(){var c=byId('count');if(!window.catalog||!window.catalog.length||c&&/Loading lakes/i.test(c.textContent))load()},100)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
