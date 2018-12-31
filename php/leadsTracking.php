<?php
$servername = "localhost";
$username = "Desarrollo";
$password = "hIm7RAZqYnSjwxD";
$dbname = "passcrm540";
//$port = 3306;
$port = 33307;

//if($_SERVER['REQUEST_METHOD'] == "POST") {
	
// Create connection
$conn = new mysqli($servername, $username, $password, $dbname, $port);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT c.id, c.tipo
FROM control_llamadas c
WHERE c.tipo LIKE 'LEAD NUEVO%'
ORDER BY c.fecha_hora";
    
$result = $conn->query($sql);
$rows = array();
while($row = $result->fetch_assoc()) {
    $rows[] = $row;
}

foreach ($rows as $row) {
    list($x, $y, $lead_no, $lead_id) = split(' ', $row['tipo']);
    //echo $row['id'] . ' ' . $lead_no . ' ' . $lead_id;
    
    $today = date("Y-m-d H:i:s");
    
    $insert = "INSERT INTO control_llamadas_leadtracking (llamada_id, lead_no, lead_id, fecha_asign) 
    VALUES (".$row['id'].", '$lead_no', $lead_id, '$today')";
    
    if ($conn->query($insert) === TRUE) { 
        echo "INSERT INTO control_llamadas_leadtracking successfully";
    }
}
/*
$result = $conn->query($sql);
if ($result->num_rows > 0) {
    // output data of each row
    $rows = array();
    while($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    $rows = array_map('utf8_encode_array', $rows);
    echo json_encode($rows);
} else {
    if ($conn->error) {
        printf("Error: %s\n", $conn->error);
    } else {
        $cero = array("0 results");
        echo json_encode($cero);
    }
}*/

$conn->close();

function utf8_encode_array($array) {
    return array_map('utf8_encode', $array);
}

?>
