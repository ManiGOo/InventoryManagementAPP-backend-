// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const logger = require("./middleware/logger"); // Winston logger
const { authenticate } = require("./middleware/auth");

// Import routes
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const relatedItemRoutes = require("./routes/relatedItemRoutes");

const app = express();

// ===== Trust proxy for Render & rate-limit =====
app.set("trust proxy", 1); // important for Render deployment

// ===== Middleware =====
app.use(cookieParser());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

// ===== CORS setup =====
const allowedOrigins = [
  "http://localhost:5173",
  "https://inventofybymani.netlify.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ===== Logging =====
if (process.env.NODE_ENV === "production") {
  app.use(
    morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } })
  );
} else {
  app.use(morgan("dev"));
}

// ===== Rate Limiting =====
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "Too many requests from this IP, please try again later." }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5,
  message: { error: "Too many login/signup attempts. Try again later." }
});

// Apply rate limiters
app.use("/auth", generalLimiter);
app.use("/auth/login", authLimiter);
app.use("/auth/signup", authLimiter);

// ===== Routes =====
// Public routes
app.use("/auth", authRoutes);

// Protected routes (require JWT)
app.use("/items", authenticate, itemRoutes);
app.use("/categories", authenticate, categoryRoutes);
app.use("/related-items", authenticate, relatedItemRoutes);

// ===== Fallback route for 404 =====
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// ===== Start server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
});
