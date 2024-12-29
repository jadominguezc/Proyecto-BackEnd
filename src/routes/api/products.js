import express from "express";
import upload from "../../middlewares/multerConfig.js";
import { adminOnly } from "../../middlewares/authMiddleware.js";
import {
  getProducts,
  createProduct,
  deleteProduct,
} from "../../services/productServices.js";

const router = express.Router();

// Obtener productos con filtros, paginación y ordenamiento
router.get("/", async (req, res) => {
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
    res.status(500).json({ status: "error", message: "Error retrieving products" });
  }
});

// Crear un nuevo producto
router.post("/", adminOnly, upload.single("productImage"), async (req, res) => {
  try {
    const { code, title, description, price, stock, category } = req.body;
    if (!code || !title || !price || !stock || !category) {
      return res.status(400).json({
        message_error: "Falta algún campo por completar",
        success: false,
      });
    }

    const image = req.file ? `../uploads/${req.file.filename}` : null;

    await createProduct({
      code,
      title,
      description,
      price,
      stock,
      category,
      image,
    });

    res.status(201).json({ status: "success", message: "Product created successfully" });
  } catch (error) {
    res.status(500).json({ message_error: error.message, success: false });
  }
});

// Eliminar un producto
router.delete("/:id", adminOnly, async (req, res) => {
  try {
    const productId = req.params.id;
    await deleteProduct(productId);
    res.status(200).json({ status: "success", message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error deleting product" });
  }
});

export default router;
