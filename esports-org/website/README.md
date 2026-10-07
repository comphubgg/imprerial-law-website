# Website + Admin-Panel

Start (Node ≥ 18, keine Installation nötig):
```
cd esports-org/website
ADMIN_PASSWORD="dein-starkes-passwort" node server.js
```
- Seite: http://localhost:3000 · Admin: http://localhost:3000/admin/
- Ohne `ADMIN_PASSWORD` erzeugt der Server ein temporäres Passwort und zeigt es im Terminal.
- Inhalte liegen in `data/db.json` (wird beim ersten Start aus `data/seed.json` erzeugt). **Backup:** im Admin-Panel unter „Backup".

## Im Admin-Panel änderbar
Organisation (Name, Slogan, Beschreibung, Logo, Farbwelt/Saison-Theme, Socials, Twitch-Kanal, Kontakt, Shop-Link, Bereiche an/aus) · Spiele (hinzufügen/löschen) · Teams (Pro/Academy/Talent) · Spieler inkl. Foto und allen Socials · Creators · Shows · News · Matches · Partner.
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
