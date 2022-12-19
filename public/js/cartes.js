/*window.onload = () =>{
    sendRequest("POST", createURL(cartesMapUrl)).then(mapData => {
        let url = new URL(mapData.uuid + "/embed?type=map", "https://app.cartes.io/maps/");
        document.getElementById('cartesMap').src = url.href;
        console.log(mapData)
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
}*/