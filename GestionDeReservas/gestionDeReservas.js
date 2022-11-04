const fs = require('fs');
//let jsonReservas = require('./reservas.json');
const http = require('http');
const port = 8082


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
    while(i<jsonReservas.length && jsonReservas[i].id != id){
        i++
    }
    if(i<jsonReservas.length){
        res={id:jsonReservas[i].id, dateTime: jsonReservas[i].dateTime, branchId: jsonReservas[i].branchId}
    }else{
        res = null
    }
    return res
}

let buscaReservaLibre = function(userId, branchId, dateTime){
    
    let res = []
    let date = dateTime? new Date(dateTime): null
    console.log(date)
    let jsonReservas= actualizaJson()
    for(let i=0; i<jsonReservas.length; i++){
        if(jsonReservas[i].userId == userId){
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
        if(jsonReservas[i].id == id && jsonReservas[i].userId != null && jsonReservas[i].email != null){
            
        }
    }
}

var myVar = (request, response) => {
    console.log('2) Socket connected');
    let path = request.method
    let url = request.url
    let query = url.indexOf('?') != -1? url.substring(url.indexOf('?')):null //me fijo si tiene query el url y la separo
    url = query != null? url.substring(1, url.indexOf('?')): url.substring(1) //si tiene query lo separo y sino lo unico le saco la / de adelante
    console.log(url)
    console.log(path)
    url= url.split('/')
    response.setHeader("Content-Type","application/json")

    if(url[0]== 'api' && url[1]=='reservas'){
        switch(path){
            case 'GET':
                if(url.length == 3){
                    //viene un id de una reserva, hay que devolver la reserva esa

                    let respuesta = buscaReservaPorId(url[2])
                    if(respuesta != null){
                        response.writeHead(200)
                        response.end(JSON.stringify(respuesta))
                    }else{
                        response.writeHead(400)
                        res={messageError:'reserva no encontrada'}
                        response.end(JSON.stringify(res))
                    }
                }else{
                    //pueden venir query params, filtrar reservas y devolverlas
                    if(query != null){
                        query = new URLSearchParams(query)
                        let branchId = query.get('branchId')
                        let userId = query.get('userID')
                        let date = query.get('dateTime')
                        let respuesta = buscaReservaLibre(userId, branchId, date)
                        response.writeHead(200)
                        response.end(JSON.stringify(respuesta))
                    }else{
                        let respuesta = buscaReservaLibre(null, null, null)
                        response.writeHead(200)
                        response.end(JSON.stringify(respuesta))
                    }
                }
                break;
            case 'POST':
                break;
            case 'DELETE':

                break
            default:
        }
    }

    /*response.setHeader("Content-Type","application/json")
    response.writeHead(200)
    response.end(JSON.stringify())*/
}

const server = http.createServer(myVar);

server.listen(port, function() {
  console.log('1) Server started');
});
