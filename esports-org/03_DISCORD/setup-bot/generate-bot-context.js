#!/usr/bin/env node
// Erzeugt ../bot-wissen.md aus dem Blueprint: Wissensbasis, mit der ein (KI-)Bot den Server versteht (Kanäle, Rollen, Regeln, Ton).
const fs = require('fs'), path = require('path'); const bp = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'server-blueprint.json'), 'utf8'));
const rn = k => (bp.roles.find(r => r.key === k) || {}).name || k; const L = [];
L.push(`# Wissen über den Discord-Server "${bp.server.name}"`, '', bp.server.description, '', `Ton: ${bp.server.tone}. Hashtag: ${bp.server.hashtag}. Sprache: ${bp.server.language}.`, '', '## Rollen (von oben nach unten)');
bp.roles.forEach(r => L.push(`- **${r.name}**: ${r.purpose}`)); L.push('', '## Kanäle');
for (const c of bp.categories) { L.push(`### ${c.name}${c.visibleTo ? ' (privat: ' + c.visibleTo.map(rn).join(', ') + ')' : ''}`); for (const ch of c.channels) L.push(`- ${ch.type === 'voice' ? '🔊 ' : '#'}${ch.name}: ${ch.topic || ch.type}${ch.readOnly ? ' (nur lesen)' : ''}${ch.visibleTo ? ' (sichtbar für: ' + ch.visibleTo.map(rn).join(', ') + ')' : ''}`); L.push(''); }
L.push('## Regeln und Standardtexte'); for (const [k, v] of Object.entries(bp.messages)) L.push(`### ${k}`, v, '');
L.push('## Bots im Server'); bp.bots.forEach(b => L.push(`- **${b.name}**: ${b.purpose}`));
L.push('', '## Verhalten des Bots', '- Antworte kurz, freundlich, auf Englisch (andere Sprachen nur, wenn der Nutzer sie nutzt).', '- Verweise bei Bewerbungen, Partnerschaften und Support auf #open-a-ticket.', '- Gib keine Informationen aus privaten Kanälen (Kategorie TEAM) weiter.', '- Bei Regelverstößen: auf #rules verweisen und Moderatoren pingen, nicht selbst bestrafen.');
fs.writeFileSync(path.join(__dirname, '..', 'bot-wissen.md'), L.join('\n') + '\n'); console.log('bot-wissen.md geschrieben');
