const sucursales = require('./sucursales.json');
var config = require('./config.json');
const http = require('http')

const port = config.port;
const serviceNotFoundError = config.serviceError;
const sucursalNotFoundError = config.sucursalError;
const successCode = config.successCode;

//busca sucursal por id, se supone que el id existe, en caso de no existir devuelve null
var buscaSucursal = function (id) {
  for (let i = 0; i < sucursales.length; i++) {
    if (sucursales[i].id == id) {
      return sucursales[i];
    }
  }
  return null;
}


var sucursalServer = (request, response) => {
  let res;
  let url = request.url.split("/").filter(Boolean);
  let method = request.method;
  response.setHeader('Content-Type', 'application/json');
  if ((method === "GET") && (url[0] === "api") && (url[1] === "sucursales") && (url.length<=3)) {
    if (url.length == 2) { //Devolver todas las sucursales
      response.writeHead(successCode);
      res = sucursales;
    } else { //Devolver sucursal de id especifica
      let suc = buscaSucursal(url[2]);
      if (suc != null) {
        res = {
          'lat': suc.lat,
          'lng': suc.lng,
          'name': suc.name
        }
        response.writeHead(successCode)
      } else { //Error: La sucursal no fue encontrada
        response.writeHead(sucursalNotFoundError)
        res = {
          messageError: 'Sucursal no encontrada'
        }
      }
    }
  } else { //Error: El servicio no existe
    response.writeHead(serviceNotFoundError)
    res = {
      messageError: 'Servicio no encontrado'
    }
  }
  response.end(JSON.stringify(res));
}

const server = http.createServer(sucursalServer);

server.listen(port, function () {
  console.log(`Server started on port: ${port}`);
});
