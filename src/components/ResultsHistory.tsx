import type { SpinResult } from "../types";

interface ResultsHistoryProps {
  results: SpinResult[];
  onClear: () => void;
}

export function ResultsHistory({ results, onClear }: ResultsHistoryProps) {
  return (
    <section className="results-panel" aria-label="Spin results history">
      <h2>Results</h2>
      {results.length === 0 ? (
        <p className="no-results">No results yet. Spin the wheel!</p>
      ) : (
        <>
          <ul className="result-list" role="list">
            {results.map((r, i) => (
              <li key={`${r.timestamp}-${i}`} className="result-item">
                <span className="result-label">{r.label}</span>
                <span className="result-time">
                  {new Date(r.timestamp).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
          <button onClick={onClear} className="btn btn-ghost btn-sm">
            Clear Results
          </button>
        </>
      )}
    </section>
  );
}
