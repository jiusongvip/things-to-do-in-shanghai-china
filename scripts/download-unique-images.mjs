import fs from 'fs';
import { execSync } from 'child_process';
import sharp from 'sharp';
import { resolve } from 'path';

const rootDir = resolve(import.meta.dirname, '..');
const imagesDir = resolve(rootDir, 'public', 'images');
const mapFile = resolve(rootDir, 'scripts', 'image-map.json');

// Items that need unique images, with Unsplash search keywords
const downloads = [
  // Replacements for the generic placeholder 1508808787069 (used 23x)
  { keyword: 'tianzifang+shanghai+alley+shops', label: 'Tianzifang' },
  { keyword: 'jingan+temple+shanghai', label: "Jing'an Temple" },
  { keyword: 'shanghai+summer+heat+city', label: 'Shanghai in Summer' },
  { keyword: 'shanghai+cherry+blossoms+sakura+park', label: 'Cherry Blossoms Shanghai' },
  { keyword: 'shanghai+breakfast+jianbing+street+food', label: 'Shanghai Breakfast' },
  { keyword: 'chinese+new+year+shanghai+lantern+temple+fair', label: 'Chinese New Year Shanghai' },
  { keyword: 'hangzhou+west+lake+china', label: 'Hangzhou West Lake' },
  { keyword: 'zhujiajiao+water+town+shanghai+canal', label: 'Zhujiajiao Water Town' },
  { keyword: 'nanjing+city+wall+china+landmark', label: 'Nanjing City Wall' },
  { keyword: 'moganshan+bamboo+forest+mountain+china', label: 'Moganshan' },
  { keyword: 'wuzhen+water+town+china+canal', label: 'Wuzhen Water Town' },
  { keyword: 'shanghai+metro+subway+train+station', label: 'Shanghai Metro' },
  { keyword: 'shanghai+food+market+street+stalls', label: 'Shanghai Budget Travel' },
  { keyword: 'nanjing+road+shanghai+shopping+street', label: 'Nanjing Road East Shopping' },
  { keyword: 'huaihai+road+shanghai+upscale+shopping', label: 'Huaihai Road Shopping' },
  { keyword: 'shanghai+ocean+aquarium+underwater+tunnel', label: 'Shanghai Ocean Aquarium' },
  { keyword: 'century+park+shanghai+lake+boats', label: 'Century Park Shanghai' },
  { keyword: 'shanghai+zoo+panda', label: 'Shanghai Zoo' },
  { keyword: 'bund+sightseeing+tunnel+shanghai+lights', label: 'Bund Sightseeing Tunnel' },
  { keyword: 'shanghai+circus+acrobatics+performance', label: 'Shanghai Circus World' },
  { keyword: 'ifc+mall+shanghai+pudong+shopping', label: 'IFC Mall Shanghai' },

  // Replacements for other duplicates
  { keyword: 'shanghai+photography+camera+skyline', label: 'Shanghai Photography' },
  { keyword: 'jia+jia+tang+bao+soup+dumpling+shanghai', label: 'Jia Jia Tang Bao' },
  { keyword: 'shanghai+food+cuisine+dishes+spread', label: 'Shanghai Food Dictionary' },
  { keyword: 'suzhou+classical+garden+china+unesco', label: 'Suzhou Gardens' },
  { keyword: 'shanghai+natural+history+museum+dinosaur', label: 'Shanghai Natural History Museum' },
  { keyword: 'shanghai+science+technology+museum+building', label: 'Shanghai Science Museum' },
  { keyword: 'shanghai+ap+plaza+fake+market+underground', label: 'AP Plaza Fake Market' },
  { keyword: 'yangs+fried+dumplings+shanghai+shengjianbao', label: "Yang's Fried Dumplings" },
  { keyword: 'lost+heaven+shanghai+yunnan+restaurant+courtyard', label: 'Lost Heaven Restaurant' },
  { keyword: 'pudong+puxi+shanghai+river+contrast', label: 'Pudong vs Puxi' },
];

const imageMap = {};

async function downloadImage(keyword, label) {
  // Use Unsplash source API with random seed for variety
  const seed = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const url = `https://source.unsplash.com/1200x800/?${keyword}&sig=${seed}`;
  const tempFile = resolve(imagesDir, `_dl_${label.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.tmp.jpg`);

  try {
    console.log(`  Downloading: ${label}...`);
    execSync(
      `curl -L -s -o "${tempFile}" -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)" -H "Accept: image/avif,image/webp,image/apng,image/*,*/*;q=0.8" "${url}"`,
      { stdio: 'pipe', timeout: 45000 }
    );

    const buf = fs.readFileSync(tempFile);
    if (buf.length < 2000) {
      throw new Error(`Image too small: ${buf.length} bytes (likely download failed)`);
    }
    console.log(`    Got ${(buf.length / 1024).toFixed(1)} KB`);

    // Extract Unsplash photo ID from the redirect URL if possible, otherwise generate one
    const photoId = `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const outFile = resolve(imagesDir, `${photoId}.webp`);
    await sharp(buf).webp({ quality: 80 }).toFile(outFile);
    console.log(`    -> ${photoId}.webp`);

    // Clean up temp
    try { fs.unlinkSync(tempFile); } catch {}

    return photoId;
  } catch (e) {
    console.error(`    FAILED: ${e.message?.slice(0, 120)}`);
    try { fs.unlinkSync(tempFile); } catch {}
    return null;
  }
}

async function main() {
  console.log(`Downloading ${downloads.length} unique images from Unsplash...\n`);

  for (let i = 0; i < downloads.length; i++) {
    const { keyword, label } = downloads[i];
    console.log(`[${i + 1}/${downloads.length}] ${label}`);
    const photoId = await downloadImage(keyword, label);
    if (photoId) {
      imageMap[label] = photoId;
    }
    // Small delay to avoid rate limiting
    if (i < downloads.length - 1) {
      console.log('  (waiting 1s...)');
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Save the mapping
  fs.writeFileSync(mapFile, JSON.stringify(imageMap, null, 2), 'utf8');
  console.log(`\nDone! ${Object.keys(imageMap).length}/${downloads.length} images downloaded.`);
  console.log(`Map saved to scripts/image-map.json`);
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
