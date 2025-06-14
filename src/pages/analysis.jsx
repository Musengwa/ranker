//should displays total votes
//arrages them by candidate, the votes they recieved
//the an average of it all..
//the average should be an array in an object with the year attached to it
//use a graph comparing the individual attributes of each user
//this should only be viewed by on user, preset in the code, we'll call him the moderater.

import { useEffect, useState } from "react";
import axios from "axios";
import Nav from "../components/nav";
import { Helmet } from "react-helmet";

// --- Modern CSS for Analysis Page ---
const analysisStyles = `
.analysis-container {
  background: black;
  color: #e5e7eb;
  min-height: 100vh;
  padding: 2rem 0 4rem 0;
  font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
}
.analysis-section {
  background: #18181b;
  border-radius: 1.2rem;
  box-shadow: 0 4px 24pxrgba(36, 36, 37, 0.06);
  margin: 2rem;
  padding: 2rem 2.5rem;
  max-width: 900px;
  width: 90%;
}
.analysis-section h1 {
  font-size: 1.8rem;
  font-weight: 300;
  margin-bottom: 1.5rem;
  color:rgb(210, 210, 210);
  letter-spacing: 1.2px;
}
.candidate-block {
  background: #23232a;
  border-radius: 1rem;
  margin-bottom: 2.5rem;
  padding: 1.5rem 1.2rem 1.2rem 1.2rem;
  box-shadow: 0 2px 8px #6366f122;
  transition: box-shadow 0.18s, transform 0.18s;
}
.candidate-block:hover {
  box-shadow: 0 8px 32px #3b82f633;
  transform: scale(1.01);
}
.candidate-block h2 {
  color: #60a5fa;
  font-size: 1.4rem;
  font-weight: 400;
  margin-bottom: 1.1rem;
  letter-spacing: 1px;
}
.analysis-table {
  width: 95%;
  border-collapse: collapse;
  margin: 1.2rem 0 2rem 0;
  background: #18181b;
  border-radius: 0.1rem;
  overflow: hidden;
  box-shadow: 0 2px 8pxrgba(32, 32, 32, 0.13);
}
.analysis-table th, .analysis-table td {
  border: 1px solid #333;
  padding: 0.8rem 0.3rem;
  text-align: center;
  font-size: 8rem;
}
.analysis-table th {
  background: #23232a;
  color:rgb(207, 207, 207);
  font-weight: 500;
}
.analysis-table tr:hover td {
  background: #27272a;
  transition: background 0.18s;
}
.analysis-table tr.average-row {
  background: #27272a;
  font-weight: bold;
  color: #60a5fa;
}
.vote-list {
  margin-top: 1.2rem;
  margin-bottom: 0.5rem;
}
.vote-list .vote-card {
  background: #18181b;
  border: 1px solid #333;
  border-radius: 0.7rem;
  margin-bottom: 0.7rem;
  padding: 0.8rem 1.2rem;
  color: #e5e7eb;
  box-shadow: 0 1px 4px #6366f122;
  transition: box-shadow 0.18s, transform 0.18s;
}
.vote-list .vote-card:hover {
  box-shadow: 0 4px 12px #3b82f633;
  transform: scale(1.01);
}
@media (max-width: 700px) {
  .analysis-section {
    padding: 1rem 0.5rem;
  }
  .candidate-block {
    padding: 1rem 0.5rem;
  }
  .analysis-table th, .analysis-table td {
    padding: 0.5rem 0.3rem;
    font-size: 0.98rem;
  }
}
`;

// Inject the CSS into the document head
if (typeof document !== "undefined" && !document.getElementById("ranker-analysis-css")) {
  const style = document.createElement("style");
  style.id = "ranker-analysis-css";
  style.innerHTML = analysisStyles;
  document.head.appendChild(style);
}

