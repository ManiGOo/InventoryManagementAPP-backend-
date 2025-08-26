const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', passport.authenticate('local'), authController.login);
router.get('/logout', authController.logout);
router.get('/me', authController.getCurrentUser);

module.exports = router;