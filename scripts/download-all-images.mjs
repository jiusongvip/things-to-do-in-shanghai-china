import fs from 'fs';
import https from 'https';
import sharp from 'sharp';
import { resolve } from 'path';

const API_KEY = process.env.PEXELS_API_KEY || '';

const rootDir = resolve(import.meta.dirname, '..');
const imagesDir = resolve(rootDir, 'public', 'images');

const slots = [
  'Index Hero Banner - Bund Skyline',
  'Top Pick 01 - Walk the Bund',
  'Top Pick 02 - Shanghai Tower',
  'Top Pick 03 - Yu Garden',
  'Top Pick 04 - Xiaolongbao',
  'Top Pick 05 - French Concession',
  'Attraction - The Bund',
  'Attraction - Shanghai Tower',
  'Attraction - Yu Garden',
  'Attraction - Disneyland',
  'Attraction - French Concession',
  'Attraction - Shanghai Museum',
  'Attraction - Jingan Temple',
  'Attraction - Tianzifang',
  'Food - Xiaolongbao Soup Dumplings',
  'Food - Shengjianbao',
  'Food - Hairy Crab',
  'Food - Hongshao Rou',
  'Food - Cong You Bing',
  'Nightlife - Flair Rooftop',
  'Nightlife - Speak Low',
  'Nightlife - Bund Bar Crawl',
  'Nightlife - M1NT',
  'Nightlife - Huangpu River Cruise',
  'Nightlife - The Odd Couple',
  'Nightlife - Arkham',
  'Nightlife - Lost Heaven',
  'Shopping - Nanjing Road East',
  'Shopping - South Bund Fabric Market',
  'Shopping - Huaihai Road',
  'Shopping - Tianzifang',
  'Shopping - AP Plaza',
  'Shopping - IFC Mall',
  'Day Trip - Suzhou',
  'Day Trip - Hangzhou',
  'Day Trip - Zhujiajiao',
  'Day Trip - Nanjing',
  'Day Trip - Moganshan',
  'Day Trip - Wuzhen',
  'Kids - Disneyland',
  'Kids - Ocean Aquarium',
  'Kids - Natural History Museum',
  'Kids - Century Park',
  'Kids - Shanghai Zoo',
  'Kids - Science Museum',
  'Kids - Bund Tunnel',
  'Kids - Circus World',
  'Guide - The Bund',
  'Guide - Shanghai Metro',
  'Guide - Yu Garden',
  'Guide - Food Dictionary',
  'Guide - Pudong vs Puxi',
  'Guide - Shanghai on a Budget',
  'Blog - Shanghai Summer',
  'Blog - Cherry Blossoms',
  'Blog - Rooftop Bars',
  'Blog - Shanghai Breakfast',
  'Blog - Photography Tips',
  'Blog - Chinese New Year',
];

