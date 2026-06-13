export default function LoadingSkeleton({ rows = 4, className = "" }) {
  const widths = ["75%", "90%", "82%", "68%", "95%", "80%"];

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            height: "1rem",
            width: widths[i % widths.length],
          }}
        />
      ))}
    </div>
  );
}