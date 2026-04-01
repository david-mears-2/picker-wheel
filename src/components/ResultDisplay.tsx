interface ResultDisplayProps {
  label: string;
  color: string;
  onDismiss: () => void;
}

export function ResultDisplay({ label, color, onDismiss }: ResultDisplayProps) {
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
        style={{ backgroundColor: color }}
      >
        {label}
      </div>
    </div>
  );
}
