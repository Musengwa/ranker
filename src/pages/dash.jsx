import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/currentUserContext";
import Nav from "../components/nav";
import axios from "axios";
import UserCard from "../components/userCard";
import { Helmet } from "react-helmet";

// --- Modern, Fun, Responsive CSS ---
const dashStyles = `
.ranker-main {
  background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
  min-height: 100vh;
  padding: 0;
  font-family: 'Segoe UI', 'Roboto', sans-serif;
}
.ranker-header {
  text-align: center;
  margin: 2rem 0 1rem 0;
  color: #4f46e5;
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: 1px;
}
.ranker-refresh-btn {
  display: block;
  margin: 0 auto 1.5rem auto;
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 2rem;
  padding: 0.7rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px #6366f133;
  transition: background 0.2s;
}
.ranker-refresh-btn:hover {
  background: #4338ca;
}
.ranker-votes-section {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  padding: 0 1rem;
}
.ranker-vote-card {
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 4px 16px #6366f122;
  padding: 1.5rem 1.2rem;
  min-width: 270px;
  max-width: 340px;
  flex: 1 1 270px;
  transition: transform 0.12s;
  position: relative;
}
.ranker-vote-card:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 8px 24px #6366f144;
}
.ranker-candidate-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: #6366f1;
  margin-bottom: 0.7rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: color 0.2s;
}
.ranker-candidate-title:hover {
  color: #4338ca;
  text-decoration: underline;
}
.ranker-attributes-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.ranker-attributes-list li {
  background: #f1f5f9;
  margin-bottom: 0.4rem;
  border-radius: 0.7rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.ranker-modal-bg {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: #0008;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ranker-modal-card {
  background: #fff;
  border-radius: 1.5rem;
  padding: 1.5rem 1rem;
  box-shadow: 0 8px 32px #6366f188;
  max-width: 95vw;
  width: 350px;
  position: relative;
  text-align: center;
}
.ranker-modal-close {
  background: #f87171;
  color: #fff;
  border: none;
  border-radius: 1.5rem;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: -0.5 rem;
  
  transition: background 0.2s;
}
.ranker-modal-close:hover {
  background: #dc2626;
} 
.ranker-icon {
  font-size: 1.3em;
  vertical-align: middle;
}
@media (max-width: 700px) {
  .ranker-header { font-size: 1.5rem; }
  .ranker-votes-section { flex-direction: column; gap: 1rem; }
  .ranker-vote-card { min-width: 90%; max-width: 95%; }
  .ranker-modal-card { width: 95vw; }
}
`;

// Inject the CSS into the document head
if (typeof document !== "undefined" && !document.getElementById("ranker-dash-css")) {
  const style = document.createElement("style");
  style.id = "ranker-dash-css";
  style.innerHTML = dashStyles;
  document.head.appendChild(style);
}

const HandleCard = ({ candidate, voter, onClose }) => {
  return (
    <div className="ranker-modal-bg">
      <div className="ranker-modal-card">
        <UserCard
          key={candidate.id}
          candidate={candidate}
          voter={voter}
        />
        <button className="ranker-modal-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const HandleDisplay = () => {
  const [myVotes, setMyVotes] = useState([]);
  const [selectedVote, setSelectedVote] = useState(null);

  const { user: currentUser } = useUser();

  const handleMyVotes = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/userXvotes");
      const theVotes = response.data.filter(vote => vote.voterID === currentUser.id);
      setMyVotes(theVotes);
    } catch (error) {
      console.error("Error fetching votes:", error);
    }
  }, [currentUser]);

  useEffect(() => {
    handleMyVotes();
  }, [handleMyVotes]);

  const fetchCandidateAndVoter = useCallback(async (candidateID, voterID) => {
    try {
      const usersResponse = await axios.get("http://localhost:5000/users");
      const users = usersResponse.data;

      const candidate = users.find(user => user.id === candidateID);
      const voter = users.find(user => user.id === voterID);

      setSelectedVote({ candidate, voter });
    } catch (error) {
      console.error("Error fetching candidate and voter:", error);
    }
  }, []);

  const handleRefreshCards = () => {
    handleMyVotes();
  };

  const handleCloseCard = () => {
    setSelectedVote(null);
  };

  return (
    <main className="ranker-main">
      <Helmet>
        <title>Your Votes Dashboard | Ranker</title>
        <meta name="description" content="View and manage your votes on Ranker. See candidates, attributes, and more." />
      </Helmet>
      <Nav />
      <header>
        <h2>my award votes</h2>
      </header>

      <header>
        <h2 className="ranker-header">Your Votes</h2>
      </header>
      <button className="ranker-refresh-btn" onClick={handleRefreshCards}>🔄 Refresh Cards</button>
      <section className="ranker-votes-section">
        {myVotes.map(myVote => (
          <article className="ranker-vote-card" key={myVote.id}>
            <h2
              className="ranker-candidate-title"
              onClick={() => fetchCandidateAndVoter(myVote.candidateID, myVote.voterID)}
            >
              {/* Replace with icon as needed */}
              <span className="ranker-icon" role="img" aria-label="Candidate">👤</span>
              Candidate {myVote.candidateID}
            </h2>
            <ul className="ranker-attributes-list">
              {myVote.attributes.map((attribute, index) => (
                <li key={`${myVote.id}-${attribute.id || index}`}>
                  {/* Replace with icon as needed */}
                  <span className="ranker-icon" role="img" aria-label={attribute.name}>⭐</span>
                  {attribute.name}: {attribute.value}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
      {selectedVote && (
        <HandleCard
          candidate={selectedVote.candidate}
          voter={selectedVote.voter}
          onClose={handleCloseCard}
        />
      )}
    </main>
  );
};

export default function Home() {
  const { user: currentUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  return (
    <div>
      <HandleDisplay />
    </div>
  );
}