import { readdirSync, readFileSync, writeFileSync } from "fs";
import { resolve, dirname, basename } from "path";
import sharp from "sharp";

const rootDir = resolve(import.meta.dirname, "..");
const imagesDir = resolve(rootDir, "public", "images");
const pagesDir = resolve(rootDir, "src", "pages");
const layoutsDir = resolve(rootDir, "src", "layouts");

// Map of URL photo ID -> local filename
const urlMap = {};

// Scan all .astro files for unsplash URLs
async function findImages() {
  const files = [
    ...readdirSync(pagesDir, { recursive: true, withFileTypes: true })
      .filter(f => f.isFile() && f.name.endsWith(".astro")),
    ...readdirSync(layoutsDir, { recursive: true, withFileTypes: true })
      .filter(f => f.isFile() && f.name.endsWith(".astro")),
  ];

  for (const file of files) {
    const content = readFileSync(resolve(file.parentPath, file.name), "utf8");
    const regex = /https:\/\/images\.unsplash\.com\/photo-([a-zA-Z0-9_-]+)\?w=(\d+)&q=(\d+)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const photoId = match[1];
      const url = match[0];
      if (!urlMap[photoId]) {
        urlMap[photoId] = { url, name: `${photoId}.webp`, width: parseInt(match[2]), quality: parseInt(match[3]) };
      }
    }
  }

  console.log(`Found ${Object.keys(urlMap).length} unique images`);
}

async function downloadAndConvert() {
  const results = [];
  for (const [photoId, info] of Object.entries(urlMap)) {
    const outputPath = resolve(imagesDir, info.name);
    const imageUrl = `https://images.unsplash.com/photo-${photoId}?w=${info.width}&q=85&fm=jpg`;

    try {
      console.log(`Downloading ${photoId}...`);
      const response = await fetch(imageUrl);
      const buffer = Buffer.from(await response.arrayBuffer());

      await sharp(buffer)
        .webp({ quality: 80 })
        .toFile(outputPath);

      results.push({ photoId, success: true, path: info.name });
      console.log(`  -> ${info.name} saved`);
    } catch (e) {
      console.error(`  -> Failed ${photoId}: ${e.message}`);
      results.push({ photoId, success: false, error: e.message });
    }
  }
  return results;
}

function updateAstroFiles() {
  const files = [
    ...readdirSync(pagesDir, { recursive: true, withFileTypes: true })
      .filter(f => f.isFile() && f.name.endsWith(".astro")),
    ...readdirSync(layoutsDir, { recursive: true, withFileTypes: true })
      .filter(f => f.isFile() && f.name.endsWith(".astro")),
  ];

  let total = 0;
  for (const file of files) {
    const filePath = resolve(file.parentPath, file.name);
    let content = readFileSync(filePath, "utf8");
    let changed = false;

    const regex = /https:\/\/images\.unsplash\.com\/(photo-[a-zA-Z0-9_-]+\?w=\d+&q=\d+)/g;
    content = content.replace(regex, (match) => {
      const photoMatch = match.match(/photo-([a-zA-Z0-9_-]+)/);
      if (photoMatch) {
        const photoId = photoMatch[1];
        if (urlMap[photoId]) {
          changed = true;
          total++;
          return `/images/${photoId}.webp`;
        }
      }
      return match;
    });

    if (changed) {
      writeFileSync(filePath, content);
      console.log(`Updated ${basename(filePath)}`);
    }
  }
  console.log(`\nReplaced ${total} image URLs`);
}

// Main
console.log("Scanning for images...");
await findImages();
console.log(`Downloading and converting ${Object.keys(urlMap).length} images...\n`);
const results = await downloadAndConvert();
const succeeded = results.filter(r => r.success).length;
console.log(`\n${succeeded}/${results.length} images downloaded`);
console.log("\nUpdating .astro files...");
updateAstroFiles();
console.log("\nDone!");
