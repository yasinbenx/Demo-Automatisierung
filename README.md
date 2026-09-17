# Buchungs- & Erinnerungs-Demo

Demo-Web-App für ein Online-Buchungs- und Erinnerungstool für lokale
Dienstleistungsbetriebe (Kosmetikstudios, Friseure, Massagepraxen,
Fußpflege, Personal Trainer, Fahrschulen etc.). Die Vorlage verwendet
bewusst neutrale Platzhalter ("Ihr Unternehmen", "Ihr Name") statt eines
erfundenen Firmennamens, damit sie sich als allgemeine Verkaufs-Demo für
unterschiedliche potenzielle Kunden zeigen lässt, ohne wie für einen
anderen Betrieb gebaut zu wirken.

## Für jeden neuen Kunden: nur `src/config.js` anpassen

Alle betriebsspezifischen Daten stehen zentral in **`src/config.js`**:
Firmenname, Branche, Inhaber, Primärfarbe, Adresse, Kontaktdaten und die
Liste der Dienstleistungen (Name, Dauer, Preis). Der komplette Rest der
App (Buchungsseite, Erinnerungs-Simulation, Dashboard, Farben) liest
ausschließlich aus diesem Objekt — es muss an keiner anderen Stelle im
Code etwas geändert werden.

```js
const config = {
  businessName: "Ihr Unternehmen",
  businessType: "Kosmetikstudio / Friseur / Praxis",
  ownerName: "Ihr Name",
  primaryColor: "#D4A574",
  services: [
    { id: "s1", name: "Behandlung 1", duration: "60 min", durationMinutes: 60, price: "XX€" },
  ],
  address: "Musterstraße 1, 12345 Musterstadt",
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
