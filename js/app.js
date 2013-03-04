/*==============================================================================*/
/* Page Visibility */
/*==============================================================================*/
// http://stackoverflow.com/questions/1060008/is-there-a-way-to-detect-if-a-browser-window-is-not-currently-active
(function() {	
	var hidden = "hidden";
    // Standards:
    if (hidden in document)
        document.addEventListener("visibilitychange", pageVisibilityChange);
    else if ((hidden = "mozHidden") in document)
        document.addEventListener("mozvisibilitychange", pageVisibilityChange);
    else if ((hidden = "webkitHidden") in document)
        document.addEventListener("webkitvisibilitychange", pageVisibilityChange);
    else if ((hidden = "msHidden") in document)
        document.addEventListener("msvisibilitychange", pageVisibilityChange);

    // IE 9 and lower:
    else if ('onfocusin' in document)
        document.onfocusin = document.onfocusout = pageVisibilityChange;

    // All others:
    else
        window.onfocus = window.onblur = pageVisibilityChange;
})();

/*==============================================================================*/
/* Initialize Canvas and General Variables / Options */
/*==============================================================================*/
var win = window,
	doc = document,
	$window = $(window),
	$document = $(document),
	$body = $('body'),
	$canvasWrap = $('.canvas-wrap'),
	$undo = $('.undo'),
	$save = $('.save'),
	$download = $('.download'),
	$share = $('.share'),
	$newSkitch = $('.new-skitch'),
	$placeholder = $('.placeholder'),
	$loader = $('.loader'),
	$skitchCount = $('.skitch-count'),
	$canvas = $('canvas'),
	canvas = doc.getElementById('itchaskitch'),
	ctx = canvas.getContext('2d'),
	width = canvas.width = 800,
	height = canvas.height =  600,
	direction = {up: false, right: false, down: false, left: false},
	colors = {
		background: 'hsl(7, 55%, 55%)',
		screen: 'hsl(20, 17%, 85%)',
		knobInner: 'hsl(7, 35%, 95%)',
		knobOuter: 'hsl(7, 45%, 45%)',
		cursor: 'hsla(35, 5%, 95%, .75)',
		path: 'hsl(35, 10%, 40%)'
	},
	screen = {x: 75, y: 75, width: width - 150, height: height - 225},
	cursor = new Cursor(),
	knobLeft = new Knob({type: 'horizontal', x: 75 + 38, y: height - 75}),
	knobRight = new Knob({type: 'vertical', x: width - 75 - 38, y: height - 75}),
	path = [],
	ableTo = {
		save: false,
		undo: false,
		download: false,
		share: false,
		newSkitch: false		
	},
	pageVisible = true,
	rumbling = false,
	redrawFlag = false,
	loopRAF = null,
	eraseTimeout = null,
	hasSkitch = skitchData.path.length > 0;
		
if(hasSkitch){
	enableUndo();
	enableDownload();
	enableNewSkitch();
};

$canvas.jrumble({
	x: 4,
	y: 4,
	rotation: 1
});
ctx.lineCap = 'round';

/*==============================================================================*/
/* Initialize */
/*==============================================================================*/
function init(){
	RAF();
	renderBackground();
	renderScreen();
	knobLeft.render();
	knobRight.render();
};

/*==============================================================================*/
/* Cursor Constructor */
/*==============================================================================*/
function Cursor(){
	this.x = util.coord(width / 2);
	this.y = util.coord(screen.y + screen.height / 2);
	this.ox = this.x;
	this.oy = this.y;
	this.vx = 0;
	this.vy = 0;
	this.vMax = 1.6;
	this.vGain = 0.2;
	this.moving = false;
	this.omoving = this.moving;
};

Cursor.prototype.reset = function(){
	this.x = util.coord(width / 2);
	this.y = util.coord(screen.y + screen.height / 2);
	this.ox = this.x;
	this.oy = this.y;
	this.vx = 0;
	this.vy = 0;
	this.vMax = 1.6;
	this.vGain = 0.2;
	this.moving = false;
	this.omoving = this.moving;
};

