const sucursales = require('./sucursales.json');
const http = require('http');
const config = require('..config.json/')

//busca sucursal por id, se supone que el id existe, en caso de no existir devuelve null
var buscaSucursal = function (id) {
  for (let i = 0; i < sucursales.length; i++) {
    if (sucursales[i].id == id) {
      return sucursales[i];
    }
  }
  return null;
}

const server = http.createServer( (request, response) => {
  let res;
  let url = request.url.split("/").filter(Boolean);
  response.setHeader('Content-Type', 'application/json');
  if ((request.method === "GET") && (url[0] === "api") && (url[1] === "sucursales") && (url.length<=3)) {
    if (url.length == 2) { //Devolver todas las sucursales
      response.writeHead(config.SUCCESCODE);
      console.log("Conexión entrante");
      res = sucursales;
    } else { //Devolver sucursal de id especifica
      let suc = buscaSucursal(url[2]);
      if (suc != null) {
        res = {
          'lat': suc.lat,
          'lng': suc.lng,
          'name': suc.name
        }
        response.writeHead(config.SUCCESCODE);
      } else { //Error: La sucursal no fue encontrada
        response.writeHead(config.SUCURSALERROR);
        res = {
          messageError: 'Sucursal no encontrada'
        }
      }
    }
  } else { //Error: El servicio no existe
    response.writeHead(config.serviceError)
    res = {
      messageError: 'Servicio no encontrado'
    }
  }
  response.end(JSON.stringify(res));
});


server.listen(config.PORTSUCURSALES, function () {
  console.log(`Server started on port: ${config.port}`);
});
