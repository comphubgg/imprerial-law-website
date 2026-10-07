// Erzeugt atmosphärische Hintergrundbilder (JPG) für Teams, Hero-Slider und News. Aufruf: node tools/render-backgrounds.cjs  (Server auf :3999)
const { chromium } = require('playwright-core'); const path = require('path'), fs = require('fs'); const PUB = path.join(__dirname, '..', 'public'), BASE = process.env.BASE || 'http://localhost:3999';
const JOBS = [ // out, pal, seed, w, h
  ['assets/bg/team-fortnite.jpg', 'storm', 3, 1600, 900], ['assets/bg/team-academy.jpg', 'steel', 8, 1600, 900],
  ['assets/bg/hero-1.jpg', 'storm', 11, 1920, 900], ['assets/bg/hero-2.jpg', 'dusk', 5, 1920, 900], ['assets/bg/hero-3.jpg', 'ice', 14, 1920, 900],
  ['assets/bg/news-1.jpg', 'storm', 21, 1280, 720], ['assets/bg/news-2.jpg', 'gold', 22, 1280, 720], ['assets/bg/news-3.jpg', 'ice', 23, 1280, 720]];
(async () => { fs.mkdirSync(path.join(PUB, 'assets/bg'), { recursive: true });
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' });
  for (const [out, pal, seed, w, h] of JOBS) { const p = await b.newPage({ viewport: { width: w, height: h } }); await p.goto(`${BASE}/art-bg.html?pal=${pal}&seed=${seed}&w=${w}&h=${h}`); await p.waitForFunction('window.ready===true', { timeout: 120000 }); await p.locator('#c').screenshot({ path: path.join(PUB, out), type: 'jpeg', quality: 88 }); await p.close(); console.log('✓', out); }
  await b.close(); })();
