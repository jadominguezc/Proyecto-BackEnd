const express = require("express");
const router = express.Router();
const {
  createOrGetCart,
  getCartById,
  updateCart,
  deleteProductFromCart,
  clearCart,
} = require("../../services/cartServices");

// Crear o recuperar un carrito
router.post("/", async (req, res) => {
  try {
    const cart = await createOrGetCart();
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error creando o recuperando el carrito" });
  }
});

// Añadir un producto al carrito
router.post("/:cid/products/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity || 1;

    const cart = await updateCart(cartId, [{ product: productId, quantity }]);
    res.status(200).json({ status: "success", message: "Producto añadido al carrito", cart });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error añadiendo producto al carrito" });
  }
});

// Eliminar un producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;

    const cart = await deleteProductFromCart(cartId, productId);
    res.status(200).json({ status: "success", message: "Producto eliminado del carrito", cart });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error eliminando producto del carrito" });
  }
});

// Actualizar todos los productos del carrito
router.put("/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const products = req.body.products;

    const updatedCart = await updateCart(cartId, products);
    res.status(200).json({ status: "success", message: "Carrito actualizado", cart: updatedCart });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error actualizando el carrito" });
  }
});

// Actualizar la cantidad de un producto en el carrito
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity;

    const updatedCart = await updateCart(cartId, [{ product: productId, quantity }]);
    res.status(200).json({ status: "success", message: "Cantidad de producto actualizada", cart: updatedCart });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error actualizando la cantidad del producto en el carrito" });
  }
});

// Eliminar todos los productos del carrito
router.delete("/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;

    const clearedCart = await clearCart(cartId);
    res.status(200).json({ status: "success", message: "Carrito vaciado", cart: clearedCart });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error vaciando el carrito" });
  }
});

// Obtener carrito por ID con populate
router.get("/:cid", async (req, res) => {
  try {
    const cart = await getCartById(req.params.cid);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error recuperando el carrito" });
  }
});

module.exports = router;
