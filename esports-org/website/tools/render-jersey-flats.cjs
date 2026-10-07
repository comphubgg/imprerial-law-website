// Rendert flache Jersey-Entwürfe (gesamt, nur Front, nur Back) für alle Farbwelten.  node tools/render-jersey-flats.cjs  (Server auf :3999)
const { chromium } = require('playwright-core'); const path = require('path'), fs = require('fs'); const { execFileSync } = require('child_process');
const BASE = process.env.BASE || 'http://localhost:3999', PUB = path.join(__dirname, '..', 'public', 'assets', 'jersey'), OUT = path.join(__dirname, '..', '..', '04_JERSEY', 'flat'); fs.mkdirSync(PUB, { recursive: true }); fs.mkdirSync(OUT, { recursive: true });
(async () => { const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' });
  for (const id of ['main', 'pro', 'academy', 'creator', 'christmas', 'rosa']) { const p = await b.newPage({ viewport: { width: 1600, height: 900 } }); await p.goto(`${BASE}/flat.html?kit=${id}`); await p.waitForFunction('window.ready===true', { timeout: 120000 });
    const full = path.join(OUT, `jersey_${id}_front-back.png`); await p.locator('#c').screenshot({ path: full, omitBackground: true }); const sp = await p.evaluate('window.splitX'); await p.close();
    const [w, h] = execFileSync('identify', ['-format', '%w %h', full]).toString().split(' ').map(Number); const half = sp;
    execFileSync('convert', [full, '-crop', `${half}x${h}+0+0`, '+repage', '-trim', '+repage', '-bordercolor', 'none', '-border', '30', path.join(PUB, `${id}-front.png`)]);
    execFileSync('convert', [full, '-crop', `${w - half - 60}x${h}+${half + 60}+0`, '+repage', '-trim', '+repage', '-bordercolor', 'none', '-border', '30', path.join(PUB, `${id}-back.png`)]);
    fs.copyFileSync(path.join(PUB, `${id}-front.png`), path.join(OUT, `jersey_${id}_front.png`)); fs.copyFileSync(path.join(PUB, `${id}-back.png`), path.join(OUT, `jersey_${id}_back.png`)); console.log('✓', id); }
  await b.close(); })();
