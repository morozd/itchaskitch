<?php
require 'config.php';
require 'app.php';
if(!isset($_POST['dataurl']) || empty($_POST['dataurl']) || !isset($_POST['dir']) || empty($_POST['dir']) || !isset($_POST['id']) || empty($_POST['id'])){
	echo 'error';
} else {
	$dir = $_POST['dir'];
	$id = $_POST['id'];
	$dataurl = $_POST['dataurl'];		
	create_image($dir, $id, $dataurl);
};
?>