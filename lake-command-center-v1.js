/* PittCo Fishing — Lake Command Center v1 */
(function(){
  'use strict';
  function appData(){try{return JSON.parse(localStorage.getItem('pittco-v4')||'{}')}catch(e){return{}}}
  function lakeMatches(c,lake){var n=((c.lake||'')+'').toLowerCase(), id=((lake.id||'')+'').toLowerCase(), name=((lake.name||'')+'').toLowerCase();return n&&((name&&n.indexOf(name)>=0)||(id&&n.indexOf(id.replace(/^..-/,'').replace(/-/g,' '))>=0));}
  function num(v){var n=parseFloat(v);return isFinite(n)?n:null}
  function history(lake){var catches=(appData().catches||[]).filter(function(c){return lakeMatches(c,lake)}), lure={},tech={},depth=[],best=null;
    catches.forEach(function(c){var l=(c.lure||'Unknown').trim(),t=(c.technique||'').trim(),d=num(c.depth),w=num(c.weight);lure[l]=(lure[l]||0)+1;if(t)tech[t]=(tech[t]||0)+1;if(d!==null)depth.push(d);if(w!==null&&(!best||w>best.weight))best={weight:w,species:c.species||'Bass',lure:l};});
    function top(o){return Object.keys(o).sort(function(a,b){return o[b]-o[a]})[0]||null}
    return {count:catches.length,topLure:top(lure),topTechnique:top(tech),avgDepth:depth.length?Math.round(depth.reduce(function(a,b){return a+b},0)/depth.length):null,best:best};
  }
  function trend(usace){if(!usace)return 'Unknown';var d=num(usace.change24h!=null?usace.change24h:usace.change);if(d===null)return 'Unknown';if(d>.08)return 'Rising';if(d<-.08)return 'Falling';return 'Stable';}
  function plan(lake,wx,usace){var wind=num(wx&&wx.wind),pressure=num(wx&&wx.pressure),code=num(wx&&wx.code),score=6,reasons=[],areas=[],baits=[],depth='6–15 ft',lt=trend(usace),h=history(lake),month=new Date().getMonth()+1;
    if(wind!==null&&wind>=5&&wind<=14){score+=1;reasons.push('fishable wind should position bait');areas.push('wind-blown points and banks')}else if(wind!==null&&wind<3){score-=.5;reasons.push('light wind may make shallow fish less forgiving')}
    if(code!==null&&code>=1){score+=.4;reasons.push('cloud cover can extend moving-bait windows')}
    if(pressure!==null&&pressure<30.05){score+=.4;reasons.push('lower pressure favors activity')}
    if(lt==='Falling'){areas.push('outside edges and first breaks');reasons.push('falling water can pull fish toward breaks')}else if(lt==='Rising'){areas.push('freshly flooded cover and backs of pockets');reasons.push('rising water can move fish shallow')}
    if(month>=6&&month<=9){depth='8–18 ft';areas.push('main-lake points, channel swings and shade');baits=['Football jig','Deep crankbait','Shaky head']}else if(month>=3&&month<=5){depth='2–10 ft';areas.push('secondary points and spawning pockets');baits=['Spinnerbait','Texas rig','Jerkbait']}else if(month>=10&&month<=11){depth='4–14 ft';areas.push('creek mouths and bait-heavy flats');baits=['Crankbait','Spinnerbait','Jig']}else{depth='10–25 ft';areas.push('steep banks and channel structure');baits=['Jerkbait','Jig','Drop shot']}
    if(h.topLure){baits.unshift(h.topLure);reasons.push('your '+lake.name+' history favors '+h.topLure)}
    score=Math.max(1,Math.min(10,Math.round(score*10)/10));return {score:score,label:score>=8?'GREAT':score>=6.5?'GOOD':score>=5?'FAIR':'TOUGH',depth:depth,areas:areas.slice(0,3),baits:baits.filter(function(v,i,a){return a.indexOf(v)===i}).slice(0,3),reasons:reasons.slice(0,3),levelTrend:lt,history:h};
  }
  window.PittCoLakeCommand={history:history,plan:plan,trend:trend};
})();