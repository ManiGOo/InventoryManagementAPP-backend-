const knex = require("../db");
const cloudinary = require("cloudinary").v2;

// Make sure Cloudinary is configured somewhere globally
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(file) {
  if (!file) return null;
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "user_images" },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });
}

exports.getAllItems = async (req, res) => {
  try {
    const items = await knex("items").select("*").where({ user_id: req.user.id });
    res.json(items);
  } catch (err) {
    console.error("Get items error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const item = await knex("items")
      .where({ id: req.params.id, user_id: req.user.id })
      .first();
    if (!item) return res.status(404).json({ error: "Item not found or unauthorized" });
    res.json(item);
  } catch (err) {
    console.error("Get item error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.createItem = async (req, res) => {
  const { name, description, price, category_id } = req.body;

  try {
    const image_url = req.file ? await uploadToCloudinary(req.file) : null;

    const [id] = await knex("items").insert({
      name,
      description,
      price,
      category_id,
      image_url,
      user_id: req.user.id,
    }).returning("id");

    res.status(201).json({ id, name, description, price, category_id, image_url });
  } catch (err) {
    console.error("Create item error:", err);
    res.status(400).json({ error: "Invalid data or upload failed" });
  }
};

exports.updateItem = async (req, res) => {
  const { name, description, price, category_id } = req.body;

  try {
    let image_url;
    if (req.file) {
      image_url = await uploadToCloudinary(req.file);
    }

    const count = await knex("items")
      .where({ id: req.params.id, user_id: req.user.id })
      .update({
        name,
        description,
        price,
        category_id,
        ...(image_url && { image_url }), // update only if new image
      });

    if (!count) return res.status(404).json({ error: "Item not found or unauthorized" });
    res.json({ message: "Updated", image_url });
  } catch (err) {
    console.error("Update item error:", err);
    res.status(400).json({ error: "Invalid data or upload failed" });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const count = await knex("items")
      .where({ id: req.params.id, user_id: req.user.id })
      .del();
    if (!count) return res.status(404).json({ error: "Item not found or unauthorized" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete item error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
