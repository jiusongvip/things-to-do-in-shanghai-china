import fs from 'fs';
import { resolve } from 'path';

const rootDir = resolve(import.meta.dirname, '..');
const srcPages = resolve(rootDir, 'src', 'pages');
const results = JSON.parse(fs.readFileSync(resolve(rootDir, 'scripts', 'dl-all-results.json'), 'utf8'));

const lookup = {};
results.forEach(r => { lookup[r.label] = r.path; });

const replacements = [
  // === index.astro ===
  ['index.astro', 'Shanghai Pudong skyline at dusk', 'Index Hero Banner - Bund Skyline'],
  ['index.astro', 'Walk the Bund', 'Top Pick 01 - Walk the Bund'],
  ['index.astro', 'Ascend Shanghai Tower', 'Top Pick 02 - Shanghai Tower'],
  ['index.astro', 'Get Lost in Yu Garden', 'Top Pick 03 - Yu Garden'],
  ['index.astro', 'Eat Xiaolongbao', 'Top Pick 04 - Xiaolongbao'],
  ['index.astro', 'Stroll the French Concession', 'Top Pick 05 - French Concession'],

  // === attractions.astro ===
  ['attractions.astro', 'The Bund', 'Attraction - The Bund'],
  ['attractions.astro', 'Shanghai Tower', 'Attraction - Shanghai Tower'],
  ['attractions.astro', 'Yu Garden', 'Attraction - Yu Garden'],
  ['attractions.astro', 'Shanghai Disneyland', 'Attraction - Disneyland'],
  ['attractions.astro', 'French Concession', 'Attraction - French Concession'],
  ['attractions.astro', 'Shanghai Museum', 'Attraction - Shanghai Museum'],
  ["attractions.astro", "Jing'an Temple", 'Attraction - Jingan Temple'],
  ['attractions.astro', 'Tianzifang', 'Attraction - Tianzifang'],

  // === food.astro ===
  ['food.astro', 'Xiaolongbao', 'Food - Xiaolongbao Soup Dumplings'],
  ['food.astro', 'Shengjianbao', 'Food - Shengjianbao'],
  ['food.astro', 'Hairy Crab', 'Food - Hairy Crab'],
  ['food.astro', 'Hongshao Rou', 'Food - Hongshao Rou'],
  ['food.astro', 'Cong You Bing', 'Food - Cong You Bing'],

  // === nightlife.astro ===
  ['nightlife.astro', 'Flair Rooftop', 'Nightlife - Flair Rooftop'],
  ['nightlife.astro', 'Speak Low', 'Nightlife - Speak Low'],
  ['nightlife.astro', 'The Bund Bar Crawl', 'Nightlife - Bund Bar Crawl'],
  ['nightlife.astro', 'M1NT', 'Nightlife - M1NT'],
  ['nightlife.astro', 'Huangpu River Night Cruise', 'Nightlife - Huangpu River Cruise'],
  ['nightlife.astro', 'The Odd Couple', 'Nightlife - The Odd Couple'],
  ['nightlife.astro', 'Arkham', 'Nightlife - Arkham'],
  ['nightlife.astro', 'Lost Heaven', 'Nightlife - Lost Heaven'],

  // === shopping.astro ===
  ['shopping.astro', 'Nanjing Road East', 'Shopping - Nanjing Road East'],
  ['shopping.astro', 'South Bund Fabric Market', 'Shopping - South Bund Fabric Market'],
  ['shopping.astro', 'Huaihai Road', 'Shopping - Huaihai Road'],
  ['shopping.astro', 'Tianzifang', 'Shopping - Tianzifang'],
  ['shopping.astro', 'AP Plaza', 'Shopping - AP Plaza'],
  ['shopping.astro', 'IFC Mall', 'Shopping - IFC Mall'],

  // === day-trips.astro ===
  ['day-trips.astro', 'Suzhou', 'Day Trip - Suzhou'],
  ['day-trips.astro', 'Hangzhou', 'Day Trip - Hangzhou'],
  ['day-trips.astro', 'Zhujiajiao Water Town', 'Day Trip - Zhujiajiao'],
  ['day-trips.astro', 'Nanjing', 'Day Trip - Nanjing'],
  ['day-trips.astro', 'Moganshan', 'Day Trip - Moganshan'],
  ['day-trips.astro', 'Wuzhen Water Town', 'Day Trip - Wuzhen'],

  // === with-kids.astro ===
  ['with-kids.astro', 'Shanghai Disneyland', 'Kids - Disneyland'],
  ['with-kids.astro', 'Shanghai Ocean Aquarium', 'Kids - Ocean Aquarium'],
  ['with-kids.astro', 'Shanghai Natural History Museum', 'Kids - Natural History Museum'],
  ['with-kids.astro', 'Century Park', 'Kids - Century Park'],
  ['with-kids.astro', 'Shanghai Zoo', 'Kids - Shanghai Zoo'],
  ['with-kids.astro', 'Shanghai Science and Technology Museum', 'Kids - Science Museum'],
  ['with-kids.astro', 'Bund Sightseeing Tunnel', 'Kids - Bund Tunnel'],
  ['with-kids.astro', 'Shanghai Circus World', 'Kids - Circus World'],

  // === guides.astro ===
  ['guides.astro', "The Bund: Complete Visitor's Guide", 'Guide - The Bund'],
  ['guides.astro', 'Shanghai Metro: How to Use It', 'Guide - Shanghai Metro'],
  ['guides.astro', 'Yu Garden: History and Tips', 'Guide - Yu Garden'],
  ['guides.astro', 'Shanghai Food Dictionary', 'Guide - Food Dictionary'],
  ['guides.astro', 'Pudong vs Puxi: Which Side to Stay On', 'Guide - Pudong vs Puxi'],
  ['guides.astro', 'Shanghai on a Budget', 'Guide - Shanghai on a Budget'],

  // === blog.astro ===
  ['blog.astro', 'Shanghai in Summer: Survival Guide', 'Blog - Shanghai Summer'],
  ['blog.astro', 'Where to See Cherry Blossoms in Shanghai', 'Blog - Cherry Blossoms'],
  ['blog.astro', "Shanghai's Best Rooftop Bars: 2026 Edition", 'Blog - Rooftop Bars'],
  ['blog.astro', "A Local's Guide to Shanghai Breakfast", 'Blog - Shanghai Breakfast'],
  ['blog.astro', 'Shanghai Photography: 10 Best Locations', 'Blog - Photography Tips'],
  ['blog.astro', 'Chinese New Year in Shanghai: What to Expect', 'Blog - Chinese New Year'],
];

