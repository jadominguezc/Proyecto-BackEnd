const express = require("express");
const router = express.Router();
const cartService = require("../../services/cartServices");
const { userOnly } = require("../../middlewares/authMiddleware");
const cartController = require("../../controllers/cartController");

const {
  createOrGetCart,
  getCartById,
  updateCart,
  removeProductFromCart,
  clearCart,
} = cartService;

// Crear o recuperar un carrito
router.post("/", async (req, res) => {
  try {
    const cart = await createOrGetCart(req.user);
    res.status(201).json(cart);
  } catch (error) {
    res
      .status(500)
      .json({
        status: "error",
        message: "Error creando o recuperando el carrito",
      });
  }
});

// Añadir un producto al carrito, solo para usuarios - role userOnly
router.post("/:cid/products/:pid", userOnly, async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity || 1;

    await cartService.updateCart(cartId, [{ product: productId, quantity }]);

    res.redirect("/products");
  } catch (error) {
    console.error("Error añadiendo producto al carrito:", error);
    res.status(500).send("Error añadiendo producto al carrito");
  }
});

// Eliminar un producto específico del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;

    const cart = await removeProductFromCart(cartId, productId);
    res
      .status(200)
      .json({
        status: "success",
        message: "Producto eliminado del carrito",
        cart,
      });
  } catch (error) {
    console.error("Error eliminando producto del carrito:", error);
    res
      .status(500)
      .json({
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

    const updatedCart = await updateCart(cartId, products);
    res.status(200).json(cart);
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Error actualizando el carrito" });
  }
});

// Actualizar la cantidad de un producto en el carrito
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity;

    const updatedCart = await updateCart(cartId, [
      { product: productId, quantity },
    ]);
    res.status(200).json(cart);
  } catch (error) {
    res
      .status(500)
      .json({
        status: "error",
        message: "Error actualizando la cantidad del producto en el carrito",
      });
  }
});

// Eliminar todos los productos del carrito (Vaciar Carrito)
router.delete("/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;

    const clearedCart = await clearCart(cartId);
    res
      .status(200)
      .json({
        status: "success",
        message: "Carrito vaciado",
        cart: clearedCart,
      });
  } catch (error) {
    console.error("Error vaciando el carrito:", error);
    res
      .status(500)
      .json({ status: "error", message: "Error vaciando el carrito" });
  }
});

// Obtener carrito por ID con populate
router.get("/:cid", async (req, res) => {
  try {
    const cart = await getCartById(req.params.cid);
    res.status(200).json(cart);
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Error recuperando el carrito" });
  }
});

// Ruta de compra para finalizar el proceso del carrito
router.post("/:cid/purchase", userOnly, async (req, res) => {
  try {
    const result = await cartController.purchaseCart(req, res);

    if (result.success && result.ticketId) {
      res.json({
        status: "success",
        ticketId: result.ticketId,
        missingProducts: result.missingProducts || [],
      });
    } else if (result.missingProducts && result.missingProducts.length > 0) {
      res.json({
        status: "error",
        message: "Algunos productos no tienen stock suficiente",
        missingProducts: result.missingProducts,
      });
    } else {
      res.status(500).json({
        status: "error",
        message: "Error durante el proceso de compra",
      });
    }
  } catch (error) {
    console.error("Error during purchase process:", error);
    res
      .status(500)
      .json({ status: "error", message: "Error interno del servidor" });
  }
});

module.exports = router;
