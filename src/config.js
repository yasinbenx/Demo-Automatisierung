// =========================================================================
// ZENTRALE KONFIGURATION — für jeden neuen Kunden NUR diese Datei anpassen.
// Alles andere (Buchungsseite, Erinnerungen, Dashboard) liest ausschließlich
// aus diesem Objekt und passt sich automatisch an.
// =========================================================================

const config = {
  // --- Unternehmen ---------------------------------------------------
  businessName: "ForYou cosmetics",
  businessType: "Kosmetikstudio",
  ownerName: "Nahida",
  tagline: "Deine Beauty-Auszeit in Monheim am Rhein",
  address: "Hauptstraße 12, 40789 Monheim am Rhein",
  phone: "+49 176 12345678",
  email: "info@foryou-cosmetics.de",

  // --- Design ----------------------------------------------------------
  // primaryColor bestimmt Buttons, Header, Akzente in der ganzen App.
  primaryColor: "#D4A574",
  // Optional: dunklerer Farbton für Hover/Kontraste. Wird automatisch
  // berechnet, falls nicht gesetzt (siehe utils/color.js).
  secondaryColor: "#8C6D46",
  // Logo als Emoji oder Initialen-Fallback, wenn kein Bild vorhanden ist.
  logoEmoji: "💆‍♀️",

  // --- Dienstleistungen --------------------------------------------------
  services: [
    { id: "s1", name: "Gesichtsbehandlung", duration: "60 min", durationMinutes: 60, price: "55€" },
    { id: "s2", name: "Permanent Make-up", duration: "90 min", durationMinutes: 90, price: "120€" },
    { id: "s3", name: "Wimpernverlängerung", duration: "45 min", durationMinutes: 45, price: "65€" },
    { id: "s4", name: "Maniküre & Pediküre", duration: "50 min", durationMinutes: 50, price: "45€" },
  ],

  // --- Öffnungszeiten / Slot-Generierung --------------------------------
  openingHours: {
    startHour: 9,
    endHour: 18,
    slotIntervalMinutes: 60,
    // Wochentage, an denen gebucht werden kann (0 = Sonntag ... 6 = Samstag)
    openDays: [1, 2, 3, 4, 5, 6],
  },

  // --- Erinnerungs-Texte (Platzhalter werden ersetzt) -------------------
  messages: {
    confirmation:
      "Hallo {customerName}! Dein Termin für {serviceName} am {date} um {time} Uhr bei {businessName} ist bestätigt. Wir freuen uns auf dich! 💖",
    reminder24h:
      "Hi {customerName} 👋 Kurze Erinnerung: Morgen um {time} Uhr hast du deinen Termin für {serviceName} bei {businessName}. Bis bald!",
  },

  // --- Demo-Statistiken für das Dashboard --------------------------------
  stats: {
    noShowsPrevented: 14,
    revenueSaved: "1.240€",
    remindersSent: 87,
  },
};

export default config;
