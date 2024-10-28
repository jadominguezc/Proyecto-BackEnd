const cartService = require('../services/cartServices');

const createOrGetCart = async (req, res) => {
    try {
        const cart = await cartService.createOrGetCart(req.user);
        res.status(201).json(cart);
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// Implementación de la compra
    const purchaseCart = async (req, res) => {
        try {
            const cartId = req.params.cid;
            const userEmail = req.user.email;
            const result = await cartService.purchaseCart(cartId, userEmail);
            return result || { success: false, missingProducts: [], error: "Purchase failed" };
        } catch (error) {
            console.error("Error during purchase process:", error);
            return { success: false, error: error.message, missingProducts: [] };
        }
    };

module.exports = { createOrGetCart, purchaseCart };