const cardQueries = {
  'Index Hero Banner - Bund Skyline': 'shanghai bund skyline sunset huangpu river panoramic',
  'Top Pick 01 - Walk the Bund': 'the bund shanghai waterfront promenade colonial architecture walk',
  'Top Pick 02 - Shanghai Tower': 'shanghai tower skyscraper tallest building modern architecture',
  'Top Pick 03 - Yu Garden': 'yu garden shanghai classical chinese garden pavilion koi pond',
  'Top Pick 04 - Xiaolongbao': 'xiaolongbao steamed soup dumplings chinese dim sum bamboo steamer',
  'Top Pick 05 - French Concession': 'shanghai french concession plane trees street cafe lane houses',
  'Attraction - The Bund': 'shanghai bund historic buildings huangpu river cityscape landmark',
  'Attraction - Shanghai Tower': 'shanghai tower observation deck skyscraper view city panorama',
  'Attraction - Yu Garden': 'yu garden shanghai rockery pavilion ming dynasty classical garden',
  'Attraction - Disneyland': 'shanghai disneyland enchanted storybook castle theme park disney',
  'Attraction - French Concession': 'shanghai french concession lane houses wutong trees art deco',
  'Attraction - Shanghai Museum': 'shanghai museum ancient chinese art bronze ceramics gallery',
  'Attraction - Jingan Temple': 'jingan temple shanghai golden buddhist temple incense architecture',
  'Attraction - Tianzifang': 'tianzifang shanghai shikumen alley art shops narrow lane market',
  'Food - Xiaolongbao Soup Dumplings': 'steamed soup dumplings xiaolongbao chinese dim sum closeup food',
  'Food - Shengjianbao': 'pan fried pork buns shengjianbao sesame scallion crispy chinese street food',
  'Food - Hairy Crab': 'chinese hairy crab steamed seafood dazhaxie autumn delicacy cuisine',
  'Food - Hongshao Rou': 'red braised pork belly hongshao rou chinese cuisine soy sauce glazed meat',
  'Food - Cong You Bing': 'chinese scallion pancake cong you bing crispy flatbread street food griddle',
  'Nightlife - Flair Rooftop': 'luxury rooftop bar shanghai skyline night view cocktail city lights',
  'Nightlife - Speak Low': 'hidden speakeasy bar bookshelf entrance dim lighting cocktail secret',
  'Nightlife - Bund Bar Crawl': 'shanghai nightlife bar street neon lights bund night crowd walking',
  'Nightlife - M1NT': 'high end nightclub dance floor vip exclusive club luxury party lights',
  'Nightlife - Huangpu River Cruise': 'shanghai huangpu river night cruise illuminated skyline boat lights',
  'Nightlife - The Odd Couple': 'retro 80s cocktail bar neon lights arcade vintage interior lounge',
  'Nightlife - Arkham': 'underground live music concert venue stage lights band performing crowd',
  'Nightlife - Lost Heaven': 'yunnan restaurant lantern courtyard atmospheric dining asian decor',
  'Shopping - Nanjing Road East': 'nanjing road shanghai pedestrian shopping street neon signs retail',
  'Shopping - South Bund Fabric Market': 'fabric market tailor shop textiles colorful cloth rolls sewing',
  'Shopping - Huaihai Road': 'huaihai road shanghai luxury shopping street upscale brands boutique',
  'Shopping - Tianzifang': 'tianzifang shanghai narrow alley craft shops boutiques handmade artisan',
  'Shopping - AP Plaza': 'underground market bags watches shopping stalls bargain fake goods',
  'Shopping - IFC Mall': 'ifc mall shanghai pudong luxury shopping modern mall interior high end retail',
  'Day Trip - Suzhou': 'suzhou classical chinese garden unesco water canal stone bridge ancient',
  'Day Trip - Hangzhou': 'hangzhou west lake misty mountains pagoda reflection tea plantation china',
  'Day Trip - Zhujiajiao': 'zhujiajiao water town stone bridge canal boats ancient town china',
  'Day Trip - Nanjing': 'nanjing ancient city wall china imperial capital historical landmark',
  'Day Trip - Moganshan': 'moganshan bamboo forest mountain misty green hills nature retreat china',
  'Day Trip - Wuzhen': 'wuzhen water town lantern night canal reflection ancient bridge china',
  'Kids - Disneyland': 'shanghai disneyland parade characters family fun theme park kids castle',
  'Kids - Ocean Aquarium': 'underwater tunnel aquarium shark ray fish glass walkway ocean marine',
  'Kids - Natural History Museum': 'dinosaur skeleton natural history museum exhibit fossil children',
  'Kids - Century Park': 'century park shanghai green lawn lake boating picnic trees flowers',
  'Kids - Shanghai Zoo': 'giant panda bamboo forest chinese zoo animal wildlife cute bear',
  'Kids - Science Museum': 'science technology museum interactive exhibit children robot hands-on',
  'Kids - Bund Tunnel': 'psychedelic light tunnel colorful abstract lights futuristic neon ride',
  'Kids - Circus World': 'chinese acrobatics circus performance aerial act stage show entertainment',
  'Guide - The Bund': 'shanghai bund travel tourist walking waterfront cityscape landmark view',
  'Guide - Shanghai Metro': 'shanghai metro subway station modern train platform underground transit',
  'Guide - Yu Garden': 'yu garden shanghai classical pavilion architecture detail ancient chinese',
  'Guide - Food Dictionary': 'chinese food variety dishes cuisine spread table feast asian dinner',
  'Guide - Pudong vs Puxi': 'shanghai skyline pudong puxi split huangpu river contrast city lights',
  'Guide - Shanghai on a Budget': 'budget travel street food local market cheap eats money travel',
  'Blog - Shanghai Summer': 'shanghai summer heat humid city hot weather tropical sun people',
  'Blog - Cherry Blossoms': 'cherry blossom sakura tree pink petals spring park bloom flower',
  'Blog - Rooftop Bars': 'rooftop bar skyline sunset drinks terrace cocktail view city lights',
  'Blog - Shanghai Breakfast': 'chinese breakfast jianbing street food morning vendor traditional pancake',
  'Blog - Photography Tips': 'shanghai photography skyline cityscape camera travel landmark architecture',
  'Blog - Chinese New Year': 'chinese new year lantern red decoration festival traditional celebration',
};

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const loc = res.headers.location;
        httpGet(loc.startsWith('http') ? loc : new URL(url).origin + loc).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) { reject(new Error('HTTP ' + res.statusCode)); return; }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject).setTimeout(30000, function () { this.destroy(); reject(new Error('Timeout')); });
  });
}

