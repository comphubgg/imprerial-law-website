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
const SCHEMA = {
  games: { label: 'Spiele', title: 'name', sub: g => g.slug, fields: [
    ['name', 'Name', 'text', { required: 1 }], ['slug', 'Slug (URL-Kürzel)', 'text'], ['active', 'Auf der Website anzeigen', 'check']] },
  teams: { label: 'Teams', title: 'name', sub: t => `${tierName(t.tier)} · ${nameOf('games', t.gameId)}`, fields: [
    ['name', 'Teamname', 'text', { required: 1 }], ['gameId', 'Spiel', 'ref:games'], ['tier', 'Stufe', 'select', { options: [['pro', 'Pro'], ['academy', 'Academy'], ['talent', 'Talent']] }], ['active', 'Anzeigen', 'check']] },
  players: { label: 'Spieler', title: 'handle', img: 'photo', sub: p => [p.role, nameOf('teams', p.teamId)].filter(Boolean).join(' · '), fields: [
    ['handle', 'Spielername / Handle', 'text', { required: 1 }], ['realName', 'Echter Name (optional)', 'text'], ['role', 'Rolle', 'text'], ['country', 'Land (Kürzel)', 'text'],
    ['teamId', 'Team', 'ref:teams'], ['photo', 'Foto', 'image'], ['bio', 'Short bio (English)', 'textarea', { tr: 1 }], ['socials', 'Socials', 'socials'], ['active', 'Anzeigen', 'check']] },
  creators: { label: 'Creators', title: 'handle', img: 'photo', sub: c => c.platform, fields: [
    ['handle', 'Name', 'text', { required: 1 }], ['platform', 'Hauptplattform', 'select', { options: [['twitch', 'Twitch'], ['youtube', 'YouTube'], ['tiktok', 'TikTok'], ['instagram', 'Instagram']] }],
    ['twitchChannel', 'Twitch-Kanal (für Live-Anzeige)', 'text'], ['photo', 'Foto', 'image'], ['bio', 'Short bio (English)', 'textarea', { tr: 1 }], ['socials', 'Socials', 'socials'], ['active', 'Anzeigen', 'check']] },
  shows: { label: 'Shows', title: 'title', img: 'image', sub: s => s.schedule, fields: [
    ['title', 'Title (English)', 'text', { required: 1, tr: 1 }], ['schedule', 'Schedule', 'text', { tr: 1 }], ['description', 'Description (English)', 'textarea', { tr: 1 }], ['link', 'Link (YouTube/Twitch)', 'text'], ['image', 'Bild', 'image'], ['active', 'Anzeigen', 'check']] },
  news: { label: 'News', title: 'title', img: 'image', sub: n => n.date, fields: [
    ['title', 'Title (English)', 'text', { required: 1, tr: 1 }], ['date', 'Datum', 'date'], ['body', 'Text (English)', 'textarea', { tr: 1 }], ['image', 'Bild', 'image']] },
  matches: { label: 'Matches', title: 'event', sub: m => `${m.date || ''} · ${nameOf('teams', m.teamId)} · ${m.score || m.result || ''}`, fields: [
    ['event', 'Turnier / Event', 'text', { required: 1 }], ['date', 'Datum', 'date'], ['teamId', 'Team', 'ref:teams'], ['result', 'Ergebnis', 'select', { options: [['', '–'], ['win', 'Sieg'], ['loss', 'Niederlage']] }], ['score', 'Score / Platzierung (z. B. "Platz 3")', 'text']] },
  sponsors: { label: 'Partner', title: 'name', img: 'logo', sub: s => s.url, fields: [
    ['name', 'Name', 'text', { required: 1 }], ['url', 'Website', 'text'], ['logo', 'Logo', 'image']] },
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
    const g = h('div', { class: 'grp' }, h('div', { class: 'gt' }, label)); const ins = {};
    SOC.forEach(k => { ins[k] = h('input', { type: 'text', value: (val || {})[k] || '', placeholder: '@handle oder Link' }); g.append(h('div', { class: 'f' }, h('label', {}, k.toUpperCase()), ins[k])); });
    form.get[key] = () => Object.fromEntries(SOC.map(k => [k, ins[k].value.trim()])); return g;
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
  } else el = h('input', { type: type === 'date' ? 'date' : 'text', value: val || '', required: opt.required ? true : null });
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
    ['theme', 'Farbwelt (Saison-Theme)', 'theme'], ['logo', 'Logo (Standard)', 'image'], ['themeLogo', 'Spezial-Logo nur für die gewählte Farbwelt (optional)', 'image'], ['twitchChannel', 'Haupt-Twitch-Kanal (Live-Player im Hero)', 'text', { hint: 'Nur der Kanalname, z. B. viridian' }],
    ['contactEmail', 'Kontakt-E-Mail', 'text'], ['shopUrl', 'Shop-Link', 'text'], ['socials', 'Social-Media der Organisation', 'socials'],
    ['showAcademy', 'Academy-Bereich anzeigen', 'check'], ['showCreators', 'Creators-Bereich anzeigen', 'check'], ['showShows', 'Shows-Bereich anzeigen', 'check']];
  const f = makeForm(defs, { ...o, themeLogo: (o.themeLogos || {})[o.theme] || '' }, async out => {
    out.themeLogos = { ...(o.themeLogos || {}), [out.theme]: out.themeLogo || '' }; delete out.themeLogo;
    out.socials.discord = dc2.value.trim(); await api('org', 'PUT', out); await refresh(); toast('Gespeichert'); });
  const dc2 = h('input', { type: 'text', value: o.socials.discord || '', placeholder: 'Invite-Link' });
  f.insertBefore(h('div', { class: 'f' }, h('label', {}, 'Discord-Einladungslink'), dc2), f.querySelector('.bar'));
  return [h('h1', {}, 'Organisation'), h('p', { class: 'sub' }, 'Name, Farben, Logo und Socials der gesamten Seite.'), f];
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
function render() {
  const nav = [['org', 'Organisation'], ...Object.entries(SCHEMA).map(([k, v]) => [k, v.label]), ['backup', 'Backup']];
  const main = h('main', {}, ...(view === 'org' ? viewOrg() : view === 'backup' ? viewBackup() : viewList(view)));
  $('#app').replaceChildren(h('div', { class: 'layout' }, h('aside', {}, h('div', { class: 'logo' }, h('img', { src: '/logo.png', alt: '' }), 'ADMIN'),
    ...nav.map(([k, l]) => h('button', { class: 't' + (k === view ? ' on' : ''), onclick: () => { view = k; render(); } }, l)), h('div', { class: 'sep' }),
    h('button', { class: 't', onclick: () => open('/', '_blank') }, 'Website ansehen ↗'), h('button', { class: 't', onclick: async () => { await api('logout'); showLogin(); } }, 'Logout')), main));
}
async function start() { await refresh(); render(); }
(async () => { const m = await api('me').catch(() => ({})); m.admin ? start() : showLogin(); })();
