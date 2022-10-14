const http = require('http');

const request = http.request('http://localhost:8080/', { method: 'GET' }, function (response) {

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

request.write('hola');

request.end();