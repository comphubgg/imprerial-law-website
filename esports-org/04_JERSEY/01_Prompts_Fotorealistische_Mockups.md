# Fotorealistische Jersey- & Merch-Mockups (mit ChatGPT / Midjourney / Firefly)

**Warum so?** Dein Qualitätsanspruch (Falten, Licht, echtes Gewebe, "Mensch hat es an, ohne dass einer es an hat") entsteht mit einem Bildgenerator oder einem 3D-Künstler (Blender Cloth-Simulation), nicht mit Code-Modellen. Die Website nimmt die fertigen Bilder auf (Admin → Shop-Produkte → Ansichten: Vorne/Hinten/Links/Rechts/Oben/Unten) und dreht sie automatisch ("360° spin").

## So gehst du vor (für einheitliche Qualität)
1. **Gib immer Referenzbilder mit:** (a) dein Logo (PNG), (b) 1–2 Jersey-Referenzen, die du magst (FLC "Heresy", Raven/Battlewear-Jersey, BIG). Schreibe: *"Use my logo exactly as provided, do not redraw or change it."*
2. **Erst das Hauptbild** (Front) erzeugen und freigeben. Dann die anderen Ansichten **im selben Chat** erzeugen: *"Same jersey, same design, same lighting – now the BACK view."*
3. **Gleiches Format** für alle Ansichten: quadratisch 1:1, gleicher Hintergrund, gleicher Abstand.
4. **Texte prüfen:** Generatoren verschreiben sich. Namen/Nummern/Sponsoren-Platzhalter kontrollieren; bei Fehlern: *"Fix the lettering: it must read exactly 'VALIOUX'."* Notfalls Text in Photoshop/Canva nachsetzen.
5. Dateien als PNG/JPG (min. 1500 px) in den Admin hochladen.

## Master-Prompt (Basis für jeden Artikel)
```
Photorealistic e-sports apparel product photo, ghost-mannequin look (garment appears worn by an invisible person, natural 3D volume).
Real fabric: matte performance polyester with subtle mesh texture, realistic soft wrinkles and fold shadows at the arms, chest and waist, natural drape, sleeves hanging relaxed.
Soft studio lighting from the upper left, gentle contact shadows, shallow depth of field background (blurred), high-end sportswear catalog look, 8k, sharp detail on seams, stitching, print edges.
Square 1:1 composition, garment centered, plenty of margin.
Brand: VALIOUX (short mark: VLX), hashtag #VLXWIN. Use the attached logo exactly as provided.
```

## Jersey-Varianten (an den Master-Prompt anhängen)
**Pro Team (Fortnite) – Schwarz/Blau**
```
Jersey design: deep black body with a subtle dark smoke/crack graphic pattern, royal-blue raglan side panels and cuffs, thin metallic silver piping, V-neck collar in royal blue. Large chest wordmark VALIOUX in brushed-silver print, small VLX logo on the left chest, small sponsor placeholder logos (generic, blurred) on the chest and sleeves.
```
**Academy – Stahlgrau/Hellblau/Schwarz** (kein Weiß, kein Text "Academy" nötig)
```
Jersey design: steel-grey body with fine vertical pinstripe texture, sky-blue collar and cuffs, black side panels, VLX logo on the chest, small VALIOUX wordmark. No large text on the front.
```
**Creator – Schwarz/Gold**
```
Jersey design: matte black body with a subtle tone-on-tone graphic pattern, metallic gold raglan piping and cuffs, gold foil-print VALIOUX wordmark across the chest, small VLX logo, premium look like a limited edition.
```
**VLX Main – Schwarz/Silber (Organisation)**
```
Jersey design: black body with brushed chrome-silver details, silver foil-print VLX mark, thin silver piping on sleeves and collar, subtle wave texture, elegant minimal layout.
```

## Weitere Artikel (Fan-Shop)
- **Tracksuit-Jacke:** `Full-zip tracksuit jacket, black, stand collar, silver zipper, thin white-silver piping from shoulder to cuff, VLX logo on left chest, realistic folds at the elbows, sleeves hanging.`
- **Jogger:** `Matching tracksuit joggers, black, side stripe, elastic cuffs, relaxed fit, natural folds at the knees and ankles, small VLX logo on the thigh.`
- **Cap:** `Black six-panel baseball cap, embroidered silver VLX mark on the front, curved brim, realistic stitching, soft studio light.`
- **Tasche:** `Black crossbody sling bag, nylon texture, silver zipper, embroidered VLX logo, adjustable strap hanging naturally, photographed on a light grey backdrop.`
- **Fahne:** `Black rectangular fan flag with a silver VLX mark and the text VALIOUX, hanging with natural wrinkles and soft folds, studio lighting.`
- **Schal:** `Black knitted fan scarf with silver stripes and VLX woven pattern, fringed ends, draped naturally.`

## Ansichten (immer im selben Chat, danach)
- `Now the BACK view of the same jersey: name PLAYER and number 7 in the same style, same lighting.`
- `LEFT side view (profile): show the left sleeve with sleeve logo, natural folds.`
- `RIGHT side view (profile).`
- `TOP view: looking down from above at the shoulders and collar.`
- `BOTTOM view: looking up at the hem and sleeve openings.`

## Mit einem Mensch als Model (wie dein BIG-Beispiel)
Ergänze: `worn by a young adult model leaning on a white plinth in a bright minimalist studio, relaxed pose, natural skin and fabric folds, editorial fashion photography.` (Gesichter/Personen: nur KI-generierte Models verwenden, keine echten Personen nachbilden.)

## Qualitätscheck vor dem Upload
☐ Logo unverändert ☐ Schrift korrekt ☐ Alle Ansichten wirken wie dasselbe Teil ☐ Keine fremden Marken/Logos (Kappa, Logitech … entfernen) ☐ Keine unscharfen Hände/Gesichter
