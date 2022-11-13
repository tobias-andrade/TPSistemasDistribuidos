const http = require('http')
const fs = require('fs')
const configg = require('../config.json')
//const { config } = require('process')
const MILISEGUNDOS_UN_DIA = 24 * 60 * 60 * 1000 //86400000
const MILISEGUNDOS_DOS_DIA = 48 * 60 * 60 * 1000 //172800000



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
            console.log(comp)
            if(comp > 0 && comp > MILISEGUNDOS_UN_DIA && comp < MILISEGUNDOS_DOS_DIA ){
                console.log(reservas[i])
                setTimeout(sendEmail, (comp-MILISEGUNDOS_UN_DIA), reservas[i].email, reservas[i].dateTime, reservas[i].branchId)
            }
        }
    }
}

let sendEmail = function(email, date, branch){
    let option={
        hostname: 'localhost',
        port: configg.PORTNOTIFICACIONES,
        method: 'POST',
        path: '/api/notificacion',
        headers: {'Content-Type':'application/json'}
    }
    let a = new Date(date)
    let fecha = a.getDate() +'/'+(a.getMonth()+1)+' a las '+a.getHours()+':'+a.getMinutes()
    console.log(fecha)
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
            //body+= data
            //if(response.statusCode != configg.SUCCESSCODE){
                body = JSON.parse(body)
                console.log(response.statusCode+'- '+body)
            //}
        })
    })

    req.write(JSON.stringify(bodyReq))
    req.end()
}

callback()
setInterval(callback, 86400000)