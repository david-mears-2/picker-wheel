import { getReadableTextColor } from "../lib/colors";

interface ResultDisplayProps {
  label: string;
  color: string;
  onDismiss: () => void;
}

export function ResultDisplay({ label, color, onDismiss }: ResultDisplayProps) {
  const textColor = getReadableTextColor(color);

  return (
    <div
      className="result-display"
      role="status"
      aria-live="polite"
      aria-label={`Result: ${label}`}
      onClick={onDismiss}
    >
      <div
        className="result-display-label"
        style={{ backgroundColor: color, color: textColor }}
      >
        {label}
      </div>
    </div>
  );
}
