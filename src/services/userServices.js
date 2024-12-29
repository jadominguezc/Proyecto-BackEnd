import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cartRepository from "../repositories/cartRepository.js";

export const createUser = async (userData) => {
  const { email } = userData;
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Email ya registrado");

  const newUser = new User(userData);
  await newUser.save();

  const newCart = await cartRepository.createCartForUser(newUser._id);
  newUser.cart = newCart._id;
  await newUser.save();

  return newUser;
};

export const authenticateUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    throw new Error("Credenciales incorrectas");
  }
  return user;
};

export const generateJWT = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

export const assignCartToUser = async (user) => {
  if (!user.cart) {
    const newCart = await cartRepository.createCartForUser(user._id);
    user.cart = newCart._id;
    await user.save();
  }
  return user.cart;
};
