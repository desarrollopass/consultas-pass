$(document).ready(function() {
    
    var atendio = "";
    var userid = "";
    
    $.post("../control-llamadas/php/usersession.php", {get_userData: true}).done(function(data) {
        var userData = JSON.parse(data);
        //$.post("http://192.168.15.228/login/php/index.php", {check: true, userName: userData.userName, userPsw: userData.userPsw})
        $.post("http://192.168.15.4:8081/login/php/index.php", {check: true, userName: userData.userName, userPsw: userData.userPsw})
            .done(function(data) {
            var check = JSON.parse(data);
            if (check.message == "false") {
                window.location.href = "../control-llamadas/login.html";
            } else {
                atendio = userData.userName;
                userid = userData.userId;
                $("#userName").text(userData.userName);
                $("#userId").text(userData.userId);
                //$("#userName").attr("user_mod", userData["user_modules"]);
            }
        });
    });
    $("#logout").click(function() {
        //$.post("http://192.168.15.228/login/php/index.php", {"logout": true}).done(function(data) {
        $.post("http://192.168.15.4:8081/login/php/index.php", {"logout": true}).done(function(data) {
            window.location.href = "../control-llamadas/login.html";
        });
    });
    
    //--Imprime la fecha y hora actuales sobre el input de fecha y hora
    //$("input[name='fecha_hora']").val(moment().format("YYYY-MM-DD HH:mm:ss"));
    $("#fecha_hora").text(moment().format("YYYY-MM-DD HH:mm:ss"));
    
    //--Carga la lista de llamadas al cargar la página
    var fstDayWeek = "";
    var lstDayWeek = "";
    $("#llamada-form").find("input[type=text], textarea").val("");  
    $("select").val("default");
    $("input[name='contacto']").focus();
    $("#llamada-form #chk-otros").prop( "checked", false);
    $("#llamada-form #chk-sal").prop( "checked", false);
            
    autoContacts();
    getTodayLlamadas();
    
    //--Carga la lista de llamadas tras un intervalo de tiempo definido
    /*setInterval(function(){
        //fstDayWeek = moment().day(1).format("YYYY-MM-DD");;
        //lstDayWeek = moment().day(1).add(6, "days").format("YYYY-MM-DD");
        if ($("#accordion #collapse"+moment().format("d")).parent().find(".collDay").text().trim() == moment().format("DD/MM/YYYY")) {
            getTodayLlamadas();
        } else {
            getLlamadas(fstDayWeek, lstDayWeek);
        }
    }, 60000);*/
    
    var intervalID = null;
    function intervalManager(flag, animate, time) {
        //console.log("function intervalManager "+flag);
        if(flag) intervalID =  setInterval(animate, time);
        else clearInterval(intervalID);
    }
    
    var forInterval = function () {
        if ($("#accordion #collapse"+moment().format("d")).parent().find(".collDay").text().trim() == moment().format("DD/MM/YYYY")) {
            getTodayLlamadas();
        } else {
            getLlamadas(fstDayWeek, lstDayWeek);
        }
    }
    
    intervalManager(true, forInterval, 60000);
    
    $("input[name='contacto']").focus(function() {
        //console.time('autoContacts');
        autoContacts();
        //console.timeEnd('autoContacts');
    });
    
    //--Carga la lista de contactos para el autocomplete del registro
    function autoContacts() {
        $.post("php/consulta.php", {"get_allContacts": true}).done(function(data) {
            var clientes = $.parseJSON(data);
            var contactsList = [];
            //var salutation = "";
            for(var i in clientes) {
                /*if (clientes[i]["salutation"] != "--None--") {
                    salutation = clientes[i]["salutation"];
                }*/
                contactsList.push({
                    //value: salutation+" "+clientes[i]["firstname"]+" "+clientes[i]["lastname"],
                    value: clientes[i]["firstname"]+" "+clientes[i]["lastname"],
                    type: "Cliente",
                    accountname: clientes[i]["accountname"],
                    phone: clientes[i]["phone"],
                    email: clientes[i]["email"]
                });
            }
            $.post("php/consulta.php", {"get_leads": true}).done(function(data) {
                var leads = $.parseJSON(data);
                for(var i in leads) {
                    /*if (leads[i]["salutation"] != "--None--") {
                        salutation = leads[i]["salutation"];
                    }*/
                    contactsList.push({
                        //value: salutation+" "+leads[i]["firstname"]+" "+leads[i]["lastname"],
                        value: leads[i]["firstname"]+" "+leads[i]["lastname"],
                        type: "LEAD en BD",
                        accountname: leads[i]["company"],
                        phone: leads[i]["phone"],
                        email: leads[i]["email"]
                    });
                }
                $("input[name='contacto']").autocomplete({
                    source: contactsList,
                    select: function( event, ui ) {
                        //var index = $.inArray(ui.item.value, contactsList);
                        $("input[name='contacto']").val(ui.item.value);
                        $("input[name='empresa']").val(ui.item.accountname);
                        $("input[name='tel']").val(ui.item.phone);
                        $("input[name='email']").val(ui.item.email);
                        if (ui.item.value && ui.item.accountname && ui.item.phone && ui.item.email) {
                            $("#valid").text("0");
                        } else {$("#valid").text("1");}
                        $("#select_origen").val("Teléfono");
                        if ($("input[name='empresa']").val() == "") {
                            $("input[name='empresa']").focus();
                        } else {
                            $("textarea[name='solicitud']").focus();
                        }
                    },
                    focus: function(event, ui) {
                        $("#tipo_cliente").text(ui.item.type);
                        $("input[name='empresa']").val(ui.item.accountname);
                        $("input[name='tel']").val(ui.item.phone);
                        $("input[name='email']").val(ui.item.email);
                    },
                    response: function(event, ui) {
                        if (ui.content.length === 0) {
                            //$("#tipo_cliente").text("LEAD NUEVO");
                        }
                    }
                });
            });
        });
    }
    
    //--Activa el autocomplete de la Empresa sobre el form de la llamada
    $("input[name='empresa']").focus(function() {
        if ($("#tipo_cliente").text() == "") {
            $("#tipo_cliente").text("LEAD NUEVO");
        }
        if($("#tipo_cliente").text() == "LEAD NUEVO") {
            $.post("php/consulta.php", {"get_accounts": true}).done(function(data) {
                var accounts = $.parseJSON(data);
                var arrSource = [];
                for(var x in accounts){
                    arrSource.push({
                        value: accounts[x]["accountname"],
                        type: "Cliente"
                    });
                }
                $.post("php/consulta.php", {"get_leadsCompanies": true}).done(function(data) {
                    var leadsCompanies = $.parseJSON(data);
                    for(var x in leadsCompanies){
                        arrSource.push({
                            value: leadsCompanies[x]["company"],
                            type: "LEAD en BD"
                        });
                    }
                    $("input[name='empresa']").autocomplete({
                        source: arrSource,
                        select: function( event, ui ) {
                            $("input[name='empresa']").val(ui.item.value);
                            $("#tipo_cliente").text(ui.item.type);
                            $("input[name='tel']").focus();
                            $("#select_origen").val("Teléfono");
                        },
                        focus: function(event, ui) {
                            $("#tipo_cliente").text(ui.item.type);
                            $("input[name='empresa']").val(ui.item.value);
                        },
                        response: function(event, ui) {
                            if (ui.content.length === 0) {
                                $("#tipo_cliente").text("LEAD NUEVO");
                            } 
                        }
                    });
                });
            });
        }
    });
    
    //--Borra los datos del formulario al regresar al campo de contacto
    $("input[name='contacto']").focus(function() {
        $("select").val("default");
        $("#tipo_cliente").text("");
        $("#llamada-form input").val("");
        $("input[name='ticketRefer']").fadeOut().addClass("hidden");
    });
    
    //--Restringe el origen para Leads Nuevos
    $("textarea[name='solicitud']").focus(function() {
        if ($("#tipo_cliente").text() == "LEAD NUEVO") {
            $("#select_origen option").addClass("hidden");
            $("#select_origen option[value='Google']").removeClass("hidden");
            $("#select_origen option[value='Aspel']").removeClass("hidden");
            $("#select_asunto option[value='Ticket']").addClass("hidden");
        } else if ($("#tipo_cliente").text() == "LEAD en BD") {
            $("#select_origen option").removeClass("hidden");
            $("#select_asunto option[value='Ticket']").addClass("hidden");
        } else {
            $("#select_origen option").removeClass("hidden");
            $("#select_asunto option[value='Ticket']").removeClass("hidden");
            //$("#select_origen").val("default");
        }
    });
    
    //--Pone LEAD NUEVO como tipo si el campo está vacio al hacer focus en la solicitud
    $("textarea[name='solicitud']").focus(function() {
        if ($("#tipo_cliente").text() == "") {
            $("#tipo_cliente").text("LEAD NUEVO");
        }
    });
    
    //--Cambia el tipo de contacto a "otros" cuando se activa el checkbox
    $("#llamada-form #chk-otros").change(function() {
        if(this.checked) {
            $("#tipo_cliente").text("Otros");
        } else {
            $("#tipo_cliente").text("");
        }
    });
    
    //--Actualiza la hora actual cuando se hace focus sobre el input de contacto
    $("input[name='contacto']").focus(function() {
        $("#fecha_hora").text(moment().format("YYYY-MM-DD HH:mm:ss"));
    });
    
    //--Borra el contenido de los inputs al elegir el tipo de cliente
    /*$('#select_tipo').change(function () {
        $("#llamada-form").find("input[type=text], textarea").val("");
        $("input[name='contacto']").focus();
    });*/
    
    //--Carga la lista de llamadas del día actual
    function getTodayLlamadas() {
        fstDayWeek = moment().day(1).format("YYYY-MM-DD");
        lstDayWeek = moment().day(1).add(6, "days").format("YYYY-MM-DD");
        getLlamadas(fstDayWeek, lstDayWeek);
        //--Abre el collapse del día actual
        //$("#accordion #collapse"+moment().format("d")).addClass("in");
        //$(".panel-collapse").collapse({ 'toggle': false });
        //$("#btns-week .fa").parent().addClass("hidden");
        $("#accordion #collapse"+moment().format("d")).collapse("show");
        //$("#accordion #collapse"+moment().format("d")).parent().find(".panel-title a").attr('data-toggle', '');        
    }
    
   
    //--Carga la lista de llamadas cuando se oprime algún botón de navegación
    $("#btns-week button").click(function(){
        var actual = moment().format("YYYY-MM-DD");
        $("#accordion").removeClass("hidden");
        $("#tabla-filtro").addClass("hidden");        
        //$("#accordion .collapse").collapse("hide");
        //$("#accordion #collapse"+moment().format("d")).removeClass("in");        
        var arrow = $(this).find("i");
        if (arrow.hasClass("fa-arrow-left")) {
            $('#accordion .in').collapse('hide');
            fstDayWeek = moment(fstDayWeek, "YYYY-MM-DD").subtract(7, "d").format("YYYY-MM-DD");
            lstDayWeek = moment(lstDayWeek, "YYYY-MM-DD").subtract(7, "d").format("YYYY-MM-DD");
            getLlamadas(fstDayWeek, lstDayWeek);
            intervalManager(false);
            //--Desbloquea boton de avanzar si no estamos en la ultima semana
            i=0;
            while (i<=2) {
                if (fstDayWeek < actual) { 
                    console.log(actual);
                    $("#btns-week .btn:last-child").attr("disabled", false);
                    }
                i++;
                }
        } else if (arrow.hasClass("fa-arrow-right")) {
            
            $('#accordion .in').collapse('hide');
            fstDayWeek = moment(fstDayWeek, "YYYY-MM-DD").add(7, "d").format("YYYY-MM-DD");
            lstDayWeek = moment(lstDayWeek, "YYYY-MM-DD").add(7, "d").format("YYYY-MM-DD");
            getLlamadas(fstDayWeek, lstDayWeek);
            intervalManager(false);
            //--Bloquea boton de avanzar si estamos en la ultima semana
            i=0;
            while (i<=2) {
                if (lstDayWeek > actual) {
                    console.log(actual);console.log(lstDayWeek);
                    $("#btns-week .btn:last-child").attr("disabled", true);
                    }
                i++;
                }
        } else if ($(this).hasClass("today")) {
            getTodayLlamadas();
            intervalManager(false);
            intervalManager(true, forInterval, 60000);
            //--Bloquea boton de avanzar si estamos en la ultima semana
            i=0;
            while (i<=2) {
                if (lstDayWeek > actual) {
                    console.log(actual);console.log(lstDayWeek);
                    $("#btns-week .btn:last-child").attr("disabled", true);
                    }
                i++;
                }
            } 
    });
    
    //--Activa o desactiva el interval si dependiendo del collapse del día que se seleccione
    /*$(".panel-heading a").click(function() {
        if ($(this).find(".collDay") == moment().format("DD/MM/YYYY")) {
            intervalManager(false);
            intervalManager(true, forInterval, 6000);
        } else {
            intervalManager(false);
        }
    });*/
     
    
    //--Desactiva el interval cuando se muestra un collapse
    $(".collapse").on('show.bs.collapse', function(){
        console.log("function show.bs.collapse");
        intervalManager(false);
    });
    
    //--Desactiva el interval cuando se muestra un popover
    $(document).on("show.bs.popover", "[data-toggle='popover']", function() {
    //$("[data-toggle='popover']").on('show.bs.popover', function(){
        intervalManager(false);
    });
    
    //--Esconde los demás collapse cuando uno es seleccionado
    $('#accordion').on('show.bs.collapse', function () {
        $('#accordion .in').collapse('hide');
    });
    
    //--Obtiene los registros de llamadas de la BD para imprimirlos en la pág (al cargar la página)
    function getLlamadas(fstDayWeek, lstDayWeek) {
        $("#accordion .panel-default").addClass("hidden");
        //--Borra las llamadas de la tabla del collapse
        $(".tbody-collapse").html("");
        $.post("php/consulta.php", {"get_llamadas": true, "fstDayWeek": fstDayWeek, "lstDayWeek": lstDayWeek}).done(function(data) {
            var llamadas = $.parseJSON(data);
            //console.log(llamadas.length+" "+$("#accordion #collapse"+moment().format("d")+" tr").length);
            //if (llamadas.length > $("#accordion #collapse"+moment().format("d")+" tr").length) {
            printLlamadas(llamadas, false);
            //}
        });
    }
    
    function printLlamadas(llamadas, filtro) {
        var momentLlamada;
        var btnModS = "Solicitud <button type='button' class='btn btn-primary btn-xs btn-modS'>Modificar</button>";
        var lead = [];

        var asign, seg, fechaHora, fechaDia, conDet, assigned, actLead, faValid, exRed, tipo, tipoLlamada;
        asign = seg = fechaHora = fechaDia = conDet = assigned = actLead = faValid = exRed = tipo = tipoLlamada = "";

        var totLlamadas, totTnA, totTnC, totCnA, totCT, totLN, totLnA, totNBD, totAsignLead, numLlamada, numDay, totLlamSal;
        totLlamadas = totTnA = totTnC = totCnA = totCT = totLN = totLnA = totNBD = totAsignLead = numLlamada = numDay = totLlamSal = 0;

        for (var x in llamadas) {
            seg = llamadas[x]["asunto"];
            assigned = "";
            if (seg == "Ticket" && !llamadas[x]["seguimiento"]) {
                //asign = "<button type='button' class='btn btn-primary btn-sm btn-Tlist' llamada_id='"+llamadas[x]["id"]+"'>Asignar</button>";
                asign = "<div><button type='button' class='btn btn-primary btn-sm btn-asignTicket' llamada_id='"+llamadas[x]["id"]+"'>Asignar</button></div>";
                //unasign++;
            } else if (seg == "Cotización" && !llamadas[x]["seguimiento"]) {
                asign = "<button type='button' class='btn btn-primary btn-sm btn-Clist' llamada_id='"+llamadas[x]["id"]+"'>Asignar</button>";
                //unasign++;
            } else if (llamadas[x]["seguimiento"]) {
                if (seg == "Ticket") {
                    assigned = "t_assigned";
                } else if (seg == "Cotización") {
                    assigned = "c_assigned";
                }
                asign = "<span class='folio_asign'>"+llamadas[x]["seguimiento"]+"</span>";
                if (llamadas[x]["fecha_asign"] != "0000-00-00 00:00:00") {
                    var fechaAsign = moment(llamadas[x]["fecha_asign"], "YYYY-MM-DD HH:mm:ss").format("DD/MM/YYYY HH:mm:ss");
                    asign = "<span class='folio_asign'>"+llamadas[x]["seguimiento"]+"</span><br><span class='fecha_asign'>"+fechaAsign+"</span>";
                }
            } else{
                asign = "n/a";
            }
            //--Asigna variable para marcar las llamadas sin solicitud
            if (!llamadas[x]["solicitud"]) { exRed = " ex-red"; }
            else { exRed = "";}
            //--Marca los contactos invalidos según el registro de llamadas
            if (llamadas[x]["db_valid"] == 1) {
                faValid = "<i class='fa fa-exclamation-triangle'></i>";
            } else {
                faValid = "";
            }
            momentLlamada = moment(llamadas[x]["fecha_hora"], "YYYY-MM-DD HH:mm-ss");
            fechaHora = momentLlamada.format("dddd DD/MM/YY HH:mm:ss");
            
            if (filtro) {
                numDay = 8;
            } else {
                numDay = momentLlamada.format("d");
            }
            
            fechaDia = momentLlamada.format("DD/MM/YYYY");

            //--Resalta las llamadas salientes
            tipoLlamada = " llamadaEnt";
            if (llamadas[x]["tipo_llamada"] == "1") {
                tipoLlamada = " llamadaSal";
            }

            //--Resalta los LEADS NUEVOS
            if (llamadas[x]["tipo"] == "LEAD NUEVO") {
                actLead = " success";
                if (llamadas[x]["lead_id"] == "" || llamadas[x]["lead_id"] == null) {
                    tipo = "<a class='newLead' href='javascript:void(0)'>LEAD NUEVO</a>";
                } else {
                    tipo = "LEAD NUEVO <a class='asignedLead' href='http://192.168.15.4:8082/index.php?module=Leads&parenttab=Marketing&action=DetailView&record="+llamadas[x]["lead_id"]+"' target='_blank'>"+llamadas[x]["lead_no"]+"</a>";
                    totAsignLead++;
                }
            } else {
                actLead = "";
                tipo = llamadas[x]["tipo"];
            }
            /*else {
                if (/LEAD NUEVO/.test(llamadas[x]["tipo"])) {
                    actLead = " success";
                    //lead = String(llamadas[x]["tipo"]).split(" ");
                    tipo = "LEAD NUEVO <a class='asignedLead' href='192.168.15.4:8081/passcrm/index.php?module=Leads&parenttab=Marketing&action=DetailView&record="+llamadas[x]["lead_id"]+"' target='_blank'>"+llamadas[x]["lead_no"]+"</a>";
                    totAsignLead++;
                    //tipo = "LEAD NUEVO <span class='asignedLead'>"+lead[2]+"</span>";
                } else {
                    actLead = "";
                    tipo = llamadas[x]["tipo"];
                }
            }*/

            //--Muestra el collapse del día correpondiente
            $("#accordion #collapse"+numDay).parent().removeClass("hidden");
            //--Imprime la fecha del día correspondiente
            $("#accordion a[href='#collapse"+numDay+"'] .collDay").text(" "+fechaDia);

            //var ticketLink = "<a href='192.168.15.4:8081/passcrm/index.php?module=HelpDesk&parenttab=Support&action=DetailView&record="+assignedTickets[i]["ticketid"]+"' target='_blank'>"+assignedTickets[i]["ticket_no"]+"</a>";
            
             //="+closedTickets[i]["ticketid"]+"'
            
            
            //--Bloquea elementos del asunto
            if((llamadas[x]["asunto"] == "Ticket") && (assigned == "t_assigned")) {
                var asuntoLink = "<p>" + llamadas[x]['asunto'] + "</p>";                              
            }else if ((llamadas[x]["asunto"] == "Cotización") && (assigned == "c_assigned")) {
                var asuntoLink = "<p>" + llamadas[x]['asunto'] + "</p>";
            }else {
                var asuntoLink = "<a href='javascript:void(0)'>" + llamadas[x]['asunto'] + "</a>";               
            }
            
            //--Imprime la llamada sobre el collapse del día correspondiente
            $("#accordion #collapse"+numDay+" .panel-body tbody")
                .prepend(
                "<tr class='"+actLead+tipoLlamada+"'>"+
                "<td><span class='num_llamada'></span><span class='id_llamada hidden'>"+llamadas[x]["id"]+"</span></td>"+
                "<td class='fecha_llamada'>"+fechaHora+"</td><td>"+llamadas[x]["atendio"]+"</td>"+
                "<td><a href='javascript:void(0)' class='cont_llamada'>"+llamadas[x]["contacto"]+faValid+"</a></td>"+
                "<td>"+llamadas[x]["empresa"]+"</td>"+
                "<td>"+tipo+"</td><td>"+llamadas[x]["origen"]+"</td>"+
                "<td class='asunto_llamada'>"+asuntoLink+"</td>"+
                "<td><a href='javascript:void(0)' data-toggle='popover' data-placement='top' title='' data-content='"+llamadas[x]["solicitud"]+"'><i class='fa"+exRed+" fa-info-circle' aria-hidden='true'></i></a></td>"+
                "<td>"+llamadas[x]["buscado"]+"</td>"+
                "<td>"+llamadas[x]["asignado"]+"</td>"+
                "<td class='seg_llamada "+assigned+"'>"+asign+"</td>"+
                "</tr>");

            //--Imprime los datos del contacto sobre el popover del mismo
            conDet = "<p><strong>Teléfono: </strong>"+llamadas[x]["tel"]+"</p>"+
                      "<p><strong>E-Mail: </strong>"+llamadas[x]["email"]+"</p>";
            
            $("#accordion #collapse"+numDay+" .panel-body tbody .cont_llamada").popover({
                title: "Datos del contacto",
                content: conDet,
                placement: "right",
                html: true
            });
        }

        //--Imprime el número de llamada para cada accordion
        $("#accordion .panel-default").each(function() {
            var numLlamadas = $(this).find(".llamadaEnt").length;
            var numSals = $(this).find(".llamadaSal").length;
            totLlamadas += parseInt(numLlamadas); //console.log("totLlamadas: "+totLlamadas);-1
            if (totLlamadas > 0) $("#num-tot").text(totLlamadas);
            //--Imprime el número de llamada sobre el badge
            $(this).find(".badge-numllamada").text(parseInt(numLlamadas));//-1
            $(this).find(".llamadaEnt").each(function() {
                $(this).find(".num_llamada").text(numLlamadas);
                numLlamadas--;
            });
            $(this).find(".llamadaSal").each(function() {
                $(this).find(".num_llamada").text(numSals);
                numSals--;
            });
        });
        
        if (!filtro) {
            $("#badges").removeClass("hidden");
            $("#btns-week .fa").parent().removeClass("hidden");
            //--Imprime sobre el badge de tickets no cerrados y llamadas no asignadas
            $("#accordion .panel-default").each(function() {
                var panelDiv = $(this);
                var numUnTickets = 0;
                panelDiv.find(".badge-unclosedT").addClass("hidden");
                var numUnQuotes = 0;
                panelDiv.find(".badge-unclosedQ").addClass("hidden");

                $("#num-tnc").text(totTnC);

                //--Cuenta el número de tickets no cerrados y lo imprime en el badge
                $(this).find(".t_assigned").each(function() {
                    var ticket_td = $(this);
                    var ticket_no = ticket_td.find(".folio_asign").text();
                    $.post("php/consulta.php", {"get_ticketStatus": true, "ticket_no": ticket_no}).done(function(data) {
                        var st = $.parseJSON(data);
                        var ticketLink = "<a href='http://192.168.15.4:8082/index.php?module=HelpDesk&parenttab=Support&action=DetailView&record="+st[0]["ticketid"]+"' target='_blank'>"+ticket_no+"</a>"
                        var status = st[0]["status"];
                        if (status == "Closed") {
                            ticket_td.parents("tr").addClass("line-T");
                        } else {
                            numUnTickets++;
                            panelDiv.find(".badge-unclosedT").text("TnC "+numUnTickets);
                            panelDiv.find(".badge-unclosedT").removeClass("hidden");
                            totTnC++; //console.log("totTnC: "+totTnC);
                            $("#num-tnc").text(totTnC);
                            //--Para imprimir el status del ticket a lado del ticket
                            switch(status) {
                                case "Open":
                                    status = "(Op)";
                                    break;
                                case "In Progress":
                                    status = "(IP)";
                                    break;
                                case "Wait For Response":
                                    status = "(WR)";
                                    break;
                            }
                            //--Imprime folio ticket como link al CRM y el status
                            ticket_td.find(".folio_asign").html(ticketLink+" "+status);
                            ticket_td.css({"color": "#0099cc", "font-weight": "600"});
                        }

                    });
                });

                $("#num-ct").text(totCT);

                //--Raya las cotizaciones Facturadas o Canceladas y cuenta la demás para imprimirlas en el badge
                $(this).find(".c_assigned").each(function() {
                    var quote_td = $(this);
                    $.post("php/consulta_sae.php", {"get_quoteStatus": true, "quote_no": quote_td.find(".folio_asign").text()}).done(function(data) {
                        var st = $.parseJSON(data);
                        //console.log(st[0]["CVE_DOC"]+" "+st[0]["STATUS"]);
                        var status = st[0]["STATUS"];
                        if (status == "C" || status == "F") {
                            quote_td.parents("tr").addClass("line-T");
                        } else if(status == "O" || status == "E" || status == "P") {
                            numUnQuotes++;
                            panelDiv.find(".badge-unclosedQ").text("CT "+numUnQuotes);
                            panelDiv.find(".badge-unclosedQ").removeClass("hidden");
                            totCT++; //console.log("totCT: "+totCT);
                            $("#num-ct").text(totCT);
                            /*quote_td.text(quote_td.text()+" (C"+status+")");
                            quote_td.css({"color": "#008000", "font-weight": "600"});*/
                            quote_td.find(".folio_asign")
                                .text(quote_td.find(".folio_asign").text()+"(C"+status+")");
                            quote_td.css({"color": "#008000", "font-weight": "600"});
                        } /*else {
                            $("#num-ct").text(totCT);
                        }*/
                    });
                });

                //--Imprime el número de llamadas no asignadas sobre su respectivo badge
                var numSals = panelDiv.find(".llamadaSal").length;
                if (parseInt(numSals) == 0) {
                    panelDiv.find(".badge-llamadaSal").addClass("hidden");
                    $("#num-lls").text(totLlamSal);
                } else {
                    panelDiv.find(".badge-llamadaSal").html("<i class='fa fa-phone'></i> LS "+numSals);
                    panelDiv.find(".badge-llamadaSal").removeClass("hidden");
                    totLlamSal += numSals; //console.log("totTnA: "+totTnA);
                    $("#num-lls").text(totLlamSal);
                }
                var numUnasignsT = panelDiv.find(".btn-Tlist").length;
                if (parseInt(numUnasignsT) == 0) {
                    panelDiv.find(".badge-unasignT").addClass("hidden");
                    $("#num-tna").text(totTnA);
                } else {
                    panelDiv.find(".badge-unasignT").text("TnA "+numUnasignsT);
                    panelDiv.find(".badge-unasignT").removeClass("hidden");
                    totTnA += numUnasignsT; //console.log("totTnA: "+totTnA);
                    $("#num-tna").text(totTnA);
                }
                var numUnasignsC = panelDiv.find(".btn-Clist").length;
                if (parseInt(numUnasignsC) == 0) {
                    panelDiv.find(".badge-unasignC").addClass("hidden");
                    $("#num-cna").text(totCnA);
                } else {
                    panelDiv.find(".badge-unasignC").text("CnA "+numUnasignsC);
                    panelDiv.find(".badge-unasignC").removeClass("hidden");
                    totCnA += numUnasignsC; //console.log("totCnA: "+totCnA);
                    $("#num-cna").text(totCnA);
                }
                var numLeadsN = panelDiv.find("tr.success").length;
                var numAsignL = panelDiv.find(".asignedLead").length;
                //console.log("numLeadsN: "+numLeadsN+" numAsignL: "+numAsignL);
                var numUnsaginsL = 0;
                if (parseInt(numLeadsN) == 0) {
                    panelDiv.find(".badge-leadN").addClass("hidden");
                    panelDiv.find(".badge-leadLnA").addClass("hidden");
                    $("#num-ln").text(totLN);
                } else {
                    panelDiv.find(".badge-leadN").text("LN "+numLeadsN);
                    panelDiv.find(".badge-leadN").removeClass("hidden");
                    totLN += numLeadsN; //console.log("totLN: "+totLN);
                    $("#num-ln").text(totLN);
                    $("#num-lna").text(totLN - totAsignLead);
                    numUnsaginsL = numLeadsN - numAsignL;
                    if (numUnsaginsL == 0) {
                        panelDiv.find(".badge-leadLnA").addClass("hidden");
                    } else {
                        panelDiv.find(".badge-leadLnA").text("LnA "+numUnsaginsL);
                        panelDiv.find(".badge-leadLnA").removeClass("hidden");
                        
                    }
                }
            });
            $("#num-noBD").text($(".tbody-collapse .fa-exclamation-triangle").length);

            
        }
        
        //--Activa los popover
        $('[data-toggle="popover"]').popover({
            title: btnModS,
            html: true
        });

        $("#fecha_hora").text(moment().format("YYYY-MM-DD HH:mm:ss"));
        
    }//--printLlamadas
    
    //--Hace un post para guardar el registro en la BD
    $("#btn-guardar").click(function() {
        insertLlamada();
    });
    
    /*$("#select_asunto").change(function() {
        if ($(this).val() == "Ticket") {
            $("input[name='ticketRefer']").fadeIn().removeClass("hidden");
        } else {
            $("input[name='ticketRefer']").fadeOut().addClass("hidden");
        }
    });*/
    
    function insertLlamada () {
        var selectOrigen = $("#select_origen option:selected").text();
        if (!$("input[name='contacto']").val()) {
            alert("Debes poner el nombre del contacto");
        } else if (selectOrigen == "-Elige-") {
            alert("Debes selecionar un origen");
        } else if ($("#tipo_cliente").text() == "LEAD NUEVO" && selectOrigen == "n/a"){
            alert("El origen debe ser distinto de n/a para un LEAD NUEVO");
        } else if ($("#select_asunto option:selected").text() == "-Elige-") {
            alert("Debes selecionar un asunto");
        } else if ($("#select_buscado option:selected").text() == "-Elige-") {
            alert("Debes selecionar un Usuario en: ¿A quién busca?");
        } else if ($("#select_asignado option:selected").text() == "-Elige-") {
            alert("Debes selecionar un Usuario en: Asignado a");
        } /*else if (!$("input[name='ticketRefer']").val() && $("#select_asunto option:selected").text() == "Ticket") {
            alert("Debes poner la referencia del ticket");
        }*/ else {
            var llamada = $("#llamada-form").serializeArray();
            var fecha = $("#fecha_hora").text();
            var tipo = $("#tipo_cliente").text();
            var valid = $("#valid").text();
            var sal = 0;
            if ($("#llamada-form #chk-sal").is(':checked')) {
                sal = 1;
            }
            llamada.push({name:"fecha_hora", value: fecha});
            llamada.push({name:"tipo", value: tipo});
            llamada.push({name:"valid", value: valid});
            llamada.push({name:"atendio", value: atendio});
            llamada.push({name:"tipo_llamada", value: sal});
            $.post("php/insert_llamada.php", llamada).done(function(data) {
                console.log(data);
                if (data == " INSERT INTO control_llamadas successfully ") {
                    //Si el asunto de la llamada es un ticket genera un ticket automaticamente
                    window.location.href = "index.html";
                }
            });
            
            //$("input[name='ticket']").prop("disabled", true);
            //$("input[name='ticket']").val("n/a");
            //$("input[name='empresa']").focus();
        }
    }
    /*
    $("input[name='contacto']").on( "autocompletechange", function( event, ui ) {
        console.log("hola");
    });
    */
    
    //--Muesta el modal de asignación de ticket
    $(document).on("click", ".asunto_llamada a", function() {
        var llamadaId = $(this).parents("tr").find(".id_llamada").text();
        $(".llamada_id").text(llamadaId);
        //console.log(llamadaId);
        $("#selectAsunto").val("Ticket");
        $("#asunto_modal").modal();
    });
    
    //--Función para cambiar asunto y seguimiento
    $("#btn-asignAsunto").click(function() {
        var llamadaId = $("#asunto_modal .llamada_id").text();
        var asunto = $("#selectAsunto").val();
        //$('html,body').animate( {scrollTop: $("#asunto_modal .llamada_id").offset().top}, 6000);//--Te manda al asusnto que acabas de cambiar
        $.post("php/consulta.php",{set_asunto: true, llamadaId: llamadaId, asunto: asunto}).done(function(data) {
            if(data != "0 results") { //--Si la respuesta del post es distinta a "0 results" lo que indica que la consulta tuvo éxito
                //--Variable y condiciones para el seguimiento
                var asign = "";
                if (asunto == "Ticket") {
                    asign = "<div><button type='button' class='btn btn-primary btn-sm btn-asignTicket' llamada_id='"+llamadaId+"'>Asignar</button></div>";
                } else if (asunto == "Cotización") {
                    asign = "<button type='button' class='btn btn-primary btn-sm btn-Clist' llamada_id='"+llamadaId+"'>Asignar</button>";
                } else{
                    asign = "n/a";
                }
                //--Efecto para esconder y mostrar el seguimiento nuevo
                $(".id_llamada:contains('" + llamadaId + "')").parents("tr").find(".seg_llamada").fadeOut("slow", function() {
                    $(this).html(asign);
                    $(this).fadeIn("slow");
                });
                //--Efecto para esconder y mostrar el asunto nuevo
                $(".id_llamada:contains('" + llamadaId + "')").parents("tr").find(".asunto_llamada a").fadeOut("slow", function() {
                    $(this).text(asunto);
                    $(this).fadeIn("slow");
                });
            } else {
                alert("Hubo un problema al cambiar el Asunto, si el problema persiste contacta al desarrolador.");
            }
        });
    });
    
    //--Muesta el modal de asignación de ticket
    $(document).on("click", ".btn-asignTicket", function() {
        var llamadaId = $(this).attr("llamada_id");
        $("#btn-openNewTicket").attr("data_llamadaId", llamadaId);
        $("#openNewTicket_Modal input").val("");
        $.post("php/consulta.php", {get_infoLlamada: true, llamadaId: llamadaId}).done(function(data) {
            if (data != "0 results") {
                var infoLlamada = $.parseJSON(data);
                $("#openNewTicket-cuenta").text(infoLlamada[0]["empresa"]);
                $("#openNewTicket-contacto").text(infoLlamada[0]["contacto"]);
                $("#openNewTicket-caso").val(infoLlamada[0]["solicitud"]);
                $("#openNewTicket_Modal").modal();
                
            }
        });
    });
    
        
    function openNewTicket() {
        var nomAccount = $("input[name='empresa']").val();
        var nomContacto = $("input[name='contacto']").val();
        var solicitud = $("textarea[name='solicitud']").val();
        var refer = $("input[name='ticketRefer']").val();
        //$.post("php/open_newTicket.php", {"userid": userid, "nomAccount": nomAccount, "nomContacto": nomContacto, "solicitud": solicitud, "refer": refer}).done(function(data) {
            //console.log(data);
            window.location.href = "index.html";
        //});
    }
    
    $("#btn-openNewTicket").click(function() {
        if (!$("#openNewTicket-refer").val()) {
            alert("Debes llenar el campo de Referencia");
        } else if (!$("#openNewTicket-caso").val()) {
            alert("Debes llenar el campo de Caso");
        } else {
            var llamadaId = $(this).attr("data_llamadaId");
            var nomAccount = $("#openNewTicket-cuenta").text();
            var nomContacto = $("#openNewTicket-contacto").text();
            var solicitud = $("#openNewTicket-caso").val();
            var refer = $("#openNewTicket-refer").val();
            $.post("php/open_newTicket.php", {"userid": userid, "nomAccount": nomAccount, "nomContacto": nomContacto, "solicitud": solicitud, "refer": refer, "llamadaId": llamadaId}).done(function(data) {
                if (data.substring(1,3) == 'TT') {
                    $("#openNewTicket_Modal").modal("hide");
                    $("#openNewTicket_Modal").one("hidden.bs.modal", function() {
                        $(".btn-asignTicket[llamada_id='"+llamadaId+"']").parent().fadeOut("fast", function() {
                            /*$(this).parent().addClass("t_assigned");
                            $(this).html(data+" (Op) "+moment().format("DD/MM/YYYY HH:mm:ss"));
                            $(this).fadeIn("slow");*/
                            getLlamadas(fstDayWeek, lstDayWeek);
                        });
                    });
                } else {
                    alert("No fue posible crear el ticket. Si el problema persiste contacta con el desarrollador.");
                    console.log(data);
                }
            });
        }
    });
    
    //--Seleciona el texto dentro de un input
    $("input[type=text]").click(function() {
       $(this).select(); 
    });
    
    //--Muestra la lista de los tickets disponibles para asignar
    $(document).on("click", ".btn-Tlist", function() {
        $("#ticketsD_Modal #llamada_id").text($(this).attr("llamada_id"));
        $.post("php/consulta.php", {"get_openTickets": true}).done(function(data) {
            var openTickets = $.parseJSON(data);
            for (var x in openTickets) {
                $("#ticketsD_trs").append("<tr><td class='ticket_no'>"+openTickets[x]["Ticket"]+"</td><td>"+openTickets[x]["Cuenta"]+"</td><td>"+openTickets[x]["Refer"]+"</td><td>"+openTickets[x]["Estado"]+"</td><td>"+openTickets[x]["Fecha"]+"</td><td><button type='button' class='btn btn-primary btn-sm btn-asignT'>Asignar</button></td></tr>");
            }
        });
        $("#ticketsD_Modal").modal(); 
    });
    
    //--Asigna el ticket seleccionado
    $(document).on("click", ".btn-asignT", function() {
        var ticket_no = $(this).parents("tr").find(".ticket_no").text();
        var llamada_id = $("#ticketsD_Modal #llamada_id").text();
        $.post("php/asign_ticket.php", {"ticket_no": ticket_no ,"llamada_id": llamada_id}).done(function(data) {
            console.log(data);
            //window.location.href = "index.html";//----------------solo dejar para test
            $("#ticketsD_Modal").modal("hide");
            $(".id_llamada:contains("+llamada_id+")").parents("tr").find(".btn-Tlist").parent().html(ticket_no);
        });
    });
    
    //--Muestra la lista de las cotizaciones disponibles para asignar
    $(document).on("click", ".btn-Clist", function() {
        $("#quotesD_Modal #llamada_id").text($(this).attr("llamada_id"));
        $.post("php/consulta_sae.php", {"get_quotes": true}).done(function(data) {
            var quotes = $.parseJSON(data);
            for (var x in quotes) {
                $("#quotesD_trs").append("<tr><td>"+quotes[x]["FECHA_ELAB"]+"</td><td class='folio'>"+quotes[x]["CVE_DOC"]+"</td><td>"+quotes[x]["CLIENTE"]+"</td><td>"+quotes[x]["STATUS"]+"</td><td>"+accounting.formatMoney(quotes[x]["SUBTOTAL"])+"</td><td>"+accounting.formatMoney(quotes[x]["IMPORTE_TOT"])+"</td><td><button type='button' class='btn btn-primary btn-sm btn-asignC'>Asignar</button></td></tr>");
            }
        });
        $("#quotesD_Modal").modal();
    });
    
    //--Asigna la cotización seleccionada
    $(document).on("click", ".btn-asignC", function() {
        var folio = $(this).parents("tr").find(".folio").text();
        var llamada_id = $("#quotesD_Modal #llamada_id").text();             
        $.post("php/asign_quote.php", {"folio": folio ,"llamada_id": llamada_id}).done(function(data) {
            console.log(data);
            //window.location.href = "index.html";//----------------solo dejar para test
            $("#quotesD_Modal").modal("hide");
            $("#quotesD_Modal").one("hidden.bs.modal", function(){//--espera a que se cierre el modal para realizar el cambio de folio y quitar link a cotización
                $(".id_llamada:contains("+llamada_id+")").parents("tr").find(".btn-Clist").fadeOut("fast", function(){
                    $(".id_llamada:contains("+llamada_id+")").parents("tr").find(".btn-Clist").parent().html(folio);
                    $(this).fadeIn("fast");
                });
                $(".id_llamada:contains("+llamada_id+")").parents("tr").find(".asunto_llamada").fadeOut("fast", function(){
                    $(this).html("Cotización");
                    $(this).fadeIn("fast");
                });                
            });                
        });
    });
    
    //--Muestra la lista de los leads disponibles para asignar
    $(document).on("click", ".newLead", function() {
        $("#asignLeads_modal #llamada_id").text($(this).parents("tr").find(".id_llamada").text());
        $.post("php/consulta.php", {"get_asignLeads": true}).done(function(data) {
            var leads = $.parseJSON(data);
            for (var x in leads) {
                if ($(".asignedLead:contains('"+leads[x]["lead_no"]+"')").length == 0) {
                    $("#asignLeads_trs").append("<tr><td><span class='lead_no'>"+leads[x]["lead_no"]+"</span><span class='leadid hidden'>"+leads[x]["leadid"]+"</span></td><td>"+leads[x]["firstname"]+" "+leads[x]["lastname"]+"</td><td>"+leads[x]["company"]+"</td><td><button type='button' class='btn btn-primary btn-sm btn-asignLead'>Asignar</button></td></tr>");
                }
            }
        });
        $("#asignLeads_modal").modal();
    });
    
    //--Asigna el lead seleccionado a la llamada correspondiente
    $(document).on("click", ".btn-asignLead", function() {
        var lead_no = $(this).parents("tr").find(".lead_no").text();
        var leadid = $(this).parents("tr").find(".leadid").text();
        var llamada_id = $("#asignLeads_modal #llamada_id").text();
        $.post("php/asign_lead.php", {"leadid": leadid, "lead_no": lead_no ,"llamada_id": llamada_id}).done(function(data) {
            console.log(data);
            //window.location.href = "index.html";//----------------solo dejar para test
            $("#asignLeads_modal").modal("hide");
            $(".id_llamada:contains("+llamada_id+")").parents("tr").find(".newLead").parent().html("LEAD NUEVO <a class='asignedLead' href='192.168.15.4:8081/passcrm/index.php?module=Leads&parenttab=Marketing&action=DetailView&record="+leadid+"' target='_blank'>"+lead_no+"</a>");
            //$(".id_llamada:contains("+llamada_id+")").parents("tr").find(".newLead").parent().html("LEAD NUEVO <span class='asignedLead'>"+lead_no+"</span>");
        });
    });
    
    //--Abre el modal para modificar la solicitud
    $(document).on("click", ".btn-modS", function() {
        $("#modS_Modal #llamada_id").text($(this).parents("tr").find(".id_llamada").text());
        var numLlamada = $(this).parents("tr").find(".num_llamada").text();
        var fechaLlamada = $(this).parents("tr").find(".fecha_llamada").text();
        //--Escribe el texto de la solicitud original sobre el textarea
        $("#modS_Modal textarea[name='solicitud']").val($(this).parents(".popover").find(".popover-content").text());
        $('[data-toggle="popover"]').popover("hide");
        $("#modS_Modal .modal-title").text("Modificar Solicitud de la llamada "+numLlamada+" del día "+fechaLlamada);
        $("#modS_Modal").modal();
        
    });
    
    //--Hace focus sobre el textarea y selecciona el texto dentro
    $("#modS_Modal").on('shown.bs.modal', function() {
        $("#modS_Modal textarea[name='solicitud']").focus();
        $("#modS_Modal textarea[name='solicitud']").select();
    });
    
    //--Modifica la solicitud
    $(document).on("click", ".btn-modMS", function() {
        var solicitud = $("#modS_Modal textarea[name='solicitud']").val();
        var llamada_id = $("#modS_Modal #llamada_id").text();
        $.post("php/mod_s.php", {"solicitud": solicitud ,"llamada_id": llamada_id}).done(function(data) {
            console.log(data);
            $("#modS_Modal textarea[name='solicitud']").val("");
            window.location.href = "index.html";//----------------solo dejar para test
        });
    });
    
    //--Abre el modal con las opciones para el filtro
    $(".btn-filtrar").click(function() {
       $("#filtro_Modal").modal();
    });
    
    //--Activa los autcompletes del modal del filtro
    $("#filtro_Modal").on('shown.bs.modal', function () {
        //--Activa el autocomplete del contacto en el modal del filtro
        $.post("php/consulta.php", {"get_contactLlamadas": true}).done(function(data) {
            var clientes = $.parseJSON(data);
            var contactsList = [];
            var salutation = "";
            for(var i in clientes) {
                contactsList.push(clientes[i]["contacto"]);
            }
            $("input[name='filtro_contacto']").autocomplete({
                source: unique(contactsList),
                appendTo: "#filtro_Modal"
            });
        });
        //--Activa el autocomplete del contacto en el modal del filtro
        $.post("php/consulta.php", {"get_empresaLlamadas": true}).done(function(data) {
            var accounts = $.parseJSON(data);
            var arrSource = [];
            for(var x in accounts){
              arrSource.push(accounts[x]["empresa"]);
            }
            //console.log(arrSource);
            $("input[name='filtro_empresa']").autocomplete({
                source: unique(arrSource),
                appendTo: "#filtro_Modal"
            });
        });
    });
    
    //--Extree los valores unicos de un array
    function unique(array) {
        return $.grep(array, function(el, index) {
            return index === $.inArray(el, array);
        });
    }
    
    //--Reemplaza el valor de un Serialize Array
    function repInSerializeArray(array, findName, newValue) {
        for (var i = 0; i < array.length; ++i) {
            if (array[i].name == findName) {
                array[i].value = newValue;
                break;
            }
        }
    }
    
    //--Si cambia la fecha de un datepicker y el otro está vacio pone lo mismo
    $("#fechaIni-filtro").on("dp.hide", function(e) {
        if (!$("input[name='filtro_fechaFin']").val()) {
            $("input[name='filtro_fechaFin']").val($("input[name='filtro_fechaIni']").val());
        }
    });
    $("#fechaFin-filtro").on("dp.hide", function(e) {
        if (!$("input[name='filtro_fechaIni']").val()) {
            $("input[name='filtro_fechaIni']").val($("input[name='filtro_fechaFin']").val());
        }
    });
    
    //--Busca las llamadas según los datos del filtro
    $(".btn-modF").click(function() {
        var filter = $("#form-filtro").serializeArray();
        //--Añade un día a la fecha fin seleccionada para poderla filtrar
        var fechaFin = "";
        if ($('input[name="filtro_fechaIni"]').val()) {
            fechaFin = moment($('input[name="filtro_fechaFin"]').val(), "YYYY-MM-DD").add(1, "d").format("YYYY-MM-DD");
            repInSerializeArray(filter, "filtro_fechaFin", fechaFin);
        }
        
        filter.push({name:"filter_llamadas", value: true});
        //console.log(filter);
        $.post("php/consulta.php", filter).done(function(data) {
            //console.log(data);
            var llamadas = $.parseJSON(data);
            if (llamadas[0] == "0 results") {
                alert("Ningún resultado coincide con su búsqueda");
            } else {
                $("#filtro_Modal").modal("hide");
                $("#accordion .panel").addClass("hidden");
                $(".panel-filter").removeClass("hidden");
                $("#collapse8 .tbody-collapse").html("");
                $('#collapse8').collapse("show");
                //--Esconde la barra de badge y las flechas de nvegación de la semana
                $("#badges").addClass("hidden");
                $("#btns-week .fa").parent().addClass("hidden");
                //$("#tabla-filtro").removeClass("hidden");
                $("#filtro_Modal").find("input[type=text]").val("");
                //$("#tabla-filtro #tbody-filtro").html("");
                $("select").val("default");
                $("input[type=checkbox]").prop("checked", false);
                
                intervalManager(false);
                
                printLlamadas(llamadas, true);
            }
            
        });
    });
	
});