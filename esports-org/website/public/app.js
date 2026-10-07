// VALIOUX Frontend – rendert alles aus /api/data. Nutzerdaten gehen nie über innerHTML (XSS-sicher); nur feste Icon-Konstanten.
const $ = (s, r = document) => r.querySelector(s);
function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v); else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(Infinity)) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c)));
  return e;
}
const safeUrl = u => { try { const x = new URL(u, location.origin); return ['http:', 'https:'].includes(x.protocol) ? x.href : ''; } catch { return ''; } };
const isInternal = u => typeof u === 'string' && u.startsWith('/') && !u.startsWith('//');
const BASE = { x: 'https://x.com/', twitch: 'https://twitch.tv/', youtube: 'https://youtube.com/@', instagram: 'https://instagram.com/', tiktok: 'https://tiktok.com/@', discord: 'https://discord.gg/', facebook: 'https://facebook.com/', linkedin: 'https://linkedin.com/company/' };
const SOCNAME = { x: 'X', instagram: 'Instagram', youtube: 'YouTube', tiktok: 'TikTok', discord: 'Discord', twitch: 'Twitch', facebook: 'Facebook', linkedin: 'LinkedIn' };
const socUrl = (k, v) => { v = (v || '').trim(); if (!v) return ''; if (/^https?:\/\//i.test(v)) return safeUrl(v); return safeUrl(BASE[k] + v.replace(/^@/, '')); };
const svgEl = (d, vb = '0 0 24 24') => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', vb); s.setAttribute('aria-hidden', 'true'); const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', d); s.append(p); return s; };
const IC = { search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.3-4.3', menu: 'M4 6h16M4 12h16M4 18h16', close: 'M5 5l14 14M19 5L5 19', left: 'M15 5l-7 7 7 7', right: 'M9 5l7 7-7 7', pause: 'M8 5v14M16 5v14', play: 'M7 4l12 8-12 8z', arrow: 'M5 12h14M13 6l6 6-6 6', ext: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6', chev: 'M6 9l6 6 6-6' };
const ico = n => { const s = svgEl(IC[n]); s.style.cssText = 'width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round'; return s; };
const socIcon = k => { if (window.ICONS && ICONS[k]) return svgEl(ICONS[k]); return h('b', {}, 'in'); };
const flag = cc => /^[A-Za-z]{2}$/.test(cc || '') ? String.fromCodePoint(...[...cc.toUpperCase()].map(c => 127397 + c.charCodeAt(0))) : '';
const LOC = { en: 'en-GB', de: 'de-DE', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', pt: 'pt-PT' };
const fmtDate = (d, withTime) => { try { return new Date(d).toLocaleString(LOC[LANG] || 'en-GB', withTime ? { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' } : { year: 'numeric', month: 'short', day: 'numeric' }); } catch { return d || ''; } };
const byOrder = (a, b) => (+a.order || 999) - (+b.order || 999);
const chan = s => (s || '').replace(/^.*twitch\.tv\//, '').replace(/[^A-Za-z0-9_]/g, '');
const initials = s => (s || '?').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

let D, LIVE = { enabled: false, live: {} };
const act = a => (a || []).filter(x => x.active !== false);
const gameOf = t => (D.games.find(g => g.id === t.gameId) || {});
const teamsList = () => act(D.teams).filter(t => gameOf(t).active !== false).sort(byOrder);
const slugOf = t => t.slug || t.id;

// ---------- Links / Router ----------
function A(href, attrs, ...kids) {
  if (isInternal(href)) return h('a', { href, 'data-nav': '1', ...attrs }, ...kids);
  const u = safeUrl(href); return h('a', { href: u || '#', target: '_blank', rel: 'noopener noreferrer', ...attrs }, ...kids);
}
function go(path) { if (path !== location.pathname) history.pushState({}, '', path); render(); window.scrollTo(0, 0); }
document.addEventListener('click', e => {
  const a = e.target.closest('a[data-nav]'); if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
  e.preventDefault(); closeDrawer(); go(a.getAttribute('href'));
});
window.addEventListener('popstate', render);

// ---------- Teile ----------
function logoImg(o) { return (o.themeLogos || {})[o.theme] || o.logo || '/logo.png'; }
function socials(o = {}, keys = Object.keys(SOCNAME)) {
  const links = keys.map(k => [k, socUrl(k, o[k])]).filter(x => x[1]);
  return links.length ? h('div', { class: 'soc' }, links.map(([k, u]) => h('a', { href: u, target: '_blank', rel: 'noopener noreferrer', 'aria-label': SOCNAME[k], title: SOCNAME[k] }, socIcon(k)))) : null;
}
function langSelect() {
  const s = h('select', { class: 'lang', 'aria-label': T('lang'), onchange: e => { setLang(e.target.value); render(); } }, Object.entries(LANGS).map(([k, n]) => h('option', { value: k }, k.toUpperCase() + ' · ' + n)));
  s.value = LANG; return s;
}
function navLinks() {
  return (D.org.navLinks || '').split('\n').map(l => l.split('|')).filter(p => p[0] && p[1]).map(p => ({ label: p[0].trim(), url: p[1].trim() }));
}
function thumb(img, label) { return h('span', { class: 'thumb', style: img && safeUrl(img) ? { backgroundImage: `url("${safeUrl(img)}")` } : {} }, img ? '' : initials(label)); }
function teamMenuItems() {
  return [...teamsList().map(t => A('/team/' + slugOf(t), {}, thumb(t.image, t.name), TR(t, 'name') || t.name)),
    A('/teams', {}, T('nav.allTeams')), A('/creators', {}, T('nav.creators'))];
}
function shopMenuItems() {
  const ps = act(D.products).sort(byOrder).slice(0, 4);
  return [...ps.map(p => A('/product/' + p.id, {}, thumb(p.image || p.viewFront, p.name), p.name)), A('/shop', {}, T('nav.allProducts'))];
}
function hasShop() { return act(D.products).length > 0 || !!D.org.shopUrl; }

function header() {
  const o = D.org;
  const mk = (label, items) => h('div', { class: 'dd' }, h('button', { 'aria-haspopup': 'true' }, label, ico('chev')), h('div', { class: 'menu' }, items));
  const nav = h('nav', { class: 'nav', 'aria-label': 'Main' },
    hasShop() ? mk(T('nav.shop'), shopMenuItems()) : null, mk(T('nav.teams'), teamMenuItems()),
    A('/news', {}, T('nav.news')), A('/about', {}, T('nav.about')), A('/partners', {}, T('nav.partners')),
    navLinks().map(l => A(l.url, {}, l.label, ' ', ico('ext'))));
  return h('div', {}, o.promoText ? h('div', { class: 'promo' }, o.promoLink ? A(o.promoLink, {}, TR(o, 'promoText')) : TR(o, 'promoText')) : null,
    h('header', { class: 'top noise' }, h('div', { class: 'bar' },
      h('button', { class: 'ib burger', 'aria-label': T('menu'), onclick: openDrawer }, ico('menu')),
      A('/', { class: 'logo', 'aria-label': o.name }, h('img', { src: logoImg(o), alt: o.name })), nav,
      h('div', { class: 'tools' }, h('button', { class: 'ib', 'aria-label': T('search'), onclick: openSearch }, ico('search')), langSelect()))));
}

let drawerEl;
function buildDrawer() {
  const o = D.org; const body = h('nav', {});
  const root = () => { body.replaceChildren(
    hasShop() ? h('button', { onclick: () => sub(T('nav.shop'), shopMenuItems()) }, T('nav.shop'), ico('arrow')) : null,
    h('button', { onclick: () => sub(T('nav.teams'), teamMenuItems()) }, T('nav.teams'), ico('arrow')),
    A('/news', {}, T('nav.news')), A('/about', {}, T('nav.about')), A('/partners', {}, T('nav.partners')), navLinks().map(l => A(l.url, {}, l.label, ico('ext')))); };
  const sub = (title, items) => body.replaceChildren(h('button', { onclick: root, style: { background: 'rgba(255,255,255,.06)', fontSize: '12px' } }, ico('left'), ' ', title), h('div', { class: 'sub' }, items));
  root();
  drawerEl = h('div', { class: 'drawer', role: 'dialog', 'aria-modal': 'true' }, h('div', { class: 'bg', onclick: closeDrawer }),
    h('div', { class: 'panel noise' }, h('div', { class: 'ph' }, h('button', { class: 'ib', 'aria-label': 'Close', onclick: closeDrawer }, ico('close')), A('/', { class: 'logo' }, h('img', { src: logoImg(o), alt: o.name }))),
      body, h('div', { class: 'foot' }, langSelect(), socials(o.socials, ['x', 'facebook', 'instagram', 'tiktok', 'youtube']))));
  return drawerEl;
}
const openDrawer = () => drawerEl && drawerEl.classList.add('open');
const closeDrawer = () => drawerEl && drawerEl.classList.remove('open');

// Suche
let searchEl;
function buildSearch() {
  const out = h('div', { class: 'rs' }); const inp = h('input', { type: 'search', placeholder: T('searchPh'), 'aria-label': T('search') });
  const idx = () => [
    ...teamsList().map(t => ({ t: t.name, s: T('nav.teams'), u: '/team/' + slugOf(t) })),
    ...act(D.players).map(p => ({ t: p.handle, s: (D.teams.find(x => x.id === p.teamId) || {}).name || T('roster'), u: '/team/' + slugOf(D.teams.find(x => x.id === p.teamId) || {}) })),
    ...act(D.creators).map(c => ({ t: c.handle, s: T('nav.creators'), u: '/creators' })), ...D.news.map(n => ({ t: TR(n, 'title'), s: T('nav.news'), u: '/news/' + n.id })),
    ...D.pages.map(p => ({ t: TR(p, 'title'), s: '', u: '/page/' + p.slug }))];
  inp.addEventListener('input', () => {
    const q = inp.value.trim().toLowerCase(); out.replaceChildren(); if (!q) return;
    const r = idx().filter(x => (x.t || '').toLowerCase().includes(q)).slice(0, 12);
    out.append(...(r.length ? r.map(x => A(x.u, { onclick: closeSearch }, x.t, h('small', {}, x.s))) : [h('div', { class: 'empty', style: { padding: '16px 22px', color: '#6b7280' } }, T('noResults'))]));
  });
  searchEl = h('div', { class: 'search', role: 'dialog', 'aria-modal': 'true', onclick: e => { if (e.target === searchEl) closeSearch(); } }, h('div', { class: 'box' }, inp, out));
  searchEl._inp = inp; return searchEl;
}
const openSearch = () => { searchEl.classList.add('open'); searchEl._inp.focus(); };
const closeSearch = () => searchEl && searchEl.classList.remove('open');
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeSearch(); closeDrawer(); } });

// Hero Slider
function heroSlider() {
  const slides = act(D.slides).sort(byOrder); if (!slides.length) return null;
  let i = 0, paused = false, timer;
  const root = h('section', { class: 'hero', 'aria-roledescription': 'carousel' });
  const els = slides.map(s => {
    const bg = s.image && safeUrl(s.image) ? { backgroundImage: `url("${safeUrl(s.image)}")` } : {};
    const ws = TR(s, 'title').split(' ');
    const inner = h('div', { class: 'txt' }, h('h1', {}, ws.length > 2 ? [ws.slice(0, 2).join(' '), h('span', {}, ws.slice(2).join(' '))] : ws.map((w, k) => h('span', {}, w))),
      s.subtitle ? h('div', { class: 'sub' }, TR(s, 'subtitle')) : null, s.cta && s.link ? A(s.link, { class: 'cta' }, TR(s, 'cta')) : null);
    return h('div', { class: 'slide s-' + (s.style || 'night'), style: bg }, inner);
  });
  const bars = h('div', { class: 'bars' }, slides.map((_, k) => h('i', { onclick: () => show(k) })));
  const show = k => { i = (k + slides.length) % slides.length; els.forEach((e, n) => e.classList.toggle('on', n === i)); [...bars.children].forEach((b, n) => { b.classList.remove('on'); void b.offsetWidth; if (n === i) b.classList.add('on'); }); clearTimeout(timer); if (!paused && slides.length > 1) timer = setTimeout(() => show(i + 1), 6500); };
  const pb = h('button', { 'aria-label': 'Pause', onclick: () => { paused = !paused; root.classList.toggle('paused', paused); pb.replaceChildren(ico(paused ? 'play' : 'pause')); show(i); } }, ico('pause'));
  root.append(...els, bars, slides.length > 1 ? h('div', { class: 'ctl' }, h('button', { 'aria-label': 'Previous', onclick: () => show(i - 1) }, ico('left')), h('button', { 'aria-label': 'Next', onclick: () => show(i + 1) }, ico('right')), pb) : null);
  let x0 = null; root.addEventListener('touchstart', e => x0 = e.touches[0].clientX, { passive: true }); root.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1)); x0 = null; });
  show(0); root._stop = () => clearTimeout(timer); return root;
}

