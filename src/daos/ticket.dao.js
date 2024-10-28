const Ticket = require('../models/Ticket');

class TicketDAO {
    async createTicket(ticketData) {
        const ticket = new Ticket(ticketData);
        return await ticket.save();
    }

    async findTicketById(ticketId) {
        return await Ticket.findById(ticketId);
    }

    async findTicketByCode(code) {
        return await Ticket.findOne({ code });
    }
}

module.exports = new TicketDAO();
