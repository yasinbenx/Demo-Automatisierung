// Schlichte Linien-Icons (24×24, stroke = currentColor)

const wrap = (d, size = 20) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

export const icon = {
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  today: (s) => wrap('<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.3l2.4 2.4 4.6-5"/>', s),
  week: (s) => wrap('<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/><circle cx="8.5" cy="14.5" r=".6" fill="currentColor"/><circle cx="12" cy="14.5" r=".6" fill="currentColor"/><circle cx="15.5" cy="14.5" r=".6" fill="currentColor"/>', s),
  settings: (s) => wrap('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>', s),
  // Gebet: Mondsichel
  moon: (s) => wrap('<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>', s),
  // Bewegung: Hantel
  gym: (s) => wrap('<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>', s),
  // Klar: neutraler Kreis mit Punkt
  clear: (s) => wrap('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/>', s),
  money: (s) => wrap('<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18"/><path d="M16 15h2"/>', s),
  // Reflexion: Feder
  pen: (s) => wrap('<path d="M20 4c-6 0-11 4.5-12 11l-2 5"/><path d="M8 15c3 0 6-1 8-4"/><path d="M12 9.5c2-.3 4-1.4 5.5-3"/>', s),
  leaf: (s) => wrap('<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19l7-7"/>', s),
  pause: (s) => wrap('<circle cx="12" cy="12" r="8.5"/><path d="M10 9v6M14 9v6"/>', s),
  feather: (s) => wrap('<path d="M4 20c4-1 7-3 9-6M12 4c-3 3-4 7-4 10 3 0 7-1 10-4-2-.3-3.5-1-4-2 1.5 0 3-.5 4-1.5C16 6 14 4.5 12 4z"/>', s),
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" stroke-linejoin="round"/></svg>',
  target: (s) => wrap('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".8" fill="currentColor"/>', s),
  close: (s) => wrap('<path d="M6 6l12 12M18 6L6 18"/>', s),
  refresh: (s) => wrap('<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/>', s),
  arrow: (s) => wrap('<path d="M5 12h14M13 6l6 6-6 6"/>', s),
};
