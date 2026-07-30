import fs from 'fs';
import https from 'https';
import sharp from 'sharp';
import { resolve } from 'path';

const rootDir = resolve(import.meta.dirname, '..');
const imagesDir = resolve(rootDir, 'public', 'images');

const cardKeywords = [
  ['Index Hero Banner - Bund Skyline', ['shanghai','bund','skyline','cityscape','river','pudong','lujiazui','waterfront','skyscraper','panorama']],
  ['Top Pick 01 - Walk the Bund', ['bund','waterfront','colonial','architecture','promenade','riverside','shanghai']],
  ['Top Pick 02 - Shanghai Tower', ['skyscraper','tower','tallest','building','modern','architecture','shanghai tower']],
  ['Top Pick 03 - Yu Garden', ['garden','chinese','classical','traditional','pavilion','koi','pond','ming','yu garden']],
  ['Top Pick 04 - Xiaolongbao', ['dumpling','food','steamed','xiaolongbao','chinese food','dim sum','bamboo','basket']],
  ['Top Pick 05 - French Concession', ['street','lane','trees','plane tree','cafe','neighborhood','art deco','concession']],
  ['Attraction - The Bund', ['bund','waterfront','colonial','architecture','promenade','landmark','shanghai']],
  ['Attraction - Shanghai Tower', ['skyscraper','tower','tall','building','modern','architecture','shanghai tower','observation']],
  ['Attraction - Yu Garden', ['garden','chinese','classical','traditional','pavilion','rockery','pond']],
  ['Attraction - Disneyland', ['disney','castle','theme park','disneyland','magic','fairytale','amusement']],
  ['Attraction - French Concession', ['street','lane','trees','plane tree','cafe','neighborhood','french','concession']],
  ['Attraction - Shanghai Museum', ['museum','art','gallery','ancient','bronze','ceramics','exhibit','china']],
  ['Attraction - Jingan Temple', ['temple','buddhist','golden','architecture','religion','incense','jingan']],
  ['Attraction - Tianzifang', ['alley','lane','market','crafts','art','shop','narrow','traditional','shikumen']],
  ['Food - Xiaolongbao Soup Dumplings', ['dumpling','food','xiaolongbao','steamed','soup','bamboo','steamer','dim sum']],
  ['Food - Shengjianbao', ['dumpling','fried','pork','pan-fried','sesame','scallion','crispy','shengjianbao']],
  ['Food - Hairy Crab', ['crab','seafood','steamed','autumn','delicacy','chinese food','crustacean']],
  ['Food - Hongshao Rou', ['pork','braised','soy sauce','meat','chinese cuisine','hongshao','glazed']],
  ['Food - Cong You Bing', ['pancake','scallion','flatbread','crispy','street food','chinese','griddle']],
  ['Nightlife - Flair Rooftop', ['rooftop','bar','cocktail','skyline','city view','night','luxury','high floor']],
  ['Nightlife - Speak Low', ['speakeasy','bar','hidden','bookshelf','cocktail','secret','dim']],
  ['Nightlife - Bund Bar Crawl', ['bar','nightlife','neon','street','bund','night','crowd','pub']],
  ['Nightlife - M1NT', ['nightclub','club','dance','exclusive','vip','luxury','party']],
  ['Nightlife - Huangpu River Cruise', ['river','cruise','boat','night','illuminated','skyline','huangpu','lights']],
  ['Nightlife - The Odd Couple', ['bar','retro','cocktail','80s','neon','arcade','vintage']],
  ['Nightlife - Arkham', ['concert','music','live','band','stage','underground','venue']],
  ['Nightlife - Lost Heaven', ['restaurant','yunnan','lantern','courtyard','atmospheric','dining','asian']],
  ['Shopping - Nanjing Road East', ['shopping','street','retail','neon','pedestrian','commercial','signs']],
  ['Shopping - South Bund Fabric Market', ['fabric','market','textile','tailor','cloth','colorful','bargain']],
  ['Shopping - Huaihai Road', ['shopping','street','luxury','brands','upscale','boutique']],
  ['Shopping - Tianzifang', ['alley','market','crafts','art','boutique','handmade','shop']],
  ['Shopping - AP Plaza', ['market','underground','bargain','stalls','fake','shopping']],
  ['Shopping - IFC Mall', ['mall','luxury','shopping','interior','modern','high-end','retail']],
  ['Day Trip - Suzhou', ['garden','canal','classical','bridge','water','suzhou','ancient','china']],
  ['Day Trip - Hangzhou', ['lake','west lake','misty','pagoda','mountains','reflection','tea','hangzhou']],
  ['Day Trip - Zhujiajiao', ['water town','canal','bridge','boat','ancient','stone','zhujiajiao']],
  ['Day Trip - Nanjing', ['city wall','ancient','imperial','capital','historical','nanjing','landmark']],
  ['Day Trip - Moganshan', ['bamboo','forest','mountain','misty','green','hills','nature','moganshan']],
  ['Day Trip - Wuzhen', ['water town','lantern','canal','night','bridge','ancient','wuzhen']],
  ['Kids - Disneyland', ['disney','castle','parade','characters','family','theme park','kids','magic']],
  ['Kids - Ocean Aquarium', ['aquarium','fish','shark','ray','underwater','ocean','tunnel','marine']],
  ['Kids - Natural History Museum', ['dinosaur','skeleton','fossil','museum','natural history','exhibit','children']],
  ['Kids - Century Park', ['park','lawn','lake','boating','picnic','green','trees','flowers']],
  ['Kids - Shanghai Zoo', ['panda','giant panda','zoo','animal','wildlife','bamboo']],
  ['Kids - Science Museum', ['science','museum','technology','interactive','robot','exhibit','children']],
  ['Kids - Bund Tunnel', ['tunnel','light','colorful','psychedelic','abstract','ride','neon']],
  ['Kids - Circus World', ['circus','acrobatics','performance','aerial','stage','show','entertainment']],
  ['Guide - The Bund', ['bund','cityscape','waterfront','landmark','shanghai','skyline']],
  ['Guide - Shanghai Metro', ['metro','subway','station','train','platform','underground','transit']],
  ['Guide - Yu Garden', ['garden','classical','chinese','pavilion','architecture','detail']],
  ['Guide - Food Dictionary', ['food','cuisine','dishes','variety','spread','table','chinese']],
  ['Guide - Pudong vs Puxi', ['skyline','city','river','pudong','puxi','contrast','split']],
  ['Guide - Shanghai on a Budget', ['street food','market','budget','cheap','local','travel','money']],
  ['Blog - Shanghai Summer', ['summer','heat','city','hot','weather','tropical','sun']],
  ['Blog - Cherry Blossoms', ['cherry blossom','sakura','pink','petals','spring','bloom','flower','tree']],
  ['Blog - Rooftop Bars', ['rooftop','bar','cocktail','sunset','skyline','terrace','view']],
  ['Blog - Shanghai Breakfast', ['breakfast','jianbing','street food','morning','vendor','traditional']],
  ['Blog - Photography Tips', ['photography','camera','skyline','cityscape','travel','landmark','photo']],
  ['Blog - Chinese New Year', ['lantern','red','festival','celebration','traditional','chinese new year']],
];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error')); }
      });
    }).on('error', reject).setTimeout(15000, function () { this.destroy(); reject(new Error('Timeout')); });
  });
}

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : require('http');
    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const loc = res.headers.location;
        downloadImage(loc.startsWith('http') ? loc : 'https://' + new URL(url).host + loc)
          .then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) { reject(new Error('HTTP ' + res.statusCode)); return; }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function main() {
  console.log('Fetching full Picsum image list...\n');
  const photos = await fetchJson('https://picsum.photos/v2/list?limit=300');
  console.log('Got ' + photos.length + ' images.\n');

  // For this approach, we download images and use their Picsum IDs
  // Since we can't get image descriptions, we assign based on diversity
  // Each card gets a unique Picsum image
  
  console.log('Since image content metadata is unavailable from Picsum,\n');
  console.log('we must use an external API with search capability.\n');
  console.log('This script will download images via Picsum which serves as\n');
  console.log('a proxy for Unsplash. Each card gets a unique image from the pool.\n');
  console.log('For truly theme-matched images, a Pexels API key is needed.\n');
  
  // Try to determine what we have
  console.log('Sample Picsum image URLs (Unsplash links):');
  photos.slice(0, 5).forEach(p => {
    console.log('  ID=' + p.id + ' -> ' + p.url);
  });

  // Let's try to get metadata from Unsplash page for a few images
  console.log('\nAttempting to read Unsplash page titles...');
  
  async function getPageTitle(url) {
    try {
      const html = await new Promise((ok, no) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
          let d = '';
          res.on('data', c => d += c);
          res.on('end', () => ok(d));
        }).on('error', no).setTimeout(5000, function () { this.destroy(); no('timeout'); });
      });
      const match = html.match(/<title>([^<]+)<\/title>/);
      return match ? match[1].replace(/&#x27;/g, "'").replace(/&amp;/g, '&') : '(no title)';
    } catch (e) {
      return '(error: ' + e.message + ')';
    }
  }

  let matched = 0;
  for (let i = 0; i < Math.min(10, photos.length); i++) {
    const title = await getPageTitle(photos[i].url);
    console.log('  [' + photos[i].id + '] ' + title.slice(0, 80));
  }

  console.log('\n---');
  console.log('The approach requires matching Unsplash photo titles to card keywords.');
  console.log('Let us proceed with downloading matched images using Picsum CDN.');
}

main().catch((e) => { console.error(e); process.exit(1); });
