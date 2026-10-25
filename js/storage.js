// Datenhaltung: alles liegt in einem einzigen localStorage-Eintrag.
// Jeder Zugriff ist in try/catch gekapselt, damit die App auch ohne
// Speicher (privater Modus, blockierte Website-Daten) funktioniert.

const KEY = 'habit.v1';

export const PRAYERS = [
  { id: 'fajr', name: 'Fajr', ar: 'الفجر' },
  { id: 'dhuhr', name: 'Dhuhr', ar: 'الظهر' },
  { id: 'asr', name: 'Asr', ar: 'العصر' },
  { id: 'maghrib', name: 'Maghrib', ar: 'المغرب' },
  { id: 'isha', name: 'Isha', ar: 'العشاء' },
];

export const HABITS = [
  { id: 'prayers', name: 'Gebete' },
  { id: 'gym', name: 'Bewegung' },
  { id: 'clear', name: 'Klar-Tage' },
  { id: 'money', name: 'Geld-Check' },
  { id: 'reflection', name: 'Tagesreflexion' },
];

export function defaultState() {
  return {
    version: 1,
    settings: {
      visible: { prayers: true, gym: true, clear: true, money: true, reflection: true, impulse: true },
      // Montag … Sonntag
      gymDays: [true, false, true, false, true, false, false],
      clearName: 'Klar-Tage',
      miniGoal: { type: 'prayer', label: '' },
      why: '',
      onboarded: false,
      theme: 'system',
      impulsePhoto: true,
    },
    days: {},
    favorites: [],
    pauses: [],
  };
}

function merge(base, extra) {
  if (!extra || typeof extra !== 'object' || Array.isArray(extra)) return extra ?? base;
  const out = { ...base };
  for (const k of Object.keys(extra)) {
    const b = base ? base[k] : undefined;
    out[k] = b && typeof b === 'object' && !Array.isArray(b) ? merge(b, extra[k]) : extra[k];
  }
  return out;
}

export function normalize(raw) {
  const d = defaultState();
  if (!raw || typeof raw !== 'object') return d;
  const s = merge(d, raw);
  if (!Array.isArray(s.settings.gymDays) || s.settings.gymDays.length !== 7) s.settings.gymDays = d.settings.gymDays;
  if (!s.days || typeof s.days !== 'object') s.days = {};
  if (!Array.isArray(s.favorites)) s.favorites = [];
  if (!Array.isArray(s.pauses)) s.pauses = [];
  return s;
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return normalize(raw ? JSON.parse(raw) : null);
  } catch {
    return defaultState();
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearAll() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nichts zu tun */
  }
}

// ---------- Datum ----------

export function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

// 0 = Montag … 6 = Sonntag
export function weekdayIndex(d) {
  return (d.getDay() + 6) % 7;
}

export function startOfWeek(d = new Date()) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return addDays(x, -weekdayIndex(x));
}

export function emptyDay() {
  return {
    prayers: {},
    gym: { done: false, note: '' },
    clear: null, // true = klar, 'slip' = Ausrutscher, null = offen
    money: { checked: false, amount: '', note: '' },
    mood: 0,
    good: '',
    hard: false,
    mini: false,
  };
}

export function getDay(state, key) {
  return normalizeDay(state.days[key]);
}

export function normalizeDay(day) {
  const e = emptyDay();
  if (!day) return e;
  return {
    ...e,
    ...day,
    prayers: { ...(day.prayers || {}) },
    gym: { ...e.gym, ...(day.gym || {}) },
    money: { ...e.money, ...(day.money || {}) },
  };
}

export function ensureDay(state, key) {
  state.days[key] = normalizeDay(state.days[key]);
  return state.days[key];
}
