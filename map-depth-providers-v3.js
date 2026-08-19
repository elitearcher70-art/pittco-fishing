(function(){
  const USACE_IENC='https://services7.arcgis.com/n1YM8pTrFmm7L4hs/ArcGIS/rest/services/USACE_IENC_Master_Service/FeatureServer/36';
  function isUSACEWater(x){
    const n=((x&&x.name)||'').toLowerCase(),id=(x&&x.id)||'';
    return id==='wi-mississippi-pools'||n.includes('mississippi river pool')||n.includes('mississippi river pools');
  }
  if(typeof configureDepth!=='function') return;
  const originalConfigureDepth=configureDepth;
  configureDepth=function(){
    if(!(typeof lake!=='undefined'&&lake&&isUSACEWater(lake)&&window.L&&L.esri)) return originalConfigureDepth();
    if(layers.depth&&map.hasLayer(layers.depth)) map.removeLayer(layers.depth);
    layers.depth=null; state.depth=false;
    const legend=document.getElementById('depthLegend'),chip=document.getElementById('depthChip'),notice=document.getElementById('depthNotice'),legendText=document.getElementById('depthLegendText');
    legend&&legend.classList.remove('on'); chip&&chip.classList.remove('on','unavailable');
    layers.depth=L.esri.featureLayer({url:USACE_IENC,style:{color:'#60d7ff',weight:1.25,opacity:.92}});
    layers.depth.bindPopup(function(layer){const p=layer.feature&&layer.feature.properties||{};return '<b>USACE depth contour</b><br>'+esc(p.Value_of_Depth_Contour||'Depth value unavailable')+(p.Source_Date?'<br><small>Source: '+esc(p.Source_Date)+'</small>':'')});
    if(notice) notice.innerHTML='<strong>Lake Depth:</strong> USACE Inland Electronic Navigational Chart contours <span class="sourceBadge">USACE IENC</span><br>Survey-derived depth curves for covered navigable inland waterways. Zoom in for detail. Fishing reference only — not for navigation.';
    if(legendText) legendText.textContent='USACE inland depth contours';
  };
  try{ if(typeof lake!=='undefined'&&lake&&isUSACEWater(lake)) configureDepth(); }catch(e){ console.warn('USACE depth provider plugin',e); }
})();
