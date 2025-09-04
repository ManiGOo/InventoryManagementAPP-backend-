const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const relatedItemRoutes = require("./routes/relatedItemRoutes");

const app = express();

// ===== CORS setup =====
const allowedOrigins = [
  "http://localhost:5173",              // local dev
  "https://inventofybymani.netlify.app" // production frontend
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (Postman or curl)
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    credentials: true, // still needed if you later use cookies
  })
);

// ===== Middleware =====
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads")); // static files

// ===== Routes =====
app.use("/auth", authRoutes);
app.use("/items", itemRoutes);
app.use("/categories", categoryRoutes);
app.use("/related-items", relatedItemRoutes);

// ===== Start server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
);
