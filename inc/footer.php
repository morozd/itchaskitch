			<hr />
			<footer>
				<p>&copy; <?php echo date('Y'); ?> <a href="http://jackrugile.com" target="_blank"><strong>Jack Rugile </strong></a> <span>//</span> <strong class="skitch-count"><?php echo get_skitch_count(); ?></strong> Skitches <span>//</span> Found a bug or have a suggestion? <a href="https://github.com/jackrugile/itchaskitch/issues" target="_blank"><strong>Submit an Issue on GitHub</strong></a></p>
			</footer>		
		</div><!-- end .container -->
		<?php if($page['parent'] == 'home'){ ?>
			<div class="loader">
				<img src="<?php echo $app['url']; ?>/img/loader.gif" alt="Loader Animation" />
			</div><!-- end .loader -->
			<script src="<?php echo $app['url']; ?>/js/lib.1.js"></script>
			<script src="<?php echo $app['url']; ?>/js/util.1.js"></script>
			<script>
				var skitchData = skitchData || {};
				skitchData.id = <?php echo (empty($skitch_id)) ? 'null' : $skitch_id; ?>;
				skitchData.path = <?php echo (empty($skitch_path)) ? '[]' : $skitch_path; ?>;
			</script>
			<script src="<?php echo $app['url']; ?>/js/app.1.js"></script>
		<?php } ?>
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