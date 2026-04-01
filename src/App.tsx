import { useState, useCallback, useRef, useEffect } from "react";
import { PickerWheel } from "./components/PickerWheel";
import { SpinButton } from "./components/SpinButton";
import { ResultDisplay } from "./components/ResultDisplay";
import { OptionList } from "./components/OptionList";
import { SettingsPanel } from "./components/SettingsPanel";
import { useWheelState } from "./hooks/useWheelState";
import { useSpinAnimation } from "./hooks/useSpinAnimation";
import { useSpinSound } from "./hooks/useSpinSound";
import type { WheelOption } from "./types";

const WHEEL_SIZE = 500;

function useWheelSize(isFullscreen: boolean): number {
  const [size, setSize] = useState(WHEEL_SIZE);

  useEffect(() => {
    if (!isFullscreen) {
      setSize(WHEEL_SIZE);
      return;
    }
    const update = () => {
      // Reserve space for header (~100px), result (~80px), and padding (~40px)
      const available = Math.min(window.innerWidth - 40, window.innerHeight - 220);
      setSize(Math.max(300, Math.floor(available)));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [isFullscreen]);

  return size;
}

export default function App() {
  const {
    state,
    setTitle,
    setSubtitle,
    setBgColor,
    setColorPattern,
    addOption,
    removeOption,
    updateOption,
    shuffleOptions,
    sortOptions,
  } = useWheelState();

  const [winner, setWinner] = useState<WheelOption | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const appRef = useRef<HTMLDivElement>(null);
  const { tick } = useSpinSound();

  const handleFinished = useCallback(
    (w: WheelOption) => {
      setWinner(w);
    },
    []
  );

  const handleSegmentChange = useCallback(() => {
    tick();
  }, [tick]);

  const { isSpinning, rotation, spin } = useSpinAnimation(
    state.options,
    handleFinished,
    handleSegmentChange
  );

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await appRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen not supported or denied
    }
  }, []);

  // Sync fullscreen state if user exits via Escape
  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(!!document.fullscreenElement);
  }, []);

  // Listen for fullscreen changes (e.g. user presses Escape)
  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [handleFullscreenChange]);

  const wheelSize = useWheelSize(isFullscreen);

  return (
    <div
      className={`app${isFullscreen ? " app--fullscreen" : ""}`}
      style={{ backgroundColor: state.bgColor }}
      ref={appRef}
    >
      <main className="app-layout">
        <div className="wheel-section">
          <div className="wheel-header">
            <div>
              <h1 className="app-title">{state.title}</h1>
              {state.subtitle && (
                <p className="app-subtitle">{state.subtitle}</p>
              )}
            </div>
            <button
              className="fullscreen-btn"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? "⛶" : "⛶"}
            </button>
          </div>
          <div className="wheel-wrapper" style={{ width: wheelSize, height: wheelSize }}>
            <PickerWheel
              options={state.options}
              rotation={rotation}
              size={wheelSize}
            />
            <SpinButton
              onClick={() => { setWinner(null); spin(); }}
              disabled={isSpinning || state.options.length < 2}
              size={wheelSize}
            />
          </div>
          {winner && !isSpinning && (
            <ResultDisplay
              label={winner.label}
              color={winner.color}
              onDismiss={() => setWinner(null)}
            />
          )}
        </div>

        {!isFullscreen && (
          <aside className="controls-section">
            <OptionList
              options={state.options}
              onAdd={addOption}
              onRemove={removeOption}
              onUpdate={updateOption}
              onShuffle={shuffleOptions}
              onSort={sortOptions}
            />
            <SettingsPanel
              title={state.title}
              subtitle={state.subtitle}
              bgColor={state.bgColor}
              colorPatternIndex={state.colorPatternIndex}
              onTitleChange={setTitle}
              onSubtitleChange={setSubtitle}
              onBgColorChange={setBgColor}
              onColorPatternChange={setColorPattern}
            />
          </aside>
        )}
      </main>
    </div>
  );
}
