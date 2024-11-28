const productDAO = require("../daos/product.dao");

class ProductRepository {
  async getProducts(filter, options) {
    return await productDAO.getAllProducts(filter, options);
  }

  async getProductById(productId) {
    return await productDAO.findProductById(productId);
  }

  async addProduct(productData) {
    return await productDAO.createProduct(productData);
  }

  async removeProduct(productId) {
    return await productDAO.deleteProductById(productId);
  }

  async saveProduct(product) {
    return await productDAO.saveProduct(product);
  }
}

module.exports = new ProductRepository();
