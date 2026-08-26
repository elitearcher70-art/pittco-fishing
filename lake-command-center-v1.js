/* PittCo Fishing — Lake Command Center v2 */
(function(){
  'use strict';
  var STORE='pittco-v4';
  function appData(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch(e){return{}}}
  function lakeMatches(c,lake){var n=((c.lake||'')+'').toLowerCase(),id=((lake.id||'')+'').toLowerCase(),name=((lake.name||'')+'').toLowerCase(),slug=id.replace(/^..-/,'').replace(/-/g,' ');return !!n&&((name&&n.indexOf(name)>=0)||(slug&&n.indexOf(slug)>=0)||(id&&n.indexOf(id)>=0));}
  function num(v){var n=parseFloat(v);return isFinite(n)?n:null}
  function history(lake){var catches=(appData().catches||[]).filter(function(c){return lakeMatches(c,lake)}),lure={},tech={},depth=[],best=null,lastCatch=null;
    catches.forEach(function(c){var l=(c.lure||'Unknown').trim(),t=(c.technique||c.presentation||'').trim(),d=num(c.depth),w=num(c.weight),dt=new Date(c.date||c.createdAt||0).getTime();lure[l]=(lure[l]||0)+1;if(t)tech[t]=(tech[t]||0)+1;if(d!==null)depth.push(d);if(w!==null&&(!best||w>best.weight))best={weight:w,species:c.species||'Bass',lure:l,technique:t||null};if(dt&&(!lastCatch||dt>lastCatch.time))lastCatch={time:dt,lure:l,technique:t||null,depth:d,weight:w};});
    function top(o){return Object.keys(o).sort(function(a,b){return o[b]-o[a]})[0]||null}
    return {count:catches.length,topLure:top(lure),topTechnique:top(tech),avgDepth:depth.length?Math.round((depth.reduce(function(a,b){return a+b},0)/depth.length)*10)/10:null,best:best,last:lastCatch};
  }
  function trend(usace){if(!usace)return'Unknown';var d=num(usace.change24hFt!=null?usace.change24hFt:(usace.change24h!=null?usace.change24h:usace.change));if(d===null)return'Unknown';if(d>.08)return'Rising';if(d<-.08)return'Falling';return'Stable';}
  function seasonal(month){if(month>=3&&month<=5)return{depth:'2–10 ft',areas:['secondary points','transition banks','spawning pockets'],baits:[['Spinnerbait','slow-roll or burn with wind'],['Texas rig','pitch cover and transitions'],['Jerkbait','pause around staging fish']]};if(month>=6&&month<=9)return{depth:'8–18 ft',areas:['main-lake points','channel swings','shade / current edges'],baits:[['Football jig','drag and stroke hard bottom'],['Deep crankbait','contact bottom on points'],['Shaky head','slow down on pressured fish']]};if(month>=10&&month<=11)return{depth:'4–14 ft',areas:['creek mouths','bait-heavy flats','wind-blown points'],baits:[['Crankbait','cover water with shad profile'],['Spinnerbait','work wind and stained water'],['Jig','probe remaining cover']]};return{depth:'10–25 ft',areas:['steep channel swings','deep points','vertical cover'],baits:[['Jerkbait','long pauses over depth'],['Jig','crawl steep rock'],['Drop shot','target suspended or pressured fish']]};}
  function plan(lake,wx,usace){wx=wx||{};var wind=num(wx.wind),pressure=num(wx.pressure),code=num(wx.code),score=6,reasons=[],s=seasonal(new Date().getMonth()+1),areas=s.areas.slice(),presentations=s.baits.slice(),lt=trend(usace),h=history(lake),depth=s.depth;
    if(wind!==null&&wind>=5&&wind<=14){score+=1;reasons.push('Fishable wind should position bait and create ambush edges.');areas.unshift('wind-blown banks / points');}else if(wind!==null&&wind<3){score-=.5;reasons.push('Very light wind can make shallow fish less forgiving.');}
    if(code!==null&&code>=1&&code<=82){score+=.4;reasons.push('Cloud cover or precipitation can extend moving-bait windows.');}
    if(pressure!==null&&pressure<30.05){score+=.4;reasons.push('Lower pressure generally supports activity and roaming fish.');}else if(pressure!==null&&pressure>30.25){score-=.4;reasons.push('Higher pressure favors a slower, tighter presentation.');}
    if(lt==='Falling'){areas.unshift('outside edges / first breaks');reasons.push('Falling water can pull fish toward the first dependable break.');}else if(lt==='Rising'){areas.unshift('freshly flooded cover / pocket backs');reasons.push('Rising water can move fish into newly available shallow cover.');}
    if(h.avgDepth!==null){depth=Math.max(1,Math.round(h.avgDepth-3))+'–'+Math.round(h.avgDepth+3)+' ft';reasons.push('Pattern Memory centers your historical bites near '+h.avgDepth+' ft.');}
    if(h.topLure){presentations.unshift([h.topLure,h.topTechnique?'Repeat your '+h.topTechnique+' cadence from stored catches.':'Start with the bait that has produced most often here.']);reasons.push('Your stored '+lake.name+' catches favor '+h.topLure+'.');}
    var seen={};presentations=presentations.filter(function(x){var k=x[0].toLowerCase();if(seen[k])return false;seen[k]=1;return true;}).slice(0,4);areas=areas.filter(function(v,i,a){return a.indexOf(v)===i;}).slice(0,4);score=Math.max(1,Math.min(10,Math.round(score*10)/10));
    return {score:score,label:score>=8?'GREAT':score>=6.5?'GOOD':score>=5?'FAIR':'TOUGH',depth:depth,startingStructure:areas[0]||'Primary structure',areas:areas,presentations:presentations,baits:presentations.map(function(x){return x[0];}),reasons:reasons.slice(0,4),levelTrend:lt,history:h};
  }
  function fishHref(lake){return '/?route='+encodeURIComponent('map.html?lake='+lake.id)}
  function logHref(){return '/?route=legacy.html%23catches'}
  window.PittCoLakeCommand={history:history,plan:plan,trend:trend,fishHref:fishHref,logHref:logHref};
})();
