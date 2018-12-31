<?php
$host = 'localhost:C:/Program Files (x86)/Common Files/Aspel/Sistemas Aspel/SAE7.00/Empresa03/Datos/SAE70EMPRE03.FDB';
$username = "sysdba";
$password = "masterkey";
if($_SERVER['REQUEST_METHOD'] == "POST") {
    
    $gestor_db = ibase_connect($host, $username, $password, "UTF8");
    if ($gestor_db) {
        //echo "Connection stablished";
        
        if (isset($_POST["get_quotes"])) {
            $sql = "SELECT F.cve_doc, 
            CASE WHEN F.CVE_CLPV = 'MOSTR' THEN 'MOSTR' ELSE C.NOMBRE END AS Cliente, 
            F.status, F.fecha_doc AS fecha_elab, F.can_tot AS subtotal, F.importe AS importe_tot
            FROM FACTC03 F, CLIE03 C
            WHERE F.STATUS <> 'C'
            AND F.TIP_DOC_E = 'O'
            AND F.FECHAELAB > '2015-12-31'
            AND C.CLAVE = F.CVE_CLPV
            ORDER BY F.FECHAELAB DESC";
        }
        
        if (isset($_POST["get_quoteStatus"])) {
            $quote_no = $_POST["quote_no"];
            /*$sql = "SELECT FACTC03.CVE_DOC, FACTC03.TIP_DOC_E, CASE */
            $sql = "SELECT FACTC03.CVE_DOC,
                        CASE FACTC03.TIP_DOC_SIG
                            WHEN 'F' THEN 'F'
                            WHEN 'P' THEN (SELECT
                                CASE FACTP03.TIP_DOC_SIG
                                    WHEN 'F' THEN 'F'
                                    ELSE
                                        CASE FACTP03.STATUS
                                            WHEN 'C' THEN FACTC03.STATUS
                                            ELSE 'P'
                                        END
                                END
                                FROM FACTP03 WHERE FACTP03.CVE_DOC = FACTC03.DOC_SIG)
                            ELSE FACTC03.STATUS
                        END AS STATUS
                    FROM FACTC03
                    WHERE FACTC03.CVE_DOC = '$quote_no'";
        }

        $gestor_sent = ibase_query($gestor_db, $sql);

        $num_rows = 0;
        while ($rows[$num_rows] = ibase_fetch_assoc($gestor_sent)) {
            $num_rows++;
        }

        //$result = $conn->query($sql);
        if ($num_rows > 0) {
            echo json_encode($rows);
        } else {
            echo "0 results";
        }

        ibase_free_result($gestor_sent);
        ibase_close($gestor_db);
        
    } else {
        echo "Connection failed";
    }
}

function utf8_encode_array($array) {
    return array_map('utf8_encode', $array);
}

?>