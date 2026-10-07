// 3D-Fanshop: prozedurale Merch-Modelle (Jersey, Jacke, Hose, Tasche, Fahne, Schal, Kappe) mit Three.js.
// Alles wird aus Parametern ("kit") erzeugt: Farben, Muster, Texte, Logo. Keine fertigen 3D-Dateien nötig.
import * as THREE from 'three';
import { OrbitControls } from '/vendor/three/OrbitControls.js';
import { RoomEnvironment } from '/vendor/three/RoomEnvironment.js';
import { RoundedBoxGeometry } from '/vendor/three/RoundedBoxGeometry.js';

// ---------------------------------------------------------------- Hilfen
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function hash(x, y) { let h = (x * 374761393 + y * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
function vnoise(x, y) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); return lerp(lerp(hash(xi, yi), hash(xi + 1, yi), u), lerp(hash(xi, yi + 1), hash(xi + 1, yi + 1), u), v); }
function fbm(x, y, o = 4) { let a = .5, f = 1, s = 0; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= .5; } return s; }
const hex = c => new THREE.Color(c);
const mixHex = (a, b, t) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString();
const bez = (p0, p1, p2, p3, n = 14) => { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; o.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); } return o; };
const line = (a, b, n = 8) => { const o = []; for (let i = 0; i <= n; i++) o.push([lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n)]); return o; };
let fontsReady;
export function loadFonts() { return fontsReady || (fontsReady = (async () => { try { const f = new FontFace('Anton', 'url(/fonts/anton.woff2)'); await f.load(); document.fonts.add(f); } catch {} })()); }

// ---------------------------------------------------------------- Flächen-Mesh (aufgeblasene Stoffbahnen)
// outline: Liste von Segmenten {pts:[[x,y]..], seam:true|false}; Seam-Kanten sind vernäht (Vorder-/Rückseite treffen sich),
// offene Kanten (Saum, Ärmelende, Halsausschnitt) bleiben auf -> man sieht ins Innere.
function pointInPoly(x, y, poly) { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
function segDist(px, py, a, b) { const dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy; let t = l ? ((px - a[0]) * dx + (py - a[1]) * dy) / l : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(px - (a[0] + t * dx), py - (a[1] + t * dy)); }
function resample(pts, step) { const out = [pts[0]]; let acc = 0; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]); let d = step - acc; while (d <= L) { const t = d / L; out.push([lerp(a[0], b[0], t), lerp(a[1], b[1], t)]); d += step; } acc = (acc + L) % step; } const l = pts[pts.length - 1], o = out[out.length - 1]; if (Math.hypot(l[0] - o[0], l[1] - o[1]) > step * .25) out.push(l); else out[out.length - 1] = l; return out; }

export function buildPanels(outline, opt = {}) {
  const step = opt.step || 1.0, D = opt.D || 10, H = opt.H || 8.5;
  // Randpunkte mit Seam-Flag
  const bpts = []; const seamSegs = [];
  outline.forEach(seg => { const r = resample(seg.pts, step); r.forEach((p, i) => { if (bpts.length && Math.hypot(bpts[bpts.length - 1].x - p[0], bpts[bpts.length - 1].y - p[1]) < 1e-6) return; bpts.push({ x: p[0], y: p[1], seam: !!seg.seam }); }); if (seg.seam) for (let i = 1; i < seg.pts.length; i++) seamSegs.push([seg.pts[i - 1], seg.pts[i]]); });
  if (bpts.length > 2 && Math.hypot(bpts[0].x - bpts[bpts.length - 1].x, bpts[0].y - bpts[bpts.length - 1].y) < 1e-6) bpts.pop();
  const poly = bpts.map(p => [p.x, p.y]); const allSegs = []; for (let i = 0; i < poly.length; i++) allSegs.push([poly[i], poly[(i + 1) % poly.length]]);
  let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9; poly.forEach(([x, y]) => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); });
  // Innenpunkte (versetztes Dreiecksraster mit Jitter)
  const pts = bpts.map(p => [p.x, p.y]); const isSeam = bpts.map(p => p.seam); const gs = step * 1.25;
  for (let r = 0, y = minY; y <= maxY; y += gs * .866, r++) for (let x = minX + (r % 2 ? gs / 2 : 0); x <= maxX; x += gs) {
    const jx = x + (hash(Math.round(x * 7), Math.round(y * 7)) - .5) * gs * .25, jy = y + (hash(Math.round(y * 5), Math.round(x * 5)) - .5) * gs * .25;
    if (!pointInPoly(jx, jy, poly)) continue; let near = 1e9; for (const s of allSegs) { near = Math.min(near, segDist(jx, jy, s[0], s[1])); if (near < step * .6) break; } if (near < step * .6) continue; pts.push([jx, jy]); isSeam.push(false);
  }
  const del = new window.Delaunator(Float64Array.from(pts.flat())); const tri = [];
  for (let i = 0; i < del.triangles.length; i += 3) { const a = del.triangles[i], b = del.triangles[i + 1], c = del.triangles[i + 2], A = pts[a], B = pts[b], C = pts[c];
    const cx = (A[0] + B[0] + C[0]) / 3, cy = (A[1] + B[1] + C[1]) / 3; if (!pointInPoly(cx, cy, poly)) continue;
    const inner = (P, Q) => pointInPoly(lerp((P[0] + Q[0]) / 2, cx, .3), lerp((P[1] + Q[1]) / 2, cy, .3), poly);
    if (!inner(A, B) || !inner(B, C) || !inner(A, C)) continue; tri.push(a, b, c); }
  // Höhenprofil
  const z = pts.map((p, i) => { let d = 1e9; for (const s of seamSegs) d = Math.min(d, segDist(p[0], p[1], s[0], s[1])); const t = Math.min(1, d / D), f = Math.sqrt(1 - (1 - t) * (1 - t)); let h = H * f;
    if (opt.shape) h *= opt.shape(p[0], p[1]); const w = (fbm(p[0] * .09 + 3, p[1] * .09) - .5) * (opt.wrinkle ?? 1.4) * Math.min(1, t * 2); return Math.max(0, h + w * (h > .5 ? 1 : 0)); });
  const W = maxX - minX, Hh = maxY - minY;
  const mk = (sign, flipU) => { const g = new THREE.BufferGeometry(); const pos = new Float32Array(pts.length * 3), uv = new Float32Array(pts.length * 2);
    pts.forEach((p, i) => { pos[i * 3] = p[0]; pos[i * 3 + 1] = p[1]; pos[i * 3 + 2] = sign * z[i]; const u = (p[0] - minX) / W; uv[i * 2] = flipU ? 1 - u : u; uv[i * 2 + 1] = (p[1] - minY) / Hh; });
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    const flipped = tri.map((v, i) => tri[i - (i % 3) + [0, 2, 1][i % 3]]); const idx = sign > 0 ? flipped : tri; g.setIndex(idx); g.computeVertexNormals(); return g; };
  return { front: mk(1, false), back: mk(-1, true), box: { minX, maxX, minY, maxY, W, Hh }, bpts, z, pts };
}

