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
$lead_no = $_POST["lead_no"];
$leadid = $_POST["leadid"];

$date = date("Y-m-d H:i:s");

//$sql = "UPDATE control_llamadas SET tipo = 'LEAD NUEVO $lead_no $leadid' WHERE id = $llamada_id";
$sql = "INSERT INTO control_llamadas_leadtracking (llamada_id, lead_no, lead_id, fecha_asign)
VALUES ($llamada_id, '$lead_no', $leadid, '$date')";

if ($conn->query($sql) === TRUE) {
    echo "INSERT INTO control_llamadas_leadtracking successfully";
} else {
    echo "Error INSERT INTO control_llamadas_leadtracking: " . $conn->error;
}

$conn->close();
?>