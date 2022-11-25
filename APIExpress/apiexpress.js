const fs = require('fs')
const http = require('http');
const config = require('../config.json')
const express = require('express')
const app = express()
const port = config.PORTAPIEXPRESS

const { auth } = require("express-oauth2-jwt-bearer");
const authConfig = require("./auth_config.json");

const checkJwt = auth({
    audience: authConfig.audience,
    issuerBaseURL: `https://${authConfig.domain}`
  });

let leeJson = function () {
    let rawdata = fs.readFileSync('./login.json')
    let jsonLogin = JSON.parse(rawdata)
    return jsonLogin
}

let escribirJson = function (json){
    fs.writeFileSync('./login.json', JSON.stringify(json))
}

app.use(express.json({
    type: 'text/plain'
}))

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header("Access-Control-Allow-Methods", 
    "GET, POST, OPTIONS, DELETE")
    req.header("Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next()
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

let optionsGetSucursales = {
    hostname: 'localhost',
    port: config.PORTSUCURSALES,
    method: 'GET',
    path: '',
    headers: { "Content-Type": "application/json" }
}

let optionReservas = {
    hostname: 'localhost',
    port: config.PORTRESERVAS,
    method: '',
    path: '',
    headers: { 'Content-Type': 'application/json' }
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

    optionReservas.method = 'GET'
    optionReservas.path = url

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

    optionReservas.method = 'POST'
    optionReservas.path = url

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

app.get('/api/sucursales(/*)?', (req, res) => {
    let url = req.url.split("/").filter(Boolean);
    if (url.length == 2)
        optionsGetSucursales.path = '/api/sucursales'
    else
        optionsGetSucursales.path = '/api/sucursales/' + url[url.length - 1]
    getSucursales(optionsGetSucursales)
        .then((dataSucursales) => {
            res.status(config.SUCCESSCODE);
            res.send(dataSucursales);
        })
        .catch((resp) => {
            res.status(config.SERVICEERROR)
            res.send(resp)
        })
})



app.get('/api/reservas(/*)?', checkJwt, (req, res) => {
    getReservas(req.url)
        .then((resp) => {
            res.status(config.SUCCESSCODE)
            res.send(resp)
        })
        .catch((resp) => {
            res.status(config.SERVICEERROR)
            res.send(resp)
        })
})

app.post('/api/reservas/solicitar/*', checkJwt, (req, res) => {
    postReservas(req.url, req.body)
        .then((resp) => {
            res.status(config.SUCCESSCODE)
            res.send(resp)
        })
        .catch((resp) => {
            res.status(config.SERVICEERROR)
            res.send(resp)
        })
})

app.post('/api/reservas/confirmar/*', checkJwt, (req, res) => {
    postReservas(req.url, req.body)
        .then((resp) => {
            res.status(config.SUCCESSCODE)
            res.send(resp)
        })
        .catch((resp) => {
            res.status(config.SERVICEERROR)
            res.send(resp)
        })
})

app.delete('/api/reservas/*', checkJwt, (req, res) => {
    //definir
    postReservas(req.url, req.body)
        .then((resp) => {
            res.status(config.SUCCESSCODE)
            res.send(resp)
        })
        .catch((resp) => {
            res.status(config.SERVICEERROR)
            res.send(resp)
        })
})

// let getUserId = function (url) {
//     let query = url.indexOf('?') != -1 ? url.substring(url.indexOf('?')) : null;
//     query = new URLSearchParams(query)
//     let email = query.get('email')
//     let token = query.get('token')

//     return new Promise((resolve, reject) => {
//         let json = leeJson()

//         let id = 0
//         let i = 0

//         while (i < json.length && id === 0) {
//             if (token == json[i].token)
//                 id = json[i].userId
//         }
        
//         if (i === json.length){
//             json.push({
//                 "email": email,
//                 "token": token,
//                 "userId": i
//             })
//             escribirJson(json)
//             id = i
//         }

//         resolve(JSON.stringify({
//             "userId": id
//         }))
//     })
// }

// app.get('/api/login', (req, res) => {
//     getUserId(req.url)
//         .then((resp) => {
//             res.status(config.SUCCESSCODE)
//             res.send(resp)
//         })
//         .catch((resp) => {
//             res.status(config.SERVICEERROR)
//             res.send(resp)
//         })
// })
