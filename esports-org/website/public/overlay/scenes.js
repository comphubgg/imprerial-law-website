(async function () {
  const { el, svg, init, bg, socRow, sponsorStrip, freezeTime, fonts, $ } = OV; const Q = window.Q; const scene = document.body.dataset.scene; const stage = $('#stage');
  const C = await init(); await fonts(); const { o, logo, socials, sponsors, hashtag, mark } = C;
  const solid = ['starting', 'brb', 'ending', 'offline'].includes(scene) && Q.get('bg') !== '0'; if (solid) document.body.classList.add('solid');
  const topbar = () => { const t = el('div', 'topbar'), b = el('div', 'brand'); const i = new Image(); i.src = logo; b.append(i, el('span', '', o.name)); t.append(b, sponsorStrip(sponsors, 'PARTNERS')); return t; };
  function bigScene(title, sub, extra) {
    stage.append(bg(), el('div', 'wm', hashtag.replace('#', '')), topbar()); const c = el('div', 'center'); const l = new Image(); l.src = logo; l.className = 'logo-big'; const h = el('div', 'title', title); h.dataset.text = title; c.append(l, h);
    if (sub) c.append(el('div', 'subline', sub)); if (extra) c.append(extra); stage.append(c, socRow(socials), el('div', 'hash', hashtag));
  }
  if (scene === 'starting') {
    const mins = Q.get('minutes') ? parseFloat(Q.get('minutes')) : null; let cd = null;
    if (mins != null) { cd = el('div', 'count', '--:--'); const end = Date.now() + mins * 60000; const fmt = ms => { const s = Math.max(0, Math.round(ms / 1000)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }; if (Q.get('static')) cd.textContent = fmt(mins * 60000); else { const tick = () => { cd.textContent = fmt(end - Date.now()); }; tick(); setInterval(tick, 500); } }
    bigScene(Q.get('title') || 'STARTING SOON', cd ? '' : (Q.get('sub') || 'FOLLOW · SUB · HYPE'), cd);
  } else if (scene === 'brb') { const d = el('div', 'dots3'); d.append(el('span'), el('span'), el('span')); const w = el('div', 'count'); w.style.fontSize = '40px'; w.append(d); bigScene(Q.get('title') || 'BE RIGHT BACK', Q.get('sub') || 'WE’LL BE BACK IN A MOMENT', w); }
  else if (scene === 'ending') { bigScene(Q.get('title') || 'THANKS FOR WATCHING', Q.get('next') ? 'NEXT STREAM · ' + Q.get('next') : 'SEE YOU NEXT TIME'); }
  else if (scene === 'offline') { bigScene(Q.get('title') || 'OFFLINE', Q.get('sub') || 'FOLLOW TO GET NOTIFIED'); }
  else if (scene === 'cam') { const w = +Q.get('w') || 640, h = Math.round(w * 9 / 16); const c = el('div', 'cam'); c.style.cssText = `left:${Q.get('x') || 60}px;top:${Q.get('y') || 60}px;width:${w}px;height:${h}px`; stage.append(c); const n = el('div', 'nameplate'); n.style.cssText = `left:${(+Q.get('x') || 60) + 24}px;top:${(+Q.get('y') || 60) + h + 14}px`; n.append(el('b', '', mark), el('span', '', Q.get('nick') || o.name)); stage.append(n); }
  else if (scene === 'goal') { const cur = +Q.get('current') || 47, goal = +Q.get('goal') || 100, g = el('div', 'goal'); const t = el('div', 't'); t.append(el('span', '', Q.get('label') || 'Follower goal'), el('span', '', cur + ' / ' + goal)); const bar = el('div', 'bar'), f = el('div', 'fill'); f.style.setProperty('--p', Math.min(100, cur / goal * 100) + '%'); bar.append(f); g.append(t, bar); stage.append(g); }
  else if (scene === 'alert') { const type = Q.get('type') || 'follow', lab = { follow: 'NEW FOLLOWER', sub: 'NEW SUBSCRIBER', raid: 'INCOMING RAID', donation: 'NEW SUPPORT' }[type] || 'NEW FOLLOWER'; const a = el('div', 'alert'); a.append(el('small', '', lab), el('b', '', Q.get('user') || 'PLAYERONE')); stage.append(a); }
  else if (scene === 'game' || scene === 'ticker') {
    if (scene === 'game') {
      const bug = el('div', 'bug'); const i = new Image(); i.src = logo; bug.append(i, el('span', '', o.name)); stage.append(bug);
      const cam = el('div', 'cam'); cam.style.cssText = 'left:40px;top:640px;width:520px;height:292px'; stage.append(cam); const n = el('div', 'nameplate'); n.style.cssText = 'left:64px;top:944px'; n.append(el('b', '', mark), el('span', '', Q.get('nick') || o.name)); stage.append(n);
      if (Q.get('chat') !== '0') { const ch = el('div', 'chat'); ch.style.cssText = 'left:1500px;top:110px;width:380px;height:820px'; ch.append(el('i', '', 'CHAT')); stage.append(ch); }
    }
    const tk = el('div', 'ticker'); const lbl = el('div', 'lbl'), body = el('div', 'body'); tk.append(lbl, body, el('div', 'tag', hashtag)); stage.append(tk);
    const slides = [['FOLLOW US', () => { const s = el('div', 'slide'); socials.filter(x => x.k !== 'discord').forEach(x => { const a = el('div', 'soc' + (x.ph ? ' ph' : '')); a.append(svg(x.k), el('span', '', x.text)); s.append(a); }); return s; }],
      ['PARTNERS', () => { const s = el('div', 'slide'); s.append(el('div', 'sp', 'Powered by')); sponsors.forEach(p => { if (p.logo) { const im = new Image(); im.src = p.logo; s.append(im); } else s.append(el('div', 'sp', p.name)); }); return s; }],
      ['JOIN THE TEAM', () => { const s = el('div', 'slide'), d = socials.find(x => x.k === 'discord'); const a = el('div', 'soc' + (d.ph ? ' ph' : '')); a.append(svg('discord'), el('span', '', d.text)); s.append(el('div', 'sp', 'Community on Discord'), a); return s; }],
      ['CHAT', () => { const s = el('div', 'slide'); s.append(el('div', 'sp', 'Drop a ' + hashtag + ' in chat when we win')); return s; }]];
    const els = slides.map(([, f]) => { const s = f(); body.append(s); return s; }); let k = Math.max(0, +Q.get('slide') || 0); const show = i => { k = i % slides.length; els.forEach((s, n) => s.classList.toggle('on', n === k)); lbl.textContent = slides[k][0]; }; show(k); window.__showSlide = show; if (Q.get('t') != null) els.forEach(s => s.style.transition = 'none'); if (!Q.get('static') && Q.get('slide') == null && Q.get('t') == null) setInterval(() => show(k + 1), 6500);
  }
  freezeTime(); window.ready = true;
})();
