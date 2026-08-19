/* PittCo Fishing — lightweight per-lake bathymetry asset loader.
   Loads only generated contour GeoJSON marked ready in data/bathymetry/manifest.json.
   Existing live OWRB/NOAA/WA/MN/USACE providers remain untouched. */
(function(){
'use strict';
const RAW='https://raw.githubusercontent.com/elitearcher70-art/pittco-fishing/main/';
let manifest=null,assetLayer=null;
async function getManifest(){
  if(manifest)return manifest;
  try{manifest=await fetch(RAW+'data/bathymetry/manifest.json?v=1',{cache:'no-store'}).then(r=>r.ok?r.json():null)}catch(e){manifest=null}
  return manifest;
}
function styleFeature(f){
  const d=Number(f&&f.properties&&f.properties.depth_ft)||0;
  const major=Math.round(d)%20===0;
  return {color:major?'#d991ff':'#55c8ff',weight:major?1.8:1.05,opacity:major?.94:.78};
}
function popup(feature,layer){
  const p=feature.properties||{},d=Number(p.depth_ft);
  if(Number.isFinite(d))layer.bindPopup('<strong>'+d.toFixed(d%1?1:0)+' ft</strong><br>Lake-bottom contour<br><small>'+String(p.source||'Public bathymetry')+' • fishing reference only</small>');
}
async function loadForLake(){
  if(!window.map||!window.lake)return false;
  const m=await getManifest(),cfg=m&&m.lakes&&m.lakes[window.lake.id];
  if(!cfg||cfg.status!=='ready'||!cfg.asset)return false;
  try{
    const gj=await fetch(RAW+cfg.asset+'?v='+encodeURIComponent(cfg.survey||'1'),{cache:'force-cache'}).then(r=>{if(!r.ok)throw Error(r.status);return r.json()});
    if(assetLayer&&map.hasLayer(assetLayer))map.removeLayer(assetLayer);
    assetLayer=L.geoJSON(gj,{style:styleFeature,onEachFeature:popup});
    window.layers.depth=assetLayer;
    if(window.$){$('depthChip').classList.remove('unavailable');$('depthNotice').innerHTML='<strong>Lake Depth:</strong> '+String(cfg.provider||'public').toUpperCase()+' surveyed lake-bottom contours <span class="sourceBadge">'+String(cfg.survey||'SURVEY')+'</span><br>Depths referenced to '+Number(cfg.reference_pool_ft).toFixed(1)+' ft '+String(cfg.vertical_datum||'')+'. Fishing reference only — not for navigation.';$('depthLegendText').textContent='Surveyed lake-bottom contours • depth (ft)'}
    return true;
  }catch(e){console.warn('PittCo bathymetry asset failed',e);return false}
}
const original=window.configureDepth;
if(typeof original==='function'){
  window.configureDepth=function(){original.apply(this,arguments);setTimeout(loadForLake,0)};
  setTimeout(loadForLake,50);
}
})();
