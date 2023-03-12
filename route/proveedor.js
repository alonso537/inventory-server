const express = require("express");
const {
  createProveedor,
  getAllProveedores,
  deleteProveedor,
  updateProveedor,
} = require("../controller/proveedoresController");
const { isAutenticated, isDueno } = require("../middlewares/auth");
const { body, validationResult } = require("express-validator");

const router = express.Router();

router.post(
  "/",
  [
    body("nombre").isLength({ min: 3 }),
    body("direccion").isLength({ min: 3 }),
    body("telefono").isLength({ min: 3 }),
    body("email").isEmail(),
    body("url").isLength({ min: 3 }),
  ],
  isAutenticated,
  isDueno,
  createProveedor,
);
router.get("/", isAutenticated, isDueno, getAllProveedores);
router.delete("/:id", isAutenticated, isDueno, deleteProveedor);
router.put(
  "/:id",

  isAutenticated,
  isDueno,
  updateProveedor,
);

module.exports = router;
