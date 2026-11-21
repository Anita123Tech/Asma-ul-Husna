export default function ReferenceNameCard({
  name,
  language,
  isClickable = false,
  isHighlighted = false,
  isCorrect = false,
  isIncorrect = false,
  onClick,
}) {
  const base =
    "relative w-48 h-32 p-3 rounded-lg shadow-lg flex flex-col justify-center items-center text-center bg-[#064833]/90 border border-[#bd820b]/45 text-[#ffe77d] transition-all duration-200 touch-manipulation select-none";
  const interaction = isClickable
    ? "cursor-pointer transform hover:scale-[1.04] hover:shadow-[#ffe77d]/20 hover:border-[#ffe77d]/80"
    : "cursor-default";
  const state = isHighlighted
    ? "ring-4 ring-[#ffe77d]/90 ring-offset-2 ring-offset-[#023900] scale-[1.05] shadow-[#ffe77d]/50 bg-[#7d4c00]/50 border-[#ffe77d]"
    : isCorrect
      ? "ring-4 ring-[#ffe77d]/90 ring-offset-2 ring-offset-[#023900] scale-[1.05] shadow-[#ffe77d]/50 bg-[#7d4c00]/50 border-[#ffe77d]"
      : isIncorrect
        ? "ring-4 ring-rose-400/90 ring-offset-2 ring-offset-[#023900] shadow-rose-400/40 bg-rose-900/40 border-rose-400"
        : "";

  return (
    <div
      className={`${base} ${interaction} ${state}`.trim()}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      {isHighlighted && (
        <span className="absolute top-2 right-2 text-[#ffe77d] animate-bounce">▶️</span>
      )}
      {isClickable && (
        <span className="absolute top-2 right-2 text-[#ffe77d] animate-pulse">🔊</span>
      )}
      <p className="text-3xl font-arabic font-bold text-amber-300" dir="rtl" lang="ar">
        {name.arabic}
      </p>
      <p className="text-sm font-semibold tracking-wider text-slate-300 uppercase">
        {name.transliteration}
      </p>
      {language !== "ar" && <p className="text-xs text-slate-400 mt-1">{name.en}</p>}
    </div>
  );
}
