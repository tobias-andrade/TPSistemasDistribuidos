const fs = require('fs');
const jsonReservas = require('./reservas.json');
const http = require('http');

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
    let encontro = false;
    for (let i = 0; i < jsonReservas.length; i++) {
        if ((jsonReservas[i].branchId == branchId) && (jsonReservas[i].dateTime == dateTime)){
            encontro = true;
            break;
        }
    }
    return encontro;
}


const time = new Date('2022-07-21T09:35:31.820Z');
console.log(time.getUTCMonth())

let variable = jsonReservas;
console.log(buscaReserva(2,"2022-09-02T19:58:10.406Z"));



/*
if (buscaReserva(2,"2022-09-02T19:58:10.406Z")) {
    //Le dice al usuario que ya existe
} else {
    //Le envía al usuario que confirme el turno
}*/



let reservaAux = [
    {
        id: 1,
        dateTime: "2022-09-02T19:58:10.406Z",
        userId: 2,
        email: "email@gmail.com",
        branchId: 1
    },
    {
        id: 2,
        dateTime: "2022-09-02T19:58:10.406Z",
        userId: 2,
        email: "email@gmail.com",
        branchId: 2
    },
    {
        id: 3,
        dateTime: "2022-09-02T19:58:10.406Z",
        userId: 2,
        email: "email@gmail.com",
        branchId: 3
    },
]


//console.log(turnos)

/*
fs.writeFile("reservas.json", JSON.stringify(reservaAux), (err) => {
    if (err) {
        console.log(err);
    }
});
*/


/*console.log(buscaReserva(1,2));
console.log(buscaReserva(2,"2022-09-02T19:58:10.406Z"));*/

//console.log(JSON.parse(jsonObj));
/*
fs.writeFile("test.json", JSON.parse(jsonData), (err) => {
    if (err) {
        console.log(err);
    }
});*/

/*
var myVar = (request, response) => {
    console.log('2) Socket connected');



    response.setHeader("Content-Type","application/json")
    response.writeHead(200)
    response.end(JSON.stringify())
}

const server = http.createServer(myVar);

server.listen(8080, function() {
  console.log('1) Server started');
});
*/
