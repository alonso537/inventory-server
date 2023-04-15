const express = require("express");
const {
  crearVenta,
  getLastVentas,
  changeEstado,
  obtenerPorcentaje,
  getTotalVentasporMes,
  createExcelMensual,
  obtenerInvertido,
  addAbono,
  obtenerTotal,
  obtenerVentas,
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
router.get("/", isAutenticated, getLastVentas);
router.patch("/:id", isAutenticated, changeEstado);
router.get("/porcentaje", isAutenticated, obtenerPorcentaje);
router.get("/meses", isAutenticated, getTotalVentasporMes);
router.get("/excel", isAutenticated, createExcelMensual);
router.get("/invertido", isAutenticated, obtenerInvertido);
router.patch("/abono/:id", isAutenticated, addAbono);
router.get("/total", isAutenticated, obtenerTotal);
router.get("/all", isAutenticated, obtenerVentas);

module.exports = router;
