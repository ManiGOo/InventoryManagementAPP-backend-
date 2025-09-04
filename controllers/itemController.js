const knex = require("../db");
const cloudinary = require("cloudinary").v2;

// ===== Cloudinary config =====
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to upload image
async function uploadToCloudinary(file) {
  if (!file) return null;
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "user_images" },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    stream.end(file.buffer);
  });
}

// ===== Get all items for logged-in user =====
exports.getAllItems = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Login required" });

    const items = await knex("items").select("*").where({ user_id: req.user.id });
    res.json(items);
  } catch (err) {
    console.error("Get items error:", err);
    next(err);
  }
};

// ===== Get single item by ID =====
exports.getItemById = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Login required" });

    const item = await knex("items")
      .where({ id: req.params.id, user_id: req.user.id })
      .first();

    if (!item) return res.status(404).json({ error: "Item not found or unauthorized" });

    res.json(item);
  } catch (err) {
    console.error("Get item error:", err);
    next(err);
  }
};

// ===== Create new item =====
exports.createItem = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Login required" });

    const { name, description, price, category_id } = req.body;
    const image_url = req.file ? await uploadToCloudinary(req.file) : null;

    const [newItem] = await knex("items")
      .insert({ name, description, price, category_id, image_url, user_id: req.user.id })
      .returning(["id", "name", "description", "price", "category_id", "image_url"]);

    res.status(201).json(newItem);
  } catch (err) {
    console.error("Create item error:", err);
    next(err);
  }
};

// ===== Update existing item =====
exports.updateItem = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Login required" });

    const { name, description, price, category_id } = req.body;
    const updates = { name, description, price, category_id };

    if (req.file) {
      const image_url = await uploadToCloudinary(req.file);
      updates.image_url = image_url;
    }

    const count = await knex("items")
      .where({ id: req.params.id, user_id: req.user.id })
      .update(updates);

    if (!count) return res.status(404).json({ error: "Item not found or unauthorized" });

    res.json({ message: "Updated", ...updates });
  } catch (err) {
    console.error("Update item error:", err);
    next(err);
  }
};

// ===== Delete item =====
exports.deleteItem = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Login required" });

    const count = await knex("items")
      .where({ id: req.params.id, user_id: req.user.id })
      .del();

    if (!count) return res.status(404).json({ error: "Item not found or unauthorized" });

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete item error:", err);
    next(err);
  }
};
