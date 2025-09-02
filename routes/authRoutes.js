const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const router = express.Router();

// Signup
router.post('/signup', authController.signup);

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info.message || 'Invalid credentials' });
    req.logIn(user, (err) => {
      if (err) return next(err);
      const { password, ...userWithoutPassword } = user; // remove password
      return res.json({ user: userWithoutPassword, message: 'Logged in' });
    });
  })(req, res, next);
});
// Logout
router.get('/logout', authController.logout);

// Current user
router.get('/me', authController.getCurrentUser);

module.exports = router;
