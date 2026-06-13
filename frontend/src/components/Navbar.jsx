import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, Zap, LayoutDashboard, FileText, Map, Mic, MessageCircle } from "lucide-react";
import { useApp } from "../context/AppContext";

const navLinks = [
  { to: "/", label: "Home",       icon: Zap },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/resume",    label: "Resume",    icon: FileText },
  { to: "/roadmap",   label: "Roadmap",   icon: Map },
  { to: "/interview", label: "Interview", icon: Mic },
  { to: "/chat",      label: "Mentor",    icon: MessageCircle },
];

export default function Navbar() {
  const { darkMode, setDarkMode } = useApp();
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b" style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}>
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg" style={{ color: "var(--brand)" }}>
          <Zap size={20} fill="currentColor" />
          Placementor AI
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.slice(1).map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                color: pathname === to ? "var(--brand)" : "var(--text-secondary)",
                background: pathname === to ? "var(--bg-tertiary)" : "transparent",
              }}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg transition-colors"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
