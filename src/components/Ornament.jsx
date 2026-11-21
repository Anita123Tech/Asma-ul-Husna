export function StarOrnament({ size = 28, className = "" }) {
  return (
    <svg
      className={`star-ornament ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M24 2 L30 18 L46 24 L30 30 L24 46 L18 30 L2 24 L18 18 Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="24" r="6.5" stroke="currentColor" strokeWidth="1" opacity="0.75" />
      <circle cx="24" cy="24" r="1.8" fill="currentColor" />
    </svg>
  );
}

export function OrnamentDivider({ className = "" }) {
  return (
    <div className={`ornament-divider ${className}`.trim()} aria-hidden="true">
      <span className="line" />
      <StarOrnament size={15} />
      <span className="line" />
    </div>
  );
}

export function LogoMark({ size = 34, className = "" }) {
  return (
    <span className={`logo-mark ${className}`.trim()} style={{ width: size, height: size }}>
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="22.5" stroke="currentColor" strokeOpacity="0.35" />
        <path
          d="M24 7 L29 19 L41 24 L29 29 L24 41 L19 29 L7 24 L19 19 Z"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="24" r="3.6" stroke="currentColor" strokeWidth="0.9" />
        <circle cx="24" cy="24" r="1.2" fill="currentColor" />
      </svg>
    </span>
  );
}
