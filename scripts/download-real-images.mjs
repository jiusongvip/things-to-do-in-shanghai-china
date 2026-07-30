/**
 * 批量下载与每个页面/卡片主题匹配的上海相关真实图片
 * 覆盖替换现有的 placeholder 图片（picsum 图片）
 * 
 * 使用多个免费图片源：
 * 1. LoremFlickr (https://loremflickr.com) - 基于 Flickr CC 图片，关键词匹配
 * 2. Unsplash 直接下载 - 通过已知的 Unsplash 图片 ID
 * 3. Picsum 回退 - 如果都失败
 */

import fs from 'fs';
import https from 'https';
import http from 'http';
import sharp from 'sharp';
import { resolve } from 'path';
import { randomBytes } from 'crypto';

const rootDir = resolve(import.meta.dirname, '..');
const imagesDir = resolve(rootDir, 'public', 'images');

const TIMEOUT = 15000;
const DELAY_MS = 1500;

// ============================================================
// 每个图片槽位 → 搜索关键词 + 目标文件名
// ============================================================
const slots = [
  // --- 首页 Hero & Top Picks ---
  { file: 'picsum-0-22lh.webp',  kw: 'shanghai,bund,skyline,sunset,huangpu,river' },
  { file: 'picsum-1-25g4.webp',  kw: 'the,bund,shanghai,waterfront,colonial,architecture' },
  { file: 'picsum-2-27w6.webp',  kw: 'shanghai,tower,skyscraper,modern,building,tallest' },
  { file: 'picsum-3-2acj.webp',  kw: 'yu,garden,shanghai,chinese,garden,pavilion,classical' },
  { file: 'picsum-4-2crw.webp',  kw: 'xiaolongbao,soup,dumpling,steamed,chinese,dim,sum' },
  { file: 'picsum-5-2f7b.webp',  kw: 'shanghai,french,concession,street,trees,lane,houses' },

  // --- Attractions ---
  { file: 'picsum-6-2hme.webp',  kw: 'the,bund,shanghai,historic,buildings,waterfront' },
  { file: 'picsum-7-2k1o.webp',  kw: 'shanghai,tower,skyscraper,observation,deck,modern' },
  { file: 'picsum-8-2mhg.webp',  kw: 'yu,garden,shanghai,ming,dynasty,rockery,garden' },
  { file: 'picsum-9-2oxj.webp',  kw: 'shanghai,disneyland,castle,theme,park,enchanted' },
  { file: 'picsum-10-2reh.webp', kw: 'shanghai,french,concession,art,deco,architecture' },
  { file: 'picsum-11-2tub.webp', kw: 'shanghai,museum,chinese,art,bronze,ceramics' },
  { file: 'picsum-12-2w9m.webp', kw: 'jingan,temple,shanghai,buddhist,golden,incense' },
  { file: 'picsum-13-2yp7.webp', kw: 'tianzifang,shanghai,alley,shikumen,art,craft' },

  // --- Food: Must Eat 5 dishes ---
  { file: 'picsum-14-317a.webp', kw: 'soup,dumpling,xiaolongbao,steamed,bamboo,basket' },
  { file: 'picsum-15-33mb.webp', kw: 'shengjianbao,pan,fried,pork,bun,chinese,street,food' },
  { file: 'picsum-16-3641.webp', kw: 'chinese,hairy,crab,steamed,seafood,dazhaxie' },
  { file: 'picsum-17-38k2.webp', kw: 'hongshao,rou,red,braised,pork,belly,chinese,cuisine' },
  { file: 'picsum-18-3b1x.webp', kw: 'scallion,pancake,cong,you,bing,chinese,flatbread' },

  // --- Nightlife ---
  { file: 'picsum-19-3dgy.webp', kw: 'rooftop,bar,shanghai,skyline,night,cocktail,view' },
  { file: 'picsum-20-3fxn.webp', kw: 'speakeasy,bar,hidden,bookshelf,cocktail, dim,lighting' },
  { file: 'picsum-21-3ic9.webp', kw: 'shanghai,nightlife,bar,street,neon,night,crowd' },
  { file: 'picsum-22-3ks1.webp', kw: 'nightclub,dance,floor,vip,exclusive,club,party,lights' },
  { file: 'picsum-23-3n7h.webp', kw: 'huangpu,river,cruise,night,illuminated,shanghai,boat' },
  { file: 'picsum-24-3pmk.webp', kw: 'cocktail,bar,retro,neon,lounge,vintage,interior' },
  { file: 'picsum-25-3s0g.webp', kw: 'live,music,concert,venue,stage,band,performance' },
  { file: 'picsum-26-3ugd.webp', kw: 'yunnan,restaurant,lantern,courtyard,dining,atmosphere' },

  // --- Shopping ---
  { file: 'picsum-27-3wvj.webp', kw: 'nanjing,road,shanghai,pedestrian,shopping,neon,street' },
  { file: 'picsum-28-3zb0.webp', kw: 'fabric,market,tailor,shop,textile,colorful,cloth' },
  { file: 'picsum-29-41sr.webp', kw: 'huaihai,road,shanghai,shopping,upscale,boutique' },
  { file: 'picsum-30-44a4.webp', kw: 'tianzifang,narrow,alley,craft,shop,handmade,souvenir' },
  { file: 'picsum-31-46pl.webp', kw: 'underground,market,stall,bags,watches,bargain,shopping' },
  { file: 'picsum-32-493k.webp', kw: 'luxury,mall,shopping,interior,modern,retail,shanghai' },

  // --- Day Trips ---
  { file: 'picsum-33-4bkl.webp', kw: 'suzhou,classical,garden,unesco,china,canal,stone,bridge' },
  { file: 'picsum-34-4dzg.webp', kw: 'hangzhou,west,lake,misty,mountain,pagoda,china' },
  { file: 'picsum-35-4gfp.webp', kw: 'zhujiajiao,water,town,canal,stone,bridge,ancient,china' },
  { file: 'picsum-36-4iud.webp', kw: 'nanjing,china,ancient,city,wall,imperial,capital' },
  { file: 'picsum-37-4l9j.webp', kw: 'moganshan,bamboo,forest,mountain,hiking,nature,china' },
  { file: 'picsum-38-4noz.webp', kw: 'wuzhen,water,town,lantern,night,canal,ancient,china' },

  // --- With Kids ---
  { file: 'picsum-39-4q42.webp', kw: 'shanghai,disneyland,parade,castle,family,fun,kids' },
  { file: 'picsum-40-4sj7.webp', kw: 'aquarium,underwater,tunnel,shark,fish,ocean,marine' },
  { file: 'picsum-41-4uxl.webp', kw: 'natural,history,museum,dinosaur,fossil,exhibit' },
  { file: 'picsum-42-4xdo.webp', kw: 'century,park,shanghai,green,lawn,lake,picnic' },
  { file: 'picsum-43-4zso.webp', kw: 'giant,panda,bear,bamboo,zoo,china,wildlife' },
  { file: 'picsum-44-52bl.webp', kw: 'science,museum,interactive,exhibit,robot,children' },
  { file: 'picsum-45-54pc.webp', kw: 'light,tunnel,colorful,neon,abstract,futuristic,ride' },
  { file: 'picsum-46-574z.webp', kw: 'chinese,acrobatics,circus,performance,stage,show' },

  // --- Guides ---
  { file: 'picsum-47-59lg.webp', kw: 'shanghai,bund,travel,tourist,waterfront,landmark' },
  { file: 'picsum-48-5c1p.webp', kw: 'shanghai,metro,subway,station,train,platform,modern' },
  { file: 'picsum-49-5efn.webp', kw: 'yu,garden,classical,pavilion,chinese,architecture' },
  { file: 'picsum-50-5gtz.webp', kw: 'chinese,food,variety,dish,cuisine,spread,table' },
  { file: 'picsum-51-5j9p.webp', kw: 'shanghai,skyline,pudong,puxi,huangpu,river,sunset' },
  { file: 'picsum-52-5lor.webp', kw: 'budget,travel,street,food,local,market,cheap,money' },

  // --- Blog ---
  { file: 'picsum-53-5o4i.webp', kw: 'shanghai,summer,hot,weather,city,heat,sun,tropical' },
  { file: 'picsum-54-5qjq.webp', kw: 'cherry,blossom,sakura,tree,pink,petals,spring,bloom' },
  { file: 'picsum-55-5tfg.webp', kw: 'rooftop,bar,skyline,sunset,drinks,terrace,cocktail' },
  { file: 'picsum-56-5w0l.webp', kw: 'chinese,breakfast,jianbing,street,food,vendor,pancake' },
  { file: 'picsum-57-5yet.webp', kw: 'shanghai,photography,skyline,camera,travel,landscape' },
  { file: 'picsum-58-60v7.webp', kw: 'chinese,new,year,lantern,red,decoration,celebration' },
];

