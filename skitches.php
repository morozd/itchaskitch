<?php require 'php/config.php'; ?>
<?php require 'php/app.php'; ?>
<?php
	$skitches = get_skitches();
?>
<?php
$page = array(
	'parent'      => 'skitches',
	'title'       => 'Latest Skitches'.$app['divider'].$app['title'],
	'description' => 'Collection of the most recent skitches.',
	'image'       => ''
);
?>
<?php include 'inc/header.php'; ?>
<div class="skitch-grid clearfix">
	<?php $skitch_max = count($skitches); ?>
	<?php $skitch_tick = 0; ?>
	<?php foreach($skitches as $skitch){ ?>
		<?php $skitch_tick++; ?>
		<a href="http://itchaskitch.com/dev/<?php echo $skitch['id']; ?>"<?php if($skitch_tick % 2 == 0){ echo ' class="last"'; } ?>><img src="<?php echo awsPath.'/images/'.$skitch['id'].'.png'; ?>" /></a>
	<?php } ?>
</div><!-- end .skitch-grid -->
<?php include 'inc/footer.php'; ?>