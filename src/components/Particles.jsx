import { useMemo } from "react";

export default function Particles({ count = 18, className = "" }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${(i * 37 + 11) % 100}%`,
        size: 2 + ((i * 7) % 5),
        duration: 20 + ((i * 5) % 18),
        delay: -((i * 3.7) % 30),
        drift: `${((i % 2 === 0 ? 1 : -1) * (8 + ((i * 9) % 42)))}px`,
      })),
    [count],
  );

  return (
    <div className={`particles ${className}`.trim()} aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            "--drift": p.drift,
          }}
        />
      ))}
    </div>
  );
}
