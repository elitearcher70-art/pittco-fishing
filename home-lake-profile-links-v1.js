/* PittCo Fishing — route Home Popular Lakes cards directly to dedicated full lake profiles. */
(function(){
'use strict';
function profileHref(id){return '/?route='+encodeURIComponent('lake-profile.html?lake='+id)}
function patch(){
  const row=document.getElementById('lakeRow');
  if(!row)return;
  row.querySelectorAll('a.lake').forEach(function(a){
    let id=null;
    try{
      const u=new URL(a.href,location.origin),route=new URLSearchParams(u.search).get('route');
      if(route){const d=decodeURIComponent(route),i=d.indexOf('?');if(i>=0)id=new URLSearchParams(d.slice(i+1)).get('lake')}
    }catch(e){}
    if(!id){
      const label=a.querySelector('.lakeText b')?.textContent?.trim().toLowerCase();
      const known={'sardis lake':'ok-sardis','lake eufaula':'ok-eufaula','broken bow lake':'ok-broken-bow','table rock lake':'mo-table-rock'};
      id=known[label]||null;
    }
    if(id)a.href=profileHref(id);
  });
}
function init(){patch();const row=document.getElementById('lakeRow');if(row)new MutationObserver(patch).observe(row,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();