const express = require("express");
const categoryController = require("../controllers/categoryController");
const { authenticate } = require("../middleware/auth"); // JWT middleware
const router = express.Router();

// ===== Routes =====

// Get all categories
// Public access: returns only default categories if not logged in
router.get("/", authenticateOptional, categoryController.getAllCategories);

// Create new category
// Private: only logged-in users
router.post("/", authenticate, categoryController.createCategory);

// Delete user-added category
// Private: only owner can delete
router.delete("/:id", authenticate, categoryController.deleteCategory);

module.exports = router;

/**
 * Middleware: authenticateOptional
 * If JWT cookie exists, set req.user; otherwise allow anonymous access
 */
function authenticateOptional(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return next(); // proceed without setting req.user

  const jwt = require("jsonwebtoken");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id }; // minimal info, full user fetched later
  } catch (err) {
    // Invalid token: ignore and allow anonymous
  }
  next();
}
