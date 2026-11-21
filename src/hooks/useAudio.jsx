import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import names from "../data/names";
import nameTimings from "../data/audioTimings";

const AudioContext = createContext(null);

const LAST_NAME_KEY = "asma-ul-husna:last-name";
const VOLUME_KEY = "asma-ul-husna:volume";
const FULL_AUDIO = "/audio/asma-ul-husna.mp3";
const END_EPSILON = 0.05;

const TIMINGS_READY =
  nameTimings.length === names.length && nameTimings.every((timing) =>
    timing?.status === "verified" &&
    Number.isFinite(timing.start) &&
    Number.isFinite(timing.end) &&
    timing.end > timing.start,
  );

function isVerifiedTiming(timing) {
  return Boolean(
    timing &&
      timing.status === "verified" &&
      Number.isFinite(timing.start) &&
      Number.isFinite(timing.end) &&
      timing.end > timing.start,
  );
}

function getVerifiedTiming(index) {
  const timing = nameTimings[index];
  return isVerifiedTiming(timing) ? timing : null;
}

function findIndexAtTime(time) {
  let active = -1;
  let lastStarted = -1;

  nameTimings.forEach((timing, index) => {
    if (!isVerifiedTiming(timing)) return;
    if (time >= timing.start) lastStarted = index;
    if (time >= timing.start && time < timing.end) active = index;
  });

  return active >= 0 ? active : lastStarted;
}

function readStoredIndex() {
  try {
    const stored = Number(window.localStorage.getItem(LAST_NAME_KEY));
    if (
      Number.isInteger(stored) &&
      stored >= 1 &&
      stored <= names.length &&
      isVerifiedTiming(nameTimings[stored - 1])
    ) {
      return stored - 1;
    }
  } catch {
    /* localStorage can be unavailable in private modes */
  }
  return 0;
}

function readStoredVolume() {
  try {
    const raw = window.localStorage.getItem(VOLUME_KEY);
    if (raw !== null) {
      const stored = Number(raw);
      if (Number.isFinite(stored) && stored >= 0 && stored <= 1) {
        return stored;
      }
    }
  } catch {
    /* ignore */
  }
  return 0.85;
}

