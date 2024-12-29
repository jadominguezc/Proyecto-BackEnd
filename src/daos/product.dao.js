import Product from "../models/Product.js";

class ProductDAO {
  async getAllProducts(filter, options) {
    return await Product.paginate(filter, {
      ...options,
      select: "title description price stock",
    });
  }

  async findProductById(productId) {
    return await Product.findById(productId).select(
      "title description price stock"
    );
  }

  async createProduct(productData) {
    const product = new Product(productData);
    return await product.save();
  }

  async deleteProductById(productId) {
    return await Product.findByIdAndDelete(productId);
  }

  async updateProduct(product) {
    return await product.save();
  }

  async saveProduct(product) {
    return await product.save();
  }
}

export default new ProductDAO();
