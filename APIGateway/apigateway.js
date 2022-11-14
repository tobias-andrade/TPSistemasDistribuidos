const http = require('http');
const { resolve } = require('path');
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

async function getSucursales(options) {
  const promise = new Promise((resolve, reject) => {
    const request = http.request(options, function (response) {
      let body = '';
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => {
        body = JSON.parse(body);
        if (response.statusCode == 200) {
          resolve(body);
        } else {
          reject(body)
        }
      });
      response.on('close', () => {
        console.log('3) Connection to sucursales closed');
      });
      response.on('error', (err) => {
        console.error('error ' + err.message)
      })
    });
    request.end();
  });
  return promise;
}

let getReservas = function (url) {
  let aux = ''
  for (let i = 0; i < url.length; i++) {
    aux += '/' + url[i]
  }

  let optionReservas = {
    hostname: 'localhost',
    port: config.PORTRESERVAS,
    method: 'GET',
    path: aux,
    headers: { 'Content-Type': 'application/json' }
  }

  return new Promise((resolve, reject) => {
    let req = http.request(optionReservas, (response) => {
      let body = ''
      response.on('data', (data) => {
        body += data;
      })
      response.on('end', () => {
        if (body != '') {
          body = JSON.parse(body)
        }
        if (response.statusCode == 200) {
          resolve(body);
        } else {
          reject(body)
        }
      })
    })
    req.end()
  })
}

let postReservas = function (url, body) {
  let aux = ''
  for (let i = 0; i < url.length; i++) {
    aux += '/' + url[i]
  }
  let optionReservas = {
    hostname: 'localhost',
    port: config.PORTRESERVAS,
    method: 'POST',
    path: aux,
    headers: { 'Content-Type': 'application/json' }
  }
  return new Promise((resolve, reject) => {
    let req = http.request(optionReservas, (response) => {
      let cuerpo = ''
      response.on('data', (data) => {
        cuerpo += data
      })
      response.on('end', () => {
        if (cuerpo != '') {
          cuerpo = JSON.parse(cuerpo)
        }
        if (response.statusCode == 200) {
          resolve(cuerpo)
        } else {
          reject(cuerpo)
        }
      })
    })
    req.write(JSON.stringify(body))
    req.end()
  })
}

const server = http.createServer((request, response) => {
  let url = request.url.split("/").filter(Boolean);
  response.setHeader('Content-Type', 'application/json');
  let body = ''
  request.on('data', (data) => {
    body += data
  })

  request.on('end', () => {
    console.log(request.url)
    if ((request.method === "GET") && (url[0] === "api") && (url[1] === "sucursales") && (url.length <= 3)) {
      const promise = getSucursales(optionsGetSucursales);
      promise.then((dataSucursales) => {
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.writeHead(config.SUCCESSCODE);
        response.end(JSON.stringify(dataSucursales));
      }).catch((res) => {
        response.writeHead(400)
        response.setHeader('Access-Control-Allow-Origin', '*')
        response.end(JSON.stringify(res))
      })
    } else if (url[0] == 'api' && url[1].indexOf('reservas') != -1) {
      if (request.method == 'GET') {
        getReservas(url)
          .then((res) => {
            response.setHeader('Access-Control-Allow-Origin', '*');
            response.writeHead(config.SUCCESSCODE)
            console.log(res);
            response.end(JSON.stringify(res))
          })
          .catch((res) => {
            response.setHeader('Access-Control-Allow-Origin', '*');
            response.writeHead(config.SERVICEERROR)
            response.end(JSON.stringify(res))
          })
      } else if (request.method == 'POST') {
        postReservas(url, JSON.parse(body))
          .then((res) => {
            response.setHeader('Access-Control-Allow-Origin', '*');
            response.writeHead(config.SUCCESSCODE)
            response.end(JSON.stringify(res))
          })
          .catch((res) => {
            response.setHeader('Access-Control-Allow-Origin', '*');
            response.writeHead(config.SERVICEERROR)
            response.end(JSON.stringify(res))
          })
      }
    }
  })
});


server.listen(config.PORTAPIGATEWAY, function () {
  console.log(`Server started on port: ${config.PORTAPIGATEWAY}`);
});
