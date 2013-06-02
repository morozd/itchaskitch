<?php

session_start();

require 'S3.php';

/*==============================================================================*/
/* Head */
/*==============================================================================*/
function get_page_title(){
	global $app;
	global $page;
	if(empty($page['title'])){
		return $app['title'].$app['divider'].$app['subtitle'];
	} else {
		return $page['title'];	
	};
};

function get_page_description(){
	global $app;
	global $page;
	if(empty($page['description'])){
		return $app['description'];
	} else {
		return $page['description'];	
	};
};

function get_page_image(){
	global $app;
	global $page;
	if(empty($page['image'])){
		return $app['url'].'/img/placeholder.png';
	} else {
		return $page['image'];	
	};
};

/*==============================================================================*/
/* Skitches */
/*==============================================================================*/
function get_skitch_count($featured = false){
	try {
		$pdo = new PDO('mysql:host='.DBHOST.';dbname='.DBNAME, DBUSER, DBPASS);
		$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		if($featured){
			$stmt = $pdo->prepare('SELECT count(*) FROM skitches WHERE featured = 1');
		} else {
			$stmt = $pdo->prepare('SELECT count(*) FROM skitches');
		}
		$stmt->execute();
		return $stmt->fetchColumn();
	} catch(PDOException $e) {
		echo 'Error: ' . $e->getMessage();
	}
};

function get_skitch($id){
	try {
		$pdo = new PDO('mysql:host='.DBHOST.';dbname='.DBNAME, DBUSER, DBPASS);
		$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		$stmt = $pdo->prepare('SELECT * FROM skitches WHERE id = :id');
		$stmt->execute(array(
			':id' => $id
		));
		return $stmt->fetch();
	} catch(PDOException $e) {
		echo 'Error: ' . $e->getMessage();
	}
};

function get_skitches($featured = false, $offset = null, $per_page = null){
	try {
		$pdo = new PDO('mysql:host='.DBHOST.';dbname='.DBNAME, DBUSER, DBPASS);
		$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		$add_limit = (isset($offset, $per_page));
		if($add_limit){
			if($featured){
				$stmt = $pdo->prepare('SELECT * FROM skitches WHERE featured = 1 ORDER BY datetime DESC LIMIT :offset, :per_page');
			} else {
				$stmt = $pdo->prepare('SELECT * FROM skitches ORDER BY datetime DESC LIMIT :offset, :per_page');
			}
			$stmt->bindValue(':offset', intval(trim($offset)), PDO::PARAM_INT);
			$stmt->bindValue(':per_page', intval(trim($per_page)), PDO::PARAM_INT);
		} else {
			if($featured){
				$stmt = $pdo->prepare('SELECT * FROM skitches WHERE featured = 1 ORDER BY datetime DESC LIMIT 30');
			} else {
				$stmt = $pdo->prepare('SELECT * FROM skitches ORDER BY datetime DESC LIMIT 30');
			}
		}		
		$stmt->execute();
		return $stmt->fetchAll();
	} catch(PDOException $e) {
		echo 'Error: ' . $e->getMessage();
	}
};

function save_skitch($path, $dataurl){
	global $app;
	try {		
		$pdo = new PDO('mysql:host='.DBHOST.';dbname='.DBNAME, DBUSER, DBPASS);  
		$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		$stmt = $pdo->prepare('INSERT INTO skitches VALUES("", 0, :date)');
		$stmt->execute(array(
			':date' => gmdate('Y-m-d H:i:s')
		));
		$id = $pdo->lastInsertId();
		echo $id;
		$s3 = new S3(awsAccessKey, awsSecretKey);
		$s3->putObject($path, 'itchaskitch', 'skitches/'.$id.'.json', S3::ACL_PUBLIC_READ);
		
		$image = create_image('temp', $id, $dataurl, $echo = false);
		$s3->putObjectFile('../temp/'.$image, 'itchaskitch', 'images/'.$id.'.png', S3::ACL_PUBLIC_READ);
		
	} catch(PDOException $e) {
		echo 'Error: ' . $e->getMessage();
	}
};

