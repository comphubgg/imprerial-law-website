// Gemeinsame Logik der Overlays. URL-Parameter: ?bg=0 (transparent), ?static=1 (keine Echtzeit-Elemente), ?t=3.5 (Animation einfrieren, für Video/PNG-Export)
(function () {
  const Q = new URLSearchParams(location.search); window.Q = Q;
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.textContent = html; return e; };
  const NAMES = { x: 'X', twitch: 'Twitch', youtube: 'YouTube', instagram: 'Instagram', tiktok: 'TikTok', discord: 'Discord', facebook: 'Facebook' };
  function svg(k) { const ns = 'http://www.w3.org/2000/svg', s = document.createElementNS(ns, 'svg'); s.setAttribute('viewBox', '0 0 24 24'); const p = document.createElementNS(ns, 'path'); p.setAttribute('d', (window.ICONS || {})[k] || ''); s.append(p); return s; }
  function handle(k, v, org) { v = (v || '').trim(); if (!v) return { text: '@' + (org.mark || org.name).toUpperCase().replace(/\s+/g, ''), ph: true }; v = v.replace(/^https?:\/\/(www\.)?/i, '').replace(/^(x|twitter|twitch|youtube|instagram|tiktok|discord)\.(com|tv|gg)\/(@)?/i, '').replace(/^invite\//, ''); return { text: k === 'discord' ? 'discord.gg/' + v.replace(/^discord\.gg\//, '') : '@' + v.replace(/^@/, ''), ph: false }; }
  async function init() {
    const D = await (await fetch('/api/data')).json(); const o = D.org; window.D = D;
    const t = (window.THEMES || {})[Q.get('theme') || o.theme] || (window.THEMES || {}).platin; if (t) { const r = document.documentElement.style; r.setProperty('--accent', t.accent); r.setProperty('--accent2', t.accent2); r.setProperty('--grad', t.grad); r.setProperty('--on', t.on); r.setProperty('--link', t.link || '#1E50FF'); }
    const logo = (o.themeLogos || {})[o.theme] || o.logo || '/logo.png'; const socials = ['x', 'twitch', 'youtube', 'instagram', 'tiktok', 'discord'].map(k => ({ k, ...handle(k, (o.socials || {})[k], o) }));
    const sponsors = (D.sponsors || []).slice().sort((a, b) => (+a.order || 99) - (+b.order || 99)).slice(0, 5);
    const sc = () => { const f = Math.min(innerWidth / 1920, innerHeight / 1080); document.documentElement.style.setProperty('--s', f); }; sc(); addEventListener('resize', sc);
    document.documentElement.lang = 'en'; return { D, o, logo, socials, sponsors, hashtag: (o.hashtag || '#VLX').toUpperCase(), mark: o.mark || 'VLX' };
  }
  function bg() { const b = el('div', 'bg'); b.append(el('div', 'grid')); for (let i = 0; i < 3; i++) { const s = el('div', 'streak'); s.style.animationDelay = (-i * 3.3333).toFixed(3) + 's'; s.style.opacity = (.9 - i * .2); b.append(s); } let seed = 7; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 46; i++) { const d = el('div', 'dot'); d.style.left = (r() * 100) + '%'; d.style.top = (60 + r() * 50) + '%'; const dur = [10, 5, 10, 2.5][i % 4]; d.style.animationDuration = dur + 's'; d.style.animationDelay = (-r() * dur).toFixed(2) + 's'; d.style.width = d.style.height = (3 + r() * 6) + 'px'; b.append(d); } return b; }
  function socRow(list, cls) { const row = el('div', cls || 'socbar'); list.forEach(s => { const a = el('div', 'soc' + (s.ph ? ' ph' : '')); a.append(svg(s.k), el('span', '', s.text)); row.append(a); }); return row; }
  function sponsorStrip(sponsors, label) { const w = el('div', 'sponsors'); w.append(el('small', '', label || 'PARTNERS')); sponsors.forEach(s => { if (s.logo) { const i = new Image(); i.src = s.logo; i.alt = s.name; w.append(i); } else w.append(el('span', '', s.name)); }); return w; }
  function freezeTime() { const t = parseFloat(Q.get('t')); if (isNaN(t)) return; const f = () => { document.getAnimations().forEach(a => { a.pause(); a.currentTime = t * 1000; }); }; f(); requestAnimationFrame(f); window.__setT = s => { document.getAnimations().forEach(a => { a.pause(); a.currentTime = s * 1000; }); }; }
  async function fonts() { try { await Promise.all([document.fonts.load('400 100px Anton'), document.fonts.load('700 30px Inter')]); } catch {} }
  window.OV = { $, el, svg, init, bg, socRow, sponsorStrip, freezeTime, fonts, NAMES };
})();
