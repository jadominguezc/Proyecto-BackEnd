const User = require("../models/User");

class UserRepository {
  // Buscar usuario por correo electrónico
  async findByEmail(email) {
    try {
      const user = await User.findOne({ email });
      return user;
    } catch (error) {
      console.error("Error al buscar usuario por email:", error);
      throw error;
    }
  } // Buscar usuario por ID

  async findById(userId) {
    try {
      const user = await User.findById(userId);
      return user;
    } catch (error) {
      console.error("Error al buscar usuario por ID:", error);
      throw error;
    }
  } // Crear un nuevo usuario

  async createUser(userData) {
    try {
      const newUser = new User(userData);
      return await newUser.save();
    } catch (error) {
      console.error("Error al crear un nuevo usuario:", error);
      throw error;
    }
  } // Actualizar un usuario existente

  async updateUser(userId, updateData) {
    try {
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      });
      return updatedUser;
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      throw error;
    }
  } // Eliminar un usuario por ID

  async deleteUser(userId) {
    try {
      await User.findByIdAndDelete(userId);
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      throw error;
    }
  }
}

module.exports = new UserRepository();
