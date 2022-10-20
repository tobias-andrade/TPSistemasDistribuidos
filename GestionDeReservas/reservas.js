class Reserva {
    constructor(id,dateTime, userId, email, branchId) {
      this.id = id;
      this.dateTime = dateTime;
      this.userId = userId;
      this.email = email;
      this.branchId = branchId;
    }
}

module.exports = {
    Reserva: Reserva
}
