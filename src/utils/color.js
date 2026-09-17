// Kleine Helfer, um aus der primaryColor der Config abgeleitete Töne
// (heller/dunkler) zu berechnen, falls kein secondaryColor gesetzt ist.

export function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function rgbToHex(r, g, b) {
  const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function shade(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  const factor = 1 + amount;
  return rgbToHex(r * factor, g * factor, b * factor);
}

export function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
