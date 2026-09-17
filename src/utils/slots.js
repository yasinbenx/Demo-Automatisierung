import config from "../config.js";

// Generiert die nächsten `days` Tage (ab morgen), die laut Config
// geöffnet sind, inkl. der verfügbaren Zeitslots.
export function getUpcomingDays(days = 7) {
  const result = [];
  let cursor = new Date();
  let added = 0;
  let safety = 0;

  while (added < days && safety < 30) {
    cursor.setDate(cursor.getDate() + 1);
    safety += 1;
    if (config.openingHours.openDays.includes(cursor.getDay())) {
      result.push(new Date(cursor));
      added += 1;
    }
  }
  return result;
}

export function getSlotsForDay() {
  const { startHour, endHour, slotIntervalMinutes } = config.openingHours;
  const slots = [];
  const totalMinutes = (endHour - startHour) * 60;
  for (let m = 0; m < totalMinutes; m += slotIntervalMinutes) {
    const hour = startHour + Math.floor(m / 60);
    const minute = m % 60;
    slots.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
  }
  return slots;
}

export function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}
