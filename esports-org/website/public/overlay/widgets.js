// Baukasten: jedes Widget ist eine eigene Seite (/overlay/widgets/NAME.html). Parameter: width, height, color, style, text-Optionen je Widget.
(async function () {
  const { el, svg, init, freezeTime, fonts, $ } = OV, Q = window.Q, name = document.body.dataset.widget, stage = $('#stage');
  const SIZES = { narrow: [800, 100], medium: [800, 200], tall: [600, 300] };
  const DEF = { slider: [800, 200], cam: [640, 360], chat: [420, 720], 'social-bar': [800, 200], 'partner-bar': [800, 200], 'discord-bar': [800, 200], 'chat-cta': [800, 200], 'follower-goal': [800, 200], 'info-card': [800, 200], hashtag: [500, 140], 'logo-bug': [500, 140], nameplate: [520, 100], countdown: [500, 140], alert: [1000, 300] };
  const PAL = { platin: '#E4EAF2', blue: '#2F6BFF', ice: '#7FD0FF', gold: '#F2C14E', red: '#FF3B4E', purple: '#9B5CFF', pink: '#FF4FA8', green: '#2FE27A', orange: '#FF8A2B', white: '#FFFFFF' };
  const hexRgb = h => { h = h.replace('#', ''); if (h.length === 3) h = [...h].map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); }, toHex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => toHex(a.map((v, i) => v + (b[i] - v) * t)), lum = ([r, g, b]) => (.299 * r + .587 * g + .114 * b) / 255;
  function color(spec) { const r = document.documentElement.style; if (!spec) return; let hx = PAL[spec]; if (!hx && /^#?[0-9a-f]{3}([0-9a-f]{3})?$/i.test(spec)) hx = spec.startsWith('#') ? spec : '#' + spec; if (window.THEMES && THEMES[spec]) { const t = THEMES[spec]; r.setProperty('--accent', t.accent); r.setProperty('--accent2', t.accent2); r.setProperty('--grad', t.grad); r.setProperty('--on', t.on); return; }
    if (!hx) return; const c = hexRgb(hx), light = toHex(c.map(v => v + (255 - v) * .45)), dark = toHex(c.map(v => v * .72)); r.setProperty('--accent', hx); r.setProperty('--accent2', light); r.setProperty('--grad', `linear-gradient(180deg,${light},${hx} 55%,${dark})`); r.setProperty('--on', lum(c) > .55 ? '#0A0B0E' : '#FFFFFF'); }
  const C = await init(); await fonts(); const { o, logo, socials, sponsors, hashtag, mark } = C;
  color(Q.get('color') || '');
  const [dw, dh] = (name === 'slider' && SIZES[Q.get('size')]) || DEF[name] || [800, 200]; const ratio = Q.get('ratio'); let w = +Q.get('width') || dw, h = +Q.get('height') || dh; if (name === 'cam' && ratio && !Q.get('height')) { const [a, b] = ratio.split(':').map(Number); if (a && b) h = Math.round(w * b / a); }
  stage.style.width = w + 'px'; stage.style.height = h + 'px'; stage.style.setProperty('--h', h + 'px'); document.documentElement.style.setProperty('--s', Math.min(1, innerWidth / w, innerHeight / h));
  const style = Math.max(1, Math.min(5, +Q.get('style') || 1)); const root = el('div', 'wd s' + style); stage.append(root);
  function slideshow(nodes, dur) { const n = nodes.length, total = n * dur, e = Math.min(.04, .4 / n); let css = ''; nodes.forEach((nd, i) => { const a = i / n, b = (i + 1) / n, f = x => (x * 100).toFixed(3) + '%';
      css += `@keyframes sl${i}{0%{opacity:0;transform:translateY(16px)}${f(a)}{opacity:0;transform:translateY(16px)}${f(a + e)}{opacity:1;transform:none}${f(Math.max(a + e, b - e))}{opacity:1;transform:none}${f(b)}{opacity:0;transform:translateY(-16px)}100%{opacity:0;transform:translateY(-16px)}}`; nd.style.animation = `sl${i} ${total}s linear infinite`; nd.style.opacity = n === 1 ? 1 : 0; if (n === 1) nd.style.animation = 'none'; });
    const st = el('style'); st.textContent = css; document.head.append(st); window.__loop = n === 1 ? 6 : total; }
  const panel = (label, slides, dur) => { const p = el('div', 'pn'); if (label) p.append(el('div', 'lab', label)); const ct = el('div', 'ct'); slides.forEach(s => { s.classList.add('sl'); ct.append(s); }); p.append(ct); root.append(p); if (slides.length > 1) slideshow(slides, dur || 3); else { slides[0].classList.add('solo'); window.__loop = 6; } return p; };
  const slideIcon = (k, small, big) => { const s = el('div'); s.append(svg(k)); const t = el('div'); t.append(el('small', '', small), el('b', '', big)); s.append(t); return s; };
  const handleOf = s => s.text;
  const B = {

    slider() {
      const gp = (k, d) => (Q.get(k) != null ? +Q.get(k) : d), pd = { logo: 3.2, socials: 5, discord: 3, cmd: 3.2, invite: 3.6, hashtag: 2.8, cta: 3, follow: 2.8, partners: 3.5 }, scale = gp('dur', 1);
      const fake = (Q.get('sponsors') || '').split('|').filter(Boolean).map(n => ({ name: n })); const real = fake.length ? fake : sponsors.filter(s => !/^PARTNER \d/i.test(s.name)); let order = (Q.get('pages') || ('logo,socials,' + (real.length ? 'partners,' : '') + 'discord,cmd,hashtag,cta')).split(',').map(s => s.trim()).filter(Boolean);
      const cols = w / h >= 5 ? 4 : 2, rows = cols === 4 ? 1 : 2, fs = Math.min(w * .92 / (cols * 6.2), h * (rows === 1 ? .3 : .2)), big = Math.min(h * .42, w * .1), sm = Math.max(11, big * .3);
      const keys = ['x', 'youtube', 'tiktok', 'twitch']; const soc = keys.map(k => socials.find(s => s.k === k));
      const ct = el('div', 'ct'), pn = el('div', 'pn spn'); pn.append(ct); root.append(pn); ct.style.cssText = 'position:absolute;inset:0';
      const LN = { silver: 'linear-gradient(90deg,#8e97a6,#fff 45%,#c9d1de 70%,#fff)', gold: 'linear-gradient(90deg,#9a7421,#ffe28a 45%,#d4a73a 70%,#fff3c4)', white: '#fff', accent: 'var(--grad)' }, lnk = Q.get('line') || 'silver', frm = Q.get('frame') || 'gold', bga = gp('bg', .62);
      pn.style.setProperty('--ln', LN[lnk] || LN.silver); pn.style.setProperty('--bga', bga); if (frm !== 'none') pn.style.setProperty('--frm', frm === 'gold' ? 'rgba(232,194,100,.6)' : frm === 'silver' ? 'rgba(200,210,225,.55)' : 'rgba(255,255,255,.4)'); pn.classList.add('fr' + (frm !== 'none' ? 1 : 0));
      const side = el('i', 'spn-l'), trk = el('i', 'spn-t'); pn.append(side, trk);
      const text = (s, b, ic) => { const c = el('div', 'pg-t'); if (ic) { const i = svg(ic); i.style.cssText = `width:${big * .9}px;height:${big * .9}px;fill:var(--accent);flex:0 0 auto`; i.classList.add('it'); c.append(i); } const t = el('div'); const a = el('small', 'it', s), z = el('b', 'it', b); a.style.fontSize = sm + 'px'; z.style.fontSize = big + 'px'; t.append(a, z); c.append(t); return c; };
      const P = {
        logo() { const i = new Image(); i.src = logo; i.className = 'it'; i.style.cssText = `height:${h * .62}px;width:auto;max-width:${w * .8}px;object-fit:contain`; return [i]; },
        socials() { const g = el('div', 'sgrid'); g.style.cssText = `--cols:${cols};font-size:${fs}px;gap:${h * .06}px ${w * .035}px`; soc.forEach(s => { const a = el('div', 'si it'); a.append(svg(s.k), el('span', '', s.text)); g.append(a); }); return [g]; },
        partners() { const g = el('div', 'sgrid'); g.style.cssText = `--cols:${Math.min(real.length, cols)};font-size:${fs}px;gap:${h * .06}px ${w * .04}px`; real.slice(0, 4).forEach(p => { const a = el('div', 'si it'); if (p.logo) { const i = new Image(); i.src = p.logo; i.style.height = fs * 1.6 + 'px'; a.append(i); } else a.append(el('span', '', p.name)); g.append(a); }); return [g]; },
        discord() { return [text('JOIN OUR COMMUNITY', 'DISCORD', 'discord')]; },
        cmd() { return [text('TYPE IN CHAT', Q.get('cmd') || '!orgdc')]; },
        invite() { const d = socials.find(s => s.k === 'discord') || {}; return [text(Q.get('invitelabel') || 'INVITE LINK', Q.get('invite') || (d.ph ? 'discord.gg/yourinvite' : d.text))]; },
        creator() { return [text('SUPPORT US · CREATOR CODE', Q.get('code') || 'VLX')]; },
        website() { return [text('VISIT OUR WEBSITE', Q.get('site') || 'valioux.com')]; },
        shop() { return [text('GO TO OUR STORE', Q.get('shop') || 'shop.valioux.com')]; },
        hashtag() { return [text('USE', hashtag)]; },
        cta() { return [text('DROP A ' + hashtag, 'WHEN WE WIN')]; },
        follow() { return [text('LIKE WHAT YOU SEE?', 'FOLLOW US')]; },
      };
      order = order.filter(k => P[k]); const dur = order.map(k => (pd[k] || 3) * scale), T = dur.reduce((a, b) => a + b, 0); let css = '', t0 = 0, n = 0; const pct = x => (x / T * 100).toFixed(3) + '%', IN = .55, OUT = .45;
      order.forEach((k, i) => { const items = P[k](); const pg = el('div', 'pg'); items.forEach(it => pg.append(it)); ct.append(pg); const a = t0, b = t0 + dur[i];
        css += `@keyframes pg${i}{0%{opacity:0;transform:translateX(60px)}${pct(a)}{opacity:0;transform:translateX(60px)}${pct(a + IN)}{opacity:1;transform:none}${pct(b - OUT)}{opacity:1;transform:none}${pct(b)}{opacity:0;transform:translateX(-60px)}100%{opacity:0;transform:translateX(-60px)}}`; pg.style.animation = `pg${i} ${T}s linear infinite`; css += `@keyframes pr${i}{0%{transform:scaleX(0);opacity:0}${pct(a)}{transform:scaleX(0);opacity:0}${pct(a + .02)}{transform:scaleX(0);opacity:1}${pct(b - .02)}{transform:scaleX(1);opacity:1}${pct(b)}{transform:scaleX(1);opacity:0}100%{transform:scaleX(1);opacity:0}}`; const pf = el('i', 'spn-f'); pf.style.animation = `pr${i} ${T}s linear infinite`; pn.append(pf);
        pg.querySelectorAll('.it').forEach((it, j) => { const d0 = a + .15 + j * .14, nm = `it${n++}`; css += `@keyframes ${nm}{0%{opacity:0;transform:translateY(16px) scale(.92)}${pct(d0)}{opacity:0;transform:translateY(16px) scale(.92)}${pct(d0 + .45)}{opacity:1;transform:none}${pct(Math.max(d0 + .45, b - OUT))}{opacity:1;transform:none}${pct(b - .1)}{opacity:0;transform:translateY(-10px)}100%{opacity:0}}`; it.style.animation = `${nm} ${T}s linear infinite`; });
        t0 = b; });
      const st = el('style'); st.textContent = css; document.head.append(st); window.__loop = T;
    },
    'social-bar'() { const keys = (Q.get('only') || '').split(',').filter(Boolean); const list = socials.filter(s => !keys.length || keys.includes(s.k)); panel(Q.get('label') || 'FOLLOW US', list.map(s => slideIcon(s.k, 'on ' + OV.NAMES[s.k], handleOf(s))), +Q.get('dur') || 3); },
    'partner-bar'() { const list = sponsors.length ? sponsors : [{ name: 'PARTNER' }]; panel(Q.get('label') || 'POWERED BY', list.map(p => { const s = el('div'); if (p.logo) { const i = new Image(); i.src = p.logo; s.append(i); } else { const t = el('div'); t.append(el('small', '', p.tier || 'Partner'), el('b', '', p.name)); s.append(t); } return s; }), +Q.get('dur') || 3); },
    'discord-bar'() { const d = socials.find(s => s.k === 'discord'); const s = slideIcon('discord', Q.get('sub') || 'JOIN THE COMMUNITY', d.text); s.classList.add('pulse'); panel(Q.get('label') || 'DISCORD', [s]); },
    'chat-cta'() { const lines = (Q.get('lines') || ('DROP A ' + hashtag + ' WHEN WE WIN|GG IN CHAT AFTER EVERY MATCH|USE ' + hashtag + ' ON X')).split('|'); panel(Q.get('label') || 'CHAT', lines.map(l => { const s = el('div'); const b = el('b', '', l); b.style.fontSize = 'calc(var(--h)*.22)'; b.style.whiteSpace = 'normal'; s.append(b); return s; }), +Q.get('dur') || 4); },
    'info-card'() { const lines = (Q.get('lines') || 'NEXT STREAM|TOMORROW · 7 PM CET').split('|'); const s = el('div'); const t = el('div'); t.append(el('small', '', lines[0]), el('b', '', lines[1] || '')); s.append(t); panel(Q.get('label') || 'SCHEDULE', [s]); },
    'follower-goal'() { const cur = +Q.get('current') || 47, goal = +Q.get('goal') || 100; const s = el('div'); s.style.padding = '0'; const bar = el('div', 'goalbar'), f = el('i'); f.style.setProperty('--p', Math.min(100, cur / goal * 100) + '%'); bar.append(f); const n = el('div', 'gnum', cur + ' / ' + goal); s.append(bar, n); s.style.gap = '0'; panel(Q.get('label') || 'GOAL', [s]); window.__loop = 6; },
    countdown() { const mins = +Q.get('minutes') || 10, s = el('div'); const b = el('b', '', ''); b.style.fontSize = 'calc(var(--h)*.5)'; const fmt = ms => { const x = Math.max(0, Math.round(ms / 1000)); return String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0'); }; if (Q.get('t') != null || Q.get('static')) b.textContent = fmt(mins * 60000); else { const end = Date.now() + mins * 60000; const tk = () => b.textContent = fmt(end - Date.now()); tk(); setInterval(tk, 500); } s.append(b); panel(Q.get('label') || 'STARTING IN', [s]); },
    hashtag() { const s = el('div'); s.style.justifyContent = 'center'; s.style.padding = '0'; const b = el('b', '', hashtag); b.style.fontSize = 'calc(var(--h)*.4)'; b.style.fontStyle = 'italic'; s.append(b); s.classList.add('pulse'); panel('', [s]); const sl = root.querySelector('.sl'); sl.style.justifyContent = 'center'; },
    'logo-bug'() { const s = el('div'); const i = new Image(); i.src = logo; s.append(i); const b = el('b', '', o.name); b.style.fontSize = 'calc(var(--h)*.32)'; s.append(b); panel('', [s]); const sl = root.querySelector('.sl'); sl.style.justifyContent = 'center'; },
    nameplate() { const n = el('div', 'nplate'); n.style.cssText = 'position:absolute;left:0;bottom:0;font-size:' + (h * .6) + 'px;transform:skewX(-12deg);display:flex'; n.style.fontSize = (h * .6) + 'px'; n.append(el('b', '', Q.get('tag') || mark), el('span', '', Q.get('nick') || o.name)); n.style.setProperty('--h', h * 1.6 + 'px'); root.append(n); window.__loop = 6; },
    alert() { const type = Q.get('type') || 'follow', lab = { follow: 'NEW FOLLOWER', sub: 'NEW SUBSCRIBER', raid: 'INCOMING RAID', donation: 'NEW SUPPORT' }[type] || 'NEW FOLLOWER'; const a = el('div', 'alertbox'); a.append(el('small', '', lab), el('b', '', Q.get('user') || 'PLAYERONE')); root.append(a); window.__loop = 6; },
    cam() { const f = el('div', 'camf cam' + style); const nick = Q.get('name') === '0' ? null : (Q.get('nick') || (Q.get('name') === '1' ? o.name : null)); root.append(f); if (nick) { const n = el('div', 'nplate'); n.append(el('b', '', mark), el('span', '', nick)); f.append(n); } window.__loop = 6; },
    chat() { const f = el('div', 'chatf ch' + style); f.append(el('div', 'hd', Q.get('title') === '0' ? '' : (Q.get('title') || 'CHAT'))); root.append(f); window.__loop = 6; },
  };
  root.classList.remove('s' + style); root.classList.add('s' + style); if (name === 'cam' || name === 'chat') root.style.setProperty('--h', h + 'px');
  (B[name] || B['social-bar'])();
  freezeTime(); window.ready = true;
})();
