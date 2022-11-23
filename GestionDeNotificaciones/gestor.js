const http = require('http')
const https = require('node:https')
const config = require('../config.json')


var option = (request, response)=> {
  let url = request.url.substring(1)
  let method = request.method
  console.log('2) socket connected')
  console.log(url)
  console.log(method)
  url = url.split('/')
  let body = ''
  let res = {}
  response.setHeader('Content-Type', 'application/json')

  request.on('data', (data)=>{
    body += data
  })

  request.on('end', async ()=>{
    body = JSON.parse(body)
    console.log(body)
    if(method == 'POST'){
      //metodo aceptado
      if(url[0] == 'api' && url[1]== 'notificacion'){
        if(!body.hasOwnProperty('destinatario') || body['destinatario'] == null || body['destinatario'] == ''){
          response.writeHead(config.SERVICEERROR)
          res={errorMessage:'Destinatario no puede ser null'}
          response.end(JSON.stringify(res))
        }else if(!body.hasOwnProperty('asunto')|| body['asunto'] == null || body['asunto']==''){
          response.writeHead(config.SERVICEERROR)
          res={errorMessage:'Asunto no puede ser null'}
          response.end(JSON.stringify(res))
        }else if(!body.hasOwnProperty('cuerpo') || body['cuerpo']== null || body['cuerpo']==''){
          response.writeHead(config.SERVICEERROR)
          res={errorMessage:'Cuerpo no puede ser null'}
          response.end(JSON.stringify(res))
        }else{
          //mando el mail
            sendEmail(body['destinatario'], body['asunto'], body['cuerpo'])
            .then((value)=>{
              //email enviado
                response.writeHead(config.SUCCESSCODE)
                response.end(JSON.stringify({message:'mail enviado'}))

            })
            .catch((value)=>{
              //email no enviado
              response.writeHead(config.SERVICEERROR)
                let res ={errorMessage:'Mail no enviado'}
                response.end(JSON.stringify(res))

            })

        }
      }else{
        response.writeHead(config.SERVICEERROR)
        res ={errorMessage: 'Servicio no encontrado'}
        response.end(JSON.stringify(res))
      }
    }else{
      response.writeHead(config.SERVICEERROR)
      res ={errorMessage: 'Servicio no encontrado'}
      response.end(JSON.stringify(res))

    }
  })
}


const server = http.createServer(option);

server.listen(config.PORTNOTIFICACIONES, function() {
  console.log('1) Server started');
});

let optionSendEmail = {
    hostname: 'api.sendgrid.com',
    method: 'POST',
    path: '/v3/mail/send',
    headers: {"Content-Type": "application/json", 'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`}
}

let sendEmail = function(destinatario, subject, contenido){

  return new Promise(function(resolve, reject){
  let request = https.request(optionSendEmail, (response) =>{
    console.log(response.statusCode)
    if(response.statusCode>=200 && response.statusCode<=208){
      resolve()
    }else{
      reject()
    }
  });

  let cuerpo = {
    "personalizations":[{
      "to":[{
        "email":destinatario,
        "name":""
      }],
      "subject":subject
    }],
    "content": [{
      "type": "text/plain",
      "value": contenido
    }],
    "from":{
      "email":"lucianofrangolini2@gmail.com",
      "name":""},
      "reply_to":{
        "email":"lucianofrangolini2@gmail.com",
        "name":""
      }
    }
    request.write(JSON.stringify(cuerpo))
    request.end()
  })
}
