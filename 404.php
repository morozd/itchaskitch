<?php require 'php/config.php'; ?>
<?php require 'php/app.php'; ?>
<?php
$page = array(
	'parent'      => '404',
	'title'       => 'Page Not Found'.$app['divider'].$app['title'],
	'description' => 'The page you were looking for could not be found.',
	'image'       => ''
);
?>
<?php include 'inc/header.php'; ?>
<h3>Page Not Found</h3>
<img src="<?php echo $app['url']; ?>/img/404.png" class="image-404" alt="404" />
<p><strong><?php echo current_url(); ?></strong> could not be found. <a href="<?php echo $app['url']; ?>">Return to Itch A Skitch</a></p>
<?php include 'inc/footer.php'; ?>