import sharp from "sharp";
import { resolve } from "path";
import { execSync } from "child_process";

const rootDir = resolve(import.meta.dirname, "..");
const imagesDir = resolve(rootDir, "public", "images");

const ids = [
  "1537531383496-f4749b88b6a3",
  "1586867099242-a5cfb14c0046",
  "1600916886289-b0da7e616678",
  "1559824446-09eebcc1b60f",
  "1548502499-ef49e8cf98fa",
];

for (const id of ids) {
  const url = `https://images.unsplash.com/photo-${id}?w=2400&q=100&fm=jpg&fit=max`;
  const tmp = resolve(imagesDir, `${id}.tmp.jpg`);
  const out = resolve(imagesDir, `${id}.webp`);
  try {
    execSync(`curl -L -s -o "${tmp}" -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" -H "Accept: image/avif,image/webp,image/apng,image/*,*/*;q=0.8" "${url}"`, { stdio: "inherit", timeout: 30000 });
    const buffer = await import("fs").then(fs => fs.readFileSync(tmp));
    console.log(`${id}: ${(buffer.length/1024).toFixed(1)}KB`);
    await sharp(buffer).webp({ quality: 80 }).toFile(out);
    console.log(`  -> ${id}.webp saved`);
  } catch (e) {
    console.error(`${id}: FAILED - ${e.message?.slice(0,100)}`);
  }
}
console.log("Done!");