function marquee() {
  const ss = act(D.sponsors).sort(byOrder); if (!ss.length) return null;
  const item = s => { const inner = s.logo && safeUrl(s.logo) ? h('img', { src: safeUrl(s.logo), alt: s.name, loading: 'lazy' }) : s.name; return s.url ? A(s.url, { 'aria-label': s.name }, inner) : h('span', {}, inner); };
  const set = () => ss.map(item);
  return h('div', { class: 'marq', 'aria-label': T('nav.partners') }, h('div', { class: 'track' }, set(), set(), set(), set()));
}

function sectionHead(title, linkText, href) { return h('div', { class: 'hd' }, h('h2', {}, title), href ? A(href, { class: 'more' }, linkText) : null); }
function shopSection() {
  const ps = act(D.products).sort(byOrder).slice(0, 5); if (!ps.length) return null;
  return h('section', { class: 'sec' }, sectionHead(T('fromShop'), T('allProducts'), D.org.shopUrl && safeUrl(D.org.shopUrl) ? D.org.shopUrl : '/shop'),
    h('div', { class: 'shop grid-line' }, ps.map(p => A('/product/' + p.id, { class: 'pc' }, h('div', { class: 'im' }, (p.image || p.viewFront) && safeUrl(p.image || p.viewFront) ? h('img', { src: safeUrl(p.image || p.viewFront), alt: p.name, loading: 'lazy' }) : initials(p.name)), h('div', { class: 'in' }, p.name, h('b', {}, p.price || ''))))));
}

