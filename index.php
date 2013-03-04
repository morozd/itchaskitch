<?php require 'php/config.php'; ?>
<?php require 'php/app.php'; ?>
<?php
	check_temp_cache();	
	$skitch_count = get_skitch_count();
	$skitch_id = '';
	$skitch_json = array();		
	if(isset($_GET['id']) && !empty($_GET['id'])){
		$id = (int) $_GET['id'];
		$skitch = get_skitch($id);	
		if(!$skitch){
			header('Location: http://itchaskitch.com');
		};
		$skitch_id = $skitch['id'];		
		$skitch_path = $skitch['path'];
	};
	$has_skitch = !empty($skitch_id) && !empty($skitch_path);
?>
<?php
$page = array(
	'parent'      => 'home',
	'title'       => '',
	'description' => '',
	'image'       => ''
);
?>
<?php include 'inc/header.php'; ?>
<div class="canvas-wrap">
	<canvas id="itchaskitch">Itch A Skitch requires canvas, but your browser does not support it. Please download the latest version of a browser that supports canvas, such as <a href="https://google.com/chrome">Chrome</a>, <a href="http://mozilla.org/firefox">Firefox</a>, <a href="http://www.opera.com/download/">Opera</a>, <a href="http://support.apple.com/downloads/#internet">Safari</a> or <a href="http://windows.microsoft.com/en-US/internet-explorer/download-ie">Internet Explorer 9+</a>.</canvas>
	<img src="img/placeholder.png" class="placeholder" alt="Itch A Skitch Placeholder" />

	<div class="controls clearfix">				
		<button class="save disabled" title="Keyboard: Ctrl + S"><span class="entypo-floppy"></span> Save</button>
		<button class="undo disabled" title="Keyboard: Ctrl + Z"><span class="entypo-ccw"></span> Undo</button>				
		<button class="download disabled"><span class="entypo-download"></span> Download</button>
		<button class="share disabled"><span class="entypo-share"></span> Share</button>
		<button class="new-skitch disabled"><span class="entypo-pencil"></span> New Skitch</button>						
	</div><!-- end .controls -->
</div><!-- end .canvas-wrap -->
<?php include 'inc/footer.php'; ?>