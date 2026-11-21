const DIACRITICS =
  /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g;

export function normalizeText(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(DIACRITICS, "")
    .replace(/[\u0622\u0623\u0625]/g, "\u0627")
    .replace(/\u0649/g, "\u064A")
    .replace(/\u0629/g, "\u0647")
    .replace(/[^a-z0-9\u0600-\u06FF\s]/g, "");
}

export function filterNames(names, query) {
  const needle = normalizeText(query);
  if (!needle) return names;

  return names.filter((name) => {
    const haystack = normalizeText(
      `${name.arabic} ${name.transliteration} ${name.englishMeaning} ${name.urduMeaning}`,
    );
    return haystack.includes(needle);
  });
}