// ---------------------------------------------------------------- Texturen (Canvas)
function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function tx(canvas, srgb = true) { const t = new THREE.CanvasTexture(canvas); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; }
function fabricNormal() { const S = 256, c = makeCanvas(S, S), g = c.getContext('2d'), im = g.createImageData(S, S); const hgt = (x, y) => { const a = (Math.sin(x * Math.PI / 2) * .5 + .5) * (Math.sin(y * Math.PI / 2) * .5 + .5); return a + (hash(x, y) - .5) * .3; };
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const dx = hgt((x + 1) % S, y) - hgt((x + S - 1) % S, y), dy = hgt(x, (y + 1) % S) - hgt(x, (y + S - 1) % S), i = (y * S + x) * 4; im.data[i] = 128 + dx * 60; im.data[i + 1] = 128 + dy * 60; im.data[i + 2] = 255; im.data[i + 3] = 255; }
  g.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(26, 26); return t; }
let NORMAL; const fabricNormalMap = () => NORMAL || (NORMAL = fabricNormal());

// Zeichen-Kontext in Zentimetern; pass: 'color' | 'orm' (G=Rauheit, B=Metall)
function ctxFor(canvas, box, pass) {
  const g = canvas.getContext('2d'), sx = canvas.width / box.W, sy = canvas.height / box.Hh; g.setTransform(sx, 0, 0, -sy, -box.minX * sx, box.maxY * sy);
  const col = (c, metal = false) => pass === 'color' ? c : (metal ? 'rgb(0,72,255)' : 'rgb(0,190,0)');
  return { g, sx, col, pass };
}
function poly(g, pts) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); }
function mirror(pts) { return pts.map(p => [-p[0], p[1]]); }
function textCm(c, str, x, y, sizeCm, o = {}) { const g = c.g; g.save(); g.translate(x, y); g.scale(1, -1); if (o.skew) g.transform(1, 0, o.skew, 1, 0, 0); if (o.rot) g.rotate(o.rot);
  g.font = `${sizeCm}px ${o.font || 'Anton, Impact, sans-serif'}`; g.textAlign = o.align || 'center'; g.textBaseline = 'middle'; if (g.letterSpacing !== undefined) g.letterSpacing = (o.spacing || 0) + 'px';
  if (o.stroke) { g.lineWidth = o.stroke.w; g.strokeStyle = c.col(o.stroke.c, o.metal); g.lineJoin = 'round'; g.strokeText(str, 0, 0); }
  g.fillStyle = c.col(o.color || '#fff', o.metal); g.fillText(str, 0, 0); g.restore(); }
function smokePattern(canvas, box, a, b, scale = 1) { // organische "Rauch/Riss"-Fläche zwischen zwei Farben (Pixelweise Rauschen)
  const g = canvas.getContext('2d'), w = canvas.width, h = canvas.height; g.setTransform(1, 0, 0, 1, 0, 0); const ca = hex(a), cb = hex(b), im = g.getImageData(0, 0, w, h), d = im.data; const step = 2;
  for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) { const nx = x / w * 5.5 * scale, ny = y / w * 5.5 * scale; const q = fbm(nx + fbm(nx * 1.7, ny * 1.7, 2) * 2.2, ny + 8.3, 5); const e = smooth(.47, .53, q) - smooth(.53, .59, q) * .5; const m = Math.max(0, Math.min(1, e));
    const r = lerp(ca.r, cb.r, m) * 255, gg = lerp(ca.g, cb.g, m) * 255, bb = lerp(ca.b, cb.b, m) * 255;
    for (let yy = 0; yy < step; yy++) for (let xx = 0; xx < step; xx++) { const i = ((y + yy) * w + x + xx) * 4; if (i + 3 < d.length) { d[i] = r; d[i + 1] = gg; d[i + 2] = bb; d[i + 3] = 255; } } }
  g.putImageData(im, 0, 0); }
function dotMesh(c, x0, y0, x1, y1, color, a = .22) { c.g.save(); c.g.globalAlpha = a; c.g.fillStyle = c.col(color); for (let y = y0; y < y1; y += 1.1) for (let x = x0 + ((Math.round(y / 1.1) % 2) ? .55 : 0); x < x1; x += 1.1) { c.g.beginPath(); c.g.arc(x, y, .27, 0, 7); c.g.fill(); } c.g.restore(); }
function logoMark(c, kit, x, y, sizeCm, o = {}) { // "VLX"-Wortmarke (oder Logo-Bild, falls vorhanden)
  if (kit._logoImg && o.useImage !== false) { const g = c.g, im = kit._logoImg, h = sizeCm * 1.1, w = h * im.width / im.height; if (c.pass === 'color') { g.save(); g.translate(x, y); g.scale(1, -1); g.drawImage(im, -w / 2, -h / 2, w, h); g.restore(); } else { g.save(); g.fillStyle = c.col('#fff', true); g.fillRect(x - w / 2, y - h / 2, w, h); g.restore(); } return; }
  textCm(c, kit.mark || 'VLX', x, y, sizeCm, { skew: -.18, color: o.color || kit.trim, metal: o.metal ?? kit.metalTrim, stroke: o.stroke }); }

// ---------------------------------------------------------------- Silhouetten
const rev = pts => pts.slice().reverse();
const mirX = pts => pts.map(p => [-p[0], p[1]]);
function jerseyOutline(neckPts, sleeve = 'short') {
  const sh = line([8.5, 34], [24, 31.2], 6);
  const top = sleeve === 'long' ? bez([24, 31.2], [38, 27], [52, 6], [58, -20], 20) : bez([24, 31.2], [33, 29.4], [41, 22.6], [45.5, 14.5], 14);
  const cuff = sleeve === 'long' ? line([58, -20], [49, -25], 8) : line([45.5, 14.5], [38.5, 5.5], 8);
  const und = sleeve === 'long' ? bez([49, -25], [43, -2], [30, 9], [22.8, 12.5], 20) : bez([38.5, 5.5], [33, 8.4], [27.5, 10.5], [22.8, 12.5], 12);
  const side = bez([22.8, 12.5], [22.4, 4], [22.2, -14], [23.2, -33], 16);
  const hem = bez([23.2, -33], [12, -34.4], [-12, -34.4], [-23.2, -33], 14);
  return [{ seam: true, pts: sh }, { seam: true, pts: top }, { seam: false, pts: cuff }, { seam: true, pts: und }, { seam: true, pts: side }, { seam: false, pts: hem },
    { seam: true, pts: mirX(rev(side)) }, { seam: true, pts: mirX(rev(und)) }, { seam: false, pts: mirX(rev(cuff)) }, { seam: true, pts: mirX(rev(top)) }, { seam: true, pts: mirX(rev(sh)) }, { seam: false, pts: neckPts }];
}
const NECK_FRONT = bez([-8.5, 34], [-8.6, 26.5], [8.6, 26.5], [8.5, 34], 18), NECK_BACK = bez([-8.5, 34], [-8, 31.6], [8, 31.6], [8.5, 34], 14);

