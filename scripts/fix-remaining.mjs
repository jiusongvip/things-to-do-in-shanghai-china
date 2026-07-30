import sharp from "sharp";
import { resolve } from "path";

const rootDir = resolve(import.meta.dirname, "..");
const imagesDir = resolve(rootDir, "public", "images");

const failed = [
  "1537531383496-f4749b88b6a3",
  "1586867099242-a5cfb14c0046",
  "1600916886289-b0da7e616678",
  "1559824446-09eebcc1b60f",
  "1548502499-ef49e8cf98fa",
];

for (const photoId of failed) {
  try {
    const url = `https://images.unsplash.com/photo-${photoId}?w=2400&q=100&fm=jpg&fit=max`;
    console.log(`Downloading ${photoId} (JPEG)...`);
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    await sharp(buffer).webp({ quality: 80 }).toFile(resolve(imagesDir, `${photoId}.webp`));
    console.log(`  -> ${photoId}.webp saved`);
  } catch (e) {
    console.error(`  -> Failed ${photoId}: ${e.message}`);
  }
}
console.log("Done!");