function feature_skitch($id){
	try {
		$pdo = new PDO('mysql:host='.DBHOST.';dbname='.DBNAME, DBUSER, DBPASS);
		$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		$stmt = $pdo->prepare('UPDATE skitches SET featured = 1 WHERE id = :id');
		$stmt->execute(array(
			':id' => $id
		));
	} catch(PDOException $e) {
		echo 'Error: ' . $e->getMessage();
	}
};

function unfeature_skitch($id){
	try {
		$pdo = new PDO('mysql:host='.DBHOST.';dbname='.DBNAME, DBUSER, DBPASS);
		$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		$stmt = $pdo->prepare('UPDATE skitches SET featured = 0 WHERE id = :id');
		$stmt->execute(array(
			':id' => $id
		));
	} catch(PDOException $e) {
		echo 'Error: ' . $e->getMessage();
	}
};

function delete_skitch($id){
	try {
		$pdo = new PDO('mysql:host='.DBHOST.';dbname='.DBNAME, DBUSER, DBPASS);
		$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		$stmt = $pdo->prepare('DELETE FROM skitches WHERE id = :id');
		$stmt->execute(array(
			':id' => $id
		));
	} catch(PDOException $e) {
		echo 'Error: ' . $e->getMessage();
	}
};

/*==============================================================================*/
/* Images */
/*==============================================================================*/
function create_image($dir, $id, $dataurl, $echo = true){
	// source = http://j-query.blogspot.com/2011/02/save-base64-encoded-canvas-image-to-png.html
	define('UPLOAD_DIR', '../'.$dir.'/');		
	$dataurl = str_replace('data:image/png;base64,', '', $dataurl);
	$dataurl = str_replace(' ', '+', $dataurl);
	$data = base64_decode($dataurl);
	$name = ($id == 'temp') ? uniqid('itchaskitch-', true).'.png' : 'itchaskitch-'.$id.'.png';
	$file = UPLOAD_DIR . $name;
	$success = file_put_contents($file, $data);
	if($echo){
		echo $name;
	} else {
		return $name;
	}
};

function check_temp_cache(){
	$dir = 'temp';
	if($handle = opendir($dir)){	
		while(false !== ($file = readdir($handle))){ 
			$filelastmodified = filemtime($dir.'/'.$file);	
			if((time() - $filelastmodified) > 60 * 60){
			   @unlink($dir.'/'.$file);
			};
		};	
		closedir($handle); 
	};
};

/*==============================================================================*/
/* Pagination */
/*==============================================================================*/
function pagination($page, $pages){ 	
	$page = (int) $page;
	$pages = (int) $pages;
	$range = 5;
	$showitems = ($range * 2)+1;	
	if(1 != $pages){
		echo '<ul class="pagination clearfix">';
		if($page > 2 && $page > $range+1 && $showitems < $pages) echo '<li><a href="?page=1" title="First">&laquo;</a></li>';
		if($page > 1 && $showitems < $pages) echo '<li><a href="?page='.($page-1).'" title="Previous">&lsaquo;</a></li>';		
		for ($i=1; $i <= $pages; $i++){
			if (1 != $pages &&( !($i >= $page+$range+1 || $i <= $page-$range-1) || $pages <= $showitems )){
				if($page == $i){
					$class = 'current'; 
				} else {
					$class = ''; 
				}
				echo '<li class="'.$class.'"><a href="?page='.$i.'">'.$i.'</a></li>';
			}
		}		
		if ($page < $pages && $showitems < $pages) echo '<li><a href="?page='.($page+1).'" title="Next">&rsaquo;</a></li>';  
		if ($page < $pages-1 && $page+$range-1 < $pages && $showitems < $pages) echo '<li><a href="?page='.$pages.'" title="Last">&raquo;</a></li>';
		echo '</ul>';
	}
}

/*==============================================================================*/
/* Miscellaneous and Utility */
/*==============================================================================*/
function current_url(){
	return (!empty($_SERVER['HTTPS'])) ? "https://".$_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI'] : "http://".$_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI'];
};

?>