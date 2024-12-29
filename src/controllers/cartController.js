import * as cartService from "../services/cartServices.js";

export async function createOrGetCart(req, res) {
  try {
    const cart = await cartService.createOrGetCart(req.user);
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
}

export async function purchaseCart(req, res) {
  try {
    const cartId = req.params.cid;
    const userEmail = req.user.email;
    const result = await cartService.purchaseCart(cartId, userEmail);
    return (
      result || {
        success: false,
        missingProducts: [],
        error: "Purchase failed",
      }
    );
  } catch (error) {
    console.error("Error during purchase process:", error);
    return { success: false, error: error.message, missingProducts: [] };
  }
}
