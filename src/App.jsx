import { useEffect, useState } from "react";
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import PrayerTimes from "./pages/PrayerTimes";
import Review from "./pages/Review";

const LANGUAGE_KEY = "language";

function readLanguage() {
  try {
    return window.localStorage.getItem(LANGUAGE_KEY) === "ar" ? "ar" : "en";
  } catch {
    return "en";
  }
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  const [language, setLanguage] = useState(readLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.body.className = language === "ar" ? "rtl font-arabic" : "ltr";
    try {
      window.localStorage.setItem(LANGUAGE_KEY, language);
    } catch {
      return;
    }
  }, [language]);

  const toggleLanguage = () =>
    setLanguage((current) => (current === "ar" ? "en" : "ar"));

  return (
    <HashRouter>
      <ScrollToTop />
      <div className="min-h-screen w-full transition-all duration-500">
        <main className="w-full flex flex-col items-center justify-center min-h-screen overflow-x-hidden">
          <Routes>
            <Route
              path="/"
              element={<Review language={language} onToggleLanguage={toggleLanguage} />}
            />
            <Route
              path="/namaz-times"
              element={
                <PrayerTimes language={language} onToggleLanguage={toggleLanguage} />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
