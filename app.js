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
    cb(null, "grades/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

const processImage = async (filePath) => {
  const worker = await createWorker("eng");

  try {
    console.log("Starting OCR processing...");

    const {
      data: { text },
    } = await worker.recognize(filePath);

    console.log("OCR processing complete.");
    console.log("Extracted text:", text);

    await worker.terminate();
    console.log("Tesseract worker terminated.");

    return text;
  } catch (error) {
    console.error("Error processing image:", error);
    return "Error processing image";
  }
};

app.post("/grade", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const filePath = path.join(__dirname, "grades", req.file.originalname);

  fs.access(filePath, fs.constants.F_OK, async (err) => {
    if (err) {
      console.error("Error: File not found");
      return res.status(500).send("Error: File not found");
    }

    console.log("File found, processing with OCR...");
    const extractedText = await processImage(filePath);

    res.send(`Extracted Text: <pre>${extractedText}</pre>`);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
