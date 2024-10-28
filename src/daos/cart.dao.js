const Cart = require('../models/Cart');

class CartDAO {
    async createCartForUser(userId) {

        const cart = new Cart({ userId: userId, products: [] });
        return await cart.save();
    }

    async findCartByUserId(userId) {
        return await Cart.findOne({ userId }).populate('products.product');
    }

    async findCartById(cartId) {
        return await Cart.findById(cartId).populate('products.product');
    }

    async updateCart(cart) {
        return await cart.save();
    }
}

module.exports = new CartDAO();
