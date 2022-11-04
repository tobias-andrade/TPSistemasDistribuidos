const http = require('http')
const https = require('node:https')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const port = 8081

var sendEmail = async function(destinatario, asunto, cuerpo) {
  let msg = {
    to: destinatario, // Change to your recipient
    from: 'lucianofrangolini2@gmail.com', // Change to your verified sender
    subject: asunto,
    //text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>'+cuerpo+'</strong>',
  }
  
  sgMail
  .send(msg)
  .then((response) => {
    console.log(response[0].statusCode)
    console.log(response[0].headers)
    console.log('ok')
    return 200
  })
  .catch((error) => {
    console.log('error')
    return error.ResponseError
    console.error(error)
  })

}

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
      if(url[0] == 'api' && url[1]== 'send'){
        if(!body.hasOwnProperty('destinatario') || body['destinatario'] == null || body['destinatario'] == ''){
          response.writeHead(400)
          res={errorMessage:'Destinatario no puede ser null'}
          response.end(JSON.stringify(res))
        }else if(!body.hasOwnProperty('asunto')|| body['asunto'] == null || body['asunto']==''){
          response.writeHead(400)
          res={errorMessage:'Asunto no puede ser null'}
          response.end(JSON.stringify(res))
        }else if(!body.hasOwnProperty('cuerpo') || body['cuerpo']== null || body['cuerpo']==''){
          response.writeHead(400)
          res={errorMessage:'Cuerpo no puede ser null'}
          response.end(JSON.stringify(res))
        }else{
          //mando el mail
        
          /*const msg = {
            to: body['destinatario'], // Change to your recipient
            from: 'lucianofrangolini2@gmail.com', // Change to your verified sender
            subject: body['asunto'],
            //text: 'and easy to do anywhere, even with Node.js',
            html: '<strong>'+body['cuerpo']+'</strong>'}*/
            sendEmail2(body['destinatario'], body['asunto'], body['cuerpo'])
           /* sgMail
              .send(msg)
              .then((val) => {
                console.log(val[0].statusCode)
                console.log(val[0].headers)
                response.writeHead(200)
                response.end(JSON.stringify(res))
               })
              .catch((error) => {
                //console.log(error.response.body.errors[0].message)
                response.writeHead(401)
                res={errorMessage: error.response.body.errors[0].message}
                response.end(JSON.stringify(res))
                //console.error(error)
              })*/
        }
      }else{
        response.writeHead(400)
        res ={errorMessage: 'Servicio no encontrado'}
        response.end(JSON.stringify(res))
      }
    }else{
      response.writeHead(400)
      res ={errorMessage: 'Servicio no encontrado'}
      response.end(JSON.stringify(res))

    }
    //response.end(JSON.stringify(res))
  })
}


const server = http.createServer(option);

server.listen(port, function() {
  console.log('1) Server started');
});

let sendEmail2 = function(destinatario, subject, contenido){

  console.log('entre a sendemail')
let optionsCreateMap = {
    hostname: 'api.sendgrid.com',
    //port: 8080,
    method: 'POST',
    path: '/v3/mail/send',
    headers: {"Content-Type": "application/json", 'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`}
}

let request = https.request(optionsCreateMap, (response) =>{

  console.log(response.statusCode)
  
  let body=''
  /*response.on('data', (chunk) => {
    body += chunk;
  });

  response.on('end', () => {

    //body = JSON.parse(body)
    
    console.log(body);
  });

  response.on('close', () => {
      console.log('3) Connection closed');

  });*/
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
    }}

    console.log(process.env.SENDGRID_API_KEY)

request.write(JSON.stringify(cuerpo))
request.end()


  }
/*curl --request POST \
--url https://api.sendgrid.com/v3/mail/send \
--header 'Authorization: Bearer <<YOUR_API_KEY>>' \
--header 'Content-Type: application/json' \
--data '{"personalizations":[{"to":[{"email":"john.doe@example.com","name":"John Doe"}],"subject":"Hello, World!"}],"content": [{"type": "text/plain", "value": "Heya!"}],"from":{"email":"sam.smith@example.com","name":"Sam Smith"},"reply_to":{"email":"sam.smith@example.com","name":"Sam Smith"}}'
*/