			<hr />
			<footer>
				<p>
					&copy; <?php echo date('Y'); ?> Itch A Skitch					 
					<span class="divider">//</span>
					<a href="<?php echo $app['url']; ?>/skitches"><span class="skitch-count"><?php echo get_skitch_count(); ?></span> Skitches</a>
					<span class="divider">//</span>
					Suggestions or bugs? <a href="https://github.com/jackrugile/itchaskitch/issues">Submit an Issue on GitHub</a>
					<span class="divider">//</span>
					By <a href="http://jackrugile.com">Jack Rugile</a>
				</p>
			</footer>		
		</div><!-- end .container -->
		<div class="loader">
			<img src="<?php echo $app['url']; ?>/img/loader.gif" alt="Loader Animation" />
		</div><!-- end .loader -->
		<script src="<?php echo $app['url']; ?>/js/lib.1.js"></script>
		<script>
			var skitchData = {
				siteUrl: '<?php echo $app['url']; ?>',
				awsPath: '<?php echo awsPath; ?>',
				id: <?php echo (empty($skitch_id)) ? 'null' : $skitch_id; ?>,
				path: <?php echo (empty($skitch_path)) ? '[]' : $skitch_path; ?>
			};
		</script>
		<script src="<?php echo $app['url']; ?>/js/app.3.js"></script>
		<script src="//platform.twitter.com/widgets.js"></script>
		<div id="fb-root"></div>
		<script>
			window.fbAsyncInit = function() {
				FB.init({
					appId: '545425965492226',
					channelUrl: '//itchaskitch.com/channel.php',
					status: false,
					xfbml: false
				});			
			};			
			(function(d, s, id){
				var js, fjs = d.getElementsByTagName(s)[0];
				if (d.getElementById(id)) {return;}
				js = d.createElement(s); js.id = id;
				js.src = "//connect.facebook.net/en_US/all.js";
				fjs.parentNode.insertBefore(js, fjs);
			}(document, 'script', 'facebook-jssdk'));
		</script>
		<script>
			var _gaq = _gaq || [];
			_gaq.push(['_setAccount', 'UA-5693606-11']);
			_gaq.push(['_trackPageview']);
			(function() {
				var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
				ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
				var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
			})();
		</script>
	</body>
</html>