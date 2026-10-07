// Admin-Panel: schema-getrieben. Neue Felder/Sammlungen = nur SCHEMA erweitern.
const $ = s => document.querySelector(s);
function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (v == null || v === false) continue; if (k === 'class') e.className = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else if (k === 'value') e.value = v; else e.setAttribute(k, v === true ? '' : v); }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
}
const toast = (m, err) => { const t = $('#toast'); t.textContent = m; t.className = 'show' + (err ? ' err' : ''); setTimeout(() => t.className = '', 2200); };
async function api(path, method = 'GET', body) {
  const r = await fetch('/api/' + path, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({})); if (!r.ok) { if (r.status === 401 && path !== 'login') showLogin(); throw new Error(j.error || r.statusText); } return j;
}
const SOC = ['x', 'twitch', 'youtube', 'instagram', 'tiktok'];
const ORGSOC = ['x', 'twitch', 'youtube', 'instagram', 'tiktok', 'discord', 'facebook', 'linkedin'];
const T = (t, o = {}) => ({ ...o, tr: 1 });
const SCHEMA = {
  slides: { label: 'Hero-Slider', title: 'title', img: 'image', sub: s => `${s.subtitle || ''} · Reihenfolge ${s.order || '-'}`, fields: [
    ['title', 'Headline (English, GROSS)', 'text', T(0, { required: 1 })], ['subtitle', 'Unterzeile (English)', 'text', T()], ['image', 'Hintergrundbild (1920×900 empfohlen, optional)', 'image'],
    ['style', 'Hintergrund ohne Bild', 'select', { options: [['night', 'Nacht (dunkelblau)'], ['steel', 'Stahl (silber)'], ['light', 'Hell (weiß)']] }],
    ['cta', 'Button-Text (English)', 'text', T()], ['link', 'Button-Link (z. B. /teams oder https://…)', 'text'], ['order', 'Reihenfolge (1, 2, 3 …)', 'text'], ['active', 'Anzeigen', 'check']] },
  products: { label: 'Shop-Produkte', title: 'name', img: 'image', sub: p => `${p.kind || ''} · ${p.price || ''} · Reihenfolge ${p.order || '-'}`, fields: [
    ['name', 'Produktname', 'text', { required: 1 }], ['kind', 'Art', 'select', { options: [['jersey', 'Jersey'], ['jacket', 'Tracksuit Jacket'], ['jogger', 'Joggers'], ['hoodie', 'Hoodie'], ['tee', 'T-Shirt'], ['cap', 'Cap'], ['bag', 'Bag'], ['flag', 'Flag'], ['scarf', 'Scarf'], ['other', 'Sonstiges']] }],
    ['price', 'Preis (z. B. €74.99)', 'text'], ['description', 'Beschreibung (English)', 'textarea', T()], ['image', 'Hauptbild (Karte; falls leer: Front-Ansicht)', 'image'],
    ['viewFront', 'Ansicht: Vorne', 'image'], ['viewBack', 'Ansicht: Hinten', 'image'], ['viewLeft', 'Ansicht: Links', 'image'], ['viewRight', 'Ansicht: Rechts', 'image'], ['viewTop', 'Ansicht: Oben', 'image'], ['viewBottom', 'Ansicht: Unten', 'image'],
    ['link', 'Kauf-Link (Shopify/Shop-URL)', 'text'], ['order', 'Reihenfolge (das erste ist die große Kachel)', 'text'], ['active', 'Anzeigen', 'check']] },
  games: { label: 'Spiele', title: 'name', sub: g => g.slug, fields: [
    ['name', 'Name', 'text', { required: 1 }], ['slug', 'Slug (URL-Kürzel)', 'text'], ['active', 'Auf der Website anzeigen', 'check']] },
  teams: { label: 'Teams', title: 'name', img: 'image', sub: t => `${tierName(t.tier)} · ${nameOf('games', t.gameId)} · /team/${t.slug || ''}`, fields: [
    ['name', 'Teamname', 'text', T(0, { required: 1 })], ['slug', 'Slug (URL, z. B. fortnite)', 'text', { required: 1 }], ['gameId', 'Spiel', 'ref:games'], ['tier', 'Stufe', 'select', { options: [['pro', 'Pro'], ['academy', 'Academy'], ['talent', 'Talent']] }],
    ['image', 'Hintergrundbild (Querformat; Karte + Team-Seite)', 'image'], ['wordmark', 'Große Schrift auf dem Bild (z. B. FORTNITE)', 'text', T()], ['subtitle', 'Zusatz unter der Schrift (z. B. ACADEMY)', 'text'], ['description', 'Beschreibung (English)', 'textarea', T()], ['order', 'Reihenfolge', 'text'], ['active', 'Anzeigen', 'check']] },
  players: { label: 'Spieler', title: 'handle', img: 'photo', sub: p => [p.role, nameOf('teams', p.teamId)].filter(Boolean).join(' · '), fields: [
    ['handle', 'Spielername / Handle', 'text', { required: 1 }], ['firstName', 'Vorname', 'text'], ['lastName', 'Nachname', 'text'], ['role', 'Rolle', 'text'], ['country', 'Land (2 Buchstaben, z. B. DE)', 'text'],
    ['teamId', 'Team', 'ref:teams'], ['photo', 'Foto (Hochformat 4:5)', 'image'], ['bio', 'Kurzbio (English)', 'textarea', T()], ['socials', 'Socials', 'socials'], ['active', 'Anzeigen', 'check']] },
  achievements: { label: 'Achievements', title: 'title', img: 'logo', sub: a => `${a.placement || ''} · ${a.year || ''} · ${nameOf('teams', a.teamId)}`, fields: [
    ['title', 'Turniername (English)', 'text', T(0, { required: 1 })], ['teamId', 'Team', 'ref:teams'], ['placement', 'Platzierung (z. B. 1st, 3rd, Top 8)', 'text'], ['year', 'Jahr', 'text'], ['logo', 'Turnier-Logo', 'image']] },
  matches: { label: 'Matches', title: 'opponent', sub: m => `${m.status === 'upcoming' ? 'Kommend' : 'Beendet'} · ${(m.datetime || '').replace('T', ' ')} · ${nameOf('teams', m.teamId)} · ${m.event || ''}`, fields: [
    ['status', 'Status', 'select', { options: [['upcoming', 'Kommend (Next up)'], ['finished', 'Beendet (Results)']] }], ['datetime', 'Datum & Uhrzeit', 'datetime'], ['teamId', 'Unser Team', 'ref:teams'],
    ['opponent', 'Gegner', 'text', { required: 1 }], ['opponentLogo', 'Gegner-Logo (optional)', 'image'], ['event', 'Turnier / Event', 'text'], ['scoreHome', 'Unser Score', 'text'], ['scoreAway', 'Gegner-Score', 'text'], ['streamLink', 'Stream-Link (Watch live)', 'text']] },
  creators: { label: 'Creators', title: 'handle', img: 'photo', sub: c => c.platform, fields: [
    ['handle', 'Name', 'text', { required: 1 }], ['platform', 'Hauptplattform', 'select', { options: [['twitch', 'Twitch'], ['youtube', 'YouTube'], ['tiktok', 'TikTok'], ['instagram', 'Instagram']] }],
    ['twitchChannel', 'Twitch-Kanal (für Live-Anzeige)', 'text'], ['photo', 'Foto', 'image'], ['bio', 'Kurzbio (English)', 'textarea', T()], ['socials', 'Socials', 'socials'], ['active', 'Anzeigen', 'check']] },
  news: { label: 'News', title: 'title', img: 'image', sub: n => n.date, fields: [
    ['title', 'Titel (English)', 'text', T(0, { required: 1 })], ['date', 'Datum', 'date'], ['body', 'Text (English; ## = Überschrift, - = Liste, [Text](Link))', 'textarea', T()], ['image', 'Bild (16:9)', 'image']] },
  sponsors: { label: 'Partner', title: 'name', img: 'logo', sub: s => `${s.tier || ''} · ${s.url || ''}`, fields: [
    ['name', 'Name', 'text', { required: 1 }], ['url', 'Website', 'text'], ['logo', 'Logo (transparent/weiß, PNG)', 'image'], ['tier', 'Stufe (z. B. Main Partner)', 'text'], ['order', 'Reihenfolge', 'text']] },
  shows: { label: 'Shows', title: 'title', img: 'image', sub: s => s.schedule, fields: [
    ['title', 'Title (English)', 'text', T(0, { required: 1 })], ['schedule', 'Schedule', 'text', T()], ['description', 'Description (English)', 'textarea', T()], ['link', 'Link (YouTube/Twitch)', 'text'], ['image', 'Bild', 'image'], ['active', 'Anzeigen', 'check']] },
  pages: { label: 'Seiten (About, Legal …)', title: 'title', sub: p => '/page/' + p.slug, fields: [
    ['slug', 'Slug (URL; about, partners, privacy, legal-notice, terms, contact)', 'text', { required: 1 }], ['title', 'Titel (English)', 'text', T(0, { required: 1 })], ['body', 'Inhalt (English; ## = Überschrift, - = Liste, [Text](Link))', 'textarea', T()]] },
};
const tierName = t => ({ pro: 'Pro', academy: 'Academy', talent: 'Talent' }[t] || t || '');
let DB = {}; let view = 'org';
const nameOf = (c, id) => { const x = (DB[c] || []).find(i => i.id === id); return x ? (x.name || x.handle) : '–'; };
async function refresh() { DB = await api('data'); }

