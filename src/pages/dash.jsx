import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import { useUser } from "../context/currentUserContext";
import Nav from "../components/nav";
import axios from "axios";
import UserCard from "../components/userCard";
import { Helmet } from "react-helmet";

// --- Modern, Minimal, Dark Mode with Blue Accents CSS ---
const dashStyles = `
.ranker-main {
  background: linear-gradient(135deg,rgb(0, 0, 0) 0%,rgb(8, 8, 8) 100%);
  min-height: 100vh;
  padding: 0;
  font-family: 'Segoe UI', 'Roboto', sans-serif;
  color: #f3f4f6;
}
.ranker-header {rgb(18, 18, 18);
  border-radius: 1.2rem;
  box-shadow: 0 4px 16px #1e293b33;
  text-align: center;
  margin: 1rem;
  color: #f3f4f6;
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: 1px;
  background: linear-gradient(90deg,rgb(166, 172, 180) 0%,rgb(255, 255, 255) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.ranker-refresh-btn {
  display: block;
  color:rgb(228, 242, 246) ;
  background-color:rgb(10, 10, 10);
  border: none;
  margin-left: 45%;
  border-radius: 2rem;
  padding: -0.2rem 0.2rem;
  font-size: 2.1rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 8px #1e293b55;
  transition: background 0.2s, box-shadow 0.2s;
}
.ranker-refresh-btn:hover {
  background: linear-gradient(90deg, #3b82f6 0%, #1e293b 100%);
  box-shadow: 0 4px 16px #3b82f655;
}
.ranker-votes-section {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  padding: 0 1rem;
}
.ranker-vote-card {
  background-color: rgb(18, 18, 18);
   border: solid 1px rgb(44, 43, 43);
  padding: 1.7rem 1.2rem;
  margin-bottom: 15px;
  border-radius: 10px;
  min-width: 270px;
  max-width: 340px;
  flex: 1 1 270px;
  transition: transform 0.12s, border 0.2s;
  position: relative;
}
.ranker-vote-card:hover {
  transform: translateY(-4px) scale(1.03);
  border: 1.5px solidrgba(59, 131, 246, 0.23);
  box-shadow: 0 8px 24pxrgba(59, 131, 246, 0.08);
}
.ranker-candidate-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: #f3f4f6;
  margin-bottom: 4rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: color 0.2s;
}
.ranker-candidate-title:hover {
  color: #60a5fa;
  text-decoration: underline;
}
.ranker-attributes-list {
  list-style: none;
  padding: 10px;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 5px;
}
.ranker-attributes-list li {
  background:rgba(24, 24, 27, 0.07);
  margin-bottom: 0.4rem;
  border-radius: 0.1rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  color: #f3f4f6;
  display: block;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 2px solid rgb(100, 100, 100);
}
.ranker-modal-bg {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: #18181bcc;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ranker-modal-card {
  background:rgb(5, 5, 5);
  padding: 1.5rem 1rem;
  box-shadow: 0 8px 32px #1e293b88;
  width:100%;
  height:100%;
  position: relative;
  text-align: center;
  align-items: center;
  align-content: center;
  border: 1px solid rgb(22, 22, 22);
}
.ranker-modal-close {
  background: linear-gradient(90deg,rgb(255, 0, 0) 0%,rgb(255, 0, 0) 100%);
  color: #fff;
  border: none;
  border-radius: 1.5rem;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: -0.5rem;
  transition: background 0.2s;
}
.ranker-modal-close:hover {
  background: linear-gradient(90deg, #3b82f6 0%, #1e293b 100%);
}
.ranker-icon {
  font-size: 1.3em;
  vertical-align: middle;
  color: #3b82f6;
}
@media (max-width: 700px) {
  .ranker-header { font-size: 1.5rem; }
  .ranker-votes-section { flex-direction: column; gap: 1rem; }
  .ranker-vote-card { min-width: 90%; max-width: 95%; }
  .ranker-modal-card { width: 95vw; }
}
.VotedAwardsSection-list {
  background: #232336;
  border-radius: 1rem;
  box-shadow: 0 2px 8px #1e293b33;
  border: 1.5px solid #232336;
  padding: 1rem 0.5rem;
}
.VotedAwardsSection-list li {
  border-bottom: 1px solid #1e293b;
  padding: 0.7rem 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ranker-header-section{
 display: flex;
 margin-top:35px;
 margin-bottom: 10px
}
.VotedAwardsSection-list li:last-child {
  border-bottom: none;
}
.VotedAwardsSection-voted {
  color: #fff;
  background: linear-gradient(90deg, #3b82f6 0%, #1e293b 100%);
  border-radius: 0.7rem;
  padding: 0.2rem 0.8rem;
  font-weight: 600;
  margin-left: 0.5rem;
}
.VotedAwardsSection-notvoted {
  color: #64748b;
  font-weight: 500;
  margin-left: 0.5rem;
}
.VotedAwardsSection-voteagain {
  margin-left: 12px;
  background: linear-gradient(90deg, #1e293b 0%, #3b82f6 100%);
  color: #fff;
  border: none;
  border-radius: 1rem;
  padding: 0.3rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.VotedAwardsSection-voteagain:hover {
  background: linear-gradient(90deg, #3b82f6 0%, #1e293b 100%);
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

const VotedAwardsSection = ({ awards, users, currentUser, onVoteAgain }) => {
  const currentYear = new Date().getFullYear();

  if (!currentUser) return null; // or a loading spinner

  return (
    <section style={{ margin: "1rem", border: "solid 1px rgb(44, 43, 43)", borderRadius: "20px", padding: "1rem", backgroundColor:"rgb(18, 18, 18)" }}>
      <h2 style={{ color: "rgb(181, 181, 181)", }}>2025 AWARDS</h2>
      <ul style={{ listStyle: "none", padding: 0, maxWidth: 500, margin: "0 auto", display: "flex", flexDirection: "row", justifySelf: "center", alignContent:"center", alignSelf: "center", justifyContent: "center" }}>
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
            <li key={award.id} style={{
              //background: "#f1f5f9",
              borderRadius: "1rem",
              margin: "0.5rem",
              padding: "0.7rem",
              display: "block",
              justifyContent: "space-around",
              alignItems: "space-around",
              width: "160px",
              height: "100px",
              background: "linear-gradient(90deg,rgb(27, 56, 103) 0%,rgb(8, 87, 213) 100%)"

            }}>
              <h3 style={{ fontWeight: 500 }}>{award.name}</h3>
              <span style={{display: "flex"}}>
                {votedCandidateName
                  ? (
                    <>
                      <h3 style={{ color: "black" , textAlign: "center"}}>{votedCandidateName}</h3>
                      <button
                        style={{
                          marginLeft: "70px",
                          marginTop: "15px",
                          backgroundColor: "rgba(8, 87, 213, 0)",
                          color: "red",
                          border: "none",
                          padding: "5px",
                          borderRadius: "1rem",
                          fontWeight: 600,
                          fontSize: "large",
                          height: "20px",
                          cursor: "pointer",
                          textAlign: "center",
                          alignContent: "center",
                          justifyContent: "center"  //GET CROSS ICON
                        }}
                        onClick={() => onVoteAgain(award.id)}
                        aria-label={`Vote again for ${award.name}`}
                      >
                        ✖️
                      </button>
                    </>
                  )
                  : <span style={{ color: "#64748b" }}>Not voted</span>
                }
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

const HandleDisplay = () => {
  const [myVotes, setMyVotes] = useState([]);
  const [selectedVote, setSelectedVote] = useState(null);
  const [awards, setAwards] = useState([]);
  // const [awardVotes, setAwardVotes] = useState([]); // Remove this line
  const [users, setUsers] = useState([]);

  const { user: currentUser } = useUser();
  const navigate = useNavigate(); // Add this line

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

  // Remove handleRefreshCards (not used)
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

  return (
    <main className="ranker-main">
      <Helmet>
        <title>Your Votes Dashboard | Ranker</title>
        <meta name="description" content="View and manage your votes on Ranker. See candidates, attributes, and more." />
      </Helmet>
      <Nav />

      <VotedAwardsSection
        awards={awards}
        users={users}
        currentUser={currentUser}
        onVoteAgain={handleVoteAgain}
      />

      <header className="ranker-header-section">
        <h2 className="ranker-header">Your Votes</h2>
        <button className="ranker-refresh-btn" onClick={handleMyVotes}> ↻ </button>
      </header>
      <section className="ranker-votes-section">
        {myVotes.map(myVote => (
          <article className="ranker-vote-card" key={myVote.id}>
            <h2
              className="ranker-candidate-title"
              onClick={() => fetchCandidateAndVoter(myVote.candidateID, myVote.voterID)}
            >
              <span className="ranker-icon" role="img" aria-label="Candidate">.</span>
              Candidate {myVote.candidateID}
            </h2>
            <ul className="ranker-attributes-list">
              {myVote.attributes.map((attribute, index) => (
                <li key={`${myVote.id}-${attribute.id || index}`} className="myranks">
                  <span className="ranker-icon" role="img" aria-label={attribute.name}></span>
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

export default HandleDisplay;