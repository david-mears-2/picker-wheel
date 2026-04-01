export interface WheelOption {
  id: string;
  label: string;
  color: string;
  weight: number; // 1–10
}

export interface SpinResult {
  optionId: string;
  label: string;
  timestamp: number;
}

export interface WheelSettings {
  title: string;
  options: WheelOption[];
  results: SpinResult[];
  bgColor: string;
  colorPatternIndex: number;
}
