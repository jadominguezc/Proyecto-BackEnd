require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const { engine } = require("express-handlebars");
const path = require("path");
const productsRouter = require("./routes/api/products");
const viewsRouter = require("./routes/views");
const cartsRouter = require("./routes/api/carts");
const http = require("http");
const socketIo = require("socket.io");
const Product = require("./models/Product");
const app = express();
const methodOverride = require("method-override");

const server = http.createServer(app);
const io = socketIo(server);

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("Error: MONGODB_URI no está definida en .env");
  process.exit(1);
}

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Conectado a MongoDB Atlas"))
  .catch((err) => console.error("Error al conectar a MongoDB Atlas:", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("./uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.static(path.join(__dirname, "../public")));

app.engine(
  "handlebars",
  engine({
    defaultLayout: "main",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(methodOverride("_method"));

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

io.on("connection", async (socket) => {
  console.log("A user connected");

  try {
    const products = await Product.find();
    socket.emit('updateProducts', products);
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }

  socket.on("addProduct", async (productData) => {
    try {
      const product = new Product(productData);
      await product.save();
      const updatedProducts = await Product.find();
      io.emit("updateProducts", updatedProducts);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  });

  socket.on("deleteProduct", async (productId) => {
    try {
      await Product.findByIdAndDelete(productId);
      const updatedProducts = await Product.find();
      io.emit("updateProducts", updatedProducts);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(8080, () => {
  console.log("Server listening on http://localhost:8080");
});
