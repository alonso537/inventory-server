const express = require("express");
const { seedProveedores, seedProductos } = require("../controller/Seed");
const { isAutenticated } = require("../middlewares/auth");

const router = express.Router();

router.post("/proveedores", isAutenticated, seedProveedores);
router.post("/productos", isAutenticated, seedProductos);

module.exports = router;
