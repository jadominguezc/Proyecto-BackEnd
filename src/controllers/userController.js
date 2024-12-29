import * as userService from "../services/userServices.js";
import UserDTO from "../dtos/user.dto.js";
import * as cartService from "../services/cartServices.js";

// Registro de usuario
export const registerUser = async (req, res) => {
  try {
    const newUser = await userService.createUser(req.body);
    const cart = await cartService.createOrGetCart(newUser);
    newUser.cart = cart._id;
    await newUser.save();

    const token = userService.generateJWT(newUser);
    res.cookie("token", token, { httpOnly: true });

    res.redirect("/user");
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(400).json({ error: error.message });
  }
};

// Login de usuario
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userService.authenticateUser(email, password);
    const token = userService.generateJWT(user);

    res.cookie("token", token, { httpOnly: true });
    res.redirect("/user");
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(401).json({ error: "Credenciales incorrectas" });
  }
};

// Obtener el usuario actual
export const getCurrentUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  res.render("current", {
    user: new UserDTO(req.user),
  });

  const userDTO = new UserDTO(req.user);
  res.status(200).json({ user: userDTO });
};
