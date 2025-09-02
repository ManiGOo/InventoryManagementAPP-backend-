const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const session = require("express-session");
const PGSession = require("connect-pg-simple")(session);
const db = require("./db"); // knex instance
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const relatedItemRoutes = require("./routes/relatedItemRoutes");

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(bodyParser.json());

// Session setup
app.use(
  session({
    store: new PGSession({
      conObject: { connectionString: process.env.DB_URL },
      tableName: "sessions",
      schemaName: "public",
      createTableIfMissing: true,
    }),
    secret: process.env.SECRET || "secret123",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
  })
);

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Use email instead of username
passport.use(
  new LocalStrategy(
    { usernameField: "loginInput" }, // frontend sends loginInput (username or email)
    async (loginInput, password, done) => {
      try {
        // Find user by username OR email
        const user = await db("users")
          .where("username", loginInput)
          .orWhere("email", loginInput)
          .first();

        if (!user) return done(null, false, { message: "Invalid credentials" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return done(null, false, { message: "Invalid credentials" });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Serialize user.id into session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await db("users").where({ id }).first();
    if (!user) return done(null, false);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Static files
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/auth", authRoutes);
app.use("/items", itemRoutes);
app.use("/categories", categoryRoutes);
app.use("/related-items", relatedItemRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
