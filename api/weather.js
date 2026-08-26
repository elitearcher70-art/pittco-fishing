module.exports=async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Cache-Control','s-maxage=300, stale-while-revalidate=900');
  if(req.method==='OPTIONS'){res.status(204).end();return;}
  try{
    const url=new URL(req.url||'/', 'https://pittco.local');
    const lat=Number(url.searchParams.get('lat')),lon=Number(url.searchParams.get('lon'));
    if(!Number.isFinite(lat)||!Number.isFinite(lon)){res.status(400).json({ok:false,error:'lat and lon required'});return;}
    const q=new URLSearchParams({latitude:String(lat),longitude:String(lon),current:'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,surface_pressure,weather_code,precipitation',daily:'temperature_2m_max,temperature_2m_min',temperature_unit:'fahrenheit',wind_speed_unit:'mph',timezone:'auto'});
    const r=await fetch('https://api.open-meteo.com/v1/forecast?'+q.toString());
    if(!r.ok)throw new Error('weather '+r.status);
    const j=await r.json();
    res.status(200).json(j);
  }catch(e){res.status(502).json({ok:false,error:'Weather data temporarily unavailable'});}
};
