# Social-Media-Namen & Accounts

> Ich kann nicht prüfen, ob ein Handle frei ist (die Plattformen erlauben mir keine Abfrage). Prüfe die Namen selbst, am schnellsten mit **namechk.com** oder direkt beim Anlegen.

## Handle-Strategie
Ein Name auf **allen** Plattformen, am selben Tag gesichert. Reihenfolge der Wünsche (Arbeitsname VALIOUX, Kürzel VLX):

| Priorität | Handle | Hinweis |
|---|---|---|
| 1 | `valioux` | Hauptmarke, wenn frei |
| 2 | `valiouxgg` | klassisch für Esports |
| 3 | `vlxgg` | kurz, gut für X (15-Zeichen-Grenze) |
| 4 | `teamvlx` | Fallback |
| 5 | `vlxwin` | Hashtag-Name, als Zweitaccount/Schutz |

Regeln: keine Unterstriche, keine Zahlen, nur Kleinbuchstaben; gleiche Schreibweise überall. Anzeigename: **VALIOUX** (X, Twitch, YouTube), Instagram/TikTok: **VALIOUX | VLX**.
Zeichenlimits: X 15 · Twitch 25 · Instagram 30 · TikTok 24 · YouTube-Handle 30.

## Reihenfolge beim Anlegen
1. **Gemeinsame E-Mail** anlegen (z. B. `social@deine-domain`), nicht deine private.
2. Passwortmanager + **2-Faktor-Authentifizierung** für jeden Account; Wiederherstellungscodes sichern.
3. Accounts anlegen: X → Twitch → YouTube → Instagram → TikTok → Discord → (LinkedIn, Facebook optional).
4. Bio, Banner, Avatar eintragen (Dateien unten), Link-in-Bio setzen.
5. Alle Zugänge in einer Liste für die Gesellschafter dokumentieren (nicht in Chats).

## Welche Datei wohin (alle in `02_SOCIAL/banners/`)
| Plattform | Avatar | Banner / Bild | Größe |
|---|---|---|---|
| X | `x-avatar.png` | `x-header.png` | 400² · 1500×500 |
| Twitch | `x-avatar.png` | `twitch-banner.png`, `twitch-offline.png`, Panels `twitch-panel-*.png` | 1200×480 · 1920×1080 · 640 breit |
| YouTube | `x-avatar.png` | `youtube.png` | 2560×1440 (Safe-Area Mitte) |
| Discord | `discord-icon.png` | `discord-banner.png` | 512² · 960×540 |
| LinkedIn | `x-avatar.png` | `linkedin.png` | 1584×396 |
| Facebook | `x-avatar.png` | `facebook.png` | 820×312 |
| Beiträge | | `matchday.png`, `result.png`, `reveal.png`, `sponsor.png` | 1080×1350 / 1080² |

Die Dateien sind aus Vorlagen erzeugt (`website/public/overlay/banner.html`). Wenn Logo, Name oder Farbwelt feststehen, erzeugst du sie mit einem Befehl neu: `node tools/render-stream-pack.cjs banners`.

## Link-in-Bio
Die Website hat eine fertige Seite **/links** (alle Socials, Shop, Teams, News, Sprachumschalter). Trage `https://deine-domain/links` überall als Link ein. Die Socials füllst du im Admin-Panel unter „Organisation".

## Vorlagen für Beiträge anpassen (ohne Programm)
Im Browser öffnen und die Texte in der Adresse ändern, z. B.:
- Matchday: `/overlay/banner.html?type=matchday&opp=TEAM%20X&event=FNCS%20Cup&date=SAT%2014%20OCT&time=18:00%20CET`
- Ergebnis: `/overlay/banner.html?type=result&a=2&b=1&opp=TEAM%20X&event=FNCS%20Final`
- Neuer Spieler: `/overlay/banner.html?type=reveal&name=PLAYERONE&role=IGL&country=DE&photo=https://…/bild.png`
- Partner: `/overlay/banner.html?type=sponsor&partner=MARKE`
Dann Screenshot machen (am Handy: Bildschirmfoto) oder im Entwickler-Werkzeug exportieren.
