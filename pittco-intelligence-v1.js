/* PittCo Fishing intelligence v1 */
(function(){
  function n(v,d){v=Number(v);return Number.isFinite(v)?v:d}
  function app(){try{return JSON.parse(localStorage.getItem('pittco-v4')||'{}')}catch(e){return{}}}
  function settings(){try{return JSON.parse(localStorage.getItem('pittco-user-settings-v1')||'{}')}catch(e){return{}}}
  function season(m){return m<=2?'Late Winter':m<=5?'Spring':m<=8?'Summer':m<=10?'Fall':'Winter'}
  function plan(ctx){ctx=ctx||{};var wind=n(ctx.wind,0),p=n(ctx.pressure,29.92),temp=n(ctx.temp,72),code=n(ctx.code,0),m=(new Date()).getMonth()+1,score=5.4,reasons=[];
    if(wind>=5&&wind<=14){score+=1.1;reasons.push('fishable wind')} else if(wind>20){score-=1;reasons.push('heavy wind')}
    if(p<29.9){score+=.8;reasons.push('lower pressure')} else if(p>30.25){score-=.6;reasons.push('high pressure')}
    if(code>0&&code<=3){score+=.7;reasons.push('broken cloud cover')} if(code>=51&&code<=82){score+=.35;reasons.push('rain influence')}
    if(temp>=55&&temp<=88)score+=.45; score=Math.max(1,Math.min(10,score));
    var s=season(m),depth='6–14 ft',area='secondary points and channel swings',baits=['1/2 oz football jig — PB&J','shad-pattern crankbait','green-pumpkin shaky head'];
    if(s==='Summer'){depth='10–22 ft';area='main-lake points, ledges and creek-channel turns';baits=['football jig — PB&J','deep-diving shad crankbait','green-pumpkin worm / shaky head']}
    if(s==='Fall'){depth='4–12 ft';area='wind-blown points and creek mouths';baits=['shad-colored crankbait','spinnerbait','walking topwater']}
    if(s==='Winter'||s==='Late Winter'){depth='12–28 ft';area='steep channel swings and deep points';baits=['jig','jerkbait','drop shot']}
    if(s==='Spring'){depth='2–10 ft';area='secondary points, spawning pockets and transition banks';baits=['spinnerbait','Texas-rigged creature bait','squarebill crankbait']}
    return {score:score.toFixed(1),label:score>=8?'GREAT':score>=6.5?'GOOD':score>=5?'FAIR':'TOUGH',depth:depth,area:area,baits:baits,why:(reasons.length?reasons.join(' • '):'seasonal bass positioning')+' • '+s};
  }
  function patterns(lake){var catches=(app().catches||[]).filter(function(c){return !lake||String(c.lake||'').toLowerCase().indexOf(String(lake).toLowerCase())>=0});var lure={},depths=[],weights=[];catches.forEach(function(c){var k=c.lure||c.technique;if(k)lure[k]=(lure[k]||0)+1;var d=n(c.depth,NaN);if(Number.isFinite(d))depths.push(d);var w=n(c.weight,NaN);if(Number.isFinite(w))weights.push(w)});var top=Object.keys(lure).sort(function(a,b){return lure[b]-lure[a]})[0]||null;return {count:catches.length,topLure:top,avgDepth:depths.length?(depths.reduce(function(a,b){return a+b},0)/depths.length).toFixed(1):null,bestWeight:weights.length?Math.max.apply(null,weights).toFixed(2):null};}
  window.PittCoIntel={gamePlan:plan,patterns:patterns,settings:settings};
})();