import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Clock3, Languages, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

const PRAYER_API_BASE = "https://api.aladhan.com/v1/timings";
const LATITUDE = 31.1707;
const LONGITUDE = 74.1013;
const TIME_ZONE = "Asia/Karachi";

function getKarachiDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: TIME_ZONE,
  })
    .format(date)
    .replace(/\//g, "-");
}

function getKarachiClock(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZone: TIME_ZONE,
  }).formatToParts(date);

  const value = (type) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    minutes: value("hour") * 60 + value("minute"),
    seconds: value("second"),
  };
}

function toMinutes(time = "") {
  const [hour, minute] = time.split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return 0;
  return hour * 60 + minute;
}

function formatTime(minutes) {
  const normalized = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const hour24 = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const hour12 = hour24 % 12 || 12;
  const period = hour24 < 12 ? "AM" : "PM";
  const nextDay = minutes >= 1440 ? " next day" : "";
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}${nextDay}`;
}

function formatDuration(minutes) {
  const total = Math.max(0, Math.round(minutes));
  const hours = Math.floor(total / 60);
  const remainder = total % 60;
  return hours ? `${hours}h ${remainder}m` : `${remainder}m`;
}

function formatCountdown(seconds) {
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainder = total % 60;
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function buildPrayers(timings, ar) {
  const fajr = toMinutes(timings.Fajr);
  const sunrise = toMinutes(timings.Sunrise);
  const dhuhr = toMinutes(timings.Dhuhr);
  const asr = toMinutes(timings.Asr);
  const maghrib = toMinutes(timings.Maghrib);
  const isha = toMinutes(timings.Isha);
  const lastThird = toMinutes(timings.Lastthird);

  return [
    {
      id: "tahajjud",
      name: ar ? "التهجد" : "Tahajjud",
      subtitle: ar ? "بعد عشاء، افضل وقت" : "After Isha, best time",
      start: lastThird,
      end: fajr,
      startCaption: ar ? "افضل وقت" : "Best time",
      endCaption: ar ? "فجر تک" : "Until Fajr",
      note: ar
        ? "اس کی اذان نہیں ہوتی۔ عشاء کے بعد اٹھ کر آخری تہائی رات میں پڑھنا افضل ہے۔"
        : "No azan. Pray after Isha; the last third of the night is the recommended time.",
      hasAzan: false,
    },
    {
      id: "fajr",
      name: ar ? "الفجر" : "Fajr",
      subtitle: ar ? "صبح کی نماز" : "Dawn prayer",
      start: fajr,
      end: sunrise,
      startCaption: ar ? "اذان" : "Azan",
      endCaption: ar ? "طلوع آفتاب تک" : "Until sunrise",
      note: ar
        ? "فجر کی اذان سے لے کر طلوع آفتاب سے پہلے تک پڑھی جا سکتی ہے۔"
        : "Valid from the Fajr azan until just before sunrise.",
      hasAzan: true,
    },
    {
      id: "zahur",
      name: ar ? "الظہر" : "Zahur",
      subtitle: ar ? "دوپہر کی نماز" : "Midday prayer",
      start: dhuhr,
      end: asr,
      startCaption: ar ? "اذان" : "Azan",
      endCaption: ar ? "عصر تک" : "Until Asar",
      note: ar
        ? "ظہر کی اذان سے عصر کے داخلے تک وقت رہتا ہے۔"
        : "Valid from the Zahur azan until Asar time begins.",
      hasAzan: true,
    },
    {
      id: "asar",
      name: ar ? "العصر" : "Asar",
      subtitle: ar ? "عصر کی نماز (حنفی)" : "Afternoon prayer (Hanafi)",
      start: asr,
      end: maghrib,
      startCaption: ar ? "اذان" : "Azan",
      endCaption: ar ? "مغرب تک" : "Until Maghrib",
      note: ar
        ? "یہاں حنفی سایہ (دوگنا) کے مطابق عصر کا وقت دکھایا گیا ہے۔"
        : "Uses the Hanafi shadow rule customary in Pakistan.",
      hasAzan: true,
    },
    {
      id: "maghrib",
      name: ar ? "المغرب" : "Maghrib",
      subtitle: ar ? "غروب کے بعد" : "After sunset",
      start: maghrib,
      end: isha,
      startCaption: ar ? "اذان" : "Azan",
      endCaption: ar ? "عشاء تک" : "Until Isha",
      note: ar
        ? "غروب آفتاب کے بعد مغرب کی اذان سے عشاء تک پڑھی جا سکتی ہے۔"
        : "Valid from the Maghrib azan after sunset until Isha begins.",
      hasAzan: true,
    },
    {
      id: "isha",
      name: ar ? "العشاء" : "Isha",
      subtitle: ar ? "رات کی نماز" : "Night prayer",
      start: isha,
      end: fajr + 1440,
      startCaption: ar ? "اذان" : "Azan",
      endCaption: ar ? "اگلی فجر تک" : "Until next Fajr",
      note: ar
        ? "عشاء کی اذان سے اگلی فجر کی اذان تک وقت رہتا ہے۔"
        : "Valid from the Isha azan until the next Fajr azan.",
      hasAzan: true,
    },
  ];
}

function isPrayerActive(prayer, clock) {
  return (
    (clock >= prayer.start && clock < prayer.end) ||
    (clock + 1440 >= prayer.start && clock + 1440 < prayer.end)
  );
}

function secondsUntilStart(start, clock) {
  const now = clock.minutes * 60 + clock.seconds;
  const target = start * 60;
  return target > now ? target - now : target + 86400 - now;
}

export default function PrayerTimes({ language, onToggleLanguage }) {
  const ar = language === "ar";
  const [clock, setClock] = useState(getKarachiClock);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dataRef = useRef(null);
  const requestRef = useRef(false);

  const fetchTimings = useCallback(async () => {
    if (requestRef.current) return;
    requestRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const url = `${PRAYER_API_BASE}/${getKarachiDate()}?latitude=${LATITUDE}&longitude=${LONGITUDE}&method=1&school=1`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const payload = await response.json();
      const timings = payload?.data?.timings;
      const required = [
        "Fajr",
        "Sunrise",
        "Dhuhr",
        "Asr",
        "Maghrib",
        "Isha",
        "Lastthird",
      ];

      if (!timings || required.some((key) => !timings[key])) {
        throw new Error("Incomplete timing data received");
      }

      setData(payload.data);
    } catch (caught) {
      setError(caught?.message || "Unable to load prayer times");
    } finally {
      requestRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(fetchTimings, 0);
    return () => window.clearTimeout(timer);
  }, [fetchTimings]);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClock(getKarachiClock());
      const current = dataRef.current;
      if (current && current.date?.gregorian?.date !== getKarachiDate()) {
        fetchTimings();
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [fetchTimings]);

  const prayers = data?.timings ? buildPrayers(data.timings, ar) : [];

  const nextAzan =
    prayers
      .filter((prayer) => prayer.hasAzan)
      .map((prayer) => ({
        ...prayer,
        secondsAway: secondsUntilStart(prayer.start, clock),
      }))
      .sort((a, b) => a.secondsAway - b.secondsAway)[0] ?? null;

  return (
    <div className="w-full">
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#bd820b]/60 bg-[#064833]/90 px-4 py-2 transition-colors hover:bg-[#075c40]"
            >
              <ArrowLeft className="h-4 w-4 text-[#ffe77d]" />
              <span className="text-sm font-semibold">
                {ar ? "ناموں پر واپس" : "Back to Names"}
              </span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                {ar ? "أوقات الصلاة" : "Namaz Timings"}
              </h1>
              <p className="text-sm opacity-80">
                {ar
                  ? "کوٹ رادھا کشن، پنجاب، پاکستان"
                  : "Kot Radha Kishan, Punjab, Pakistan"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchTimings}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-[#ffe77d]/60 bg-[#064833]/90 px-4 py-2 transition-colors hover:bg-[#075c40] disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 text-[#ffe77d] ${loading ? "animate-spin" : ""}`} />
              <span className="text-sm font-semibold">
                {ar ? "رفریش" : "Refresh"}
              </span>
            </button>
            <button
              type="button"
              onClick={onToggleLanguage}
              aria-label={ar ? "تبديل اللغة" : "Toggle Language"}
              className="rounded-full border border-[#bd820b]/60 bg-[#064833]/90 p-2 transition-colors hover:bg-[#075c40]"
            >
              <Languages className="h-5 w-5 text-[#ffe77d]" />
            </button>
          </div>
        </div>

        {loading && !data && (
          <div
            role="status"
            className="mb-6 flex items-center justify-center gap-3 rounded-xl border border-[#bd820b]/40 bg-[#064833]/70 p-5 text-sm"
          >
            <RefreshCw className="h-4 w-4 animate-spin text-[#ffe77d]" />
            <span>{ar ? "لائیو اوقات لوڈ ہو رہے ہیں..." : "Loading live timings..."}</span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-400/40 bg-red-950/40 p-4"
          >
            <p className="text-sm font-semibold">
              {ar ? "اوقات لوڈ نہیں ہو سکے" : "Could not load timings"}
            </p>
            <p className="mt-1 text-xs opacity-80">{error}</p>
            <button
              type="button"
              onClick={fetchTimings}
              className="mt-3 rounded-lg border border-[#ffe77d]/60 bg-white px-3 py-1.5 text-xs font-semibold"
            >
              <span className="gradient-text">{ar ? "دوبارہ کوشش" : "Try again"}</span>
            </button>
          </div>
        )}

        {data?.date && (
          <div className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-[#bd820b]/40 bg-[#064833]/70 p-4 sm:grid-cols-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider opacity-70">
                {ar ? "تاریخ" : "Date"}
              </p>
              <p className="text-sm font-bold">
                {data.date.gregorian.day} {data.date.gregorian.month.en}{" "}
                {data.date.gregorian.year}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider opacity-70">
                {ar ? "ہجری" : "Hijri"}
              </p>
              <p className="text-sm font-bold" dir="rtl" lang="ar">
                {data.date.hijri.day} {data.date.hijri.month.ar} {data.date.hijri.year}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider opacity-70">
                {ar ? "حساب" : "Calculation"}
              </p>
              <p className="text-sm font-bold">
                {ar ? "کراچی · حنفی عصر" : "Karachi · Hanafi Asr"}
              </p>
            </div>
          </div>
        )}

        {nextAzan && (
          <div className="mb-8 rounded-2xl border border-[#ffe77d]/50 bg-[#7d4c00]/35 p-5 text-center">
            <p className="text-[11px] uppercase tracking-widest opacity-80">
              {ar ? "اگلی اذان" : "Next azan"}
            </p>
            <p className="mt-1 text-xl font-bold">
              {nextAzan.name} · {formatTime(nextAzan.start)}
            </p>
            <p className="mt-1 text-sm font-mono">{formatCountdown(nextAzan.secondsAway)}</p>
            <p className="mt-2 text-xs opacity-70">
              {ar ? "موجودہ وقت" : "Pakistan time"}: {formatTime(clock.minutes)} PKT
            </p>
          </div>
        )}

        {prayers.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {prayers.map((prayer) => {
              const active = isPrayerActive(prayer, clock.minutes);
              return (
                <article
                  key={prayer.id}
                  className={`rounded-2xl border p-5 transition-all duration-300 ${
                    active
                      ? "border-[#ffe77d] bg-[#7d4c00]/45 shadow-lg shadow-[#ffe77d]/20 ring-2 ring-[#ffe77d]/40"
                      : "border-[#bd820b]/40 bg-[#064833]/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold">{prayer.name}</h2>
                      <p className="text-xs opacity-75">{prayer.subtitle}</p>
                    </div>
                    {active && (
                      <span className="rounded-full border border-[#ffe77d]/60 bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        <span className="gradient-text">
                          {ar ? "ابھی" : "Live"}
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-[#bd820b]/30 bg-[#023900]/50 p-3">
                      <p className="text-[10px] uppercase tracking-wider opacity-70">
                        {prayer.startCaption}
                      </p>
                      <p className="mt-1 text-lg font-bold">{formatTime(prayer.start)}</p>
                    </div>
                    <div className="rounded-xl border border-[#bd820b]/30 bg-[#023900]/50 p-3">
                      <p className="text-[10px] uppercase tracking-wider opacity-70">
                        {prayer.endCaption}
                      </p>
                      <p className="mt-1 text-lg font-bold">{formatTime(prayer.end)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs">
                    <Clock3 className="h-3.5 w-3.5 text-[#ffe77d]" />
                    <span>
                      {ar ? "وقت" : "Valid for"} {formatDuration(prayer.end - prayer.start)}
                    </span>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed opacity-75">{prayer.note}</p>
                </article>
              );
            })}
          </div>
        )}

        <p className="mt-8 text-center text-xs leading-relaxed opacity-70">
          {ar
            ? "یہ اوقات حسابی طور پر نکالے گئے ہیں۔ اپنی مقامی مسجد کے اعلان کو ترجیح دیں۔"
            : "These times are calculated. Always follow your local mosque announcement when available."}
        </p>
      </div>
    </div>
  );
}
