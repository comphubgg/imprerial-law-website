// VALIOUX – Website + Admin-Backend. Keine Abhängigkeiten, Node >= 18.
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname, PUB = path.join(ROOT, 'public'), UPL = path.join(ROOT, 'uploads');
const DB_FILE = path.join(ROOT, 'data', 'db.json'), SEED = path.join(ROOT, 'data', 'seed.json');
let ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  ADMIN_PASSWORD = crypto.randomBytes(9).toString('base64url');
  console.log(`\n[!] ADMIN_PASSWORD nicht gesetzt. Temporäres Passwort: ${ADMIN_PASSWORD}\n    Setze es dauerhaft: ADMIN_PASSWORD=... node server.js\n`);
}
const COLLECTIONS = ['games', 'teams', 'players', 'creators', 'shows', 'news', 'matches', 'sponsors', 'slides', 'products', 'achievements', 'pages'];
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.txt': 'text/plain', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.json': 'application/json', '.ico': 'image/x-icon' };

function load() {
  if (!fs.existsSync(DB_FILE)) fs.copyFileSync(SEED, DB_FILE);
  const d = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')), seed = JSON.parse(fs.readFileSync(SEED, 'utf8'));
  // Migration: fehlende Sammlungen/Org-Felder aus dem Seed ergänzen (bestehende Daten bleiben unangetastet)
  for (const k of Object.keys(seed)) { if (k === 'org') d.org = { ...seed.org, ...d.org }; else if (d[k] === undefined) d[k] = seed[k]; }
  if (!d.subscribers) d.subscribers = [];
  return d;
}
let db = load();
function save() { const t = DB_FILE + '.tmp'; fs.writeFileSync(t, JSON.stringify(db, null, 2)); fs.renameSync(t, DB_FILE); }

// ---- Auth: Token im HttpOnly-Cookie, 12h gültig, Login-Rate-Limit
const sessions = new Map(); const fails = new Map(); const subFails = new Map();
const safeEq = (a, b) => { const x = crypto.createHash('sha256').update(String(a)).digest(), y = crypto.createHash('sha256').update(String(b)).digest(); return crypto.timingSafeEqual(x, y); };
const cookie = req => Object.fromEntries((req.headers.cookie || '').split(';').map(c => c.trim().split('=')).filter(c => c[0]));
const authed = req => { const t = cookie(req).vt; const s = t && sessions.get(t); if (s && s > Date.now()) return true; sessions.delete(t); return false; };

