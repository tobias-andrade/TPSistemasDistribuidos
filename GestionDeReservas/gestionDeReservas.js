const fs = require('fs');
//let jsonReservas = require('./reservas.json');
const http = require('http');
const { json } = require('stream/consumers');
const config= require('../config.json')
const TIEMPOBLOQUEADO = 60000

class Reserva {
    constructor(id, dateTime, userId, email, branchId) {
        this.id = id;
        this.dateTime = dateTime;
        this.userId = userId;
        this.email = email;
        this.branchId = branchId;
    }
}

let buscaReserva =  (branchId, dateTime) => {
    let jsonReservas= actualizaJson()
    let encontro = false;
    for (let i = 0; i < jsonReservas.length; i++) {
        if ((jsonReservas[i].branchId == branchId) && (jsonReservas[i].dateTime == dateTime)){
            encontro = true;
            break;
        }
    }
    return encontro;
}

let actualizaJson = function(){
    let rawdata = fs.readFileSync('./reservas.json')
    let jsonReservas = JSON.parse(rawdata)
    return jsonReservas
}


let buscaReservaPorId = function(id){
    let res={}
    let i=0
    let jsonReservas= actualizaJson()
    while(i<jsonReservas.length && jsonReservas[i].idReserva != id){
        i++
    }
    if(i<jsonReservas.length){
        //res={id:jsonReservas[i].id, dateTime: jsonReservas[i].dateTime, branchId: jsonReservas[i].branchId}
        res=jsonReservas[i]
    }else{
        res = null
    }
    return res
}

let buscaReservaLibre = function(userId, branchId, dateTime){

    let res = []
    let date = dateTime? new Date(dateTime): null
    //console.log(date)
    let jsonReservas= actualizaJson()
    for(let i=0; i<jsonReservas.length; i++){
        if(jsonReservas[i].userId == userId && ((userId==-1 && jsonReservas[i].status == 0) || (userId>=0 && jsonReservas[i].status == 2))){
            //ACLARACION: tiene que coincidir userId (-1,0 u otro) y ademas si es -1(libre) el status de la reserva debe ser 0, si es distinto de -1 el status debe ser 2 (confirmado)
            if(date != null){
                let date2 = new Date(jsonReservas[i].dateTime)
                if(date.getUTCDate() == date2.getUTCDate() && date.getUTCMonth() == date2.getUTCMonth() && date.getUTCFullYear() == date2.getUTCFullYear()){
                    if(branchId != null){
                        if(jsonReservas[i].branchId == branchId){
                            res.push(jsonReservas[i])
                        }
                    }else{
                        //si no se filtra por branch id, y coincide las fechas
                        res.push(jsonReservas[i])
                    }
                }
            }else{
                //si no se filtra por fecha, hay que ver si se filtra por branchid
                if(branchId != null){
                    if(jsonReservas[i].branchId == branchId){
                        res.push(jsonReservas[i])
                    }
                }else{
                    //no se filtra por bracnid, ni fecha, pero coincide en userid
                    res.push(jsonReservas[i])
                }
            }
        }
    }
    return res
}

let eliminaReserva = function(id){

    let jsonReservas = actualizaJson()
    let res;
    for(let i=0;i<jsonReservas.length; i++){
        if(jsonReservas[i].idReserva == id && jsonReservas[i].userId != null && jsonReservas[i].email != null){

        }
    }
}

let solicitaReserva = function(idReserva, idUser){
    let jsonReservas = actualizaJson()
    let res;
    let i=0;
    while(i<jsonReservas.length && jsonReservas[i].idReserva!=idReserva ){
        i++
    }
    if(i<jsonReservas.length){
        if(jsonReservas[i].idReserva == idReserva && jsonReservas[i].status == 0 && jsonReservas[i].userId == -1){
            //actualizo json con un 1 en status y activo timer
            jsonReservas[i].status=1
            jsonReservas[i].userId=idUser
            escribirJson(jsonReservas)
            setTimeout(function(id){
                let reservas = actualizaJson()
                let j=0
                while(j<reservas.length && reservas[j].idReserva != id){
                    j++
                }
                if(reservas[j].status == 1){
                    //no se confirmo, debo desbloquear la reserva
                    reservas[j].userId=-1
                    reservas[j].status=0
                    console.log('RESERVA NO CONFIRMADA, SE VUELVE ATRAS')
                    escribirJson(reservas)
                }
            }, TIEMPOBLOQUEADO, idReserva)
            return true;
        }else{
            return false;
        }
    }else{
        return false;
    }
}

let enviarMailConfirmacion = function(email, date, branch){
    let optionEmail = {
        hostname: 'localhost',
        port: config.PORTNOTIFICACIONES,
        method: 'POST',
        path: '/api/notificacion',
        headers:{'Content-Type': 'application/json'}
    }

    let a = new Date(date)
    let fecha = a.getDate() +'/'+(a.getMonth()+1)+' a las '+a.getHours()+':'+a.getMinutes()

    let bodyReq = {
        'destinatario': email,
        'asunto': 'Confirmacion Reserva',
        'cuerpo': 'Su turno fue confirmado para el dia ' + fecha + ' en la sucursal numero '+ branch
    }

    return new Promise((resolve, reject) =>{
        let req = http.request(optionEmail, (response)=>{
            let body = ''
            response.on('data', (data)=>{
                body += data
            })

            response.on('end', (data)=>{
                //body += data
                if(response.statusCode == config.SUCCESSCODE){
                    resolve('ok')
                }else{
                    reject(JSON.parse(body))
                }
            })
        })
        req.write(JSON.stringify(bodyReq))
        req.end()
    })
}

