/* PittCo Fishing — keep lake-directory map actions inside PittCo. */
(function(){
'use strict';
function openPittCoMap(id){
  if(!id)return;
  try{
    if(typeof remember==='function') remember(id);
  }catch(e){}
  location.href='/?route='+encodeURIComponent('map.html?lake='+id);
}
function patch(){
  try{
    if(typeof mapLake==='function') mapLake=openPittCoMap;
    if(typeof selected!=='undefined'&&document.getElementById('openMap')){
      document.getElementById('openMap').onclick=function(){if(selected&&selected.id)openPittCoMap(selected.id)};
    }
  }catch(e){console.warn('PittCo lake map routing patch',e)}
}
patch();
setTimeout(patch,150);
document.addEventListener('click',function(e){
  var b=e.target&&e.target.closest&&e.target.closest('[data-map]');
  if(!b)return;
  e.preventDefault();e.stopPropagation();openPittCoMap(b.getAttribute('data-map'));
},true);
})();