// ---------------------------------------------------------------- Materialien
function fabricMats(kit, cFront, oFront, cBack, oBack) {
  const common = { roughness: 1, metalness: 1, normalMap: fabricNormalMap(), normalScale: new THREE.Vector2(.35, .35), sheen: .7, sheenRoughness: .55, sheenColor: hex(mixHex(kit.primary, '#ffffff', .35)), envMapIntensity: .85 };
  const front = new THREE.MeshPhysicalMaterial({ ...common, map: tx(cFront), roughnessMap: tx(oFront, false), metalnessMap: tx(oFront, false) });
  const back = new THREE.MeshPhysicalMaterial({ ...common, map: tx(cBack), roughnessMap: tx(oBack, false), metalnessMap: tx(oBack, false) });
  const inside = new THREE.MeshStandardMaterial({ color: hex(mixHex(kit.primary, '#000000', .45)), roughness: .95, metalness: 0, side: THREE.BackSide });
  return { front, back, inside };
}
const trimMat = kit => new THREE.MeshPhysicalMaterial({ color: hex(kit.collar || kit.accent), roughness: .35, metalness: kit.metalTrim ? .9 : .1, envMapIntensity: 1 });

// ---------------------------------------------------------------- Jersey-Texturen
function jerseyBase(c, kit, box, canvas) {
  const { g } = c; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = c.col(kit.primary); g.fillRect(0, 0, canvas.width, canvas.height); g.restore();
  if (c.pass === 'color') { if (kit.pattern === 'smoke') smokePattern(canvas, box, kit.primary, kit.patternColor || mixHex(kit.primary, '#ffffff', .12)); }
  const g2 = canvas.getContext('2d'); const sx = canvas.width / box.W, sy = canvas.height / box.Hh; g2.setTransform(sx, 0, 0, -sy, -box.minX * sx, box.maxY * sy);
  if (c.pass === 'color' && kit.pattern === 'stripes') { g2.save(); g2.globalAlpha = .13; g2.fillStyle = '#fff'; for (let x = box.minX; x < box.maxX; x += 1.7) g2.fillRect(x, box.minY, .45, box.Hh); g2.restore(); }
  if (c.pass === 'color' && kit.mesh !== false) dotMesh(c, box.minX, box.minY, box.maxX, box.maxY, '#ffffff', .05);
  // Raglan-Ärmelfelder
  const sleeveR = [[8.5, 34.4], [64, 44], [64, -8], [22.8, 12.5]]; g.fillStyle = c.col(kit.secondary); [sleeveR, mirror(sleeveR)].forEach(p => { poly(g, p); g.fill(); });
  g.lineCap = 'round'; g.strokeStyle = c.col(kit.trim, kit.metalTrim); g.lineWidth = .55; [[8.5, 34], [22.8, 12.5]].length && [1, -1].forEach(s => { g.beginPath(); g.moveTo(8.5 * s, 34.2); g.lineTo(22.8 * s, 12.5); g.stroke(); });
  // Seitenfelder
  const sideP = [[22.8, 12.5], [23.8, -35], [17.6, -35], [18.4, -8], [20.4, 5]]; g.fillStyle = c.col(kit.side || kit.secondary); [sideP, mirror(sideP)].forEach(p => { poly(g, p); g.fill(); });
  g.strokeStyle = c.col(kit.trim, kit.metalTrim); g.lineWidth = .35; [1, -1].forEach(s => { g.beginPath(); g.moveTo(20.4 * s, 5); g.lineTo(18.4 * s, -8); g.lineTo(17.6 * s, -35); g.stroke(); });
  // Manschetten (Ärmelenden) + Saum
  g.fillStyle = c.col(kit.accent); [1, -1].forEach(s => { poly(g, [[45.8 * s, 14.9], [38.2 * s, 5.1], [36 * s, 7.8], [43.8 * s, 17.4]]); g.fill(); });
  g.strokeStyle = c.col(kit.trim, kit.metalTrim); g.lineWidth = .5; [1, -1].forEach(s => { g.beginPath(); g.moveTo(43.8 * s, 17.4); g.lineTo(36 * s, 7.8); g.stroke(); });
  g.fillStyle = c.col(kit.accent); g.fillRect(-25, -35, 50, 3.1); g.fillStyle = c.col(kit.trim, kit.metalTrim); g.fillRect(-25, -31.7, 50, .45);
}
function drawJerseyFront(canvas, box, kit, pass) {
  const c = ctxFor(canvas, box, pass), { g } = c; jerseyBase(c, kit, box, canvas); const c2 = ctxFor(canvas, box, pass);
  textCm(c2, kit.sponsor || 'VALIOUX', 0, -5, 8.6, { skew: -.2, color: kit.ink || kit.trim, metal: kit.metalTrim, spacing: .9 });
  logoMark(c2, kit, 13.2, 21.5, 6.2, { color: kit.ink || kit.trim }); [-1.6, 1.6].forEach(dx => starCm(c2, 11.6 + dx * 1.7 + 1.6, 26, .7, kit.ink || kit.trim));
  textCm(c2, 'PARTNER', -13, 22, 2.4, { skew: -.18, color: kit.ink || kit.trim, metal: false, font: 'Inter, Arial, sans-serif', spacing: .3 });
  textCm(c2, 'PARTNER', 38.5, 15.5, 2.1, { rot: .84, color: kit.trim, font: 'Inter, Arial, sans-serif' }); logoMark(c2, kit, -37.5, 17, 3.2);
  textCm(c2, kit.maker || 'VLXWEAR', -13, 17.5, 1.6, { color: kit.ink || kit.trim, font: 'Inter, Arial, sans-serif', spacing: .6 });
}
function starCm(c, x, y, r, color) { const g = c.g; g.save(); g.fillStyle = c.col(color, true); g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); g.restore(); }
function drawJerseyBack(canvas, box, kit, pass) {
  const c = ctxFor(canvas, box, pass); jerseyBase(c, kit, box, canvas); const c2 = ctxFor(canvas, box, pass);
  textCm(c2, (kit.playerName || 'PLAYER').toUpperCase(), 0, 25.5, 5, { skew: -.12, color: kit.trim, metal: kit.metalTrim, spacing: 1 });
  textCm(c2, String(kit.number ?? '7'), 0, 5, 27, { skew: -.2, color: kit.ink || kit.trim, metal: kit.metalTrim, stroke: { w: .5, c: kit.accent } });
  logoMark(c2, kit, 0, -22, 5, { color: kit.ink || kit.trim }); textCm(c2, 'PARTNER', -37.5, 17, 2.1, { rot: -.84, color: kit.trim, font: 'Inter, Arial, sans-serif' });
}
export function buildJersey(kit, long = false) {
  const root = new THREE.Group(); const f = buildPanels(jerseyOutline(NECK_FRONT, long ? 'long' : 'short'), { H: 8.8, D: 11 }), b = buildPanels(jerseyOutline(NECK_BACK, long ? 'long' : 'short'), { H: 8.8, D: 11 }), box = f.box;
  const w = 2048, h = Math.round(w * box.Hh / box.W), mk = (fn, pass) => { const cv = makeCanvas(w, h); fn(cv, box, kit, pass); return cv; };
  const m = fabricMats(kit, mk(drawJerseyFront, 'color'), mk(drawJerseyFront, 'orm'), mk(drawJerseyBack, 'color'), mk(drawJerseyBack, 'orm'));
  const mf = new THREE.Mesh(f.front, m.front), mfi = new THREE.Mesh(f.front, m.inside), mb = new THREE.Mesh(b.back, m.back), mbi = new THREE.Mesh(b.back, m.inside); root.add(mf, mfi, mb, mbi); [mf, mb].forEach(x => { x.castShadow = true; });
  // Kragen: Rohr entlang der Halsausschnitt-Ränder (vorn +z, hinten -z)
  const nf = f.bpts.map((p, i) => ({ p, z: f.z[i] })).filter(o => !o.p.seam), nb = b.bpts.map((p, i) => ({ p, z: b.z[i] })).filter(o => !o.p.seam);
  const neckF = nf.filter(o => o.p.y > 24 && o.p.y < 34.4 && Math.abs(o.p.x) < 9.2), neckB = nb.filter(o => o.p.y > 30 && o.p.y < 34.4 && Math.abs(o.p.x) < 9.2);
  const sortX = a => a.sort((p, q) => p.p.x - q.p.x);
  const loop = [...sortX(neckF).map(o => new THREE.Vector3(o.p.x, o.p.y, o.z)), ...sortX(neckB).reverse().map(o => new THREE.Vector3(o.p.x, o.p.y, -o.z))];
  if (loop.length > 6) { const curve = new THREE.CatmullRomCurve3(loop, true, 'catmullrom', .5); const collar = new THREE.Mesh(new THREE.TubeGeometry(curve, 120, .95, 10, true), trimMat(kit)); root.add(collar); }
  return { object: root, center: new THREE.Vector3(0, 0, 0), radius: 62 };
}

