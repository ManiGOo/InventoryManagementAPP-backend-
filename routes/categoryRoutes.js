const express = require('express');
const categoryController = require('../controllers/categoryController');
const router = express.Router();

// Get all categories (default + user-added)
router.get('/', categoryController.getAllCategories);

// Create new category
router.post('/', categoryController.createCategory);

// Delete user-added category
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
