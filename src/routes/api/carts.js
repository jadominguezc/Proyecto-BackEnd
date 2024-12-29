import express from "express";
import * as cartService from "../../services/cartServices.js";
import { userOnly } from "../../middlewares/authMiddleware.js";
import * as cartController from "../../controllers/cartController.js";

const router = express.Router();

// Crear o recuperar un carrito
router.post("/", cartController.createOrGetCart);

// Añadir un producto al carrito, solo para usuarios
router.post("/:cid/products/:pid", userOnly, async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity || 1;

    await cartService.updateCart(cartId, [{ product: productId, quantity }]);
    res.redirect("/products");
  } catch (error) {
    res.status(500).send("Error añadiendo producto al carrito");
  }
});

// Eliminar un producto específico del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;

    const cart = await cartService.removeProductFromCart(cartId, productId);
    res.status(200).json({
      status: "success",
      message: "Producto eliminado del carrito",
      cart,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error eliminando producto del carrito",
    });
  }
});

// Actualizar todos los productos del carrito
router.put("/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const products = req.body.products;

    const updatedCart = await cartService.updateCart(cartId, products);
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error actualizando el carrito" });
  }
});

// Eliminar todos los productos del carrito (Vaciar Carrito)
router.delete("/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;

    const clearedCart = await cartService.clearCart(cartId);
    res.status(200).json({
      status: "success",
      message: "Carrito vaciado",
      cart: clearedCart,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error vaciando el carrito" });
  }
});

// Ruta de compra para finalizar el proceso del carrito
router.post("/:cid/purchase", userOnly, cartController.purchaseCart);

export default router;
