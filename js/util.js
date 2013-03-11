/*==============================================================================*/
/* RAF Shim */
/*==============================================================================*/
(function(){var lastTime=0;var vendors=['ms','moz','webkit','o'];for(var x=0;x<vendors.length&&!window.requestAnimationFrame;++x){window.requestAnimationFrame=window[vendors[x]+'RequestAnimationFrame'];window.cancelAnimationFrame=window[vendors[x]+'CancelAnimationFrame']||window[vendors[x]+'CancelRequestAnimationFrame'];}if(!window.requestAnimationFrame)window.requestAnimationFrame=function(callback,element){var currTime=new Date().getTime();var timeToCall=Math.max(0,16-(currTime-lastTime));var id=window.setTimeout(function(){callback(currTime+timeToCall);},timeToCall);lastTime=currTime+timeToCall;return id;};if(!window.cancelAnimationFrame)window.cancelAnimationFrame=function(id){clearTimeout(id);};}());

/*==============================================================================*/
/* Miscellaneous / Utility */
/*==============================================================================*/
window.util = {};

util.coord = function(num){
	return Number(num.toFixed(1));
};

util.random = function(min, max){
	// sourced from sketch.js - http://soulwire.github.com/sketch.js/
	if(min && typeof min.length === 'number' && !!min.length){
		return min[Math.floor(Math.random() * min.length)];
	};	
	if(typeof max !== 'number'){		
		max = min || 1, min = 0;
	};	
	return min + Math.random() * (max - min);
};

util.commas = function(nStr){
	// add commas to large numbers - source: http://stackoverflow.com/questions/6392102/add-commas-to-javascript-output
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while(rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
};

util.canvasSupported = function(){
	var elem = document.createElement('canvas');
	return !!(elem.getContext && elem.getContext('2d'));
};