function replaceImgInFile(filePath, uniqueMarker, newPath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Strategy: find the line with uniqueMarker, then search nearby lines for img path
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(uniqueMarker)) {
      // Search forward (up to 8 lines) for an img reference
      for (let j = i; j < Math.min(i + 8, lines.length); j++) {
        const match = lines[j].match(/\/images\/[^\s"']+\.webp/);
        if (match) {
          const oldPath = match[0];
          // For <img src="/images/xxx.webp" or img: "/images/xxx.webp"
          lines[j] = lines[j].replace(oldPath, newPath);
          fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
          return { oldPath, newPath };
        }
      }
      // Search backward (up to 3 lines)
      for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
        const match = lines[j].match(/\/images\/[^\s"']+\.webp/);
        if (match && !match[0].includes(newPath)) {
          const oldPath = match[0];
          lines[j] = lines[j].replace(oldPath, newPath);
          fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
          return { oldPath, newPath };
        }
      }
    }
  }
  return null;
}

let updated = 0;
let errors = 0;

for (const [file, uniqueMarker, label] of replacements) {
  const newPath = lookup[label];
  if (!newPath) {
    console.log('SKIP (no image): ' + label);
    errors++;
    continue;
  }

  const fp = resolve(srcPages, file);
  const result = replaceImgInFile(fp, uniqueMarker, newPath);
  if (result) {
    console.log(file + ': ' + uniqueMarker.slice(0, 40) + ' -> ' + newPath);
    updated++;
  } else {
    console.log('NOT FOUND: ' + file + ' / ' + uniqueMarker.slice(0, 40));
    errors++;
  }
}

console.log('\nDone! ' + updated + ' replaced, ' + errors + ' errors.');
