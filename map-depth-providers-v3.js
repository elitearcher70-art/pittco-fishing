(function(){
  const USACE_IENC='https://services7.arcgis.com/n1YM8pTrFmm7L4hs/ArcGIS/rest/services/USACE_IENC_Master_Service/FeatureServer/36';
  function isUSACEWater(x){
    const n=((x&&x.name)||'').toLowerCase(),id=(x&&x.id)||'';
    return id==='wi-mississippi-pools'||n.includes('mississippi river pool')||n.includes('mississippi river pools');
  }
  function pickDepth(p){
    if(!p) return '';
    const keys=['Depth','DEPTH','depth','Depth_ft','DEPTH_FT','LO_DEPTH_Q_FT','HI_DEPTH_Q_FT','LO_DEPTH_Q','HI_DEPTH_Q','CONTOUR','Contour','ELEVATION','Elevation','elevation','Value_of_Depth_Contour','DRVAL1','DRVAL2'];
    for(const k of keys){if(p[k]!==undefined&&p[k]!==null&&String(p[k]).trim()!=='')return String(p[k]);}
    for(const [k,v] of Object.entries(p)){if(/depth|contour/i.test(k)&&v!==undefined&&v!==null&&String(v).trim()!=='')return String(v);}
    return '';
  }
  function attachIdentify(){
    try{
      if(!layers||!layers.depth||typeof layers.depth.identify!=='function'||typeof layers.depth.bindPopup!=='function') return;
      layers.depth.unbindPopup&&layers.depth.unbindPopup();
      layers.depth.bindPopup(function(err,fc){
        if(err||!fc||!fc.features||!fc.features.length) return false;
        const f=fc.features[0],p=f.properties||{},value=pickDepth(p);
        if(!value) return '<b>Verified bathymetry</b><br>Depth feature identified';
        return '<b>Depth contour</b><br><span style="font-size:18px;font-weight:900;color:#73d8ff">'+esc(value)+'</span>';
      });
    }catch(e){console.warn('Depth identify unavailable',e);}
  }
  if(typeof configureDepth!=='function') return;
  const originalConfigureDepth=configureDepth;
  configureDepth=function(){
    if(!(typeof lake!=='undefined'&&lake&&isUSACEWater(lake)&&window.L&&L.esri)){
      const result=originalConfigureDepth();
      setTimeout(attachIdentify,0);
      return result;
    }
    if(layers.depth&&map.hasLayer(layers.depth)) map.removeLayer(layers.depth);
    layers.depth=null; state.depth=false;
    const legend=document.getElementById('depthLegend'),chip=document.getElementById('depthChip'),notice=document.getElementById('depthNotice'),legendText=document.getElementById('depthLegendText');
    legend&&legend.classList.remove('on'); chip&&chip.classList.remove('on','unavailable');
    layers.depth=L.esri.featureLayer({url:USACE_IENC,style:{color:'#60d7ff',weight:1.25,opacity:.92}});
    layers.depth.bindPopup(function(layer){const p=layer.feature&&layer.feature.properties||{};return '<b>USACE depth contour</b><br><span style="font-size:18px;font-weight:900;color:#73d8ff">'+esc(p.Value_of_Depth_Contour||'Depth value unavailable')+'</span>'+(p.Source_Date?'<br><small>Source: '+esc(p.Source_Date)+'</small>':'')});
    if(notice) notice.innerHTML='<strong>Lake Depth:</strong> USACE Inland Electronic Navigational Chart contours <span class="sourceBadge">USACE IENC</span><br>Survey-derived depth curves for covered navigable inland waterways. Zoom in for detail. Tap a contour for its value. Fishing reference only — not for navigation.';
    if(legendText) legendText.textContent='USACE inland depth contours';
  };
  try{ if(typeof lake!=='undefined'&&lake) configureDepth(); }catch(e){ console.warn('Depth provider plugin',e); }
})();
