// Rendert das komplette Stream- & Social-Paket (PNG + Videos).  node tools/render-stream-pack.cjs [stills|videos|banners]
// Voraussetzungen: laufender Server (BASE, Standard http://localhost:3999), playwright-core, Chromium, ffmpeg.
const { chromium } = require('playwright-core'); const path = require('path'), fs = require('fs'), { execFileSync } = require('child_process');
const BASE = process.env.BASE || 'http://localhost:3999', ROOT = path.join(__dirname, '..', '..'), STREAM = path.join(ROOT, '08_STREAM'), BAN = path.join(ROOT, '02_SOCIAL', 'banners');
const only = process.argv[2]; fs.mkdirSync(path.join(STREAM, 'scenes'), { recursive: true }); fs.mkdirSync(path.join(STREAM, 'video'), { recursive: true }); fs.mkdirSync(BAN, { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' });
  const page = async (url, w, h) => { const p = await b.newPage({ viewport: { width: w, height: h } }); await p.goto(BASE + url); await p.waitForFunction('window.ready===true', { timeout: 60000 }); await p.waitForTimeout(400); return p; };
  const still = async (url, w, h, out, transparent, clip) => { const p = await page(url, w, h); await p.screenshot({ path: out, omitBackground: !!transparent, clip }); await p.close(); console.log('✓', path.relative(ROOT, out)); };
  if (!only || only === 'stills') {
    const S = n => path.join(STREAM, 'scenes', n);
    await still('/overlay/starting-soon.html?t=2&sub=FOLLOW%20%C2%B7%20SUB%20%C2%B7%20HYPE', 1920, 1080, S('01_starting-soon.png'));
    await still('/overlay/starting-soon.html?t=2&minutes=10&static=1', 1920, 1080, S('01b_starting-soon-countdown.png'));
    await still('/overlay/brb.html?t=2', 1920, 1080, S('02_be-right-back.png'));
    await still('/overlay/ending.html?t=2', 1920, 1080, S('03_ending.png'));
    await still('/overlay/offline.html?t=2', 1920, 1080, S('04_offline.png'));
    await still('/overlay/game.html?t=0&static=1&slide=0', 1920, 1080, S('05_game-overlay_transparent.png'), true);
    for (let i = 0; i < 4; i++) await still(`/overlay/ticker.html?t=0&static=1&slide=${i}`, 1920, 1080, S(`06_ticker-${i + 1}_transparent.png`), true);
    await still('/overlay/cam-frame.html?t=0&x=40&y=640&w=520', 1920, 1080, S('07_cam-frame_transparent.png'), true);
    await still('/overlay/follow-goal.html?t=3&current=47&goal=100', 1920, 1080, S('08_follow-goal_transparent.png'), true, { x: 0, y: 0, width: 660, height: 130 });
    await still('/overlay/alert.html?t=2&type=follow&user=PLAYERONE', 1920, 1080, S('09_alert-follow_transparent.png'), true, { x: 520, y: 40, width: 880, height: 230 });
  }
  if (!only || only === 'banners') {
    const jobs = [['x-header', 1500, 500, ''], ['x-avatar', 400, 400, ''], ['twitch-banner', 1200, 480, ''], ['twitch-offline', 1920, 1080, ''], ['youtube', 2560, 1440, ''], ['discord-banner', 960, 540, ''], ['discord-icon', 512, 512, ''], ['linkedin', 1584, 396, ''], ['facebook', 820, 312, ''],
      ['matchday', 1080, 1350, ''], ['result', 1080, 1350, 'a=2&b=1'], ['reveal', 1080, 1350, 'name=PLAYERONE&role=Fragger&country=DE'], ['sponsor', 1080, 1080, 'partner=YOUR%20BRAND']];
    for (const [t, w, h, qs] of jobs) await still(`/overlay/banner.html?type=${t}&t=2&${qs}`, w, h, path.join(BAN, `${t}.png`));
    const panels = [['about', 'ABOUT', 'Fortnite esports organisation|Pro · Academy · Creators|#VLXWIN', 420], ['schedule', 'SCHEDULE', 'Mon–Fri · 7 PM CET|Sat · Scrims & tournaments|Sun · VALIOUX Weekly', 420], ['rules', 'CHAT RULES', 'Be respectful|No spam or self-promo|Have fun', 420], ['discord', 'JOIN DISCORD', 'Community, scrims, giveaways|discord.gg/yourinvite', 380], ['partners', 'PARTNERS', 'Partner 1|Partner 2|Partner 3', 380]];
    for (const [n, t, l, h] of panels) await still(`/overlay/banner.html?type=panel&t=0&title=${encodeURIComponent(t)}&lines=${encodeURIComponent(l)}&h=${h}`, 640, h, path.join(BAN, `twitch-panel-${n}.png`));
  }
  if (!only || only === 'videos') {
    const vid = async (name, url, secs, fps, w, h, alpha, perFrame) => {
      const tmp = path.join(STREAM, '.frames'); fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp, { recursive: true });
      const p = await page(url, w, h); const n = secs * fps; for (let i = 0; i < n; i++) { const t = i / fps; await p.evaluate(([t, pf]) => { window.__setT(t); if (pf && window.__showSlide) window.__showSlide(Math.floor(t / 5)); }, [t, perFrame]); await p.screenshot({ path: path.join(tmp, `f${String(i).padStart(4, '0')}.${alpha ? 'png' : 'jpg'}`), omitBackground: !!alpha, ...(alpha ? { type: 'png' } : { type: 'jpeg', quality: 92 }) }); } await p.close();
      const out = path.join(STREAM, 'video', name);
      const args = alpha ? ['-y', '-framerate', String(fps), '-i', path.join(tmp, 'f%04d.png'), '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '4M', '-auto-alt-ref', '0', out] : ['-y', '-framerate', String(fps), '-i', path.join(tmp, 'f%04d.jpg'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', out];
      execFileSync('ffmpeg', ['-loglevel', 'error', ...args]); fs.rmSync(tmp, { recursive: true, force: true }); console.log('✓ video/' + name);
    };
    const only2 = process.argv[3];
    if (!only2 || only2 === 'loops') {
    await vid('starting-soon_loop.mp4', '/overlay/starting-soon.html?t=0', 10, 30, 1920, 1080, false);
    await vid('be-right-back_loop.mp4', '/overlay/brb.html?t=0', 10, 30, 1920, 1080, false);
    await vid('ending_loop.mp4', '/overlay/ending.html?t=0', 10, 30, 1920, 1080, false);
    }
    if (!only2 || only2 === 'alpha')
    await vid('game-overlay_ticker_transparent.webm', '/overlay/game.html?t=0&static=1', 20, 30, 1920, 1080, true, true);
  }
  await b.close();
})();
