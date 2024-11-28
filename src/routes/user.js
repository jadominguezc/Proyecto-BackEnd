const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");

// Ruta para mostrar la vista del usuario actual
router.get("/", authMiddleware, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }
  res.render("current", { user: req.user });
});


module.exports = router;
