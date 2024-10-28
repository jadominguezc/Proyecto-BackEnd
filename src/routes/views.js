const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const cartService = require("../services/cartServices"); // Importa cartService
const { authMiddleware } = require('../middlewares/authMiddleware');
const Ticket = require('../models/Ticket');

// Ruta para la vista principal que redirige a /products
router.get("/", (req, res) => {
    res.redirect("/products");
});

// Vista principal de productos con paginación
router.get("/products", async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, category, query } = req.query;
        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            sort: sort ? { price: sort === "asc" ? 1 : -1 } : {},
        };

        const filter = {};
        
        // Filtro por categoría
        if (category && category !== "") {
            filter.category = new RegExp(category, "i");
        }

        // Filtro por query
        if (query && query !== "") {
            filter.$or = [
                { title: new RegExp(query, "i") },
                { description: new RegExp(query, "i") },
            ];
        }

        const products = await Product.paginate(filter, options);

        // Obtener o crear el carrito para el usuario logueado
        const cart = await cartService.createOrGetCart(req.user);
        
        res.render("index", {
            products: products.docs,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: products.hasPrevPage
                ? `/products?limit=${limit}&page=${products.prevPage}&sort=${sort}&category=${category}&query=${query}`
                : null,
            nextLink: products.hasNextPage
                ? `/products?limit=${limit}&page=${products.nextPage}&sort=${sort}&category=${category}&query=${query}`
                : null,
            selectedLimit: limit,
            selectedSort: sort,
            selectedCategory: category,
            searchText: query,
            cartId: cart._id // Ojo: Pasa el cartId al contexto
        });
    } catch (error) {
        res.status(500).send("Error retrieving products.");
    }
});

// Ruta para ver el detalle de un producto específico
router.get('/products/:pid', authMiddleware, async (req, res) => {
    try {
        const productId = req.params.pid;
        const product = await Product.findById(productId);
        
        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }

        // Obtener el carrito actual o crear uno nuevo
        const cart = await cartService.createOrGetCart(req.user);

        // Renderiza la vista del producto
        res.render("productDetail", { product, cartId: cart._id });
    } catch (error) {
        console.error("Error retrieving product details:", error);
        res.status(500).send("Error retrieving product details.");
    }
});

// Redirecciona al carrito específico del usuario actual
router.get("/carts", authMiddleware, async (req, res) => {
    try {
        const cart = await cartService.createOrGetCart(req.user);
        if (cart) {
            res.redirect(`/carts/${cart._id}`);
        } else {
            res.render('cart', { products: [], cartId: null });
        }
    } catch (error) {
        res.status(500).send("Error retrieving cart.");
    }
});

// Vista para ver un carrito específico por ID
router.get("/carts/:cid", authMiddleware, async (req, res) => {
    try {
        const cart = await cartService.getCartById(req.params.cid);
        if (!cart) {
            return res.status(404).send("Carrito no encontrado");
        }

        // Cambiar a renderizar la vista directamente
        res.render("cart", { 
            products: cart.products || [],
            cartId: cart._id,
            totalQuantity: cart.products.length,
            totalPrice: cart.products.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
        });
    } catch (error) {
        console.error("Error retrieving cart:", error);
        res.status(500).send("Error retrieving cart.");
    }
});

// Vista de administración de productos
router.get("/admin/products", authMiddleware, async (req, res) => {
    try {
        const products = await Product.find();
        res.render("admin", { products });
    } catch (error) {
        res.status(500).send("Error retrieving products.");
    }
});

// Vista para el login
router.get('/api/sessions/login', (req, res) => {
    res.render('login'); 
});

// Ruta para mostrar la vista de registro
router.get('/register', (req, res) => {
    res.render('register');  
});

// Vista del perfil de usuario
router.get('/user', authMiddleware, (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    res.render('current', { user: req.user });
});

router.get('/purchase/:ticketId', async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.ticketId);
        if (!ticket) {
            return res.status(404).send('Ticket no encontrado');
        }
        res.render('purchase', { ticket });
    } catch (error) {
        res.status(500).send('Error al obtener el ticket');
    }
});

module.exports = router;
