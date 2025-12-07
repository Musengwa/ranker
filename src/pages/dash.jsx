import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/currentUserContext";
import Nav from "../components/nav";
import axios from "axios";
import UserCard from "../components/userCard";
import { Helmet } from "react-helmet";
import { 
  FiRefreshCw, FiX, FiUser, FiAward, FiCheck, FiTrash2, 
  FiBarChart2, FiList, FiStar, FiShare2,
  FiUsers, FiThumbsUp, FiActivity, FiTrendingUp, FiTarget
} from "react-icons/fi";

// --- Modern Dark Dashboard CSS ---
const dashStyles = `
:root {
  --primary: #6366f1;
  --primary-light: #818cf8;
  --secondary: #8b5cf6;
  --dark-1: #09090b;
  --dark-2: #121216;
  --dark-3: #1c1c22;
  --light-1: #f1f5f9;
  --light-2: #e2e8f0;
  --glass: rgba(28, 28, 34, 0.8);
  --glass-border: rgba(74, 90, 121, 0.2);
  --accent: #f97316;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--dark-1);
  color: var(--light-2);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
}

.ranker-main {
  background: linear-gradient(135deg, var(--dark-1) 0%, var(--dark-2) 100%);
  min-height: 100vh;
  padding: 0;
  position: relative;
  overflow-x: hidden;
}

.content-wrapper {
  position: relative;
  z-index: 10;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

/* Header & Navigation */
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  position: relative;
  margin-bottom: 1.5rem;
}

.app-title {
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--dark-3);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--primary-light);
}

.user-avatar svg {
  color: var(--primary-light);
}

.user-details {
  text-align: right;
}

.user-name {
  font-weight: 600;
  font-size: 1rem;
}

.user-role {
  font-size: 0.85rem;
  color: var(--primary-light);
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--dark-2);
  border-radius: 1rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--glass-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 0.75rem;
  background: rgba(99, 102, 241, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.stat-icon svg {
  color: var(--primary);
  font-size: 1.5rem;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  font-size: 0.95rem;
  color: var(--light-2);
  opacity: 0.8;
}

/* Tabs */
.tab-container {
  display: flex;
  background: var(--dark-3);
  border-radius: 1rem;
  padding: 0.25rem;
  margin: 1.5rem 0;
  border: 1px solid var(--glass-border);
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.9rem 1.25rem;
  border-radius: 0.75rem;
  background: transparent;
  border: none;
  color: var(--light-2);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.tab-btn.active {
  background: var(--dark-2);
  color: var(--primary-light);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.tab-btn:hover:not(.active) {
  background: rgba(255, 255, 255, 0.05);
}

/* Cards */
.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-left: 0.5rem;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card {
  background: var(--dark-2);
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  border-color: rgba(129, 140, 248, 0.4);
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
  border-radius: 1rem 1rem 0 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-title {
  font-weight: 600;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 0.75rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--light-2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: var(--primary);
  color: white;
}

.attributes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.9rem;
}

.attribute-item {
  background: var(--dark-3);
  border-radius: 0.75rem;
  padding: 0.9rem;
  font-size: 0.95rem;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--glass-border);
}

.attribute-label {
  font-size: 0.85rem;
  color: var(--primary-light);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.attribute-value {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1.1rem;
}

/* Awards Section */
.awards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.award-card {
  background: linear-gradient(135deg, var(--dark-2) 0%, var(--dark-3) 100%);
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
}

.award-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #f59e0b 0%, #fcd34d 100%);
}

.award-name {
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
}

.voted-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.voted-candidate {
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.05rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(9, 9, 11, 0.95);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-card {
  background: linear-gradient(135deg, var(--dark-2) 0%, var(--dark-3) 100%);
  border: 1px solid var(--glass-border);
  border-radius: 1.5rem;
  width: 100%;
  max-width: 500px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--dark-3);
}

.modal-title {
  font-weight: 600;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-close {
  background: transparent;
  border: none;
  color: var(--light-2);
  cursor: pointer;
  font-size: 1.5rem;
  transition: color 0.2s;
}

.modal-close:hover {
  color: var(--primary);
}

.modal-content {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--dark-3);
}

.btn {
  padding: 0.8rem 1.75rem;
  border-radius: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 1rem;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-light);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.25rem;
  }
  
  .user-info {
    align-self: flex-start;
  }
  
  .card-grid, .awards-grid, .stats-container {
    grid-template-columns: 1fr;
  }
  
  .tab-btn {
    padding: 0.85rem;
    font-size: 0.95rem;
  }
  
  .tab-btn span {
    display: none;
  }
  
  .attributes-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .attributes-grid {
    grid-template-columns: 1fr;
  }
  
  .app-title {
    font-size: 1.6rem;
  }
  
  .section-title {
    font-size: 1.3rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-value {
    font-size: 1.6rem;
  }
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.card {
  animation: fadeIn 0.4s ease-out forwards;
  animation-delay: calc(var(--index) * 0.1s);
  opacity: 0;
}
`;