function httpGetText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const loc = res.headers.location;
        httpGetText(loc.startsWith('http') ? loc : new URL(url).origin + loc).then(resolve).catch(reject);
        return;
      }
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(data));
    }).on('error', reject).setTimeout(15000, function () { this.destroy(); reject(new Error('Timeout')); });
  });
}

async function pexelsDownload() {
  console.log('=== Using Pexels API with search ===\n');
  const results = [];

  for (let i = 0; i < slots.length; i++) {
    const label = slots[i];
    const query = cardQueries[label];
    console.log('[' + (i + 1) + '/' + slots.length + '] ' + label);

    try {
      const searchUrl = 'https://api.pexels.com/v1/search?query=' + encodeURIComponent(query) + '&per_page=1&orientation=landscape&size=large';
      const data = JSON.parse(await httpGetText({
        ...{ url: searchUrl },
        _url: searchUrl,
      }));
      // Actually need headers for Pexels
      const searchResult = await new Promise((ok, no) => {
        https.get(searchUrl, { headers: { Authorization: API_KEY, 'User-Agent': 'Mozilla/5.0' } }, (res) => {
          let d = '';
          res.on('data', c => d += c);
          res.on('end', () => { try { ok(JSON.parse(d)); } catch (e) { no(e); } });
        }).on('error', no).setTimeout(15000, function () { this.destroy(); no(new Error('Timeout')); });
      });

      if (searchResult.photos && searchResult.photos.length > 0) {
        const photo = searchResult.photos[0];
        const imgUrl = photo.src.large2x || photo.src.large || photo.src.original;
        const buf = await httpGet(imgUrl);
        if (buf.length < 2000) throw new Error('Too small');
        const id = 'px-' + photo.id;
        const out = resolve(imagesDir, id + '.webp');
        await sharp(buf).webp({ quality: 82 }).toFile(out);
        results.push({ label, path: '/images/' + id + '.webp', id, photographer: photo.photographer, pexelsUrl: photo.url });
        console.log('  -> ' + id + '.webp (' + (buf.length / 1024).toFixed(0) + ' KB) by ' + photo.photographer);
      } else {
        console.error('  No results');
      }
    } catch (e) {
      console.error('  FAILED: ' + (e.message || '').slice(0, 80));
    }
    if (i < slots.length - 1) await new Promise((r) => setTimeout(r, 1200));
  }

  return results;
}

