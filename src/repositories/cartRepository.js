import cartDAO from "../daos/cart.dao.js";

class CartRepository {
  async getOrCreateCart(userId) {
    if (!userId) {
      throw new Error("User ID is required to get or create a cart");
    }
    let cart = await cartDAO.findCartByUserId(userId);
    if (!cart) {
      cart = await cartDAO.createCartForUser(userId);
    }
    return cart;
  }

  async getCartByUserId(userId) {
    return await cartDAO.findCartByUserId(userId);
  }

  async createCartForUser(userId) {
    return await cartDAO.createCartForUser(userId);
  }

  async saveCart(cart) {
    return await cartDAO.updateCart(cart);
  }

  async getCartById(cartId) {
    return await cartDAO.findCartById(cartId);
  }
}

export default new CartRepository();