export function AudioProvider({ children }) {
  const [index, setIndex] = useState(readStoredIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(readStoredVolume);
  const [muted, setMuted] = useState(false);
  const [mode, setModeState] = useState("continuous");
  const [repeatCurrent, setRepeatCurrent] = useState(false);
  const [repeatAll, setRepeatAll] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const audioRef = useRef(null);
  const indexRef = useRef(index);
  const modeRef = useRef(mode);
  const repeatCurrentRef = useRef(repeatCurrent);
  const repeatAllRef = useRef(repeatAll);
  const volumeRef = useRef(volume);
  const playRequestedRef = useRef(false);
  const pendingSeekRef = useRef(null);
  const endedHandlerRef = useRef(null);
  const boundaryHandlerRef = useRef(null);
  const updateHandlerRef = useRef(null);
  const rafRef = useRef(0);
  const lastProgressRef = useRef(0);

  const persistIndex = useCallback((nextIndex) => {
    try {
      window.localStorage.setItem(LAST_NAME_KEY, String(nextIndex + 1));
    } catch {
      /* ignore */
    }
  }, []);

  const setIndexSafely = useCallback(
    (nextIndex) => {
      if (nextIndex < 0 || nextIndex >= names.length) return;
      indexRef.current = nextIndex;
      setIndex(nextIndex);
      persistIndex(nextIndex);
    },
    [persistIndex],
  );

  const seekAudioTo = useCallback((absoluteTime) => {
    const audio = audioRef.current;
    if (!audio) return;

    const max = Number.isFinite(audio.duration) && audio.duration > 0
      ? audio.duration
      : absoluteTime;
    const target = Math.min(Math.max(absoluteTime, 0), max);

    setCurrentTime(target);
    if (audio.readyState >= 1) {
      audio.currentTime = target;
      pendingSeekRef.current = null;
    } else {
      pendingSeekRef.current = target;
    }
  }, []);

  const updatePlaybackState = useCallback(
    (time, updateTime = true) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (updateTime && Number.isFinite(time)) setCurrentTime(time);
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }

      const nextIndex = findIndexAtTime(time);
      if (nextIndex >= 0 && nextIndex !== indexRef.current) {
        setIndexSafely(nextIndex);
      }
    },
    [setIndexSafely],
  );

  const startPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const timing = getVerifiedTiming(indexRef.current);
    const atEnd = audio.ended ||
      (Number.isFinite(audio.duration) &&
        audio.duration > 0 &&
        audio.currentTime >= audio.duration - END_EPSILON);

    if (atEnd) {
      seekAudioTo(0);
    } else if (
      modeRef.current === "individual" &&
      timing &&
      audio.currentTime >= timing.end - END_EPSILON
    ) {
      seekAudioTo(timing.start);
    }

    playRequestedRef.current = true;
    setHasInteracted(true);
    setError(null);
    setIsLoading(true);

    const promise = audio.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch((playError) => {
        if (playError && playError.name === "AbortError") return;
        setIsLoading(false);
        setIsPlaying(false);
        if (playError && playError.name === "NotAllowedError") {
          setError({
            code: "autoplay",
            message:
              "Your browser paused the recitation. Press play to continue.",
          });
        } else if (playError && playError.name === "NotSupportedError") {
          setError({
            code: "missing",
            message:
              "The recitation file is not available. Add public/audio/asma-ul-husna.mp3 to enable playback.",
          });
        } else {
          setError({
            code: "playback",
            message:
              "The recitation could not be played. Please refresh and try again.",
          });
        }
      });
    }
  }, [seekAudioTo]);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) return;

    if (audio.error) {
      const timing = getVerifiedTiming(indexRef.current);
      pendingSeekRef.current = timing ? timing.start : audio.currentTime;
      audio.load();
    }

    startPlayback();
  }, [startPlayback]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      play();
    } else {
      audio.pause();
    }
  }, [play]);

  const moveToIndex = useCallback(
    (nextIndex, shouldPlay = false) => {
      if (nextIndex < 0 || nextIndex >= names.length) return;

      const audio = audioRef.current;
      const timing = getVerifiedTiming(nextIndex);

      if (audio) {
        if (timing) {
          audio.pause();
          seekAudioTo(timing.start);
        } else if (audio.ended) {
          seekAudioTo(0);
        }
      }

      setIndexSafely(nextIndex);
      setDuration((current) => current || audio?.duration || 0);
      setCompleted(false);
      setError(null);
      setIsLoading(false);
      if (timing) setIsPlaying(false);

      if (shouldPlay && (!audio || audio.paused)) startPlayback();
    },
    [seekAudioTo, setIndexSafely, startPlayback],
  );

  const selectName = useCallback(
    (nextIndex, options = {}) => {
      const { autoplay = false } = options;
      moveToIndex(nextIndex, autoplay);
    },
    [moveToIndex],
  );

  const next = useCallback(
    ({ fromEnded = false } = {}) => {
      const audio = audioRef.current;
      if (!audio) return;

      const isLast = indexRef.current === names.length - 1;
      if (isLast && fromEnded && !repeatAllRef.current) {
        setIsPlaying(false);
        setIsLoading(false);
        setCompleted(true);
        return;
      }

      const wasPlaying = !audio.paused;
      const target = (indexRef.current + 1) % names.length;
      moveToIndex(target, fromEnded || wasPlaying);
    },
    [moveToIndex],
  );

  const previous = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const wasPlaying = !audio.paused;
    const target = (indexRef.current - 1 + names.length) % names.length;
    moveToIndex(target, wasPlaying);
  }, [moveToIndex]);

  const seek = useCallback(
    (time) => {
      const audio = audioRef.current;
      if (!audio || !Number.isFinite(time)) return;

      seekAudioTo(time);
      const nextIndex = findIndexAtTime(time);
      if (nextIndex >= 0 && nextIndex !== indexRef.current) {
        setIndexSafely(nextIndex);
      }
    },
    [seekAudioTo, setIndexSafely],
  );

  const finishCollection = useCallback(() => {
    const audio = audioRef.current;
    audio?.pause();
    if (audio && Number.isFinite(audio.duration)) {
      setCurrentTime(audio.duration);
      setDuration(audio.duration);
    }
    setIsPlaying(false);
    setIsLoading(false);
    setCompleted(true);
  }, []);

  const handleBoundary = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const current = indexRef.current;
    const timing = getVerifiedTiming(current);

    if (repeatCurrentRef.current) {
      seekAudioTo(timing ? timing.start : 0);
      return;
    }

    if (modeRef.current === "individual") {
      audio.pause();
      if (timing) setCurrentTime(timing.end);
      return;
    }

    const nextIndex = findIndexAtTime(audio.currentTime);
    if (nextIndex >= 0 && nextIndex !== current) setIndexSafely(nextIndex);
  }, [seekAudioTo, setIndexSafely]);

  const setVolume = useCallback((nextVolume) => {
    const audio = audioRef.current;
    const clamped = Math.min(Math.max(Number(nextVolume) || 0, 0), 1);
    volumeRef.current = clamped;
    setVolumeState(clamped);
    setMuted(false);
    if (audio) {
      audio.volume = clamped;
      audio.muted = false;
    }
    try {
      window.localStorage.setItem(VOLUME_KEY, String(clamped));
    } catch {
      /* ignore */
    }
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.muted || volumeRef.current === 0) {
      if (volumeRef.current === 0) {
        setVolume(0.85);
        return;
      }
      audio.muted = false;
      setMuted(false);
    } else {
      audio.muted = true;
      setMuted(true);
    }
  }, [setVolume]);

  const setMode = useCallback((nextMode) => {
    if (nextMode !== "individual" && nextMode !== "continuous") return;
    modeRef.current = nextMode;
    setModeState(nextMode);
  }, []);

  const toggleRepeatCurrent = useCallback(() => {
    const nextValue = !repeatCurrentRef.current;
    repeatCurrentRef.current = nextValue;
    setRepeatCurrent(nextValue);
  }, []);

  const toggleRepeatAll = useCallback(() => {
    const nextValue = !repeatAllRef.current;
    repeatAllRef.current = nextValue;
    setRepeatAll(nextValue);
  }, []);

  const restart = useCallback(() => {
    seekAudioTo(0);
    setIndexSafely(0);
    setCompleted(false);
    startPlayback();
  }, [seekAudioTo, setIndexSafely, startPlayback]);

  const retry = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const timing = getVerifiedTiming(indexRef.current);
    pendingSeekRef.current = timing ? timing.start : currentTime;
    audio.load();
    startPlayback();
  }, [currentTime, startPlayback]);

  const dismissCompletion = useCallback(() => setCompleted(false), []);

  const handleEnded = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (repeatCurrentRef.current) {
      const timing = getVerifiedTiming(indexRef.current);
      seekAudioTo(timing ? timing.start : 0);
      startPlayback();
      return;
    }

    if (modeRef.current === "continuous" && repeatAllRef.current) {
      seekAudioTo(0);
      setIndexSafely(0);
      startPlayback();
      return;
    }

    finishCollection();
  }, [finishCollection, seekAudioTo, setIndexSafely, startPlayback]);

  useEffect(() => {
    endedHandlerRef.current = handleEnded;
  }, [handleEnded]);

  useEffect(() => {
    boundaryHandlerRef.current = handleBoundary;
  }, [handleBoundary]);

  useEffect(() => {
    updateHandlerRef.current = updatePlaybackState;
  }, [updatePlaybackState]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.volume = volumeRef.current;
    audio.src = FULL_AUDIO;
    audioRef.current = audio;

    const initialTiming = getVerifiedTiming(indexRef.current);
    pendingSeekRef.current = initialTiming ? initialTiming.start : 0;

    const handlePlaying = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setError(null);
    };
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => {
      if (playRequestedRef.current) setIsLoading(true);
    };
    const handleCanPlay = () => setIsLoading(false);
    const handleLoadedMetadata = () => {
      if (Number.isFinite(audio.duration)) setDuration(audio.duration);
      const target = pendingSeekRef.current;
      if (target !== null) {
        audio.currentTime = Math.min(target, audio.duration || target);
        pendingSeekRef.current = null;
      }
      setCurrentTime(audio.currentTime);
      updateHandlerRef.current?.(audio.currentTime);
    };
    const handleTimeUpdate = () => {
      const time = audio.currentTime;
      updateHandlerRef.current?.(time);

      const timing = getVerifiedTiming(indexRef.current);
      if (!audio.paused && timing && time >= timing.end - END_EPSILON) {
        boundaryHandlerRef.current?.();
      }
    };
    const handleDurationChange = () => {
      if (Number.isFinite(audio.duration)) setDuration(audio.duration);
    };
    const handleError = () => {
      if (!playRequestedRef.current) return;
      setIsPlaying(false);
      setIsLoading(false);
      setError({
        code: "missing",
        message:
          "The recitation file is not available. Add public/audio/asma-ul-husna.mp3 to enable playback.",
      });
    };
    const handleEndedEvent = () => endedHandlerRef.current?.();

    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("error", handleError);
    audio.addEventListener("ended", handleEndedEvent);

    return () => {
      audio.pause();
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("ended", handleEndedEvent);
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(rafRef.current);
      return undefined;
    }

    const tick = (now) => {
      const audio = audioRef.current;
      if (audio && !audio.paused) {
        const time = audio.currentTime;
        const timing = getVerifiedTiming(indexRef.current);

        if (timing && time >= timing.end - END_EPSILON) {
          boundaryHandlerRef.current?.();
        }

        const shouldUpdateTime = now - lastProgressRef.current >= 80;
        if (shouldUpdateTime) lastProgressRef.current = now;
        updateHandlerRef.current?.(time, shouldUpdateTime);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    lastProgressRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying]);

  const value = useMemo(
    () => ({
      names,
      index,
      currentName: names[index],
      isPlaying,
      isLoading,
      error,
      currentTime,
      duration,
      volume,
      muted,
      mode,
      repeatCurrent,
      repeatAll,
      completed,
      hasInteracted,
      activeWordIndex: -1,
      nameTimings,
      timingsReady: TIMINGS_READY,
      timingStatus: TIMINGS_READY ? "ready" : "pending",
      currentTiming: getVerifiedTiming(index),
      progress: duration > 0 ? Math.min(currentTime / duration, 1) : 0,
      overallProgress: (index + 1) / names.length,
      play,
      pause,
      togglePlay,
      selectName,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      setMode,
      toggleRepeatCurrent,
      toggleRepeatAll,
      restart,
      retry,
      dismissCompletion,
    }),
    [
      index,
      isPlaying,
      isLoading,
      error,
      currentTime,
      duration,
      volume,
      muted,
      mode,
      repeatCurrent,
      repeatAll,
      completed,
      hasInteracted,
      play,
      pause,
      togglePlay,
      selectName,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      setMode,
      toggleRepeatCurrent,
      toggleRepeatAll,
      restart,
      retry,
      dismissCompletion,
    ],
  );

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used inside an AudioProvider");
  }
  return context;
}
