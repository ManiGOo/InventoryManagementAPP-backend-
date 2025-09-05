// controllers/authController.js
const jwt = require("jsonwebtoken");
const db = require("../db");
const bcrypt = require("bcrypt");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";

// Helper: create JWT cookie
const sendTokenCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,          // Render + Netlify are HTTPS
    sameSite: "none",      // ✅ allow cross-site
    path: "/",             // good practice
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// ===== Signup =====
exports.signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existing = await db("users").where({ email }).first();
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const [newUser] = await db("users")
      .insert({ username, email, password: hashed })
      .returning(["id", "username", "email"]);

    sendTokenCookie(res, newUser.id);

    // Fetch all categories immediately
    const categories = await db("categories").select("*");

    res.status(201).json({ user: newUser, categories });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ===== Login =====
exports.login = async (req, res) => {
  const { loginInput, password } = req.body;
  try {
    const user = await db("users")
      .where("email", loginInput)
      .orWhere("username", loginInput)
      .first();

    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    sendTokenCookie(res, user.id);

    // Fetch all categories immediately
    const categories = await db("categories").select("*");

    res.json({ user: { id: user.id, username: user.username, email: user.email }, categories });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ===== Logout =====
exports.logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  res.json({ message: "Logged out successfully" });
};

// ===== Get current user =====
exports.getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.json({ user: null, categories: [] });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db("users")
      .select("id", "username", "email")
      .where({ id: decoded.id })
      .first();

    const categories = await db("categories").select("*");

    res.json({ user: user || null, categories });
  } catch (err) {
    console.error("Get current user error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
