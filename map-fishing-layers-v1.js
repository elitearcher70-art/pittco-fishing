/* PittCo Fishing — Fishing Layers v1 */
(function(){
'use strict';
var KEY='pittco-map-layers-v1';
var defaults={depthContours:true,depthBand:false,fishAttractors:true,myCatches:true,myWaypoints:true,vegetation:false,bottomHardness:false,waterClarity:false,publicAccess:true};
function load(){try{return Object.assign({},defaults,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){return Object.assign({},defaults)}}
function save(v){localStorage.setItem(KEY,JSON.stringify(v));window.dispatchEvent(new CustomEvent('pittco:layers',{detail:v}));return v}
function set(name,on){var v=load();if(name in v)v[name]=!!on;return save(v)}
function depthBand(min,max){var v=load();v.depthBand={min:Number(min),max:Number(max)};return save(v)}
function clearDepthBand(){var v=load();v.depthBand=false;return save(v)}
window.PittCoFishingLayers={load:load,set:set,depthBand:depthBand,clearDepthBand:clearDepthBand,defaults:defaults};
})();