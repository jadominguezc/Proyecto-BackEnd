const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multerConfig');
const { getProducts, createProduct, deleteProduct } = require('../controllers/productController');

// Obtener productos con filtros, paginación y ordenamiento
router.get('/', getProducts);

// Crear un nuevo producto con soporte para imágenes
router.post('/', upload.single('productImage'), createProduct);

// Eliminar un producto por ID
router.delete('/:id', deleteProduct);

module.exports = router;
