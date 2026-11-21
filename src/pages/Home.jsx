import { Languages } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home({ language, onSetLanguage, highScore }) {
  const navigate = useNavigate();
  const ar = language === "ar";

  return (
    <div className="relative text-center w-full max-w-md p-8 bg-slate-800/50 rounded-2xl shadow-2xl backdrop-blur-sm border border-slate-700">
      <div className="absolute top-4 right-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => onSetLanguage(ar ? "en" : "ar")}
          aria-label="Toggle Language"
          className="p-3 bg-slate-700/80 hover:bg-slate-600 rounded-full transition-colors"
        >
          <Languages className="w-6 h-6 text-slate-300" />
        </button>
      </div>

      <h1 className="text-5xl font-bold text-amber-400 mb-2 font-arabic" dir="rtl" lang="ar">
        أسماء الله الحسنى
      </h1>
      <p className="text-xl text-slate-300 mb-8">
        {ar ? "لعبة تسلسل أسماء الله الحسنى" : "Asmaa Allah Al Husna Sequence"}
      </p>

      <div className="min-h-[60px] mb-8 flex items-center justify-center">
        <div className="px-5 py-3 rounded-lg bg-slate-700/60 border border-slate-600 text-slate-300">
          <p className="text-sm text-slate-400">{ar ? "وضع الضيف" : "Guest Mode"}</p>
          <p className="font-semibold text-amber-300">{ar ? "اللهم اجعلنا من الذاكرين" : "Learn · Review · Repeat"}</p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <button
          type="button"
          onClick={() => navigate("/game", { state: { mode: "LEARNING" } })}
          className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-lg text-lg transition-transform transform hover:scale-105"
        >
          {ar ? "وضع التعلم" : "Learning Mode"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/game", { state: { mode: "CHALLENGE" } })}
          className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-4 rounded-lg text-lg transition-transform transform hover:scale-105"
        >
          {ar ? "وضع التحدي" : "Challenge Mode"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/review")}
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-4 rounded-lg text-lg transition-transform transform hover:scale-105"
        >
          {ar ? "مراجعة جميع الأسماء" : "Review All Names"}
        </button>
      </div>

      <div className="text-center">
        <p className="text-slate-400 text-sm">
          {ar ? "أعلى نتيجة للضيف" : "Guest High Score"}
        </p>
        <p className="text-amber-400 font-bold text-3xl">{highScore}</p>
      </div>
    </div>
  );
}
