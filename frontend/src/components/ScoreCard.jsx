export default function ScoreCard({ label, score, max = 100, color = "#6366f1", sublabel }) {
  const pct = Math.round((score / max) * 100);

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="label">{label}</span>
        <span className="text-2xl font-bold" style={{ color }}>
          {score}<span className="text-sm font-normal" style={{ color: "var(--text-muted)" }}>/{max}</span>
        </span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {sublabel && (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{sublabel}</p>
      )}
    </div>
  );
}
