const express = require("express");

const router = express.Router();

const { login, getMe, register } = require("../controller/authController");
const { isAutenticated } = require("../middlewares/auth");

router.post("/login", login);
router.post("/register", register);
router.get("/me", isAutenticated, getMe);

module.exports = router;