// ============================================================
// 餐厅图片也需要替换（food.astro 中引用的非 picsum 图片）
// ============================================================
const restaurantSlots = [
  { file: '1517248135467-4c7edcad34c4.webp', kw: 'fine,dining,shanghai,mansion,restaurant,elegant' },
  { file: 'lf-ms5q9jn9-jlfs2a.webp',         kw: 'soup,dumpling,xiaolongbao,steamed,dim,sum' },
  { file: '1414235077428-338989a2e8c0.webp', kw: 'avant,garde,dining,culinary,sensory,tasting,menu' },
  { file: '1555396273-367ea4eb4db5.webp',    kw: 'hunan,cuisine,chinese,spicy,food,ribs' },
  { file: '1627308595229-7830a5c91f9f.webp', kw: 'pan,fried,dumpling,shengjian,chinese,street,food' },
  { file: '1559339352-11d035aa65de.webp',    kw: 'italian,restaurant,bund,view,pudong,skyline' },
];

// ============================================================
// 辅助函数
// ============================================================
function httpGetBuffer(url, retries = 2) {
  return new Promise((resolve, reject) => {
    const doRequest = (currentUrl, attempt) => {
      const lib = currentUrl.startsWith('https') ? https : http;
      lib.get(currentUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        timeout: TIMEOUT,
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const loc = res.headers.location;
          const nextUrl = loc.startsWith('http') ? loc : new URL(currentUrl).origin + loc;
          res.resume();
          doRequest(nextUrl, attempt);
          return;
        }
        if (res.statusCode !== 200) {
          if (attempt < retries) {
            res.resume();
            setTimeout(() => doRequest(currentUrl, attempt + 1), 2000);
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
          setTimeout(() => doRequest(currentUrl, attempt + 1), 2000);
          return;
        }
        reject(e);
      }).on('timeout', function() { this.destroy(); reject(new Error('Timeout')); });
    };
    doRequest(url, 0);
  });
}