function send(res, code, body, headers = {}) {
  const isObj = typeof body === 'object' && !Buffer.isBuffer(body);
  res.writeHead(code, { 'Content-Type': isObj ? 'application/json' : 'text/plain', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin', ...headers });
  res.end(isObj ? JSON.stringify(body) : body);
}
function readBody(req, limit = 6e6) {
  return new Promise((ok, no) => { let n = 0; const c = [];
    req.on('data', d => { n += d.length; if (n > limit) { no(new Error('too large')); req.destroy(); } else c.push(d); });
    req.on('end', () => ok(Buffer.concat(c).toString())); req.on('error', no); });
}
const newId = () => crypto.randomBytes(5).toString('hex');

// ---- Twitch-Live-Status (optional, braucht TWITCH_CLIENT_ID + TWITCH_CLIENT_SECRET)
let twToken = null, liveCache = { at: 0, data: {} };
async function twitchLive(channels) {
  const id = process.env.TWITCH_CLIENT_ID, sec = process.env.TWITCH_CLIENT_SECRET;
  if (!id || !sec || !channels.length) return null;
  if (Date.now() - liveCache.at < 60000) return liveCache.data;
  try {
    if (!twToken || twToken.exp < Date.now()) {
      const r = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${id}&client_secret=${sec}&grant_type=client_credentials`, { method: 'POST' });
      const j = await r.json(); twToken = { t: j.access_token, exp: Date.now() + (j.expires_in - 60) * 1000 };
    }
    const q = channels.slice(0, 100).map(c => 'user_login=' + encodeURIComponent(c)).join('&');
    const r = await fetch('https://api.twitch.tv/helix/streams?' + q, { headers: { 'Client-Id': id, Authorization: 'Bearer ' + twToken.t } });
    const j = await r.json(); const data = {};
    for (const s of j.data || []) data[s.user_login.toLowerCase()] = { title: s.title, viewers: s.viewer_count, game: s.game_name };
    liveCache = { at: Date.now(), data }; return data;
  } catch { return liveCache.data; }
}

async function api(req, res, url) {
  const parts = url.pathname.split('/').filter(Boolean).slice(1); // nach /api
  const m = req.method;
  if (parts[0] === 'login' && m === 'POST') {
    const ip = req.socket.remoteAddress; const f = fails.get(ip) || { n: 0, t: 0 };
    if (f.n >= 5 && Date.now() - f.t < 600000) return send(res, 429, { error: 'Zu viele Versuche. 10 Minuten warten.' });
    const { password } = JSON.parse((await readBody(req, 1e4)) || '{}');
    if (!safeEq(password || '', ADMIN_PASSWORD)) { fails.set(ip, { n: f.n + 1, t: Date.now() }); return send(res, 401, { error: 'Falsches Passwort' }); }
    fails.delete(ip); const t = crypto.randomBytes(24).toString('hex'); sessions.set(t, Date.now() + 12 * 3600e3);
    return send(res, 200, { ok: true }, { 'Set-Cookie': `vt=${t}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200` });
  }
  if (parts[0] === 'logout') { sessions.delete(cookie(req).vt); return send(res, 200, { ok: true }, { 'Set-Cookie': 'vt=; Max-Age=0; Path=/' }); }
  if (parts[0] === 'me') return send(res, 200, { admin: authed(req) });
  if (parts[0] === 'data' && m === 'GET') {
    const out = { ...db }; delete out.subscribers; // E-Mail-Adressen nie öffentlich ausliefern
    return send(res, 200, out);
  }
  if (parts[0] === 'subscribe' && m === 'POST') {
    const ip = req.socket.remoteAddress, f = subFails.get(ip) || { n: 0, t: Date.now() };
    if (Date.now() - f.t > 3600e3) { f.n = 0; f.t = Date.now(); }
    if (f.n >= 6) return send(res, 429, { error: 'Too many requests' });
    subFails.set(ip, { n: f.n + 1, t: f.t });
    const { email } = JSON.parse((await readBody(req, 2e3)) || '{}'); const e = String(email || '').trim().toLowerCase();
    if (!/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(e)) return send(res, 400, { error: 'Invalid email' });
    if (!db.subscribers.some(x => x.email === e)) { db.subscribers.push({ id: newId(), email: e, date: new Date().toISOString().slice(0, 10) }); save(); }
    return send(res, 200, { ok: true });
  }
  if (parts[0] === 'live' && m === 'GET') {
    const chans = [db.org.twitchChannel, ...db.creators.filter(c => c.active !== false).map(c => c.twitchChannel)].filter(Boolean).map(s => s.toLowerCase());
    const data = await twitchLive([...new Set(chans)]);
    return send(res, 200, { enabled: data !== null, live: data || {} });
  }
  // ---- ab hier nur Admin
  if (!authed(req)) return send(res, 401, { error: 'Nicht eingeloggt' });
  if (m !== 'GET' && (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host)) return send(res, 403, { error: 'Origin' });

  if (parts[0] === 'org' && m === 'PUT') { db.org = { ...db.org, ...JSON.parse(await readBody(req)) }; save(); return send(res, 200, db.org); }
  if (parts[0] === 'upload' && m === 'POST') {
    const { name, dataUrl } = JSON.parse(await readBody(req, 8e6));
    const mm = /^data:image\/(png|jpeg|webp|gif);base64,(.+)$/.exec(dataUrl || '');
    if (!mm) return send(res, 400, { error: 'Nur PNG/JPG/WEBP/GIF' });
    const buf = Buffer.from(mm[2], 'base64'); if (buf.length > 5e6) return send(res, 413, { error: 'Max 5 MB' });
    const file = newId() + '-' + String(name || 'img').replace(/[^\w.-]/g, '_').slice(-40).replace(/\.[^.]*$/, '') + '.' + (mm[1] === 'jpeg' ? 'jpg' : mm[1]);
    fs.writeFileSync(path.join(UPL, file), buf); return send(res, 200, { url: '/uploads/' + file });
  }
  if (parts[0] === 'subscribers') {
    if (m === 'GET') return send(res, 200, db.subscribers);
    if (m === 'DELETE' && parts[1]) { db.subscribers = db.subscribers.filter(x => x.id !== parts[1]); save(); return send(res, 200, { ok: true }); }
  }
  if (parts[0] === 'subscribers.csv' && m === 'GET') return send(res, 200, 'email,date\n' + db.subscribers.map(x => `${x.email},${x.date}`).join('\n'), { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=subscribers.csv' });
  if (parts[0] === 'backup' && m === 'GET') return send(res, 200, db, { 'Content-Disposition': 'attachment; filename=viridian-backup.json' });
  if (parts[0] === 'restore' && m === 'POST') { const j = JSON.parse(await readBody(req)); if (!j.org) return send(res, 400, { error: 'Ungültig' }); db = j; save(); return send(res, 200, { ok: true }); }

  const coll = parts[0]; if (!COLLECTIONS.includes(coll)) return send(res, 404, { error: 'Unbekannt' });
  const list = db[coll], id = parts[1];
  if (m === 'POST' && !id) { const it = { ...JSON.parse(await readBody(req)), id: newId() }; list.push(it); save(); return send(res, 201, it); }
  const i = list.findIndex(x => x.id === id); if (i < 0) return send(res, 404, { error: 'Nicht gefunden' });
  if (m === 'PUT') { list[i] = { ...list[i], ...JSON.parse(await readBody(req)), id }; save(); return send(res, 200, list[i]); }
  if (m === 'DELETE') {
    list.splice(i, 1);
    // Verwaiste Verweise säubern: Spiel -> Teams -> Spieler/Matches
    if (coll === 'games') { const t = db.teams.filter(t => t.gameId === id).map(t => t.id); db.teams = db.teams.filter(t => t.gameId !== id); db.players.forEach(p => { if (t.includes(p.teamId)) p.teamId = ''; }); db.matches = db.matches.filter(x => !t.includes(x.teamId)); db.achievements = db.achievements.filter(x => !t.includes(x.teamId)); }
    if (coll === 'teams') { db.players.forEach(p => { if (p.teamId === id) p.teamId = ''; }); db.matches = db.matches.filter(x => x.teamId !== id); db.achievements = db.achievements.filter(x => x.teamId !== id); }
    save(); return send(res, 200, { ok: true });
  }
  send(res, 405, { error: 'Methode' });
}

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    let p = decodeURIComponent(url.pathname);
    if (p === '/admin') { res.writeHead(302, { Location: '/admin/' }); return res.end(); }
    if (p.endsWith('/')) p += 'index.html';
    const base = p.startsWith('/uploads/') ? UPL : PUB, rel = p.startsWith('/uploads/') ? p.slice(9) : p;
    const f = path.normalize(path.join(base, rel));
    if (!f.startsWith(base + path.sep) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
      const nf = path.join(PUB, 'index.html'); // SPA-Fallback für Unterseiten
      if (!path.extname(p)) return send(res, 200, fs.readFileSync(nf), { 'Content-Type': MIME['.html'] });
      return send(res, 404, 'Not found');
    }
    send(res, 200, fs.readFileSync(f), { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': base === UPL ? 'public,max-age=86400' : 'no-cache' });
  } catch (e) { console.error(e); send(res, 500, { error: 'Serverfehler' }); }
}).listen(PORT, () => console.log(`VALIOUX läuft auf http://localhost:${PORT}  (Admin: /admin/)`));
