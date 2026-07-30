import fs from 'fs';
import { execSync } from 'child_process';
import sharp from 'sharp';
import { resolve } from 'path';

const rootDir = resolve(import.meta.dirname, '..');
const imagesDir = resolve(rootDir, 'public', 'images');

const items = [
  ['jingan,temple,shanghai', "Jing'an Temple"],
  ['shanghai,summer,heat', 'Shanghai Summer'],
  ['cherry,blossom,shanghai,park', 'Cherry Blossoms'],
  ['shanghai,breakfast,jianbing', 'Shanghai Breakfast'],
  ['chinese,new,year,lantern', 'Chinese New Year'],
  ['hangzhou,west,lake', 'Hangzhou'],
  ['zhujiajiao,water,town', 'Zhujiajiao'],
  ['nanjing,city,wall,china', 'Nanjing'],
  ['moganshan,bamboo,mountain', 'Moganshan'],
  ['wuzhen,water,town,china', 'Wuzhen'],
  ['shanghai,metro,subway', 'Shanghai Metro'],
  ['shanghai,budget,street,food', 'Shanghai Budget'],
  ['nanjing,road,shanghai,shopping', 'Nanjing Road East'],
  ['huaihai,road,shanghai', 'Huaihai Road'],
  ['tianzifang,shanghai,alley', 'Tianzifang Shopping'],
  ['ifc,mall,shanghai,pudong', 'IFC Mall'],
  ['shanghai,ocean,aquarium', 'Ocean Aquarium'],
  ['century,park,shanghai', 'Century Park'],
  ['shanghai,zoo,panda', 'Shanghai Zoo'],
  ['bund,tunnel,shanghai', 'Bund Tunnel'],
  ['shanghai,circus,acrobatics', 'Circus World'],
  ['shanghai,photography,skyline', 'Shanghai Photography'],
  ['soup,dumpling,steamed', 'Jia Jia Tang Bao'],
  ['chinese,food,cuisine,variety', 'Food Dictionary'],
  ['suzhou,classical,garden,unesco', 'Suzhou'],
  ['natural,history,museum,shanghai', 'Natural History Museum'],
  ['science,technology,museum,shanghai', 'Science Museum'],
  ['market,stall,underground', 'AP Plaza'],
  ['pan,fried,dumpling,asian', "Yang's Fried Dumplings"],
  ['yunnan,restaurant,courtyard,lantern', 'Lost Heaven'],
  ['shanghai,skyline,pudong,puxi', 'Pudong vs Puxi'],
];

async function dl(keyword, label) {
  const r = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const url = 'https://loremflickr.com/1200/800/' + keyword + '?random=' + r;
  const id = 'lf-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  const tmp = resolve(imagesDir, id + '.tmp.jpg');
  const out = resolve(imagesDir, id + '.webp');
  try {
    execSync('curl -L -s -o "' + tmp + '" -H "User-Agent: Mozilla/5.0" "' + url + '"', { stdio: 'pipe', timeout: 30000 });
    const buf = fs.readFileSync(tmp);
    if (buf.length < 2000) throw new Error('Too small: ' + buf.length);
    await sharp(buf).webp({ quality: 80 }).toFile(out);
    try { fs.unlinkSync(tmp); } catch {}
    return { id: id, path: '/images/' + id + '.webp' };
  } catch (e) {
    console.error('  FAILED: ' + (e.message || '').slice(0, 80));
    try { fs.unlinkSync(tmp); } catch {}
    return null;
  }
}

async function main() {
  console.log('Downloading ' + items.length + ' images...\n');
  const results = [];
  for (let i = 0; i < items.length; i++) {
    const [kw, label] = items[i];
    console.log('[' + (i + 1) + '/' + items.length + '] ' + label);
    const r = await dl(kw, label);
    if (r) {
      results.push({ label: label, path: r.path, id: r.id });
      console.log('  -> ' + r.id + '.webp');
    }
    if (i < items.length - 1) await new Promise(r => setTimeout(r, 2000));
  }
  fs.writeFileSync(resolve(rootDir, 'scripts', 'dl-results.json'), JSON.stringify(results, null, 2), 'utf8');
  console.log('\nDone! ' + results.length + '/' + items.length + ' downloaded.');
}

main().catch(e => { console.error(e); process.exit(1); });
