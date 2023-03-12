const express = require("express");
const {
  createTienda,
  getMyTienda,
  getAllTiendas,
  updateFoto,
  deleteTienda,
  updateTienda,
} = require("../controller/tiendaController");
const { isAutenticated, isAdmin, isDueno } = require("../middlewares/auth");
const { body, validationResult } = require("express-validator");

const router = express.Router();

router.post(
  "/",
  [
    body("nombre").isLength({ min: 3 }),
    body("descripcion").isLength({ min: 3 }),
    body("direccion").isLength({ min: 3 }),
    body("telefono").isLength({ min: 3 }),
    body("categoria").isLength({ min: 3 }),
  ],

  isAutenticated,
  isDueno,
  createTienda,
);
router.get("/", isAutenticated, getMyTienda);
router.get("/all", isAutenticated, isAdmin, getAllTiendas);
router.post("/upload/:id", isAutenticated, isDueno, updateFoto);
router.put("/:id", isAutenticated, isDueno, updateTienda);
router.delete("/:id", isAutenticated, isDueno, deleteTienda);

module.exports = router;
