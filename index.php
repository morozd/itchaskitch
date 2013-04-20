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
	<canvas id="itchaskitch">Itch A Skitch requires canvas, but your browser does not support it. Please download the latest version of a browser that supports canvas, such as <a href="https://google.com/chrome">Chrome</a>, <a href="http://mozilla.org/firefox">Firefox</a>, <a href="http://www.opera.com/download/">Opera</a>, <a href="http://support.apple.com/downloads/#internet">Safari</a> or <a href="http://windows.microsoft.com/en-US/internet-explorer/download-ie">Internet Explorer 9+</a>.</canvas>
	<img src="img/placeholder.png" class="placeholder" alt="Itch A Skitch Placeholder" />
	<div class="controls clearfix">	
		<button class="new-skitch disabled"><span class="icon-pencil"></span> New Skitch</button>				
		<button class="save disabled" title="Keyboard: Ctrl + S"><span class="icon-floppy"></span> Save</button>
		<button class="undo disabled" title="Keyboard: Ctrl + Z"><span class="icon-ccw"></span> Undo</button>				
		<button class="download disabled" title="800 &times; 600 PNG"><span class="icon-download"></span> Download</button>
		<button class="share disabled"><span class="icon-export"></span> Share</button>							
	</div><!-- end .controls -->
	<?php if(!$has_skitch){ ?>
		<div class="directions-overlay">
			<span>Press</span> <i class="icon-left-open"></i><i class="icon-right-open"></i><i class="icon-up-open"></i><i class="icon-down-open last"></i> <span>or</span> <i>W</i><i>A</i><i>S</i><i class="last">D</i> <span>to Start Itching</span>
		</div><!-- end .directions-overlay -->
	<?php } ?>
	<div class="share-wrap">
	
	</div><!-- end .share-wrap -->
</div><!-- end .canvas-wrap -->

<?php if($has_skitch){ ?>
	<p>Skitch made <span class="skitch-date" data-gmt="<?php echo $skitch['datetime']; ?>"></span></p>
	<div id="disqus_thread"></div>
	<script type="text/javascript">
	/* * * CONFIGURATION VARIABLES: EDIT BEFORE PASTING INTO YOUR WEBPAGE * * */
	var disqus_shortname = 'itchaskitch'; // required: replace example with your forum shortname
	
	/* * * DON'T EDIT BELOW THIS LINE * * */
	(function() {
	var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
	dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
	(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
	})();
	</script>
	<noscript>Please enable JavaScript to view the <a href="http://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
	<a href="http://disqus.com" class="dsq-brlink">comments powered by <span class="logo-disqus">Disqus</span></a>
<?php } ?>

<?php include 'inc/footer.php'; ?>