function showLogin() {
  const pw = h('input', { type: 'password', placeholder: 'Passwort', autofocus: true, style: 'width:100%;padding:10px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--text);margin:14px 0' });
  const go = async () => { try { await api('login', 'POST', { password: pw.value }); start(); } catch (e) { toast(e.message, 1); } };
  pw.addEventListener('keydown', e => e.key === 'Enter' && go());
  $('#app').replaceChildren(h('div', { class: 'login' }, h('img', { src: '/logo.png', alt: '' }), h('h1', {}, 'Admin'), pw, h('button', { class: 'btn', onclick: go }, 'Einloggen')));
}

function field(def, val, form) {
  const [key, label, type, opt = {}] = def; let el, wrap = h('div', { class: 'f' });
  if (type === 'check') { wrap.className = 'f chk'; el = h('input', { type: 'checkbox' }); el.checked = val !== false && val !== undefined ? !!val : def[0] === 'active'; wrap.append(h('label', {}, el, label)); form.get[key] = () => el.checked; return wrap; }
  if (type === 'socials') {
    const KEYS = opt.keys || SOC; const g = h('div', { class: 'grp' }, h('div', { class: 'gt' }, label)); const ins = {};
    KEYS.forEach(k => { ins[k] = h('input', { type: 'text', value: (val || {})[k] || '', placeholder: '@handle oder Link' }); g.append(h('div', { class: 'f' }, h('label', {}, k.toUpperCase()), ins[k])); });
    form.get[key] = () => Object.fromEntries(KEYS.map(k => [k, ins[k].value.trim()])); return g;
  }
  wrap.append(h('label', {}, label));
  if (type === 'textarea') el = h('textarea', { value: val || '' });
  else if (type === 'select') { el = h('select', {}, opt.options.map(([v, l]) => h('option', { value: v }, l))); el.value = val || opt.options[0][0]; }
  else if (type === 'theme') { el = h('select', {}, Object.entries(window.THEMES).map(([k, t]) => h('option', { value: k }, t.name))); el.value = val || 'platin'; wrap.append(h('div', { class: 'hint' }, 'Ändert Farben der ganzen Website – z. B. Weihnachten, Winter, Pride.')); }
  else if (type.startsWith('ref:')) { const c = type.slice(4); el = h('select', {}, h('option', { value: '' }, '– keine –'), DB[c].map(i => h('option', { value: i.id }, i.name || i.handle))); el.value = val || ''; }
  else if (type === 'image') {
    let cur = val || ''; const pv = h('img', { src: cur || '/logo.png', alt: '' }); const fi = h('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp,image/gif' });
    fi.onchange = () => { const f = fi.files[0]; if (!f) return; if (f.size > 5e6) return toast('Max 5 MB', 1); const r = new FileReader(); r.onload = async () => { try { const j = await api('upload', 'POST', { name: f.name, dataUrl: r.result }); cur = j.url; pv.src = cur; toast('Bild hochgeladen'); } catch (e) { toast(e.message, 1); } }; r.readAsDataURL(f); };
    wrap.append(h('div', { class: 'imgf' }, pv, fi, h('button', { type: 'button', class: 'btn ghost sm', onclick: () => { cur = ''; pv.src = '/logo.png'; } }, 'Entfernen')), h('div', { class: 'hint' }, 'PNG, JPG, WEBP oder GIF, max. 5 MB'));
    form.get[key] = () => cur; return wrap;
  } else el = h('input', { type: type === 'date' ? 'date' : type === 'datetime' ? 'datetime-local' : 'text', value: val || '', required: opt.required ? true : null });
  wrap.append(el); if (opt.hint) wrap.append(h('div', { class: 'hint' }, opt.hint)); form.get[key] = () => el.value;
  if (opt.tr) { // Übersetzungen (Hauptsprache = Englisch)
    const det = h('details', { class: 'trs' }, h('summary', {}, 'Translations (DE, ES, FR, IT, PT) – optional'));
    for (const l of ['de', 'es', 'fr', 'it', 'pt']) {
      const k = key + '_' + l, i2 = type === 'textarea' ? h('textarea', { value: form.data[k] || '' }) : h('input', { type: 'text', value: form.data[k] || '' });
      form.get[k] = () => i2.value; det.append(h('div', { class: 'f' }, h('label', {}, l.toUpperCase()), i2));
    }
    wrap.append(det);
  }
  return wrap;
}
function makeForm(defs, data, onSave, onCancel, extra) {
  const f = h('form', {}); f.get = {}; f.data = data;
  f.append(...defs.map(d => field(d, data[d[0]], f)), extra || '');
  f.append(h('div', { class: 'bar' }, h('button', { class: 'btn', type: 'submit' }, 'Speichern'), onCancel ? h('button', { type: 'button', class: 'btn ghost', onclick: onCancel }, 'Abbrechen') : null));
  f.addEventListener('submit', async e => { e.preventDefault(); const out = {}; for (const k in f.get) out[k] = f.get[k](); try { await onSave(out); } catch (er) { toast(er.message, 1); } });
  return f;
}

