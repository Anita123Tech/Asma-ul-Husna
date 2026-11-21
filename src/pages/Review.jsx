import { useCallback, useEffect, useRef, useState } from "react";
import { Clock3, Languages } from "lucide-react";
import { Link } from "react-router-dom";
import ReferenceNameCard from "../components/ReferenceNameCard";
import { AUDIO_PATH, NAMES, PRAYER } from "../data/referenceData";
import { useSegmentAudio } from "../hooks/useSegmentAudio";

export default function Review({ language, onToggleLanguage }) {
  const ar = language === "ar";
  const [currentNameId, setCurrentNameId] = useState(null);
  const [currentPrayerId, setCurrentPrayerId] = useState(null);
  const [missingError, setMissingError] = useState(null);
  const lastScrollRef = useRef("");
  const { isPlaying, error, playSegment, playAll, stop } = useSegmentAudio();

  useEffect(() => {
    let active = true;
    fetch(AUDIO_PATH, { method: "HEAD" })
      .then((response) => {
        if (active && !response.ok) {
          setMissingError(
            "Audio file not found. Please check the file is properly deployed.",
          );
        }
      })
      .catch(() => {
        if (active) {
          setMissingError(
            "Audio file not found. Please check the file is properly deployed.",
          );
        }
      });
    return () => {
      active = false;
      stop();
    };
  }, [stop]);

  const scrollToActive = useCallback((kind, id) => {
    const key = `${kind}-${id}`;
    if (!id || lastScrollRef.current === key) return;
    lastScrollRef.current = key;
    const element = document.getElementById(
      kind === "name" ? `name-card-${id}` : `prayer-line-${id}`,
    );
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
      inline: "center",
    });
  }, []);

  const handleTick = useCallback(
    (time) => {
      const activeName = NAMES.find(
        (name) => time >= name.audioStart && time <= name.audioEnd,
      );
      const activePrayer = PRAYER.find(
        (line) => time >= line.audioStart && time <= line.audioEnd,
      );

      setCurrentNameId(activeName?.id ?? null);
      setCurrentPrayerId(activePrayer?.id ?? null);
      if (activeName) scrollToActive("name", activeName.id);
      if (activePrayer) scrollToActive("prayer", activePrayer.id);
    },
    [scrollToActive],
  );

  const clearHighlight = useCallback(() => {
    setCurrentNameId(null);
    setCurrentPrayerId(null);
    lastScrollRef.current = "";
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      stop();
      clearHighlight();
      return;
    }
    setMissingError(null);
    lastScrollRef.current = "";
    playAll({ onTick: handleTick, onEnd: clearHighlight });
  };

  const playName = (name) => {
    stop();
    setMissingError(null);
    setCurrentPrayerId(null);
    setCurrentNameId(name.id);
    scrollToActive("name", name.id);
    playSegment(name.audioStart, name.audioEnd, { onEnd: clearHighlight });
  };

  const playPrayer = (line) => {
    stop();
    setMissingError(null);
    setCurrentNameId(null);
    setCurrentPrayerId(line.id);
    scrollToActive("prayer", line.id);
    playSegment(line.audioStart, line.audioEnd, { onEnd: clearHighlight });
  };

  const activeName = NAMES.find((name) => name.id === currentNameId);
  const activePrayer = PRAYER.find((line) => line.id === currentPrayerId);
  const displayError = missingError || error;

  return (
    <div className="w-full">
      <div className="relative w-screen max-w-none mx-auto mb-8 aspect-[1920/538] bg-[#023900] overflow-hidden">
        <img
          src="/images/home-image.jpeg"
          alt={ar ? "أسماء الله الحسنى" : "Asmaa Allah Al Husna"}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Link
            to="/namaz-times"
            aria-label={ar ? "أوقات الصلاة" : "Namaz Timings"}
            className="inline-flex items-center gap-2 rounded-full bg-[#064833]/90 border border-[#bd820b]/60 px-3 py-2 hover:bg-[#075c40] transition-colors"
          >
            <Clock3 className="w-5 h-5 text-[#ffe77d]" />
            <span className="hidden sm:inline text-sm font-semibold">
              {ar ? "أوقات الصلاة" : "Namaz Timings"}
            </span>
          </Link>
          <button
            type="button"
            onClick={onToggleLanguage}
            aria-label={ar ? "تبديل اللغة" : "Toggle Language"}
            className="p-2 rounded-full bg-[#064833]/90 border border-[#bd820b]/60 hover:bg-[#075c40] transition-colors"
          >
            <Languages className="w-6 h-6 text-[#ffe77d]" />
          </button>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <button
            type="button"
            onClick={togglePlay}
            className="px-6 py-3 rounded-lg font-semibold border border-[#ffe77d]/70 bg-white hover:bg-slate-100 shadow-lg shadow-[#e0b145]/20 backdrop-blur-sm transition-all duration-200 touch-manipulation"
          >
            <span className="gradient-text play-button-text">
              {isPlaying
                ? ar
                  ? "إيقاف التشغيل"
                  : "Stop Playing"
                : ar
                  ? "تشغيل جميع الأسماء"
                  : "Play All Names"}
            </span>
          </button>

          {displayError && (
            <div role="alert" className="mt-4 p-3 bg-red-950/40 rounded-lg border border-red-400/40">
              <p className="text-center text-sm">⚠️ {displayError}</p>
              <p className="text-center text-xs mt-1">
                {ar
                  ? "تحقق من اتصال الإنترنت وأعد المحاولة"
                  : "Check your internet connection and try again"}
              </p>
            </div>
          )}

          {isPlaying && (currentNameId || currentPrayerId) && (
            <div aria-live="polite" className="mt-4 p-3 bg-[#7d4c00]/35 rounded-lg border border-[#ffe77d]/35">
              <p className="text-center text-sm mb-1">
                {ar ? "يتم تشغيل الآن:" : "Now Playing:"}
              </p>
              <p className="text-center font-bold font-arabic">
                {ar
                  ? activeName?.arabic || activePrayer?.arabic
                  : activeName?.transliteration || activePrayer?.transliteration}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 justify-items-center">
          {NAMES.map((name) => (
            <div key={name.id} id={`name-card-${name.id}`}>
              <ReferenceNameCard
                name={name}
                language={language}
                isClickable
                isHighlighted={currentNameId === name.id}
                onClick={() => playName(name)}
              />
            </div>
          ))}
        </div>

        <div className="mt-12 mb-8 border-t border-[#bd820b]/25 pt-10">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-amber-400 mb-2">
              {ar ? "الدعاء الختامي" : "Concluding Prayer"}
            </h2>
            <p className="text-sm text-slate-400 mb-2">
              {ar
                ? "الدعاء الذي يُتلى في نهاية الأسماء الحسنى"
                : "The prayer recited at the end of the Beautiful Names"}
            </p>
            <p className="text-xs text-slate-500">
              {ar
                ? "💡 انقر على أي سطر من الدعاء لسماع تلاوته"
                : "💡 Click on any prayer line to hear its recitation"}
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {PRAYER.map((line) => (
              <div
                key={line.id}
                id={`prayer-line-${line.id}`}
                onClick={() => playPrayer(line)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    playPrayer(line);
                  }
                }}
                className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer hover:shadow-lg ${
                  currentPrayerId === line.id
                    ? "bg-[#7d4c00]/50 border-[#ffe77d] shadow-lg shadow-[#ffe77d]/20 ring-2 ring-[#ffe77d]/50"
                    : "bg-[#064833]/70 border-[#bd820b]/40 hover:bg-[#075c40]/80 hover:border-[#ffe77d]/70"
                }`}
              >
                <div className="text-center">
                  <p className="text-2xl font-arabic text-amber-300 mb-2" dir="rtl" lang="ar">
                    {line.arabic}
                  </p>
                  <p className="text-lg text-slate-300 italic mb-1">
                    {line.transliteration}
                  </p>
                  {language === "en" && (
                    <p className="text-sm text-slate-400">{line.english}</p>
                  )}
                  {currentPrayerId === line.id && (
                    <div className="mt-2">
                      <span className="inline-block animate-pulse text-[#ffe77d]">🎵</span>
                    </div>
                  )}
                <div className="mt-2 text-xs text-slate-500">
                  <span className="gradient-text">
                    {ar ? "انقر للاستماع" : "Click to listen"}
                  </span>
                </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
