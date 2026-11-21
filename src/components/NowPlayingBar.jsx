import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Loader2,
  Pause,
  Play,
  SkipForward,
} from "lucide-react";
import { useAudio } from "../hooks/useAudio";
import ProgressBar from "./ProgressBar";
import "../styles/explorer.css";

function pad(number) {
  return String(number).padStart(2, "0");
}

export default function NowPlayingBar() {
  const {
    index,
    currentName,
    isPlaying,
    isLoading,
    error,
    mode,
    overallProgress,
    togglePlay,
    next,
  } = useAudio();

  return (
    <div className="now-playing-bar" role="region" aria-label="Current selection">
      <span className="np-number" aria-hidden="true">
        {pad(currentName.id)}
      </span>

      <div className="np-info">
        <span className="np-label">
          {error
            ? "Recording unavailable"
            : isPlaying
              ? "Now reciting"
              : "Selected name"}
        </span>
        <strong>{currentName.transliteration}</strong>
        <span className="np-meaning">
          {error ? error.message : currentName.englishMeaning}
        </span>
      </div>

      <div className="np-actions">
        <button
          type="button"
          className="np-btn np-play"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause recitation" : "Play selected name"}
        >
          {isLoading ? (
            <Loader2 size={17} className="spin" aria-hidden="true" />
          ) : isPlaying ? (
            <Pause size={17} fill="currentColor" aria-hidden="true" />
          ) : (
            <Play size={17} fill="currentColor" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          className="np-btn"
          onClick={() => next()}
          aria-label="Next name"
        >
          <SkipForward size={17} aria-hidden="true" />
        </button>
        <Link to="/recitation" className="np-open">
          <span className="np-open-text">{mode === "continuous" ? "Continuous" : "Open"}</span>
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>

      <ProgressBar
        value={overallProgress}
        label={`Name ${index + 1} of 99`}
        className="np-progress"
      />
    </div>
  );
}
