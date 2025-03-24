import ejs from "ejs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viewsDir = path.join(__dirname, "views");
const distDir = path.join(__dirname, "dist");
const publicDir = path.join(__dirname, "public");

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  fs.readdirSync(src).forEach((file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.lstatSync(srcPath).isDirectory()) {
      copyRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

if (fs.existsSync(publicDir)) {
  copyRecursiveSync(publicDir, distDir);
}

fs.readdirSync(viewsDir).forEach((file) => {
  if (file.endsWith(".ejs")) {
    const filePath = path.join(viewsDir, file);
    const outputFilePath = path.join(distDir, file.replace(".ejs", ".html"));

    ejs.renderFile(filePath, { title: "My Website" }, (err, str) => {
      if (err) {
        console.error(`Error rendering ${file}:`, err);
        return;
      }
      fs.writeFileSync(outputFilePath, str);
      console.log(`Rendered: ${outputFilePath}`);
    });
  }
});
