import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/currentUserContext";
import { useEffect, useState } from "react";

// --- Modern, Fun, Responsive CSS for Nav ---
const navStyles = `
.ranker-nav-header {
  width: 100%;
   background: linear-gradient(135deg,rgb(0, 0, 0) 0%,rgb(8, 8, 8) 100%);
  position: sticky;
  top: 0;
  z-index: 100;
}
.ranker-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: 0 auto;
  padding: 0.7rem 1.5rem;
}
.ranker-nav-user {
  color: #fff;
  font-weight: 600;
  font-size: 1.1rem;
  background:rgb(14, 14, 14);
  border-radius: 20px;
  padding: 0.6rem 1.2rem;
  border: solid 1px rgb(18, 18, 18);
  margin-right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.ranker-nav-links {
  display: flex;
  gap: 1.2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}
.ranker-nav-links li {
  display: flex;
}
.ranker-nav-links a {
  color: rgb(196, 196, 196);
  font-weight: 300;
  text-decoration: none;
  padding: 0.5rem 1.1rem;
  border-radius: 1.5rem;
  transition: background 0.18s, color 0.18s;
  font-size: 1.3rem;
  letter-spacing: 0.5px;
}
.ranker-nav-links a:hover, .ranker-nav-links a:focus {
  background: #fff;
  color:rgb(29, 29, 29);
  outline: none;
}
.ranker-nav-hamburger {
  display: none;
  background: none;
  border: none;
  font-size: 2rem;
  color: #fff;
  cursor: pointer;
  margin-left: 1rem;
}
@media (max-width: 700px) {
  .ranker-nav-bar {
    flex-direction: row;
    padding: 0.7rem 0.7rem;
  }
  .ranker-nav-links {
    position: absolute;
    top: 60px;
    right: 10px;
    background:rgb(12, 12, 12);
    border: 2px solid rgb(25, 25, 25);
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem 1.2rem;
    border-radius: 1.2rem;
    display: none;
    min-width: 140px;
  }
  .ranker-nav-links.ranker-nav-open {
    display: flex;
  }
  .ranker-nav-hamburger {
    display: block;
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
          <span role="img" aria-label="User"></span>
          {currentUser?.name}
        </div>
        <button
          className="ranker-nav-hamburger"
          aria-label={navOpen ? "Close menu" : "Open menu"}
          aria-expanded={navOpen}
          onClick={handleHamburger}
        >
          {navOpen ? "✖️" : "☰"}
        </button>
        <ul className={`ranker-nav-links${navOpen ? " ranker-nav-open" : ""}`}>
          <li>
            <Link to="/" title="Go to Home Page" onClick={closeMenu}>Home</Link>
          </li>
          <li>
            <Link to="/analysis" title="View Analysis" onClick={closeMenu}>Analysis</Link>
          </li>
          <li>
            <Link to="/voting" title="Go to Voting Page" onClick={closeMenu}>Voting</Link>
          </li>
          <li>
            <Link to="/awards" title="See Awards" onClick={closeMenu}>Awards</Link>
          </li>
          <li>
            <Link to="/login" onClick={() => { handleLogout(); closeMenu(); }} title="Log out of your account">Logout</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}