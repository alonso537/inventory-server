const express = require("express");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const conectarDb = require("./config/db");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "has superado el limite de peticiones",
});

dotenv.config();

const app = express();

conectarDb();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(limiter);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  }),
);

//rutas
app.use("/api/vendedores", require("./route/vendedores"));
app.use("/api/auth", require("./route/auth"));
app.use("/api/tienda", require("./route/tiendaRouter"));
app.use("/api/proveedores", require("./route/proveedor"));
app.use("/api/productos", require("./route/productoRoute"));
app.use("/api/ventas", require("./route/ventaRoute"));
app.use("/api/seed", require("./route/seed"));

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
