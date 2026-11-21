import { Link } from "react-router-dom";
import { ChevronDown, Headphones, LayoutGrid, Play } from "lucide-react";
import { OrnamentDivider, StarOrnament } from "./Ornament";
import Particles from "./Particles";
import "../styles/home.css";

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-halo" aria-hidden="true" />
      <Particles count={22} />
      <div className="container hero-inner">
        <p className="hero-bismillah arabic" lang="ar" dir="rtl">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>

        <div className="hero-arch">
          <span className="arch-ornament arch-ornament-top" aria-hidden="true">
            <StarOrnament size={30} />
          </span>
          <span className="arch-ornament arch-ornament-bottom" aria-hidden="true">
            <StarOrnament size={18} />
          </span>

          <div className="hero-content">
            <p className="hero-kicker">
              <span className="kicker-line" aria-hidden="true" />
              A journey through the Divine Names
              <span className="kicker-line" aria-hidden="true" />
            </p>

            <h1 className="hero-heading" id="hero-title">
              <span className="hero-arabic arabic gold-text" lang="ar" dir="rtl">
                أَسْمَاءُ اللَّهِ الْحُسْنَى
              </span>
              <span className="hero-title">The 99 Beautiful Names of Allah</span>
            </h1>

            <OrnamentDivider className="hero-divider" />

            <p className="hero-copy">
              Enter a quiet sanctuary of remembrance. Listen to each name, dwell
              on its meaning, and let the beauty of the Divine Names soften the
              heart — one name at a time.
            </p>

            <div className="hero-actions">
              <Link to="/recitation" className="btn btn-gold">
                <Play size={17} fill="currentColor" aria-hidden="true" />
                Start Recitation
              </Link>
              <Link to="/names" className="btn btn-ghost">
                <LayoutGrid size={17} aria-hidden="true" />
                Explore All Names
              </Link>
            </div>
          </div>
        </div>

        <div className="hero-meta" aria-label="Experience highlights">
          <span>
            <Headphones size={14} aria-hidden="true" /> Audio-synchronised
          </span>
          <span className="meta-dot" aria-hidden="true" />
          <span>Arabic · English · Urdu</span>
          <span className="meta-dot" aria-hidden="true" />
          <span>99 names</span>
        </div>
      </div>

      <a href="#benefits" className="scroll-cue" aria-label="Scroll to learn about the Names">
        <span>Discover</span>
        <ChevronDown size={17} aria-hidden="true" />
      </a>
    </section>
  );
}