// Matches
const teamName = t => `${D.org.name} ${t ? t.name : ''}`.trim();
function untilText(dt) {
  const ms = new Date(dt) - Date.now(); if (isNaN(ms)) return ''; if (ms <= 0) return T('liveNow');
  const m = Math.floor(ms / 60000), d = Math.floor(m / 1440), hh = Math.floor((m % 1440) / 60);
  return d >= 1 ? TF('inDays', { d, h: hh }) : hh >= 1 ? TF('inHours', { h: hh, m: m % 60 }) : TF('inMin', { m });
}
function circle(img, label, small) { return h('div', { class: 'circ' + (small ? ' sm' : '') }, img && safeUrl(img) ? h('img', { src: safeUrl(img), alt: '' }) : initials(label)); }
function matchesSection() {
  const ms = D.matches || [];
  const up = ms.filter(m => m.status === 'upcoming' && new Date(m.datetime) > Date.now() - 3 * 3600e3).sort((a, b) => new Date(a.datetime) - new Date(b.datetime)).slice(0, 4);
  const done = ms.filter(m => m.status === 'finished').sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
  if (!up.length && !done.length) return null;
  const left = h('div', { class: 'col' }), right = h('div', { class: 'col res' });
  // Next up
  let cur = 0; const nu = h('div', { class: 'nu' });
  const drawNu = () => {
    nu.replaceChildren();
    if (!up.length) { nu.append(h('div', { class: 'empty' }, T('noUpcoming'))); return; }
    const m = up[cur], t = D.teams.find(x => x.id === m.teamId);
    nu.append(h('div', {}, h('div', { class: 'meta' }, h('span', {}, gameOf(t || {}).name || ''), h('span', {}, fmtDate(m.datetime, true), h('b', {}, untilText(m.datetime)))),
      h('div', { class: 'vsrow' }, h('div', { class: 't' }, circle(logoImg(D.org), D.org.name), teamName(t)), h('div', { class: 'vs' }, T('vs')), h('div', { class: 't' }, circle(m.opponentLogo, m.opponent), m.opponent)),
      h('div', { class: 'ev' }, m.event || ''), m.streamLink ? h('div', { class: 'wl' }, A(m.streamLink, { class: 'btn2' }, T('watchLive'))) : null),
      up.length > 1 ? h('div', { class: 'tabs' }, up.map((u, k) => h('button', { class: k === cur ? 'on' : '', 'aria-label': u.opponent, onclick: () => { cur = k; drawNu(); } }, circle(logoImg(D.org), D.org.name, true), circle(u.opponentLogo, u.opponent, true)))) : null);
  };
  drawNu(); left.append(h('h2', {}, T('nextUp')), nu);
  // Results
  let filt = 'all', page = 0; const list = h('div', {}), chips = h('div', { class: 'chips' }), arr = h('div', { class: 'arrows' });
  const games = [...new Set(done.map(m => gameOf(D.teams.find(t => t.id === m.teamId) || {}).name).filter(Boolean))];
  const drawRes = () => {
    const rows = done.filter(m => filt === 'all' || gameOf(D.teams.find(t => t.id === m.teamId) || {}).name === filt), per = 5, pages = Math.max(1, Math.ceil(rows.length / per)); page = Math.min(page, pages - 1);
    chips.replaceChildren(...['all', ...games].map(g => h('button', { class: 'chip' + (g === filt ? ' on' : ''), onclick: () => { filt = g; page = 0; drawRes(); } }, g === 'all' ? T('all') : g)));
    const prev = h('button', { 'aria-label': 'Previous', disabled: page === 0, onclick: () => { page--; drawRes(); } }, ico('left')), next = h('button', { 'aria-label': 'Next', disabled: page >= pages - 1, onclick: () => { page++; drawRes(); } }, ico('right'));
    arr.replaceChildren(prev, next);
    list.replaceChildren(...(rows.length ? rows.slice(page * per, page * per + per).map(m => {
      const t = D.teams.find(x => x.id === m.teamId), a = +m.scoreHome, b = +m.scoreAway, ok = !isNaN(a) && !isNaN(b) && m.scoreHome !== '' && m.scoreAway !== '';
      return h('div', { class: 'rrow' }, h('div', { class: 'l' }, h('b', {}, `${teamName(t)} ${T('vs')} ${m.opponent}`), h('span', {}, [m.event, fmtDate(m.datetime)].filter(Boolean).join(' · '))),
        h('div', { class: 'sc' }, circle(logoImg(D.org), D.org.name, true), circle(m.opponentLogo, m.opponent, true), ok ? [h('span', { class: a > b ? 'w' : a < b ? 'x' : '' }, String(a)), h('span', { class: b > a ? 'w' : b < a ? 'x' : '' }, String(b))] : h('span', {}, m.score || '')));
    }) : [h('div', { class: 'empty' }, T('noResults2'))]));
  };
  drawRes(); right.append(h('div', { class: 'top' }, h('h2', {}, T('results')), arr), chips, list);
  return h('section', { class: 'mr' }, h('div', { class: 'cols' }, left, right));
}

