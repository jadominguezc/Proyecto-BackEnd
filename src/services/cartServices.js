const cartRepository = require("../repositories/cartRepository");
const productRepository = require("../repositories/productRepository");
const ticketService = require("./ticketServices");
const Cart = require("../models/Cart");

const createOrGetCart = async (user) => {
  if (!user || !user._id) {
    throw new Error("User not provided or user ID is missing.");
  }

  if (user.cart) {
    return await cartRepository.getCartById(user.cart);
  }

  const newCart = await cartRepository.createCartForUser(user._id);
  user.cart = newCart._id;
  await user.save();

  return newCart;
};

async function getCartById(cartId) {
  try {
    const cart = await Cart.findById(cartId).populate("products.product");
    return cart;
  } catch (error) {
    console.error("Error en getCartById:", error);
    throw error;
  }
}

const updateCart = async (cartId, productsToUpdate) => {
  const cart = await cartRepository.getCartById(cartId);

  if (!cart) {
    throw new Error("Carrito no encontrado");
  }

  for (const { product, quantity } of productsToUpdate) {
    const existingProduct = cart.products.find(
      (item) => item.product.toString() === product
    );

    if (existingProduct) {
      existingProduct.quantity = quantity;
    } else {
      cart.products.push({ product, quantity });
    }
  }

  await cartRepository.saveCart(cart);
  return cart;
};

const removeProductFromCart = async (cartId, productId) => {
  const cart = await cartRepository.getCartById(cartId);
  if (!cart) throw new Error("Carrito no encontrado");
  cart.products = cart.products.filter(
    (item) => item.product.toString() !== productId
  );
  await cartRepository.saveCart(cart);
  return cart;
};

const clearCart = async (cartId) => {
  const cart = await cartRepository.getCartById(cartId);
  if (!cart) throw new Error("Carrito no encontrado");
  cart.products = [];
  await cartRepository.saveCart(cart);
  return cart;
};

const purchaseCart = async (cartId, userEmail) => {
  const cart = await cartRepository.getCartById(cartId);
  if (!cart) throw new Error("Carrito no encontrado");

  const missingProducts = [];
  let totalAmount = 0;

  for (const item of cart.products) {
    const product = await productRepository.getProductById(item.product._id);
    if (product.stock >= item.quantity) {
      product.stock -= item.quantity;
      totalAmount += product.price * item.quantity;
      await productRepository.saveProduct(product);
    } else {
      missingProducts.push(product._id);
    }
  }

  if (totalAmount > 0) {
    const ticket = await ticketService.createTicket(userEmail, totalAmount); // Verificación adicional para asegurar que el ticket fue creado correctamente

    if (ticket && ticket._id) {
      cart.products = missingProducts.length
        ? cart.products.filter((item) =>
            missingProducts.includes(item.product._id)
          )
        : [];
      await cartRepository.saveCart(cart);
      return { success: true, ticketId: ticket._id, missingProducts };
    } else {
      throw new Error("Error al generar el ticket");
    }
  }

  return { success: false, missingProducts };
};

module.exports = {
  createOrGetCart,
  updateCart,
  purchaseCart,
  clearCart,
  removeProductFromCart,
  getCartById,
};