// ---------------------------------------------------------------- Jacke (Tracksuit-Oberteil)
const NECK_JACKET = bez([-8.5, 34], [-8.6, 31.2], [8.6, 31.2], [8.5, 34], 16);
function drawJacket(canvas, box, kit, pass, back) {
  const c = ctxFor(canvas, box, pass), { g } = c; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = c.col(kit.primary); g.fillRect(0, 0, canvas.width, canvas.height); g.restore();
  if (pass === 'color' && kit.pattern === 'smoke') smokePattern(canvas, box, kit.primary, kit.patternColor || mixHex(kit.primary, '#ffffff', .08));
  const c2 = ctxFor(canvas, box, pass), g2 = c2.g; g2.lineCap = 'round'; g2.lineJoin = 'round';
  // Streifen entlang Schulter -> Ärmel (wie bei Trainingsanzügen) + seitlich
  g2.strokeStyle = c2.col(kit.trim, kit.metalTrim); [1, -1].forEach(sg => { [0, 1.3].forEach((o, k) => { g2.lineWidth = k ? .35 : .9; g2.beginPath(); g2.moveTo(10.5 * sg, 33.3 - o * .4); g2.bezierCurveTo(30 * sg, 28 - o, 50 * sg + o * sg, 4, 56 * sg + o * sg, -22); g2.stroke(); }); g2.lineWidth = .9; g2.beginPath(); g2.moveTo(22.5 * sg, 8); g2.lineTo(23 * sg, -34); g2.stroke(); });
  g2.fillStyle = c2.col(kit.accent); [1, -1].forEach(sg => { poly(g2, [[58.3 * sg, -19.5], [48.6 * sg, -24.6], [47.3 * sg, -20.6], [56.4 * sg, -15.4]]); g2.fill(); }); g2.fillRect(-24, -35, 48, 3.4);
  if (!back) { g2.strokeStyle = c2.col(kit.trim, true); g2.lineWidth = .6; g2.beginPath(); g2.moveTo(0, 31); g2.lineTo(0, -34); g2.stroke(); g2.lineWidth = .15; g2.setLineDash([.35, .35]); g2.beginPath(); g2.moveTo(.9, 31); g2.lineTo(.9, -34); g2.stroke(); g2.setLineDash([]);
    g2.strokeStyle = c2.col(kit.trim); g2.lineWidth = .3; [1, -1].forEach(sg => { g2.beginPath(); g2.moveTo(sg * 8, -12); g2.lineTo(sg * 12.5, -26); g2.stroke(); });
    logoMark(c2, kit, 12.5, 22, 5.2, { color: kit.ink || kit.trim }); textCm(c2, kit.sponsor || 'VALIOUX', -12.5, 22, 2.6, { skew: -.18, color: kit.ink || kit.trim, metal: kit.metalTrim, spacing: .4 }); }
  else { textCm(c2, kit.sponsor || 'VALIOUX', 0, 8, 7.5, { skew: -.2, color: kit.ink || kit.trim, metal: kit.metalTrim, spacing: .6 }); logoMark(c2, kit, 0, -8, 9, { color: kit.ink || kit.trim }); }
}
function buildJacket(kit) {
  const f = buildPanels(jerseyOutline(NECK_JACKET, 'long'), { H: 9, D: 11 }), b = buildPanels(jerseyOutline(NECK_JACKET, 'long'), { H: 9, D: 11 }), box = f.box, w = 2048, h = Math.round(w * box.Hh / box.W), root = new THREE.Group();
  const mk = (back, pass) => { const cv = makeCanvas(w, h); drawJacket(cv, box, kit, pass, back); return cv; };
  const m = fabricMats(kit, mk(false, 'color'), mk(false, 'orm'), mk(true, 'color'), mk(true, 'orm'));
  root.add(new THREE.Mesh(f.front, m.front), new THREE.Mesh(f.front, m.inside), new THREE.Mesh(b.back, m.back), new THREE.Mesh(b.back, m.inside));
  const nf = f.bpts.map((p, i) => ({ p, z: f.z[i] })).filter(o => !o.p.seam && o.p.y > 28 && Math.abs(o.p.x) < 9.2).sort((a, c) => a.p.x - c.p.x).map(o => new THREE.Vector3(o.p.x, o.p.y, o.z));
  const nb = b.bpts.map((p, i) => ({ p, z: b.z[i] })).filter(o => !o.p.seam && o.p.y > 28 && Math.abs(o.p.x) < 9.2).sort((a, c) => c.p.x - a.p.x).map(o => new THREE.Vector3(o.p.x, o.p.y, -o.z));
  if (nf.length + nb.length > 6) root.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([...nf, ...nb], true, 'catmullrom', .5), 120, 1.6, 10, true), trimMat(kit)));
  const pull = new THREE.Mesh(new THREE.BoxGeometry(1.1, 3.4, .5), new THREE.MeshStandardMaterial({ color: 0xcfd4dc, metalness: 1, roughness: .25 })); pull.position.set(.2, 28, f.z[0] + 9.3); root.add(pull);
  return { object: root, center: new THREE.Vector3(0, 0, 0), radius: 72 };
}

