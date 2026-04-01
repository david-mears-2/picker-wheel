import { COLOR_PATTERNS } from "../lib/colors";

interface SettingsPanelProps {
  title: string;
  bgColor: string;
  colorPatternIndex: number;
  onTitleChange: (title: string) => void;
  onBgColorChange: (color: string) => void;
  onColorPatternChange: (index: number) => void;
}

export function SettingsPanel({
  title,
  bgColor,
  colorPatternIndex,
  onTitleChange,
  onBgColorChange,
  onColorPatternChange,
}: SettingsPanelProps) {
  return (
    <section className="settings-panel" aria-label="Settings">
      <h2>Settings</h2>

      <div className="setting-item">
        <label htmlFor="wheel-title">Title</label>
        <input
          id="wheel-title"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="setting-input"
        />
      </div>

      <div className="setting-item">
        <label htmlFor="bg-color">Background Color</label>
        <input
          id="bg-color"
          type="color"
          value={bgColor}
          onChange={(e) => onBgColorChange(e.target.value)}
          className="setting-color-input"
        />
      </div>

      <div className="setting-item">
        <label>Color Pattern</label>
        <div className="color-patterns">
          {COLOR_PATTERNS.map((pattern, idx) => (
            <button
              key={idx}
              className={`pattern-btn ${idx === colorPatternIndex ? "active" : ""}`}
              onClick={() => onColorPatternChange(idx)}
              aria-label={`Color pattern ${idx + 1}`}
              aria-pressed={idx === colorPatternIndex}
            >
              {pattern.slice(0, 5).map((c, ci) => (
                <span
                  key={ci}
                  className="pattern-swatch"
                  style={{ background: c }}
                />
              ))}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