function teamsSection() {
  const ts = teamsList(); if (!ts.length) return null;
  return h('section', { class: 'sec' }, sectionHead(T('teams'), T('viewTeams'), '/teams'), h('div', { class: 'tcards grid-line' }, ts.map(teamCard)));
}
const bgStyle = u => (u && safeUrl(u)) ? { backgroundImage: `url("${safeUrl(u)}")` } : {};
const teamCard = t => A('/team/' + slugOf(t), { class: 'tcard' }, h('div', { class: 'im', style: bgStyle(t.image) }, h('div', { class: 'wmk' }, h('span', {}, (TR(t, 'wordmark') || t.name || '').toUpperCase()), t.subtitle ? h('small', {}, t.subtitle) : null)), h('div', { class: 'nm' }, TR(t, 'name') || t.name));
const newsCard = n => A('/news/' + n.id, { class: 'nc' }, h('div', { class: 'im' }, n.image && safeUrl(n.image) ? h('img', { src: safeUrl(n.image), alt: '', loading: 'lazy' }) : null), h('h3', {}, TR(n, 'title')), h('time', {}, fmtDate(n.date)));
const sortedNews = () => [...D.news].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
function newsSection() {
  const ns = sortedNews().slice(0, 3); if (!ns.length) return null;
  return h('section', { class: 'sec' }, sectionHead(T('latestNews'), T('viewAll'), '/news'), h('div', { class: 'news grid-line' }, ns.map(newsCard)));
}

