class Order {
    constructor(employeeId, clientId, tourId, dateOfOrder, id = -1) {
        this.id = id;
        this.employeeId = employeeId;
        this.clientId = clientId;
        this.tourId = tourId;
        this.dateOfOrder = dateOfOrder;
    }
}

module.exports = {
    Order: Order,
};
