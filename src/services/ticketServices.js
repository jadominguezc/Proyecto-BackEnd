import Ticket from "../models/Ticket.js";
import { sendTicketEmail } from "../controllers/ticketController.js";

const createTicket = async (purchaser, amount) => {
  try {
    const code = `TCKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const ticket = new Ticket({
      code,
      purchase_datetime: new Date(),
      amount,
      purchaser,
    });

    const savedTicket = await ticket.save();
    await sendTicketEmail(savedTicket);
    return savedTicket;
  } catch (error) {
    console.error("Error al generar el ticket:", error);
    throw new Error("Error al generar el ticket");
  }
};

export default { createTicket };