/*==============================================================================*/
/* Cursor Update */
/*==============================================================================*/
Cursor.prototype.update = function(){
	this.ox = this.x;
	this.oy = this.y;
	
	if(direction.up){
		if(this.vy > -this.vMax){
			this.vy -= this.vGain;
		};
	};
	if(direction.right){
		if(this.vx < this.vMax){
			this.vx += this.vGain;
		};
	};
	if(direction.down){
		if(this.vy < this.vMax){
			this.vy += this.vGain;
		};
	};
	if(direction.left){
		if(this.vx > -this.vMax){
			this.vx -= this.vGain;
		};	
	};

	this.x += this.vx;    
	this.y += this.vy;
	this.x = util.coord(this.x);
	this.y = util.coord(this.y);

	if(!direction.up && !direction.down){
		this.vy = 0;
	};
	if(!direction.left && !direction.right){   
		this.vx = 0;
	};	  

	if(this.x > screen.x + screen.width){
		this.x = util.coord(screen.x + screen.width);
	};
	if(this.x < screen.x){
		this.x = util.coord(screen.x);
	};
	if(this.y > screen.y + screen.height){
		this.y = util.coord(screen.y + screen.height);
	};
	if(this.y < screen.y){
		this.y = util.coord(screen.y);
	};

	this.omoving = this.moving;
	if(this.x != this.ox || this.y != this.oy){
		this.moving = true;
	} else {
		this.moving = false;
	};

	if(this.moving){
		var parallel = false;
		var lastPointIndex = path.length - 1;
		var lastPoint = path[lastPointIndex];
		var secondLastPointIndex = path.length - 2;
		var secondLastPoint = path[secondLastPointIndex];	
		if(this.moving == this.omoving){
			if(secondLastPointIndex > 1 && util.coord((this.y - lastPoint[1]) / (this.x - lastPoint[0])) == util.coord((lastPoint[1] - secondLastPoint[1]) / (lastPoint[0] - secondLastPoint[0]))){
				parallel = true;	
			};		
		};		
		if(parallel){
			path[lastPointIndex] = [this.x, this.y];
		} else {
			path.push([this.x, this.y]);
		};
	};
};

/*==============================================================================*/
/* Cursor Render */
/*==============================================================================*/
Cursor.prototype.render = function(){
	ctx.save();
	ctx.beginPath();
	ctx.rect(screen.x, screen.y, screen.width, screen.height);
	ctx.clip();
	ctx.beginPath();
	ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2, false);
	ctx.fillStyle = colors.cursor;
	ctx.fill();
	ctx.restore();
};

/*==============================================================================*/
/* Knob Constructor */
/*==============================================================================*/
function Knob(config){
	this.type = config.type;
	this.x = config.x;
	this.y = config.y;
	this.radius = 38;
	this.rotation = -Math.PI / 2;
	this.speed = 0.06;
};

Knob.prototype.reset = function(){
	this.rotation = -Math.PI / 2;
};

/*==============================================================================*/
/* Knob Update */
/*==============================================================================*/
Knob.prototype.update = function(){
	if(cursor.moving){
		if(this.type == 'horizontal'){
			if(direction.right){
				this.rotation += this.speed;
			};
			if(direction.left){
				this.rotation -= this.speed;
			};
		} else {
			if(direction.up){
				this.rotation += this.speed;
			};
			if(direction.down){
				this.rotation -= this.speed;
			};
		};
	};
};

/*==============================================================================*/
/* Knob Render */
/*==============================================================================*/
Knob.prototype.render = function(){
	if(!rumbling){
		ctx.beginPath();	
		ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2, false);
		ctx.fillStyle = colors.background;
		ctx.fill();
		
		ctx.beginPath();	
		ctx.arc(this.x, this.y, this.radius + 4, 0, Math.PI * 2, false);
		ctx.fillStyle = colors.knobOuter;
		ctx.fill();
		
		ctx.beginPath();	
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		ctx.fillStyle = colors.knobInner;
		ctx.fill();
				
		ctx.beginPath();
		ctx.moveTo(this.x, this.y);
		ctx.lineTo(this.x + Math.cos(this.rotation) * this.radius, this.y + Math.sin(this.rotation) * this.radius);
		ctx.lineWidth = 4;		
		ctx.strokeStyle = colors.knobOuter;
		ctx.stroke();
	};
};

/*==============================================================================*/
/* Render Background */
/*==============================================================================*/
function renderBackground(){
	if(!rumbling){
		ctx.fillStyle = colors.background;
		ctx.fillRect(0, 0, width, height);
	};
};

/*==============================================================================*/
/* Render Screen */
/*==============================================================================*/
function renderScreen(){
	if(!rumbling){
		ctx.fillStyle = colors.screen;
		ctx.fillRect(screen.x, screen.y, screen.width, screen.height); 
	};
};

/*==============================================================================*/
/* Render Partial Path */
/*==============================================================================*/
function renderPartialPath(){
	ctx.save();
	ctx.beginPath();
	ctx.rect(screen.x, screen.y, screen.width, screen.height);
	ctx.clip();
	if(!rumbling){
		var length = path.length;
		ctx.beginPath();
		ctx.moveTo(cursor.ox, cursor.oy);
		ctx.lineTo(cursor.x, cursor.y);
		ctx.shadowBlur = 3;
		ctx.shadowColor = '#fff';
		ctx.lineWidth = 1.5;
		ctx.strokeStyle = colors.path;	
		ctx.stroke();
	};
	ctx.restore();
};

