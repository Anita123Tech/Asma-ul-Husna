import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, Play, X } from "lucide-react";
import { LogoMark } from "./Ornament";
import "../styles/navbar.css";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/recitation", label: "Recitation" },
  { to: "/names", label: "The Names" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className={`navbar ${scrolled || open ? "is-scrolled" : ""}`}>
      <div className="container navbar-inner">
        <Link to="/" className="brand" aria-label="Asma ul Husna — home">
          <LogoMark size={38} />
          <span className="brand-text">
            <strong>Asma ul Husna</strong>
            <small>The 99 Beautiful Names</small>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Primary navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? "nav-link is-active" : "nav-link")}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <Link to="/recitation" className="btn btn-gold btn-sm nav-cta">
            <Play size={15} strokeWidth={2.2} aria-hidden="true" />
            Begin Recitation
          </Link>
          <button
            type="button"
            className="nav-toggle"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        className={`mobile-menu ${open ? "is-open" : ""}`}
        hidden={!open}
      >
        <nav className="mobile-menu-nav" aria-label="Mobile navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? "mobile-link is-active" : "mobile-link")}
            >
              {link.label}
            </NavLink>
          ))}
          <Link to="/recitation" className="btn btn-gold mobile-cta">
            <Play size={16} aria-hidden="true" />
            Begin Recitation
          </Link>
        </nav>
      </div>
    </header>
  );
}
