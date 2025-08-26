const express = require('express');
const multer = require('multer');
const itemController = require('../controllers/itemController');
const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + require('path').extname(file.originalname))
});
const upload = multer({ storage });

// Auth middleware
const isAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Unauthorized' });
};

router.get('/', isAuth, itemController.getAllItems);
router.get('/:id', isAuth, itemController.getItemById);
router.post('/', isAuth, upload.single('image'), itemController.createItem);
router.put('/:id', isAuth, upload.single('image'), itemController.updateItem);
router.delete('/:id', isAuth, itemController.deleteItem);

module.exports = router;