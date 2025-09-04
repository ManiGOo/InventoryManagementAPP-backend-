const jwt = require("jsonwebtoken");
const db = require("../db");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env!");
}

// Authenticate JWT from cookies
exports.authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.token; // read token from cookie
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await db("users")
      .select("id", "username", "email")
      .where({ id: decoded.id })
      .first();

    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user; // attach user to request
    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    res.status(401).json({ error: "Invalid token" });
  }
};
