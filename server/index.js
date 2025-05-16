
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const admin = require("firebase-admin");
const authMiddleware = require("./authMiddleware");
const adminOnly = require("./adminOnly");

const app = express();
app.use(cors());
app.use(express.json()); // To parse JSON bodies

// initialize Admin SDK (if you haven’t already)
admin.initializeApp({
  credential: admin.credential.cert(require("./serviceAccountKey.json")),
});

// Set up file storage (flat structure in uploads folder)
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),  // No folder hierarchy
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),  // Unique filenames
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== ".pdf") {
      return cb(new Error("Only PDFs allowed"), false);
    }
    cb(null, true);
  },
});


// Admin-only upload
app.post(
  "/upload",
  authMiddleware,      // verify token
  adminOnly,          // check admin claim
  upload.single("file"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.json({ url });
  }
);

// List & serve files: anyone signed-in (authMiddleware)
app.use(
  "/uploads",
  authMiddleware,      // ensure user is authenticated
  express.static(uploadDir)
);


app.use(express.json());  // To parse JSON request body


// Endpoint to delete a file from server's uploads directory
// Admin-only delete
app.delete(
  "/delete",
  authMiddleware,
  adminOnly,
  (req, res) => {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ error: "Filename is required" });
    const filePath = path.join(uploadDir, filename);
    fs.exists(filePath, exists => {
      if (!exists) return res.status(404).json({ error: "File not found" });
      fs.unlink(filePath, err => {
        if (err) return res.status(500).json({ error: "Failed to delete file" });
        res.json({ message: "File deleted successfully" });
      });
    });
  }
);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
