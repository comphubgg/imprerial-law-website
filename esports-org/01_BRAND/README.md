# Marke: Logo-Dateien

**Basis-Logo (2D, einfach):** `logo-main.png` (weiß, transparent, zugeschnitten). Das ist das Logo, das überall steht: Website, Dokumente, Overlays, Banner.
Für helle Hintergründe: `logos/VLX_logo_black_transparent.png` (schwarz, transparent).

## Leuchtende Varianten (quadratisch, für Avatare, Hero und Saison-Aktionen)
| Datei | Farbe | Einsatz |
|---|---|---|
| `logos/VLX_glow_silver.png` | Silber | Hauptprofilbild (Platin) |
| `logos/VLX_glow_silver_bw.png` | Schwarz-Weiß | Alternative / Merch-Druck |
| `logos/VLX_glow_ice.png` | Eisweiß-Blau | Winter |
| `logos/VLX_glow_blue.png` | Blau | Frühling / Pride-Aktionen |
| `logos/VLX_glow_cyan.png` | Cyan | Frühling |
| `logos/VLX_glow_red.png` | Rot | Weihnachten |
| `logos/VLX_glow_gold.png`, `VLX_glow_orange.png` | Gold, Orange | Premium / Jubiläum |
| `logos/VLX_banner_ice.png` | Eis, breit | Banner (X, Twitch, YouTube, LinkedIn, Facebook) |

Die Website wechselt die Farbwelt im Admin-Panel; das passende Art-Bild für die Farbwelt (Avatar, Link-Seite) trägst du dort unter „Organisation“ ein. Das Basis-Logo bleibt gleich.

## Regeln
- Das Basis-Logo nie verzerren, nur skalieren; Mindestabstand ringsum: Höhe des Buchstabens „L“.
- Auf dunklem Hintergrund das weiße Logo, auf hellem das schwarze.
- Leuchtende Varianten nur auf dunklem Grund und nicht kleiner als 200 px.
- Neue Version des Logos: Datei ersetzen und die Pakete neu erzeugen (`website/tools/*.cjs`, `05_DOCS/generate_docs.py`, `06_EXCEL/generate_excel.py`).
