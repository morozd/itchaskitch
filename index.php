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
		$skitch_path = file_get_contents(awsPath.'/skitches/'.$skitch_id.'.json');
	};
	$has_skitch = !empty($skitch_id) && !empty($skitch_path);
?>
<?php
$page = array(
	'parent'      => 'home',
	'title'       => '',
	'description' => '',
	'image'       => ($has_skitch) ? awsPath.'/images/'.$skitch['id'].'.png' : ''
);
?>
<?php include 'inc/header.php'; ?>
<div class="canvas-wrap">
	<canvas id="itchaskitch"></canvas>
	<img src="img/placeholder.png" class="placeholder" alt="Itch A Skitch Placeholder" />
	<?php if($has_skitch){ ?>
		<img src="<?php echo awsPath.'/images/'.$skitch['id'].'.png'; ?>" class="no-canvas-skitch" />
	<?php } ?>
	<div class="controls clearfix">	
		<button class="new-skitch disabled"><span class="icon-pencil"></span> New Skitch</button>				
		<button class="save disabled" title="Keyboard: Ctrl + S"><span class="icon-floppy"></span> Save</button>
		<button class="undo disabled" title="Keyboard: Ctrl + Z"><span class="icon-ccw"></span> Undo</button>				
		<button class="download disabled" title="800 &times; 600 PNG"><span class="icon-download"></span> Download</button>
		<button class="share disabled"><span class="icon-export"></span> Share</button>							
	</div><!-- end .controls -->
	<?php if(!$has_skitch){ ?>
		<div class="no-canvas-overlay">
			Itch A Skitch requires canvas, but your browser does not support it. Please download the latest version of a browser that supports canvas, such as <a href="https://google.com/chrome">Chrome</a>, <a href="http://mozilla.org/firefox">Firefox</a>, <a href="http://www.opera.com/download/">Opera</a>, <a href="http://support.apple.com/downloads/#internet">Safari</a> or <a href="http://windows.microsoft.com/en-US/internet-explorer/download-ie">Internet Explorer 9+</a>.
		</div><!-- end .no-canvas-overlay -->
	<?php } ?>
	<?php if(!$has_skitch){ ?>
		<div class="directions-overlay">
			<span>Press</span> <i class="icon-left-open"></i><i class="icon-right-open"></i><i class="icon-up-open"></i><i class="icon-down-open last"></i> <span>or</span> <i>W</i><i>A</i><i>S</i><i class="last">D</i> <span>to Start Itching</span>
		</div><!-- end .directions-overlay -->
	<?php } ?>
	<?php if($has_skitch){ ?>
		<div class="time-overlay">
			<span class="icon-clock"></span> <span class="skitch-date" data-gmt="<?php echo $skitch['datetime']; ?>"></span>
		</div><!-- end .time-overlay -->
	<?php } ?>
	<div class="share-overlay">
		<a href="#" class="share-close"><i class="icon-cancel"></i></a>
		<div class="block"><i class="icon-link"></i><span>Share Link:</span> <input class="share-url" value="http://itchaskitch.com/dev/234" readonly /></div>
		<div class="block"><i class="icon-picture"></i><span>Share Image:</span> <input class="share-image" value="http://itchaskitch.com/dev/234" readonly /></div>
		<a href="#" class="block share-facebook"><i class="icon-facebook"></i>Share on Facebook</a>
		<a href="#" class="block share-twitter"><i class="icon-twitter"></i>Share on Twitter</a>
		<a href="#" class="block share-google-plus"><i class="icon-gplus"></i>Share on Google+</a>
	</div><!-- end .share-overlay -->
</div><!-- end .canvas-wrap -->
<?php if($has_skitch){ ?>
	<div id="disqus_thread" class="has-skitch"></div>
<?php } else { ?>
	<div id="disqus_thread" class="no-skitch"></div>
<?php } ?>
<script>
	var disqus_shortname = 'itchaskitch'; 
	var disqus_identifier = '<?php echo ($has_skitch) ? $skitch_id : 'itchaskitch'; ?>';		
	(function() {
		var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
		dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
		(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
	})();
</script>
<?php include 'inc/footer.php'; ?>