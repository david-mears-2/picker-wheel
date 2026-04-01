import { useState } from "react";
import type { WheelOption } from "../types";
import { OptionItem } from "./OptionItem";

interface OptionListProps {
  options: WheelOption[];
  onAdd: (label: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Pick<WheelOption, "label" | "color" | "weight">>) => void;
  onShuffle: () => void;
  onSort: () => void;
}

export function OptionList({
  options,
  onAdd,
  onRemove,
  onUpdate,
  onShuffle,
  onSort,
}: OptionListProps) {
  const [newLabel, setNewLabel] = useState("");

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
          />
        ))}
      </ul>

      <div className="option-list-controls">
        <button onClick={onShuffle} className="btn btn-ghost btn-sm">
          Shuffle
        </button>
        <button onClick={onSort} className="btn btn-ghost btn-sm">
          Sort
        </button>
      </div>
    </section>
  );
}
