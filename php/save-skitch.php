<?php
require 'config.php';
require 'app.php';
if(isset($_POST['path']) && !empty($_POST['path']) && isset($_POST['dataurl']) && !empty($_POST['dataurl'])){
	$path = (string) $_POST['path'];
	$dataurl = (string) $_POST['dataurl'];
	save_skitch($path, $dataurl);
};
?>