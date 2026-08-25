const LAKES={
  'ok-sardis':{code:'SARD',name:'Sardis Lake',dam:'Sardis Dam',pool:599,page:'https://www.swt-wc.usace.army.mil/SARD.lakepage.html'},
  'ok-eufaula':{code:'EUFA',name:'Lake Eufaula',dam:'Eufaula Dam',pool:585,page:'https://www.swt-wc.usace.army.mil/EUFA.lakepage.html'},
  'ok-broken-bow':{code:'BROK',name:'Broken Bow Lake',dam:'Broken Bow Dam',pool:602.5,page:'https://www.swt-wc.usace.army.mil/BROK.lakepage.html'},
  'ok-tenkiller':{code:'TENK',name:'Tenkiller Ferry Lake',dam:'Tenkiller Ferry Dam',pool:632,page:'https://www.swt-wc.usace.army.mil/TENK.lakepage.html'}
};

function nearest24(values,lastTime){
  if(!values.length)return null;
  const target=lastTime-86400000;
  let best=values[0],diff=Math.abs(values[0][0]-target);
  for(const v of values){const d=Math.abs(v[0]-target);if(d<diff){best=v;diff=d;}}
  return best;
}

async function series(code,suffix,unit){
  const q=new URLSearchParams({name:code+'.'+suffix,office:'SWT',begin:'PT-30H',timezone:'America/Chicago',format:'json','page-size':'100',unit});
  const r=await fetch('https://cwms-data.usace.army.mil/cwms-data/timeseries?'+q.toString(),{headers:{Accept:'application/json;version=2'}});
  if(!r.ok)throw new Error('CWMS '+r.status);
  const j=await r.json();
  return (j.values||[]).filter(v=>Array.isArray(v)&&v[1]!=null&&Number.isFinite(Number(v[1]))).map(v=>[Number(v[0]),Number(v[1])]);
}

async function gateStatus(url){
  try{
    const r=await fetch(url,{headers:{'User-Agent':'PittCo-Fishing/1.0'}});
    if(!r.ok)return null;
    const text=(await r.text()).replace(/\s+/g,' ');
    const all=text.match(/All\s+(?:Gates?\s+)?(OPEN|CLOSED)/i);
    if(all)return 'All '+all[1].toUpperCase();
    const gate=text.match(/Gate(?:s| Setting| Settings)?[^<]{0,80}(OPEN|CLOSED)/i);
    if(gate)return gate[1].toUpperCase();
    return null;
  }catch{return null;}
}

module.exports=async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Cache-Control','s-maxage=300, stale-while-revalidate=900');
  if(req.method==='OPTIONS'){res.status(204).end();return;}
  const id=String(req.query&&req.query.lake||'');
  const lake=LAKES[id];
  if(!lake){res.status(404).json({ok:false,error:'Unsupported USACE lake'});return;}
  try{
    const [elev,inflow,outflow,gates]=await Promise.all([
      series(lake.code,'Elev.Inst.1Hour.0.Ccp-Rev','ft').catch(()=>[]),
      series(lake.code,'Flow-Res In.Ave.1Hour.1Hour.Rev-Regi-Computed','cfs').catch(()=>[]),
      series(lake.code,'Flow-Res Out.Ave.1Hour.1Hour.Rev-Regi-Flowgroup','cfs').catch(()=>[]),
      gateStatus(lake.page)
    ]);
    const e=elev.length?elev[elev.length-1]:null;
    const i=inflow.length?inflow[inflow.length-1]:null;
    const o=outflow.length?outflow[outflow.length-1]:null;
    const p=e?nearest24(elev,e[0]):null;
    const level=e?e[1]:null;
    const release=o?o[1]:null;
    res.status(200).json({
      ok:true,lakeId:id,lakeName:lake.name,damName:lake.dam,normalPoolFt:lake.pool,
      currentLakeLevelFt:level,
      feetFromNormal:level==null?null:Number((level-lake.pool).toFixed(2)),
      change24hFt:e&&p?Number((e[1]-p[1]).toFixed(2)):null,
      inflowCfs:i?Math.round(i[1]):null,
      releaseCfs:release==null?null:Math.round(release),
      releaseStatus:release==null?'UNAVAILABLE':release>1?'RELEASING WATER':'NO MEASURABLE RELEASE',
      gateStatus:gates||'Not separately published',
      observedAt:e?new Date(e[0]).toISOString():(o?new Date(o[0]).toISOString():null),
      source:'USACE Tulsa District CWMS',officialPage:lake.page
    });
  }catch(err){res.status(502).json({ok:false,error:'USACE data temporarily unavailable'});}
};
