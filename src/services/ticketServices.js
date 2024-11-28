const ticketDAO = require("../daos/ticket.dao");
const TicketDTO = require("../dtos/ticket.dto");
const Ticket = require("../models/Ticket");
const { sendTicketEmail } = require("../controllers/ticketController");

const createTicket = async (purchaser, amount) => {
  try {
    // Genera un código único para el ticket
    const code = `TCKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`; // Crea el ticket en la base de datos

    const ticket = new Ticket({
      code,
      purchase_datetime: new Date(),
      amount,
      purchaser,
    }); // Guarda el ticket y devuelve el resultado

    const savedTicket = await ticket.save(); // Enviar el correo electrónico al comprador después de crear el ticket

    await sendTicketEmail(savedTicket);

    return savedTicket;
  } catch (error) {
    console.error("Error al generar el ticket:", error);
    throw new Error("Error al generar el ticket");
  }
};

module.exports = { createTicket };
