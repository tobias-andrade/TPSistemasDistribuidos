//Urls
//-----------------------------------------
var cartesMapUrl = {
    scheme: "https",
    server: "cartes.io",
    path: "api/maps",
    title: "newMap",
    privacy: "public",
    users_can_create_markers: "yes"
};

var cartesMarkerUrl = {
    scheme: "https",
    server: "cartes.io",
    path: "api/maps",
    category_name: 0,
    lat: "",
    lng: ""
};

var sucursalesUrl = {
    scheme: "http",
    server: "localhost:8082", //Debería leerse de alguna configuración, pero no se cómo todavía
    path: "api/sucursales"
};

var reservasUrl = {
    scheme: "http",
    server: "localhost:8082", //Debería leerse de alguna configuración, pero no se cómo todavía
    path: "api/reservas",
    userId: "",
    dateTime: "",
    branchId: ""
};

var verificacionTurnoUrl = {
    scheme: "http",
    server: "localhost:8082",
    path: ""
};

var confirmacionTurnoUrl = {
    scheme: "http",
    server: "localhost:8082",
    path: ""
};
//-----------------------------------------

const TIEMPOBLOQUEADO = 60000;

function removeOptionsFromSelect(selectElement) {
    var i, L = selectElement.options.length - 1;
    for (i = L; i >= 0; i--) {
        selectElement.remove(i);
    }

    horas = document.getElementById('horas_disponibles');
    let opt = document.createElement("option");
    opt.value = "noValue";
    opt.text = "------- -------";
    horas.add(opt, null);
}

// "..." toma todos los elementos que faltan del objeto
function createURL({ scheme, server, path, ...queryParams }) {
    let url = `${scheme}://${server}/${path}`;
    let param = new URLSearchParams(getQueryParams(queryParams)).toString();
    if (param)
        url += "?" + param;
    return url;
};

function getQueryParams(queryParams) {
    const params = [];
    for (const [key, value] of Object.entries(queryParams))  //Separo cada query param como objeto key-value
        params.push([key, value]);
    return params;
};

function sendRequest(method, url,body) {
    const promise = new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.responseType = 'json';
        xhr.onload = () => {
            resolve(xhr.response);
        }
        xhr.send(JSON.stringify(body));
    });
    return promise;
};

function sendRequestButton(method, url,body) {
    const promise = new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.responseType = 'json';
        xhr.onload = () => {
            if (xhr.status == 200)
                resolve(xhr.response);
            else
                reject(xhr.response);
        }
        xhr.send(JSON.stringify(body));
    });
    return promise;
};

function calendarSetup() {
    let currentDate = new Date();
    let calendar = document.getElementById("calendar");
    let button = document.getElementById("button_realizar");
    calendar.min = currentDate.toLocaleDateString("en-CA");
    calendar.value = calendar.min;
    calendar.max = "31-12-2023";
    calendar.style.visibility = "hidden";

    calendar.addEventListener("change", () => {
        button.disabled = true;

        reservasUrl.dateTime = new Date(calendar.value).toISOString();
        reservasUrl.branchId = document.getElementById('suc_selection').value;
        reservasUrl.userId = -1;

        sendRequest("GET", createURL(reservasUrl)).then((data) => {

            let horas = document.getElementById('horas_disponibles');
            removeOptionsFromSelect(horas);

            //Llena lista desplegable para seleccionar hora de reserva
            if (data.length != 0) {
                data.forEach(element => {
                    console.log(element);
                    let time = new Date(element['dateTime']).toLocaleTimeString();
                    let opt = document.createElement("option");
                    opt.value = element['idReserva'];
                    opt.text = time;
                    horas.add(opt, null);
                });
            };
        });
    });
};

function sucursalSelectionSetup() {
    let select = document.getElementById("suc_selection");
    let calendar = document.getElementById("calendar");
    let button = document.getElementById("button_realizar");
    select.addEventListener("change", () => {
        if (select.value != "noValue") {
            calendar.style.visibility = "visible";
            button.disabled = true;
        } else{
            calendar.style.visibility = "hidden";
        };
    });
};

function fechaSelectionSetup() {
    let select = document.getElementById("horas_disponibles");
    let button = document.getElementById("button_realizar");
    select.addEventListener("change", () => {
        if (select.value === "noValue") {
            button.disabled = true;
        } else
            button.disabled = false;
    });
}

function buttonRealizarSetup(){
    let button = document.getElementById("button_realizar");
    let email = document.getElementById("email");
    button.addEventListener("click", () => {
        if (email.value != null){
            let idReserva = document.getElementById("horas_disponibles").value;
            verificacionTurnoUrl.path = "api/reservas/solicitar/"+idReserva;
            sendRequestButton("POST", createURL(verificacionTurnoUrl),{"userId": 0}).then((response) => {
                    document.getElementById("button_confirmar").disabled = false;
                    button.disabled = true;
                    setTimeout( () => {
                        document.getElementById("button_confirmar").disabled = true;
                    }, TIEMPOBLOQUEADO)
            }).catch(response => {
                console.log(response);
            });
        }
    });
};

function buttonConfirmarSetup(){
    let button = document.getElementById("button_confirmar");
    button.addEventListener("click", () => {
            let email = document.getElementById("email").value;
            let idReserva = document.getElementById("horas_disponibles").value;
            confirmacionTurnoUrl.path = "api/reservas/confirmar/"+idReserva;
            sendRequestButton("POST", createURL(confirmacionTurnoUrl),{"userId": 0, "email":email}).then((response) => {
                console.log(response);
                document.getElementById("button_confirmar").disabled = true;
            }).catch(response => {
                console.log(response);
            });
    });
};

window.onload = () => {
    //sendRequest: Crea el mapa de cartes y "luego" retorna los datos de ese mapa
    sendRequest("POST", createURL(cartesMapUrl)).then(mapData => {
        let url = new URL(mapData.uuid + "/embed?type=map", "https://app.cartes.io/maps/");
        document.getElementById('cartesMap').src = url.href;
        return mapData;
    }).then(mapData => {
        //sendRequest: Le pide a la apiGateWay las sucursales y "luego" crea los marcadores en el mapa
        sendRequest("GET", createURL(sucursalesUrl)).then((sucursalesData) => {
            let sel = document.getElementById("suc_selection");
            cartesMarkerUrl.path = `${cartesMarkerUrl.path}/${mapData.uuid}/markers`;
            sucursalesData.forEach(element => {
                //Personaliza el marcador
                cartesMarkerUrl.category_name = `${element['name']} | Id: ${element['branchId']}`;
                cartesMarkerUrl.lat = element['lat'];
                cartesMarkerUrl.lng = element['lng'];
                //sendRequest: Crea un marcador en el mapa de cartes
                sendRequest("POST", createURL(cartesMarkerUrl));
                //Llena lista desplegable para seleccionar sucursal
                let opt = document.createElement("option");
                opt.value = element['branchId'];
                opt.text = element['name'];
                sel.add(opt, null);
            });
        })
    });

    calendarSetup();
    sucursalSelectionSetup();
    fechaSelectionSetup();
    buttonRealizarSetup();
    buttonConfirmarSetup();

};
