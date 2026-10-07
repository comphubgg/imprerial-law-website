# Discord-Server-Blueprint
Reihenfolge von oben nach unten. Namen mit Emoji/Trennzeichen sind frei änderbar.

## Kategorien & Kanäle
**📌 START** — `#willkommen` (Info, Regeln-Link, nur Lesen) · `#regeln` · `#rollen` (Reaction Roles) · `#ankündigungen` (Ankündigungskanal) · `#socials` (Links/Stream-Alerts)
**💬 COMMUNITY** — `#chat` · `#clips` · `#memes` · `#fortnite-talk` · `#bot-befehle` · `#vorschläge`
**🎮 ESPORTS** — `#matches-ergebnisse` · `#turnier-news` · `#vlx-pro` · `#vlx-academy` · `#scrim-suche`
**🎥 CONTENT** — `#live-benachrichtigungen` · `#creator-hub` · `#show-vlx-weekly` · `#fan-art`
**🎫 SUPPORT** — `#ticket-erstellen` (Bewerbung, Partnerschaft, Support) · `#bewerbung-info`
**🔊 VOICE** — `Lobby` · `Duo 1/2/3` · `Squad 1/2` · `Watch-Party` · `AFK`
**🔒 TEAM (privat)** — `#management` · `#pro-intern` · `#academy-intern` · `#staff` · `#content-planung` · `#sponsoren-intern` · `#finanzen` (nur Owner/Management) · `#mod-log` · `#bot-log` · Voice: `Pro Scrim` · `Coaching` · `Meeting`

## Rollen (von oben nach unten) & Rechte
| Rolle | Rechte |
|---|---|
| Owner | Administrator |
| Management | Rollen/Kanäle verwalten, Mitglieder kicken/bannen, Team-Kanäle |
| Head Coach / Coach | Team-Kanäle, Mitglieder stummschalten, Voice verschieben |
| Pro Player | Pro-Kanäle, Priority Speaker |
| Academy | Academy-Kanäle |
| Creator | `#creator-hub`, Ankündigungen erwähnen (@here), Embed/Links |
| Staff / Social / Editor | Content-Kanäle verwalten |
| Moderator | Timeout, Nachrichten löschen, Mod-Log |
| Partner / Sponsor | Partner-Kanal |
| Booster / Supporter | Cosmetic, Emoji-Nutzung |
| Member (nach Verifizierung) | Standardzugriff Community |
| Unverified | nur `#willkommen`, `#regeln`, `#rollen` |

Ping-Rollen (frei wählbar über Reaction Roles): `🔴 Live`, `🏆 Matchday`, `📰 News`, `🎁 Giveaways`.

## Verifizierung & Sicherheit
- Verifizierung (Button oder Captcha) → Rolle „Member". Mindest-Kontoalter [x] Tage.
- Automod: Spam, Links von Neulingen, Beleidigungen, Massen-Mentions, Invite-Links blocken.
- 2FA für alle Mod+ Rollen verpflichtend; keine `Administrator`-Rechte außer Owner.
- Server-Level: Verifizierungsstufe „Mittel/Hoch", explizite Medien scannen.

## Bots (Vorschlag)
| Zweck | Optionen |
|---|---|
| Moderation + Logs | Discord-AutoMod + Carl-bot oder MEE6/Dyno |
| Tickets | Ticket Tool oder Tickets-Bot (Panels: Bewerbung, Partnerschaft, Support) |
| Reaction Roles | Carl-bot / Reaction Roles |
| Live-Alerts (Twitch/YouTube/X) | Discord-Integration oder StreamElements/Streamcord |
| Umfragen/Giveaways | Giveaway Bot, Polls |
| Willkommensnachricht | Carl-bot/Welcome |

## Textbausteine
**#willkommen:**
```
Willkommen bei VALIOUX 🖤
Offizieller Server unserer Fortnite-Organisation. 
✅ Regeln lesen → #regeln   🎭 Rollen holen → #rollen   🎫 Bewerben → #ticket-erstellen
Website: [domain] · Twitch: [link] · X: [link]
```
**#regeln (Kurzfassung):**
```
1. Respekt – kein Rassismus, Sexismus, Mobbing, Hassrede.
2. Kein Spam, keine Fremdwerbung, keine unaufgeforderten DMs.
3. Keine Cheats, Account-Handel oder illegale Inhalte.
4. Spoiler/NSFW verboten. Nutze den richtigen Kanal.
5. Anweisungen von Moderation befolgen. Entscheidungen bei Fragen via Ticket.
6. Discord-ToS & Fortnite-Regeln gelten.
Verstöße: Verwarnung → Timeout → Kick → Bann.
```
**Ticket-Panel Bewerbung (Fragen):** Name/Alter · Epic-Name · Rolle/Modus · PR/Turnierergebnisse · Verfügbarkeit · Gameplay-Link · Warum wir?
**Ticket-Panel Partnerschaft:** Firma/Kontakt · Art der Zusammenarbeit · Zeitraum · Budget/Leistungen.

## Einrichtung (ca. 30–45 Min.)
1. Server anlegen → Community aktivieren. 2. Rollen in der Reihenfolge oben erstellen. 3. Kategorien/Kanäle + Rechte nach Tabelle. 4. Bots einladen & konfigurieren. 5. Als **Server-Vorlage** speichern (Servereinstellungen → Servervorlage) → Link zum Klonen für Test-/Backup-Server. 6. Logo/Banner/Icon hochladen (Icon 512×512, Banner 960×540).