function newsletter() {
  if (D.org.newsletter === false) return null;
  const inp = h('input', { type: 'email', placeholder: T('nl.ph'), required: true, 'aria-label': T('nl.ph'), autocomplete: 'email' }), msg = h('div', { class: 'msg', role: 'status' });
  const f = h('form', { onsubmit: async e => { e.preventDefault(); try { const r = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: inp.value }) }); msg.textContent = r.ok ? T('nl.ok') : T('nl.err'); if (r.ok) inp.value = ''; } catch { msg.textContent = T('nl.err'); } } }, inp, h('button', { type: 'submit' }, T('nl.btn')));
  return h('section', { class: 'nl noise' }, h('div', { class: 'wrap' }, h('h2', {}, T('nl.title')), h('p', {}, T('nl.text')), f, msg));
}

function footer() {
  const o = D.org, li = (href, text) => h('li', {}, A(href, {}, text));
  const pg = (slug, key) => D.pages.find(p => p.slug === slug) ? li('/page/' + slug, T(key)) : null;
  return h('footer', { class: 'ft noise' }, h('div', { class: 'cols' },
    h('div', {}, A('/', { class: 'logo' }, h('img', { src: logoImg(o), alt: o.name, style: { height: '56px' } })), h('p', { class: 'about' }, TR(o, 'footerText') || TR(o, 'description')), socials(o.socials), langSelect()),
    h('div', {}, h('h4', {}, T('f.shop')), h('ul', {}, hasShop() ? [li('/shop', T('nav.allProducts')), ...act(D.products).sort(byOrder).slice(0, 5).map(p => li('/product/' + p.id, p.name))] : h('li', {}, T('shopEmpty')))),
    h('div', {}, h('h4', {}, T('f.explore')), h('ul', {}, li('/', T('nav.home')), li('/teams', T('nav.teams')), li('/creators', T('nav.creators')), li('/partners', T('nav.partners')), li('/news', T('nav.news')), li('/about', T('nav.about')))),
    h('div', {}, h('h4', {}, T('f.partners')), h('ul', {}, act(D.sponsors).sort(byOrder).map(s => s.url ? h('li', {}, A(s.url, {}, s.name)) : h('li', {}, s.name)))),
    h('div', {}, h('h4', {}, T('f.legal')), h('ul', {}, pg('privacy', 'privacy'), pg('legal-notice', 'imprint'), pg('terms', 'terms'), pg('contact', 'contact')))),
    o.hashtag ? h('div', { class: 'tag', 'aria-hidden': 'true' }, o.hashtag) : null,
    h('div', { class: 'legalbar' }, h('span', {}, `© ${new Date().getFullYear()} ${o.name}`), o.contactEmail ? h('a', { href: 'mailto:' + o.contactEmail }, o.contactEmail) : null));
}

