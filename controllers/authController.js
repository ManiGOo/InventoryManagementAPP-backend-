const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key";
const JWT_EXPIRES_IN = "7d"; // 1 week

// ===== Signup =====
exports.signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await db("users")
      .where("username", username)
      .orWhere("email", email)
      .first();

    if (existingUser) return res.status(400).json({ error: "Username or email already taken" });

    const hashed = await bcrypt.hash(password, 10);
    const [newUser] = await db("users")
      .insert({ username, email, password: hashed })
      .returning(["id", "username", "email"]);

    // Generate JWT
    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({ user: newUser, token, message: "User created" });
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
      .where("username", loginInput)
      .orWhere("email", loginInput)
      .first();

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    delete user.password;

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({ user, token, message: "Logged in" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ===== Get current user =====
exports.getCurrentUser = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Not authenticated" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db("users").where({ id: decoded.id }).first();
    if (!user) return res.status(401).json({ error: "User not found" });

    delete user.password;
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
