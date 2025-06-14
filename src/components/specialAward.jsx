import axios from "axios";
import { useUser } from "../context/currentUserContext";
import { useState, useEffect } from "react";

export default function SpecialAward({ award, onVoted }) {
    const { user: currentUser } = useUser();
    const [candidates, setCandidates] = useState([]);
    const [hasVoted, setHasVoted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [votedCandidate, setVotedCandidate] = useState(null);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [award, currentUser]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const usersRes = await axios.get("http://localhost:5000/users");
            const users = usersRes.data;
            setCandidates(users.filter(u => u.id !== currentUser.id));

            const awardsRes = await axios.get("http://localhost:5000/awards");
            const awards = awardsRes.data;
            const thisAward = awards.find(a => a.id === award.id);
            const thisYear = thisAward.years.find(y => y.year === new Date().getFullYear());

            let found = false;
            let votedName = null;
            if (thisYear) {
                for (const candidate of thisYear.candidates) {
                    if (candidate.voters.includes(currentUser.name)) {
                        found = true;
                        votedName = candidate.candidate;
                        break;
                    }
                }
            }
            setHasVoted(found);
            if (found) {
                const voted = users.find(u => u.name === votedName);
                setVotedCandidate(voted);
            } else {
                setVotedCandidate(null);
            }
        } catch (err) {
            console.error("Error loading data:", err);
        }
        setLoading(false);
    };

    const handleVote = async (candidate) => {
        if (hasVoted) return;
        try {
            const awardsRes = await axios.get("http://localhost:5000/awards");
            const awards = awardsRes.data;
            const thisAward = awards.find(a => a.id === award.id);
            const yearNum = new Date().getFullYear();
            let thisYear = thisAward.years.find(y => y.year === yearNum);

            if (!thisYear) {
                thisYear = {
                    year: yearNum,
                    winner: null,
                    candidates: candidates.map(u => ({
                        candidate: u.name,
                        voters: []
                    }))
                };
                thisAward.years.push(thisYear);
            }

            // Remove user from all candidates' voters (in case of re-vote)
            thisYear.candidates.forEach(c => {
                c.voters = c.voters.filter(v => v !== currentUser.name);
            });

            // Add to selected candidate
            const candidateEntry = thisYear.candidates.find(c => c.candidate === candidate.name);
            if (candidateEntry && !candidateEntry.voters.includes(currentUser.name)) {
                candidateEntry.voters.push(currentUser.name);
            }

            await axios.put(`http://localhost:5000/awards/${award.id}`, thisAward);

            setHasVoted(true);
            setVotedCandidate(candidate);
            if (onVoted) onVoted();
            alert("Vote submitted!");
        } catch (err) {
            console.error("Error submitting vote:", err);
        }
    };

    // NEW: Remove vote and allow voting again
    const handleVoteAgain = async () => {
        try {
            const awardsRes = await axios.get("http://localhost:5000/awards");
            const awards = awardsRes.data;
            const thisAward = awards.find(a => a.id === award.id);
            const yearNum = new Date().getFullYear();
            let thisYear = thisAward.years.find(y => y.year === yearNum);

            if (thisYear) {
                thisYear.candidates.forEach(c => {
                    c.voters = c.voters.filter(v => v !== currentUser.name);
                });
                await axios.put(`http://localhost:5000/awards/${award.id}`, thisAward);
            }
            setHasVoted(false);
            setVotedCandidate(null); 
            if (onVoted) onVoted();
            fetchData();
        } catch (err) {
            console.error("Error removing vote:", err);
        }
    };

    if (loading) return <div style={{color:"blue"}}>Loading...</div>;
    if (hasVoted && votedCandidate) {
        return (
            <div style={{backgroundColor:"rgb(245, 245, 245)", border: "1px solid grey", width: "85%", placeItems: "center", placeContent: "center",placeSelf: "center", borderRadius: 10, marginTop: 30, padding: 10}}>
                <p>already voted.</p>
                <p>this is your pick for <b>{award.name}</b> : <b>{votedCandidate.name}</b></p>
                <img
                    src={votedCandidate.pfp || "/default-avatar.png"}
                    alt={`Portrait of ${votedCandidate.name}`}
                    width={64} height={64}
                    style={{backgroundColor:"rgb(38, 38, 38)", border: "1px solid grey", borderRadius:40, padding: 10, width: 100, hieght: 100}}
                />
                <br />
                <button onClick={handleVoteAgain} style={{marginTop: 12 , placeSelf:"center", marginLeft: "20%", padding: 10, width: "60"}}>Vote Again</button>
            </div>
        );
    }
    if (hasVoted) return (
        <div>
            You have already voted for this award.
            <br />
            <button onClick={handleVoteAgain} style={{marginTop: 12}}>Vote Again</button>
        </div>
    );

    return (
        <section style={{background:"rgb(17, 17, 17)", color:"rgb(174, 174, 174)", margin: 15, padding: 10, borderRadius: 8}}>
            <article className="award">
                <header className="award-details">
                    <h1>{award.name}</h1>
                    <p>{award.description}</p>
                </header>
                    <h2>Candidates</h2>
                <section className="candidates" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr"}}>
                    {candidates.map(candidate => (
                        <article className="candidate" key={candidate.id} style={{backgroundColor:"rgb(19, 19, 19)", border: "1px solid grey", justifyItems: "center", margin: 10, padding: 5, borderRadius: 6}}>
                            <img 
                                src={candidate.pfp || "/default-avatar.png"} 
                                alt={`${candidate.name}`} 
                                width={80} height={80}
                                style={{backgroundColor:"rgb(0, 0, 0)", border: "1px solid grey", borderRadius:40, padding: 10, width: 70, height: 70}}
                            />
                            <div className="details">
                                <h3>{candidate.name}</h3>
                            </div>
                            <button 
                                onClick={() => handleVote(candidate)}
                                aria-label={`Vote for ${candidate.name} for ${award.name}`}
                                disabled={hasVoted}
                                style={{padding:7}}
                            >
                                pick me
                            </button>
                        </article>
                    ))}
                </section>
            </article>
        </section>
    );
}