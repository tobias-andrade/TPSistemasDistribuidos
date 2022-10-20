const sucursales = require('./sucursales.json');

console.log(sucursales)

const http = require('http')

var myVar = (request, response) => {
    console.log('2) Socket connected');

    response.setHeader("Content-Type","application/json")
    response.writeHead(200)
    response.end(JSON.stringify(sucursales))
}

const server = http.createServer(myVar);

server.listen(8080, function() {
  console.log('1) Server started');
});
