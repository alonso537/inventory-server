const express = require("express");
const {
  getAllProducts,
  createProduct,
  getProduct,
  uploadImage,
  updateProduct,
  deleteProduct,
} = require("../controller/productosController");
const { body, validationResult } = require("express-validator");

const router = express.Router();
const { isAutenticated, isDueno } = require("../middlewares/auth");

router.get("/", isAutenticated, getAllProducts);
router.post(
  "/",
  [
    body("titulo").isLength({ min: 3 }),
    body("descripcion").isLength({ min: 3 }),
    body("precioVenta").isNumeric(),
    body("precioCompra").isNumeric(),
    body("stock").isNumeric(),
    body("proveedor").isLength({ min: 3 }),
  ],

  isAutenticated,
  isDueno,
  createProduct,
);
router.get("/:id", isAutenticated, getProduct);
router.post("/upload/:id", isAutenticated, isDueno, uploadImage);
router.put(
  "/:id",

  isAutenticated,
  isDueno,
  updateProduct,
);
router.delete("/:id", isAutenticated, isDueno, deleteProduct);

module.exports = router;
