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
<p>Itch A Skitch is an HTML5 canvas powered Etch A Sketch. Itch your skitch with the keyboard, save it, and share it with the world!</p>
<?php include 'inc/footer.php'; ?>