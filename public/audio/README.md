# Audio recordings

`asma-ul-husna.mp3` is the local recitation track used by Home, Game, and Review. It is served from `public/audio/asma-ul-husna.mp3`.

Playback is handled by `src/hooks/useSegmentAudio.js`, which seeks into the single continuous track using the verified start/end times in `src/data/referenceData.js`. The app does not synthesise speech in the browser.

The older individual `NN-slug.mp3` recordings remain in this folder for reference only.

To verify the track and timing data:

```bash
npm run verify:audio
```

Use only recordings you have permission or a licence to distribute.
