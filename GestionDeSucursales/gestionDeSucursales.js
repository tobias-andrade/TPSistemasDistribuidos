const sucursales = require('./sucursales.json');

console.log(sucursales)

const http = require('http')

//busca sucursal por id, se supone que el id existe, en caso de no existir devuelve null
var buscaSucursal = function(id){
  for(let i=0; i<sucursales.length; i++){
    if(sucursales[i].id == id){
      return sucursales[i];
    }
  }
  return null
}

var myVar = (request, response) => {
  let url = request.url.substring(1);
  let method = request.method;
  console.log(url)
  console.log(method)
  console.log('2) socket connected')
  response.setHeader('Content-Type', 'application/json')
  let res ={}
  url = url.split('/');
  if(method == 'GET'){
    if(url[0]!= 'api' || url[1] != 'sucursales'){
      response.writeHead(400)
      res={
        messageError: 'Servicio no encontrado'
      }
    }else{
      if(url.length == 2){ //devolver todas las sucursales
        response.writeHead(200)
        res = sucursales
      }else{ //devolver sucursal de id especifica
        let suc = buscaSucursal(url[2]);
        console.log(suc)
        if(suc != null){
        res = {
          'lat': suc.lat,
          'lng': suc.lng,
          'name': suc.name
        }
        response.writeHead(200)
      }else{
        //la sucursal no fue encontrada
        response.writeHead(400)
        res = {
          messageError: 'Sucursal no encontrada'
        }
      }
    }
  }
  }else{ //codigo de error con mensaje 
    response.writeHead(400)
    res = {
      messageError: 'Servicio no encontrado'
    }
  }

      console.log(res)
      response.end(JSON.stringify(res))
}

const server = http.createServer(myVar);

server.listen(8080, function() {
  console.log('1) Server started');
});
