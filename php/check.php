<?php
//echo password_hash("SE@dmin2017", PASSWORD_DEFAULT)."\n";
session_start();

$servername = "localhost";
$username = "Desarrollo";
$password = "hIm7RAZqYnSjwxD";
$dbname = "passcrm540";
//$port = 3306;
$port = 33307;

$conn = new mysqli($servername, $username, $password, $dbname, $port);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}


$userName = $_SESSION["userName"];
$psw = $_SESSION["password"];

$sql = "SELECT * FROM vtiger_users WHERE user_name = '$userName'";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
}

$hash = $row['user_password'];

if (password_verify($psw, $hash)) {
    //echo 'true';
    //echo json_encode($row);
    $message = "true";
} else {
    $message = 'false';
    //session_unset();
}

$userData = array("userId" => $row['id'], "userName" => $row['user_name'], "message" => $message);
echo json_encode($userData);

$conn->close();
?>