<!doctype html>
<!--[if lt IE 7]><html class="no-js lt-ie10 lt-ie9 lt-ie8 lt-ie7" lang="en"><![endif]-->
<!--[if IE 7]><html class="no-js lt-ie10 lt-ie9 lt-ie8 ie7" lang="en"><![endif]-->
<!--[if IE 8]><html class="no-js lt-ie10 lt-ie9 ie8" lang="en"><![endif]-->
<!--[if IE 9]><html class="no-js lt-ie10 ie9" lang="en"<![endif]-->
<!--[if gt IE 9]><!--><html lang="en" class="no-js"><!--<![endif]-->
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
		<meta property="fb:app_id" content="545425965492226" />
		<meta property="fb:admins" content="632804651" />
		<meta name="google-site-verification" content="5gd09tdIadOpQGdfCzde1GwHZRXcce5e_HYO6EYN6TE" />
		<script src="//use.typekit.net/hbn2bub.js"></script>
		<script>try{Typekit.load();}catch(e){}</script>
		<link href="<?php echo $app['url']; ?>/css/style.min.2.css" rel="stylesheet" />
		<link href="<?php echo $app['url']; ?>/img/favicon.1.ico" rel="shortcut icon" type="image/x-icon" />
		<script src="//cdnjs.cloudflare.com/ajax/libs/modernizr/2.6.2/modernizr.min.js"></script>
		<script>if(typeof Modernizr == 'undefined'){document.write(unescape("%3Cscript src='<?php echo $app['url']; ?>/js/modernizr.min.js'%3E%3C/script%3E"));}</script>
	</head>
	<body class="preload page-<?php echo $page['parent']; ?>">
		<nav>
			<div class="inner clearfix">
			<a href="<?php echo $app['url']; ?>"<?php if($page['parent'] == 'home'){ echo ' class="current"'; } ?>>Itch A Skitch</a>
			<a href="<?php echo $app['url']; ?>/skitches/featured"<?php if($page['parent'] == 'featured-skitches'){ echo ' class="current"'; } ?>>Featured Skitches</a>
			<a href="<?php echo $app['url']; ?>/skitches"<?php if($page['parent'] == 'skitches'){ echo ' class="current"'; } ?>>Latest Skitches</a>
			<a href="<?php echo $app['url']; ?>/about"<?php if($page['parent'] == 'about'){ echo ' class="current"'; } ?>>About</a>
			</div><!-- end .inner -->
		</nav>
		<div class="container">
			<header class="clearfix">
				<h1><a href="<?php echo $app['url']; ?>">Itch A Skitch</a></h1>	
				<?php if($page['parent'] == 'home'){ ?>
					<h2 class="directions-title<?php if(!$has_skitch){ echo ' hidden'; } ?>"><span>Press</span> <i class="icon-left-open"></i><i class="icon-right-open"></i><i class="icon-up-open"></i><i class="icon-down-open last"></i> <span>or</span> <i>W</i><i>A</i><i>S</i><i class="last">D</i> <span>to Start Itching</span></h2>		
				<?php } ?>
			</header>