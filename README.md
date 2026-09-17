# Buchungs- & Erinnerungs-Demo

Demo-Web-App für ein Online-Buchungs- und Erinnerungstool für lokale
Dienstleistungsbetriebe (Kosmetikstudios, Friseure, Massagepraxen,
Fußpflege, Personal Trainer, Fahrschulen etc.). Gedacht als anpassbare
Verkaufs-Demo pro potenziellem Kunden.

## Für jeden neuen Kunden: nur `src/config.js` anpassen

Alle betriebsspezifischen Daten stehen zentral in **`src/config.js`**:
Firmenname, Branche, Inhaber, Primärfarbe, Adresse, Kontaktdaten und die
Liste der Dienstleistungen (Name, Dauer, Preis). Der komplette Rest der
App (Buchungsseite, Erinnerungs-Simulation, Dashboard, Farben) liest
ausschließlich aus diesem Objekt — es muss an keiner anderen Stelle im
Code etwas geändert werden.

```js
const config = {
  businessName: "ForYou cosmetics",
  businessType: "Kosmetikstudio",
  ownerName: "Nahida",
  primaryColor: "#D4A574",
  services: [
    { id: "s1", name: "Gesichtsbehandlung", duration: "60 min", durationMinutes: 60, price: "55€" },
  ],
  address: "Hauptstraße 12, 40789 Monheim am Rhein",
  // ... weitere Felder siehe src/config.js
};
```

Um eine neue Demo-Variante zu erzeugen, reicht es, Claude die neuen Werte
zu nennen ("erstell mir eine Version mit diesen Werten: ...") — die
Kernlogik bleibt unverändert.

## Funktionen

- **Öffentliche Buchungsseite** (`/`): Leistungen aus der Config, Kalender-
  /Zeitslot-Auswahl, Buchungsformular, Bestätigungsseite mit
  WhatsApp-Vorschau.
- **Simulierte automatisierte Erinnerungen**: Bestätigung direkt nach
  Buchung sowie ein 24h-Erinnerungs-Log, beides als
  WhatsApp-Nachrichtenvorschau.
- **Inhaber-Dashboard** (`/dashboard`): Terminübersicht, Statistik-Kacheln
  (z. B. "vermiedene No-Shows", "geretteter Umsatz"), manuelles Anlegen
  von Terminen, Erinnerungs-Protokoll.

Alle Daten sind rein clientseitig in-memory simuliert (React Context),
es gibt kein Backend.

## Entwicklung

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
