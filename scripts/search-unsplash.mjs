/**
 * 使用 Playwright 为每个页面/卡片在 Unsplash 上精准搜索匹配主题的图片
 * 确保不重复使用同一张图片
 */
import { chromium } from 'playwright';
import fs from 'fs';
import { resolve } from 'path';

const rootDir = resolve(import.meta.dirname, '..');
const outFile = resolve(rootDir, 'scripts', 'unsplash-photos.json');

// ============================================================
// 每个页面/卡片 → 输出文件名 + Unsplash 搜索词
// ============================================================
const targets = [
  // === 首页 Hero & Top Picks ===
  { file:'picsum-0-22lh.webp',  query:'shanghai pudong skyline dusk sunset', label:'Hero - Pudong Skyline Dusk' },
  { file:'picsum-1-25g4.webp',  query:'the bund shanghai waterfront historical buildings', label:'Top1 - Walk the Bund' },
  { file:'picsum-2-27w6.webp',  query:'shanghai tower skyscraper tall building', label:'Top2 - Shanghai Tower' },
  { file:'picsum-3-2acj.webp',  query:'yu garden shanghai classical chinese pavilion koi', label:'Top3 - Yu Garden' },
  { file:'picsum-4-2crw.webp',  query:'xiaolongbao soup dumpling steamed dim sum', label:'Top4 - Xiaolongbao' },
  { file:'picsum-5-2f7b.webp',  query:'shanghai french concession plane tree street cafe', label:'Top5 - French Concession' },

  // === Attractions 景点 ===
  { file:'picsum-6-2hme.webp',  query:'the bund shanghai historic buildings waterfront', label:'Attr - The Bund' },
  { file:'picsum-7-2k1o.webp',  query:'shanghai tower observation deck view city', label:'Attr - Shanghai Tower' },
  { file:'picsum-8-2mhg.webp',  query:'yu garden shanghai ming dynasty rockery', label:'Attr - Yu Garden' },
  { file:'picsum-9-2oxj.webp',  query:'shanghai disneyland enchanted castle theme park', label:'Attr - Disneyland' },
  { file:'picsum-10-2reh.webp', query:'shanghai french concession lane house wutong tree', label:'Attr - French Concession' },
  { file:'picsum-11-2tub.webp', query:'shanghai museum ancient chinese art bronze', label:'Attr - Shanghai Museum' },
  { file:'picsum-12-2w9m.webp', query:'jingan temple shanghai golden buddhist architecture', label:'Attr - Jingan Temple' },
  { file:'picsum-13-2yp7.webp', query:'tianzifang shanghai narrow alley craft shop shikumen', label:'Attr - Tianzifang' },

  // === Food 美食 ===
  { file:'picsum-14-317a.webp', query:'xiaolongbao chinese soup dumpling steamed bamboo', label:'Food - Xiaolongbao' },
  { file:'picsum-15-33mb.webp', query:'shengjianbao pan fried pork bun sesame', label:'Food - Shengjianbao' },
  { file:'picsum-16-3641.webp', query:'chinese hairy crab steamed seafood delicacy', label:'Food - Hairy Crab' },
  { file:'picsum-17-38k2.webp', query:'hongshao rou red braised pork belly chinese', label:'Food - Hongshao Rou' },
  { file:'picsum-18-3b1x.webp', query:'cong you bing chinese scallion pancake crispy', label:'Food - Cong You Bing' },

  // === Nightlife 夜生活 ===
  { file:'picsum-19-3dgy.webp', query:'shanghai rooftop bar skyline night cocktail view', label:'Night - Flair Rooftop' },
  { file:'picsum-20-3fxn.webp', query:'hidden speakeasy bar cocktail dim lighting secret', label:'Night - Speak Low' },
  { file:'picsum-21-3ic9.webp', query:'shanghai bund nightlife bar street neon lights', label:'Night - Bund Bar Crawl' },
  { file:'picsum-22-3ks1.webp', query:'luxury nightclub dance club vip exclusive party', label:'Night - M1NT' },
  { file:'picsum-23-3n7h.webp', query:'shanghai huangpu river night cruise boat illuminated', label:'Night - River Cruise' },
  { file:'picsum-24-3pmk.webp', query:'retro 80s cocktail bar neon arcade lounge vintage', label:'Night - The Odd Couple' },
  { file:'picsum-25-3s0g.webp', query:'underground live music concert venue stage band', label:'Night - Arkham' },
  { file:'picsum-26-3ugd.webp', query:'yunnan chinese restaurant lantern courtyard dining', label:'Night - Lost Heaven' },

  // === Shopping 购物 ===
  { file:'picsum-27-3wvj.webp', query:'nanjing road shanghai pedestrian shopping neon street', label:'Shop - Nanjing Road' },
  { file:'picsum-28-3zb0.webp', query:'fabric market tailor textiles colorful cloth sewing', label:'Shop - Fabric Market' },
  { file:'picsum-29-41sr.webp', query:'huaihai road shanghai luxury shopping boutique', label:'Shop - Huaihai Road' },
  { file:'picsum-30-44a4.webp', query:'tianzifang shanghai narrow alley artisan souvenir', label:'Shop - Tianzifang' },
  { file:'picsum-31-46pl.webp', query:'underground market stalls bags watches bargain fake', label:'Shop - AP Plaza' },
  { file:'picsum-32-493k.webp', query:'ifc mall shanghai pudong luxury shopping interior', label:'Shop - IFC Mall' },

  // === Day Trips 一日游 ===
  { file:'picsum-33-4bkl.webp', query:'suzhou china classical garden unesco canal bridge', label:'Trip - Suzhou' },
  { file:'picsum-34-4dzg.webp', query:'hangzhou west lake mist pagoda landscape china', label:'Trip - Hangzhou' },
  { file:'picsum-35-4gfp.webp', query:'zhujiajiao water town canal stone bridge ancient', label:'Trip - Zhujiajiao' },
  { file:'picsum-36-4iud.webp', query:'nanjing ancient city wall china historical capital', label:'Trip - Nanjing' },
  { file:'picsum-37-4l9j.webp', query:'moganshan bamboo forest mountain hiking nature china', label:'Trip - Moganshan' },
  { file:'picsum-38-4noz.webp', query:'wuzhen water town china lantern night canal ancient', label:'Trip - Wuzhen' },

  // === With Kids 亲子 ===
  { file:'picsum-39-4q42.webp', query:'shanghai disneyland parade characters castle family fun', label:'Kids - Disneyland' },
  { file:'picsum-40-4sj7.webp', query:'aquarium underwater tunnel shark fish glass walkway', label:'Kids - Ocean Aquarium' },
  { file:'picsum-41-4uxl.webp', query:'dinosaur skeleton natural history museum fossil exhibit', label:'Kids - Natural History Museum' },
  { file:'picsum-42-4xdo.webp', query:'century park shanghai green lawn lake boating picnic', label:'Kids - Century Park' },
  { file:'picsum-43-4zso.webp', query:'giant panda bear bamboo forest china cute wildlife', label:'Kids - Shanghai Zoo' },
  { file:'picsum-44-52bl.webp', query:'science technology museum interactive exhibit robot kids', label:'Kids - Science Museum' },
  { file:'picsum-45-54pc.webp', query:'psychedelic light tunnel colorful neon abstract futuristic', label:'Kids - Bund Tunnel' },
  { file:'picsum-46-574z.webp', query:'chinese acrobatics circus performance stage aerial show', label:'Kids - Circus World' },

  // === Guides 指南 ===
  { file:'picsum-47-59lg.webp', query:'shanghai bund travel tourist walking waterfront landmark', label:'Guide - The Bund' },
  { file:'picsum-48-5c1p.webp', query:'shanghai metro subway station platform train modern', label:'Guide - Metro' },
  { file:'picsum-49-5efn.webp', query:'yu garden shanghai classical pavilion architecture detail', label:'Guide - Yu Garden' },
  { file:'picsum-50-5gtz.webp', query:'chinese food variety dishes cuisine spread table feast', label:'Guide - Food Dict' },
  { file:'picsum-51-5j9p.webp', query:'shanghai skyline pudong puxi split huangpu river view', label:'Guide - Pudong vs Puxi' },
  { file:'picsum-52-5lor.webp', query:'budget travel street food cheap market money travel', label:'Guide - Budget' },

  // === Blog 博客 ===
  { file:'picsum-53-5o4i.webp', query:'shanghai summer hot weather humid city heat sun people', label:'Blog - Summer' },
  { file:'picsum-54-5qjq.webp', query:'cherry blossom sakura pink petals spring tree bloom park', label:'Blog - Cherry Blossoms' },
  { file:'picsum-55-5tfg.webp', query:'shanghai rooftop bar skyline sunset drinks terrace view', label:'Blog - Rooftop Bars' },
  { file:'picsum-56-5w0l.webp', query:'chinese breakfast jianbing street food morning vendor pancake', label:'Blog - Breakfast' },
  { file:'picsum-57-5yet.webp', query:'shanghai photography skyline camera travel cityscape landscape', label:'Blog - Photography' },
  { file:'picsum-58-60v7.webp', query:'chinese new year lantern red decoration festival traditional', label:'Blog - CNY' },

  // === Restaurants 餐厅 (food.astro) ===
  { file:'1517248135467-4c7edcad34c4.webp', query:'fine dining shanghai mansion restaurant elegant table', label:'Rest - Fu 1088' },
  { file:'lf-ms5q9jn9-jlfs2a.webp',         query:'xiaolongbao soup dumpling jia jia tang bao', label:'Rest - Jia Jia Tang Bao' },
  { file:'1414235077428-338989a2e8c0.webp', query:'michelin fine dining culinary tasting menu gourmet', label:'Rest - Ultraviolet' },
  { file:'1555396273-367ea4eb4db5.webp',    query:'hunan chinese cuisine spicy ribs cumin di shui dong', label:'Rest - Di Shui Dong' },
  { file:'1627308595229-7830a5c91f9f.webp', query:'pan fried shengjian bao dumpling chinese street food', label:'Rest - Yang Fried Dumplings' },
  { file:'1559339352-11d035aa65de.webp',    query:'italian restaurant bund view pudong skyline mercato', label:'Rest - Mercato' },
];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log('启动浏览器...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const usedIds = new Set();
  const results = [];

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    console.log(`[${i+1}/${targets.length}] ${t.label}: 搜索 "${t.query}"`);

    try {
      const searchUrl = 'https://unsplash.com/s/photos/' + encodeURIComponent(t.query);
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await sleep(2000); // 等待图片加载

      // 提取搜索结果中的图片
      const photos = await page.evaluate(() => {
        const results = [];
        const imgs = document.querySelectorAll('img[src*="images.unsplash.com/photo-"]');
        imgs.forEach(img => {
          const src = img.getAttribute('src') || '';
          const idMatch = src.match(/photo-([a-zA-Z0-9_-]+)/);
          const link = img.closest('a');
          const alt = img.getAttribute('alt') || '';
          if (idMatch && link && link.href && link.href.includes('/photos/') && !link.href.includes('plus.unsplash')) {
            results.push({ id: idMatch[1], alt });
          }
        });
        return results;
      });

      if (photos.length === 0) {
        console.log(`  ⚠ 无搜索结果`);
        continue;
      }

      // 选择第一个未使用过的图片
      let picked = null;
      for (const p of photos) {
        if (!usedIds.has(p.id)) {
          picked = p;
          break;
        }
      }

      if (!picked) {
        // 所有图片都被用了，选第一个
        picked = photos[0];
        console.log(`  ⚠ 所有图片已用，复用 ${picked.id}`);
      }

      usedIds.add(picked.id);
      const dlUrl = `https://images.unsplash.com/photo-${picked.id}?w=1200&h=800&fit=crop`;
      
      results.push({
        file: t.file,
        label: t.label,
        query: t.query,
        photoId: picked.id,
        alt: picked.alt,
        dlUrl
      });

      console.log(`  ✓ ${picked.id} - "${picked.alt.slice(0,50)}"`);
    } catch (e) {
      console.log(`  ✗ 错误: ${e.message?.slice(0,80)}`);
    }

    // 避免请求过快
    await sleep(1500 + Math.random() * 2000);
  }

  await browser.close();

  // 保存结果
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\n完成! ${results.length}/${targets.length} 张图片已收集`);
  console.log(`结果已保存到: ${outFile}`);
}

main().catch(e => { console.error(e); process.exit(1); });
