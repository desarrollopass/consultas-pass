$(document).ready(function () {
    
    $("#btn-login").click(function () {
        var userName = $("input[name='userName']").val();
        var userPsw = $("input[name='password']").val();
        //$.post("http://192.168.15.228/login/php/index.php", {"login": true, userName: userName, userPsw: userPsw})
        $.post("http://192.168.15.4:8081/login/php/index.php", {"login": true, userName: userName, userPsw: userPsw})
            .done(function (data) {
            var login = JSON.parse(data);
            if (login.message != "true") alert(login.message);
            else {
                $.post("../control-llamadas/php/usersession.php", {set_userData: true, userName: login.userName, userPsw: userPsw, userId: login.userId})
                    .done(function(data) {
                    window.location.href = "../control-llamadas/";
                });
            }
        });
    });

    $("input[name='password']").keyup(function (event) {
        if (event.keyCode === 13) {
            $("#btn-login").click();
        }
    });
    
});