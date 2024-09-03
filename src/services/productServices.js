const Product = require("../models/Product");

// Obtener productos con filtros, paginación y ordenamiento
const getProducts = async ({ limit = 10, page = 1, sort, query }) => {
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  if (sort) {
    options.sort = { price: sort === "asc" ? 1 : -1 };
  }

  const filter = {};
  if (query) {
    filter.$or = [{ category: new RegExp(query, "i") }, { stock: { $gt: 0 } }];
  }

  const result = await Product.paginate(filter, options);
  return result;
};

// Crear un nuevo producto
const createProduct = async ({ code, title, description, price, stock, category, image }) => {
    if (!code || !title || !price || !stock || !category) {
      throw new Error("Faltan campos obligatorios por completar");
    }
  
    const newProduct = new Product({
      code,
      title,
      description,
      price,
      stock,
      category,
      image
    });
  
    return await newProduct.save();
  };

// Eliminar un producto por ID con manejo de errores
const deleteProduct = async (productId) => {
    try {
      const result = await Product.findByIdAndDelete(productId);
      if (!result) {
        throw new Error("Producto no encontrado");
      }
      return result;
    } catch (error) {
      throw new Error("Error al eliminar el producto: " + error.message);
    }
  };

module.exports = {
  getProducts,
  createProduct,
  deleteProduct,
};
