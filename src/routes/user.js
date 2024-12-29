import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }
  res.render("current", { user: req.user });
});

export default router;
