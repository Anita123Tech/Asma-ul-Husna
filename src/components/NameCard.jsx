import { ArrowUpRight, Pause, Play } from "lucide-react";
import "../styles/explorer.css";

function pad(number) {
  return String(number).padStart(2, "0");
}

export default function NameCard({
  name,
  index,
  active = false,
  playing = false,
  compact = false,
  onOpen,
  onPlay,
}) {
  return (
    <article
      className={`name-card ${active ? "is-active" : ""} ${compact ? "is-compact" : ""}`.trim()}
    >
      <button
        type="button"
        className="name-card-main"
        onClick={() => onOpen?.(index)}
        aria-label={`Open ${name.transliteration} — ${name.englishMeaning} in the slideshow`}
      >
        <span className="name-card-number">{pad(name.id)}</span>
        <span className="name-card-arabic arabic" lang="ar" dir="rtl">
          {name.arabic}
        </span>
        <span className="name-card-translit">{name.transliteration}</span>
        <span className="name-card-meaning">{name.englishMeaning}</span>
        {compact && (
          <span className="name-card-hint" aria-hidden="true">
            Open name <ArrowUpRight size={13} />
          </span>
        )}
      </button>

      {!compact && (
        <button
          type="button"
          className={`name-card-play ${playing ? "is-playing" : ""}`.trim()}
          onClick={() => onPlay?.(index)}
          aria-label={
            playing
              ? `Pause recitation of ${name.transliteration}`
              : `Play recitation of ${name.transliteration}`
          }
        >
          {playing ? (
            <Pause size={15} fill="currentColor" aria-hidden="true" />
          ) : (
            <Play size={15} fill="currentColor" aria-hidden="true" />
          )}
        </button>
      )}
    </article>
  );
}
