const http = require('http')
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
        
          const msg = {
            to: body['destinatario'], // Change to your recipient
            from: 'lucianofrangolini2@gmail.com', // Change to your verified sender
            subject: body['asunto'],
            //text: 'and easy to do anywhere, even with Node.js',
            html: '<strong>'+body['cuerpo']+'</strong>',}

            sgMail
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
              })
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