function viewOrg() {
  const o = DB.org;
  const defs = [['name', 'Organisationsname', 'text', { required: 1 }], ['tagline', 'Tagline (English)', 'text', { tr: 1 }], ['description', 'Description (English)', 'textarea', { tr: 1 }],
    ['theme', 'Farbwelt (Saison-Theme)', 'theme'], ['logo', 'Logo (Standard)', 'image'], ['themeLogo', 'Spezial-Logo nur für die gewählte Farbwelt (optional)', 'image'],
    ['mark', 'Kurzzeichen (z. B. VLX)', 'text'], ['promoText', 'Promo-Leiste oben (leer = ausblenden)', 'text', { tr: 1 }], ['promoLink', 'Promo-Link (z. B. /shop)', 'text'], ['hashtag', 'Hashtag im Footer (z. B. #VLX)', 'text'], ['footerText', 'Footer-Text (English)', 'textarea', { tr: 1 }],
    ['navLinks', 'Zusätzliche Menü-Links (eine Zeile pro Link: Label|https://…)', 'textarea'], ['twitchChannel', 'Haupt-Twitch-Kanal', 'text', { hint: 'Nur der Kanalname' }],
    ['contactEmail', 'Kontakt-E-Mail', 'text'], ['shopUrl', 'Externer Shop-Link (Shopify o. ä., optional)', 'text'], ['socials', 'Social-Media der Organisation', 'socials', { keys: ORGSOC }],
    ['newsletter', 'Newsletter-Anmeldung anzeigen', 'check']];
  const f = makeForm(defs, { ...o, themeLogo: (o.themeLogos || {})[o.theme] || '' }, async out => {
    out.themeLogos = { ...(o.themeLogos || {}), [out.theme]: out.themeLogo || '' }; delete out.themeLogo;
    await api('org', 'PUT', out); await refresh(); toast('Gespeichert'); });
  return [h('h1', {}, 'Organisation'), h('p', { class: 'sub' }, 'Name, Farbwelt, Logo, Promo-Leiste, Menü und Socials der gesamten Seite.'), f];
}
async function viewSubs() {
  const list = await api('subscribers'); const box = h('div', { class: 'list' });
  const draw = () => box.replaceChildren(...(list.length ? list.map(s => h('div', { class: 'row' }, h('div', { class: 't' }, h('b', {}, s.email), h('span', {}, s.date)),
    h('button', { class: 'btn danger sm', onclick: async () => { if (!confirm(s.email + ' löschen?')) return; await api('subscribers/' + s.id, 'DELETE'); list.splice(list.indexOf(s), 1); draw(); } }, 'Löschen'))) : [h('div', { class: 'sub' }, 'Noch keine Anmeldungen.')]));
  draw(); return [h('h1', {}, 'Newsletter'), h('p', { class: 'sub' }, `${list.length} Anmeldungen`), h('div', { class: 'bar' }, h('a', { class: 'btn', href: '/api/subscribers.csv', download: 'subscribers.csv' }, 'CSV exportieren')), box];
}
function viewList(c) {
  const S = SCHEMA[c], items = DB[c];
  const wrap = h('div', {});
  const edit = it => {
    wrap.replaceChildren(h('h1', {}, (it ? 'Bearbeiten' : 'Neu') + ' · ' + S.label), makeForm(S.fields, it || {}, async out => {
      if (it) await api(`${c}/${it.id}`, 'PUT', out); else await api(c, 'POST', out); await refresh(); toast('Gespeichert'); show();
    }, show));
  };
  const show = () => {
    wrap.replaceChildren(h('h1', {}, S.label), h('p', { class: 'sub' }, `${DB[c].length} Einträge`),
      h('div', { class: 'bar' }, h('button', { class: 'btn', onclick: () => edit() }, '+ Hinzufügen')),
      h('div', { class: 'list' }, DB[c].length ? DB[c].map(it => h('div', { class: 'row' + (it.active === false ? ' off' : '') },
        S.img && it[S.img] ? h('img', { src: it[S.img], alt: '' }) : null, h('div', { class: 't' }, h('b', {}, it[S.title] || '(ohne Titel)'), h('span', {}, S.sub(it) || '')),
        h('button', { class: 'btn ghost sm', onclick: () => edit(it) }, 'Bearbeiten'),
        h('button', { class: 'btn danger sm', onclick: async () => {
          const extra = c === 'games' ? ' Alle Teams, Spielerzuordnungen und Matches dieses Spiels werden mit entfernt.' : c === 'teams' ? ' Spieler bleiben erhalten, verlieren aber das Team.' : '';
          if (!confirm(`„${it[S.title]}" wirklich löschen?${extra}`)) return; await api(`${c}/${it.id}`, 'DELETE'); await refresh(); toast('Gelöscht'); show(); } }, 'Löschen'))) : h('div', { class: 'sub' }, 'Noch nichts da.')));
  };
  show(); return [wrap];
}
function viewBackup() {
  const fi = h('input', { type: 'file', accept: 'application/json' });
  fi.onchange = async () => { const f = fi.files[0]; if (!f || !confirm('Alle aktuellen Daten werden ersetzt. Fortfahren?')) return; try { await api('restore', 'POST', JSON.parse(await f.text())); await refresh(); toast('Wiederhergestellt'); render(); } catch (e) { toast(e.message, 1); } };
  return [h('h1', {}, 'Backup'), h('p', { class: 'sub' }, 'Sichere alle Inhalte als Datei oder spiele ein Backup ein.'),
    h('div', { class: 'bar' }, h('a', { class: 'btn', href: '/api/backup', download: 'viridian-backup.json' }, 'Backup herunterladen')), h('div', { class: 'f' }, h('label', {}, 'Backup einspielen'), fi)];
}
async function render() {
  const ORDER = ['org', 'slides', 'products', 'teams', 'players', 'achievements', 'matches', 'creators', 'news', 'sponsors', 'shows', 'pages', 'games'];
  const nav = [...ORDER.map(k => [k, k === 'org' ? 'Organisation' : SCHEMA[k].label]), ['subs', 'Newsletter'], ['backup', 'Backup']];
  const body = view === 'org' ? viewOrg() : view === 'backup' ? viewBackup() : view === 'subs' ? await viewSubs() : viewList(view);
  const main = h('main', {}, ...body);
  $('#app').replaceChildren(h('div', { class: 'layout' }, h('aside', {}, h('div', { class: 'logo' }, h('img', { src: '/logo.png', alt: '' }), 'ADMIN'),
    ...nav.map(([k, l]) => h('button', { class: 't' + (k === view ? ' on' : ''), onclick: () => { view = k; render(); } }, l)), h('div', { class: 'sep' }),
    h('button', { class: 't', onclick: () => open('/', '_blank') }, 'Website ansehen ↗'), h('button', { class: 't', onclick: async () => { await api('logout'); showLogin(); } }, 'Logout')), main));
}
async function start() { await refresh(); render(); }
(async () => { const m = await api('me').catch(() => ({})); m.admin ? start() : showLogin(); })();
