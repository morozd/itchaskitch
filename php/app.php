<?php

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
		return $app['url'].'/img/fb.png';
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
		$stmt = $pdo->prepare('SELECT id, dataurl, datetime FROM skitches ORDER BY datetime DESC LIMIT 30');
		$stmt->execute();
		return $stmt->fetchAll();
	} catch(PDOException $e) {
		echo 'Error: ' . $e->getMessage();
	}
};

function save_skitch($path, $dataurl){
	try {		
		$pdo = new PDO('mysql:host='.DBHOST.';dbname='.DBNAME, DBUSER, DBPASS);  
		$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		$stmt = $pdo->prepare('INSERT INTO skitches VALUES("", :path, :dataurl, :date)');
		$stmt->execute(array(
			':path' => $path,
			':dataurl' => $dataurl,
			':date' => date('Y-m-d H:i:s')
		));
		echo $pdo->lastInsertId();
	} catch(PDOException $e) {
		echo 'Error: ' . $e->getMessage();
	}
};

/*==============================================================================*/
/* Temp Cache */
/*==============================================================================*/
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