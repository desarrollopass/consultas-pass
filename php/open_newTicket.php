 <?php
$servername = "localhost";
$username = "Desarrollo";
$password = "hIm7RAZqYnSjwxD";
$dbname = "passcrm540";
//$port = 3306;
$port = 33307;

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname, $port);
mysqli_set_charset($conn,"utf8");
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

mysqli_autocommit($conn,FALSE);

$userid = $_POST["userid"];
////echo "userid: ".$userid." ";

/*Regresa el nombre del usuario*/
$sql = "SELECT user_name FROM vtiger_users WHERE id = $userid";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $username = $row["user_name"];
    //echo "username: ".$username." ";
}

$refer = utf8_decode($_POST["refer"]);
//echo "Referencia: ".$refer." ";

$solicitud = utf8_decode($_POST["solicitud"]);
//echo "Solicitud: ".$solicitud." ";

$nomContacto = utf8_decode($_POST["nomContacto"]);
//echo "Contacto: ".$nomContacto." ";

$nomAccount = utf8_decode($_POST["nomAccount"]);
//echo "Cuenta: ".$nomAccount." ";

/*Regresa el id de la cuenta*/
$sql = "SELECT accountid FROM vtiger_account WHERE accountname = '$nomAccount'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $accountid = $row["accountid"];
    //echo "accountid: ".$accountid." ";
}

/*Asigna el tipo de ticket y sus correspondientes parametros
**de acuerdo al nombre de la cuenta*/
if (substr($nomAccount, 0, 1) == "*") {
    $serviceType = "Poliza";
    $condicion = "Sin Cargo";
    $cobrado = 1;
    $facturado = 1;
    $contPolizas = "Si";
} else {
    $serviceType = "Regular";
    $condicion = "Con Cargo";
    $cobrado = 0;
    $facturado = 0;
    $contPolizas = "No";
}
//echo "ServiceType: ".$serviceType." ";
//echo "Condición: ".$condicion." ";
//echo "Cobrado: ".$cobrado." ";
//echo "Facturado: ".$facturado." ";
//echo "ContPolizas: ".$contPolizas." ";

/*Obtiene el último id de ticket*/
$sql = "SELECT crmid FROM vtiger_crmentity ORDER BY crmid DESC LIMIT 1";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $ticketid = $row["crmid"] + 1;
    //echo "ticketid: ".$ticketid." ";
}

/*Obtiene el último número de ticket*/
$sql = "SELECT ticket_no FROM vtiger_troubletickets ORDER BY ticketid DESC LIMIT 1";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $ticketno = $row["ticket_no"];
    $num = (int)substr($ticketno, 2);
    $num++;
    $ticketno = "TT".$num;
    //echo "ticketno: ".$ticketno." ";
}

$updateLog = "Ticket created. Assigned to  group Service Group -- ".date('l jS F Y h:i:s A')." by $username--/";
//echo "updateLog: ".$updateLog." ";

/*Obtiene el id de la llamada*/
$llamadaId = $_POST["llamadaId"];
//echo "llamadaId: ".$llamadaId." ";

//INSERT INTO vtiger_crmentity
$sql = "INSERT INTO vtiger_crmentity VALUES ($ticketid, $userid, 4, $userid, 'HelpDesk', '$solicitud', NOW(), NOW(), NOW(), NULL, 0, 1, 0)";

if ($conn->query($sql) === TRUE) { 
    //echo "INSERT INTO vtiger_crmentity: successfully";
    
    //UPDATE vtiger_crmentity_seq
    $sql = "UPDATE vtiger_crmentity_seq vcs SET vcs.id = vcs.id + 1";
    if ($conn->query($sql) === TRUE) {
        //echo "UPDATE vtiger_crmentity_seq successfully";
        
        //INSERT INTO vtiger_troubletickets
        $sql = "INSERT INTO vtiger_troubletickets
        VALUES ($ticketid, '$ticketno', NULL, $accountid, 1143, 'Normal', 'Minor', 'Open', 'Consultoria', '$refer', '', '$updateLog', NULL, 0, 0, 0)";

        if ($conn->query($sql) === TRUE) { 
            //echo "INSERT INTO vtiger_troubletickets successfully";
            
            //UPDATE vtiger_modentity_num
            $sql = "UPDATE vtiger_modentity_num SET  cur_id=cur_id+1 WHERE semodule='HelpDesk' AND active=1";
            
            if ($conn->query($sql) === TRUE) {
                //echo "UPDATE vtiger_modentity_num successfully";
                
                $today = date("Y-m-d");
                //INSERT INTO vtiger_ticketcf
                $sql = "INSERT INTO vtiger_ticketcf VALUES ($ticketid, '$serviceType', '$condicion', $cobrado, $facturado, NULL, '$contPolizas', '', '', '', '', '', '$today', '23:00:00', '$nomContacto', 0, '', 'Remoto', '600', 'Admon', '', '', '', '', '', '', 'No', '', '', 'Leonardo', 'Ventas', '')";

                if ($conn->query($sql) === TRUE) { 
                    //echo "INSERT INTO vtiger_ticketcf successfully";

                    //INSERT INTO control_llamadas_seguimiento
                    $date = date("Y-m-d H:i:s");
                    $sql = "INSERT INTO control_llamadas_seguimiento (llamada_id, seguimiento, fecha_asign) VALUES ('$llamadaId','$ticketno', '$date')";

                    if ($conn->query($sql) === TRUE) {
                        mysqli_commit($conn);
                        echo $ticketno;
                        //echo "INSERT INTO control_llamadas_seguimiento successfully";
                    }
                    else {mysqli_rollback($conn); echo "Error: " . $sql . "<br>" . $conn->error; }
                }
                else {mysqli_rollback($conn); echo "Error: " . $sql . "<br>" . $conn->error; }
            }
            else {mysqli_rollback($conn); echo "Error: " . $sql . "<br>" . $conn->error; }
        }
        else {mysqli_rollback($conn); echo "Error: " . $sql . "<br>" . $conn->error; }
    }
    else {mysqli_rollback($conn); echo "Error: " . $sql . "<br>" . $conn->error; }
}
else {mysqli_rollback($conn); echo "Error: " . $sql . "<br>" . $conn->error; }

$conn->close();
?>