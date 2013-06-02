<?php require 'php/config.php'; ?>
<?php require 'php/app.php'; ?>
<?php
$count = get_skitch_count(true);
$page_number = (isset($_GET['page'])) ? (int)$_GET['page'] : 1;
$per_page = 30;
$offset = $per_page * ($page_number-1);
$pages = ceil($count / $per_page);
$skitches = get_skitches(true, $offset, $per_page);
?>
<?php
$page = array(
	'parent'      => 'featured-skitches',
	'title'       => (($page_number > 1) ? 'Page '.$page_number.$app['divider'] : '').'Featured Skitches'.$app['divider'].$app['title'],
	'description' => '',
	'image'       => ''
);
?>
<?php include 'inc/header.php'; ?>
<h3>Featured Skitches</h3>
<div class="skitch-grid clearfix">
	<?php if(count($skitches) > 0){ ?>
		<?php $skitch_tick = 0; ?>
		<?php foreach($skitches as $skitch){ ?>
			<?php $skitch_tick++; ?>		
			<a href="<?php echo $app['url']; ?>/<?php echo $skitch['id']; ?>"<?php if($skitch_tick % 3 == 0){ echo ' class="end-row"'; } ?>>
				<img src="<?php echo awsPath.'/images/'.$skitch['id'].'.png'; ?>" />
				<p class="skitch-info">
					<span class="icon-clock"></span> <span class="skitch-date" data-gmt="<?php echo $skitch['datetime']; ?>"></span>
				</p>
				<div class="skitch-view">View Skitch</div>
			</a>
		<?php } ?>
	<?php } else { ?>
		<p>No featured skitches yet.</p>
	<?php } ?>
</div><!-- end .skitch-grid -->
<?php 
	if($pages > 1){
		pagination($page_number, $pages);	
	} 
?>
<?php include 'inc/footer.php'; ?>