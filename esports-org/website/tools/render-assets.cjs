// Rendert Shop-Bilder, Hero-Bilder und Team-Karten (PNG) aus dem 3D-Modell. Aufruf: node tools/render-assets.cjs  (Server muss auf :3999 laufen)
// Benötigt: playwright-core + Chromium (z. B. /opt/pw-browsers/chromium)
const { chromium } = require('playwright-core'); const path = require('path');
const PUB = path.join(__dirname, '..', 'public'), BASE = process.env.BASE || 'http://localhost:3999';
const PRODUCTS = [ // id, kit, kind
  ['jersey-pro', 'pro', 'jersey'], ['jersey-main', 'main', 'jersey'], ['jersey-academy', 'academy', 'jersey'], ['jersey-creator', 'creator', 'jersey'],
  ['jacket-pro', 'pro', 'jacket'], ['jogger-pro', 'pro', 'jogger'], ['cap-main', 'main', 'cap'], ['bag-pro', 'pro', 'bag'], ['flag-main', 'main', 'flag'], ['scarf-pro', 'pro', 'scarf']];
const HEROES = [['hero-main', 'main'], ['hero-pro', 'pro'], ['hero-academy', 'academy']];
const TEAMS = [['team-fortnite', 'pro', 'FORTNITE', 'Pro team'], ['team-academy', 'academy', 'ACADEMY', 'Talents']];
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const shot = async (qs, w, h, out) => { const p = await b.newPage({ viewport: { width: w, height: h } }); await p.goto(`${BASE}/art.html?${qs}&w=${w}&h=${h}`); await p.waitForFunction('window.ready===true', { timeout: 180000 }); await p.waitForTimeout(500);
    await p.locator('#stage').screenshot({ path: path.join(PUB, out), omitBackground: true }); await p.close(); console.log('✓', out); };
  const only = process.argv[2];
  for (const [id, kit, kind] of PRODUCTS) if (!only || only === 'shop') await shot(`mode=product&kit=${kit}&kind=${kind}&fit=${kind === 'flag' || kind === 'scarf' ? .95 : .78}&yaw=${kind === 'flag' ? .25 : .34}&pitch=.1`, 900, 900, `assets/shop/${id}.png`);
  for (const [id, kit] of HEROES) if (!only || only === 'hero') await shot(`mode=product&kit=${kit}&kind=jersey&fit=.62&yaw=.42&pitch=.1`, 1400, 1400, `assets/hero/${id}.png`);
  for (const [id, kit, title, sub] of TEAMS) if (!only || only === 'teams') await shot(`mode=team&kit=${kit}&nojersey=1&title=${title}&sub=${encodeURIComponent(sub)}&fs=210`, 900, 1200, `assets/teams/${id}.png`);
  await b.close();
})();
