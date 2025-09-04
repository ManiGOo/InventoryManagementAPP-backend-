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
const { authenticate } = require("../middleware/auth");

// ===== Multer setup =====
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only images are allowed"));
};
const upload = multer({ storage, fileFilter });

const uploadSingle = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err) return next(err);
    next();
  });
};

// ===== Apply JWT auth to all routes =====
router.use(authenticate);

router.get("/", getAllItems);                   // GET /items
router.get("/:id", getItemById);               // GET /items/:id
router.post("/", uploadSingle("image"), createItem); // POST /items
router.put("/:id", uploadSingle("image"), updateItem); // PUT /items/:id
router.delete("/:id", deleteItem);             // DELETE /items/:id

module.exports = router;
