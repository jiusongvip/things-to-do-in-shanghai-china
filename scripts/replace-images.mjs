import fs from 'fs';
import { resolve } from 'path';

const rootDir = resolve(import.meta.dirname, '..');
const srcPages = resolve(rootDir, 'src', 'pages');
const results = JSON.parse(fs.readFileSync(resolve(rootDir, 'scripts', 'dl-results.json'), 'utf8'));

// Build lookup: label -> new path
const lookup = {};
results.forEach(r => { lookup[r.label] = r.path; });

// Replacement config: [file, uniqueId, oldImgSuffix, newImgLabel]
const config = [
  ['attractions.astro', "Jing'an Temple", '1508808787069-421eaa7987a6.webp', "Jing'an Temple"],
  ['blog.astro', 'Summer: Survival', '1508808787069-421eaa7987a6.webp', 'Shanghai Summer'],
  ['blog.astro', 'Cherry Blossoms', '1508808787069-421eaa7987a6.webp', 'Cherry Blossoms'],
  ['blog.astro', 'Breakfast', '1508808787069-421eaa7987a6.webp', 'Shanghai Breakfast'],
  ['blog.astro', 'Chinese New Year', '1508808787069-421eaa7987a6.webp', 'Chinese New Year'],
  ['blog.astro', 'Photography:', '1474181485279-c166b9a02b82.webp', 'Shanghai Photography'],
  ['day-trips.astro', 'Hangzhou', '1508808787069-421eaa7987a6.webp', 'Hangzhou'],
  ['day-trips.astro', 'Zhujiajiao', '1508808787069-421eaa7987a6.webp', 'Zhujiajiao'],
  ['day-trips.astro', 'Nanjing', '1508808787069-421eaa7987a6.webp', 'Nanjing'],
  ['day-trips.astro', 'Moganshan', '1508808787069-421eaa7987a6.webp', 'Moganshan'],
  ['day-trips.astro', 'Wuzhen', '1508808787069-421eaa7987a6.webp', 'Wuzhen'],
  ['day-trips.astro', 'Suzhou', '1565967511849-76a60a516170.webp', 'Suzhou'],
  ['guides.astro', 'Metro', '1508808787069-421eaa7987a6.webp', 'Shanghai Metro'],
  ['guides.astro', 'Budget', '1508808787069-421eaa7987a6.webp', 'Shanghai Budget'],
  ['guides.astro', 'Food Dictionary', '1566407262311-749b6b3f6b86.webp', 'Food Dictionary'],
  ['guides.astro', 'Pudong vs Puxi', '1545893835-abaa50cbe628.webp', 'Pudong vs Puxi'],
  ['shopping.astro', 'Nanjing Road East', '1508808787069-421eaa7987a6.webp', 'Nanjing Road East'],
  ['shopping.astro', 'Huaihai Road', '1508808787069-421eaa7987a6.webp', 'Huaihai Road'],
  ['shopping.astro', 'Tianzifang', '1508808787069-421eaa7987a6.webp', 'Tianzifang Shopping'],
  ['shopping.astro', 'IFC Mall', '1508808787069-421eaa7987a6.webp', 'IFC Mall'],
  ['shopping.astro', 'AP Plaza', '1489987707025-afc232f7ea0f.webp', 'AP Plaza'],
  ['with-kids.astro', 'Ocean Aquarium', '1508808787069-421eaa7987a6.webp', 'Ocean Aquarium'],
  ['with-kids.astro', 'Century Park', '1508808787069-421eaa7987a6.webp', 'Century Park'],
  ['with-kids.astro', 'Shanghai Zoo', '1508808787069-421eaa7987a6.webp', 'Shanghai Zoo'],
  ['with-kids.astro', 'Bund Sightseeing', '1508808787069-421eaa7987a6.webp', 'Bund Tunnel'],
  ['with-kids.astro', 'Circus World', '1508808787069-421eaa7987a6.webp', 'Circus World'],
  ['with-kids.astro', 'Natural History', '1565967511849-76a60a516170.webp', 'Natural History Museum'],
  ['with-kids.astro', 'Science and Technology', '1565967511849-76a60a516170.webp', 'Science Museum'],
  ['food.astro', 'Jia Jia Tang Bao', '1541696432-82c6da8ce7bf.webp', 'Jia Jia Tang Bao'],
  ['food.astro', "Yang's Fried", '1627308595229-7830a5c91f9f.webp', "Yang's Fried Dumplings"],
  ['nightlife.astro', 'Lost Heaven', '1517248135467-4c7edcad34c4.webp', 'Lost Heaven'],
];

let updated = 0;
let errors = 0;

for (const [file, uniqueId, oldImg, label] of config) {
  const newPath = lookup[label];
  if (!newPath) {
    console.log('SKIP: no image for ' + label);
    errors++;
    continue;
  }

  const fp = resolve(srcPages, file);
  let content = fs.readFileSync(fp, 'utf8');
  const oldFull = '/images/' + oldImg;
  const lines = content.split('\n');
  let replaced = false;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(oldFull)) {
      const ctx = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 3)).join('\n');
      if (ctx.includes(uniqueId)) {
        lines[i] = lines[i].replace(oldFull, newPath);
        fs.writeFileSync(fp, lines.join('\n'), 'utf8');
        console.log(file + ': ' + label + ' -> ' + newPath);
        replaced = true;
        updated++;
        break;
      }
    }
  }

  if (!replaced) {
    console.log('NOT FOUND: ' + file + ' / ' + uniqueId);
    errors++;
  }
}

console.log('\nDone! ' + updated + ' replaced, ' + errors + ' errors.');
