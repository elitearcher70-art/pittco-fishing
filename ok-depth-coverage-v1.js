/* PittCo Fishing — verified Oklahoma bathymetry coverage guard + directory badges. */
(function(){
'use strict';
const RAW='https://raw.githubusercontent.com/elitearcher70-art/pittco-fishing/main/';
let registry=null;
async function getRegistry(){
  if(registry)return registry;
  try{registry=await fetch(RAW+'data/ok-bathymetry.json?v=1',{cache:'no-store'}).then(r=>r.ok?r.json():null)}catch(e){registry=null}
  return registry;
}
function cfgFor(id){return registry&&registry.lakes&&registry.lakes[id]}
function applyMapGuard(){
  if(typeof lake==='undefined'||!lake||lake.state!=='OK'||typeof map==='undefined'||!map)return;
  const cfg=cfgFor(lake.id),chip=document.getElementById('depthChip'),notice=document.getElementById('depthNotice'),legend=document.getElementById('depthLegend');
  if(cfg&&cfg.status==='available'){
    if(chip){chip.classList.remove('unavailable');chip.title='Verified OWRB bathymetry available'}
    if(notice)notice.innerHTML='<strong>Lake Depth:</strong> Verified OWRB lake-bottom contours <span class="sourceBadge">DEPTH AVAILABLE • OWRB</span><br>'+String(cfg.survey||'OWRB bathymetric survey')+'. Fishing reference only — not for navigation.';
    return;
  }
  try{if(typeof layers!=='undefined'&&layers.depth&&map.hasLayer(layers.depth))map.removeLayer(layers.depth)}catch(e){}
  if(typeof layers!=='undefined')layers.depth=null;
  if(typeof state!=='undefined')state.depth=false;
  if(chip){chip.classList.remove('on');chip.classList.add('unavailable');chip.title='Verified bathymetry not yet confirmed'}
  if(legend)legend.classList.remove('on');
  if(notice)notice.innerHTML='<strong>Lake Depth:</strong> Verified OWRB coverage has not yet been confirmed for this PittCo lake. <span class="sourceBadge">NOT VERIFIED</span><br>PittCo will not display generic land contours as lake depth.';
}
function badgeDirectory(){
  document.querySelectorAll('.card').forEach(card=>{
    if(card.querySelector('.okDepthBadge'))return;
    const b=card.querySelector('[data-map]'); if(!b)return;
    const cfg=cfgFor(b.dataset.map); if(!cfg)return;
    const tag=document.createElement('span');tag.className='tag okDepthBadge';
    if(cfg.status==='available'){tag.textContent='〰 Depth Available';tag.style.borderColor='#267b61';tag.style.color='#83efc2';}
    else {tag.textContent='〰 Depth Not Verified';tag.style.opacity='.58';}
    const actions=card.querySelector('.cardActions'); if(actions)card.insertBefore(tag,actions); else card.appendChild(tag);
  });
}
async function init(){
  await getRegistry();
  if(!registry)return;
  if(typeof configureDepth==='function'){
    const original=configureDepth;
    configureDepth=function(){const r=original.apply(this,arguments);setTimeout(applyMapGuard,0);return r};
    setTimeout(applyMapGuard,80);
  }
  badgeDirectory();
  const grid=document.getElementById('grid');if(grid)new MutationObserver(badgeDirectory).observe(grid,{childList:true,subtree:true});
}
init();
})();
