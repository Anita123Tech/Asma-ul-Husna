export default function ProgressBar({
  value = 0,
  label = "Progress",
  className = "",
}) {
  const clamped = Math.min(Math.max(value, 0), 1);
  const percent = Math.round(clamped * 100);

  return (
    <div
      className={`progress-bar ${className}`.trim()}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      <span className="progress-bar-fill" style={{ width: `${percent}%` }} />
    </div>
  );
}
