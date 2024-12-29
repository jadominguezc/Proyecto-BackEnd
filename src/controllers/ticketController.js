import { sendEmail } from "../config/emailConfig.js"; 

export const sendTicketEmail = async (ticket) => {
  const { purchaser, code, purchase_datetime, amount } = ticket; 

  const emailContent = `
    <h1>Detalles de tu Compra</h1>
    <p><strong>Código:</strong> ${code}</p>
    <p><strong>Fecha de Compra:</strong> ${purchase_datetime}</p>
    <p><strong>Monto Total:</strong> $${amount}</p>
    <p><strong>Comprador:</strong> ${purchaser}</p>
    <p>¡Gracias por tu compra!</p>
  `;

  // Enviar el correo
  try {
    await sendEmail(purchaser, "Detalles de tu Compra", emailContent);
    console.log("Correo enviado exitosamente a:", purchaser);
  } catch (error) {
    console.error("Error al enviar el correo electrónico:", error);
  }
};
