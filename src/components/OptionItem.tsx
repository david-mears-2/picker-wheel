import { useState } from "react";
import type { WheelOption } from "../types";

interface OptionItemProps {
  option: WheelOption;
  onUpdate: (id: string, updates: Partial<Pick<WheelOption, "label" | "color" | "weight">>) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
  draggable?: boolean;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragOver?: (event: React.DragEvent<HTMLLIElement>) => void;
  onDrop?: (event: React.DragEvent<HTMLLIElement>) => void;
}

export function OptionItem({
  option,
  onUpdate,
  onRemove,
  canRemove,
  draggable = false,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: OptionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(option.label);

  const handleSave = () => {
    const trimmed = editLabel.trim();
    if (trimmed) {
      onUpdate(option.id, { label: trimmed });
    }
    setIsEditing(false);
  };

  const clampWeight = (v: number) => Math.round(Math.max(0.1, Math.min(10, v)) * 10) / 10;

  return (
    <li
      className="option-item"
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{
        opacity: isDragging ? 0.55 : 1,
        cursor: draggable ? "grab" : "default",
      }}
    >
      <input
        type="color"
        value={option.color}
        onChange={(e) => onUpdate(option.id, { color: e.target.value })}
        className="option-color-input"
        aria-label={`Color for ${option.label}`}
      />

      {isEditing ? (
        <input
          className="option-label-edit"
          value={editLabel}
          onChange={(e) => setEditLabel(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") {
              setEditLabel(option.label);
              setIsEditing(false);
            }
          }}
          autoFocus
          aria-label="Edit option name"
        />
      ) : (
        <span
          className="option-label"
          onDoubleClick={() => {
            setEditLabel(option.label);
            setIsEditing(true);
          }}
          title="Double-click to edit"
        >
          {option.label}
        </span>
      )}

      <div className="option-weight">
        <button
          onClick={() => onUpdate(option.id, { weight: clampWeight(option.weight - 0.1) })}
          disabled={option.weight <= 0.1}
          aria-label={`Decrease weight for ${option.label}`}
          className="weight-btn"
        >
          −
        </button>
        <input
          type="number"
          className="weight-input"
          value={option.weight}
          min={0.1}
          max={10}
          step={0.1}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onUpdate(option.id, { weight: clampWeight(v) });
          }}
          aria-label={`Weight for ${option.label}`}
          title={`Weight: ${option.weight}`}
        />
        <button
          onClick={() => onUpdate(option.id, { weight: clampWeight(option.weight + 0.1) })}
          disabled={option.weight >= 10}
          aria-label={`Increase weight for ${option.label}`}
          className="weight-btn"
        >
          +
        </button>
      </div>

      {canRemove && (
        <button
          onClick={() => onRemove(option.id)}
          className="option-remove"
          aria-label={`Remove ${option.label}`}
          title="Remove"
        >
          ×
        </button>
      )}
    </li>
  );
}