export default function GrantAnalysis() {
    const [allVotes, setAllVotes] = useState([]);
    const [awards, setAwards] = useState([]);

    // Fetch votes and awards
    useEffect(() => {
        const fetchData = async () => {
            try {
                const votesRes = await axios.get("http://localhost:5000/userXvotes");
                setAllVotes(votesRes.data);
                const awardsRes = await axios.get("http://localhost:5000/awards");
                setAwards(awardsRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    // Helper: Get candidates with at least one vote for a given award/year
    const getAwardResults = (award) => {
        // Only use years that are not 2025 (remove dummy data for 2025)
        const validYears = award.years.filter(y => y.year !== 2025);
        return validYears.map(yearObj => {
            // Only candidates with at least one vote
            const candidatesWithVotes = yearObj.candidates
                .map(c => ({
                    name: c.candidate,
                    votes: c.voters.length
                }))
                .filter(c => c.votes > 0);

            // Find max votes
            const maxVotes = Math.max(0, ...candidatesWithVotes.map(c => c.votes));
            // All winners (ties included)
            const winners = candidatesWithVotes.filter(c => c.votes === maxVotes && maxVotes > 0);

            return {
                year: yearObj.year,
                candidates: candidatesWithVotes,
                winners
            };
        });
    };

    // Table showing voters x attribute for a candidate, with averages
    const CandidateAttributeTable = ({ votes }) => {
        if (votes.length === 0) return null;
        // Get all unique attribute names
        const attributeNames = Array.from(
            new Set(votes.flatMap(v => v.attributes.map(a => a.name)))
        );
        // Build a map: voterID -> { attrName: value }
        const voterRows = votes.map(vote => {
            const attrMap = {};
            vote.attributes.forEach(attr => {
                attrMap[attr.name] = attr.value;
            });
            return { voterID: vote.voterID, ...attrMap };
        });
        // Calculate averages for each attribute
        const averages = {};
        attributeNames.forEach(name => {
            const vals = votes.map(v => {
                const found = v.attributes.find(a => a.name === name);
                return found ? Number(found.value) : 0;
            });
            const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
            averages[name] = avg.toFixed(2);
        });

        return (
            <table className="analysis-table">
                <thead>
                    <tr>
                        <th>Voter ID</th>
                        {attributeNames.map(attr => (
                            <th key={attr}>{attr}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {voterRows.map((row, idx) => (
                        <tr key={row.voterID || idx}>
                            <td>{row.voterID}</td>
                            {attributeNames.map(attr => (
                                <td key={attr}>
                                    {row[attr] !== undefined ? row[attr] : "-"}
                                </td>
                            ))}
                        </tr>
                    ))}
                    <tr className="average-row">
                        <td>Average</td>
                        {attributeNames.map(attr => (
                            <td key={attr}>
                                {averages[attr]}
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
        );
    };
    // PerCandidate component (styled and interactive)
    const PerCandidate = ({ allVotes, candidate }) => {
        const myVotes = allVotes.filter(vote => vote.candidateID === candidate);
        if (myVotes.length === 0) return null;
        return (
            <div className="candidate-block" key={candidate}>
                <h2>Candidate ID: {candidate}</h2>
                <CandidateAttributeTable votes={myVotes} />
                <div className="vote-list">
                    {myVotes.map(vote => (
                        <div className="vote-card" key={vote.id}>
                            <p style={{ color: "#white", fontWeight: 500 }}>Voter ID: {vote.voterID}</p>
                            <ul style={{ marginLeft: 0, paddingLeft: 18 }}>
                                {vote.attributes.map((attribute, idx) => (
                                    <li key={attribute.id || idx}>
                                        <span style={{ color: "white" }}>{attribute.name}</span>: {attribute.value}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="analysis-container">
        <Nav />
            <Helmet>
                <title>Analysis | Ranker</title>
                <meta name="description" content="Moderator analysis of candidate votes and attributes." />
            </Helmet>
            <section className="analysis-section">
                <h1>Award Results</h1>
                {awards.map(award => (
                    <div key={award.id} style={{marginBottom: "2rem"}}>
                        <h2 style={{color:"#fbbf24"}}>{award.name}</h2>
                        {getAwardResults(award).map(result => (
                            <div key={result.year} style={{marginBottom: "1rem"}}>
                                <strong style={{color:"#60a5fa"}}>Year: {result.year}</strong>
                                <ul>
                                    {result.candidates.map(c => (
                                        <li key={c.name}>
                                            {c.name} — {c.votes} vote{c.votes !== 1 ? "s" : ""}
                                            {result.winners.some(w => w.name === c.name) && c.votes > 0 && (
                                                <span style={{color: "#3b82f6", fontWeight: 600, marginLeft: 8}}>
                                                    Winner
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                    {result.candidates.length === 0 && (
                                        <li style={{color: "#64748b"}}>No votes cast for this award.</li>
                                    )}
                                </ul>
                                {result.winners.length > 1 && result.winners.length === result.candidates.length && (
                                    <div style={{color: "#fbbf24"}}>All candidates tied!</div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </section>
            <section className="analysis-section">
                <h1>Candidate Votes</h1>
                {/* Only show candidates with at least one vote */}
                {[...new Set(allVotes.map(v => v.candidateID))]
                    .map(candidateID => {
                        const votesForCandidate = allVotes.filter(v => v.candidateID === candidateID);
                        if (votesForCandidate.length === 0) return null;
                        return (
                            <PerCandidate
                                key={candidateID}
                                allVotes={allVotes}
                                candidate={candidateID}
                            />
                        );
                    })}
            </section>
        </div>
    );
}