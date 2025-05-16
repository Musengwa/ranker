import { useEffect, useState } from "react";
import axios from "axios";
import Nav from "../components/nav";

export default function Analysis() {
    const [allVotes, setAllVotes] = useState([]);
     const [awards, setAwards] = useState([]);

    // Fetch userXvotes
    const fetchUsers = async () => {
        try {
            const response = await axios.get("http://localhost:5000/userXvotes");
            setAllVotes(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    // Fetch awards
    const fetchAwards = async () => {
        try {
            const response = await axios.get("http://localhost:5000/awards");
            setAwards(response.data);
        } catch (error) {
            console.error("Error fetching awards:", error);
        }
    };

    const calculateAverages = (candidateID) => {
        const candidateVotes = allVotes.filter(vote => vote.candidateID === candidateID);
        if (candidateVotes.length === 0) return [];

        const attributeSums = {};
        const attributeCounts = {};

        candidateVotes.forEach(vote => {
            vote.attributes.forEach(attribute => {
                if (!attributeSums[attribute.name]) {
                    attributeSums[attribute.name] = 0;
                    attributeCounts[attribute.name] = 0;
                }
                attributeSums[attribute.name] += attribute.value;
                attributeCounts[attribute.name] += 1;
            });
        });

        return Object.keys(attributeSums).map(attributeName => ({
            name: attributeName,
            average: (attributeSums[attributeName] / attributeCounts[attributeName]).toFixed(2),
        }));
    };

    useEffect(() => {
        fetchUsers();
        fetchAwards();
    }, []);

    const PerCandidate = ({ allVotes, candidate }) => {
        const myVotes = allVotes.filter(vote => vote.candidateID === candidate);
        const averages = calculateAverages(candidate);

        return (
            <div key={candidate}>
                <h2>Candidate ID: {candidate}</h2>
                <div>
                    {myVotes.map(vote => (
                        <div key={vote.id}>
                            <p>Voter ID: {vote.voterID}</p>
                            <ul>
                                {vote.attributes.map(attribute => (
                                    <li key={attribute.id}>
                                        {attribute.name}: {attribute.value}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div>
                    <h3>Average Attributes:</h3>
                    <ul>
                        {averages.map(avg => (
                            <li key={avg.name}>
                                {avg.name}: {avg.average}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    };

    // Special Awards Section
    const SpecialAwards = () => (
        <div style={{ margin: "2rem 0", padding: "1rem", border: "2px solid #aaa", borderRadius: "8px" }}>
            <h2>Special Awards</h2>
            {awards.map(award => (
                <div key={award.id} style={{ marginBottom: "2rem" }}>
                    <h3>{award.name}</h3>
                    <p>{award.description}</p>
                    {award.years.map(yearObj => (
                        <div key={yearObj.year} style={{ marginBottom: "1rem" }}>
                            <strong>Year:</strong> {yearObj.year} <br />
                            <strong>Winner:</strong> {yearObj.winner}
                            <div style={{ marginLeft: "1rem" }}>
                                <h4>Candidates & Votes:</h4>
                                <ul>
                                    {yearObj.candidates.map(candidateObj => (
                                        <li key={candidateObj.candidate}>
                                            <strong>{candidateObj.candidate}</strong> - Voters: {candidateObj.voters.join(", ")}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );

    // Unique candidate IDs for per-candidate analysis
    const uniqueCandidateIDs = Array.from(new Set(allVotes.map(vote => vote.candidateID)));

    return (
        <div>
            <Nav />
            <SpecialAwards />
            <div>
                {uniqueCandidateIDs.map(candidateID => (
                    <PerCandidate
                        key={candidateID}
                        allVotes={allVotes}
                        candidate={candidateID}
                    />
                ))}
            </div>
        </div>
    );
}