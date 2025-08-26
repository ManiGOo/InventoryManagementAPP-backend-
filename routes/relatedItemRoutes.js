const express = require('express');
const relatedItemController = require('../controllers/relatedItemController');
const router = express.Router();

// Auth middleware
const isAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Unauthorized' });
};

router.post('/', isAuth, relatedItemController.createRelatedItem);
router.get('/:id/related', isAuth, relatedItemController.getRelatedItems);

module.exports = router;