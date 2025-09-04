const express = require('express');
const { createRelatedItem, getRelatedItems } = require('../controllers/relatedItemController');
const { authenticate } = require('../middleware/auth'); // ✅ correct import
const router = express.Router();

// Protect routes with JWT
router.post('/', authenticate, createRelatedItem);
router.get('/:id/related', authenticate, getRelatedItems);

module.exports = router;
