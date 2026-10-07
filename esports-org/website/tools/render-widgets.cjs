// Rendert alle Einzel-Widgets als PNG (transparent) und die animierten als Loop-Video (WebM mit Alpha + MP4 Greenscreen).
//   node tools/render-widgets.cjs [stills|videos] [widgetname]     (Server auf :3999)
const { chromium } = require('playwright-core'); const path = require('path'), fs = require('fs'), { execFileSync } = require('child_process');
const BASE = process.env.BASE || 'http://localhost:3999', OUT = path.join(__dirname, '..', '..', '08_STREAM', 'widgets'); const [mode, only] = [process.argv[2], process.argv[3]];
const W = { cam: [640, 360, 5], chat: [420, 720, 5], 'social-bar': [800, 200, 4], 'partner-bar': [800, 200, 4], 'discord-bar': [800, 200, 4], 'chat-cta': [800, 200, 4], 'follower-goal': [800, 200, 4], 'info-card': [800, 200, 4], hashtag: [500, 140, 4], 'logo-bug': [500, 140, 4], nameplate: [520, 100, 1], countdown: [500, 140, 4], alert: [1000, 300, 1] };
const COLORS = ['platin', 'blue', 'gold', 'red', 'purple'];
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' });
  const open = async (name, qs, w, h) => { const p = await b.newPage({ viewport: { width: w, height: h } }); await p.goto(`${BASE}/overlay/widgets/${name}.html?${qs}`); await p.waitForFunction('window.ready===true', { timeout: 60000 }); await p.waitForTimeout(250); return p; };
  if (!mode || mode === 'stills') for (const [name, [w, h, ns]] of Object.entries(W)) { if (only && only !== name) continue; const dir = path.join(OUT, name); fs.mkdirSync(dir, { recursive: true });
    const combos = []; if (name === 'cam' || name === 'chat') { for (let s = 1; s <= ns; s++) for (const c of COLORS) combos.push([s, c]); } else if (ns === 1) { for (const c of COLORS) combos.push([1, c]); } else { for (let s = 1; s <= ns; s++) combos.push([s, 'platin']); for (const c of COLORS.slice(1)) combos.push([1, c]); }
    for (const [s, c] of combos) { const t = name === 'social-bar' ? 1 : 2; const p = await open(name, `style=${s}&color=${c}&t=${t}${name === 'cam' ? '&nick=PLAYER' : ''}`, w, h); await p.screenshot({ path: path.join(dir, `${name}_style${s}_${c}.png`), omitBackground: true }); await p.close(); }
    console.log('✓', name, combos.length, 'PNG'); }
  if (!mode || mode === 'videos') for (const name of ['social-bar', 'partner-bar', 'discord-bar', 'chat-cta', 'follower-goal', 'alert', 'hashtag', 'logo-bug']) { if (only && only !== name) continue; const [w, h] = W[name]; const dir = path.join(OUT, name); fs.mkdirSync(dir, { recursive: true });
    const p = await open(name, 'style=1&color=platin&t=0', w, h); const secs = await p.evaluate('window.__loop||6'); const fps = 30, n = Math.round(secs * fps), tmp = path.join(OUT, '.frames'); fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp, { recursive: true });
    for (let i = 0; i < n; i++) { await p.evaluate(t => window.__setT(t), i / fps); await p.screenshot({ path: path.join(tmp, `f${String(i).padStart(4, '0')}.png`), omitBackground: true }); } await p.close();
    const webm = path.join(dir, `${name}_loop_transparent.webm`); execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', String(fps), '-i', path.join(tmp, 'f%04d.png'), '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '2M', '-auto-alt-ref', '0', webm]);
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i', `color=c=0x00FF00:s=${w}x${h}:d=${secs}:r=${fps}`, '-c:v', 'libvpx-vp9', '-i', webm, '-filter_complex', '[0][1]overlay=shortest=1,format=yuv420p', '-c:v', 'libx264', '-crf', '16', '-movflags', '+faststart', path.join(dir, `${name}_greenscreen.mp4`)]);
    fs.rmSync(tmp, { recursive: true, force: true }); console.log('✓ video', name, secs + 's'); }
  await b.close();
})();
