import { useState, useCallback } from "react";
import { PickerWheel } from "./components/PickerWheel";
import { SpinButton } from "./components/SpinButton";
import { WinnerModal } from "./components/WinnerModal";
import { OptionList } from "./components/OptionList";
import { ResultsHistory } from "./components/ResultsHistory";
import { SettingsPanel } from "./components/SettingsPanel";
import { useWheelState } from "./hooks/useWheelState";
import { useSpinAnimation } from "./hooks/useSpinAnimation";
import { useSpinSound } from "./hooks/useSpinSound";
import type { WheelOption } from "./types";

const WHEEL_SIZE = 500;

export default function App() {
  const {
    state,
    setTitle,
    setBgColor,
    setColorPattern,
    addOption,
    removeOption,
    updateOption,
    shuffleOptions,
    sortOptions,
    addResult,
    clearResults,
  } = useWheelState();

  const [winner, setWinner] = useState<WheelOption | null>(null);
  const { tick } = useSpinSound();

  const handleFinished = useCallback(
    (w: WheelOption) => {
      setWinner(w);
      addResult({ optionId: w.id, label: w.label, timestamp: Date.now() });
    },
    [addResult]
  );

  const handleSegmentChange = useCallback(() => {
    tick();
  }, [tick]);

  const { isSpinning, rotation, spin } = useSpinAnimation(
    state.options,
    handleFinished,
    handleSegmentChange
  );

  const handleSpinAgain = () => {
    setWinner(null);
    // Small delay so modal closes before spin starts
    setTimeout(spin, 100);
  };

  return (
    <div className="app" style={{ backgroundColor: state.bgColor }}>
      <main className="app-layout">
        <div className="wheel-section">
          <h1 className="app-title">{state.title}</h1>
          <div className="wheel-wrapper" style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}>
            <PickerWheel
              options={state.options}
              rotation={rotation}
              size={WHEEL_SIZE}
            />
            <SpinButton
              onClick={spin}
              disabled={isSpinning || state.options.length < 2}
              size={WHEEL_SIZE}
            />
          </div>
        </div>

        <aside className="controls-section">
          <OptionList
            options={state.options}
            onAdd={addOption}
            onRemove={removeOption}
            onUpdate={updateOption}
            onShuffle={shuffleOptions}
            onSort={sortOptions}
          />
          <ResultsHistory results={state.results} onClear={clearResults} />
          <SettingsPanel
            title={state.title}
            bgColor={state.bgColor}
            colorPatternIndex={state.colorPatternIndex}
            onTitleChange={setTitle}
            onBgColorChange={setBgColor}
            onColorPatternChange={setColorPattern}
          />
        </aside>
      </main>

      {winner && (
        <WinnerModal
          label={winner.label}
          color={winner.color}
          onClose={() => setWinner(null)}
          onSpinAgain={handleSpinAgain}
        />
      )}
    </div>
  );
}
