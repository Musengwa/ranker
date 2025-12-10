import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/currentUserContext";
import { useEffect, useState } from "react";
import { FaUserCircle, FaHome, FaChartBar, FaVoteYea, FaAward, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";

// --- Improved, Sleek Black Nav CSS ---
const navStyles = `
.ranker-nav-header {
  width: 100vw;
  background: rgba(0, 0, 0, 0.9);
  position: sticky;
  top: 0;
  padding: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.ranker-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100vw;
  max-width: 100vw;
  margin: 0;
  padding: 0.5rem 0.8rem;
  box-sizing: border-box;
}
.ranker-nav-user {
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  background: #18181b;
  border-radius: 2rem;
  padding: 0.35rem 0.8rem;
  border: 1px solid #232336;
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.12);
}
.ranker-nav-links {
  display: flex;
  gap: 0.2rem;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;
}
.ranker-nav-links li {
  display: flex;
}
.ranker-nav-links a {
  color: #e2e8f0;
  font-weight: 500;
  text-decoration: none;
  padding: 0.35rem 0.7rem;
  border-radius: 1.2rem;
  transition: background 0.18s, color 0.18s;
  font-size: 0.98rem;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  background: transparent;
}
.ranker-nav-links a:hover, .ranker-nav-links a:focus {
  background: #232336;
  color: #38bdf8;
  outline: none;
}
.ranker-nav-hamburger {
  display: none;
  background: none;
  border: none;
  font-size: 2.1rem;
  color: #38bdf8;
  cursor: pointer;
  margin-left: 0.5rem;
  z-index: 101;
  transition: color 0.2s;
}
.ranker-nav-hamburger:active {
  color: #0ea5e9;
}
@media (max-width: 700px) {
  .ranker-nav-bar {
    flex-direction: row;
    padding: 0.5rem 0.3rem;
  }
  .ranker-nav-user {
    font-size: 0.85rem;
    padding: 0.25rem 0.5rem;
    margin-right: 0.2rem;
  }
  .ranker-nav-links {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: 70vw;
    max-width: 320px;
    background: linear-gradient(135deg, #18181b 80%, #232336 100%);
    border-left: 2px solid #232336;
    box-shadow: -2px 4px 24px rgba(0,0,0,0.25);
    flex-direction: column;
    gap: 0.1rem;
    padding: 2.5rem 1.2rem 1.2rem 1.2rem;
    border-radius: 1.2rem 0 0 1.2rem;
    display: none;
    z-index: 200;
    animation: slideInNav 0.25s cubic-bezier(.4,2,.6,1) forwards;
  }
  .ranker-nav-links.ranker-nav-open {
    display: flex;
  }
  .ranker-nav-links li {
    margin-bottom: 0.5rem;
  }
  .ranker-nav-links a {
    font-size: 1.05rem;
    padding: 0.7rem 1rem;
    border-radius: 1.5rem;
    background: #18181b;
    box-shadow: 0 1px 8px rgba(0,0,0,0.12);
  }
  .ranker-nav-hamburger {
    display: block;
    position: relative;
    z-index: 201;
  }
  @keyframes slideInNav {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
}
`;

if (typeof document !== "undefined" && !document.getElementById("ranker-nav-css")) {
  const style = document.createElement("style");
  style.id = "ranker-nav-css";
  style.innerHTML = navStyles;
  document.head.appendChild(style);
}

export default function Nav() {
  const { user: currentUser, setUser } = useUser();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);

  // Redirect to login if no user is logged in
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    setUser(null); // Clear the current user
    navigate("/login"); // Redirect to login page
  };

  const handleHamburger = () => setNavOpen(open => !open);
  const closeMenu = () => setNavOpen(false);

  return (
    <header className="ranker-nav-header">
      <nav className="ranker-nav-bar" aria-label="Main navigation">
        <div className="ranker-nav-user" title="Current User">
          <FaUserCircle size={20} style={{ marginRight: 4 }} />
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 90 }}>
            {currentUser?.name}
          </span>
        </div>
        <button
          className="ranker-nav-hamburger"
          aria-label={navOpen ? "Close menu" : "Open menu"}
          aria-expanded={navOpen}
          onClick={handleHamburger}
        >
          {navOpen ? <FaTimes /> : <FaBars />}
        </button>
        <ul className={`ranker-nav-links${navOpen ? " ranker-nav-open" : ""}`}>
          <li>
            <Link to="/" title="Go to Home Page" onClick={closeMenu}>
              <FaHome size={18} /> <span>Home</span>
            </Link>
          </li>
          <li>
            <Link to="/analysis" title="View Analysis" onClick={closeMenu}>
              <FaChartBar size={18} /> <span>Analysis</span>
            </Link>
          </li>
          <li>
            <Link to="/voting" title="Go to Voting Page" onClick={closeMenu}>
              <FaVoteYea size={18} /> <span>Voting</span>
            </Link>
          </li>
          <li>
            <Link to="/awards" title="See Awards" onClick={closeMenu}>
              <FaAward size={18} /> <span>Awards</span>
            </Link>
          </li>
          <li>
            <Link to="/login" onClick={() => { handleLogout(); closeMenu(); }} title="Log out of your account">
              <FaSignOutAlt size={18} /> <span>Logout</span>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}