// ---------------------------------------------------------------- Jogger
function joggerOutline() {
  const outer = bez([18, 34], [22, 22], [19, 4], [16.5, -20], 14).concat(bez([16.5, -20], [15.5, -34], [15, -44], [14.5, -52], 10).slice(1));
  const inner = bez([5.2, -52], [5.2, -40], [4, -20], [.4, -2], 18);
  const R = [{ seam: true, pts: outer }, { seam: false, pts: line([14.5, -52], [5.2, -52], 6) }, { seam: true, pts: inner }];
  const L = [{ seam: true, pts: mirX(rev(inner)) }, { seam: false, pts: mirX(rev(line([14.5, -52], [5.2, -52], 6))) }, { seam: true, pts: mirX(rev(outer)) }];
  return [...R, ...L, { seam: false, pts: line([-18, 34], [18, 34], 12) }];
}
function drawJogger(canvas, box, kit, pass, back) {
  const c = ctxFor(canvas, box, pass), { g } = c; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = c.col(kit.primary); g.fillRect(0, 0, canvas.width, canvas.height); g.restore();
  if (pass === 'color' && kit.pattern === 'smoke') smokePattern(canvas, box, kit.primary, kit.patternColor || mixHex(kit.primary, '#ffffff', .08));
  const c2 = ctxFor(canvas, box, pass), g2 = c2.g; g2.lineCap = 'round'; g2.fillStyle = c2.col(kit.accent); g2.fillRect(-20, 30.5, 40, 4); g2.fillRect(-20, -52, 40, 5.5);
  g2.strokeStyle = c2.col(kit.trim, kit.metalTrim); [1, -1].forEach(sg => { g2.lineWidth = .9; g2.beginPath(); g2.moveTo(18.2 * sg, 30); g2.bezierCurveTo(20.5 * sg, 20, 18 * sg, 4, 15.8 * sg, -20); g2.lineTo(14.5 * sg, -46); g2.stroke(); g2.lineWidth = .35; g2.beginPath(); g2.moveTo(17 * sg, 30); g2.bezierCurveTo(19 * sg, 20, 16.8 * sg, 4, 14.6 * sg, -20); g2.lineTo(13.4 * sg, -46); g2.stroke(); });
  if (!back) { g2.lineWidth = .5; g2.strokeStyle = c2.col(kit.trim, true); [[-2.5, 29], [2.5, 29]].forEach(([x]) => { g2.beginPath(); g2.moveTo(x, 30.5); g2.lineTo(x * 1.4, 20); g2.stroke(); }); logoMark(c2, kit, 11, 22, 4, { color: kit.ink || kit.trim }); textCm(c2, kit.sponsor || 'VALIOUX', -11, -12, 3, { rot: -Math.PI / 2, skew: 0, color: kit.ink || kit.trim, metal: kit.metalTrim, spacing: .5 }); } else { textCm(c2, kit.mark || 'VLX', 0, 24, 4.2, { skew: -.18, color: kit.ink || kit.trim, metal: kit.metalTrim }); }
}
function buildJogger(kit) {
  const f = buildPanels(joggerOutline(), { H: 6.2, D: 7.2 }), b = buildPanels(joggerOutline(), { H: 6.2, D: 7.2 }), box = f.box, w = 1536, h = Math.round(w * box.Hh / box.W), root = new THREE.Group();
  const mk = (back, pass) => { const cv = makeCanvas(w, h); drawJogger(cv, box, kit, pass, back); return cv; };
  const m = fabricMats(kit, mk(false, 'color'), mk(false, 'orm'), mk(true, 'color'), mk(true, 'orm'));
  root.add(new THREE.Mesh(f.front, m.front), new THREE.Mesh(f.front, m.inside), new THREE.Mesh(b.back, m.back), new THREE.Mesh(b.back, m.inside)); root.position.y = 9;
  return { object: root, center: new THREE.Vector3(0, 9, 0), radius: 62 };
}

// ---------------------------------------------------------------- Kappe
function buildCap(kit) {
  const root = new THREE.Group(), R = 10.2, HH = R * .9, pts = []; for (let i = 0; i <= 28; i++) { const a = i / 28 * Math.PI / 2, e = 2 / 2.7; pts.push(new THREE.Vector2(Math.pow(Math.cos(a), e) * R, Math.pow(Math.sin(a), e) * HH)); }
  const cw = 2048, ch = 1024, mk = pass => { const cv = makeCanvas(cw, ch), g = cv.getContext('2d'), col = (c, m) => pass === 'color' ? c : (m ? 'rgb(0,72,255)' : 'rgb(0,190,0)');
    g.fillStyle = col(kit.primary); g.fillRect(0, 0, cw, ch); if (pass === 'color' && kit.pattern === 'smoke') smokePattern(cv, { W: 1, Hh: 1 }, kit.primary, kit.patternColor || mixHex(kit.primary, '#fff', .08));
    g.strokeStyle = col(mixHex(kit.primary, '#000000', .35)); g.lineWidth = 3; for (let k = 0; k < 6; k++) { const x = k / 6 * cw; g.beginPath(); g.moveTo(x, ch); g.lineTo(cw / 12 + x, 0); g.stroke(); }
    const mark = x => { g.save(); g.translate(x, ch * .62); g.transform(1, 0, -.18, 1, 0, 0); g.font = '150px Anton, Impact, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col(kit.ink || kit.trim, true); g.fillText(kit.mark || 'VLX', 0, 0); g.restore(); }; mark(0); mark(cw);
    g.fillStyle = col(kit.accent); g.fillRect(0, ch - 60, cw, 60); return cv; };
  const mat = new THREE.MeshPhysicalMaterial({ map: tx(mk('color')), roughnessMap: tx(mk('orm'), false), metalnessMap: tx(mk('orm'), false), roughness: 1, metalness: 1, normalMap: fabricNormalMap(), normalScale: new THREE.Vector2(.4, .4), sheen: .5, side: THREE.DoubleSide, envMapIntensity: .8 });
  const dome = new THREE.Mesh(new THREE.LatheGeometry(pts, 64), mat); dome.rotation.y = 0; root.add(dome);
  const btn = new THREE.Mesh(new THREE.SphereGeometry(.9, 16, 12), trimMat(kit)); btn.position.y = HH + .2; root.add(btn);
  const sh = new THREE.Shape(); sh.moveTo(-9.6, 0); sh.bezierCurveTo(-11.5, 8, -7.5, 15, 0, 15.2); sh.bezierCurveTo(7.5, 15, 11.5, 8, 9.6, 0); sh.lineTo(-9.6, 0);
  const bg = new THREE.ExtrudeGeometry(sh, { depth: .7, bevelEnabled: true, bevelThickness: .25, bevelSize: .25, bevelSegments: 3, curveSegments: 20 }); bg.rotateX(Math.PI / 2); // flach, nach +z
  const p = bg.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, p.getY(i) - .028 * x * x - .006 * z * z - .08 * z); } bg.computeVertexNormals();
  const brim = new THREE.Mesh(bg, new THREE.MeshPhysicalMaterial({ color: hex(kit.accent || kit.secondary), roughness: .5, metalness: kit.metalTrim ? .5 : .05, envMapIntensity: .9 })); brim.position.set(0, 3.2, 6.4); root.add(brim);
  const band = new THREE.Mesh(new THREE.TorusGeometry(R * 1.0, .35, 8, 80), trimMat(kit)); band.rotation.x = Math.PI / 2; band.position.y = .4; root.add(band);
  root.rotation.set(.12, 0, 0); return { object: root, center: new THREE.Vector3(0, 6, 4), radius: 20 };
}

