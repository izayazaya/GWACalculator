import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";
import { createWorker } from "tesseract.js";

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = "/GWACalculator";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));

app.use((req, res, next) => {
  res.locals.baseUrl = "";
  next();
});

app.get("/", (req, res) => {
  res.render("index", { title: "GWA Calculator" });
});

app.get("/view-ejs", (req, res) => {
  res.render("view-ejs", { title: "Bicol University" });
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempPath = "/tmp/uploads";
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath, { recursive: true });
    }
    cb(null, tempPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const gradesDir = path.join(__dirname, "grades");

if (!fs.existsSync(gradesDir)) {
  fs.mkdirSync(gradesDir, { recursive: true });
}

const upload = multer({ storage: storage });

const processImage = async (filePath) => {
  try {
    const worker = await createWorker("eng");

    console.log("Starting OCR processing on:", filePath);
    const {
      data: { text },
    } = await worker.recognize(filePath);

    console.log("OCR processing complete.");
    await worker.terminate();

    return text;
  } catch (error) {
    console.error("OCR Processing Error:", error);
    return "Error processing image";
  }
};

app.post("/grade", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const filePath = req.file.path;

  console.log("File uploaded to:", filePath);

  if (!fs.existsSync(filePath)) {
    console.error("Error: File not found", filePath);
    return res.status(500).send("Error: File not found");
  }

  console.log("File found, processing with OCR...");
  const extractedText = await processImage(filePath);

  res.send(`Extracted Text: <pre>${extractedText}</pre>`);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
