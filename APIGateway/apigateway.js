const http = require('http');

const request = http.request('http://localhost:8080', { method: 'POST' , path: '/api/sucursales/1'}, function (response) {

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

//request.write(JSON.stringify(json));

request.end();