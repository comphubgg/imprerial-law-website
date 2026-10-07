// Öffentliche Seite: rendert alles aus /api/data. Kein innerHTML mit Nutzerdaten (XSS-sicher).
const $ = (s, r = document) => r.querySelector(s);
function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v);
  }
  for (const c of kids.flat()) if (c != null && c !== false && c !== undefined) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
}
const safeUrl = u => { try { const x = new URL(u, location.origin); return ['http:', 'https:'].includes(x.protocol) ? x.href : ''; } catch { return ''; } };
const BASE = { x: 'https://x.com/', twitch: 'https://twitch.tv/', youtube: 'https://youtube.com/@', instagram: 'https://instagram.com/', tiktok: 'https://tiktok.com/@', discord: 'https://discord.gg/' };
const LABEL = { x: 'X', twitch: 'Twitch', youtube: 'YouTube', instagram: 'Insta', tiktok: 'TikTok', discord: 'Discord' };
const socUrl = (k, v) => { v = (v || '').trim(); if (!v) return ''; if (/^https?:\/\//i.test(v)) return safeUrl(v); return safeUrl(BASE[k] + v.replace(/^@/, '')); };
const socials = (o = {}) => { const a = Object.keys(LABEL).map(k => [k, socUrl(k, o[k])]).filter(x => x[1]); return a.length ? h('div', { class: 'soc' }, a.map(([k, u]) => h('a', { href: u, target: '_blank', rel: 'noopener noreferrer' }, LABEL[k]))) : null; };
const chan = s => (s || '').replace(/^.*twitch\.tv\//, '').replace(/[^A-Za-z0-9_]/g, '');
const photo = (src, fallback) => h('div', { class: 'ph' }, src && safeUrl(src) ? h('img', { src: safeUrl(src), alt: '', loading: 'lazy' }) : (fallback || '').slice(0, 2).toUpperCase());
const fmtDate = d => { try { return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return d; } };

let D, LIVE = { enabled: false, live: {} };

function section(id, title, accent, sub, ...body) {
  return h('section', { id }, h('div', { class: 'wrap' },
    h('div', { class: 'sec-h' }, h('h2', {}, title + ' ', h('span', {}, accent)), sub ? h('p', {}, sub) : null), ...body));
}

function hero() {
  const o = D.org, ch = chan(o.twitchChannel), isLive = ch && LIVE.live[ch.toLowerCase()];
  let box;
  if (ch && (isLive || !LIVE.enabled)) {
    box = h('div', { class: 'stream' }, h('iframe', { src: `https://player.twitch.tv/?channel=${ch}&parent=${location.hostname}&muted=true`, allowfullscreen: 'true', title: 'Twitch' }));
  } else {
    box = h('div', { class: 'stream' }, h('div', { class: 'off' }, h('img', { src: o.logo || '/logo.svg', alt: '' }),
      h('b', {}, ch ? 'Gerade offline' : 'Stream folgt bald'), h('span', {}, ch ? 'Sei dabei, sobald wir live gehen.' : 'Kanal im Admin-Panel hinterlegen.')));
  }
  const words = o.name.split(' ');
  return h('section', { class: 'hero' }, h('div', { class: 'wrap grid' },
    h('div', {}, isLive ? h('span', { class: 'badge live' }, 'Live jetzt') : null,
      h('div', { class: 'tag' }, o.tagline),
      h('h1', {}, words.length > 1 ? [words[0], ' ', h('em', {}, words.slice(1).join(' '))] : h('em', {}, words[0])),
      h('p', {}, o.description),
      h('div', { class: 'btns' }, h('a', { class: 'btn fill', href: '#roster' }, 'Unser Team'), o.socials.twitch ? h('a', { class: 'btn', href: socUrl('twitch', o.socials.twitch), target: '_blank', rel: 'noopener' }, 'Twitch folgen') : h('a', { class: 'btn', href: '#news' }, 'News'))),
    box));
}

function playerCard(p) {
  return h('article', { class: 'card' }, photo(p.photo, p.handle),
    h('div', { class: 'in' }, h('div', { class: 'role' }, [p.role, p.country].filter(Boolean).join(' · ')), h('h3', {}, p.handle),
      p.realName ? h('p', {}, p.realName) : null, p.bio ? h('p', {}, p.bio) : null, socials(p.socials)));
}

function rosterSection(tier, id, title, accent, sub) {
  const teams = D.teams.filter(t => t.tier === tier && t.active !== false && (D.games.find(g => g.id === t.gameId) || {}).active !== false);
  const games = [...new Set(teams.map(t => t.gameId))].map(id => D.games.find(g => g.id === id)).filter(Boolean);
  const wrap = h('div', {});
  let current = games[0] && games[0].id;
  const draw = () => {
    wrap.replaceChildren();
    if (games.length > 1) wrap.append(h('div', { class: 'chips' }, games.map(g => h('button', { class: 'chip' + (g.id === current ? ' on' : ''), onclick: () => { current = g.id; draw(); } }, g.name))));
    const ts = teams.filter(t => t.gameId === current); let any = false;
    for (const t of ts) {
      const ps = D.players.filter(p => p.teamId === t.id && p.active !== false); if (!ps.length) continue; any = true;
      wrap.append(h('div', { class: 'team-h' }, t.name, ' ', h('span', { class: 'role', style: 'font-size:13px;color:var(--accent)' }, (D.games.find(g => g.id === t.gameId) || {}).name)), h('div', { class: 'cards' }, ps.map(playerCard)));
    }
    if (!any) wrap.append(h('div', { class: 'empty' }, 'Roster wird bald bekannt gegeben.'));
  };
  draw();
  return section(id, title, accent, sub, wrap);
}

function creators() {
  const cs = D.creators.filter(c => c.active !== false);
  return section('creators', 'Content', 'Creators', 'Streams, Clips und Community – die Gesichter hinter VIRIDIAN.',
    cs.length ? h('div', { class: 'cards' }, cs.map(c => {
      const ch = chan(c.twitchChannel), live = ch && LIVE.live[ch.toLowerCase()];
      return h('article', { class: 'card' }, live ? h('span', { class: 'badge live' }, 'Live') : null, photo(c.photo, c.handle),
        h('div', { class: 'in' }, h('div', { class: 'role' }, c.platform), h('h3', {}, c.handle), c.bio ? h('p', {}, c.bio) : null,
          live ? h('p', {}, `${live.viewers} Zuschauer · ${live.game || ''}`) : null,
          ch ? h('p', {}, h('a', { class: 'btn', style: 'padding:6px 14px;font-size:12px', href: 'https://twitch.tv/' + ch, target: '_blank', rel: 'noopener' }, 'Zum Stream')) : null, socials(c.socials)));
    })) : h('div', { class: 'empty' }, 'Noch keine Creators.'));
}

function shows() {
  const ss = D.shows.filter(s => s.active !== false);
  return section('shows', 'Eigene', 'Shows', 'Formate nur von uns – regelmäßig, live und on demand.',
    ss.length ? h('div', { class: 'cards', style: 'grid-template-columns:repeat(auto-fill,minmax(300px,1fr))' }, ss.map(s => h('article', { class: 'card post' }, s.image ? photo(s.image) : null,
      h('div', { class: 'in' }, h('time', {}, s.schedule || ''), h('h3', {}, s.title), h('p', {}, s.description),
        safeUrl(s.link) ? h('a', { class: 'btn', style: 'padding:6px 14px;font-size:12px', href: safeUrl(s.link), target: '_blank', rel: 'noopener' }, 'Ansehen') : null)))) : h('div', { class: 'empty' }, 'Shows folgen.'));
}

function matches() {
  const ms = [...D.matches].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 12);
  if (!ms.length) return null;
  return section('matches', 'Letzte', 'Matches', null, h('table', { class: 'table' },
    h('thead', {}, h('tr', {}, ['Datum', 'Team', 'Event', 'Ergebnis'].map(x => h('th', {}, x)))),
    h('tbody', {}, ms.map(m => h('tr', {}, h('td', {}, fmtDate(m.date)), h('td', {}, (D.teams.find(t => t.id === m.teamId) || {}).name || '–'), h('td', { class: 'hide-s' }, m.event || ''),
      h('td', { class: m.result === 'win' ? 'win' : m.result === 'loss' ? 'loss' : '' }, m.score || (m.result || '–')))))));
}

function news() {
  const ns = [...D.news].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 9);
  return section('news', 'Latest', 'News', null, ns.length ? h('div', { class: 'news' }, ns.map(n => h('article', { class: 'card post' }, n.image ? photo(n.image) : null, h('div', { class: 'in' }, h('time', {}, fmtDate(n.date)), h('h3', {}, n.title), h('p', {}, n.body))))) : h('div', { class: 'empty' }, 'Keine News.'));
}

function sponsors() {
  if (!D.sponsors.length) return null;
  return section('partners', 'Unsere', 'Partner', null, h('div', { class: 'spons' }, D.sponsors.map(s => {
    const u = safeUrl(s.url); const inner = s.logo && safeUrl(s.logo) ? h('img', { src: safeUrl(s.logo), alt: s.name }) : s.name;
    return u ? h('a', { href: u, target: '_blank', rel: 'noopener sponsored' }, inner) : h('a', {}, inner);
  })));
}

function about() {
  const pros = D.players.filter(p => p.active !== false).length;
  return section('about', 'Über', D.org.name, null, h('div', { class: 'about' }, h('p', {}, D.org.description),
    h('div', { class: 'stats' }, [[pros, 'Spieler'], [D.games.filter(g => g.active !== false).length, 'Spiele'], [D.creators.filter(c => c.active !== false).length, 'Creators'], [D.sponsors.length, 'Partner']].map(([n, l]) => h('div', { class: 'stat' }, h('b', {}, String(n)), l)))));
}

function build() {
  const o = D.org;
  document.title = `${o.name} Esports`;
  document.documentElement.style.setProperty('--accent', o.accent || '#14E27A');
  document.documentElement.style.setProperty('--accent2', o.accent2 || '#C6FF3D');
  $('#brandName').textContent = o.name; $('#brandLogo').src = o.logo || '/logo.svg';
  const links = [['#roster', 'Roster'], o.showAcademy && ['#academy', 'Academy'], o.showCreators && ['#creators', 'Creators'], o.showShows && ['#shows', 'Shows'], ['#news', 'News'], D.sponsors.length && ['#partners', 'Partner']].filter(Boolean);
  const menu = $('#menu'); menu.replaceChildren(...links.map(([hr, t]) => h('a', { href: hr, onclick: () => menu.classList.remove('open') }, t)));
  if (o.shopUrl && safeUrl(o.shopUrl)) menu.append(h('a', { href: safeUrl(o.shopUrl), target: '_blank', rel: 'noopener' }, 'Shop'));
  const main = $('#top'); main.replaceChildren(...[hero(),
    rosterSection('pro', 'roster', 'Pro', 'Roster', 'Die Spieler, die für uns in den Wettbewerb gehen.'),
    matches(), o.showAcademy ? rosterSection('academy', 'academy', 'Unsere', 'Academy', 'Die nächste Generation – Talente mit Plan.') : null,
    o.showCreators ? creators() : null, o.showShows ? shows() : null, news(), sponsors(), about()].filter(Boolean));
  const f = $('#footer'); f.replaceChildren(h('b', {}, o.name), h('div', {}, o.tagline), socials(o.socials) || '',
    h('div', {}, o.contactEmail ? h('a', { href: 'mailto:' + o.contactEmail }, o.contactEmail) : ''),
    h('div', { style: 'margin-top:10px;font-size:13px' }, `© ${new Date().getFullYear()} ${o.name} · `, h('a', { href: '/legal.html#impressum' }, 'Impressum'), ' · ', h('a', { href: '/legal.html#datenschutz' }, 'Datenschutz')));
}

async function init() {
  $('#burger').addEventListener('click', () => $('#menu').classList.toggle('open'));
  try {
    D = await (await fetch('/api/data')).json(); try { LIVE = await (await fetch('/api/live')).json(); } catch {}
    build(); setInterval(async () => { try { LIVE = await (await fetch('/api/live')).json(); build(); } catch {} }, 120000);
  } catch { $('#top').textContent = 'Seite konnte nicht geladen werden.'; }
}
init();
