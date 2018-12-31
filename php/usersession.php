<?php

session_start();

if (isset($_POST["get_userData"])) {
    $userName = $_SESSION["userName"];
    $userPsw = $_SESSION["userPsw"];
    $userId = $_SESSION["userId"];
    
    $userData = array("userId" => $userId, "userName" => $userName, "userPsw" => $userPsw);
    echo json_encode($userData);
}

if (isset($_POST["set_userData"])) {
    $_SESSION["userName"] = $_POST["userName"];
    $_SESSION["userPsw"] = $_POST["userPsw"];
    $_SESSION["userId"] = $_POST["userId"];
}

?>