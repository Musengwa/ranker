import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/currentUserContext";
import Nav from "../components/nav";
import axios from "axios";
import UserCard from "../components/userCard";

const HandleCard = ({ candidate, voter, onClose }) => {
  return (
    <div>
      <UserCard
        key={candidate.id}
        candidate={candidate}
        voter={voter}
      />
      <button onClick={onClose}>Close</button>
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
    // Re-fetch votes to refresh all cards
    handleMyVotes();
  };

  const handleCloseCard = () => {
    // Close the selected card
    setSelectedVote(null);
  };

  return (
    <div>
      <Nav />
      <h3>Your Votes</h3>
      <button onClick={handleRefreshCards}>Refresh Cards</button>
      <div>
        {myVotes.map(myVote => (
          <section key={myVote.id}>
            <h4
              onClick={() => fetchCandidateAndVoter(myVote.candidateID, myVote.voterID)}
            >
              {myVote.candidateID}
            </h4>
            <ul>
              {myVote.attributes.map((attribute, index) => (
                <li key={`${myVote.id}-${attribute.id || index}`}>
                  {attribute.name}: {attribute.value}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {selectedVote && (
        <HandleCard
          candidate={selectedVote.candidate}
          voter={selectedVote.voter}
          onClose={handleCloseCard} // Pass the close callback to HandleCard
        />
      )}
    </div>
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