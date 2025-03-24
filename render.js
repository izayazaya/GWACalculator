import ejs from "ejs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const viewsDir = path.join(__dirname, "views");
const distDir = path.join(__dirname, "dist");

// Ensure the dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Convert each EJS file to HTML
fs.readdirSync(viewsDir).forEach((file) => {
  if (file.endsWith(".ejs")) {
    const filePath = path.join(viewsDir, file);
    const outputFilePath = path.join(distDir, file.replace(".ejs", ".html"));

    ejs.renderFile(filePath, { title: "GWA Calculator" }, (err, str) => {
      if (err) {
        console.error(`Error rendering ${file}:`, err);
        return;
      }
      fs.writeFileSync(outputFilePath, str);
      console.log(`Rendered: ${outputFilePath}`);
    });
  }
});
