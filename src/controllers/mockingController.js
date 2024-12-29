import * as mockingServices from "../services/mockingServices.js";
import User from "../models/User.js";

export const generateMockingData = async (req, res) => {
  try {
    console.log("Request received for generating mocked users.");

    // Generar usuarios simulados (por defecto 50)
    const mockedUsers = mockingServices.generateMockUsers(50);
    console.log("Mocked users successfully generated:", mockedUsers);

    res.status(200).json({
      status: "success",
      data: mockedUsers,
    });
  } catch (error) {
    console.error("Error in generateMockingData:", error);
    res.status(500).json({
      status: "error",
      message: "Error generating mocked users",
    });
  }
};

export const generateAndInsertData = async (req, res) => {
  try {
    console.log("Request received for generating and inserting data.");

    const { users, pets } = req.body;

    // Validar parámetros numéricos
    if (!users || users <= 0 || !Number.isInteger(users) || pets < 0 || !Number.isInteger(pets)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid 'users' or 'pets' parameter",
      });
    }

    // Generar usuarios y asignar mascotas según los parámetros
    const generatedUsers = mockingServices.generateMockUsers(users, pets);
    console.log(`Generated ${users} users with ${pets} pets each.`);

    // Obtener los correos electrónicos existentes en la base de datos
    const existingEmails = await User.find({}).select("email").lean();
    const existingEmailSet = new Set(existingEmails.map((user) => user.email));

    // Filtrar solo los usuarios que no estén ya registrados
    const newUsers = generatedUsers.filter((user) => !existingEmailSet.has(user.email));

    if (newUsers.length > 0) {
      // Insertar los nuevos usuarios en la base de datos
      const insertedUsers = await User.insertMany(newUsers, { ordered: false });
      console.log("New users successfully inserted into the database:", insertedUsers);

      res.status(200).json({
        status: "success",
        message: `Generated and inserted ${newUsers.length} new users with ${pets} pets each.`,
        data: insertedUsers,
      });
    } else {
      console.log("No new users to insert.");
      res.status(200).json({
        status: "success",
        message: "No new users to insert. All users already exist in the database.",
      });
    }
  } catch (error) {
    console.error("Error in generateAndInsertData:", error);
    res.status(500).json({
      status: "error",
      message: "Error generating and inserting data",
    });
  }
};
