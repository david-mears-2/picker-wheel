import { useState, useCallback, useRef, useEffect } from "react";
import { PickerWheel } from "./components/PickerWheel";
import { SpinButton } from "./components/SpinButton";
import { ResultDisplay } from "./components/ResultDisplay";
import { OptionList } from "./components/OptionList";
import { SettingsPanel } from "./components/SettingsPanel";
import type { PointerImpact } from "./hooks/usePointerImpactAnimation";
import { useWheelState } from "./hooks/useWheelState";
import { useSpinAnimation } from "./hooks/useSpinAnimation";
import { useSpinSound } from "./hooks/useSpinSound";
import type { WheelOption } from "./types";

const WHEEL_SIZE = 500;

function getFullscreenWheelSize(width: number, height: number): number {
  const available = Math.min(width - 40, height - 220);
  return Math.max(300, Math.floor(available));
}

function useWheelSize(isFullscreen: boolean): number {
  const [viewportSize, setViewportSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  useEffect(() => {
    const update = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", update);
    document.addEventListener("fullscreenchange", update);
    return () => {
      window.removeEventListener("resize", update);
      document.removeEventListener("fullscreenchange", update);
    };
  }, []);

  if (!isFullscreen) {
    return WHEEL_SIZE;
  }

  return getFullscreenWheelSize(viewportSize.width, viewportSize.height);
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
    reorderOptions,
  } = useWheelState();

  const [winner, setWinner] = useState<WheelOption | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [areControlsVisible, setAreControlsVisible] = useState(false);
  const [pointerImpact, setPointerImpact] = useState<PointerImpact>({
    trigger: 0,
    angularVelocity: 0,
  });
  const appRef = useRef<HTMLDivElement>(null);
  const { tick } = useSpinSound();

  const handleFinished = useCallback(
    (w: WheelOption) => {
      setWinner(w);
    },
    []
  );

  const handleSegmentChange = useCallback((segmentIndex: number, angularVelocity: number) => {
    void segmentIndex;
    tick();
    setPointerImpact((current) => ({
      trigger: current.trigger + 1,
      angularVelocity,
    }));
  }, [tick]);

  const { isSpinning, rotation, spin, error: spinError } = useSpinAnimation(
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
            {!isFullscreen && (
              <button
                className="controls-toggle-btn"
                type="button"
                onClick={() => setAreControlsVisible((current) => !current)}
                aria-controls="app-controls"
                aria-expanded={areControlsVisible}
                aria-label={areControlsVisible ? "Hide controls" : "Show controls"}
                title={areControlsVisible ? "Hide controls" : "Show controls"}
              >
                {areControlsVisible ? "✕" : "☰"}
              </button>
            )}
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
              pointerImpact={pointerImpact}
              rotation={rotation}
              size={wheelSize}
            />
            <SpinButton
              onClick={() => { setWinner(null); spin(); }}
              disabled={isSpinning || state.options.length < 2}
              size={wheelSize}
            />
          </div>
          <div className="result-slot">
            {spinError && !isSpinning ? (
              <div className="result-error" role="alert" aria-live="assertive">
                {spinError}
              </div>
            ) : winner && !isSpinning ? (
              <ResultDisplay
                label={winner.label}
                color={winner.color}
                onDismiss={() => setWinner(null)}
              />
            ) : null}
          </div>
        </div>

        {!isFullscreen && areControlsVisible && (
          <aside className="controls-section" id="app-controls">
            <OptionList
              options={state.options}
              onAdd={addOption}
              onRemove={removeOption}
              onUpdate={updateOption}
              onReorder={reorderOptions}
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
