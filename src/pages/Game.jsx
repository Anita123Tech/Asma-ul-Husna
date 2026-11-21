import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReferenceHeader from "../components/ReferenceHeader";
import ReferenceNameCard from "../components/ReferenceNameCard";
import { LEVELS, NAMES } from "../data/referenceData";
import { useSegmentAudio } from "../hooks/useSegmentAudio";

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function getLevelNames(level) {
  const range = LEVELS[level];
  return NAMES.slice(range.start, range.end + 1);
}

export default function Game({ language, highScore, onHighScoreChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = location.state?.mode === "CHALLENGE" ? "CHALLENGE" : "LEARNING";
  const ar = language === "ar";

  const [level, setLevel] = useState(0);
  const levelNames = useMemo(() => getLevelNames(level), [level]);
  const previousName = useMemo(() => {
    if (level === 0) return null;
    return NAMES[LEVELS[level - 1].end];
  }, [level]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(mode === "CHALLENGE" ? 3 : null);
  const [selected, setSelected] = useState([]);
  const [options, setOptions] = useState(() => shuffle(levelNames));
  const [feedback, setFeedback] = useState(null);
  const [incorrectId, setIncorrectId] = useState(null);
  const [hintRevealed, setHintRevealed] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);
  const timerRef = useRef(null);
  const { playSegment, stop } = useSegmentAudio();

  useEffect(() => {
    if (score > highScore) onHighScoreChange(score);
  }, [score, highScore, onHighScoreChange]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const expectedNext = levelNames[selected.length];

  const playName = useCallback(
    (name) => {
      playSegment(name.audioStart, name.audioEnd);
    },
    [playSegment],
  );

  const handleNameClick = (name) => {
    if (gameOver || levelComplete || !expectedNext) return;

    clearTimeout(timerRef.current);
    if (navigator.vibrate) navigator.vibrate(50);
    playName(name);

    if (name.id === expectedNext.id) {
      const nextSelected = [...selected, name];
      const finishedLevel = nextSelected.length === levelNames.length;
      setSelected(nextSelected);
      setOptions((current) => current.filter((item) => item.id !== name.id));
      setFeedback("correct");
      setIncorrectId(null);
      setHintRevealed(false);
      setStreak((current) => current + 1);
      setScore((current) => current + 10 + (streak + 1) * 2);

      timerRef.current = setTimeout(() => {
        setFeedback(null);
        if (finishedLevel) setLevelComplete(true);
      }, 500);
    } else {
      setFeedback("incorrect");
      setIncorrectId(name.id);
      setStreak(0);
      setScore((current) => Math.max(0, current - 5));
      if (lives !== null) {
        const nextLives = lives - 1;
        setLives(nextLives);
        if (nextLives <= 0) setGameOver(true);
      }
      timerRef.current = setTimeout(() => {
        setFeedback(null);
        setIncorrectId(null);
      }, 500);
    }
  };

  const handleLevelComplete = () => {
    clearTimeout(timerRef.current);
    stop();
    if (level < LEVELS.length - 1) {
      const nextLevel = level + 1;
      setSelected([]);
      setOptions(shuffle(getLevelNames(nextLevel)));
      setFeedback(null);
      setIncorrectId(null);
      setHintRevealed(false);
      setLevelComplete(false);
      setLevel(nextLevel);
    } else {
      navigate("/");
    }
  };

  const playLevelAudio = () => {
    const first = levelNames[0];
    const last = levelNames[levelNames.length - 1];
    playSegment(first.audioStart, last.audioEnd);
  };

  if (gameOver) {
    return (
      <div className="text-center w-full max-w-lg p-8 bg-slate-800/70 rounded-2xl shadow-2xl backdrop-blur-sm border border-rose-500">
        <h2 className="text-4xl font-bold text-rose-500 mb-4">
          {ar ? "انتهت اللعبة" : "Game Over"}
        </h2>
        <p className="text-lg text-slate-300 mb-6">
          {ar ? "لقد نفذت منك المحاولات" : "You ran out of lives."}
        </p>
        <p className="text-lg text-slate-300 mb-6">
          {ar ? "النتيجة النهائية" : "Final Score"}:{" "}
          <span className="font-bold text-amber-400">{score}</span>
        </p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105"
        >
          {ar ? "العودة للرئيسية" : "Back to Home"}
        </button>
      </div>
    );
  }

  if (levelComplete) {
    return (
      <div className="text-center w-full max-w-lg p-8 bg-slate-800/70 rounded-2xl shadow-2xl backdrop-blur-sm border border-emerald-500">
        <h2 className="text-4xl font-bold text-emerald-400 mb-4">
          {ar ? "اكتمل المستوى" : "Level Complete!"}
        </h2>
        <p className="text-lg text-slate-300 mb-6">
          {ar ? "النتيجة" : "Score"}:{" "}
          <span className="font-bold text-amber-400">{score}</span>
        </p>
        <div className="flex flex-col gap-3 mb-4">
          <button
            type="button"
            onClick={playLevelAudio}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105"
          >
            {ar ? "🔊 استمع للمستوى" : "🔊 Play Level Audio"}
          </button>
          <button
            type="button"
            onClick={handleLevelComplete}
            className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105"
          >
            {ar ? "المستوى التالي" : level === LEVELS.length - 1 ? "Finish" : "Next Level"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      <ReferenceHeader
        language={language}
        level={level + 1}
        score={score}
        streak={streak}
        lives={lives}
        onGoHome={() => navigate("/")}
      />

      <div
        className="my-4 p-3 bg-amber-500/20 rounded-lg border border-amber-500/30 cursor-pointer hover:bg-amber-500/30 transition-all duration-200"
        onClick={() => setHintRevealed((current) => !current)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setHintRevealed((current) => !current);
          }
        }}
      >
        <p className="text-center text-amber-300 text-sm">
          {ar ? "💡 اضغط للحصول على تلميح" : "💡 Click for hint"}:
          <span
            className={`font-bold ml-2 font-arabic transition-all duration-300 ${hintRevealed ? "" : "blur-sm select-none"}`}
          >
            {expectedNext ? (ar ? expectedNext.arabic : expectedNext.transliteration) : ""}
          </span>
        </p>
        {!hintRevealed && (
          <p className="text-center text-amber-400/70 text-xs mt-1">
            {ar ? "اضغط لإظهار الاسم التالي" : "Click to reveal next name"}
          </p>
        )}
      </div>

      {previousName && selected.length === 0 && (
        <div className="my-2 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
          <p className="text-center text-amber-300 text-sm">
            {ar
              ? "🔗 يبدأ هذا المستوى من حيث انتهى المستوى السابق"
              : "🔗 This level continues from where the previous level ended"}
          </p>
        </div>
      )}

      <div className="my-6 min-h-[140px] bg-slate-800/50 p-4 rounded-lg border-2 border-dashed border-slate-700 flex flex-wrap gap-3 justify-center items-center">
        {previousName && selected.length === 0 && (
          <>
            <div className="relative opacity-70">
              <ReferenceNameCard name={previousName} language={language} />
              <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-900 text-xs px-2 py-1 rounded-full font-bold">
                {ar ? "السابق" : "Previous"}
              </div>
            </div>
            <div className="flex items-center text-amber-400 text-2xl animate-pulse">→</div>
          </>
        )}

        {selected.map((name) => (
          <div className="animate-fade-in" key={name.id}>
            <ReferenceNameCard name={name} language={language} isCorrect />
          </div>
        ))}

        {selected.length < levelNames.length && (
          <div
            className={`w-24 h-16 border-2 border-dashed rounded-lg flex items-center justify-center text-slate-500 text-sm ${
              feedback === "correct"
                ? "border-emerald-400 bg-emerald-400/20"
                : feedback === "incorrect"
                  ? "border-rose-400 bg-rose-400/20"
                  : "border-slate-600"
            }`}
          >
            {selected.length + 1}
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-900/50 rounded-lg">
        <h3 className="text-center text-slate-400 mb-4">
          {ar ? "اضغط على الاسم التالي" : "Tap the next name"}
        </h3>
        <div className="flex flex-wrap gap-4 justify-center">
          {options.map((name) => (
            <ReferenceNameCard
              key={name.id}
              name={name}
              language={language}
              isClickable
              isIncorrect={incorrectId === name.id}
              onClick={() => handleNameClick(name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
