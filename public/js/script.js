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

var reservasUrlToken = {
    scheme: "http",
    server: "localhost:8084", //Debería leerse de alguna configuración, pero no se cómo todavía
    path: "api/reservas",
    userId: "",
    dateTime: "",
    branchId: ""
};

var reservasDeleteUrlToken = {
    scheme: "http",
    server: "localhost:8084", //Debería leerse de alguna configuración, pero no se cómo todavía
    path: "api/reservas/delete",
    userId: "",
    reservaId: ""
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

function sendRequest(method, url, body) {
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


function sendRequestToken(method, url, token) {
    const promise = new Promise((resolve, reject) => {
        let header = {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + token,
        };
        const request = fetch(url, {
            method: method,
            headers: header,
        }).then(res => {
            if (res.status == 200) {
                resolve(res.json())
            }
            else
                console.log(res.status)
        })
    });
    return promise;
};

function sendRequestButton(method, url, body) {
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

function sendRequestTokenButton(method, url, body, token) {
    const promise = new Promise((resolve, reject) => {
        let header = {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + token,
        };

        const request = fetch(url, {
            method: method,
            headers: header,
            body: JSON.stringify(body)
        }).then(res => {
            if (res.status == 200) {
                resolve()
            }
            else
                alert("Hubo un problema, no se pudo solicitar la reserva")
        })
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
        } else {
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

function buttonRealizarSetup() {
    let button = document.getElementById("button_realizar");
    let email = document.getElementById("email");
    button.addEventListener("click", () => {
        let userId = window.sessionStorage.getItem('userId');
        let token = window.sessionStorage.getItem('token');
        let e = window.sessionStorage.getItem('email');
        if (userId !== null) {
            verificacionTurnoUrl.server = 'localhost:' + '8084'
            let idReserva = document.getElementById("horas_disponibles").value;
            verificacionTurnoUrl.path = "api/reservas/solicitar/" + idReserva;
            sendRequestTokenButton("POST", createURL(verificacionTurnoUrl), { "userId": userId }, token).then((response) => {
                document.getElementById("button_confirmar").disabled = false;
                button.disabled = true;
                setTimeout(() => {
                    document.getElementById("button_confirmar").disabled = true;
                }, TIEMPOBLOQUEADO)
            }).catch(response => {
                console.log(response);
            });
        } else if (email.value !== null) {
            verificacionTurnoUrl.server = 'localhost:' + '8082'
            let idReserva = document.getElementById("horas_disponibles").value;
            verificacionTurnoUrl.path = "api/reservas/solicitar/" + idReserva;
            sendRequestButton("POST", createURL(verificacionTurnoUrl), { "userId": 0 }).then((response) => {
                document.getElementById("button_confirmar").disabled = false;
                button.disabled = true;
                setTimeout(() => {
                    document.getElementById("button_confirmar").disabled = true;
                }, TIEMPOBLOQUEADO)
            }).catch(response => {
                console.log(response);
            });
        }
    });
};

function buttonConfirmarSetup() {
    let button = document.getElementById("button_confirmar");
    button.addEventListener("click", () => {
        let userId = window.sessionStorage.getItem('userId');
        let token = window.sessionStorage.getItem('token');
        let e = window.sessionStorage.getItem('email');

        if (userId != null) {

            confirmacionTurnoUrl.server = 'localhost:' + '8084'
            let idReserva = document.getElementById("horas_disponibles").value;
            confirmacionTurnoUrl.path = "api/reservas/confirmar/" + idReserva;
            sendRequestTokenButton("POST", createURL(confirmacionTurnoUrl), { "userId": userId, "email": e }, token).then((response) => {
                //console.log(response);
                document.getElementById("button_confirmar").disabled = true;
                listaTurnosSetup();
                alertReservaConfirmada();
            }).catch(response => {
                console.log(response);
            });

        } else {
            confirmacionTurnoUrl.server = 'localhost:' + '8082'
            let email = document.getElementById("email").value;
            let idReserva = document.getElementById("horas_disponibles").value;
            confirmacionTurnoUrl.path = "api/reservas/confirmar/" + idReserva;
            sendRequestButton("POST", createURL(confirmacionTurnoUrl), { "userId": 0, "email": email }).then((response) => {
                console.log(response);
                document.getElementById("button_confirmar").disabled = true;
                alertReservaConfirmada();
            }).catch(response => {
                console.log(response);
            });
        }
    });
};


function listaTurnosSetup() {
    let userId = window.sessionStorage.getItem('userId');
    let token = window.sessionStorage.getItem('token');
    reservasUrlToken.userId = userId;
    sendRequestToken("GET", createURL(reservasUrlToken), token).then((reservasData) => {
        let sel = document.getElementById("reservas_realizadas");
        removeOptionsFromSelect(sel);
        reservasData.forEach(element => {
            //Llena lista desplegable
            let date = new Date(element['dateTime']);
            let time = date.toLocaleTimeString();
            let day = date.getDate();
            let month = date.getMonth();
            let year = date.getFullYear();
            let opt = document.createElement("option");
            opt.value = element['idReserva'];
            opt.text = 'Fecha:' + day + '/' + month + '/' + year + ' Hora:' + time;
            sel.add(opt, null);
        });
    })
}


function buttonDeleteSetup() {
    let button = document.getElementById("button_eliminar");
    button.disabled = false;  
    button.addEventListener("click", () => {
        let userId = window.sessionStorage.getItem('userId');
        let token = window.sessionStorage.getItem('token');
        let idReserva = document.getElementById("reservas_realizadas").value
        reservasDeleteUrlToken.userId = userId;
        reservasDeleteUrlToken.reservaId = idReserva //obtener id de reserva
        sendRequestToken("DELETE", createURL(reservasDeleteUrlToken), token).then((response) => {
            console.log(response);
            alert("Reserva eliminada correctamente");
            listaTurnosSetup();
        }).catch(response => {
            console.log(response);
        });
    })
}

function alertReservaConfirmada() {
    let calendar = document.getElementById("calendar");
    let date = new Date(calendar.value);
    let diaReserva = calendar.value;
    let horaReserva = document.getElementById("horas_disponibles").options[document.getElementById("horas_disponibles").selectedIndex].text;
    let sucursal = document.getElementById("suc_selection").options[document.getElementById("suc_selection").selectedIndex].text;

    alert
    (
        "Reserva realizada correctamente para el dia: " + diaReserva + "\n" + 
        "a la hora: " + horaReserva + "\n" +
        "en: " + sucursal 
    )
}


window.onload = async () => {
    //sendRequest: Crea el mapa de cartes y "luego" retorna los datos de ese mapa
    sendRequest("POST", createURL(cartesMapUrl)).then(mapData => {
        let url = new URL(mapData.uuid + "/embed?type=map", "https://app.cartes.io/maps/");
        document.getElementById('cartesMap').src = url.href;
        //console.log(mapData)
        return mapData;
    }).then(mapData => {
        //sendRequest: Le pide a la apiGateWay las sucursales y "luego" crea los marcadores en el mapa
        sendRequest("GET", createURL(sucursalesUrl)).then((sucursalesData) => {
            let sel = document.getElementById("suc_selection");
            cartesMarkerUrl.path = `${cartesMarkerUrl.path}/${mapData.uuid}/markers`;
            //console.log(sucursalesData)
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
    buttonDeleteSetup();

}


document.addEventListener('DOMContentLoaded', async function (e) {


    //---------------------------



    //------------------


    await configureClient();

    updateUI();

    const isAuthenticated = await auth0Client.isAuthenticated();

    if (isAuthenticated) {
        // show the gated content

        document.getElementById("mis_reservas").style.display = "block";
        document.getElementById("div-form_email").style.display = "none";
        //listaTurnosSetup();

        return;
    }

    // NEW - check for the code and state parameters
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {

        // Process the login state
        let token = await auth0Client.handleRedirectCallback();

        let sessionData = await auth0Client.getIdTokenClaims()

        if (sessionData) {
            window.sessionStorage.setItem('token', sessionData.__raw)
            window.sessionStorage.setItem('email', sessionData.email)
            window.sessionStorage.setItem('userId', Hash(sessionData.email))
        }

        updateUI();

        // Use replaceState to redirect the user away and remove the querystring parameters
        window.history.replaceState({}, document.title, "/");
        //}

    }
})



//-----------------------------------------------------------------------------------

let auth0Client = null;

var urlLogin = {
    scheme: "http",
    server: "localhost:3000",
    path: "api/login",
    email: "",
    token: ""
};

function Hash(email) {
    var hash = 0;
    if (email.length == 0) return hash;
    for (i = 0; i < email.length; i++) {
        char = email.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return (hash < 0) ? hash * -1 : hash;
}

//const fetchAuthConfig = () => fetch("./auth_config.json");

const configureClient = async () => {
    //const response = await fetchAuthConfig();
    //const config = await response.json();

    const config = {
        "domain": "dev-cy4wo1ttnkj1fm38.us.auth0.com",
        "clientId": "zoBiu8GBTABl69ySRLNw983yMosGafV7",
        "audience": "zoBiu8GBTABl69ySRLNw983yMosGafV7"
    }

    auth0Client = await auth0.createAuth0Client({
        domain: config.domain,
        clientId: config.clientId
    });
};

const login = async () => {
    await auth0Client.loginWithRedirect({
        authorizationParams: {
            redirect_uri: window.location.origin
        }
    });
};

const logout = () => {
    auth0Client.logout({
        logoutParams: {
            returnTo: window.location.origin
        }
    });
    window.sessionStorage.removeItem('token')
    window.sessionStorage.removeItem('email')
    window.sessionStorage.removeItem('userId')
};


const updateUI = async () => {
    const isAuthenticated = await auth0Client.isAuthenticated();

    document.getElementById("btn-logout").disabled = !isAuthenticated;
    document.getElementById("btn-login").disabled = isAuthenticated;
    // NEW - add logic to show/hide gated content after authentication
    if (isAuthenticated) {

        document.getElementById("mis_reservas").style.display = "block"
        document.getElementById("div-form_email").style.display = "none"
        listaTurnosSetup();
        // let user = await auth0Client.getUser()
        // let token = await auth0Client.getTokenSilently()

        // urlLogin.email = user.name
        // urlLogin.token = token

        // await fetch(createURL(urlLogin), {
        //     method: "GET"
        // })

        // const data = await response.json()

    }
};


