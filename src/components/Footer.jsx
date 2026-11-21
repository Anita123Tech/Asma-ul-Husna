import { Link } from "react-router-dom";
import { LogoMark, StarOrnament } from "./Ornament";
import "../styles/footer.css";

const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-glow" aria-hidden="true" />
      <div className="container footer-inner">
        <div className="footer-brand">
          <Link to="/" className="footer-logo" aria-label="Asma ul Husna — home">
            <LogoMark size={42} />
            <span>
              <strong>Asma ul Husna</strong>
              <small>The 99 Beautiful Names of Allah</small>
            </span>
          </Link>
          <p className="footer-bismillah arabic">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
          <p className="footer-copy">
            A quiet space for reflection, remembrance, and drawing closer to the
            Most Merciful.
          </p>
        </div>

        <nav className="footer-nav" aria-label="Footer navigation">
          <h2>Explore</h2>
          <Link to="/">Home</Link>
          <Link to="/recitation">Slideshow Recitation</Link>
          <Link to="/names">All 99 Names</Link>
        </nav>

        <div className="footer-verse">
          <div className="footer-verse-mark">
            <StarOrnament size={22} />
          </div>
          <blockquote>
            <p className="arabic">
              وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا
            </p>
            <footer>
              “And to Allah belong the most beautiful names, so invoke Him by
              them.”
              <cite>— Qur’an 7:180</cite>
            </footer>
          </blockquote>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© {YEAR} Asma ul Husna. Created for remembrance and reflection.</p>
        <p className="footer-audio-note">
          Arabic recitations are served from the local <code>/audio</code> folder.
          See the README to add licensed recordings.
        </p>
      </div>
    </footer>
  );
}
