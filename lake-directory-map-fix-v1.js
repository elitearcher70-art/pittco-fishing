/* PittCo Fishing — keep Lake Directory map navigation inside PittCo. */
(function(){
'use strict';
function goPittCoMap(id){
  if(!id)return;
  try{ if(typeof remember==='function') remember(id); }catch(e){}
  location.href='/?route='+encodeURIComponent('map.html?lake='+id);
}
try{
  if(typeof mapLake==='function'){
    mapLake=function(id){goPittCoMap(id)};
  }
}catch(e){}
})();
