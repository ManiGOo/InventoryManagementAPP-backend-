const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only images are allowed"), false);
};
const upload = multer({ storage, fileFilter });

// Remove extra "/items" prefix
router.get("/", getAllItems);           // GET /items
router.get("/:id", getItemById);        // GET /items/:id
router.post("/", upload.single("image"), createItem); // POST /items
router.put("/:id", upload.single("image"), updateItem);
router.delete("/:id", deleteItem);

module.exports = router;
