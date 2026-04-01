import { useEffect, useRef } from "react";

interface WinnerModalProps {
  label: string;
  color: string;
  onClose: () => void;
  onSpinAgain: () => void;
}

export function WinnerModal({ label, color, onClose, onSpinAgain }: WinnerModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="winner-modal"
      onClose={onClose}
      aria-label={`Winner: ${label}`}
    >
      <div className="winner-modal-content">
        <h2>🎉 Winner!</h2>
        <div
          className="winner-label"
          style={{
            background: color,
            color: "#fff",
            padding: "16px 32px",
            borderRadius: 12,
            fontSize: "1.5rem",
            fontWeight: 700,
            textShadow: "0 1px 3px rgba(0,0,0,0.3)",
            margin: "16px 0",
          }}
        >
          {label}
        </div>
        <div className="winner-actions" style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={onSpinAgain} className="btn btn-primary">
            Spin Again
          </button>
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}
