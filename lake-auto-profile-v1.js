/* PittCo Fishing — automatically open the requested lake profile after Lake Directory loads. */
(function(){
'use strict';
function requestedLake(){
  try{
    const direct=new URLSearchParams(window.__PITTCO_ROUTE_SEARCH||'').get('lake');
    if(direct)return direct;
    const route=new URLSearchParams(location.search).get('route');
    if(route){
      const decoded=decodeURIComponent(route),q=decoded.indexOf('?');
      if(q>=0)return new URLSearchParams(decoded.slice(q+1).split('#')[0]).get('lake');
    }
  }catch(e){}
  return null;
}
function openRequested(){
  const id=requestedLake();
  if(!id)return;
  let tries=0;
  const timer=setInterval(function(){
    tries++;
    try{
      const ready=typeof openLake==='function' && Array.isArray(catalog) && catalog.some(function(x){return x.id===id});
      if(ready){
        clearInterval(timer);
        openLake(id);
        setTimeout(function(){
          const panel=document.querySelector('#sheet .panel');
          if(panel)panel.scrollTop=0;
        },80);
      } else if(tries>80){
        clearInterval(timer);
      }
    }catch(e){
      if(tries>80)clearInterval(timer);
    }
  },50);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',openRequested,{once:true});else openRequested();
})();
