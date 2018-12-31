<?php
$servername = "localhost";
$username = "Desarrollo";
$password = "hIm7RAZqYnSjwxD";
$dbname = "passcrm540";
//$port = 3306;
$port = 33307;

if($_SERVER['REQUEST_METHOD'] == "POST") {
	
	// Create connection
	$conn = new mysqli($servername, $username, $password, $dbname, $port);
    mysqli_set_charset($conn,"utf8");
	// Check connection
	if ($conn->connect_error) {
		die("Connection failed: " . $conn->connect_error);
	}
	
	if (isset($_POST["get_accounts"])) {
		$sql = "SELECT accountname FROM vtiger_account";
	}
    
    if (isset($_POST["get_leadsCompanies"])) {
        $sql = "SELECT DISTINCT company 
                FROM vtiger_leaddetails
                WHERE rating <> 'Lead Invalido'";
    }
    
	if (isset($_POST["get_contacts"])) {
        $account = $_POST["account"];
		$sql = "SELECT c.salutation, c.firstname, c.lastname, c.email, c.phone, c.mobile
                FROM vtiger_contactdetails c
                LEFT JOIN vtiger_account ON c.accountid = vtiger_account.accountid
                WHERE vtiger_account.accountname = '$account'
                ORDER BY firstname";
	}
    
    if (isset($_POST["get_allContacts"])) {
        $account = $_POST["account"];
		$sql = "SELECT c.salutation, c.firstname, c.lastname, c.email, c.phone, c.mobile, a.accountname
                FROM vtiger_contactdetails c
                LEFT JOIN vtiger_account a ON c.accountid = a.accountid
                ORDER BY firstname";
	}
        
    if (isset($_POST["get_leads"])) {
		$sql = "SELECT ld.salutation, ld.firstname, ld.lastname, ld.email, la.phone, la.mobile, ld.company
                FROM vtiger_leaddetails ld, vtiger_leadaddress la
                WHERE ld.converted = 0
                AND ld.leadid = la.leadaddressid
                ORDER BY firstname";
	}
    
    if (isset($_POST["get_asignLeads"])) {
		$sql = "SELECT ld.leadid, ld.lead_no, ld.rating, ld.firstname, ld.lastname, ld.company, cl.fecha_asign
                FROM vtiger_leaddetails ld
                LEFT JOIN control_llamadas_leadtracking cl ON ld.leadid = cl.lead_id
                WHERE ld.converted = 0
                AND cl.fecha_asign IS NULL
                ORDER BY ld.leadid DESC LIMIT 20";
	}
    
    if (isset($_POST["get_llamadas"])) {
        $fstDayWeek = $_POST["fstDayWeek"];
        $lstDayWeek = $_POST["lstDayWeek"];
		/*$sql = "SELECT * FROM control_llamadas c
        WHERE c.fecha_hora BETWEEN '$fstDayWeek' AND '$lstDayWeek'";*/
        $sql = "SELECT c.id, c.fecha_hora, c.empresa, c.contacto, c.tel, c.email, c.tipo, c.origen, c.asunto, c.solicitud, c.buscado, c.asignado, c.db_valid, c.atendio, cs.seguimiento, cs.fecha_asign, c.tipo_llamada, cl.lead_no, cl.lead_id
        FROM control_llamadas c
        LEFT JOIN control_llamadas_seguimiento cs ON c.id = cs.llamada_id
        LEFT JOIN control_llamadas_leadtracking cl ON c.id = cl.llamada_id
        WHERE c.fecha_hora BETWEEN '$fstDayWeek' AND '$lstDayWeek'
        ORDER BY c.fecha_hora";
	}
    
    if (isset($_POST["get_infoLlamada"])) {
        $llamadaId = $_POST["llamadaId"];
        $sql = "SELECT c.id, c.fecha_hora, c.empresa, c.contacto, c.tel, c.email, c.tipo, c.origen, c.asunto, c.solicitud, c.buscado, c.asignado, c.db_valid, c.atendio, cs.seguimiento, cs.fecha_asign, c.tipo_llamada, cl.lead_no, cl.lead_id
        FROM control_llamadas c
        LEFT JOIN control_llamadas_seguimiento cs ON c.id = cs.llamada_id
        LEFT JOIN control_llamadas_leadtracking cl ON c.id = cl.llamada_id
        WHERE c.id = $llamadaId";
	}
    
    if (isset($_POST["get_contactLlamadas"])) {
		$sql = "SELECT contacto FROM control_llamadas c";
	}
    
    if (isset($_POST["get_empresaLlamadas"])) {
		$sql = "SELECT empresa FROM control_llamadas c";
	}
    
    if (isset($_POST["filter_llamadas"])) {
        $fechaIni = utf8_decode($_POST["filtro_fechaIni"]);
        $fechaFin = utf8_decode($_POST["filtro_fechaFin"]);
        $empresa = utf8_decode($_POST["filtro_empresa"]);
        $contacto = utf8_decode($_POST["filtro_contacto"]);
        $tipo = utf8_decode($_POST["filtro_tipo"]);
        $origen = utf8_decode($_POST["filtro_origen"]);
        $asunto = utf8_decode($_POST["filtro_asunto"]);
        $asignado = utf8_decode($_POST["filtro_asignado"]);
        $atendio = utf8_decode($_POST["filtro_atendio"]);
        $emptyQuotes = utf8_decode($_POST["filtro_eQuotes"]);
        $emptyLeads = $_POST["filtro_eLeads"];
        $LS = $_POST["filtro_LS"];
        
        if($fechaIni) {
            $where = "WHERE c.fecha_hora BETWEEN '$fechaIni' AND '$fechaFin'";
        } else {
            $where = "WHERE c.fecha_hora LIKE '%%'";
        }
        
        if ($emptyQuotes) {
            $andEQuotes = " AND c.asunto = 'Cotización' AND cs.seguimiento IS NULL";
        } else {
            $andEQuotes = " ";
        }
        
        if ($emptyLeads) {
            $andELeads = " AND c.tipo = 'LEAD NUEVO' AND cl.lead_id IS NULL";
        } else {
            $andELeads = " ";
        }
        
        if ($LS) {
            $andLS = " AND c.tipo_llamada = 1";
        } else {
            $andLS = " ";
        }
        
        if ($asignado == 'default') {
            $asignado = '';
        }
        
        if ($atendio == 'default') {
            $atendio = '';
        }
        
        $sql = "SELECT c.id, c.fecha_hora, c.empresa, c.contacto, c.tel, c.email, c.tipo, c.origen, c.asunto, c.solicitud, c.buscado, c.asignado, c.db_valid, c.atendio, cs.seguimiento, cs.fecha_asign, c.tipo_llamada, cl.lead_no, cl.lead_id
        FROM control_llamadas c
        LEFT JOIN control_llamadas_seguimiento cs ON c.id = cs.llamada_id
        LEFT JOIN control_llamadas_leadtracking cl ON c.id = cl.llamada_id ".
        $where.$andEQuotes.$andELeads.$andLS.
        " AND c.empresa LIKE '%$empresa%'
        AND c.contacto LIKE '%$contacto%'
        AND c.tipo LIKE '%$tipo%'
        AND c.origen LIKE '%$origen%'
        AND c.asunto LIKE '%$asunto%'
        AND c.asignado LIKE '%$asignado%'
        AND c.atendio LIKE '%$atendio%'";
        
        //echo $sql;
	}
    
    if (isset($_POST["get_ticketStatus"])) {
        $ticket_no = $_POST["ticket_no"];
		$sql = "SELECT v.status,v.ticketid FROM vtiger_troubletickets v
                WHERE v.ticket_no = '$ticket_no'";
	}
    
    if (isset($_POST["get_openTickets"])) {
		
		//Tickets en cualquier estado, no asignados
		$sql = "SELECT vtiger_troubletickets.ticket_no AS Ticket, vtiger_account.accountname AS Cuenta, vtiger_troubletickets.title AS Refer, vtiger_troubletickets.status AS Estado, vtiger_crmentity.createdtime AS Fecha
        FROM vtiger_troubletickets
        LEFT JOIN vtiger_account ON vtiger_troubletickets.parent_id = vtiger_account.accountid
        LEFT JOIN vtiger_crmentity ON vtiger_troubletickets.ticketid = vtiger_crmentity.crmid
        WHERE vtiger_troubletickets.status != 'Closed'
        AND vtiger_crmentity.deleted = 0
        AND vtiger_crmentity.createdtime > 2016-01-01
        AND ticket_no NOT IN (SELECT seguimiento FROM control_llamadas)
        ORDER BY vtiger_crmentity.createdtime DESC";
		
	}
    //Consulta para actualizar asunto
    if(isset($_POST["set_asunto"])) {
        $asunto = $_POST["asunto"];       
        $id_llamada = $_POST["llamadaId"];        
        $sql="UPDATE control_llamadas 
              set asunto = '$asunto'
              where id = $id_llamada";
    }
    /*
    if (isset($_POST["get_ticketDay"]) {
        $ticket_no = $_POST["ticket_no"];
        $sql = "SELECT * FROM assigned_days
                WHERE ticket_no = '$ticket_no'";
    }
    /*
    if (isset($_POST["assign_day"])) {
		$ticket_no = $_POST["ticket_no"];
		$assigned_day = $_POST["assigned_day"];
		//echo $ticket_no." ".$assigned_day;
		$sqlInsert = "INSERT INTO assigned_days (ticket_no, fecha_a)
				VALUES ('$ticket_no', '$assigned_day')";
		
		$resultInsert = $conn->query($sqlInsert);
		if (!$resultInsert) {
			printf("Error: %s\n", $conn->error);
		}
	}
    */
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
        // output data of each row
        $rows = array();
        while($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }
        //$rows = array_map('utf8_encode_array', $rows);
        echo json_encode($rows);
    } else {
        if ($conn->error) {
            printf("Error: %s\n", $conn->error);
        } else {
            $cero = array("0 results");
            echo json_encode($cero);
        }
    }
	
	$conn->close();
}

function utf8_encode_array($array) {
    return array_map('utf8_encode', $array);
}

?>
