const express = require("express");
const { body, validationResult } = require("express-validator");

const router = express.Router();

const { login, getMe, register } = require("../controller/authController");
const { isAutenticated } = require("../middlewares/auth");

router.post(
  "/login",
  [body("email").isEmail(), body("password").isLength({ min: 6 })],

  login,
);
router.post(
  "/register",
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  body("nombre").isLength({ min: 3 }),
  body("apellido").isLength({ min: 3 }),
  body("username").isLength({ min: 3 }),

  register,
);
router.get("/me", isAutenticated, getMe);

module.exports = router;
