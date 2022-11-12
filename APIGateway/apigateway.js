const http = require('http');
const config = require('../config.json')

/*
//PARTE PARA PROBAR SENDGRID ---- DEJE COMENTADA PARA PROBAR SUCURSALES

let option={
  hostname: 'localhost',
  port: config.PORTNOTIFICACIONES,
  method: 'POST',
  path: '/api/notificacion',
  headers: {'Content-Type': 'application/json'}
}
const request = http.request(option, function (response) {

console.log(response.url)
console.log(response.statusCode)
console.log(response.headers)
  let body = ''

  response.on('data', (chunk) => {
    body += chunk;
  });

  response.on('end', (data) => {
    //body+=data
    body = JSON.parse(body)

    console.log(body);
  });

  response.on('close', () => {
      console.log('3) Connection closed');
  });

});

let json={
  destinatario: 'tobiaseltoti5@gmail.com',
  asunto: 'nuevo mail',
  cuerpo: 'hola hola'
}
request.write(JSON.stringify(json));

request.end();
*/



let optionsGetSucursales = {
  hostname: 'localhost',
  port: config.PORTSUCURSALES,
  method: 'GET',
  path: '/api/sucursales',
  headers: { "Content-Type": "application/json" }
}

async function getSucursales(options){
  const promise = new Promise((resolve,reject) => {
    const request = http.request(options, function (response) {
      let body = '';
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => {
        body = JSON.parse(body);
        resolve(body);
      });
      response.on('close', () => {
        console.log('3) Connection to sucursales closed');
      });
    });
    request.end();
  });
  return promise;
}

const server = http.createServer((request, response) => {
  let url = request.url.split("/").filter(Boolean);
  response.setHeader('Content-Type', 'application/json');
  if ((request.method === "GET") && (url[0] === "api") && (url[1] === "sucursales") && (url.length <= 3)) {
    const promise = getSucursales(optionsGetSucursales);
    promise.then((dataSucursales) => {
      response.setHeader('Access-Control-Allow-Origin','*');
      response.end(JSON.stringify(dataSucursales));
    })
  }
});


server.listen(config.PORTAPIGATEWAY, function () {
  console.log(`Server started on port: ${config.PORTAPIGATEWAY}`);
});
