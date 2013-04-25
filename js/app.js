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
		$shareClose = $( '.share-close' ),
		$shareUrl = $( '.share-url' ),
		$shareImage = $( '.share-image' ),
		$shareFacebook = $( '.share-facebook' ),
		$shareTwitter = $( '.share-twitter' ),
		$shareGooglePlus = $( '.share-google-plus' ),
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
		shareFlag = false,
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
		lastTarget = null,
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
		if( e ) {
			e.preventDefault();
		}
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
					skitchData.id = id;
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
					if( shareFlag ) {
						openShare();
						shareFlag = false;	
					}
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
	
	$save.on( 'click', save );
	
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
	
	$undo.on( 'click', undo );
	
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
	
	$download.on( 'click', download );
	
	/*==============================================================================*/
	/* Share */
	/*==============================================================================*/
	function share( e ) {
		e.preventDefault();
		if( ableTo.share ) {
			skip();
			if( saveTrigger ) {
				shareFlag = true;
				save();
			} else {
				openShare();
			}
		}
	}
		
	function setShareData() {
		$shareUrl.val( 'http://itchaskitch.com/' + skitchData.id );
		$shareImage.val( skitchData.awsPath + '/images/' + skitchData.id + '.png' );
		$shareTwitter.attr( 'href', 'https://twitter.com/intent/tweet?url=' + encodeURIComponent( 'http://itchaskitch.com/' + skitchData.id  ) + '&text=' + encodeURIComponent( 'Awesome skitch on Itch A Skitch // The Canvas Powered Etch A Sketch' ) + '&related=itchaskitch&via=itchaskitch&hashtags=itchaskitch' );
	}	
	
	function openShare() {
		$shareOverlay.addClass( 'visible' );
		setShareData();
	}
	
	function closeShare() {
		$shareOverlay.removeClass( 'visible' );
	}
	
	function selectText( e ) {
		$( e.target ).select();
	}
	
	function enableShare() {
		ableTo.share = true;
		$share.removeClass( 'disabled' );
	}
	
	function disableShare() {
		ableTo.share = false;
		$share.addClass( 'disabled' );
	}
	
	$share.on( 'click', share );
	
	$shareUrl.add( $shareImage ).on( 'click', selectText );
	
	$shareClose.on( 'click' , closeShare );
	$document.on( 'click', function( e ) {
		var $target = $( e.target );
		var inShare = $target.parents('.share-overlay').size() || $target.hasClass( 'share-overlay' );
		if( !$target.hasClass( 'share' ) && !$target.hasClass( 'icon-export' ) && $shareOverlay.hasClass( 'visible' ) && !inShare ){ 
			closeShare( e );
		}
	});
	
	$shareFacebook.on('click', function ( e ) {
		e.preventDefault();
		FB.ui(
			{
				method: 'feed',
				name: 'Itch A Skitch',
				caption: 'HTML5 Canvas Powered Etch A Sketch',
				description: 'Itch your skitch with your keyboard, save it, and share it!',
				link: 'http://itchaskitch.com/' + skitchData.id,
				picture: skitchData.awsPath + '/images/' + skitchData.id + '.png'
			},
			function( response ) {			
			}
		);								
	});
	
	$shareGooglePlus.on( 'click', function ( e ) {
		e.preventDefault();
		//window.open( 'https://plus.google.com/share?url=' + encodeURIComponent( 'http://itchaskitch.com/' + skitchData.id ),'', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600' )
		var w = 600;
		var h = 300;
		var left = (win.innerWidth/2)-(w/2);
		var top = (win.innerHeight/2)-(h/2);
		win.open('https://plus.google.com/share?url=' + encodeURIComponent( 'http://itchaskitch.com/' + skitchData.id ), '', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
	});
	
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
					disableShare()
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
	
	$newSkitch.on( 'click', newSkitch );
	
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
	/* Misc Controls and Bindings */
	/*==============================================================================*/
	$canvasWrap.on( 'click', skip );	
	
	/*==============================================================================*/
	/* Page Visibility */
	/*==============================================================================*/
	// http://stackoverflow.com/questions/1060008/is-there-a-way-to-detect-if-a-browser-window-is-not-currently-active
	(function() {
		var hidden = 'hidden';
		if( hidden in doc ) {
			doc.addEventListener( 'visibilitychange', pageVisibilityChange );
		} else if( ( hidden = 'mozHidden' ) in doc ) {
			doc.addEventListener( 'mozvisibilitychange', pageVisibilityChange );
		} else if( ( hidden = 'webkitHidden' ) in doc ) {
			doc.addEventListener( 'webkitvisibilitychange', pageVisibilityChange );
		} else if( ( hidden = 'msHidden' ) in doc ) {
			doc.addEventListener( 'msvisibilitychange', pageVisibilityChange );
		} else if( 'onfocusin' in doc ) {
			doc.onfocusin = doc.onfocusout = pageVisibilityChange;
		} else {
			win.onfocus = win.onblur = pageVisibilityChange;
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
	win.onbeforeunload = function(e) {
		if( saveTrigger && ( lastTarget != 'download' && lastTarget != 'icon-download' ) ){
			return 'You have unsaved changes on your skitch. Stop and press save if you want to keep your changes.';
		}
	};
	
	/* Click Tracking For Download Button */
	/* Used to allow for download without triggering onbeforeunload warning */
	$document.on( 'click', function( e ){								
		lastTarget = e.target.className || null;
	});
	
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