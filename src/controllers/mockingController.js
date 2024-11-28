const mockingServices = require("../services/mockingServices");
const User = require("../models/User");

const generateMockingData = async (req, res) => {
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

const generateAndInsertData = async (req, res) => {
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

    // Insertar usuarios en la base de datos
    await User.deleteMany({}); 
    const insertedUsers = await User.insertMany(generatedUsers);
    console.log("Users successfully inserted into the database:", insertedUsers);

    res.status(200).json({
      status: "success",
      message: `Generated and inserted ${users} users with ${pets} pets each.`,
      data: insertedUsers,
    });
  } catch (error) {
    console.error("Error in generateAndInsertData:", error);
    res.status(500).json({
      status: "error",
      message: "Error generating and inserting data",
    });
  }
};

module.exports = {
  generateMockingData,
  generateAndInsertData,
};
