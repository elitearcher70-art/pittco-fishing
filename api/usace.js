const LAKES={
  'ok-sardis':{code:'SARD',name:'Sardis Lake',dam:'Sardis Dam',pool:599,page:'https://www.swt-wc.usace.army.mil/SARD.lakepage.html'},
  'ok-eufaula':{code:'EUFA',name:'Lake Eufaula',dam:'Eufaula Dam',pool:585,page:'https://www.swt-wc.usace.army.mil/EUFA.lakepage.html'},
  'ok-broken-bow':{code:'BROK',name:'Broken Bow Lake',dam:'Broken Bow Dam',pool:602.5,page:'https://www.swt-wc.usace.army.mil/BROK.lakepage.html'},
  'ok-tenkiller':{code:'TENK',name:'Tenkiller Ferry Lake',dam:'Tenkiller Ferry Dam',pool:632,page:'https://www.swt-wc.usace.army.mil/TENK.lakepage.html'}
};

const MAX_LIVE_AGE_MS=6*60*60*1000;
const MAX_USABLE_AGE_MS=7*24*60*60*1000;

function nearest24(values,lastTime){
  if(!values.length)return null;
  const target=lastTime-86400000;
  let best=values[0],diff=Math.abs(values[0][0]-target);
  for(const v of values){const d=Math.abs(v[0]-target);if(d<diff){best=v;diff=d;}}
  return best;
}

async function series(code,suffix,unit){
  const q=new URLSearchParams({name:code+'.'+suffix,office:'SWT',begin:'PT-168H',timezone:'America/Chicago',format:'json','page-size':'250',unit});
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

function freshness(ts){
  if(!ts)return {status:'UNAVAILABLE',ageHours:null};
  const age=Math.max(0,Date.now()-ts);
  return {
    status:age<=MAX_LIVE_AGE_MS?'LIVE':age<=MAX_USABLE_AGE_MS?'STALE':'UNAVAILABLE',
    ageHours:Number((age/3600000).toFixed(1))
  };
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
    const newestTs=Math.max(e?e[0]:0,i?i[0]:0,o?o[0]:0)||null;
    const fresh=freshness(newestTs);
    const p=e?nearest24(elev,e[0]):null;
    const usable=fresh.status==='LIVE';
    const level=usable&&e?e[1]:null;
    const release=usable&&o?o[1]:null;
    res.status(200).json({
      ok:true,lakeId:id,lakeName:lake.name,damName:lake.dam,normalPoolFt:lake.pool,
      dataStatus:fresh.status,dataAgeHours:fresh.ageHours,
      currentLakeLevelFt:level,
      feetFromNormal:level==null?null:Number((level-lake.pool).toFixed(2)),
      change24hFt:usable&&e&&p?Number((e[1]-p[1]).toFixed(2)):null,
      inflowCfs:usable&&i?Math.round(i[1]):null,
      releaseCfs:release==null?null:Math.round(release),
      releaseStatus:release==null?'UNAVAILABLE':release>1?'RELEASING WATER':'NO MEASURABLE RELEASE',
      gateStatus:gates||'Not separately published',
      observedAt:newestTs?new Date(newestTs).toISOString():null,
      source:'USACE Tulsa District CWMS',officialPage:lake.page
    });
  }catch(err){res.status(502).json({ok:false,error:'USACE data temporarily unavailable'});}
};
