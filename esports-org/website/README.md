# Website + Admin-Panel

**Lokal starten (Entwicklung):**
```
cd esports-org/website
npm run dev
```
Dann im Browser: http://localhost:3000 (Seite) und http://localhost:3000/admin/ (Passwort lokal: `admin`). Anderer Port: `PORT=4000 npm run dev`. Änderungen am Server starten ihn automatisch neu. Es ist keine Installation nötig (`npm install` wird nicht gebraucht), nur Node ≥ 18.

Start (Node ≥ 18, keine Installation nötig):
```
cd esports-org/website
ADMIN_PASSWORD="dein-starkes-passwort" node server.js
```
- Seite: http://localhost:3000 · Admin: http://localhost:3000/admin/
- Ohne `ADMIN_PASSWORD` erzeugt der Server ein temporäres Passwort und zeigt es im Terminal.
- Inhalte liegen in `data/db.json` (wird beim ersten Start aus `data/seed.json` erzeugt). **Backup:** im Admin-Panel unter „Backup".

## Aufbau der Seite (Struktur wie bei großen Orgs)
Promo-Leiste · Header mit Shop-/Teams-Dropdown, Suche, Sprachumschalter · Hero-Slider · Partner-Laufband · „From the shop" · „Next up" + „Results" · Team-Karten · Latest News · Newsletter · Footer. Unterseiten: /teams, /team/<slug> (Roster + Achievements + Results), /creators, /news, /news/<id>, /shop, /about, /partners, /page/<slug> (Legal).

## Im Admin-Panel änderbar
Organisation (Name, Slogan, Logo, Farbwelt, Promo-Leiste, Menü-Links, Hashtag, Socials) · Hero-Slider · Shop-Produkte · Teams · Spieler (Foto, Name, Land, Socials) · Achievements · Matches (kommend = Next up, beendet = Results) · Creators · News · Partner · Shows · Seiten (About, Legal) · Spiele · Newsletter-Liste (CSV-Export) · Backup. Texte sind englisch, pro Feld optional übersetzbar (DE/ES/FR/IT/PT).
Löschen eines Spiels entfernt dessen Teams und Matches (mit Warnung). Spieler bleiben ohne Team erhalten.

## Live-Anzeige auf Twitch
- Hauptkanal im Admin-Panel eintragen → Player erscheint im Hero.
- Für echte Live-Erkennung der Creators (LIVE-Badge, Zuschauerzahl): `TWITCH_CLIENT_ID` und `TWITCH_CLIENT_SECRET` setzen (kostenlose Twitch-Developer-App).

## Farbwelten
In `public/themes.js` (Platin, Winter, Weihnachten, Gold, Frühling, Pride). Neues Theme = ein Eintrag.

## Hosting
Läuft auf jedem Node-Host (z. B. Render, Railway, Fly.io, VPS). Persistenten Speicher für `data/` und `uploads/` einrichten. Hinter HTTPS betreiben (Cookie-Flag `Secure` dann in `server.js` ergänzen).

## Sicherheit
Passwort-Login mit Rate-Limit, HttpOnly-Cookie, Upload nur PNG/JPG/WEBP/GIF (kein SVG), Ausgabe ohne HTML-Injection. Vor Livegang: starkes Passwort, HTTPS, Impressum/Datenschutz in `public/legal.html` ausfüllen.
