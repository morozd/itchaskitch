<?php
	// source = http://j-query.blogspot.com/2011/02/save-base64-encoded-canvas-image-to-png.html
	if(!isset($_POST['dataurl']) || empty($_POST['dataurl']) || !isset($_POST['dir']) || empty($_POST['dir']) || !isset($_POST['id']) || empty($_POST['id'])){
		echo 'error';
	} else {
		$dir = $_POST['dir'];
		$id = $_POST['id'];
		$dataurl = $_POST['dataurl'];
		define('UPLOAD_DIR', '../'.$dir.'/');		
		$dataurl = str_replace('data:image/png;base64,', '', $dataurl);
		$dataurl = str_replace(' ', '+', $dataurl);
		$data = base64_decode($dataurl);
		$name = ($id == 'temp') ? uniqid('itchaskitch-', true).'.png' : 'itchaskitch-'.$id.'.png';
		$file = UPLOAD_DIR . $name;
		$success = file_put_contents($file, $data);
		echo $name;
	}
?>