import { useState } from "react";
import type { WheelOption } from "../types";
import { OptionItem } from "./OptionItem";

interface OptionListProps {
  options: WheelOption[];
  onAdd: (label: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Pick<WheelOption, "label" | "color" | "weight">>) => void;
  onReorder: (draggedId: string, targetId: string) => void;
}

export function OptionList({
  options,
  onAdd,
  onRemove,
  onUpdate,
  onReorder,
}: OptionListProps) {
  const [newLabel, setNewLabel] = useState("");
  const [draggedOptionId, setDraggedOptionId] = useState<string | null>(null);

  const handleAdd = () => {
    const trimmed = newLabel.trim();
    if (trimmed) {
      onAdd(trimmed);
      setNewLabel("");
    }
  };

  return (
    <section className="options-panel" aria-label="Wheel options">
      <h2>Options</h2>
      {options.length > 1 && (
        <p
          style={{
            margin: "-6px 0 12px",
            color: "var(--text-muted)",
            fontSize: "0.85rem",
          }}
        >
          ↕ Drag and drop to reorder
        </p>
      )}

      <div className="add-option-form">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          placeholder="Enter option name…"
          className="add-option-input"
          aria-label="New option name"
        />
        <button onClick={handleAdd} className="btn btn-primary btn-sm">
          Add
        </button>
      </div>

      <ul className="option-list" role="list">
        {options.map((opt) => (
          <OptionItem
            key={opt.id}
            option={opt}
            onUpdate={onUpdate}
            onRemove={onRemove}
            canRemove={options.length > 2}
            draggable={options.length > 1}
            isDragging={draggedOptionId === opt.id}
            onDragStart={() => {
              setDraggedOptionId(opt.id);
            }}
            onDragEnd={() => {
              setDraggedOptionId(null);
            }}
            onDragOver={(event) => {
              event.preventDefault();
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (draggedOptionId && draggedOptionId !== opt.id) {
                onReorder(draggedOptionId, opt.id);
              }
              setDraggedOptionId(null);
            }}
          />
        ))}
      </ul>
    </section>
  );
}
