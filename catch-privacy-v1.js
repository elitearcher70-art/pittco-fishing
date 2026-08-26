/* PittCo Fishing — Catch privacy v1 */
(function(){
'use strict';
var LEVELS=['private','water-only','public'];
function normalize(v){return LEVELS.indexOf(v)>=0?v:'private'}
function apply(c,level){c=Object.assign({},c);c.privacy=normalize(level||c.privacy);return c}
function publicView(c){var x=Object.assign({},c),p=normalize(x.privacy);if(p==='private'){delete x.lat;delete x.lon;delete x.location;x.lake='Private catch'}else if(p==='water-only'){delete x.lat;delete x.lon;delete x.location}return x}
window.PittCoPrivacy={levels:LEVELS,normalize:normalize,apply:apply,publicView:publicView};
})();