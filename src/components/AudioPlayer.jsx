import {
  AlertCircle,
  Loader2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useAudio } from "../hooks/useAudio";
import "../styles/slideshow.css";

function formatTime(value) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const total = Math.floor(value);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function pad(number) {
  return String(number).padStart(2, "0");
}

export default function AudioPlayer() {
  const {
    currentName,
    currentTime,
    duration,
    isPlaying,
    isLoading,
    error,
    mode,
    repeatCurrent,
    repeatAll,
    volume,
    muted,
    setVolume,
    toggleMute,
    togglePlay,
    previous,
    next,
    seek,
    setMode,
    toggleRepeatCurrent,
    toggleRepeatAll,
    timingsReady,
    restart,
  } = useAudio();

  const isMuted = muted || volume === 0;
  const timelinePercent =
    duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;
  const volumePercent = (isMuted ? 0 : volume) * 100;

  return (
    <div className="audio-player" role="group" aria-label="Recitation controls">
      <div className="ap-main">
        <div className="ap-track">
          <span className="ap-kicker">
            {mode === "continuous" ? "Continuous recitation" : "Individual recitation"}
            {!timingsReady && " · timings pending"}
          </span>
          <span className="ap-title">
            <strong>{pad(currentName.id)}</strong>
            {currentName.transliteration}
          </span>
          <span className="ap-meaning">{currentName.englishMeaning}</span>
        </div>

        <div className="ap-transport">
          <button
            type="button"
            className="ap-skip"
            onClick={restart}
            aria-label="Start recitation from the beginning"
            title="Start from the beginning"
          >
            <RotateCcw size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="ap-skip"
            onClick={previous}
            aria-label="Previous name"
            title="Previous name (←)"
          >
            <SkipBack size={19} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="ap-play"
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
              <Loader2 size={24} className="spin" aria-hidden="true" />
            ) : isPlaying ? (
              <Pause size={24} fill="currentColor" aria-hidden="true" />
            ) : (
              <Play size={24} fill="currentColor" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            className="ap-skip"
            onClick={() => next()}
            aria-label="Next name"
            title="Next name (→)"
          >
            <SkipForward size={19} aria-hidden="true" />
          </button>
        </div>

        <div
          className={`ap-status ${error ? "is-error" : ""}`.trim()}
          aria-live="polite"
          title={error?.message}
        >
          {error ? (
            <AlertCircle size={13} aria-hidden="true" />
          ) : (
            <span
              className={`ap-status-dot ${isPlaying ? "is-live" : ""}`.trim()}
              aria-hidden="true"
            />
          )}
          {error
            ? error.code === "missing"
              ? "Recitation unavailable"
              : error.message
            : isLoading
              ? "Loading"
              : isPlaying
                ? "Playing"
                : "Paused"}
        </div>
      </div>

      <div className="ap-timeline">
        <span className="ap-time">{formatTime(currentTime)}</span>
        <label htmlFor="audio-timeline" className="visually-hidden">
          Audio progress
        </label>
        <input
          id="audio-timeline"
          type="range"
          className="range-slider timeline-slider"
          min="0"
          max={duration > 0 ? duration : 1}
          step="0.1"
          value={Math.min(currentTime, duration > 0 ? duration : 1)}
          onChange={(event) => seek(Number(event.target.value))}
          disabled={duration <= 0}
          style={{ "--fill": `${timelinePercent}%` }}
        />
        <span className="ap-time">{formatTime(duration)}</span>
      </div>

      <div className="ap-footer">
        <div className="mode-switch" role="group" aria-label="Playback mode">
          <button
            type="button"
            className={mode === "individual" ? "is-active" : ""}
            onClick={() => setMode("individual")}
            aria-pressed={mode === "individual"}
            title="Play the selected name only"
          >
            Individual
          </button>
          <button
            type="button"
            className={mode === "continuous" ? "is-active" : ""}
            onClick={() => setMode("continuous")}
            aria-pressed={mode === "continuous"}
            title="Play all 99 names in sequence"
          >
            Continuous
          </button>
        </div>

        <div className="ap-repeat" role="group" aria-label="Repeat options">
          <button
            type="button"
            className={repeatCurrent ? "is-active" : ""}
            onClick={toggleRepeatCurrent}
            aria-pressed={repeatCurrent}
            aria-label="Repeat current name"
            title="Repeat current name (R)"
          >
            <Repeat1 size={17} aria-hidden="true" />
            <span>One</span>
          </button>
          <button
            type="button"
            className={repeatAll ? "is-active" : ""}
            onClick={toggleRepeatAll}
            aria-pressed={repeatAll}
            aria-label="Repeat all 99 names"
            title="Repeat all 99 names"
          >
            <Repeat size={17} aria-hidden="true" />
            <span>All</span>
          </button>
        </div>

        <div className="ap-volume">
          <button
            type="button"
            className="ap-mute"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute recitation" : "Mute recitation"}
            title="Mute (M)"
          >
            {isMuted ? (
              <VolumeX size={18} aria-hidden="true" />
            ) : (
              <Volume2 size={18} aria-hidden="true" />
            )}
          </button>
          <label htmlFor="volume-slider" className="visually-hidden">
            Volume
          </label>
          <input
            id="volume-slider"
            type="range"
            className="range-slider volume-slider"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            style={{ "--fill": `${volumePercent}%` }}
          />
          <span className="ap-volume-value">{Math.round(volumePercent)}%</span>
        </div>
      </div>
    </div>
  );
}
