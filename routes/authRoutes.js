// routes/authRoutes.js
const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// ===== Signup =====
router.post(
  "/signup",
  [
    body("username")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters")
      .trim()
      .escape(),
    body("email")
      .isEmail()
      .withMessage("Enter a valid email address")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  authController.signup
);

// ===== Login =====
router.post(
  "/login",
  [
    body("loginInput")
      .notEmpty()
      .withMessage("Username or email is required")
      .trim()
      .escape(),
    body("password")
      .notEmpty()
      .withMessage("Password is required"),
  ],
  authController.login
);

// ===== Logout =====
router.post("/logout", authController.logout);

// ===== Get Current User =====
router.get("/me", authenticate, authController.getCurrentUser);

module.exports = router;