/*==============================================================================*/
/* Render Full Path */
/*==============================================================================*/
function renderFullPath(){
	ctx.save();
	ctx.beginPath();
	ctx.rect(screen.x, screen.y, screen.width, screen.height);
	ctx.clip();
	if(!rumbling){
		var length = path.length;
		ctx.beginPath();
		for(var i = 0; i < length - 1; i++){			
			ctx.moveTo(path[i][0], path[i][1]);
			ctx.lineTo(path[i + 1][0], path[i + 1][1]);
		};
		ctx.shadowBlur = 3;
		ctx.shadowColor = '#fff';
		ctx.lineWidth = 1.5;
		ctx.strokeStyle = colors.path;	
		ctx.stroke();
	};
	ctx.restore();
};

/*==============================================================================*/
/* Save */
/*==============================================================================*/
function save(){
	if(ableTo.save){
		toggleLoading();
		$.ajax({
			type: 'POST',
			url: 'php/save-skitch.php',
			data: { 
				path: JSON.stringify(path),
				dataurl: getDataUrl()
			}
		}).done(function( id ){
			$.ajax({
				type: 'POST',
				url: 'php/get-skitch-count.php'
			}).done(function( count ){
				$skitchCount.text(util.commas(count));			
				if(history.pushState) {
					history.pushState(id, '', id);
				} else {
					location = id;
				};
				disableSave();
				toggleLoading();
			});		
		});
	};
};

function enableSave(){
	ableTo.save = true;
	$save.removeClass('disabled');
};

function disableSave(){
	ableTo.save = false;
	$save.addClass('disabled');
};

/*==============================================================================*/
/* Undo */
/*==============================================================================*/
function undo(e){
	if(path.length > 1 && ableTo.undo){
		skip();
		path.pop();
		var length = path.length;
		cursor.x = path[length - 1][0];
		cursor.y = path[length - 1][1];
		redrawFlag = true;
		if(path.length == 1){
			disableUndo();
			disableSave();
			disableDownload();
		} else {
			enableSave();	
		}
	};	
};

function enableUndo(){
	ableTo.undo = true;
	$undo.removeClass('disabled');
};

function disableUndo(){
	ableTo.undo = false;
	$undo.addClass('disabled');
};

/*==============================================================================*/
/* Download */
/*==============================================================================*/	
function download(){
	if(ableTo.download){
		toggleLoading();
		skip();
		loop();
		$.ajax({
			type: 'POST',
			url: 'php/create-image.php',
			data: {
				dataurl: getDataUrl(),
				dir: 'temp',
				id: 'temp'
			},
			success: function(data){
				document.location.href = 'php/download-image.php?img='+data;
				toggleLoading();
			}
		});
	};
};

function enableDownload(){
	ableTo.download = true;
	$download.removeClass('disabled');
};

function disableDownload(){
	ableTo.download = false;
	$download.addClass('disabled');
};

/*==============================================================================*/
/* Share */
/*==============================================================================*/
function share(){
	if(ableTo.share){
		
	};
};

function enableShare(){
	ableTo.share = true;
	$share.removeClass('disabled');
};

function disableShare(){
	ableTo.share = false;
	$share.addClass('disabled');
};

/*==============================================================================*/
/* New Skitch */
/*==============================================================================*/
function newSkitch(){
	if(ableTo.newSkitch){
		if(confirm('Are you sure you want to erase and create a new skitch?')){
			toggleLoading();
			hasSkitch = false;
			skitchData.path.length = 0;
			clearTimeout(eraseTimeout);
			$canvas.trigger('startRumble');
			rumbling = true;
			eraseTimeout = setTimeout(function(){
				for(var prop in direction){
					direction[prop] = false;
				};
				path.length = 0;
				$canvas.trigger('stopRumble');
				rumbling = false;
				redrawFlag = true;
				if(history.pushState) {
					history.pushState(null, null, 'http://itchaskitch.com/dev/');
				} else {
					location = 'http://itchaskitch.com/dev/';
				};
				disableSave();
				disableUndo();
				disableDownload();
				disableNewSkitch();
				toggleLoading();
			}, 700);
		};
	};
};

function enableNewSkitch(){
	ableTo.newSkitch = true;
	$newSkitch.removeClass('disabled');
};

