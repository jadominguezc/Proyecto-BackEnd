const Cart = require("../models/Cart");

// Crear o recuperar un carrito
const createOrGetCart = async () => {
  let cart = await Cart.findOne();
  if (!cart) {
    cart = new Cart({ products: [] });
    await cart.save();
  }
  return cart;
};

// Obtener un carrito por ID
const getCartById = async (cartId) => {
  return await Cart.findById(cartId).populate("products.product");
};

// Actualizar productos en el carrito
const updateCart = async (cartId, products) => {
  const cart = await Cart.findById(cartId);
  products.forEach((item) => {
    const productIndex = cart.products.findIndex(p => p.product.toString() === item.product);
    if (productIndex > -1) {
      
      cart.products[productIndex].quantity += item.quantity;
    } else {

      cart.products.push(item);
    }
  });
  return await cart.save();
};

module.exports = {
  createOrGetCart,
  getCartById,
  updateCart,
};
