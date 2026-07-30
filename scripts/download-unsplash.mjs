/**
 * 下载 Unsplash 图片到 public/images，覆盖旧文件
 */
import fs from 'fs';
import https from 'https';
import sharp from 'sharp';
import { resolve } from 'path';

const rootDir = resolve(import.meta.dirname, '..');
const imagesDir = resolve(rootDir, 'public', 'images');
const manifestFile = resolve(rootDir, 'scripts', 'unsplash-photos.json');

// 缺失图片的备用搜索词 (使用 Unsplash 直接 URL)
const fallbacks = [
  { file:'picsum-5-2f7b.webp',  query:'tree-lined-street-shanghai-cafe-french-concession' },
  { file:'picsum-10-2reh.webp', query:'plane-tree-street-china-old-lane-houses' },
  { file:'picsum-15-33mb.webp', query:'chinese-dumpling-pan-fried-crispy-bottom-sesame' },
  { file:'picsum-17-38k2.webp', query:'chinese-braised-pork-belly-red-sauce-cuisine' },
  { file:'picsum-26-3ugd.webp', query:'lantern-lit-asian-courtyard-restaurant-atmosphere' },
  { file:'picsum-33-4bkl.webp', query:'chinese-classical-garden-water-pavilion-unesco' },
  { file:'picsum-37-4l9j.webp', query:'bamboo-mountain-forest-mist-hiking-nature' },
  { file:'picsum-40-4sj7.webp', query:'shark-underwater-glass-tunnel-marine-aquarium' },
  { file:'picsum-42-4xdo.webp', query:'green-park-lake-boating-city-shanghai' },
  { file:'picsum-46-574z.webp', query:'aerial-silk-acrobat-performance-stage-circus' },
  { file:'picsum-55-5tfg.webp', query:'cocktail-bar-terrace-sunset-view-drinks-rooftop' },
  { file:'picsum-56-5w0l.webp', query:'chinese-morning-food-crepe-egg-vendor-street-jianbing' },
];

function httpGetBuffer(url, retries = 3) {
  return new Promise((resolve, reject) => {
    const doRequest = (currentUrl, attempt) => {
      const lib = currentUrl.startsWith('https') ? https : require('http');
      lib.get(currentUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 20000,
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const loc = res.headers.location;
          const nextUrl = loc.startsWith('http') ? loc : new URL(currentUrl).origin + loc;
          res.resume();
          doRequest(nextUrl, attempt);
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          if (attempt < retries) {
            setTimeout(() => doRequest(currentUrl, attempt + 1), 3000);
            return;
          }
          reject(new Error('HTTP ' + res.statusCode));
          return;
        }
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      }).on('error', (e) => {
        if (attempt < retries) {
          setTimeout(() => doRequest(currentUrl, attempt + 1), 3000);
          return;
        }
        reject(e);
      }).on('timeout', function() { this.destroy(); reject(new Error('Timeout')); });
    };
    doRequest(url, 0);
  });
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  console.log('从 Unsplash manifest 加载 ' + manifest.length + ' 张图片');
  
  let success = 0, fail = 0;
  const total = manifest.length + fallbacks.length;

  // Part 1: 下载 manifest 中的图片
  console.log('\n--- 下载 Unsplash 精选图片 ---');
  for (let i = 0; i < manifest.length; i++) {
    const m = manifest[i];
    const outPath = resolve(imagesDir, m.file);
    process.stdout.write(`[${i+1}/${total}] ${m.label}: `);
    try {
      const buf = await httpGetBuffer(m.dlUrl);
      const webpBuf = await sharp(buf)
        .resize(1200, 800, { fit: 'cover', position: 'centre' })
        .webp({ quality: 82 })
        .toBuffer();
      fs.writeFileSync(outPath, webpBuf);
      console.log(`✓ (${(webpBuf.length/1024).toFixed(0)}KB) [${m.photoId}]`);
      success++;
    } catch (e) {
      console.log(`✗ ${e.message?.slice(0,60)}`);
      fail++;
    }
    await sleep(800);
  }

  // Part 2: 备用搜索下载缺失的图片
  console.log('\n--- 下载备用图片 (fallback search) ---');
  for (let i = 0; i < fallbacks.length; i++) {
    const fb = fallbacks[i];
    const idx = manifest.length + i + 1;
    const outPath = resolve(imagesDir, fb.file);
    // 使用 loremflickr 作为备用
    const r = Date.now().toString(36) + Math.random().toString(36).slice(2,6);
    const url = 'https://loremflickr.com/1200/800/' + fb.query + '?random=' + r;
    process.stdout.write(`[${idx}/${total}] ${fb.file} (备用): `);
    try {
      const buf = await httpGetBuffer(url);
      if (buf.length < 3000) throw new Error('图片太小');
      const webpBuf = await sharp(buf)
        .resize(1200, 800, { fit: 'cover', position: 'centre' })
        .webp({ quality: 82 })
        .toBuffer();
      fs.writeFileSync(outPath, webpBuf);
      console.log(`✓ (${(webpBuf.length/1024).toFixed(0)}KB)`);
      success++;
    } catch (e) {
      console.log(`✗ ${e.message?.slice(0,60)}`);
      fail++;
    }
    await sleep(1500);
  }

  console.log('\n========================================');
  console.log(`完成! 成功: ${success}, 失败: ${fail}/${total}`);
  console.log('========================================');
}

main().catch(e => { console.error(e); process.exit(1); });
