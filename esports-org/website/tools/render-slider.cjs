// Rendert den Slider in drei Größen: transparentes WebM, Greenscreen-MP4 und eine MP4-Ansicht auf dunklem Hintergrund (fürs Handy).  node tools/render-slider.cjs  (Server auf :3999)
const { chromium } = require('playwright-core'); const path = require('path'), fs = require('fs'), { execFileSync } = require('child_process');
const BASE = process.env.BASE || 'http://localhost:3999', OUT = path.join(__dirname, '..', '..', '08_STREAM', 'slider'); fs.mkdirSync(OUT, { recursive: true });
const S = { narrow: [800, 100], medium: [800, 200], tall: [600, 300] }, q = process.argv[2] || '';
(async () => { const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' });
  for (const [name, [w, h]] of Object.entries(S)) { const p = await b.newPage({ viewport: { width: w, height: h } }); await p.goto(`${BASE}/overlay/widgets/slider.html?size=${name}&style=1&color=platin&t=0${q}`); await p.waitForFunction('window.ready===true'); const secs = await p.evaluate('window.__loop'), fps = 30, n = Math.round(secs * fps);
    const tmp = path.join(OUT, '.frames'); fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp);
    for (let i = 0; i < n; i++) { await p.evaluate(t => window.__setT(t), i / fps); await p.screenshot({ path: path.join(tmp, `f${String(i).padStart(4, '0')}.png`), omitBackground: true }); } await p.close();
    const base = `slider_${name}_${w}x${h}`, webm = path.join(OUT, base + '_transparent.webm'); execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', String(fps), '-i', path.join(tmp, 'f%04d.png'), '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '2M', '-auto-alt-ref', '0', webm]);
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i', `color=c=0x00FF00:s=${w}x${h}:d=${secs}:r=${fps}`, '-c:v', 'libvpx-vp9', '-i', webm, '-filter_complex', '[0][1]overlay=shortest=1,format=yuv420p', '-c:v', 'libx264', '-crf', '16', '-movflags', '+faststart', path.join(OUT, base + '_greenscreen.mp4')]);
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i', `gradients=s=1280x720:d=${secs}:c0=0x0b0e18:c1=0x1a2440:speed=0.02:rate=30`, '-c:v', 'libvpx-vp9', '-i', webm, '-filter_complex', '[1]scale=iw*min(1\\,1200/iw):-1[w];[0][w]overlay=(W-w)/2:(H-h)/2:shortest=1,format=yuv420p', '-c:v', 'libx264', '-crf', '20', '-movflags', '+faststart', path.join(OUT, base + '_ansicht.mp4')]);
    fs.rmSync(tmp, { recursive: true, force: true }); console.log('✓', name, secs + 's'); }
  await b.close(); })();
