import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import methodOverride from "method-override";
import path from "path";
import { engine } from "express-handlebars";
import jwt from "jsonwebtoken";
import http from "http";
import { Server as socketIo } from "socket.io";
import { fileURLToPath } from "url";

// Cargar variables de entorno dinámicamente
if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: ".env.test" });
  console.log("Cargando variables de entorno desde .env.test...");
} else {
  dotenv.config({ path: ".env" });
  console.log("Cargando variables de entorno desde .env...");
}

// Importación de rutas
import productsRouter from "./routes/api/products.js";
import cartsRouter from "./routes/api/carts.js";
import sessionsRouter from "./routes/sessions.js";
import viewsRouter from "./routes/views.js";
import userRouter from "./routes/user.js";
import mockingRoutes from "./routes/api/mocks.router.js";
import swaggerDocs from "./config/swaggerConfig.js";

// Configuración de __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Creación de la app
const app = express();

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log(`Conectado a MongoDB en el entorno ${process.env.NODE_ENV || "producción"}`))
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware para decodificar el token y manejar expiración
app.use(async (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { default: User } = await import("./models/User.js");
      const user = await User.findById(decoded.id);

      if (user) {
        req.user = user;
        res.locals.user = user;
        res.locals.role = user.role;

        // Renovar token si está cerca de expirar
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp - now < 300) {
          const newToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );
          res.cookie("token", newToken, { httpOnly: true });
        }
      }
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        console.error("Token expirado");
        res.clearCookie("token");
        return res.status(401).json({ error: "Sesión expirada, por favor inicia sesión nuevamente." });
      } else {
        console.error("Error decoding token:", error);
        res.clearCookie("token");
      }
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

// Rutas
app.use("/admin/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/user", userRouter);
app.use("/", viewsRouter);
app.use("/api/mocks", mockingRoutes);

// Swagger documentation
swaggerDocs(app);

// Configuración de WebSocket (solo en producción o desarrollo)
if (process.env.NODE_ENV !== "test") {
  const server = http.createServer(app);
  const io = new socketIo(server);

  io.on("connection", async (socket) => {
    console.log("A user connected to admin/products");

    const emitProducts = async () => {
      try {
        const products = await productRepository.getProducts({}, {});
        console.log("Productos enviados al cliente:", products); 
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
        const { default: productRepository } = await import(
          "./repositories/productRepository.js"
        );
        await productRepository.addProduct(productData);
        await emitProducts();
      } catch (error) {
        console.error("Error adding product:", error);
      }
    });

    socket.on("deleteProduct", async (productId) => {
      try {
        const { default: productRepository } = await import(
          "./repositories/productRepository.js"
        );
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

  const PORT = process.env.PORT || 8080;
  server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(
      `Swagger documentation available at http://localhost:${PORT}/api-docs`
    );
  });
}

export default app;
