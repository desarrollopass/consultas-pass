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

$fecha_hora = utf8_decode($_POST["fecha_hora"]);
$empresa = utf8_decode($_POST["empresa"]);
$contacto = utf8_decode($_POST["contacto"]);
$tel = utf8_decode($_POST["tel"]);
$email = utf8_decode($_POST["email"]);
$origen = utf8_decode($_POST["origen"]);
$asunto = utf8_decode($_POST["asunto"]);
$seguimiento = utf8_decode($_POST["seguimiento"]);
$solicitud = utf8_decode($_POST["solicitud"]);
$buscado = utf8_decode($_POST["buscado"]);
$asignado = utf8_decode($_POST["asignado"]);
$tipo = utf8_decode($_POST["tipo"]);
$valid = utf8_decode($_POST["valid"]);
$atendio = utf8_decode($_POST["atendio"]);
$tipo_llamada = utf8_decode($_POST["tipo_llamada"]);

$sql = "INSERT INTO control_llamadas (fecha_hora, empresa, contacto, tel, email, tipo, origen, asunto, seguimiento, solicitud, buscado, asignado, db_valid, atendio, tipo_llamada) VALUES ('$fecha_hora', '$empresa', '$contacto', '$tel', '$email', '$tipo', '$origen', '$asunto', '$seguimiento', '$solicitud', '$buscado', '$asignado', '$valid', '$atendio', $tipo_llamada)";

if ($conn->query($sql) === TRUE) {
    echo "INSERT INTO control_llamadas successfully";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?> 