# Discord-Server aus der Vorlage bauen

`../server-blueprint.json` beschreibt den ganzen Server (Rollen, Kategorien, Kanäle, Rechte, Willkommens- und Regeltexte). Der Setup-Bot liest diese Datei und baut alles auf.

## 1. Plan ansehen (kein Token nötig)
```
cd 03_DISCORD/setup-bot
node setup.js --dry-run
```
Der Plan zeigt alle Rollen, Kategorien, Kanäle und prüft die Datei auf Fehler (unbekannte Rollen, falsche Kanalnamen).

## 2. Bot anlegen
1. https://discord.com/developers/applications → *New Application* → Tab **Bot** → *Reset Token* (Token kopieren, geheim halten).
2. Tab **OAuth2 → URL Generator**: Scope `bot`, Berechtigung `Administrator` (nur für das Setup) → Link öffnen, Bot auf deinen leeren/neuen Server einladen.
3. Server-ID: In Discord *Entwicklermodus* aktivieren → Rechtsklick auf den Server → *Server-ID kopieren*.

## 3. Bauen
```
npm install
DISCORD_TOKEN=dein_token GUILD_ID=deine_server_id node setup.js
```
Das Skript ist wiederholbar: Was es schon gibt (gleicher Name), überspringt es. Danach kannst du dem Bot die Administrator-Rechte wieder entziehen oder ihn entfernen.

**Wichtig:** Das Skript wurde ohne echten Discord-Server getestet (nur der Trockenlauf). Teste es zuerst auf einem leeren Probe-Server.

## 4. Wissen für einen Bot
`node generate-bot-context.js` erzeugt `../bot-wissen.md`: Rollen, Kanäle, Regeln und Ton als Text. Das kannst du einem KI-Bot (z. B. als Systemprompt oder Wissensdatei) geben, damit er den Server versteht.

## Was das Skript nicht kann
- Reaction-Roles, Ticket-Panels, AutoMod und Live-Alerts brauchen eigene Bots (siehe `bots` im Blueprint).
- Server-Name, Icon und Banner stellst du in den Servereinstellungen ein (Bilder aus `02_SOCIAL/banners`).
