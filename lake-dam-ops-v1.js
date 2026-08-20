/* PittCo Fishing — dam and water operations card for dedicated lake profiles. */
(function(){
'use strict';
var RAW='https://raw.githubusercontent.com/elitearcher70-art/pittco-fishing/main/';
var CWMS='https://cwms-data.usace.army.mil/cwms-data/timeseries';
var USACE={'ok-sardis':'SARD','ok-eufaula':'EUFA','ok-broken-bow':'BROK','ok-tenkiller':'TENK'};
var AUTH={
  'ok-grand':{label:'GRDA River Operations',url:'https://stormops.grda.com/riveroperations'},
  'ok-hudson':{label:'GRDA River Operations',url:'https://stormops.grda.com/riveroperations'},
  'ok-mcgee-creek':{label:'Bureau of Reclamation',url:'https://www.usbr.gov/projects/index.php?id=351'}
};
function el(id){return document.getElementById(id)}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]})}
function lakeId(){try{var p=new URLSearchParams(window.__PITTCO_ROUTE_SEARCH||'');var id=p.get('lake');if(id)return id;var r=new URLSearchParams(location.search).get('route');if(r){var d=decodeURIComponent(r),q=d.indexOf('?');if(q>=0)return new URLSearchParams(d.slice(q+1)).get('lake')}}catch(e){}return null}
function stat(label,value,cls){return '<div class="stat"><b class="'+(cls||'')+'">'+esc(value)+'</b><small>'+esc(label)+'</small></div>'}
function fetchJSON(url,opts){return fetch(url,opts||{cache:'no-store'}).then(function(r){if(!r.ok)throw Error('HTTP '+r.status);return r.json()})}
function cwms(name,unit){var q=new URLSearchParams();q.set('name',name);q.set('office','SWT');q.set('begin','PT-30H');q.set('timezone','America/Chicago');q.set('format','json');q.set('page-size','80');q.set('unit',unit);return fetchJSON(CWMS+'?'+q.toString(),{cache:'no-store',headers:{Accept:'application/json;version=2'}}).then(function(j){return (j.values||[]).filter(function(v){return Array.isArray(v)&&v[1]!=null&&isFinite(Number(v[1]))}).map(function(v){return [Number(v[0]),Number(v[1])]})})}
function last(a){return a&&a.length?a[a.length-1]:null}
function prior24(a,t){if(!a||!a.length)return null;var target=t-86400000,b=a[0],bd=Math.abs(a[0][0]-target);a.forEach(function(x){var d=Math.abs(x[0]-target);if(d<bd){b=x;bd=d}});return b}
function ensureCard(){var card=el('damOpsCard');if(card)return card;card=document.createElement('section');card.id='damOpsCard';card.className='card live';card.innerHTML='<h2>Dam & Water Operations</h2><div class="grid" id="damOpsGrid">'+stat('STATUS','Loading official dam data…')+'</div><p class="note" id="damOpsNote"></p>';var main=document.querySelector('main.app');var live=el('liveCard');if(live&&live.parentNode)live.parentNode.insertBefore(card,live.nextSibling);else if(main){var weather=main.querySelector('.card');if(weather)main.insertBefore(card,weather);else main.appendChild(card)}return card}
function renderStatic(d,id){ensureCard();var parts='';if(d.dam_name)parts+=stat('DAM',d.dam_name);if(d.dam_height_ft!=null)parts+=stat('DAM HEIGHT',Number(d.dam_height_ft).toLocaleString()+' ft');if(d.normal_pool_ft!=null)parts+=stat('NORMAL / CONSERVATION POOL',Number(d.normal_pool_ft).toFixed(2)+' ft');var a=AUTH[id];if(a&&!USACE[id])parts+=stat('LIVE OPERATIONS','Open official source below');el('damOpsGrid').innerHTML=parts||stat('DAM DATA','Not yet verified');var note='';if(a&&!USACE[id])note='Live lake level and release data are not yet pulled into PittCo for this authority. Use the official operations source below.';el('damOpsNote').textContent=note}
function renderUSACE(id,d){var code=USACE[id];if(!code)return;Promise.all([
  cwms(code+'.Elev.Inst.1Hour.0.Ccp-Rev','ft'),
  cwms(code+'.Flow-Res In.Ave.1Hour.1Hour.Rev-Regi-Computed','cfs'),
  cwms(code+'.Flow-Res Out.Ave.1Hour.1Hour.Rev-Regi-Flowgroup','cfs')
]).then(function(all){var elev=all[0],inflow=all[1],out=all[2],e=last(elev),i=last(inflow),o=last(out);if(!e)throw Error('No elevation');var pool=Number(d.normal_pool_ft),delta=isFinite(pool)?e[1]-pool:null,p=prior24(elev,e[0]),chg=p?e[1]-p[1]:null,release=o?Number(o[1]):null;var releasing=release!=null&&release>1;var status=release==null?'UNKNOWN':releasing?'RELEASING WATER':'NO MEASURABLE RELEASE';var g='';if(d.dam_name)g+=stat('DAM',d.dam_name);g+=stat('WATER RELEASE STATUS',status,releasing?'good':'');g+=stat('CURRENT LAKE LEVEL',e[1].toFixed(2)+' ft','good');if(delta!=null)g+=stat('VS NORMAL / REFERENCE POOL',(delta>=0?'+':'')+delta.toFixed(2)+' ft');if(chg!=null)g+=stat('24-HOUR LEVEL CHANGE',(chg>=0?'↑ ':'↓ ')+Math.abs(chg).toFixed(2)+' ft');g+=stat('OUTFLOW / RELEASE',release==null?'—':Math.round(release).toLocaleString()+' cfs');if(i)g+=stat('INFLOW',Math.round(i[1]).toLocaleString()+' cfs');g+=stat('GATE / SPILLWAY OPEN-CLOSED','Not separately published');g+=stat('GENERATION STATUS','Not separately verified');el('damOpsGrid').innerHTML=g;el('damOpsNote').textContent='Official USACE Tulsa District CWMS reading • Updated '+new Date(e[0]).toLocaleString()+'. Release status is based on measured reservoir outflow. PittCo does not infer physical gate position or turbine generation.'}).catch(function(){el('damOpsGrid').innerHTML=(d.dam_name?stat('DAM',d.dam_name):'')+stat('LIVE DAM DATA','Temporarily unavailable');el('damOpsNote').textContent='No stale lake level or release value is substituted. Use the official water source below.'})}
function boot(){var id=lakeId();if(!id)return;fetchJSON(RAW+'data/lake-intel.json?v=damops2').then(function(j){var d=(j.lakes||{})[id]||{};renderStatic(d,id);renderUSACE(id,d)}).catch(function(){ensureCard();el('damOpsGrid').innerHTML=stat('DAM DATA','Temporarily unavailable')})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
