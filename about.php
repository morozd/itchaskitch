<?php require 'php/config.php'; ?>
<?php require 'php/app.php'; ?>
<?php
$page = array(
	'parent'      => 'about',
	'title'       => 'About'.$app['divider'].$app['title'],
	'description' => 'Information about Itch A Skitch.',
	'image'       => ''
);
?>
<?php include 'inc/header.php'; ?>
<h3>About</h3>
<?php include 'inc/footer.php'; ?>