// Inject CSS
if (typeof document !== "undefined" && !document.getElementById("ranker-dash-css")) {
  const style = document.createElement("style");
  style.id = "ranker-dash-css";
  style.innerHTML = dashStyles;
  document.head.appendChild(style);
}

const HandleCard = ({ candidate, voter, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">
            <FiUser /> Candidate Details
          </h3>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <div className="modal-content">
          <div
            style={{
              borderRadius: "1rem",
              overflow: "hidden",
              boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
              background: "#18181b",
              maxWidth: 320,
              margin: "0 auto"
            }}
          >
            <UserCard candidate={candidate} voter={voter} />
          </div>
        </div>
      </div>
    </div>
  );
};

const VotedAwardsSection = ({ awards, users, currentUser, onVoteAgain }) => {
  const currentYear = new Date().getFullYear();

  if (!currentUser) return null;

  return (
    <div>
      <div className="section-title">
        <FiAward size={26} />
        <h2>2025 Awards</h2>
      </div>

      <div className="awards-grid">
        {awards.map(award => {
          const yearObj = award.years.find(y => y.year === currentYear);
          let votedCandidateName = null;
          
          if (yearObj) {
            for (const candidate of yearObj.candidates) {
              if (candidate.voters.includes(currentUser.name)) {
                votedCandidateName = candidate.candidate;
                break;
              }
            }
          }
          
          return (
            <div className="award-card" key={award.id}>
              <div className="award-name">
                <FiStar size={20} color="#f59e0b" />
                {award.name}
              </div>
              
              <div className="voted-info">
                {votedCandidateName ? (
                  <span className="voted-candidate">
                    <FiCheck size={18} color="#10b981" />
                    {votedCandidateName}
                  </span>
                ) : (
                  <span className="voted-candidate" style={{ color: "#94a3b8" }}>
                    Not voted
                  </span>
                )}
                
                {votedCandidateName && (
                  <button 
                    className="icon-btn"
                    onClick={() => onVoteAgain(award.id)}
                    title="Remove vote"
                  >
                    <FiTrash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const HandleDisplay = () => {
  const [myVotes, setMyVotes] = useState([]);
  const [selectedVote, setSelectedVote] = useState(null);
  const [awards, setAwards] = useState([]);
  const [users, setUsers] = useState([]);
  const [view, setView] = useState("awards");

  const { user: currentUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const handleMyVotes = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/userXvotes");
      if (!currentUser) {
        setMyVotes([]);
        return;
      }
      const theVotes = response.data.filter(vote => vote.voterID === currentUser.id);
      setMyVotes(theVotes);
    } catch (error) {
      console.error("Error fetching votes:", error);
    }
  }, [currentUser]);

  useEffect(() => {
    handleMyVotes();
    axios.get("http://localhost:5000/awards").then(res => setAwards(res.data));
    axios.get("http://localhost:5000/users").then(res => setUsers(res.data));
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

  const handleCloseCard = () => {
    setSelectedVote(null);
  };

  const handleVoteAgain = async (awardId) => {
    try {
      const awardsRes = await axios.get("http://localhost:5000/awards");
      const awardsData = awardsRes.data;
      const thisAward = awardsData.find(a => a.id === awardId);
      const yearNum = new Date().getFullYear();
      let thisYear = thisAward.years.find(y => y.year === yearNum);

      if (thisYear) {
        thisYear.candidates.forEach(c => {
          c.voters = c.voters.filter(v => v !== currentUser.name);
        });
        await axios.put(`http://localhost:5000/awards/${awardId}`, thisAward);
        axios.get("http://localhost:5000/awards").then(res => setAwards(res.data));
      }
    } catch (err) {
      console.error("Error removing vote:", err);
    }
  };

  // Stats data for dashboard
  const stats = [
    { icon: <FiUsers />, value: "24", label: "Total Candidates" },
    { icon: <FiThumbsUp />, value: "18", label: "Your Votes" },
    { icon: <FiActivity />, value: "92%", label: "Participation Rate" },
    { icon: <FiTrendingUp />, value: "7", label: "Awards Won" }
  ];

  return (
    <>
    <Nav/>
    <main className="ranker-main">
      <Helmet>
        <title>Your Votes Dashboard | Ranker</title>
        <meta name="description" content="View and manage your votes on Ranker. See candidates, attributes, and more." />
      </Helmet>
      
      <div className="content-wrapper">
        <div className="header-container">
          <h1 className="app-title">
            <FiBarChart2 /> Ranker Dashboard
          </h1>
          
          <div className="user-info">
            <div className="user-details">
              <div className="user-name">{currentUser?.name || "User"}</div>
              <div className="user-role">Voter</div>
            </div>
            <div className="user-avatar">
              <FiUser size={22} />
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div className="stat-card" key={index}>
              <div className="stat-icon">
                {stat.icon}
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
        
        <div className="tab-container">
          <button 
            className={`tab-btn ${view === "awards" ? "active" : ""}`}
            onClick={() => setView("awards")}
          >
            <FiAward size={20} />
            <span>Awards</span>
          </button>
          
          <button 
            className={`tab-btn ${view === "votes" ? "active" : ""}`}
            onClick={() => setView("votes")}
          >
            <FiList size={20} />
            <span>Your Votes</span>
          </button>
        </div>
        
        {view === "awards" && (
          <VotedAwardsSection
            awards={awards}
            users={users}
            currentUser={currentUser}
            onVoteAgain={handleVoteAgain}
          />
        )}
        
        {view === "votes" && (
          <div>
            <div className="section-title">
              <FiList size={26} />
              <h2>Your Votes</h2>
              
              <button 
                className="icon-btn" 
                onClick={handleMyVotes}
                style={{ marginLeft: "auto" }}
                title="Refresh votes"
              >
                <FiRefreshCw size={20} />
              </button>
            </div>
            
            <div className="card-grid">
              {myVotes.map((myVote, index) => (
                <div 
                  className="card" 
                  key={myVote.id}
                  style={{ "--index": index }}
                >
                  <div className="card-header">
                    <h3 
                      className="card-title" 
                      onClick={() => fetchCandidateAndVoter(myVote.candidateID, myVote.voterID)}
                      style={{ cursor: "pointer" }}
                    >
                      <FiUser size={18} />
                      Candidate {myVote.candidateID}
                    </h3>
                    
                    <div className="card-actions">
                      <button className="icon-btn" title="Share">
                        <FiShare2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="attributes-grid">
                    {myVote.attributes.map((attribute, index) => (
                      <div className="attribute-item" key={`${myVote.id}-${attribute.id || index}`}>
                        <div className="attribute-label">
                          <FiTarget size={14} />
                          {attribute.name}
                        </div>
                        <div className="attribute-value">
                          <FiStar size={16} color="#f59e0b" />
                          {attribute.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {selectedVote && (
        <HandleCard
          candidate={selectedVote.candidate}
          voter={selectedVote.voter}
          onClose={handleCloseCard}
        />
      )}
    </main>
    </>
  );
};

export default HandleDisplay;