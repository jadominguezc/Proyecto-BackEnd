const productService = require('../services/productServices');

// Obtener productos con filtros, paginación y ordenamiento
const getProducts = async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        const products = await productService.getProducts({ limit, page, sort, query });

        res.json({
            status: 'success',
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
        console.error('Error retrieving products:', error);
        res.status(500).json({ status: 'error', message: 'Error retrieving products' });
    }
};

// Crear un nuevo producto
const createProduct = async (req, res) => {
    const { code, title, description, price, stock, category } = req.body;

    try {
        if (!code || !title || !price || !stock || !category) {
            return res.status(400).json({
                message_error: 'Falta algún campo por completar',
                success: false,
            });
        }

        const image = req.file ? `../uploads/${req.file.filename}` : null;
        const productData = { code, title, description, price, stock, category, image };

        await productService.createProduct(productData);
        res.status(201).json({ status: 'success', message: 'Product created successfully' });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message_error: error.message, success: false });
    }
};

// Eliminar un producto por ID
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        await productService.deleteProduct(productId);
        res.status(200).json({ status: 'success', message: 'Product deleted' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ status: 'error', message: 'Error deleting product' });
    }
};

module.exports = {
    getProducts,
    createProduct,
    deleteProduct,
};
