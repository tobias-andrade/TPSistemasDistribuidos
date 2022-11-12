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


function createCartesMap(method, url) {
    const promise = new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);

        xhr.setRequestHeader('Accept', 'application/json');

        xhr.responseType = 'json';

        xhr.onload = () => {
            resolve(xhr.response);
        }

        xhr.send();
    });
    return promise;
}

function createCartesMarker(method, url) {
    const promise = new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);

        xhr.setRequestHeader('Accept', 'application/json');

        xhr.responseType = 'json';

        xhr.onload = () => {
            resolve(xhr.response);
        }

        xhr.send();
    });
    return promise;
}

function getSucursales(method,url){
    const promise = new Promise((resolve,reject) => {
        let xhr = new XMLHttpRequest();

        xhr.open("GET", "http://localhost:8082/api/sucursales");


        xhr.responseType = 'json';

        xhr.onload = () => {
            resolve(xhr.response);
        }

        xhr.send();
    });
    return promise;
}

// "..." toma todos los elementos que faltan del objeto
function createURL({ scheme, server, path, ...queryParams }) {
    let url = `${scheme}://${server}/${path}`;
    let param = new URLSearchParams(getQueryParams(queryParams)).toString();
    if (param)
        url += "?" + param;
    return url;
}

function getQueryParams(queryParams) {
    const params = [];
    for (const [key, value] of Object.entries(queryParams))  //Separo cada query param como objeto key-value
        params.push([key, value]);
    return params;
}

window.onload = () => {
    createCartesMap("POST", createURL(cartesMapUrl)).then(mapData => {
        let url = new URL(mapData.uuid + "/embed?type=map", "https://app.cartes.io/maps/");
        document.getElementById('cartesMap').src = url.href;
        return mapData;
    }).then(mapData => {
        const aux = getSucursales();
        aux.then( (sucursalesData) => {
            cartesMarkerUrl.path = `${cartesMarkerUrl.path}/${mapData.uuid}/markers`;
            sucursalesData.forEach(element => {
                cartesMarkerUrl.category_name = `${element['name']} | Id: ${element['branchId']}`;
                cartesMarkerUrl.lat = element['lat'];
                cartesMarkerUrl.lng = element['lng'];
                createCartesMarker("POST",createURL(cartesMarkerUrl));
            });
        })
    });
};
