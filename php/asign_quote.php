<?php
$servername = "localhost";
$username = "Desarrollo";
$password = "hIm7RAZqYnSjwxD";
$dbname = "passcrm540";
//$port = 3306;
$port = 33307;

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname, $port);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$llamada_id = $_POST["llamada_id"];
$folio = $_POST["folio"];
$date = date("Y-m-d H:i:s");

$sql = "INSERT INTO control_llamadas_seguimiento (llamada_id, seguimiento, fecha_asign) VALUES ('$llamada_id','$folio', '$date')";

//$sql = "UPDATE control_llamadas SET seguimiento = '$folio' WHERE id = $llamada_id";

if ($conn->query($sql) === TRUE) {
    echo "Record updated successfully";
} else {
    echo "Error updating record: " . $conn->error;
}

$conn->close();
?>