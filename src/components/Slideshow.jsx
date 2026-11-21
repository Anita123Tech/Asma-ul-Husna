import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { useAudio } from "../hooks/useAudio";
import { StarOrnament } from "./Ornament";
import ProgressBar from "./ProgressBar";
import AudioPlayer from "./AudioPlayer";
import NamePicker from "./NamePicker";
import "../styles/slideshow.css";

function pad(number) {
  return String(number).padStart(2, "0");
}

function stripDiacritics(value) {
  return String(value).replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, "");
}

export default function Slideshow() {
  const {
    index,
    currentName,
    isPlaying,
    isLoading,
    error,
    mode,
    completed,
    activeWordIndex,
    overallProgress,
    togglePlay,
    previous,
    next,
    selectName,
    retry,
    restart,
    dismissCompletion,
    toggleRepeatCurrent,
    toggleMute,
  } = useAudio();

  const stageRef = useRef(null);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [presentation, setPresentation] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isPresentation = isFullscreen || presentation;
  const displayName = currentName;
  const displayWords = displayName.arabic.trim().split(/\s+/);
  const isLongName = stripDiacritics(displayName.arabic).length > 13;

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    handleFullscreenChange();
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!presentation && !completed) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [presentation, completed]);

  useEffect(() => {
    if (!isPresentation) return undefined;
    const handleEscape = async (event) => {
      if (event.key !== "Escape" || pickerOpen) return;
      setPresentation(false);
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {
          /* the browser may already have left fullscreen */
        }
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isPresentation, pickerOpen]);

  const toggleFullscreen = useCallback(async () => {
    const element = stageRef.current;

    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        /* the browser may refuse to exit — no action needed */
      }
      return;
    }

    if (presentation) {
      setPresentation(false);
      return;
    }

    if (element && typeof element.requestFullscreen === "function") {
      try {
        await element.requestFullscreen();
        return;
      } catch {
        /* fall back to the in-page presentation mode */
      }
    }

    setPresentation(true);
  }, [presentation]);

  const openPicker = useCallback(() => setPickerOpen(true), []);
  const closePicker = useCallback(() => setPickerOpen(false), []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const tagName = target?.tagName;
      const isTyping =
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        tagName === "SELECT" ||
        target?.isContentEditable;

      if (isTyping || pickerOpen || completed) return;

      const isInteractive = tagName === "BUTTON" || tagName === "A";

      if (event.code === "Space" || event.key.toLowerCase() === "k") {
        if (event.code === "Space" && isInteractive) return;
        event.preventDefault();
        togglePlay();
        return;
      }

      switch (event.key) {
        case "ArrowRight":
          event.preventDefault();
          next();
          break;
        case "ArrowLeft":
          event.preventDefault();
          previous();
          break;
        case "r":
        case "R":
          toggleRepeatCurrent();
          break;
        case "m":
        case "M":
          toggleMute();
          break;
        case "f":
        case "F":
          event.preventDefault();
          toggleFullscreen();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    completed,
    next,
    pickerOpen,
    previous,
    toggleFullscreen,
    toggleMute,
    togglePlay,
    toggleRepeatCurrent,
  ]);

  const handlePickerSelect = (nameIndex) => {
    selectName(nameIndex, { autoplay: isPlaying });
  };

  const liveMessage = error
    ? error.message
    : isLoading
      ? `Loading ${currentName.transliteration}`
      : isPlaying
        ? `Reciting ${currentName.transliteration}, name ${index + 1} of 99`
        : `${currentName.transliteration} selected, name ${index + 1} of 99`;

  return (
    <section
      ref={stageRef}
      className={`slideshow ${isPresentation ? "is-presentation" : ""}`.trim()}
      aria-label="Asma ul Husna recitation"
    >
      <div className="slideshow-pattern" aria-hidden="true" />
      <div className="slideshow-glow" aria-hidden="true" />

      <div className="slideshow-content">
        <div className="stage-topbar">
          <div className="stage-counter">
            <span className="stage-current">{pad(index + 1)}</span>
            <span className="stage-total">/ 99</span>
            <span className="stage-mode">{mode === "continuous" ? "Continuous" : "Individual"}</span>
          </div>

          <div className="stage-tools">
            <button
              type="button"
              className="stage-tool"
              id="name-picker-trigger"
              onClick={openPicker}
              aria-haspopup="dialog"
            >
              <LayoutGrid size={16} aria-hidden="true" />
              <span>All Names</span>
            </button>
            <button
              type="button"
              className="stage-tool"
              onClick={toggleFullscreen}
              aria-pressed={isPresentation}
              aria-label={isPresentation ? "Exit fullscreen presentation" : "Enter fullscreen presentation"}
            >
              {isPresentation ? (
                <Minimize2 size={16} aria-hidden="true" />
              ) : (
                <Maximize2 size={16} aria-hidden="true" />
              )}
              <span>{isPresentation ? "Exit" : "Fullscreen"}</span>
            </button>
          </div>
        </div>

        <div className="slide-viewport">
          <div className="slide" key={displayName.id}>
            <span className="slide-ornament" aria-hidden="true">
              <StarOrnament size={22} />
            </span>
            <p className="slide-eyebrow">
              Name <span>{pad(displayName.id)}</span>
            </p>
            <h1
              className={`slide-arabic arabic ${isLongName ? "is-long" : ""}`.trim()}
              lang="ar"
              dir="rtl"
              aria-label={displayName.arabic}
            >
              {displayWords.map((word, wordIndex) => (
                <span
                  key={`${displayName.id}-${wordIndex}`}
                  className={`arabic-word${wordIndex === activeWordIndex ? " is-active" : ""}`.trim()}
                >
                  {word}
                  {wordIndex < displayWords.length - 1 ? " " : ""}
                </span>
              ))}
            </h1>
            <p className="slide-translit">{displayName.transliteration}</p>

            <span className="slide-rule" aria-hidden="true" />

            <div className="slide-meanings">
              <div className="slide-meaning">
                <span className="slide-meaning-label">English</span>
                <p className="slide-meaning-en">{displayName.englishMeaning}</p>
              </div>
              <span className="slide-meaning-sep" aria-hidden="true" />
              <div className="slide-meaning">
                <span className="slide-meaning-label">اردو</span>
                <p className="slide-meaning-ur urdu" lang="ur" dir="rtl">
                  {displayName.urduMeaning}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="slide-controls">
          <button
            type="button"
            className="slide-arrow"
            onClick={previous}
            aria-label="Previous name"
            title="Previous name (←)"
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </button>

          <div className="slide-play-wrap">
            <span className="slide-play-halo" aria-hidden="true" />
            <button
              type="button"
              className={`slide-play ${isPlaying ? "is-playing" : ""}`.trim()}
              onClick={togglePlay}
              aria-label={
                isLoading
                  ? "Loading recitation"
                  : isPlaying
                    ? "Pause recitation"
                    : "Play recitation"
              }
              title="Play / pause (Space)"
            >
              {isLoading ? (
                <Loader2 size={30} className="spin" aria-hidden="true" />
              ) : isPlaying ? (
                <Pause size={30} fill="currentColor" aria-hidden="true" />
              ) : (
                <Play size={30} fill="currentColor" aria-hidden="true" />
              )}
            </button>
          </div>

          <button
            type="button"
            className="slide-arrow"
            onClick={() => next()}
            aria-label="Next name"
            title="Next name (→)"
          >
            <ChevronRight size={24} aria-hidden="true" />
          </button>
        </div>

        {error && (
          <div className="audio-error" role="alert">
            <AlertCircle size={20} aria-hidden="true" />
            <div className="audio-error-body">
              <strong>
                {error.code === "autoplay"
                  ? "The browser paused playback"
                  : "Recitation unavailable"}
              </strong>
              <p>{error.message}</p>
                {error.code === "missing" && (
                  <code>public/audio/asma-ul-husna.mp3</code>
                )}
            </div>
            <div className="audio-error-actions">
              <button type="button" className="btn btn-gold btn-sm" onClick={retry}>
                Try again
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => next()}
              >
                Skip
              </button>
            </div>
          </div>
        )}

        <div className="overall-progress">
          <div className="overall-progress-head">
            <span>Your journey through the Names</span>
            <span>
              {pad(index + 1)} <span className="overall-of">/ 99</span>
            </span>
          </div>
          <ProgressBar
            value={overallProgress}
            label="Overall progress through the 99 names"
          />
        </div>
      </div>

      <AudioPlayer />

      <NamePicker
        open={pickerOpen}
        onClose={closePicker}
        onSelect={handlePickerSelect}
      />

      {completed && (
        <div className="completion-overlay" role="dialog" aria-modal="true" aria-labelledby="completion-title">
          <div className="completion-card">
            <button
              type="button"
              className="completion-close"
              onClick={dismissCompletion}
              aria-label="Close completion message"
            >
              <X size={18} aria-hidden="true" />
            </button>
            <span className="completion-star" aria-hidden="true">
              <StarOrnament size={44} />
            </span>
            <p className="completion-arabic arabic" lang="ar" dir="rtl">
              مَا شَاءَ اللَّهُ
            </p>
            <p className="eyebrow no-lines">Masha’Allah</p>
            <h2 id="completion-title">You have completed the 99 Names</h2>
            <p className="completion-copy">
              May the names you have recited remain close to your heart, and may
              they bring light to your remembrance, your prayers, and your days.
            </p>
            <div className="completion-actions">
              <button type="button" className="btn btn-gold" onClick={restart}>
                <RotateCcw size={16} aria-hidden="true" />
                Replay from the beginning
              </button>
              <Link to="/names" className="btn btn-ghost">
                <Sparkles size={16} aria-hidden="true" />
                Explore the Names
              </Link>
            </div>
          </div>
        </div>
      )}

      <p className="visually-hidden" aria-live="polite">
        {liveMessage}
      </p>
    </section>
  );
}
