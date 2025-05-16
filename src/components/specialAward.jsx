import axios from "axios";
import { useUser } from "../context/currentUserContext";
import { useState, useEffect } from "react";

export default function Special({ award, onVoted }) {
    const { user: currentUser } = useUser();
    const [candidates, setCandidates] = useState([]);
    const [hasVoted, setHasVoted] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch users and check if current user has already voted for this award
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Get all users
                const usersRes = await axios.get("http://localhost:5000/users");
                const users = usersRes.data;
                // Candidates: all except current user
                setCandidates(users.filter(u => u.id !== currentUser.id));

                // Check if user has already voted for this award (in a real app, this would be more robust)
                const votesRes = await axios.get("http://localhost:5000/awardVotes", {
                    params: {
                        awardID: award.id,
                        voterID: currentUser.id
                    }
                });
                setHasVoted(votesRes.data.length > 0);
            } catch (err) {
                console.error("Error loading data:", err);
            }
            setLoading(false);
        };
        fetchData();
    }, [award, currentUser]);

    // Handle voting for a candidate
    const handleVote = async (candidate) => {
        if (hasVoted) return;
        try {
            await axios.post("http://localhost:5000/awardVotes", {
                awardID: award.id,
                year: new Date().getFullYear(),
                candidateID: candidate.id,
                voterID: currentUser.id
            });
            setHasVoted(true);
            if (onVoted) onVoted();
            alert("Vote submitted!");
        } catch (err) {
            console.error("Error submitting vote:", err);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (hasVoted) return <div>You have already voted for this award.</div>;

    return (
        <div>
            <div className="award">
                <div className="award-details">
                    <p>{award.name}</p>
                    <p>{award.description}</p>
                </div>
                <div className="candidates">
                    {candidates.map(candidate => (
                        <div className="candidate" key={candidate.id}>
                            <div>image</div>
                            <div className="details">
                                <p>{candidate.name}</p>
                            </div>
                            <button onClick={() => handleVote(candidate)}>
                                | Vote for {candidate.name} |
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}