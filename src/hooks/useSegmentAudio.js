import { useCallback, useEffect, useRef, useState } from "react";
import { AUDIO_PATH } from "../data/referenceData";

export function useSegmentAudio() {
  const audioRef = useRef(null);
  const pendingSeekRef = useRef(null);
  const tickRef = useRef(null);
  const segmentEndRef = useRef(null);
  const onEndRef = useRef(null);
  const modeRef = useRef(null);
  const tokenRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);

  const finish = useCallback((token) => {
    if (token !== tokenRef.current) return;

    const onEnd = onEndRef.current;
    modeRef.current = null;
    tickRef.current = null;
    segmentEndRef.current = null;
    onEndRef.current = null;
    audioRef.current?.pause();
    setIsPlaying(false);
    onEnd?.();
  }, []);

  useEffect(() => {
    const audio = new Audio(AUDIO_PATH);
    audio.preload = "auto";
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (pendingSeekRef.current !== null) {
        audio.currentTime = pendingSeekRef.current;
        pendingSeekRef.current = null;
      }
    };

    const handleTimeUpdate = () => {
      tickRef.current?.(audio.currentTime);
      if (
        modeRef.current === "segment" &&
        segmentEndRef.current !== null &&
        audio.currentTime >= segmentEndRef.current - 0.04
      ) {
        finish(tokenRef.current);
      }
    };

    const handleEnded = () => finish(tokenRef.current);

    const handleError = () => {
      setError(
        "Audio file not found. Please check the file is properly deployed.",
      );
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      tokenRef.current += 1;
      audio.pause();
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audioRef.current = null;
    };
  }, [finish]);

  const start = useCallback((from, to, mode, onTick, onEnd) => {
    const audio = audioRef.current;
    if (!audio) return;

    tokenRef.current += 1;
    if (audio.error) audio.load();

    tickRef.current = onTick || null;
    segmentEndRef.current = to ?? null;
    onEndRef.current = onEnd || null;
    modeRef.current = mode;
    setError(null);

    const target = Number.isFinite(from) ? from : 0;
    if (audio.readyState >= 1) {
      audio.currentTime = target;
    } else {
      pendingSeekRef.current = target;
      audio.load();
    }

    const promise = audio.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch((playError) => {
        if (playError?.name === "AbortError") return;
        setError(
          playError?.name === "NotAllowedError"
            ? "Press play to allow audio playback."
            : "Could not play the recitation. Please try again.",
        );
        setIsPlaying(false);
      });
    }
    setIsPlaying(true);
  }, []);

  const playSegment = useCallback(
    (from, to, { onTick, onEnd } = {}) => start(from, to, "segment", onTick, onEnd),
    [start],
  );

  const playAll = useCallback(
    ({ onTick, onEnd } = {}) => start(0, null, "all", onTick, onEnd),
    [start],
  );

  const stop = useCallback(() => {
    tokenRef.current += 1;
    modeRef.current = null;
    tickRef.current = null;
    segmentEndRef.current = null;
    onEndRef.current = null;
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { isPlaying, error, playSegment, playAll, stop, clearError };
}
