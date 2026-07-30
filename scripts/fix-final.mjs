import sharp from "sharp";
import { resolve } from "path";
import https from "node:https";

const rootDir = resolve(import.meta.dirname, "..");
const imagesDir = resolve(rootDir, "public", "images");

const failed = [
  "1537531383496-f4749b88b6a3",
  "1586867099242-a5cfb14c0046",
  "1600916886289-b0da7e616678",
  "1559824446-09eebcc1b60f",
  "1548502499-ef49e8cf98fa",
];

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, { headers: { "User-Agent": "Mozilla/5.0" } }, (res2) => {
          const chunks = [];
          res2.on("data", c => chunks.push(c));
          res2.on("end", () => resolve(Buffer.concat(chunks)));
          res2.on("error", reject);
        });
        return;
      }
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    });
  });
}

for (const photoId of failed) {
  try {
    const url = `https://images.unsplash.com/photo-${photoId}?w=2400&q=100&fit=max`;
    console.log(`Downloading ${photoId}...`);
    const buffer = await download(url);
    console.log(`  Got ${(buffer.length/1024).toFixed(1)}KB`);
    await sharp(buffer).webp({ quality: 80 }).toFile(resolve(imagesDir, `${photoId}.webp`));
    console.log(`  -> ${photoId}.webp saved`);
  } catch (e) {
    console.error(`  -> Failed ${photoId}: ${e.message}`);
  }
}
console.log("Done!");
