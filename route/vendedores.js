const express = require("express");
const {
  createVendedor,
  getAllVendedores,
  uploadImage,
  updateUser,
  deleteVendedor,
} = require("../controller/VendedoresController");
const { isAutenticated, isAdmin, isDueno } = require("../middlewares/auth");
const { body, validationResult } = require("express-validator");

const router = express.Router();

router.post(
  "/",

  [
    body("nombre").isLength({ min: 3 }),
    body("apellido").isLength({ min: 3 }),
    body("username").isLength({ min: 3 }),
    body("email").isEmail(),
    body("telefono").isLength({ min: 3 }),
    body("password").isLength({ min: 6 }),
  ],
  isAutenticated,
  isDueno,
  createVendedor,
);
router.get("/", isAutenticated, isDueno, getAllVendedores);
router.post("/upload/:id", isAutenticated, uploadImage);
router.put("/:id", isAutenticated, updateUser);
router.delete("/:id", isAutenticated, isDueno, deleteVendedor);

module.exports = router;
