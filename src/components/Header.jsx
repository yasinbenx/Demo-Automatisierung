import { NavLink } from "react-router-dom";
import config from "../config.js";

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink to="/" className="brand">
          <span className="brand__logo">{config.logoEmoji}</span>
          <span className="brand__text">
            <strong>{config.businessName}</strong>
            <small>{config.businessType}</small>
          </span>
        </NavLink>
        <nav className="site-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            Termin buchen
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
            Inhaber-Dashboard
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
