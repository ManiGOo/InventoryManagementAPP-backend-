const bcrypt = require('bcryptjs');
const db = require('../db'); // knex instance

// SIGNUP
exports.signup = async (req, res, next) => {
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
    const [newUser] = await db('users')
      .insert({ username, email, password: hashed })
      .returning(['id', 'username', 'email']);

    // Auto login new user
    req.logIn(newUser, (err) => {
      if (err) return next(err);

      return res.status(201).json({
        user: newUser,
        categories: [], // empty initially
        items: [],      // empty initially
        message: 'User created & logged in',
      });
    });
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

    // Remove password before sending
    delete user.password;

    // Create session
    req.logIn(user, async (err) => {
      if (err) return next(err);

      try {
        // Fetch categories for this user (default + user-specific)
        const categories = await db('categories')
          .select('*')
          .where((builder) =>
            builder.where('user_id', null).orWhere('user_id', user.id)
          );

        // Fetch items belonging to this user
        const items = await db('items').where('user_id', user.id);

        return res.json({
          user,
          categories,
          items,
          message: 'Logged in',
        });
      } catch (fetchErr) {
        console.error('Login post-fetch error:', fetchErr);
        return res.json({ user, message: 'Logged in (partial data)' });
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// LOGOUT
exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);

    // Destroy session in store
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ error: "Session destroy failed" });

      // Clear cookie on client
      const cookieOptions = {
        httpOnly: true,
        path: "/", // must match how it was set
      };

      if (process.env.NODE_ENV === "production") {
        cookieOptions.secure = true;      // HTTPS only
        cookieOptions.sameSite = "none";  // allow cross-site cookies
      }

      res.clearCookie("connect.sid", cookieOptions);

      return res.json({ message: "Logged out successfully" });
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
