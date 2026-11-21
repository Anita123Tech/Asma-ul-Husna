import { Languages } from "lucide-react";

export default function ReferenceHeader({ language, title, onToggleLanguage }) {
  const ar = language === "ar";

  return (
    <header className="w-full p-4 bg-slate-800/50 rounded-lg shadow-lg flex justify-between items-center border border-slate-700">
      <button
        type="button"
        onClick={onToggleLanguage}
        aria-label={ar ? "تبديل اللغة" : "Toggle Language"}
        className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors"
      >
        <Languages className="w-6 h-6 text-slate-300" />
      </button>

      <h1 className="text-2xl font-bold text-amber-400">{title}</h1>

      <div className="w-10" aria-hidden="true" />
    </header>
  );
}
