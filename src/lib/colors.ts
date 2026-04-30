export const COLOR_PATTERNS: string[][] = [
  // Vibrant
  ["#e76f51", "#f4a261", "#e9c46a", "#2a9d8f", "#264653", "#e63946", "#457b9d", "#a8dadc"],
  // Pastel
  ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff", "#a0c4ff", "#bdb2ff", "#ffc6ff"],
  // Bold
  ["#f72585", "#7209b7", "#3a0ca3", "#4361ee", "#4cc9f0", "#06d6a0", "#ffd166", "#ef476f"],
  // Earth
  ["#606c38", "#283618", "#fefae0", "#dda15e", "#bc6c25", "#9b2226", "#ae2012", "#bb3e03"],
  // Ocean
  ["#03045e", "#0077b6", "#00b4d8", "#90e0ef", "#caf0f8", "#48cae4", "#023e8a", "#0096c7"],
];

const LIGHT_TEXT_COLOR = "#ffffff";
const DARK_TEXT_COLOR = "#111111";
const MIN_TEXT_CONTRAST = 4.5;

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

function parseHexColor(hex: string): RgbColor | null {
  const normalized = hex.trim().toLowerCase();
  const match = normalized.match(/^#([0-9a-f]{6})$/i);
  if (!match) return null;

  const [r, g, b] = [0, 2, 4].map((offset) =>
    Number.parseInt(match[1].slice(offset, offset + 2), 16)
  );

  return { r, g, b };
}

function toLinearChannel(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

function getRelativeLuminance(color: RgbColor): number {
  return (
    0.2126 * toLinearChannel(color.r) +
    0.7152 * toLinearChannel(color.g) +
    0.0722 * toLinearChannel(color.b)
  );
}

function hslToHex(hue: number, saturation: number, lightness: number): string {
  const h = hue / 360;
  const s = saturation / 100;
  const l = lightness / 100;

  const hueToRgb = (p: number, q: number, t: number): number => {
    let wrapped = t;
    if (wrapped < 0) wrapped += 1;
    if (wrapped > 1) wrapped -= 1;
    if (wrapped < 1 / 6) return p + (q - p) * 6 * wrapped;
    if (wrapped < 1 / 2) return q;
    if (wrapped < 2 / 3) return p + (q - p) * (2 / 3 - wrapped) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = Math.round(hueToRgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hueToRgb(p, q, h) * 255);
  const b = Math.round(hueToRgb(p, q, h - 1 / 3) * 255);

  return `#${[r, g, b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

export function getContrastRatio(colorA: string, colorB: string): number {
  const first = parseHexColor(colorA);
  const second = parseHexColor(colorB);
  if (!first || !second) return 1;

  const lighter = Math.max(
    getRelativeLuminance(first),
    getRelativeLuminance(second)
  );
  const darker = Math.min(
    getRelativeLuminance(first),
    getRelativeLuminance(second)
  );

  return (lighter + 0.05) / (darker + 0.05);
}

export function getReadableTextColor(backgroundColor: string): string {
  const lightContrast = getContrastRatio(backgroundColor, LIGHT_TEXT_COLOR);
  const darkContrast = getContrastRatio(backgroundColor, DARK_TEXT_COLOR);

  if (darkContrast >= lightContrast) {
    return DARK_TEXT_COLOR;
  }

  return LIGHT_TEXT_COLOR;
}

function getColorDistance(colorA: string, colorB: string): number {
  const first = parseHexColor(colorA);
  const second = parseHexColor(colorB);
  if (!first || !second) return 0;

  return Math.sqrt(
    Math.pow(first.r - second.r, 2) +
    Math.pow(first.g - second.g, 2) +
    Math.pow(first.b - second.b, 2)
  );
}

function generateRandomColor(random: () => number): string {
  return hslToHex(
    random() * 360,
    55 + random() * 30,
    28 + random() * 44
  );
}

export function getRandomOptionColor(
  existingColors: string[],
  random: () => number = Math.random
): string {
  const fallbackCandidates = COLOR_PATTERNS.flat();
  let bestCandidate = fallbackCandidates[0];
  let bestScore = Number.NEGATIVE_INFINITY;

  const scoreCandidate = (candidate: string) => {
    const textColor = getReadableTextColor(candidate);
    const contrast = getContrastRatio(candidate, textColor);
    if (contrast < MIN_TEXT_CONTRAST) {
      return;
    }

    const minDistance = existingColors.length === 0
      ? 0
      : Math.min(...existingColors.map((existing) => getColorDistance(candidate, existing)));
    const score = minDistance + contrast * 20;

    if (score > bestScore) {
      bestScore = score;
      bestCandidate = candidate;
    }
  };

  for (let i = 0; i < 36; i++) {
    scoreCandidate(generateRandomColor(random));
  }

  for (const fallbackCandidate of fallbackCandidates) {
    scoreCandidate(fallbackCandidate);
  }

  return bestCandidate;
}

export function getOptionColor(patternIndex: number, optionIndex: number): string {
  const pattern = COLOR_PATTERNS[patternIndex] ?? COLOR_PATTERNS[0];
  return pattern[optionIndex % pattern.length];
}
