import nodemailer from "nodemailer";

// Configuración del transportador de correo
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Función para enviar correos
export const sendEmail = async (to, subject, htmlContent) => {
  try {
    await transporter.sendMail({
      from: `"Otaku Sushi Chile" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log("Correo enviado con éxito");
  } catch (error) {
    console.error("Error al enviar correo:", error);
  }
};