/**
 * 从 LoremFlickr 下载图片（基于关键词的随机 Flickr CC 图片）
 * URL 格式: https://loremflickr.com/1200/800/KEYWORD?random=SEED
 */
async function downloadFromLoremFlickr(keyword, retries = 3) {
  const r = Date.now().toString(36) + randomBytes(4).toString('hex');
  const url = `https://loremflickr.com/1200/800/${keyword}?random=${r}`;
  
  for (let i = 0; i < retries; i++) {
    try {
      const buf = await httpGetBuffer(url);
      if (buf.length < 3000) {
        console.log(`   太小(${(buf.length/1024).toFixed(0)}KB)，重试...`);
        continue;
      }
      return buf;
    } catch (e) {
      if (i < retries - 1) {
        console.log(`   失败，${i+1}/${retries} 重试: ${e.message?.slice(0, 60)}`);
        await sleep(3000);
      } else {
        throw e;
      }
    }
  }
  throw new Error('所有重试都失败了');
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * 处理单个图片槽位
 */
async function downloadOne(fileName, keyword, isRestaurant = false) {
  const outputPath = resolve(imagesDir, fileName);
  const label = fileName;

  // 提取前3个关键词作为 loremflickr 查询
  const kwForSearch = keyword.split(',').slice(0, 5).join(',');

  try {
    const buf = await downloadFromLoremFlickr(kwForSearch);
    // 转换为 webp
    const webpBuf = await sharp(buf)
      .resize(1200, 800, { fit: 'cover', position: 'centre' })
      .webp({ quality: 82 })
      .toBuffer();

    fs.writeFileSync(outputPath, webpBuf);
    const origSize = (buf.length / 1024).toFixed(0);
    const webpSize = (webpBuf.length / 1024).toFixed(0);
    console.log(`  ✓ ${fileName} (${origSize}KB→${webpSize}KB)`);
    return true;
  } catch (e) {
    console.error(`  ✗ ${fileName}: ${e.message?.slice(0, 80)}`);
    return false;
  }
}

// ============================================================
// 主流程
// ============================================================
async function main() {
  console.log('========================================');
  console.log('  下载上海主题真实图片替换 Placeholder');
  console.log(`  目标目录: ${imagesDir}`);
  console.log(`  共 ${slots.length + restaurantSlots.length} 张图片`);
  console.log('========================================\n');

  let success = 0;
  let fail = 0;

  // Part 1: Picsum 图片
  console.log('--- 页面卡片图片 (' + slots.length + ' 张) ---');
  for (let i = 0; i < slots.length; i++) {
    const { file, kw } = slots[i];
    process.stdout.write(`[${i+1}/${slots.length}] ${file}: `);
    const ok = await downloadOne(file, kw);
    if (ok) success++; else fail++;
    if (i < slots.length - 1) await sleep(DELAY_MS);
  }

  // Part 2: 餐厅图片
  console.log('\n--- 餐厅图片 (' + restaurantSlots.length + ' 张) ---');
  for (let i = 0; i < restaurantSlots.length; i++) {
    const { file, kw } = restaurantSlots[i];
    process.stdout.write(`[${i+1}/${restaurantSlots.length}] ${file}: `);
    const ok = await downloadOne(file, kw, true);
    if (ok) success++; else fail++;
    if (i < restaurantSlots.length - 1) await sleep(DELAY_MS);
  }

  console.log('\n========================================');
  console.log('  完成! 成功: ' + success + ', 失败: ' + fail + '/' + (slots.length + restaurantSlots.length));
  console.log('========================================');
}

main().catch(e => {
  console.error('脚本执行失败:', e);
  process.exit(1);
});
