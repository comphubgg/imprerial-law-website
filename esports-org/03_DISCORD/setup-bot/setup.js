#!/usr/bin/env node
// Baut Rollen, Kategorien, Kanäle, Rechte und Start-Nachrichten aus ../server-blueprint.json.
//   node setup.js --dry-run      zeigt nur den Plan (kein Token nötig)
//   DISCORD_TOKEN=... GUILD_ID=... node setup.js     baut den Server (idempotent: vorhandene Namen werden übersprungen)
// Der Bot braucht die Berechtigung "Administrator" (nur für das Setup) und die Einladung auf den Server.
const fs = require('fs'), path = require('path');
const bp = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'server-blueprint.json'), 'utf8'));
const dry = process.argv.includes('--dry-run') || !process.env.DISCORD_TOKEN;
const roleName = k => (bp.roles.find(r => r.key === k) || {}).name || k;

function validate() {
  const errs = [], keys = new Set(bp.roles.map(r => r.key)); const names = new Set();
  for (const c of bp.categories) { for (const k of c.visibleTo || []) if (k !== 'everyone' && !keys.has(k)) errs.push(`Kategorie ${c.name}: unbekannte Rolle ${k}`);
    for (const ch of c.channels) { for (const k of [...(ch.visibleTo || []), ...(ch.write || [])]) if (k !== 'everyone' && !keys.has(k)) errs.push(`Kanal ${ch.name}: unbekannte Rolle ${k}`); if (ch.message && !bp.messages[ch.message]) errs.push(`Kanal ${ch.name}: Nachricht "${ch.message}" fehlt`); const key = ch.type + ':' + ch.name.toLowerCase(); if (names.has(key)) errs.push(`Doppelter Kanal ${ch.name}`); names.add(key); if (ch.type === 'text' && /[A-Z ]/.test(ch.name)) errs.push(`Textkanal "${ch.name}" muss klein und ohne Leerzeichen sein`); } }
  return errs;
}
function plan() {
  console.log(`\nServer: ${bp.server.name}\n\nRollen (oben → unten):`); bp.roles.forEach(r => console.log(`  ${r.name.padEnd(14)} ${r.color}  ${r.permissions.join(', ') || '-'}`));
  console.log('\nKategorien & Kanäle:'); for (const c of bp.categories) { console.log(`\n▸ ${c.name}  [${(c.visibleTo || ['alle']).map(roleName).join(', ')}]`); for (const ch of c.channels) console.log(`    ${ch.type === 'voice' ? '🔊' : ch.type === 'announcement' ? '📣' : '#'} ${ch.name}${ch.readOnly ? '  (nur lesen)' : ''}${ch.visibleTo ? '  [' + ch.visibleTo.map(roleName).join(', ') + ']' : ''}${ch.message ? '  + Nachricht' : ''}`); }
  console.log('');
}
const errs = validate(); if (errs.length) { console.error('Fehler im Blueprint:\n - ' + errs.join('\n - ')); process.exit(1); }
if (dry) { plan(); console.log(process.env.DISCORD_TOKEN ? '' : 'Trockenlauf. Zum Bauen DISCORD_TOKEN und GUILD_ID setzen.\n'); process.exit(0); }

const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits } = require('discord.js');
const P = list => (list || []).map(n => { if (!(n in PermissionFlagsBits)) throw new Error('Unbekannte Berechtigung: ' + n); return PermissionFlagsBits[n]; });
const TYPES = { text: ChannelType.GuildText, voice: ChannelType.GuildVoice, announcement: ChannelType.GuildAnnouncement };
(async () => {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] }); await client.login(process.env.DISCORD_TOKEN);
  const guild = await client.guilds.fetch(process.env.GUILD_ID); await guild.roles.fetch(); await guild.channels.fetch(); console.log('Verbunden mit', guild.name);
  const roles = {}; // Rollen von oben nach unten erstellen (neue Rollen landen unten, ältere rücken nach oben)
  for (const r of bp.roles) { let ex = guild.roles.cache.find(x => x.name.toLowerCase() === r.name.toLowerCase()); if (!ex) { ex = await guild.roles.create({ name: r.name, color: r.color, hoist: !!r.hoist, permissions: P(r.permissions), reason: 'Server-Setup' }); console.log('+ Rolle', r.name); } else console.log('= Rolle', r.name); roles[r.key] = ex; }
  const everyone = guild.roles.everyone.id;
  const overwrites = (visible, readOnly, write) => { const o = []; if (visible && !visible.includes('everyone')) { o.push({ id: everyone, deny: [PermissionFlagsBits.ViewChannel] }); visible.forEach(k => roles[k] && o.push({ id: roles[k].id, allow: [PermissionFlagsBits.ViewChannel] })); }
    if (readOnly) { o.push({ id: everyone, deny: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions, PermissionFlagsBits.CreatePublicThreads] }); (write || ['owner', 'management']).forEach(k => roles[k] && o.push({ id: roles[k].id, allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions] })); }
    const merged = {}; o.forEach(x => { const m = merged[x.id] = merged[x.id] || { id: x.id, allow: [], deny: [] }; m.allow.push(...(x.allow || [])); m.deny.push(...(x.deny || [])); }); return Object.values(merged); };
  for (const c of bp.categories) {
    let cat = guild.channels.cache.find(x => x.type === ChannelType.GuildCategory && x.name.toLowerCase() === c.name.toLowerCase());
    if (!cat) { cat = await guild.channels.create({ name: c.name, type: ChannelType.GuildCategory, permissionOverwrites: overwrites(c.visibleTo, false) }); console.log('+ Kategorie', c.name); } else console.log('= Kategorie', c.name);
    for (const ch of c.channels) {
      const type = TYPES[ch.type]; let ex = guild.channels.cache.find(x => x.parentId === cat.id && x.name.toLowerCase() === ch.name.toLowerCase());
      if (!ex) { ex = await guild.channels.create({ name: ch.name, type, parent: cat.id, topic: ch.topic, userLimit: ch.limit, permissionOverwrites: overwrites(ch.visibleTo || c.visibleTo, ch.readOnly, ch.write) }); console.log('  + Kanal', ch.name); } else console.log('  = Kanal', ch.name);
      if (ch.message && ex.isTextBased() && !ex.isVoiceBased()) { const msgs = await ex.messages.fetch({ limit: 1 }); if (!msgs.size) { await ex.send(bp.messages[ch.message]); console.log('    ✉ Nachricht in', ch.name); } }
    }
  }
  console.log('\nFertig. Nächste Schritte: Bots einladen (siehe "bots" im Blueprint), AutoMod aktivieren, Server-Vorlage speichern.'); await client.destroy();
})().catch(e => { console.error('Fehler:', e.message); process.exit(1); });
