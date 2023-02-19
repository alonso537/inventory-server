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

const router = express.Router();

router.post("/", isAutenticated, isDueno, createTienda);
router.get("/", isAutenticated, isDueno, getMyTienda);
router.get("/all", isAutenticated, isAdmin, getAllTiendas);
router.post("/upload/:id", isAutenticated, isDueno, updateFoto);
router.put("/:id", isAutenticated, isDueno, updateTienda);
router.delete("/:id", isAutenticated, isDueno, deleteTienda);

module.exports = router;
