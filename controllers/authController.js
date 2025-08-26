const bcrypt = require('bcryptjs');
const db = require('../db'); // use the db.js instance

exports.signup = async (req, res) => {
  const { username, password } = req.body;
  try {
    console.log('Signup attempt:', { username });
    const existingUser = await db('users').where({ username }).first();
    if (existingUser) {
      console.log('Username taken:', username);
      return res.status(400).json({ error: 'Username taken' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const [id] = await db('users').insert({ username, password: hashed }).returning('id');
    res.status(201).json({ id, message: 'User created' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = (req, res) => {
  res.json({ user: req.user, message: 'Logged in' });
};

exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    req.session.destroy(() => {
      res.json({ message: 'Logged out' });
    });
  });
};

exports.getCurrentUser = (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
};