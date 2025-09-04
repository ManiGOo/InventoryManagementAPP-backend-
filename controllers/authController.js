// controllers/authController.js
const jwt = require("jsonwebtoken");
const db = require("../db");
const bcrypt = require("bcrypt");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d"; // 7 days

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env");
}

// Helper: create JWT cookie
const sendTokenCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

// ===== Signup =====
exports.signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existing = await db("users").where({ email }).first();
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db("users")
      .insert({ username, email, password: hashedPassword })
      .returning(["id", "username", "email"]);

    sendTokenCookie(res, newUser.id);

    res.status(201).json({ user: newUser });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ===== Login =====
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

    // Set JWT cookie
    sendTokenCookie(res, user.id);

    // Fetch all categories
    const categories = await db("categories").select("id", "name");

    // Respond with user info + categories
    res.json({
      user: { id: user.id, username: user.username, email: user.email },
      categories,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ===== Logout =====
exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.json({ message: "Logged out successfully" });
};

// ===== Get current user =====
exports.getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.json({ user: null });

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await db("users")
      .select("id", "username", "email")
      .where({ id: decoded.id })
      .first();

    res.json({ user: user || null });
  } catch (err) {
    console.error("Get current user error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
