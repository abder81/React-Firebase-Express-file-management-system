
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json()); // To parse JSON bodies

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

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl }); // Return the URL of the uploaded file
});

app.use("/uploads", express.static(uploadDir));  // Serve files from the uploads directory

app.use(express.json());  // To parse JSON request body


// Endpoint to delete a file from server's uploads directory
app.delete("/delete", (req, res) => {
  const { filename } = req.body;  // Extract filename from request body
  console.log("Received request to delete:", filename);  // Debug log

  if (!filename) return res.status(400).json({ error: "Filename is required to delete" });

  const filePath = path.join(uploadDir, filename);  // Full path of file to delete
  console.log("File path to delete:", filePath); // Debug log

  fs.exists(filePath, (exists) => {
    if (!exists) {
      console.log("File not found at path:", filePath);  // Debug log
      return res.status(404).json({ error: "File not found" });  // File doesn't exist
    }

    fs.unlink(filePath, (err) => {
      if (err) {
        console.log("Error deleting file:", err);  // Debug log
        return res.status(500).json({ error: "Failed to delete file" });
      }

      console.log("File deleted successfully!");  // Debug log
      res.json({ message: "File deleted successfully" });
    });
  });
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
