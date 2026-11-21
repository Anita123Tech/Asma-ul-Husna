import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Keyboard, Volume2 } from "lucide-react";
import Slideshow from "../components/Slideshow";
import { OrnamentDivider } from "../components/Ornament";
import { useAudio } from "../hooks/useAudio";
import "../styles/slideshow.css";
import "../styles/pages.css";

const shortcuts = [
  { keys: ["Space"], label: "Play / pause" },
  { keys: ["←"], label: "Previous name" },
  { keys: ["→"], label: "Next name" },
  { keys: ["R"], label: "Repeat current" },
  { keys: ["F"], label: "Fullscreen" },
  { keys: ["M"], label: "Mute" },
];

export default function Recitation() {
  const [searchParams] = useSearchParams();
  const { names, selectName } = useAudio();

  useEffect(() => {
    const requested = Number(searchParams.get("name"));
    if (
      Number.isInteger(requested) &&
      requested >= 1 &&
      requested <= names.length
    ) {
      selectName(requested - 1);
    }
  }, [names.length, searchParams, selectName]);

  return (
    <div className="recitation-page page-enter">
      <header className="page-head container">
        <p className="eyebrow">The Recitation</p>
        <h1>Dwell in the Names</h1>
        <p className="page-sub">
          Continuous recitation by default. One unbroken local MP3 track flows
          from name to name — play, pause, resume, seek, and adjust the volume.
          Name timings are pending until verified.
        </p>
        <OrnamentDivider className="page-ornament" />
      </header>

      <div className="container slideshow-container">
        <Slideshow />
      </div>

      <div className="container recitation-notes">
        <section className="note-card" aria-labelledby="shortcuts-title">
          <span className="note-icon" aria-hidden="true">
            <Keyboard size={20} />
          </span>
          <div>
            <h2 id="shortcuts-title">Keyboard shortcuts</h2>
            <ul className="shortcut-list">
              {shortcuts.map((shortcut) => (
                <li key={shortcut.label}>
                  <span className="shortcut-keys">
                    {shortcut.keys.map((key) => (
                      <kbd key={key}>{key}</kbd>
                    ))}
                  </span>
                  {shortcut.label}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="note-card" aria-labelledby="audio-title">
          <span className="note-icon" aria-hidden="true">
            <Volume2 size={20} />
          </span>
          <div>
            <h2 id="audio-title">About the audio</h2>
            <p>
              The recitation is one continuous local MP3 track in{" "}
              <code>public/audio</code>, so the voice flows from name to name
              without stopping. If the track is missing, the player shows a
              clear message instead of failing silently.
            </p>
            <p>
              Continuous mode follows the whole track. Individual mode stays
              with one name. Name-to-audio timings live in{" "}
              <code>src/data/audioTimings.js</code> and stay pending until they
              are checked against the recording.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
