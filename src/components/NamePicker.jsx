import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
import { useAudio } from "../hooks/useAudio";
import { filterNames } from "../utils/search";
import "../styles/slideshow.css";

function pad(number) {
  return String(number).padStart(2, "0");
}

export default function NamePicker({ open, onClose, onSelect }) {
  const { names, index, isPlaying } = useAudio();
  const [query, setQuery] = useState("");
  const searchRef = useRef(null);
  const previousFocusRef = useRef(null);

  const filtered = useMemo(() => filterNames(names, query), [names, query]);
  const closePicker = useCallback(() => {
    setQuery("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    previousFocusRef.current = document.activeElement;
    const focusTimer = window.setTimeout(() => searchRef.current?.focus(), 60);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePicker();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      const previous = previousFocusRef.current;
      if (previous && typeof previous.focus === "function") {
        previous.focus();
      }
    };
  }, [open, closePicker]);

  if (!open) return null;

  const handleSelect = (nameIndex) => {
    onSelect(nameIndex);
    closePicker();
  };

  return createPortal(
    <div
      className="picker-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closePicker();
      }}
    >
      <div
        className="name-picker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="picker-title"
      >
        <header className="picker-head">
          <div>
            <p className="eyebrow no-lines">Jump to a name</p>
            <h2 id="picker-title">All 99 Names</h2>
          </div>
          <button
            type="button"
            className="icon-btn picker-close"
            onClick={closePicker}
            aria-label="Close name picker"
          >
            <X size={19} aria-hidden="true" />
          </button>
        </header>

        <div className="search-box picker-search">
          <Search size={17} aria-hidden="true" className="search-icon" />
          <label htmlFor="picker-search" className="visually-hidden">
            Search the 99 names
          </label>
          <input
            id="picker-search"
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by Arabic, name or meaning…"
            autoComplete="off"
            spellCheck="false"
          />
          {query && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="picker-grid">
            {filtered.map((name) => {
              const nameIndex = name.id - 1;
              const isCurrent = nameIndex === index;
              return (
                <button
                  key={name.id}
                  type="button"
                  className={`picker-item ${isCurrent ? "is-current" : ""}`.trim()}
                  onClick={() => handleSelect(nameIndex)}
                  aria-current={isCurrent ? "true" : undefined}
                  aria-label={`Name ${name.id}: ${name.transliteration} — ${name.englishMeaning}`}
                >
                  <span className="picker-number">{pad(name.id)}</span>
                  <span className="picker-arabic arabic" lang="ar" dir="rtl">
                    {name.arabic}
                  </span>
                  <span className="picker-translit">
                    {name.transliteration}
                    {isCurrent && isPlaying && (
                      <span className="picker-playing" aria-hidden="true" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="picker-empty" role="status">
            <p>No names match “{query}”.</p>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setQuery("")}
            >
              Clear search
            </button>
          </div>
        )}

        <footer className="picker-foot">
          <span>{filtered.length} names shown</span>
          <span>Selecting a name loads it into the slideshow</span>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
