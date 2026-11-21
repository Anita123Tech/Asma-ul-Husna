import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import NameCard from "./NameCard";
import { useAudio } from "../hooks/useAudio";
import { normalizeText } from "../utils/search";
import "../styles/explorer.css";

export default function NamesExplorer() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const {
    names,
    index,
    isPlaying,
    selectName,
    pause,
    setMode,
  } = useAudio();

  const filtered = useMemo(() => {
    const needle = normalizeText(query);
    if (!needle) {
      return names.map((name, nameIndex) => ({ name, nameIndex }));
    }

    return names
      .map((name, nameIndex) => ({ name, nameIndex }))
      .filter(({ name }) => {
        const haystack = normalizeText(
          `${name.arabic} ${name.transliteration} ${name.englishMeaning} ${name.urduMeaning}`,
        );
        return haystack.includes(needle);
      });
  }, [names, query]);

  const handleOpen = (nameIndex) => {
    selectName(nameIndex);
    navigate("/recitation");
  };

  const handlePlay = (nameIndex) => {
    if (nameIndex === index && isPlaying) {
      pause();
      return;
    }
    setMode("individual");
    selectName(nameIndex, { autoplay: true });
  };

  return (
    <section className="names-explorer" aria-label="Explore the 99 names">
      <div className="explorer-toolbar">
        <div className="search-box">
          <Search size={18} aria-hidden="true" className="search-icon" />
          <label htmlFor="name-search" className="visually-hidden">
            Search names by Arabic, transliteration or meaning
          </label>
          <input
            id="name-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, meaning or Arabic…"
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
              <X size={15} aria-hidden="true" />
            </button>
          )}
        </div>
        <p className="names-count" aria-live="polite">
          <strong>{filtered.length}</strong> of 99 names
        </p>
      </div>

      {filtered.length > 0 ? (
        <div className="names-grid">
          {filtered.map(({ name, nameIndex }, position) => (
            <div
              key={name.id}
              className="names-grid-item"
              style={{ animationDelay: `${Math.min(position, 12) * 35}ms` }}
            >
              <NameCard
                name={name}
                index={nameIndex}
                active={index === nameIndex}
                playing={index === nameIndex && isPlaying}
                onOpen={handleOpen}
                onPlay={handlePlay}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="names-empty" role="status">
          <span className="names-empty-icon" aria-hidden="true">
            <Search size={24} />
          </span>
          <h3>No names found</h3>
          <p>
            No name matches “{query}”. Try an Arabic word, a transliteration
            like “Rahman”, or a meaning such as “merciful”.
          </p>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setQuery("")}
          >
            Clear search
          </button>
        </div>
      )}
    </section>
  );
}
