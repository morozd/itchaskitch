<?php

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
function get_skitch_count(){
	try {
		$pdo = new PDO('mysql:host='.DBHOST.';dbname='.DBNAME, DBUSER, DBPASS);
		$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		$stmt = $pdo->prepare('SELECT count(*) FROM skitches');
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

function get_skitches(){
	try {
		$pdo = new PDO('mysql:host='.DBHOST.';dbname='.DBNAME, DBUSER, DBPASS);
		$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		$stmt = $pdo->prepare('SELECT * FROM skitches ORDER BY datetime DESC LIMIT 20');
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
		$stmt = $pdo->prepare('INSERT INTO skitches VALUES("", :date)');
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
/* Miscellaneous and Utility */
/*==============================================================================*/
function current_url(){
	return (!empty($_SERVER['HTTPS'])) ? "https://".$_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI'] : "http://".$_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI'];
};

?>