const http = require('http')
const fs = require('fs')
const config = require('../config.json')
const { config } = require('process')
const MILISEGUNDOS_UN_DIA = 24 * 60 * 60 * 1000
const MILISEGUNDOS_DOS_DIA = 48 * 60 * 60 * 1000

callback()
setInterval(callback, 86400000)

let actualizaJson = function(){
    let rw = fs.readFileSync('../GestionDeReservas/reservas.json')
    return JSON.parse(rw)
}

let callback = function(){
    let reservas = actualizaJson()
    let now = new Date(Date.now())
    for(let i=0; i<reservas.length; i++){
        if(reservas[i].status == 2){
            let date = new Date(reservas[i].dateTime)
            let comp = date.getTime() - now.getTime()
            if(comp > 0 && comp > MILISEGUNDOS_UN_DIA && comp < MILISEGUNDOS_DOS_DIA ){
                setTimeout(sendEmail, (comp-MILISEGUNDOS_UN_DIA), reservas[i].email, reservas[i].dateTime, reservas[i].branchId)
            }
        }
    }
}

let sendEmail = function(email, date, branch){
    let option={
        hostname: 'localhost',
        port: config.PORTNOTIFICACIONES,
        method: 'POST',
        path: '/api/notificacion',
        headers: {'Content-Type':'application/json'}
    }
    let a = new Date(date)
    let fecha = a.getDay() +'/'+a.getMonth()+' a las '+a.getHours()+':'+a.getMinutes()

    let bodyReq = {
        'destinatario': email,
        'asunto': 'Recordatorio de Reserva',
        'cuerpo': 'Estimado, recuerde que usted tiene una reserva para el dia ' + fecha + ' en la sucursal numero '+ branch
    }

    let req = http.request(option, (response)=>{
        let body =''

        response.on('data', (data)=>{
            body += data
        })

        response.on('end', (data)=>{
            body+= data
            if(response.statusCode != config.SUCCESCODE){
                body = JSON.parse(body)
                console.log(response.statusCode+'- '+body.errorMessage)
            }
        })
    })

    req.write(JSON.stringify(bodyReq))
    req.end()
}