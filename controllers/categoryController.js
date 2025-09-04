const knex = require("../db");

// ===== Get all categories (default + user-specific) =====
exports.getAllCategories = async (req, res, next) => {
  try {
    const query = knex("categories").select("*");

    if (req.user?.id) {
      // Include both default (user_id null) and user-specific categories
      query.where((builder) =>
        builder.where("user_id", null).orWhere("user_id", req.user.id)
      );
    } else {
      // Only default categories for non-logged-in users
      query.where("user_id", null);
    }

    const categories = await query;
    res.json(categories);
  } catch (err) {
    console.error("Get categories error:", err);
    next(err); // pass to centralized error handler
  }
};

// ===== Create new category (user-specific) =====
exports.createCategory = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Login required" });

    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: "Name is required" });

    const [newCategory] = await knex("categories")
      .insert({ name: name.trim(), user_id: req.user.id })
      .returning(["id", "name"]);

    res.status(201).json(newCategory);
  } catch (err) {
    console.error("Create category error:", err);
    next(err);
  }
};

// ===== Delete user-added category =====
exports.deleteCategory = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Login required" });

    const count = await knex("categories")
      .where({ id: req.params.id, user_id: req.user.id })
      .del();

    if (!count) return res.status(404).json({ error: "Category not found or not owned by you" });

    res.json({ message: "Category deleted" });
  } catch (err) {
    console.error("Delete category error:", err);
    next(err);
  }
};
