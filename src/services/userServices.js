const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cartRepository = require("../repositories/cartRepository");

// Crear un usuario con un carrito asignado
const createUser = async (userData) => {
  const { email } = userData;
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Email ya registrado");

  const newUser = new User(userData);
  await newUser.save(); // Crear un carrito nuevo para el usuario con su ID

  const newCart = await cartRepository.createCartForUser(newUser._id);
  newUser.cart = newCart._id;
  await newUser.save();

  return newUser;
};

// Autenticación de usuario
const authenticateUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    throw new Error("Credenciales incorrectas");
  }
  return user;
};

// Generar JWT para un usuario
const generateJWT = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// Asignar un carrito al usuario si no tiene uno
const assignCartToUser = async (user) => {
  if (!user.cart) {
    const newCart = await cartRepository.createCartForUser(user._id);
    user.cart = newCart._id;
    await user.save();
  }
  return user.cart;
};

module.exports = {
  createUser,
  authenticateUser,
  generateJWT,
  assignCartToUser,
};
