const express = require("express");
const {
  crearVenta,
  getAllVentas,
  changeEstado,
  obtenerPorcentaje,
  getTotalVentasporMes,
  createExcelMensual,
} = require("../controller/ventaController");
const { isAutenticated } = require("../middlewares/auth");
const { body, validationResult } = require("express-validator");

const router = express.Router();

router.post(
  "/",
  [
    body("cliente").isLength({ min: 3 }),
    body("productos").isLength({ min: 3 }),
    body("tienda").isLength({ min: 3 }),
  ],
  isAutenticated,
  crearVenta,
);
router.get("/", isAutenticated, getAllVentas);
router.patch("/:id", isAutenticated, changeEstado);
router.get("/porcentaje", isAutenticated, obtenerPorcentaje);
router.get("/meses", isAutenticated, getTotalVentasporMes);
router.get("/excel", isAutenticated, createExcelMensual);

module.exports = router;
