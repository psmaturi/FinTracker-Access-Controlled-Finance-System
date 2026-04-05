import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";
import "./Header.css";

function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Finance Dashboard</h1>
        <div className="header-right">
          <div className="header-date">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
            {theme === "light" ? <FiMoon className="theme-icon" /> : <FiSun className="theme-icon" />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
