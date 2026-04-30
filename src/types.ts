export interface WheelOption {
  id: string;
  label: string;
  color: string;
  weight: number; // 0.1–10, supports decimals
}

export interface WheelSettings {
  title: string;
  subtitle: string;
  options: WheelOption[];
  bgColor: string;
  colorPatternIndex: number;
}

export interface SpinOutcomeOverrideConfig {
  enabled: boolean;
  optionIndex: number;
}
