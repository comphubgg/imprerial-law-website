# Stream-Paket (Overlays, Szenen, Videos)

Zwei Wege, je nachdem womit du streamst.

## A) Browser-Quelle (OBS, Streamlabs, Twitch Studio am PC) – empfohlen
Die Overlays sind Webseiten, die sich selbst aktualisieren: Logo, Name, Hashtag, Socials, Sponsoren und Farbwelt kommen aus deiner Website (Admin-Panel). Änderst du dort etwas, ändert sich das Overlay von selbst.

In OBS: **Quelle hinzufügen → Browser** → URL einsetzen, Breite **1920**, Höhe **1080**.
Ersetze `https://deine-domain` durch deine Website-Adresse (lokal: `http://localhost:3000`).

| Szene | URL |
|---|---|
| Starting Soon (mit Countdown) | `/overlay/starting-soon.html?minutes=10` |
| Starting Soon (ohne Countdown) | `/overlay/starting-soon.html` |
| Be Right Back | `/overlay/brb.html` |
| Ending | `/overlay/ending.html?next=Tomorrow%207%20PM` |
| Offline | `/overlay/offline.html` |
| **Spiel-Overlay** (transparent: Logo, Kamerarahmen, Chat-Fläche, Ticker) | `/overlay/game.html?nick=DEINNAME` |
| Nur Ticker (kleine Leiste mit Follow, Partner, Discord, Hashtag) | `/overlay/ticker.html` |
| Nur Kamerarahmen | `/overlay/cam-frame.html?x=40&y=640&w=520` |
| Follower-Ziel | `/overlay/follow-goal.html?current=47&goal=100&label=Follower%20goal` |
| Alert-Test (Follow, Sub, Raid) | `/overlay/alert.html?type=follow&user=NAME` |

Tipps: Spiel-Overlay über die Spielaufnahme legen, Kamera in den Rahmen schieben, Chat-Dock in die Chat-Fläche. Parameter `chat=0` blendet die Chat-Fläche aus, `theme=winter` (oder `weihnachten`, `gold`, `pride`) wechselt die Farbwelt nur für diese Quelle.
Echte Follow-/Sub-Alerts kommen von Streamlabs oder StreamElements; `alert.html` ist die Vorlage für das Aussehen.

## Einzel-Widgets (jedes Teil für sich)
Alles ist auch **einzeln** verfügbar, mit eigener Größe, Farbe und Stil. Übersicht zum Auswählen und Kopieren: `/overlay/index.html` (am Handy nutzbar, die Quelle selbst setzt du am PC/in der Streaming-App ein).

URL-Schema: `/overlay/widgets/NAME.html?color=blue&style=2&width=800&height=200`
- `color`: `platin`, `blue`, `ice`, `gold`, `red`, `purple`, `pink`, `green`, `orange`, ein Hex-Wert (`%23FF8800`) oder eine Farbwelt der Website (`winter`, `weihnachten`, `pride` …)
- `style`: `1` scharf/schräg · `2` Glas/rund · `3` Neon · `4` Vollfarbe · (`5` nur bei Kamera/Chat: Tech-Rahmen)
- `width` / `height`: beliebige Größe in Pixel

| Widget | Standardgröße | Besonderheiten |
|---|---|---|
| `slider` **Slider** (mehrere Seiten) | `size=narrow` 800×100 · `medium` 800×200 · `tall` 600×300 | Logo → Socials (X, YouTube, TikTok, Twitch) → Discord → Chat-Befehl → Invite-Link → Hashtag → Aufruf. `pages=logo,socials,discord,cmd,invite,hashtag,cta,follow,partners`, `cmd=!orgdc`, `invite=discord.gg/DEINLINK`, `dur=1.2` (langsamer). Partner-Seite erscheint automatisch erst bei echten Partnern |
| `cam` Kamerarahmen | 640×360 | `ratio=16:9\|4:3\|1:1\|9:16`, `nick=NAME` (Namensschild) |
| `chat` Chat-Rahmen | 420×720 | `title=0` ohne Überschrift |
| `social-bar` Follow-Leiste | 800×200 | zeigt X, Twitch, YouTube … **nacheinander**; `only=x,twitch,tiktok`, `dur=3` (Sekunden je Eintrag) |
| `partner-bar` Partner | 800×200 | Partner/Sponsoren nacheinander |
| `discord-bar` | 800×200 | Community-Hinweis mit Discord-Link |
| `chat-cta` Chat-Aufruf | 800×200 | `lines=Drop a #VLXWIN when we win\|GG in chat` |
| `follower-goal` | 800×200 | `current=47&goal=100&label=Follower goal` |
| `info-card` | 800×200 | `lines=NEXT STREAM\|TOMORROW · 7 PM CET` |
| `hashtag` | 500×140 | dein Hashtag |
| `logo-bug` | 500×140 | Logo + Name für die Ecke |
| `nameplate` | 520×100 | `nick=NAME&tag=VLX` |
| `countdown` | 500×140 | `minutes=10` |
| `alert` | 1000×300 | `type=follow\|sub\|raid&user=NAME` |

Fertige Dateien pro Widget: `widgets/<name>/` mit transparenten PNGs (alle Stile und mehrere Farben) und für die animierten Widgets je ein Loop-Video (`*_loop_transparent.webm` und `*_greenscreen.mp4`). Neu erzeugen: `node tools/render-widgets.cjs`.

## B) Fertige Dateien (Handy-Apps, Streamlabs Mobile, Prism, Twitch Studio Mobile)
- **`scenes/`** PNG in 1920×1080. Dateien mit `_transparent` haben durchsichtigen Hintergrund (über das Spiel legen).
- **`video/`** Schleifen für Pausen-Szenen: `starting-soon_loop.mp4`, `be-right-back_loop.mp4`, `ending_loop.mp4` (je 10 Sekunden, nahtlos, 1080p/30 fps). `game-overlay_ticker_transparent.webm` ist ein Overlay-Video mit durchsichtigem Hintergrund (20 s, wechselnde Ticker-Leiste); nicht jede App kann transparentes WebM (OBS kann es). Ein MP4 kann keine Transparenz: `game-overlay_ticker_greenscreen.mp4` hat einen grünen Hintergrund (in der App „Chroma Key / Greenscreen entfernen“ einstellen, Farbe Grün `#00FF00`), `game-overlay_ticker_preview.mp4` ist nur zum Ansehen.

## Neu erzeugen (nach Logo-/Namens-/Farbwechsel)
```
cd esports-org/website
npm run dev                      # Server starten (anderes Terminal)
node tools/render-stream-pack.cjs stills     # PNGs
node tools/render-stream-pack.cjs banners    # Banner (02_SOCIAL/banners)
node tools/render-stream-pack.cjs videos     # Videos (dauert einige Minuten)
```
Benötigt `playwright-core`, Chromium und `ffmpeg`.

## Hinweise
- Das Logo in den Dateien ist noch mein Platzhalter. Lade dein Logo im Admin-Panel hoch und rendere neu.
- Sponsorenleiste und Socials zeigen Platzhalter, bis du sie im Admin-Panel einträgst (Partner und Social-Links).
- Nutze für Musik in Streams nur lizenzfreie Tracks (sonst droht Stummschaltung/Sperre).
