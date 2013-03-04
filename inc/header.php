<!doctype html>
<html class="no-canvas">
	<head>
		<meta charset="utf-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
		<title><?php echo get_page_title(); ?></title>	
		<meta name="description" content="<?php echo get_page_description(); ?>" />	
		<meta property="og:description" content="<?php echo get_page_description(); ?>" />
		<meta property="og:title" content="<?php echo get_page_title(); ?>" />
		<meta property="og:site_name" content="<?php echo $app['title']; ?>" />
		<meta property="og:image" content="<?php echo get_page_image(); ?>" />
		<meta property="og:url" content="<?php echo current_url(); ?>" />
		<meta property="og:type" content="website" />
		<meta name="google-site-verification" content="5gd09tdIadOpQGdfCzde1GwHZRXcce5e_HYO6EYN6TE" />
		<script src="//use.typekit.net/hbn2bub.js"></script>
		<script>try{Typekit.load();}catch(e){}</script>
		<link href="http://weloveiconfonts.com/api/?family=entypo" rel="stylesheet" />
		<link href="<?php echo $app['url']; ?>/css/style.1.css" rel="stylesheet" />
		<link href="<?php echo $app['url']; ?>/img/favicon.1.ico" rel="shortcut icon" type="image/x-icon" />	
	</head>
	<body class="page-<?php echo $page['parent']; ?>">
		<nav>
			<div class="inner clearfix">
			<a href="<?php echo $app['url']; ?>"<?php if($page['parent'] == 'home'){ echo ' class="current"'; } ?>>Itch A Skitch</a>
			<a href="<?php echo $app['url']; ?>/skitches"<?php if($page['parent'] == 'skitches'){ echo ' class="current"'; } ?>>Latest Skitches</a>
			<a href="<?php echo $app['url']; ?>/about"<?php if($page['parent'] == 'about'){ echo ' class="current"'; } ?>>About</a>
			<a href="<?php echo $app['url']; ?>/contact"<?php if($page['parent'] == 'contact'){ echo ' class="current"'; } ?>>Contact</a>
			</div><!-- end .inner -->
		</nav>
		<div class="container">
			<header class="clearfix">
				<h1><a href="<?php echo $app['url']; ?>">Itch A Skitch</a></h1>	
				<?php if($page['parent'] == 'home'){ ?>
					<h2><span>Press</span> <i class="entypo-left-open"></i><i class="entypo-right-open"></i><i class="entypo-up-open"></i><i class="entypo-down-open last"></i> <span>or</span> <i>W</i><i>A</i><i>S</i><i class="last">D</i> <span>to Start Itching</span></h2>		
				<?php } ?>
			</header>
			<?php if($page['parent'] != 'home'){ ?>
				<hr />
			<?php } ?>