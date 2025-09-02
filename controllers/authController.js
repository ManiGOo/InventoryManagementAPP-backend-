const bcrypt = require('bcryptjs');
const db = require('../db'); // knex instance

// SIGNUP
exports.signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    console.log('Signup attempt:', { username, email });

    // Check if username or email already exists
    const existingUser = await db('users')
      .where('username', username)
      .orWhere('email', email)
      .first();

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already taken' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Insert user
    const [id] = await db('users')
      .insert({ username, email, password: hashed })
      .returning('id');

    res.status(201).json({ id, message: 'User created' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// LOGIN
exports.login = async (req, res, next) => {
  const { loginInput, password } = req.body; // loginInput can be username or email
  try {
    // Find user by username or email
    const user = await db('users')
      .where('username', loginInput)
      .orWhere('email', loginInput)
      .first();

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Optional: remove password before sending user object
    delete user.password;

    // Create session
    req.logIn(user, (err) => {
      if (err) return next(err);
      res.json({ user, message: 'Logged in' });
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// LOGOUT
exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });

    req.session.destroy((err) => {
      if (err) return res.status(500).json({ error: 'Session destroy failed' });

      // Clear cookie on client
      res.clearCookie('connect.sid', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true on HTTPS
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
      });

      res.json({ message: 'Logged out successfully' });
    });
  });
};

// CURRENT USER
exports.getCurrentUser = (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
};