async function picsumDownload() {
  console.log('=== Using Picsum with Unsplash page title matching ===\n');
  console.log('Step 1: Fetching Picsum image list...');
  let allPhotos = [];
  for (let page = 1; page <= 3; page++) {
    const data = JSON.parse(await httpGetText('https://picsum.photos/v2/list?page=' + page + '&limit=100'));
    allPhotos = allPhotos.concat(data);
  }
  console.log('Got ' + allPhotos.length + ' total images.\n');

  console.log('Step 2: Reading Unsplash page titles for matching...');
  const photoTitles = [];

  for (let i = 0; i < allPhotos.length; i++) {
    try {
      const html = await httpGetText(allPhotos[i].url);
      const titleMatch = html.match(/<title>([^<]+)<\/title>/);
      let title = titleMatch ? titleMatch[1].replace(/&#x27;/g, "'").replace(/&amp;/g, '&').toLowerCase() : '';
      // Also check meta description
      const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
      const desc = descMatch ? descMatch[1].toLowerCase() : '';
      const fullText = title + ' ' + desc;
      photoTitles.push({ ...allPhotos[i], fullText });
      if (i % 30 === 0) process.stdout.write('.');
    } catch (e) {
      photoTitles.push({ ...allPhotos[i], fullText: '' });
    }
  }
  console.log('\nRead titles for ' + photoTitles.filter(p => p.fullText).length + ' images.\n');

  console.log('Step 3: Matching images to cards by keyword...');
  const results = [];
  const usedPhotoIds = new Set();

  for (let i = 0; i < slots.length; i++) {
    const label = slots[i];
    const query = cardQueries[label];
    const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 3);

    let bestPhoto = null;
    let bestScore = 0;

    for (const p of photoTitles) {
      if (usedPhotoIds.has(p.id)) continue;
      if (!p.fullText) continue;
      let score = 0;
      for (const kw of keywords) {
        if (p.fullText.includes(kw)) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        bestPhoto = p;
      }
    }

    if (!bestPhoto || bestScore === 0) {
      // No match found, pick next unused
      for (const p of photoTitles) {
        if (!usedPhotoIds.has(p.id)) { bestPhoto = p; break; }
      }
    }

    if (!bestPhoto) {
      console.error('[' + (i + 1) + '] ' + label + ' - NO IMAGE AVAILABLE');
      continue;
    }

    usedPhotoIds.add(bestPhoto.id);
    const downloadUrl = 'https://picsum.photos/id/' + bestPhoto.id + '/1200/800';
    console.log('[' + (i + 1) + '/' + slots.length + '] ' + label + ' (score=' + bestScore + ')');

    try {
      const buf = await httpGet(downloadUrl);
      if (buf.length < 2000) throw new Error('Too small');
      const id = 'ps-' + bestPhoto.id;
      const out = resolve(imagesDir, id + '.webp');
      await sharp(buf).webp({ quality: 82 }).toFile(out);
      results.push({ label, path: '/images/' + id + '.webp', id, picsumId: bestPhoto.id, matchScore: bestScore });
      console.log('  -> ' + id + '.webp (' + (buf.length / 1024).toFixed(0) + ' KB)');
    } catch (e) {
      console.error('  FAILED: ' + (e.message || '').slice(0, 80));
    }
    if (i < slots.length - 1) await new Promise((r) => setTimeout(r, 2000));
  }

  return results;
}

async function main() {
  let results;

  if (API_KEY) {
    results = await pexelsDownload();
  } else {
    console.log('No PEXELS_API_KEY set. Falling back to Picsum with Unsplash title matching.\n');
    console.log('For best results with theme-matched images:');
    console.log('  1. Sign up at https://www.pexels.com/api/ (free, 2 min)');
    console.log('  2. Run: $env:PEXELS_API_KEY="your-key"; node scripts/download-all-images.mjs\n');
    results = await picsumDownload();
  }

  fs.writeFileSync(resolve(rootDir, 'scripts', 'dl-all-results.json'), JSON.stringify(results, null, 2), 'utf8');
  console.log('\nDone! ' + results.length + '/' + slots.length + ' downloaded.');
  console.log('Results saved to scripts/dl-all-results.json');
}

main().catch((e) => { console.error(e); process.exit(1); });
