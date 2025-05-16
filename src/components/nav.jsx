import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/currentUserContext";
import { useEffect } from "react";

export default function Nav() {
  const { user: currentUser, setUser } = useUser();
  const navigate = useNavigate();

  // Redirect to login if no user is logged in
  useEffect(() => {
    if (!currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    setUser(null); // Clear the current user
    navigate("/"); // Redirect to login page
  };

  return (
    <div>
      <p>nav bar</p>
      <nav>
        <div className="current-user">{currentUser?.name}</div>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/analysis">analysis</Link></li>
          <li><Link to="/voting">Voting</Link></li>
          <li><Link to="/awards">Awards</Link></li>
          <li><Link to="/login" onClick={handleLogout}>Logout</Link></li>
        </ul>
      </nav>
    </div>
  );
}