const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { createOrGetCart } = require("../services/cartServices");

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

        });
    } catch (error) {
        res.status(500).send("Error retrieving products.");
    }
});

router.get("/products/:pid", async (req, res) => {
    try {
        const productId = req.params.pid;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).send("Producto no encontrado");
        }

        // Obtener el carrito actual o crear uno nuevo
        const cart = await createOrGetCart();

        // Renderiza la vista del producto
        res.render("productDetail", {
            product: product,
            cartId: cart._id,
        });
    } catch (error) {
        res.status(500).send("Error retrieving product details.");
    }
});


// Vista de un carrito específico
router.get("/carts/:cid", async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid).populate("products.product");
        if (!cart) {
            return res.render("cart", { products: [], cartId: req.params.cid });
        }
        res.render("cart", { products: cart.products, cartId: cart._id });
    } catch (error) {
        res.status(500).send("Error retrieving cart.");
    }
});

router.get("/carts", async (req, res) => {
  try {
    const cart = await createOrGetCart();
    res.redirect(`/carts/${cart._id}`);
  } catch (error) {
    res.status(500).send("Error retrieving cart.");
  }
});

// Vista de administración de productos
router.get("/admin/products", async (req, res) => {
    try {
        const products = await Product.find();
        res.render("admin", { products });
    } catch (error) {
        res.status(500).send("Error retrieving products.");
    }
});

//Vista para el login
router.get('/api/sessions/login', (req, res) => {
    res.render('login'); 
});

// Ruta para mostrar la vista de registro
router.get('/register', (req, res) => {
    res.render('register');  
});

router.get('/current', (req, res) => {
    res.render('current');  
});

module.exports = router;
