interface SpinButtonProps {
  onClick: () => void;
  disabled: boolean;
  size: number;
}

export function SpinButton({ onClick, disabled, size }: SpinButtonProps) {
  const btnSize = size * 0.18;

  return (
    <button
      className="spin-button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Spin the wheel"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: btnSize,
        height: btnSize,
        borderRadius: "50%",
        border: "3px solid rgba(255,255,255,0.3)",
        background: disabled
          ? "linear-gradient(135deg, #666, #444)"
          : "linear-gradient(135deg, #e63946, #c1121f)",
        color: "#fff",
        fontSize: btnSize * 0.22,
        fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer",
        zIndex: 20,
        letterSpacing: "0.05em",
        boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
        transition: "transform 0.1s",
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLElement).style.transform = "translate(-50%, -50%) scale(0.95)";
        }
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translate(-50%, -50%)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translate(-50%, -50%)";
      }}
    >
      SPIN
    </button>
  );
}
