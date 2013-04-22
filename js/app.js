/*==============================================================================*/
/* RAF Shim */
/*==============================================================================*/
(function(){var lastTime=0;var vendors=['ms','moz','webkit','o'];for(var x=0;x<vendors.length&&!window.requestAnimationFrame;++x){window.requestAnimationFrame=window[vendors[x]+'RequestAnimationFrame'];window.cancelAnimationFrame=window[vendors[x]+'CancelAnimationFrame']||window[vendors[x]+'CancelRequestAnimationFrame'];}if(!window.requestAnimationFrame)window.requestAnimationFrame=function(callback,element){var currTime=new Date().getTime();var timeToCall=Math.max(0,16-(currTime-lastTime));var id=window.setTimeout(function(){callback(currTime+timeToCall);},timeToCall);lastTime=currTime+timeToCall;return id;};if(!window.cancelAnimationFrame)window.cancelAnimationFrame=function(id){clearTimeout(id);};}());

/*==============================================================================*/
/* Itch A Skitch */
/*==============================================================================*/
function itchaskitch(){

	/*==============================================================================*/
	/* Initialize Canvas and General Variables / Options */
	/*==============================================================================*/
	var win = window,
		doc = document,
		$window = $( window ),
		$document = $( document ),
		$body = $( 'body' ),
		$canvasWrap = $( '.canvas-wrap' ),
		$undo = $( '.undo' ),
		$save = $( '.save' ),
		$download = $( '.download' ),
		$share = $( '.share' ),
		$newSkitch = $( '.new-skitch' ),
		$placeholder = $( '.placeholder' ),
		$loader = $( '.loader' ),
		$skitchCount = $( '.skitch-count' ),
		$comments = $( '#disqus_thread' ),
		$timeOverlay = $( '.time-overlay' ),
		$directionsTitle = $( '.directions-title' ),
		$directionsOverlay = $( '.directions-overlay' ),
		$shareOverlay = $( '.share-overlay' ),
		$shareUrl = $( '.share-url' ),
		$shareFacebook = $( '.share-facebook' ),
		$shareTwitter = $( '.share-twitter' ),
		$canvas = $( 'canvas' ),
		canvas = doc.getElementById( 'itchaskitch' ),
		ctx = canvas.getContext( '2d' ),
		width = canvas.width = 800,
		height = canvas.height =  600,
		direction = { 
			up: false, 
			right: false, 
			down: false, 
			left: false
		},
		colors = {
			background: 'hsl(7, 55%, 55%)',
			screen: 'hsl(20, 17%, 85%)',
			knobInner: 'hsl(7, 35%, 95%)',
			knobOuter: 'hsl(7, 45%, 45%)',
			cursor: 'hsla(35, 5%, 95%, .75)',
			path: 'hsla(35, 10%, 30%, .6)'
		},
		screen = {
			x: 75, 
			y: 75, 
			width: width - 150, 
			height: height - 225
		},
		cursor = new Cursor(),
		knobLeft = new Knob({
			type: 'horizontal', 
			x: 75 + 38, 
			y: height - 75
		}),
		knobRight = new Knob({
			type: 'vertical', 
			x: width - 75 - 38, 
			y: height - 75
		}),
		path = [],
		ableTo = {
			save: false,
			undo: false,
			download: false,
			share: false,
			newSkitch: false,
			draw: true
		},
		pageVisible = true,
		rumbling = false,
		redrawFlag = false,
		loopRAF = null,
		eraseTimeout = null,
		saveTrigger = false,
		saveTimeTotal = 300,
		saveTimeTick = saveTimeTotal,
		hasSkitch = skitchData.path.length > 0,
		hasSkitchOx = width / 2,
		hasSkitchOy = height / 2,
		hasSkitchKnob = {
			up: false,
			right: false,
			down: false,
			left: false
		},
		seed = new Date().getTime(),
		watermark = new Image();
	
	watermark.src = 'img/watermark.png';
	
	function coord( number ) {
		return Number( number.toFixed( 1 ) );
	}
	
	function random( min, max ) {
		// sourced from sketch.js - http://soulwire.github.com/sketch.js/
		if( min && typeof min.length === 'number' && !!min.length ) {
			return min[ Math.floor( Math.random() * min.length ) ];
		}
		if( typeof max !== 'number' ) {		
			max = min || 1, min = 0;
		}
		return min + Math.random() * ( max - min );
	}
	
	function commas( nStr ) {
		// add commas to large numbers - source: http://stackoverflow.com/questions/6392102/add-commas-to-javascript-output
		nStr += '';
		x = nStr.split( '.' );
		x1 = x[ 0 ];
		x2 = x.length > 1 ? '.' + x[ 1 ] : '';
		var rgx = /(\d+)(\d{3})/;
		while( rgx.test( x1 ) ) {
			x1 = x1.replace( rgx, '$1' + ',' + '$2' );
		}
		return x1 + x2;
	}
		
	/*==============================================================================*/
	/* Initialize */
	/*==============================================================================*/
	function init() {
		if( hasSkitch ){
			enableUndo();
			enableDownload();
			enableShare();
			enableNewSkitch();
			$comments.show();
		}
		
		$canvas.jrumble({
			x: 4,
			y: 4,
			rotation: 1
		});
		
		ctx.lineCap = 'round';
		Math.seedrandom( seed );
		RAF();
		renderBackground();
		renderScreen();
		knobLeft.render();
		knobRight.render();
	}
	
	/*==============================================================================*/
	/* Cursor Constructor */
	/*==============================================================================*/
	function Cursor() {
		this.x = coord( width / 2 );
		this.y = coord( screen.y + screen.height / 2 );
		this.ox = this.x;
		this.oy = this.y;
		this.vx = 0;
		this.vy = 0;
		this.vMax = 1.6;
		this.vGain = 0.2;
		this.moving = false;
		this.omoving = this.moving;
	}
	
	Cursor.prototype.reset = function() {
		this.x = coord( width / 2 );
		this.y = coord( screen.y + screen.height / 2 );
		this.ox = this.x;
		this.oy = this.y;
		this.vx = 0;
		this.vy = 0;
		this.vMax = 1.6;
		this.vGain = 0.2;
		this.moving = false;
		this.omoving = this.moving;
	}
	
	/*==============================================================================*/
	/* Cursor Update */
	/*==============================================================================*/
	Cursor.prototype.update = function() {
		this.ox = this.x;
		this.oy = this.y;
		
		if( direction.up ) {
			if( this.vy > -this.vMax ) {
				this.vy -= this.vGain;
			}
		}
		if( direction.right ) {
			if( this.vx < this.vMax ) {
				this.vx += this.vGain;
			}
		}
		if( direction.down ){
			if( this.vy < this.vMax ) {
				this.vy += this.vGain;
			}
		}
		if( direction.left ) {
			if( this.vx > -this.vMax ) {
				this.vx -= this.vGain;
			}	
		}
	
		this.x += this.vx;
		this.y += this.vy;
		this.x = coord( this.x );
		this.y = coord( this.y );
	
		if( !direction.up && !direction.down ) {
			this.vy = 0;
		}
		if( !direction.left && !direction.right ) {
			this.vx = 0;
		}
	
		if( this.x > screen.x + screen.width ) {
			this.x = coord( screen.x + screen.width );
		}
		if( this.x < screen.x ) {
			this.x = coord( screen.x );
		}
		if( this.y > screen.y + screen.height ) {
			this.y = coord( screen.y + screen.height );
		}
		if( this.y < screen.y ) {
			this.y = coord( screen.y );
		}
	
		this.omoving = this.moving;
		if( this.x != this.ox || this.y != this.oy ) {
			this.moving = true;
		} else {
			this.moving = false;
		};
	
		if( this.moving ){
			path.push( [ this.x, this.y ] );
		}
	};
	
	/*==============================================================================*/
	/* Cursor Render */
	/*==============================================================================*/
	Cursor.prototype.render = function() {
		ctx.save();
		ctx.beginPath();
		ctx.rect( screen.x, screen.y, screen.width, screen.height );
		ctx.clip();
		ctx.beginPath();
		ctx.arc( this.x, this.y, 1.5, 0, Math.PI * 2, false );
		ctx.fillStyle = colors.cursor;
		ctx.fill();
		ctx.restore();
	};
	
	/*==============================================================================*/
	/* Knob Constructor */
	/*==============================================================================*/
	function Knob( config ) {
		this.type = config.type;
		this.x = config.x;
		this.y = config.y;
		this.radius = 38;
		this.rotation = -Math.PI / 2;
		this.speed = 0.06;
	}
	
	Knob.prototype.reset = function() {
		this.rotation = -Math.PI / 2;
	};
	
	/*==============================================================================*/
	/* Knob Update */
	/*==============================================================================*/
	Knob.prototype.update = function() {
		if( this.type == 'horizontal' ) {
			if( ( direction.right || hasSkitchKnob.right ) && cursor.x < screen.x + screen.width ) {
				this.rotation += this.speed;
			}
			if( ( direction.left || hasSkitchKnob.left ) && cursor.x > screen.x ) {
				this.rotation -= this.speed;
			}
		} else {
			if( ( direction.up || hasSkitchKnob.up ) && cursor.y > screen.y ) {
				this.rotation += this.speed;
			}
			if( ( direction.down || hasSkitchKnob.down ) && cursor.y < screen.y + screen.height ) {
				this.rotation -= this.speed;
			}
		}
	};
	
	/*==============================================================================*/
	/* Knob Render */
	/*==============================================================================*/
	Knob.prototype.render = function() {
		if( !rumbling ) {
			ctx.beginPath();
			ctx.rect( this.x - this.radius - 5, this.y - this.radius - 5, this.radius * 2 + 10, this.radius * 2 + 10 );
			ctx.fillStyle = colors.background;
			ctx.fill();
			
			ctx.beginPath();
			ctx.arc( this.x, this.y, this.radius + 4, 0, Math.PI * 2, false );
			ctx.fillStyle = colors.knobOuter;
			ctx.fill();
			
			ctx.beginPath();
			ctx.arc( this.x, this.y, this.radius, 0, Math.PI * 2, false );
			ctx.fillStyle = colors.knobInner;
			ctx.fill();
					
			ctx.beginPath();
			ctx.moveTo( this.x, this.y );
			ctx.lineTo( this.x + Math.cos( this.rotation ) * this.radius, this.y + Math.sin( this.rotation ) * this.radius );
			ctx.lineWidth = 4;
			ctx.strokeStyle = colors.knobOuter;
			ctx.stroke();
		}
	};
	
	/*==============================================================================*/
	/* Render Background */
	/*==============================================================================*/
	function renderBackground() {
		if( !rumbling ) {
			ctx.fillStyle = colors.background;
			ctx.fillRect( 0, 0, width, height );
		}
	}
	
	/*==============================================================================*/
	/* Render Screen */
	/*==============================================================================*/
	function renderScreen() {
		if( !rumbling ) {
			ctx.fillStyle = colors.screen;
			ctx.fillRect( screen.x, screen.y, screen.width, screen.height ); 
		}
	}
	
	/*==============================================================================*/
	/* Render Watermark */
	/*==============================================================================*/
	function renderWatermark() {
		ctx.save();
		ctx.drawImage( watermark, ( width / 2 ) - ( watermark.width / 2 ), height - 80 );
		ctx.restore();
	}
	
	/*==============================================================================*/
	/* Render Partial Path */
	/*==============================================================================*/
	function renderPartialPath() {
		ctx.save();
		ctx.beginPath();
		ctx.rect( screen.x, screen.y, screen.width, screen.height );
		ctx.clip();
		ctx.shadowBlur = 3;
		ctx.shadowColor = '#fff';
		ctx.lineWidth = 1.5;
		ctx.strokeStyle = colors.path;
		if( !rumbling ) {
			var length = path.length;
			ctx.beginPath();
			ctx.moveTo( cursor.ox, cursor.oy );
			ctx.lineTo( cursor.x, cursor.y );
			ctx.stroke();
			if( Math.floor( random( 0, 2 ) ) == 0 ){
				ctx.fillStyle = 'hsl(0, 0%, ' + random( 40, 100 ) + '%)';	  
				ctx.fillRect( cursor.ox + random( -15, 15 ) / 10, cursor.oy + random( -15, 15 ) / 10, random( 1, 2 ) / 2, random( 1, 2 ) / 2 );
			}
		}
		ctx.restore();
	}
	
	/*==============================================================================*/
	/* Render Full Path */
	/*==============================================================================*/
	function renderFullPath() {
		ctx.save();
		ctx.beginPath();
		ctx.rect( screen.x, screen.y, screen.width, screen.height );
		ctx.clip();
		if( !rumbling ) {
			var length = path.length;
			ctx.shadowBlur = 3;
			ctx.shadowColor = '#fff';
			ctx.lineWidth = 1.5;
			ctx.strokeStyle = colors.path;
			Math.seedrandom( seed );
			for( var i = 0; i < length - 1; i++ ) {
				ctx.beginPath();
				ctx.moveTo( path[ i ][ 0 ], path[ i ][ 1 ] );
				ctx.lineTo( path[ i + 1 ][ 0 ], path[ i + 1 ][ 1 ] );
				ctx.stroke();
				if( Math.floor( random( 0, 2 ) ) == 0 ) {
					ctx.fillStyle = 'hsl(0, 0%, ' + random( 40, 100 ) + '%)';
					ctx.fillRect( path[ i ][ 0 ] + random( -15, 15 ) / 10, path[ i ][ 1 ] + random( -15, 15 ) / 10, random( 1, 2 ) / 2, random( 1, 2 ) / 2 );
				}
			}		
		}
		ctx.restore();
	}
	
	function enableDraw() {
		ableTo.draw = true;
	}
	
	function disableDraw() {
		ableTo.draw = false;
	}
		
	/*==============================================================================*/
	/* Save */
	/*==============================================================================*/
	function save( e ) {
		e.preventDefault();
		if( ableTo.save ) {
			toggleLoading();
			disableDraw();
			disableUndo();
			disableSave();
			$timeOverlay.remove();
			renderWatermark();
			var dataUrl = getDataUrl();
			renderBackground();
			redrawFlag = true;
			$.ajax({
				type: 'POST',
				url: 'php/save-skitch.php',
				data: { 
					path: JSON.stringify( path ),
					dataurl: dataUrl
				}
			}).done(function( id ) {
				$.ajax({
					type: 'POST',
					url: 'php/get-skitch-count.php'
				}).done(function( count ) {
					$skitchCount.text( commas( count ) );
					if( history.pushState ) {
						history.pushState( id, '', id );
					} else {
						location = id;
					}
					enableDraw();
					enableUndo();
					saveTrigger = false;
					DISQUS.reset({
						reload: true,
						config: function() {  
							this.page.identifier = id;  
							this.page.url = location.href;
						}
					});
					$comments.show();
					toggleLoading();
				});		
			});
		}
	}
	
	function enableSave() {
		ableTo.save = true;
		$save.removeClass( 'disabled' );
	}
	
	function disableSave() {
		ableTo.save = false;
		$save.addClass( 'disabled' );
	}
	
	/*==============================================================================*/
	/* Undo */
	/*==============================================================================*/
	function undo( e ) {
		if( path.length > 1 && ableTo.undo ) {
			skip();
			path.pop();
			var length = path.length;
			cursor.x = path[ length - 1 ][ 0 ];
			cursor.y = path[ length - 1 ][ 1 ];
			redrawFlag = true;
			if( path.length == 1 ) {
				disableUndo();
				disableSave();
				disableDownload();
			} else {
				saveTrigger = true;
			}
		}	
	}
	
	function enableUndo() {
		ableTo.undo = true;
		$undo.removeClass( 'disabled' );
	}
	
	function disableUndo() {
		ableTo.undo = false;
		$undo.addClass( 'disabled' );
	}
	
	/*==============================================================================*/
	/* Download */
	/*==============================================================================*/	
	function download(){
		if( ableTo.download ) {
			toggleLoading();
			skip();
			renderWatermark();
			var dataUrl = getDataUrl();
			renderBackground();
			redrawFlag = true;
			$.ajax({
				type: 'POST',
				url: 'php/create-image.php',
				data: {
					dataurl: dataUrl,
					dir: 'temp',
					id: 'temp'
				},
				success: function( data ) {
					document.location.href = 'php/download-image.php?img=' + data;
					toggleLoading();
				}
			});
		}
	}
	
	function enableDownload() {
		ableTo.download = true;
		$download.removeClass( 'disabled' );
	}
	
	function disableDownload() {
		ableTo.download = false;
		$download.addClass( 'disabled' );
	}
	
	/*==============================================================================*/
	/* Share */
	/*==============================================================================*/
	function share() {
		if( ableTo.share ) {
			skip();
			if( saveTrigger ) {
				// need to save first!
			} else {
				// ready to share!
			}
		}
	}
	
	function setShareData() {
		$shareUrl.text();
		$shareFacebook.attr( 'href', '' );
		$shareTwitter.attr( 'href', '' );
		// url
		//https://twitter.com/intent/tweet?url=http%3A%2F%2Fsketchtoy.com%2F29847558&text=Check%20out%20this%20drawing!&related=sketchtoy&via=sketchtoy&hashtags=sketchtoy
		/*
		https://www.facebook.com/dialog/feed?
	  app_id=458358780877780&
	  link=https://developers.facebook.com/docs/reference/dialogs/&
	  picture=http://fbrell.com/f8.jpg&
	  name=Facebook%20Dialogs&
	  caption=Reference%20Documentation&
	  description=Using%20Dialogs%20to%20interact%20with%20users.&
	  redirect_uri=https://mighty-lowlands-6381.herokuapp.com/
	  */
	}
	
	function enableShare() {
		ableTo.share = true;
		$share.removeClass( 'disabled' );
	}
	
	function disableShare() {
		ableTo.share = false;
		$share.addClass( 'disabled' );
	}
	
	/*==============================================================================*/
	/* New Skitch */
	/*==============================================================================*/
	function newSkitch() {
		if( ableTo.newSkitch ) {
			if( confirm( 'Are you sure you want to erase and create a new skitch?' ) ) {
				skip();
				toggleLoading();
				$timeOverlay.remove();
				$comments.hide();
				hasSkitch = false;
				skitchData.path.length = 0;
				clearTimeout( eraseTimeout );
				$canvas.trigger( 'startRumble' );
				rumbling = true;
				eraseTimeout = setTimeout( function() {
					for( var prop in direction ) {
						direction[ prop ] = false;
					}
					path.length = 0;
					$canvas.trigger( 'stopRumble' );
					rumbling = false;
					redrawFlag = true;
					if( history.pushState ) {
						history.pushState( null, null, 'http://itchaskitch.com/dev/' );
					} else {
						location = 'http://itchaskitch.com/dev/';
					}
					disableSave();
					disableUndo();
					disableDownload();
					disableNewSkitch();
					toggleLoading();
				}, 700 );
			}
		}
	}
	
	function enableNewSkitch() {
		ableTo.newSkitch = true;
		$newSkitch.removeClass( 'disabled' );
	}
	
	function disableNewSkitch() {
		ableTo.newSkitch = false;
		$newSkitch.addClass( 'disabled' );
	}
	
	/*==============================================================================*/
	/* Update Placeholder Image */
	/*==============================================================================*/
	function getDataUrl() {
		var knobLeftRotation = knobLeft.rotation;
		var knobRightRotation = knobRight.rotation;
		knobLeft.rotation = knobRight.rotation = -Math.PI / 2;
		knobLeft.render();
		knobRight.render();		
		var dataUrl = canvas.toDataURL();
		knobLeft.rotation = knobLeftRotation;
		knobRight.rotation = knobRightRotation;
		knobLeft.render();
		knobRight.render();
		return dataUrl;
	}
	
	/*==============================================================================*/
	/* Update Placeholder Image */
	/*==============================================================================*/
	function updatePlaceholderImage() {
		$placeholder.attr( 'src', getDataUrl() );
	}
	
	/*==============================================================================*/
	/* Toggle Loading */
	/*==============================================================================*/
	function toggleLoading() {
		if( $loader.hasClass( 'loading' ) ) {
			$loader.removeClass('loading');
			$loader.stop().fadeOut( 300, function() {
				$loader.hide();
			});
		} else {
			$loader.addClass( 'loading' );
			$loader.stop().fadeIn( 300 );
		}
	}
	
	/*==============================================================================*/
	/* Skip */
	/*==============================================================================*/
	function skip() {
		if( hasSkitch ) {
			hasSkitch = false;
			path.push.apply( path, skitchData.path );
			skitchData.path.length = 0;
			redrawFlag = true;
			cursor.x = path[ path.length - 1 ][ 0 ];
			cursor.y = path[ path.length - 1 ][ 1 ];
			hasSkitchKnob.up = false;
			hasSkitchKnob.right = false;
			hasSkitchKnob.down = false;
			hasSkitchKnob.left = false;
		}
	}
	
	/*==============================================================================*/
	/* Key Controls */
	/*==============================================================================*/
	$window.on( 'keydown', function( e ) {
		var key = e.keyCode;
		if( !e.ctrlKey && ableTo.draw ) {
			if( $.inArray( key, [ 37, 38, 39, 40, 65, 68, 83, 87 ] ) != -1 ) {
				e.preventDefault();
				skip();
				$directionsTitle.removeClass( 'hidden' );
				$directionsOverlay.addClass( 'hidden' );
				enableUndo();
				enableDownload();
				enableNewSkitch();
				enableShare();
				saveTrigger = true;
			}
			if( key == 38 || key == 87 ){ direction.up = true; }
			if( key == 39 || key == 68 ){ direction.right = true; }
			if( key == 40 || key == 83 ){ direction.down = true; }
			if( key == 37 || key == 65 ){ direction.left = true; }
		} else if( key == 90 ) {
			undo( e );
		} else if( key == 83 ) {
			save( e );
		}
	});
	
	$window.on( 'keyup', function( e ) {
		var key = e.keyCode;	
		if( $.inArray( key, [ 37, 38, 39, 40, 65, 68, 83, 87 ] ) != -1 ) {
			e.preventDefault();
		}		
		if( key == 38 || key == 87){ direction.up = false; }
		if( key == 39 || key == 68){ direction.right = false; }
		if( key == 40 || key == 83){ direction.down = false; }
		if( key == 37 || key == 65){ direction.left = false; }
		
		if( !direction.up && !direction.right && !direction.down && !direction.left ) {
			redrawFlag = true;
		}
	});
	
	/*==============================================================================*/
	/* Click Controls */
	/*==============================================================================*/
	$undo.on( 'click', undo );
	$save.on( 'click', save );
	$download.on( 'click', download );
	$share.on( 'click', share );
	$newSkitch.on( 'click', newSkitch );
	$canvasWrap.on( 'click', skip );
	
	/*==============================================================================*/
	/* Page Visibility */
	/*==============================================================================*/
	// http://stackoverflow.com/questions/1060008/is-there-a-way-to-detect-if-a-browser-window-is-not-currently-active
	(function() {
		var hidden = 'hidden';
		if( hidden in document ) {
			document.addEventListener( 'visibilitychange', pageVisibilityChange );
		} else if( ( hidden = 'mozHidden' ) in document ) {
			document.addEventListener( 'mozvisibilitychange', pageVisibilityChange );
		} else if( ( hidden = 'webkitHidden' ) in document ) {
			document.addEventListener( 'webkitvisibilitychange', pageVisibilityChange );
		} else if( ( hidden = 'msHidden' ) in document ) {
			document.addEventListener( 'msvisibilitychange', pageVisibilityChange );
		} else if( 'onfocusin' in document ) {
			document.onfocusin = document.onfocusout = pageVisibilityChange;
		} else {
			window.onfocus = window.onblur = pageVisibilityChange;
		}
	})();
	
	function pageVisibilityChange() {
		for( var prop in direction ){
			direction[ prop ] = false;
		}
	}
	
	/*==============================================================================*/
	/* Unsaved Changes Prompt */
	/*==============================================================================*/
	window.onbeforeunload = function() {
		if( saveTrigger ){
			return 'You have unsaved changes on your skitch. Stop and press save if you want to keep your changes.';
		}
	};
	
	/*==============================================================================*/
	/* Loop */
	/*==============================================================================*/
	function loop() {
		if( hasSkitch ){
			var newPoint = skitchData.path.shift();
			cursor.x = newPoint[ 0 ];
			cursor.y = newPoint[ 1 ];
			
			if( newPoint[ 0 ] > hasSkitchOx ) {
				hasSkitchKnob.right = true;
			} else {
				hasSkitchKnob.right = false;
			}
			
			if( newPoint[ 0 ] < hasSkitchOx ) {
				hasSkitchKnob.left = true;
			} else {
				hasSkitchKnob.left = false;
			}
			
			if( newPoint[ 1 ] > hasSkitchOy ) {
				hasSkitchKnob.down = true;
			} else {
				hasSkitchKnob.down = false;
			}
			
			if( newPoint[ 1 ] < hasSkitchOy ) {
				hasSkitchKnob.up = true;
			} else {
				hasSkitchKnob.up = false;
			}
			
			path.push( newPoint );
			
			if( skitchData.path.length == 0 ) {
				hasSkitch = false;
				hasSkitchKnob.up = false;
				hasSkitchKnob.right = false;
				hasSkitchKnob.down = false;
				hasSkitchKnob.left = false;
			}
			
			hasSkitchOx = newPoint[ 0 ];
			hasSkitchOy = newPoint[ 1 ];
			
			renderPartialPath();
		};
		
		cursor.update();
		knobLeft.update();
		knobRight.update();
		knobLeft.render();
		knobRight.render();
		
		if(cursor.moving ) {
			 renderPartialPath();
		}
		
		if( rumbling ) {
			ctx.globalAlpha = 0.15;
			ctx.fillStyle = colors.screen;
			ctx.fillRect( screen.x, screen.y, screen.width, screen.height );
			ctx.globalAlpha = 1;
		}
		
		if( saveTrigger && saveTimeTick >= saveTimeTotal ) {
			enableSave();		
			saveTimeTick = 0;
		} else if( saveTimeTick < saveTimeTotal ) {
			saveTimeTick++;
		}
		
		if( redrawFlag ) {
			renderScreen();		
			renderFullPath();
			updatePlaceholderImage();
			redrawFlag = false;
		}
	}
	
	/*==============================================================================*/
	/* RAF */
	/*==============================================================================*/
	function RAF() {
		loopRAF = requestAnimationFrame( RAF, canvas );
		loop();
	}
	
	/*==============================================================================*/
	/* Initialize */
	/*==============================================================================*/	
	watermark.onload = init;

}

/*==============================================================================*/
/* Check for Canvas Support, Remove Preload */
/*==============================================================================*/
$( window ).load( function() {
	$( 'body' ).removeClass( 'preload' );
	if( $( '.page-home' ).length >= 1 ) {
		if( Modernizr.canvas ) {
			$( 'html' ).removeClass( 'no-canvas' );
			itchaskitch();
		}
	}
});

/*==============================================================================*/
/* Set Proper Relative Dates */
/*==============================================================================*/
$( function() {
	$( '.skitch-date' ).each(function() {
		$this = $( this );
		var date = $this.attr( 'data-gmt' );
		$this.text( moment.utc( date ).fromNow() );
	});
});