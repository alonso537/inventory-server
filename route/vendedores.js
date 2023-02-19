const express = require("express");
const {
  createVendedor,
  getAllVendedores,
  uploadImage,
  updateUser,
  deleteVendedor,
} = require("../controller/VendedoresController");
const { isAutenticated, isAdmin, isDueno } = require("../middlewares/auth");

const router = express.Router();

router.post("/", isAutenticated, isDueno, createVendedor);
router.get("/", isAutenticated, isDueno, getAllVendedores);
router.post("/upload/:id", isAutenticated, isDueno, uploadImage);
router.put("/:id", isAutenticated, isDueno, updateUser);
router.delete("/:id", isAutenticated, isDueno, deleteVendedor);

module.exports = router;
