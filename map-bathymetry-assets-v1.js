/* PittCo Fishing — lightweight per-lake bathymetry asset loader.
   Loads only generated contour GeoJSON marked ready in data/bathymetry/manifest.json.
   Existing live OWRB/NOAA/WA/MN/USACE providers remain untouched. */
(function(){
'use strict';
const RAW='https://raw.githubusercontent.com/elitearcher70-art/pittco-fishing/main/';
let manifest=null,assetLayer=null,loadToken=0;
async function getManifest(){
  if(manifest)return manifest;
  try{manifest=await fetch(RAW+'data/bathymetry/manifest.json?v=3',{cache:'no-store'}).then(r=>r.ok?r.json():null)}catch(e){manifest=null}
  return manifest;
}
function styleFeature(f){
  const d=Number(f&&f.properties&&f.properties.depth_ft)||0;
  const major=Math.abs(d%20)<0.01;
  return {color:major?'#d991ff':'#55c8ff',weight:major?1.8:1.05,opacity:major?.94:.78};
}
function popup(feature,layer){
  const p=feature.properties||{},d=Number(p.depth_ft);
  if(Number.isFinite(d))layer.bindPopup('<strong style="font-size:18px;color:#73d8ff">'+d.toFixed(Math.abs(d-Math.round(d))>.01?1:0)+' ft</strong><br>Lake-bottom contour<br><small>'+String(p.source||'Public bathymetry')+' • fishing reference only</small>');
}
function removeAsset(){try{if(assetLayer&&typeof map!=='undefined'&&map&&map.hasLayer(assetLayer))map.removeLayer(assetLayer)}catch(e){}assetLayer=null}
async function loadForLake(){
  if(typeof map==='undefined'||!map||typeof lake==='undefined'||!lake||typeof L==='undefined')return false;
  const token=++loadToken,currentLakeId=lake.id;
  const m=await getManifest(),cfg=m&&m.lakes&&m.lakes[currentLakeId];
  if(token!==loadToken||typeof lake==='undefined'||lake.id!==currentLakeId)return false;
  if(!cfg||cfg.status!=='ready'||!cfg.asset)return false;
  try{
    const version=cfg.asset_version||cfg.survey||m.version||'1';
    const gj=await fetch(RAW+cfg.asset+'?v='+encodeURIComponent(version),{cache:'no-store'}).then(r=>{if(!r.ok)throw Error(r.status);return r.json()});
    if(token!==loadToken||lake.id!==currentLakeId)return false;
    if(!gj||gj.type!=='FeatureCollection'||!Array.isArray(gj.features)||!gj.features.length)throw Error('empty contour asset');
    removeAsset();
    assetLayer=L.geoJSON(gj,{renderer:L.canvas({padding:.35}),style:styleFeature,onEachFeature:popup});
    layers.depth=assetLayer;
    state.depth=false;
    const chip=document.getElementById('depthChip'),notice=document.getElementById('depthNotice'),legendText=document.getElementById('depthLegendText');
    if(chip)chip.classList.remove('unavailable','on');
    if(notice)notice.innerHTML='<strong>Lake Depth:</strong> '+String(cfg.provider||'public').toUpperCase()+' surveyed lake-bottom contours <span class="sourceBadge">'+String(cfg.survey||'SURVEY')+'</span><br>Depths referenced to '+Number(cfg.reference_pool_ft).toFixed(1)+' ft '+String(cfg.vertical_datum||'')+'. Tap Lake Depth to display them. Fishing reference only — not for navigation.';
    if(legendText)legendText.textContent='Surveyed lake-bottom contours • depth (ft)';
    return true;
  }catch(e){console.warn('PittCo bathymetry asset failed',e);return false}
}
const original=typeof configureDepth==='function'?configureDepth:null;
if(original){
  configureDepth=function(){removeAsset();manifest=null;const result=original.apply(this,arguments);setTimeout(loadForLake,0);return result};
  setTimeout(loadForLake,80);
}
})();