function disableNewSkitch(){
	ableTo.newSkitch = false;
	$newSkitch.addClass('disabled');
};

/*==============================================================================*/
/* Update Placeholder Image */
/*==============================================================================*/
function getDataUrl(){
	var knobLeftRotation = knobLeft.rotation;
	var knobRightRotation = knobRight.rotation;
	knobLeft.rotation = knobRight.rotation = -Math.PI / 2;
	knobLeft.render();
	knobRight.render();
	var dataURL = canvas.toDataURL();
	knobLeft.rotation = knobLeftRotation;
	knobRight.rotation = knobRightRotation;
	knobLeft.render();
	knobRight.render();
	return dataURL;
};

/*==============================================================================*/
/* Update Placeholder Image */
/*==============================================================================*/
function updatePlaceholderImage(){
	$placeholder.attr('src', getDataUrl());	
};

/*==============================================================================*/
/* Toggle Loading */
/*==============================================================================*/
function toggleLoading(){
	if($loader.hasClass('loading')){
		$loader.removeClass('loading');
		$loader.stop().fadeOut(300, function(){
			$loader.hide();						 
		});
	} else {
		$loader.addClass('loading');
		$loader.stop().fadeIn(300);
	};	
};

/*==============================================================================*/
/* Skip */
/*==============================================================================*/
function skip(){
	if(hasSkitch){
		hasSkitch = false;		
		path.push.apply(path, skitchData.path);
		skitchData.path.length = 0;
		redrawFlag = true;
		cursor.x = path[path.length - 1][0];
		cursor.y = path[path.length - 1][1];
	};
};

/*==============================================================================*/
/* Key Controls */
/*==============================================================================*/
$window.on('keydown', function(e){	
	var key = e.keyCode;
	if(!e.ctrlKey){
		if($.inArray(key, [37, 38, 39, 40, 65, 68, 83, 87]) != -1){
			e.preventDefault();
			skip();			
			enableUndo();
			enableSave();
			enableDownload();
			enableNewSkitch();
		};
		if(key == 38 || key == 87){ direction.up = true; };
		if(key == 39 || key == 68){ direction.right = true; };
		if(key == 40 || key == 83){ direction.down = true; };
		if(key == 37 || key == 65){ direction.left = true; };
	} else if(key == 90){
		undo(e);
	} else if(key == 83){
		save(e);
	};
});

$window.on('keyup', function(e){
	var key = e.keyCode;	
	if($.inArray(key, [37, 38, 39, 40, 65, 68, 83, 87]) != -1){
		e.preventDefault();
	};			
	if(key == 38 || key == 87){ direction.up = false; };
	if(key == 39 || key == 68){ direction.right = false; };
	if(key == 40 || key == 83){ direction.down = false; };
	if(key == 37 || key == 65){ direction.left = false; };
	
	if(!direction.up && !direction.right && !direction.down && !direction.left){
		redrawFlag = true;
	};
});

/*==============================================================================*/
/* Click Controls */
/*==============================================================================*/
$undo.on('click', undo);
$save.on('click', save);
$download.on('click', download);
$share.on('click', share);
$newSkitch.on('click', newSkitch);
$placeholder.on('click', skip);

/*==============================================================================*/
/* Page Visibility Change */
/*==============================================================================*/
function pageVisibilityChange(){
	for(var prop in direction){
		direction[prop] = false;
	};
};

/*==============================================================================*/
/* Loop */
/*==============================================================================*/
function loop(){
	if(hasSkitch){
		var newPoint = skitchData.path.shift();
		cursor.x = newPoint[0];
		cursor.y = newPoint[1];
		path.push(newPoint);
		redrawFlag = true;
		if(skitchData.path.length == 0){
			hasSkitch = false;
		};
	};
	
	cursor.update();
	knobLeft.update();
	knobRight.update();
	
	if(cursor.moving){	
		knobLeft.render();
		knobRight.render();	
		renderPartialPath();
	};
	
	if(rumbling){
		ctx.globalAlpha = 0.15;
		ctx.fillStyle = colors.screen;
		ctx.fillRect(screen.x, screen.y, screen.width, screen.height);
		ctx.globalAlpha = 1;
	};
	
	if(redrawFlag){
		renderScreen();		
		renderFullPath();
		updatePlaceholderImage();
		redrawFlag = false;
	};
};

/*==============================================================================*/
/* RAF */
/*==============================================================================*/
function RAF(){
	loopRAF = requestAnimationFrame(RAF, canvas);
	loop();
};

/*==============================================================================*/
/* Check for Canvas Support */
/*==============================================================================*/
if(util.canvasSupported){
	$('html').removeClass('no-canvas');
	init();
};
