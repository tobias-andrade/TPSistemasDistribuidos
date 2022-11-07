var cartesUrl = {
    scheme: "https",
    server: "cartes.io",
    path: "api/maps",
    title: "newMap",
    privacy: "public",
    users_can_create_markers: "yes"
};

async function createCartesMap(method, url, header) {
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

    createCartesMap("POST", createURL(cartesUrl)).then(responseData => {
        let url = new URL(responseData.uuid + "/embed?type=map", "https://app.cartes.io/maps/")
        document.getElementById('cartesMap').src = url.href;
    });
};
