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