// ---------- Seiten ----------
function pageHead(title, sub, crumb, bg) {
  return h('section', { class: 'pagehead noise', style: bg && safeUrl(bg) ? { backgroundImage: `linear-gradient(90deg,rgba(11,11,13,.92),rgba(11,11,13,.5)),url("${safeUrl(bg)}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : {} },
    h('div', { class: 'wrap' }, crumb ? h('div', { class: 'crumb' }, A('/', {}, T('nav.home')), ' / ', crumb) : null, h('h1', {}, title), sub ? h('p', {}, sub) : null));
}
function prose(body) {
  const box = h('div', { class: 'prose' }); let ul = null;
  const inline = txt => { const out = []; let last = 0; txt.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u, idx) => { out.push(txt.slice(last, idx)); out.push(A(u, {}, t)); last = idx + m.length; return m; }); out.push(txt.slice(last)); return out; };
  for (const raw of (body || '').split('\n')) {
    const l = raw.trimEnd();
    if (/^##\s+/.test(l)) { ul = null; box.append(h('h2', {}, l.replace(/^##\s+/, ''))); }
    else if (/^[-*]\s+/.test(l)) { if (!ul) { ul = h('ul', {}); box.append(ul); } ul.append(h('li', {}, inline(l.replace(/^[-*]\s+/, '')))); }
    else if (l.trim()) { ul = null; box.append(h('p', {}, inline(l))); } else ul = null;
  }
  return box;
}
const SILH = 'M12 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10zM2 22c0-5.5 4.5-9 10-9s10 3.5 10 9z';
function playerCard(p) {
  const name = p.firstName || p.lastName ? [p.firstName, p.handle ? `"${p.handle}"` : '', p.lastName].filter(Boolean).join(' ') : (p.realName ? `${p.realName} "${p.handle}"` : p.handle);
  const wm = (D.org.hashtag || D.org.mark || D.org.name || '').replace('#', '').toUpperCase();
  return h('article', { class: 'pcard' }, h('div', { class: 'im' }, h('div', { class: 'band' }), h('div', { class: 'wm', 'aria-hidden': 'true' }, [0, 1, 2].map(() => h('span', {}, wm))),
      p.photo && safeUrl(p.photo) ? h('img', { src: safeUrl(p.photo), alt: p.handle, loading: 'lazy' }) : h('div', { class: 'sil', 'aria-hidden': 'true' }, svgEl(SILH))),
    h('div', { class: 'nm' }, h('span', {}, name), h('span', {}, flag(p.country))), p.role ? h('div', { class: 'rl' }, p.role) : null, TR(p, 'bio') ? h('p', {}, TR(p, 'bio')) : null, h('div', { class: 'sc' }, ['instagram', 'youtube', 'tiktok', 'x', 'twitch'].map(k => socUrl(k, (p.socials || {})[k]) ? h('a', { href: socUrl(k, p.socials[k]), target: '_blank', rel: 'noopener noreferrer', 'aria-label': SOCNAME[k] }, socIcon(k)) : null)));
}
function viewHome() {
  return [heroSlider(), marquee(), shopSection(), matchesSection(), teamsSection(), newsSection()];
}
function teamHero(t) {
  return h('section', { class: 'thero', style: bgStyle(t.image) }, h('div', { class: 'wrap' }, h('div', { class: 'wm', 'aria-hidden': 'true' }, h('span', {}, (TR(t, 'wordmark') || t.name || '').toUpperCase()), t.subtitle ? h('small', {}, t.subtitle) : null),
    h('div', { class: 'cap' }, h('div', { class: 'crumb' }, A('/', {}, T('nav.home')), ' / ', A('/teams', {}, T('nav.teams'))), h('h1', {}, TR(t, 'name') || t.name), TR(t, 'description') ? h('p', {}, TR(t, 'description')) : null)));
}
function viewTeams() { return [pageHead(T('nav.teams'), '', T('nav.teams')), h('section', { class: 'sec' }, h('div', { class: 'tcards grid-line' }, teamsList().map(teamCard)))]; }
function viewTeam(slug) {
  const t = teamsList().find(x => slugOf(x) === slug); if (!t) return view404();
  const ps = act(D.players).filter(p => p.teamId === t.id), ach = (D.achievements || []).filter(a => a.teamId === t.id).sort((a, b) => (b.year || '').localeCompare(a.year || ''));
  const scroller = h('div', { class: 'ach' }, ach.map(a => h('div', {}, h('div', { class: 'top' }, h('span', { class: 'badge' + (/^1/.test(a.placement) ? ' first' : '') }, String(a.placement || '').toUpperCase()), h('span', {}, a.year)), h('div', { class: 'lg' }, a.logo && safeUrl(a.logo) ? h('img', { src: safeUrl(a.logo), alt: '' }) : '🏆'), h('b', {}, TR(a, 'title')))));
  const rs = (D.matches || []).filter(m => m.teamId === t.id && m.status === 'finished').sort((a, b) => new Date(b.datetime) - new Date(a.datetime)).slice(0, 6);
  return [teamHero(t),
    h('section', { class: 'sec' }, sectionHead(T('roster')), ps.length ? h('div', { class: 'roster grid-line' }, ps.map(playerCard)) : h('div', { class: 'wrap empty', style: { color: '#6b7280' } }, T('rosterEmpty'))),
    ach.length ? h('section', { class: 'sec' }, sectionHead(T('achievements')), h('div', { class: 'hl' }, h('button', { 'aria-label': 'Previous', onclick: () => scroller.scrollBy({ left: -440, behavior: 'smooth' }) }, ico('left')), h('button', { 'aria-label': 'Next', onclick: () => scroller.scrollBy({ left: 440, behavior: 'smooth' }) }, ico('right'))), scroller) : null,
    rs.length ? h('section', { class: 'mr' }, h('div', { class: 'cols', style: { gridTemplateColumns: '1fr' } }, h('div', { class: 'col', style: { minHeight: 0 } }, h('h2', {}, T('teamResults')), rs.map(m => h('div', { class: 'rrow' }, h('div', { class: 'l' }, h('b', {}, `${teamName(t)} ${T('vs')} ${m.opponent}`), h('span', {}, [m.event, fmtDate(m.datetime)].filter(Boolean).join(' · '))), h('div', { class: 'sc' }, h('span', { class: m.result === 'win' ? 'w' : m.result === 'loss' ? 'x' : '' }, `${m.scoreHome}:${m.scoreAway}`)))))) ) : null];
}
function viewCreators() {
  const cs = act(D.creators);
  return [pageHead(T('nav.creators'), T('sub.creators'), T('nav.creators')), h('section', { class: 'sec' }, cs.length ? h('div', { class: 'roster grid-line' }, cs.map(c => {
    const ch = chan(c.twitchChannel), live = ch && LIVE.live[ch.toLowerCase()];
    return h('article', { class: 'pcard' }, h('div', { class: 'im' }, c.photo && safeUrl(c.photo) ? h('img', { src: safeUrl(c.photo), alt: c.handle, loading: 'lazy' }) : initials(c.handle)),
      h('div', { class: 'nm' }, h('span', {}, c.handle), live ? h('span', { class: 'badge first' }, T('liveNow').toUpperCase()) : null), h('div', { class: 'rl' }, c.platform), TR(c, 'bio') ? h('p', {}, TR(c, 'bio')) : null,
      ch ? h('p', {}, A('https://twitch.tv/' + ch, { class: 'more' }, T('toStream'))) : null, h('div', { class: 'sc' }, ['instagram', 'youtube', 'tiktok', 'x', 'twitch'].map(k => socUrl(k, (c.socials || {})[k]) ? h('a', { href: socUrl(k, c.socials[k]), target: '_blank', rel: 'noopener noreferrer', 'aria-label': SOCNAME[k] }, socIcon(k)) : null)));
  })) : h('div', { class: 'wrap empty', style: { color: '#6b7280' } }, T('noCreators')))];
}
function viewNews() { return [pageHead(T('nav.news'), '', T('nav.news')), h('section', { class: 'sec' }, h('div', { class: 'news grid-line' }, sortedNews().map(newsCard)))]; }
function viewArticle(id) {
  const n = D.news.find(x => x.id === id); if (!n) return view404();
  return [pageHead(TR(n, 'title'), fmtDate(n.date), A('/news', {}, T('nav.news'))), h('div', {}, n.image && safeUrl(n.image) ? h('div', { class: 'prose', style: { paddingBottom: 0 } }, h('img', { class: 'art-im', src: safeUrl(n.image), alt: '' })) : null, prose(TR(n, 'body')))];
}
function viewShop() {
  const ps = act(D.products).sort(byOrder);
  return [pageHead(T('nav.shop'), '', T('nav.shop')), h('section', { class: 'sec' }, ps.length ? h('div', { class: 'tcards grid-line' }, ps.map(p => A('/product/' + p.id, { class: 'pc' }, h('div', { class: 'im' }, (p.image || p.viewFront) && safeUrl(p.image || p.viewFront) ? h('img', { src: safeUrl(p.image || p.viewFront), alt: p.name, loading: 'lazy' }) : initials(p.name)), h('div', { class: 'in' }, p.name, h('b', {}, p.price || ''))))) : h('div', { class: 'wrap empty', style: { color: '#6b7280' } }, T('shopEmpty')),
    D.org.shopUrl && safeUrl(D.org.shopUrl) ? h('div', { class: 'wrap', style: { padding: '24px' } }, A(D.org.shopUrl, { class: 'more' }, T('nav.shop'))) : null)];
}
let spinTimer = null;
function viewProduct(id) {
  const p = D.products.find(x => x.id === id && x.active !== false); if (!p) return view404();
  const names = { front: 'Front', back: 'Back', left: 'Left', right: 'Right', top: 'Top', bottom: 'Bottom' };
  let views = [['front', 'viewFront'], ['back', 'viewBack'], ['left', 'viewLeft'], ['right', 'viewRight'], ['top', 'viewTop'], ['bottom', 'viewBottom']].filter(([, f]) => p[f] && safeUrl(p[f])).map(([k, f]) => ({ k, src: safeUrl(p[f]) }));
  if (!views.length && p.image && safeUrl(p.image)) views = [{ k: 'front', src: safeUrl(p.image) }];
  let cur = 0; const stage = h('div', { class: 'pv-stage', role: 'img', 'aria-label': p.name }), bar = h('div', { class: 'pv-bar' }), thumbs = h('div', { class: 'pv-thumbs' });
  const imgs = views.map(v => h('img', { src: v.src, alt: p.name + ' – ' + v.k, loading: 'lazy' })); stage.append(...imgs);
  const show = i => { cur = (i + views.length) % views.length; imgs.forEach((im, k) => im.classList.toggle('on', k === cur)); [...bar.querySelectorAll('button[data-i]')].forEach(b => b.classList.toggle('on', +b.dataset.i === cur)); [...thumbs.children].forEach((t, k) => t.classList.toggle('on', k === cur)); };
  const stop = () => { clearInterval(spinTimer); spinTimer = null; spin.classList.remove('on'); };
  const spin = h('button', { class: 'spin', onclick: () => { if (spinTimer) return stop(); spin.classList.add('on'); spinTimer = setInterval(() => show(cur + 1), 1100); } }, '360° spin');
  views.forEach((v, i) => { bar.append(h('button', { 'data-i': i, onclick: () => { stop(); show(i); } }, names[v.k])); thumbs.append(h('button', { 'aria-label': names[v.k], onclick: () => { stop(); show(i); } }, h('img', { src: v.src, alt: '' }))); });
  if (views.length > 1) bar.append(spin);
  let x0 = null; stage.addEventListener('touchstart', e => x0 = e.touches[0].clientX, { passive: true }); stage.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) { stop(); show(cur + (dx < 0 ? 1 : -1)); } x0 = null; });
  const buy = p.link && safeUrl(p.link) ? A(p.link, { class: 'cta2' }, T('buy')) : (D.org.shopUrl && safeUrl(D.org.shopUrl) ? A(D.org.shopUrl, { class: 'cta2' }, T('nav.shop')) : null);
  const more = act(D.products).sort(byOrder).filter(x => x.id !== p.id).slice(0, 4);
  const box = h('div', { class: 'pv' }, h('div', { class: 'pv-media' }, views.length ? [stage, bar, thumbs.children.length > 1 ? thumbs : null] : h('div', { class: 'pv-empty' }, h('b', {}, initials(p.name)), h('span', {}, T('shopEmpty')))),
    h('div', { class: 'pv-info' }, h('div', { class: 'role', style: { color: 'var(--mute)', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '.1em', fontWeight: 700 } }, p.kind || ''), h('h1', {}, p.name), h('div', { class: 'price' }, p.price || ''), h('p', {}, TR(p, 'description')), buy));
  if (views.length) show(0); if (views.length > 1) { spin.classList.add('on'); spinTimer = setInterval(() => show(cur + 1), 1400); }
  return [pageHead(T('nav.shop'), '', p.name), box, more.length ? h('section', { class: 'sec' }, sectionHead(T('fromShop'), T('allProducts'), '/shop'), h('div', { class: 'tcards grid-line' }, more.map(x => A('/product/' + x.id, { class: 'pc' }, h('div', { class: 'im' }, (x.image || x.viewFront) && safeUrl(x.image || x.viewFront) ? h('img', { src: safeUrl(x.image || x.viewFront), alt: x.name, loading: 'lazy' }) : initials(x.name)), h('div', { class: 'in' }, x.name, h('b', {}, x.price || '')))))) : null];
}
function viewPage(slug) {
  const p = D.pages.find(x => x.slug === slug); if (!p) return view404();
  const extra = slug === 'partners' ? h('section', { class: 'sec' }, h('div', { class: 'tcards grid-line' }, act(D.sponsors).sort(byOrder).map(s => h('div', { class: 'tcard' }, h('div', { class: 'im', style: { background: '#fff', color: '#111', aspectRatio: '16/9' } }, s.logo && safeUrl(s.logo) ? h('img', { src: safeUrl(s.logo), alt: s.name, style: { objectFit: 'contain', padding: '24px' } }) : s.name), h('div', { class: 'nm' }, s.url ? A(s.url, {}, s.name) : s.name, s.tier ? h('div', { style: { color: '#6b7280', fontWeight: 400 } }, s.tier) : null))))) : null;
  return [pageHead(TR(p, 'title'), '', TR(p, 'title')), prose(TR(p, 'body')), extra];
}
function viewLinks() { // Link-in-Bio-Seite (/links): für X, Instagram, TikTok, Twitch-Panels
  const o = D.org, items = [...Object.keys(SOCNAME).map(k => [k, SOCNAME[k], socUrl(k, (o.socials || {})[k])]).filter(x => x[2]).map(([k, n, u]) => ({ icon: k, label: n, url: u })),
    ...(hasShop() ? [{ label: T('nav.shop'), url: '/shop' }] : []), { label: T('nav.teams'), url: '/teams' }, { label: T('nav.news'), url: '/news' }];
  return h('div', { class: 'linkhub noise' }, h('img', { src: logoImg(o), alt: o.name }), h('h1', {}, o.name), h('p', { class: 'ht' }, o.hashtag || ''), TR(o, 'tagline') ? h('p', { class: 'tg' }, TR(o, 'tagline')) : null,
    h('div', { class: 'lk' }, items.map(i => A(i.url, { class: 'lkb' }, i.icon ? socIcon(i.icon) : null, h('span', {}, i.label)))), h('div', { class: 'lng' }, langSelect()));
}
function view404() { return [pageHead('404', T('notFound')), h('div', { class: 'prose' }, A('/', { class: 'more' }, T('backHome')))]; }

function render() {
  if (!D) return; const o = D.org;
  applyTheme(o.theme); document.documentElement.lang = LANG;
  const p = decodeURIComponent(location.pathname).replace(/\/+$/, '') || '/', seg = p.split('/').filter(Boolean);
  if (p === '/links') { document.title = o.name + ' · Links'; $('#app').replaceChildren(viewLinks()); return; }
  let v, title = '';
  if (p === '/') v = viewHome(); else if (p === '/teams') { v = viewTeams(); title = T('nav.teams'); } else if (seg[0] === 'team') { v = viewTeam(seg[1]); title = (D.teams.find(t => slugOf(t) === seg[1]) || {}).name || ''; }
  else if (p === '/creators') { v = viewCreators(); title = T('nav.creators'); } else if (p === '/news') { v = viewNews(); title = T('nav.news'); } else if (seg[0] === 'news') { v = viewArticle(seg[1]); title = (D.news.find(n => n.id === seg[1]) || {}).title || ''; }
  else if (seg[0] === 'product') { v = viewProduct(seg[1]); title = (D.products.find(x => x.id === seg[1]) || {}).name || ''; }
  else if (p === '/shop') { v = viewShop(); title = T('nav.shop'); } else if (p === '/about' || p === '/partners') { v = viewPage(seg[0]); title = T('nav.' + seg[0]); } else if (seg[0] === 'page') { v = viewPage(seg[1]); title = seg[1]; }
  else { v = view404(); title = '404'; }
  document.title = (title ? title + ' · ' : '') + o.name + ' Esports';
  clearInterval(spinTimer); spinTimer = null; const old = $('#app')._hero; if (old && old._stop) old._stop();
  const main = h('main', {}, v);
  $('#app')._hero = main.querySelector('.hero');
  $('#app').replaceChildren(header(), main, newsletter(), footer(), buildDrawer(), buildSearch());
}

async function init() {
  try {
    D = await (await fetch('/api/data')).json(); try { LIVE = await (await fetch('/api/live')).json(); } catch {}
    render();
    setInterval(async () => { try { LIVE = await (await fetch('/api/live')).json(); if (location.pathname === '/creators') render(); } catch {} }, 120000);
  } catch { $('#app').textContent = T('loadError'); }
}
init();
