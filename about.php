<?php require 'php/config.php'; ?>
<?php require 'php/app.php'; ?>
<?php
$page = array(
	'parent'      => 'about',
	'title'       => 'About'.$app['divider'].$app['title'],
	'description' => '',
	'image'       => ''
);
?>
<?php include 'inc/header.php'; ?>
<h3>About</h3>
<p>Itch A Skitch is an HTML5 canvas powered Etch A Sketch. Itch your skitch with your keyboard, save it, and share it! I was inspired to do this by some other canvas projects:</p>
<ul>
	<li><a href="https://developer.cdn.mozilla.net/media/uploads/demos/g/k/gkoberger/5b5d71db4bbf2996755c07c6ef69ebcc/html5-etch-a-sketch_1316389206_demo_package/index.html">HTML5 Etch-A-Sketch</a> by Gregory Koberger</li>
	<li><a href="http://reallygood.co.il/games/sketch/">Etch a Sketch with HTML5 Canvas</a> by Ronny Orbach</li>
	<li><a href="http://sketchtoy.com">Sketch Toy</a> by Hakim El Hattab</li>
</ul>
<p>And of course, a big thanks to the original Etch A Sketch by Andre Cassagnes and <a href="http://www.ohioart.com/">Ohio Art</a>.</p>
<h4>Bugs and Suggestions</h4>
<p>If you find a bug or have any suggestions, you can get in touch the following ways:</p>
	<ul>
		<li>Submit an issue on <a href="https://github.com/jackrugile/itchaskitch/issues">GitHub</a></li>
		<li>Tweet <a href="http://twitter.com/itchaskitch">@itchaskitch</a></li>
		<li>Email contact<span style="display:none">*</span>@itchaskitch.com</li>
	</ul>
<?php include 'inc/footer.php'; ?>