# Habit

Ein ruhiger, persönlicher Habit-Tracker als Web-App (PWA). Kein Streak-Druck:
Ein verpasster Tag setzt nichts zurück, die App zeigt stattdessen „X von 7 Tagen“.

Läuft komplett offline. Alle Daten bleiben im Browser auf deinem Gerät
(localStorage), es gibt kein Backend und keinen Account.

## Auf dem iPhone zum Home-Bildschirm hinzufügen

1. Öffne die Adresse der App (z. B. `https://dein-projekt.vercel.app`) in **Safari**.
   In Chrome oder anderen Browsern auf dem iPhone geht es nicht.
2. Tippe unten auf das **Teilen-Symbol** (Quadrat mit Pfeil nach oben).
3. Scroll runter und tippe auf **„Zum Home-Bildschirm“**.
4. Der Name „Habit“ ist schon eingetragen. Tippe oben rechts auf **„Hinzufügen“**.

Jetzt liegt Habit mit dem هـ-Icon auf dem Home-Bildschirm und öffnet sich wie eine
echte App, ohne Adressleiste. Nach dem ersten Öffnen funktioniert sie auch ohne Internet.

**Wichtig:** Die App auf dem Home-Bildschirm hat ihren eigenen Speicher, getrennt
von Safari. Was du in Safari abgehakt hast, siehst du in der Home-Bildschirm-App
nicht. Am besten benutzt du nur die App vom Home-Bildschirm.

Auf Android geht es in Chrome über das Menü (⋮) und dann **„App installieren“**
bzw. **„Zum Startbildschirm hinzufügen“**.

## Backup

Unter **Einstellungen → Daten** kannst du alles als JSON-Datei herunterladen und
später wieder einspielen. Mach das ab und zu, vor allem bevor du das Handy wechselst
oder Safari-Daten löschst. Wenn iOS lange ungenutzte Website-Daten aufräumt, ist ein
Backup die einzige Sicherung.

## Funktionen

- **Heute:** Begrüßung je nach Tageszeit, Tagesimpuls (Vers, Hadith, Dua oder Gedanke)
  mit Favoriten, Gebete einzeln abhaken, Bewegung mit Gym- und Ruhetagen, Klar-Tage
  mit Monatszahl und „Ausrutscher“, Geld-Check mit Wochensumme, Tagesreflexion (1 bis 5
  und „Was war heute gut?“)
- **Heute ist schwer:** blendet alles aus bis auf ein Mini-Ziel, dazu „Mein Warum“
  und eine Dua. Ist das Mini-Ziel abgehakt, zählt der Tag als geschafft.
- **Kurze Pause:** 10-Minuten-Timer mit Atemkreis, Vorschlag (Wasser, Liegestütze,
  rausgehen, Wudu), danach eine Dua und optional: wo, wie, wann
- **Woche:** Raster der letzten 7 Tage und „X von 7 Tagen“ pro Gewohnheit
- **Einstellungen:** Mein Warum, Mini-Ziel, Gewohnheiten ein/aus, Gym-Tage,
  Hell/Dunkel, Favoriten, Auswertung der Pausen, Backup, alles löschen

## Projektstruktur

```
index.html          App-Hülle und Tab-Leiste
manifest.json       PWA-Manifest (Name, Icons, Farben)
sw.js               Service Worker für den Offline-Betrieb
vercel.json         Header für Vercel (Service Worker, Manifest, Schriften)
css/styles.css      Design-System und alle Komponenten
css/fonts.css       lokal eingebundene Schriften
js/app.js           Screens, Aktionen, Kurze Pause, Backup
js/storage.js       Datenmodell und localStorage
js/quotes.js        Tagesimpulse und Duas
js/icons.js         Linien-Icons
fonts/              Bricolage Grotesque, Instrument Sans, Reem Kufi, Amiri (woff2)
icons/              Logo, App-Icons, Favicon
images/             Rundbogen-Muster und Landschaften für den Tagesimpuls
```

Reines HTML, CSS und JavaScript. Kein Build-Schritt, keine Abhängigkeiten.

## Lokal starten

Der Service Worker und die JavaScript-Module brauchen einen Webserver
(einfach `index.html` doppelklicken reicht nicht):

```bash
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

## Auf Vercel deployen

1. Repository auf GitHub pushen.
2. Auf [vercel.com](https://vercel.com) **„Add New → Project“** wählen und das Repository importieren.
3. Framework Preset: **Other**. Build Command und Output Directory leer lassen.
4. **Deploy**. Fertig.

Oder mit der CLI im Projektordner: `npx vercel` (danach `npx vercel --prod`).

## Änderungen veröffentlichen

Wenn du Dateien änderst, erhöhe in `sw.js` die Version (`habit-v1` → `habit-v2`).
Sonst zeigt die installierte App weiter die alten Dateien aus dem Cache.
Die neue Version lädt die App im Hintergrund, aktiv wird sie beim nächsten Öffnen.

Neue Dateien müssen außerdem in die Liste `FILES` in `sw.js`, damit sie offline
verfügbar sind.

## Eigene Fotos für den Tagesimpuls

Statt der gezeichneten Landschaften kannst du eigene Fotos nehmen (z. B. von
Unsplash). Leg sie in `images/`, trag sie in `IMPULSE_IMAGES` in `js/app.js` und in
`FILES` in `sw.js` ein und erhöhe die Version. Gut sind JPGs mit etwa 1200 px Breite
und unter 300 KB.

## Tagesimpulse bearbeiten

Alle Texte stehen in `js/quotes.js`, jeweils mit `text`, `source`, `cat`
(`Neuanfang`, `Geduld`, `Vergebung`, `Kraft`), `type` und optional `ar` für den
arabischen Text. Die deutschen Übertragungen sind sinngemäß. Jede `id` muss eindeutig
bleiben, sonst gehen gespeicherte Favoriten verloren.
