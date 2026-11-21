import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import NamesExplorer from "../components/NamesExplorer";
import NowPlayingBar from "../components/NowPlayingBar";
import { OrnamentDivider } from "../components/Ornament";
import "../styles/explorer.css";
import "../styles/pages.css";

export default function Names() {
  return (
    <>
      <div className="names-page page-enter">
        <header className="page-head container">
          <p className="eyebrow">The Complete Collection</p>
          <h1>The 99 Beautiful Names</h1>
          <p className="page-sub">
            Search by Arabic, transliteration or meaning. Open any name to see
            it in the slideshow, or play its recitation right here.
          </p>
          <div className="page-head-actions">
            <Link to="/recitation" className="btn btn-gold btn-sm">
              <Play size={15} fill="currentColor" aria-hidden="true" />
              Open the slideshow
            </Link>
          </div>
          <OrnamentDivider className="page-ornament" />
        </header>

        <div className="container">
          <NamesExplorer />
        </div>
      </div>

      <NowPlayingBar />
    </>
  );
}
