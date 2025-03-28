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
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.render("index", { title: "GWA Calculator" });
});

app.get("/view-ejs", (req, res) => {
  res.render("view-ejs", { title: "Bicol University" });
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
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, safeName);
  },
});
const upload = multer({ storage: storage });

let worker;
const progressMap = {};

const initWorker = async () => {
  worker = await createWorker("eng");

  await worker.setParameters({ tessedit_pageseg_mode: 3 });

  console.log("Tesseract worker initialized.");
};

initWorker();

const processImage = async (filePath, id) => {
  if (!worker) {
    progressMap[id] = { progress: -1, text: "Worker not ready" };
    return;
  }

  try {
    progressMap[id] = { progress: 0, text: "" };

    const recognizePromise = worker.recognize(filePath, "eng");

    const progressCheck = setInterval(async () => {
      if (progressMap[id].progress >= 100 || progressMap[id].progress === -1) {
        clearInterval(progressCheck);
      }
    }, 500);

    const {
      data: { text },
    } = await recognizePromise;

    progressMap[id] = { progress: 100, text };
  } catch (error) {
    console.error("Error processing image:", error);
    progressMap[id] = { progress: -1, text: "Error processing image" };
  }
};

app.post("/grade", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });

  const id = Date.now().toString();
  progressMap[id] = { progress: 0, text: "" };

  processImage(req.file.path, id);

  res.json({ id });
});

app.get("/progress/:id", (req, res) => {
  const progressData = progressMap[req.params.id];
  if (!progressData) {
    return res.json({ progress: -1, text: "Processing not started" });
  }
  res.json(progressData);
});

app.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://localhost:${PORT}`));
