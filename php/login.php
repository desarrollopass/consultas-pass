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

if (isset($_POST["login"])) {
    $x = $_POST['x'];

    $sql = "SELECT * FROM vtiger_users WHERE user_name = '$x'";

    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
    }

    //$hash = $row['user_password'].$row['user_hash'];
    $hash = $row['user_password'];

    $a = $_POST['a'];

    if (password_verify($a, $hash)) {
        $message = 'true';
        $id = $row['id'];
        $_SESSION["userId"] = "$id";
        $_SESSION["userName"] = "$x";
        $_SESSION["password"] = "$a";
    } else {
        $message = 'La contraseña es incorrecta!';
    }
    
    $userData = array('message' => $message);
    echo json_encode($userData);
    
}

if (isset($_POST["logout"])) {
    session_unset();
}

$conn->close();

?>