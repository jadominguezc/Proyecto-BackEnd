const express = require("express");
const router = express.Router();
const upload = require("../../middlewares/multerConfig");
const {
  getProducts,
  createProduct,
  deleteProduct,
} = require("../../services/productServices");

// Obtener productos con filtros, paginación y ordenamiento
router.get("/products", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    const products = await getProducts({ limit, page, sort, query });
    res.json({
      status: "success",
      payload: products.docs,
      totalPages: products.totalPages,
      prevPage: products.prevPage,
      nextPage: products.nextPage,
      page: products.page,
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      prevLink: products.hasPrevPage
        ? `/api/products?limit=${limit}&page=${products.prevPage}&sort=${sort}&query=${query}`
        : null,
      nextLink: products.hasNextPage
        ? `/api/products?limit=${limit}&page=${products.nextPage}&sort=${sort}&query=${query}`
        : null,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Error retrieving products" });
  }
});



// Crear un nuevo producto, con soporte para imágenes
router.post("/", upload.single("productImage"), async (req, res) => {
    const { code, title, description, price, stock, category } = req.body;
  
    try {
      if (!code || !title || !price || !stock || !category) {
        return res.status(404).json({
          message_error: "Falta algún campo por completar",
          success: false,
        });
      }
  
      const image = `../uploads/${req.file.filename}`; 
      const productData = { code, title, description, price, stock, category, image };
  
      await createProduct(productData);
      res.redirect("/products");
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message_error: error.message, success: false });
    }
  });

// Eliminar un producto
router.delete("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    await deleteProduct(productId);
    res.status(200).json({ status: "success", message: "Product deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Error deleting product" });
  }
});



module.exports = router;