let confirmoReserva = function(idReserva, idUser, email){

    return new Promise((resolve, reject)=>{
        let jsonReservas= actualizaJson()
        let i=0
        while(i<jsonReservas.length && jsonReservas[i].idReserva != idReserva){
            i++
        }
        if(i< jsonReservas.length){
            if(jsonReservas[i].status == 1 && jsonReservas[i].userId == idUser){
                jsonReservas[i].status = 2
                jsonReservas[i].email = email
                escribirJson(jsonReservas)
                enviarMailConfirmacion(email, jsonReservas[i].dateTime, jsonReservas[i].branchId)
                .then((response)=>{
                    resolve(true) //se mando el mail correctamente
                }).catch((response)=>{
                    resolve(false) //no se mando el mail correctamente
                })
            }else{
                //reserva mal confirmada
                reject({messageError:'Reserva no pudo ser confirmada'})
            }
        }else{
            //reserva no encontrada
            reject({messageError:'Reserva no encontrada para ser confirmada'})
        }
    })
}

let escribirJson = function (json){
    fs.writeFileSync('./reservas.json', JSON.stringify(json))
}

var myVar = (request, response) => {
    console.log('2) Socket connected');
    let body= ''
    let path = request.method
    let url = request.url
    let query = url.indexOf('?') != -1? url.substring(url.indexOf('?')):null //me fijo si tiene query el url y la separo
    url = query != null? url.substring(1, url.indexOf('?')): url.substring(1) //si tiene query lo separo y sino lo unico le saco la / de adelante
    console.log(url)
    console.log(path)
    url= url.split('/')
    response.setHeader("Content-Type","application/json")

    request.on('data', (data)=>{
        body += data
    })

    request.on('end', (data)=>{
        //body += data
        if(url[0]== 'api' && url[1]=='reservas'){
            switch(path){
                case 'GET':
                    if(url.length == 3){
                        //viene un id de una reserva, hay que devolver la reserva esa

                        let respuesta = buscaReservaPorId(url[2])
                        if(respuesta != null){
                            response.writeHead(config.SUCCESSCODE)
                            response.end(JSON.stringify(respuesta))
                        }else{
                            response.writeHead(config.SERVICEERROR)
                            res={messageError:'reserva no encontrada'}
                            response.end(JSON.stringify(res))
                        }
                    }else{
                        //pueden venir query params, filtrar reservas y devolverlas
                        if(query != null){
                            query = new URLSearchParams(query)
                            let branchId = query.get('branchId')
                            let userId = query.get('userId')
                            let date = query.get('dateTime')
                            userId= userId == null? -1: userId
                            let respuesta = buscaReservaLibre(userId, branchId, date)
                            response.writeHead(config.SUCCESSCODE)
                            response.end(JSON.stringify(respuesta))
                        }else{
                            //let respuesta = buscaReservaLibre(-1, null, null)
                            let respuesta = actualizaJson()
                            response.writeHead(config.SUCCESSCODE);
                            response.end(JSON.stringify(respuesta));
                        }
                    }
                    break;
                case 'POST':
                    body = JSON.parse(body)
                    if(url.length == 4){
                        //url correcta
                        switch(url[2]){
                            case 'solicitar':
                                let  sol = solicitaReserva(url[3], body.userId)
                                if(sol == true){
                                    response.writeHead(config.SUCCESSCODE)
                                    response.end()
                                }else{
                                    response.writeHead(config.SERVICEERROR)
                                    let res={messageError:'no fue posible reservar su turno'}
                                    response.end(JSON.stringify(res))
                                }
                                break;
                            case 'confirmar':
                                confirmoReserva(url[3],body.userId,body.email)
                                .then((value)=>{
                                    //se confirmo la reserva
                                    response.writeHead(config.SUCCESSCODE)
                                    let res;
                                    if(value == true){
                                        //se envio el mail
                                        res = {message:'ok'}
                                    }else{
                                        //no se envio el mail
                                        res={message:'Reserva confirmada, no se pudo enviar el mail'}
                                    }
                                    response.end(JSON.stringify(res))
                                })
                                .catch((res)=>{
                                    //reserva no se pudo confirmar
                                    response.writeHead(config.SERVICEERROR)
                                    response.end(JSON.stringify(res))
                                })
                                break;
                            default:
                                //error de url
                                response.writeHead(config.SERVICEERROR)
                                response.end(JSON.stringify({messageError:'Servicio no encontrado'}))
                                break;
                        }
                    }else{
                        //url incorrecta
                        response.writeHead(config.SERVICEERROR)
                        response.end(JSON.stringify({messageError:'servicio no encontrado'}))
                    }
                    break;
                case 'DELETE':

                    break
                default:
            }
        }

    })

    /*response.setHeader("Content-Type","application/json")
    response.writeHead(200)
    response.end(JSON.stringify())*/
}

const server = http.createServer(myVar);

server.listen(config.PORTRESERVAS, function() {
  console.log('1) Server started');
});