// ---------------------------------------------------------------- Tasche (Crossbody)
function buildBag(kit) {
  const root = new THREE.Group(), S = 1024, mk = (pass, face) => { const cv = makeCanvas(S, S), g = cv.getContext('2d'), col = (c, m) => pass === 'color' ? c : (m ? 'rgb(0,72,255)' : 'rgb(0,190,0)');
    g.fillStyle = col(kit.primary); g.fillRect(0, 0, S, S); if (pass === 'color' && kit.pattern === 'smoke') smokePattern(cv, { W: 1, Hh: 1 }, kit.primary, kit.patternColor || mixHex(kit.primary, '#fff', .08));
    if (face === 'front') { g.fillStyle = col(mixHex(kit.primary, '#000', .25)); g.fillRect(70, S * .52, S - 140, S * .4); g.strokeStyle = col(kit.trim, true); g.lineWidth = 5; g.beginPath(); g.moveTo(60, S * .3); g.lineTo(S - 60, S * .3); g.stroke(); g.setLineDash([10, 8]); g.lineWidth = 2; g.beginPath(); g.moveTo(60, S * .3 + 12); g.lineTo(S - 60, S * .3 + 12); g.stroke(); g.setLineDash([]);
      g.save(); g.translate(S / 2, S * .16); g.transform(1, 0, -.18, 1, 0, 0); g.font = '190px Anton, Impact, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col(kit.ink || kit.trim, true); g.fillText(kit.mark || 'VLX', 0, 0); g.restore();
      g.save(); g.translate(S / 2, S * .72); g.font = '82px Anton, Impact, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col(kit.ink || kit.trim, kit.metalTrim); g.fillText((kit.sponsor || 'VALIOUX'), 0, 0); g.restore(); }
    return cv; };
  const mm = face => new THREE.MeshPhysicalMaterial({ map: tx(mk('color', face)), roughnessMap: tx(mk('orm', face), false), metalnessMap: tx(mk('orm', face), false), roughness: 1, metalness: 1, normalMap: fabricNormalMap(), normalScale: new THREE.Vector2(.5, .5), sheen: .4, envMapIntensity: .8 });
  const plain = mm('side'), front = mm('front'); const body = new THREE.Mesh(new RoundedBoxGeometry(22, 28, 8, 6, 2.6), [plain, plain, plain, plain, front, plain]); root.add(body);
  const flap = new THREE.Mesh(new RoundedBoxGeometry(22.3, 4.4, 8.4, 4, 1.5), new THREE.MeshPhysicalMaterial({ color: hex(kit.accent || kit.secondary), roughness: .5, envMapIntensity: .8 })); flap.position.y = 12.8; root.add(flap);
  const pull = new THREE.Mesh(new THREE.TorusGeometry(.9, .25, 8, 20), new THREE.MeshStandardMaterial({ color: 0xcfd4dc, metalness: 1, roughness: .25 })); pull.position.set(9, 10.4, 4.3); root.add(pull);
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-10.4, 13, 0), new THREE.Vector3(-13, 24, -.5), new THREE.Vector3(-9, 36, -2), new THREE.Vector3(0, 41, -3), new THREE.Vector3(9, 36, -2), new THREE.Vector3(13, 24, -.5), new THREE.Vector3(10.4, 13, 0)], false, 'catmullrom', .5);
  const strap = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 1.25, 8, false), new THREE.MeshPhysicalMaterial({ color: hex(mixHex(kit.primary, kit.accent || '#ffffff', .22)), roughness: .65, envMapIntensity: .7 })); strap.scale.z = .3; root.add(strap);
  root.position.y = -8; return { object: root, center: new THREE.Vector3(0, 14, 0), radius: 36 };
}

