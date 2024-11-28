const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware genérico de autenticación
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Acceso no autorizado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user) {
      req.user = user;
      next();
    } else {
      res.status(401).json({ error: "Usuario no encontrado" });
    }
  } catch (error) {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};

// Middleware para proteger rutas de administrador
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Acceso denegado" });
  }
};

// Middleware para proteger rutas de usuario
const userOnly = (req, res, next) => {
  if (req.user && req.user.role === "user") {
    next();
  } else {
    res.status(403).json({ error: "Acceso denegado" });
  }
};

module.exports = { authMiddleware, adminOnly, userOnly };
