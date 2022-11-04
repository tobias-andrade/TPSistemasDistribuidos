const http = require('http');

const request = http.request('http://localhost:8081', { method: 'POST' , path: '/api/send'}, function (response) {

console.log(response.url)
console.log(response.statusCode)
console.log(response.headers)
  let body = ''

  response.on('data', (chunk) => {
    body += chunk;
  });

  response.on('end', () => {
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