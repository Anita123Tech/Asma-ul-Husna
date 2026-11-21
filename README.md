# Asma ul Husna Review

A local React/Vite version of the reference All Names Review page, plus a live Namaz Timings page. There are no Learning or Challenge modes.

## What is included

- All 99 names with click-to-play pronunciation.
- Play All Names with live highlighting and auto-scroll.
- Concluding prayer with click-to-play lines.
- Live Namaz Timings for Kot Radha Kishan, Punjab, Pakistan.
- Six prayer windows: Tahajjud, Fajr, Zahur, Asar, Maghrib, and Isha.
- Arabic/English language toggle on both pages.
- The supplied continuous MP3 recitation, served locally from `public/audio/asma-ul-husna.mp3`.
- Exact name, prayer, and timing data extracted from the reference site.

## Namaz timings

Timings come from the Aladhan API at request time using coordinates `31.1707, 74.1013`, `method=1` (University of Islamic Sciences, Karachi), and `school=1` (Hanafi Asr), which matches the customary Pakistan convention.

The page shows the azan/start time, latest end time, validity duration, current-prayer status, Hijri date, and a live countdown to the next azan. Calculated times can differ from local mosque announcements; follow your local mosque when available.

## Audio

All playback uses one shared `HTMLAudioElement` in `src/hooks/useSegmentAudio.js`. Segment starts and ends are stored in `src/data/referenceData.js` and were copied from the reference site rather than guessed.

The MP3 used by the app is:

```text
public/audio/asma-ul-husna.mp3
```

Use only recordings you have permission to distribute.

## Commands

```bash
npm install
npm run dev
```

Production build and preview:

```bash
npm run build
npm run preview
```

Checks:

```bash
npm run lint
npm run verify:audio
```

`npm run verify:audio` confirms that the continuous MP3 exists and that all 99 timing entries are numeric and valid.

## Main files

```text
src/App.jsx
src/data/referenceData.js
src/hooks/useSegmentAudio.js
src/pages/Review.jsx
src/pages/PrayerTimes.jsx
src/components/ReferenceNameCard.jsx
public/audio/asma-ul-husna.mp3
```

Routes are hash-based:

```text
#/                  Review page
#/namaz-times       Namaz Timings page
```

The previous Home, Game, and cinematic slideshow files remain in the project but are no longer rendered by `App.jsx`.
