// =========================================================================
// ZENTRALE KONFIGURATION — für jeden neuen Kunden NUR diese Datei anpassen.
// Alles andere (Buchungsseite, Erinnerungen, Dashboard) liest ausschließlich
// aus diesem Objekt und passt sich automatisch an.
// =========================================================================

const config = {
  // --- Unternehmen ---------------------------------------------------
  businessName: "Ihr Unternehmen",
  businessType: "Kosmetikstudio / Friseur / Praxis",
  ownerName: "Ihr Name",
  tagline: "Online-Terminbuchung für Ihre Kundinnen und Kunden",
  address: "Musterstraße 1, 12345 Musterstadt",
  phone: "+49 123 4567890",
  email: "kontakt@ihre-domain.de",

  // --- Design ----------------------------------------------------------
  // primaryColor bestimmt Buttons, Header, Akzente in der ganzen App.
  primaryColor: "#D4A574",
  // Optional: dunklerer Farbton für Hover/Kontraste. Wird automatisch
  // berechnet, falls nicht gesetzt (siehe utils/color.js).
  secondaryColor: "#8C6D46",
  // Logo als Emoji oder Initialen-Fallback, wenn kein Bild vorhanden ist.
  logoEmoji: "📅",

  // --- Dienstleistungen --------------------------------------------------
  services: [
    { id: "s1", name: "Behandlung 1", duration: "60 min", durationMinutes: 60, price: "XX€" },
    { id: "s2", name: "Behandlung 2", duration: "90 min", durationMinutes: 90, price: "XX€" },
    { id: "s3", name: "Behandlung 3", duration: "45 min", durationMinutes: 45, price: "XX€" },
    { id: "s4", name: "Behandlung 4", duration: "30 min", durationMinutes: 30, price: "XX€" },
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
      "Hallo {customerName}! Ihr Termin für {serviceName} am {date} um {time} Uhr bei {businessName} ist bestätigt. Wir freuen uns auf Sie!",
    reminder24h:
      "Hallo {customerName} 👋 Kurze Erinnerung: Morgen um {time} Uhr haben Sie Ihren Termin für {serviceName} bei {businessName}. Bis bald!",
  },

  // --- Demo-Statistiken für das Dashboard --------------------------------
  stats: {
    noShowsPrevented: 14,
    revenueSaved: "1.240€",
    remindersSent: 87,
  },
};

export default config;