// ---------------------------------------------------------------- Fahne / Banner (animiert)
function bannerTexture(kit, w, h, kind) {
  const mk = () => { const cv = makeCanvas(w, h), g = cv.getContext('2d'); g.fillStyle = kit.primary; g.fillRect(0, 0, w, h); if (kit.pattern === 'smoke') smokePattern(cv, { W: 1, Hh: 1 }, kit.primary, kit.patternColor || mixHex(kit.primary, '#fff', .1)); return cv; };
  const cv = mk(), g = cv.getContext('2d');
  if (kind === 'flag') { g.strokeStyle = kit.trim; g.lineWidth = 6; g.strokeRect(26, 26, w - 52, h - 52); g.strokeStyle = kit.accent; g.lineWidth = 3; g.strokeRect(44, 44, w - 88, h - 88);
    g.save(); g.translate(w / 2, h * .45); g.transform(1, 0, -.18, 1, 0, 0); g.font = `${h * .34}px Anton, Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = kit.ink || kit.trim; g.fillText(kit.mark || 'VLX', 0, 0); g.restore();
    g.font = `${h * .08}px Anton, Impact, sans-serif`; g.textAlign = 'center'; g.fillStyle = kit.trim; g.letterSpacing = '8px'; g.fillText((kit.sponsor || 'VALIOUX') + '  ·  ' + (kit.tagline || 'FEARLESS. ELEVATED.'), w / 2, h * .8); }
  else { g.fillStyle = kit.accent; [[.0, .06], [.1, .02], [.9, .02], [.94, .06]].forEach(([y, hh]) => g.fillRect(0, y * h, w, hh * h)); g.fillStyle = kit.ink || kit.trim; g.font = `${w * .42}px Anton, Impact, sans-serif`; g.textBaseline = 'middle'; g.textAlign = 'center'; for (let k = 0; k < 4; k++) { g.save(); g.translate(w / 2, h * (.15 + k * .22)); g.rotate(-Math.PI / 2 * 0); g.font = `${w * .3}px Anton, Impact, sans-serif`; g.fillText(kit.mark || 'VLX', 0, 0); g.restore(); } }
  return cv;
}
function buildFlag(kit) {
  const root = new THREE.Group(), W = 90, Hh = 60, seg = [70, 46], cv = bannerTexture(kit, 1536, 1024, 'flag'), tex = tx(cv);
  const mat = new THREE.MeshPhysicalMaterial({ map: tex, roughness: .75, metalness: 0, sheen: .6, side: THREE.DoubleSide, envMapIntensity: .8 }); const g = new THREE.PlaneGeometry(W, Hh, seg[0], seg[1]); const base = g.attributes.position.array.slice();
  const flag = new THREE.Mesh(g, mat); flag.position.set(W / 2 + 1.6, 6, 0); root.add(flag);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, 112, 16), new THREE.MeshStandardMaterial({ color: 0xcfd4dc, metalness: 1, roughness: .25 })); pole.position.set(0, -20, 0); root.add(pole); const ball = new THREE.Mesh(new THREE.SphereGeometry(1.8, 20, 16), pole.material); ball.position.set(0, 36.5, 0); root.add(ball);
  const upd = t => { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = base[i * 3], y = base[i * 3 + 1], k = (x + W / 2) / W; p.setZ(i, Math.sin(k * 7 - t * 2.4 + y * .05) * 3.2 * k + Math.sin(k * 3.5 - t * 1.3) * 1.6 * k); p.setY(i, y - Math.sin(k * 5 - t * 2) * .6 * k); } p.needsUpdate = true; g.computeVertexNormals(); };
  upd(0); return { object: root, center: new THREE.Vector3(W / 2 - 4, 4, 0), radius: 64, update: upd };
}
function buildScarf(kit) {
  const root = new THREE.Group(), W = 16, L = 150, cv = bannerTexture(kit, 512, 2400, 'scarf'), g2 = cv.getContext('2d'); g2.clearRect(0, 2400 - 120, 512, 120); g2.fillStyle = kit.accent; for (let x = 0; x < 512; x += 14) { g2.fillRect(x, 2400 - 120, 7, 120); } // Fransen
  const tex = tx(cv), mat = new THREE.MeshPhysicalMaterial({ map: tex, roughness: .85, sheen: .8, side: THREE.DoubleSide, alphaTest: .5, envMapIntensity: .8 }); const gm = new THREE.PlaneGeometry(W, L, 10, 160), base = gm.attributes.position.array.slice();
  const scarf = new THREE.Mesh(gm, mat); root.add(scarf); const upd = t => { const p = gm.attributes.position; for (let i = 0; i < p.count; i++) { const x = base[i * 3], y = base[i * 3 + 1], k = y / L; p.setX(i, x * Math.cos(k * 1.1 + Math.sin(t * .4) * .15) + Math.sin(k * 5.5 + t * .5) * 12); p.setZ(i, x * Math.sin(k * 1.1) * .5 + Math.sin(k * 7 + t * .7) * 5 + Math.sin(k * 21 - t * 1.2) * .5); } p.needsUpdate = true; gm.computeVertexNormals(); }; upd(0);
  return { object: root, center: new THREE.Vector3(0, 0, 0), radius: 82, update: upd };
}
// ---------------------------------------------------------------- Viewer
export const VIEWS = { front: [0, 0, 1], back: [0, 0, -1], left: [-1, 0, 0], right: [1, 0, 0], top: [0, 1, .0001], bottom: [0, -1, .0001] };
function ensureDelaunator() { if (window.Delaunator) return Promise.resolve(); return new Promise((ok, no) => { const s = document.createElement('script'); s.src = '/vendor/delaunator.min.js'; s.onload = ok; s.onerror = no; document.head.append(s); }); }
function loadImg(u) { return new Promise(r => { if (!u) return r(null); const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => r(i); i.onerror = () => r(null); i.src = u; }); }
export function buildItem(kit) {
  switch (kit.kind) {
    case 'jersey': return buildJersey(kit, false);
    case 'jacket': return buildJacket(kit);
    case 'jogger': return buildJogger(kit);
    case 'cap': return buildCap(kit);
    case 'bag': return buildBag(kit);
    case 'flag': return buildFlag(kit);
    case 'scarf': return buildScarf(kit);
    default: return buildJersey(kit, false);
  }
}
export async function mountKit(el, kitIn, opts = {}) {
  await Promise.all([loadFonts(), ensureDelaunator()]);
  const kit = { ...kitIn }; kit._logoImg = await loadImg(kit.logoUrl);
  const W = () => el.clientWidth || 600, Hh = () => el.clientHeight || 600;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: !!opts.preserve }); renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setSize(W(), Hh());
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;cursor:grab'; el.append(renderer.domElement);
  const scene = new THREE.Scene(); const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .9;
  const camera = new THREE.PerspectiveCamera(30, W() / Hh(), 1, 3000); const accent = hex(kit.accent || '#8FB8FF');
  scene.add(camera); const key = new THREE.PointLight(0xffffff, 1, 0, 2), fill = new THREE.PointLight(0xdfe8ff, 1, 0, 2), rim = new THREE.PointLight(accent, 1, 0, 2), rim2 = new THREE.PointLight(0xffffff, 1, 0, 2); camera.add(key, fill, rim, rim2);
  const placeLights = d => { key.position.set(.55 * d, .75 * d, .25 * d); key.intensity = 2.3 * d * d; fill.position.set(-.7 * d, -.1 * d, .3 * d); fill.intensity = .9 * d * d; rim.position.set(-.8 * d, .5 * d, -2 * d); rim.intensity = 2.6 * d * d; rim2.position.set(.9 * d, .3 * d, -2 * d); rim2.intensity = 1.2 * d * d; };
  let item = null, auto = opts.autoRotate !== false, dist = 200; const target = new THREE.Vector3();
  const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.dampingFactor = .08; controls.enablePan = false; controls.autoRotateSpeed = 1.6; controls.autoRotate = auto;
  function setKit(k, keep) { if (item) { scene.remove(item.object); item.object.traverse(o => { if (o.geometry) o.geometry.dispose(); }); } Object.assign(kit, k); item = buildItem(kit); scene.add(item.object);
    target.copy(item.center); const fov = camera.fov * Math.PI / 180; dist = item.radius / Math.sin(fov / 2) * (opts.fit || .8); controls.target.copy(target); controls.minDistance = dist * .35; controls.maxDistance = dist * 2.2; placeLights(dist);
    if (!keep) { const yaw = opts.yaw ?? .18, pitch = opts.pitch ?? .06; camera.position.set(target.x + Math.sin(yaw) * dist * .98, target.y + dist * pitch, target.z + Math.cos(yaw) * dist * .98); } controls.update(); }
  let tween = null; function view(name) { const d = VIEWS[name] || VIEWS.front, v = new THREE.Vector3(...d).normalize().multiplyScalar(dist).add(target); controls.autoRotate = false; tween = { from: camera.position.clone(), to: v, t: 0 }; }
  setKit(kit);
  const ro = new ResizeObserver(() => { renderer.setSize(W(), Hh()); camera.aspect = W() / Hh(); camera.updateProjectionMatrix(); }); ro.observe(el);
  let raf, last = performance.now(), running = true; const clock = new THREE.Clock();
  const frame = now => { raf = requestAnimationFrame(frame); if (!running) return; const dt = (now - last) / 1000; last = now;
    if (tween) { tween.t = Math.min(1, tween.t + dt / .9); const e = tween.t * tween.t * (3 - 2 * tween.t); const a = tween.from.clone().sub(target), b = tween.to.clone().sub(target); const len = lerp(a.length(), b.length(), e); camera.position.copy(a.normalize().lerp(b.normalize(), e).normalize().multiplyScalar(len).add(target)); if (tween.t >= 1) tween = null; }
    if (item && item.update) item.update(clock.getElapsedTime()); controls.update(); renderer.render(scene, camera); };
  raf = requestAnimationFrame(frame);
  const io = new IntersectionObserver(es => { running = es[0].isIntersecting; }); io.observe(el);
  renderer.domElement.addEventListener('pointerdown', () => { renderer.domElement.style.cursor = 'grabbing'; tween = null; if (opts.stopOnDrag !== false) controls.autoRotate = false; }); renderer.domElement.addEventListener('pointerup', () => renderer.domElement.style.cursor = 'grab');
  return { view, setKit, setAuto: v => { auto = v; controls.autoRotate = v; tween = null; }, isAuto: () => controls.autoRotate, reset: () => { tween = null; const yaw = opts.yaw ?? .18, pitch = opts.pitch ?? .06; camera.position.set(target.x + Math.sin(yaw) * dist * .98, target.y + dist * pitch, target.z + Math.cos(yaw) * dist * .98); controls.update(); },
    snapshot: () => { renderer.render(scene, camera); return renderer.domElement.toDataURL('image/png'); }, camera, controls, scene, renderer, dispose: () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); renderer.dispose(); renderer.domElement.remove(); } };
}
export const DEFAULT_KITS = {
  main:     { id: 'main',     name: 'VLX Main (Silver)', kind: 'jersey', primary: '#cfd4dc', secondary: '#0d0e12', side: '#0d0e12', accent: '#0d0e12', trim: '#f4f6fa', ink: '#11141b', collar: '#0d0e12', pattern: 'smoke', patternColor: '#e3e7ee', metalTrim: true, number: 7, playerName: 'PLAYER', sponsor: 'VALIOUX' },
  pro:      { id: 'pro',      name: 'Fortnite Pro (Black/Blue)', kind: 'jersey', primary: '#0b0c10', secondary: '#12151d', side: '#1c4fd8', accent: '#2f6bff', trim: '#e4eaf2', collar: '#2f6bff', pattern: 'smoke', patternColor: '#1b1f2a', metalTrim: true, number: 7, playerName: 'PLAYER', sponsor: 'VALIOUX' },
  academy:  { id: 'academy',  name: 'Academy (Steel/Sky)', kind: 'jersey', primary: '#aab6c6', secondary: '#7b8aa0', side: '#16181d', accent: '#5fb4ff', trim: '#ffffff', ink: '#14171d', collar: '#5fb4ff', pattern: 'stripes', metalTrim: false, number: 17, playerName: 'TALENT', sponsor: 'ACADEMY' },
  creator:  { id: 'creator',  name: 'Creator (Black/Gold)', kind: 'jersey', primary: '#0a0a0c', secondary: '#15151a', side: '#15151a', accent: '#d9a636', trim: '#f2c14e', collar: '#d9a636', pattern: 'smoke', patternColor: '#202026', metalTrim: true, number: 1, playerName: 'CREATOR', sponsor: 'VALIOUX' },
};

export const _test = (cv, box, kit, pass) => drawJerseyFront(cv, box, kit, pass);

// ---------------------------------------------------------------- Viewer mit Bedienung (Ansichten, Auto-Rotation)
const LABELS = { front: 'Front', back: 'Back', left: 'Left', right: 'Right', top: 'Top', bottom: 'Bottom' };
let cssDone = false;
function injectCss() { if (cssDone) return; cssDone = true; const st = document.createElement('style'); st.textContent = `.k3d{position:relative;width:100%;height:100%;min-height:320px;overflow:hidden;background:radial-gradient(70% 60% at 50% 42%,rgba(255,255,255,.16),transparent 70%),linear-gradient(180deg,#14161c,#07080b)}
.k3d .stage{position:absolute;inset:0}.k3d .bar{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);display:flex;gap:6px;flex-wrap:wrap;justify-content:center;max-width:94%;z-index:2}
.k3d .bar button{background:rgba(20,22,28,.78);color:#fff;border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(8px);border-radius:999px;padding:7px 13px;font:700 11px Inter,system-ui,sans-serif;letter-spacing:.07em;text-transform:uppercase;cursor:pointer}
.k3d .bar button:hover,.k3d .bar button.on{background:#fff;color:#0b0b0d}.k3d .hint{position:absolute;top:12px;left:14px;font:600 11px Inter,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.55);z-index:2;display:flex;gap:8px;align-items:center}
.k3d .load{position:absolute;inset:0;display:grid;place-content:center;color:rgba(255,255,255,.6);font:600 12px Inter,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase}`; document.head.append(st); }
export async function mountViewer(el, kit, opts = {}) {
  injectCss(); el.classList.add('k3d'); el.replaceChildren(); const stage = document.createElement('div'); stage.className = 'stage'; const load = document.createElement('div'); load.className = 'load'; load.textContent = opts.loadingText || 'Loading 3D …'; el.append(stage, load);
  let v; try { v = await mountKit(stage, kit, opts); } catch (e) { console.error(e); load.textContent = opts.errorText || '3D preview is not available on this device.'; return null; }
  load.remove(); const bar = document.createElement('div'); bar.className = 'bar'; const labels = { ...LABELS, ...(opts.labels || {}) };
  Object.keys(VIEWS).forEach(k => { const b = document.createElement('button'); b.textContent = labels[k]; b.onclick = () => { v.view(k); [...bar.children].forEach(x => x.classList.remove('on')); b.classList.add('on'); auto.classList.remove('on'); }; bar.append(b); });
  const auto = document.createElement('button'); auto.textContent = labels.spin || '360° spin'; auto.className = v.isAuto() ? 'on' : ''; auto.onclick = () => { const on = !v.isAuto(); v.setAuto(on); auto.classList.toggle('on', on); [...bar.children].forEach(x => x !== auto && x.classList.remove('on')); }; bar.append(auto);
  const hint = document.createElement('div'); hint.className = 'hint'; hint.textContent = labels.drag || 'Drag to rotate · scroll to zoom'; el.append(hint, bar);
  el.addEventListener('pointerdown', () => { auto.classList.remove('on'); }, true); return { ...v, kit };
}
