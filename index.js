const express = require("express");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const conectarDb = require("./config/db");
const cors = require("cors");

dotenv.config();

const app = express();

conectarDb();

app.use(express.json());
app.use(cors());

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

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
