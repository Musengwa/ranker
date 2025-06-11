//should displays total votes
//arrages them by candidate, the votes they recieved
//the an average of it all..
//the average should be an array in an object with the year attached to it
//use a graph comparing the individual attributes of each user
//this should only be viewed by on user, preset in the code, we'll call him the moderater.

import { useEffect, useState } from "react";
import axios from "axios";
import Nav from "../components/nav";

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

    // PerCandidate component (unchanged)
    const PerCandidate = ({ allVotes, candidate }) => {
        const myVotes = allVotes.filter(vote => vote.candidateID === candidate);
        if (myVotes.length === 0) return null;
        return (
            <div key={candidate}>
                <h2>Candidate ID: {candidate}</h2>
                <div>
                    {myVotes.map(vote => (
                        <div key={vote.id}>
                            <p>Voter ID: {vote.voterID}</p>
                            <ul>
                                {vote.attributes.map((attribute, idx) => (
                                    <li key={attribute.id || idx}>
                                        {attribute.name}: {attribute.value}
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
        <div>
            <Nav />
            <section>
                <h1>Award Results</h1>
                {awards.map(award => (
                    <div key={award.id} style={{marginBottom: "2rem"}}>
                        <h2>{award.name}</h2>
                        {getAwardResults(award).map(result => (
                            <div key={result.year} style={{marginBottom: "1rem"}}>
                                <strong>Year: {result.year}</strong>
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
            <section>
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