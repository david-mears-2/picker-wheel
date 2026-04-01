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

export function getOptionColor(patternIndex: number, optionIndex: number): string {
  const pattern = COLOR_PATTERNS[patternIndex] ?? COLOR_PATTERNS[0];
  return pattern[optionIndex % pattern.length];
}
