/* PittCo Fishing — keep Home Popular Lakes visible and route them to full lake profiles. */
(function(){
'use strict';
function profileHref(id){return '/?route='+encodeURIComponent('lake-profile.html?lake='+id)}
var FALLBACK=[
  {id:'ok-sardis',name:'Sardis Lake',state:'Oklahoma',rating:'4.8'},
  {id:'ok-eufaula',name:'Lake Eufaula',state:'Oklahoma',rating:'4.7'},
  {id:'ok-broken-bow',name:'Broken Bow Lake',state:'Oklahoma',rating:'4.9'},
  {id:'mo-table-rock',name:'Table Rock Lake',state:'Missouri',rating:'4.9'}
];
function card(x){return '<a class="lake" href="'+profileHref(x.id)+'"><div class="lakeArt"></div><span class="heart">♡</span><div class="lakeText"><b>'+x.name+'</b><small>'+x.state+'</small></div><div class="rating"><span>★</span> '+x.rating+'</div></a>'}
function ensureFallback(){var row=document.getElementById('lakeRow');if(!row)return;if(!row.querySelector('a.lake'))row.innerHTML=FALLBACK.map(card).join('')}
function patch(){var row=document.getElementById('lakeRow');if(!row)return;ensureFallback();row.querySelectorAll('a.lake').forEach(function(a){var id=null;try{var u=new URL(a.href,location.origin),route=new URLSearchParams(u.search).get('route');if(route){var d=decodeURIComponent(route),i=d.indexOf('?');if(i>=0)id=new URLSearchParams(d.slice(i+1)).get('lake')}}catch(e){}if(!id){var b=a.querySelector('.lakeText b'),label=b?b.textContent.trim().toLowerCase():'';var known={'sardis lake':'ok-sardis','lake eufaula':'ok-eufaula','broken bow lake':'ok-broken-bow','table rock lake':'mo-table-rock'};id=known[label]||null}if(id)a.href=profileHref(id)})}
function init(){patch();var row=document.getElementById('lakeRow');if(row)new MutationObserver(function(){patch()}).observe(row,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
