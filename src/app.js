require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const path = require("path");
const { engine } = require("express-handlebars");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const productRepository = require("./repositories/productRepository");

const {
  authMiddleware,
  adminOnly,
  userOnly,
} = require("./middlewares/authMiddleware");
const productsRouter = require("./routes/api/products");
const cartsRouter = require("./routes/api/carts");
const sessionsRouter = require("./routes/sessions");
const viewsRouter = require("./routes/views");
const userRouter = require("./routes/user");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error al conectar a MongoDB", err));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware para decodificar el token y obtener el usuario
app.use(async (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
        res.locals.user = user;
        res.locals.role = user.role;
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      res.clearCookie("token");
    }
  }
  next();
});

// Configuración de Handlebars
app.engine(
  "handlebars",
  engine({
    defaultLayout: "main",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
    helpers: {
      multiply: (a, b) => a * b,
      calculateTotal: (products) =>
        products.reduce(
          (total, item) => total + item.quantity * item.product.price,
          0
        ),
      eq: (a, b) => a === b,
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Rutas protegidas según el rol
app.use("/admin/products", authMiddleware, adminOnly, productsRouter);
app.use("/api/carts", authMiddleware, userOnly, cartsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/user", authMiddleware, userRouter);
app.use("/", viewsRouter);

// WebSocket
io.on("connection", async (socket) => {
  console.log("A user connected to admin/products");

  const emitProducts = async () => {
    try {
      const products = await productRepository.getProducts({}, {});
      if (products && products.docs) {
        socket.emit("updateProducts", products.docs);
      }
    } catch (error) {
      console.error("Error retrieving products for WebSocket:", error);
    }
  };

  await emitProducts();

  socket.on("addProduct", async (productData) => {
    try {
      await productRepository.addProduct(productData);
      await emitProducts();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  });

  socket.on("deleteProduct", async (productId) => {
    try {
      await productRepository.removeProduct(productId);
      await emitProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
server.listen(process.env.PORT || 8080, () => {
  console.log(
    `Server listening on http://localhost:${process.env.PORT || 8080}`
  );
});
