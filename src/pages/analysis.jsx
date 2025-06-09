import { useEffect, useState } from "react";
import axios from "axios";
import Nav from "../components/nav";
import { useUser } from "../context/currentUserContext";
import { Helmet } from "react-helmet"; // SEO: Import Helmet

// --- Modern, Fun, Responsive CSS for Analysis Page ---
const analysisStyles = `
.analysis-main {
  background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
  min-height: 100vh;
  padding-bottom: 2rem;
  font-family: 'Segoe UI', 'Roboto', sans-serif;
}
.analysis-section {
  max-width: 900px;
  margin: 2rem auto;
  padding: 1.5rem 1rem;
  background: #fff;
  border-radius: 1.5rem;
  box-shadow: 0 4px 24px #6366f122;
}
.analysis-candidate {
  margin-bottom: 2.5rem;
  padding: 1.2rem 1rem;
  border-radius: 1.2rem;
  background: linear-gradient(120deg, #e0e7ff 0%, #f1f5fe 100%);
  box-shadow: 0 2px 12px #6366f122;
  transition: box-shadow 0.18s, transform 0.18s;
}
.analysis-candidate:hover {
  box-shadow: 0 8px 32px #6366f144;
  transform: translateY(-2px) scale(1.01);
}
.analysis-candidate h2 {
  color: #6366f1;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 0.7rem;
}
.analysis-candidate h3 {
  color: #4f46e5;
  font-size: 1.1rem;
  margin-top: 1.2rem;
  margin-bottom: 0.5rem;
}
.analysis-votes-list, .analysis-avg-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.analysis-votes-list li, .analysis-avg-list li {
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
.analysis-voter {
  color: #818cf8;
  font-weight: 600;
  margin-bottom: 0.2rem;
}
.special-awards-section {
  margin: 2rem 0;
  padding: 1.5rem 1rem;
  border: 2px solid #a5b4fc;
  border-radius: 1.2rem;
  background: #f8fafc;
  box-shadow: 0 2px 12px #6366f122;
}
.special-awards-section h2 {
  color: #6366f1;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1rem;
}
.special-awards-section h3 {
  color: #4f46e5;
  font-size: 1.1rem;
  margin-bottom: 0.3rem;
}
.special-awards-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.special-awards-section li {
  background: #e0e7ff;
  margin-bottom: 0.4rem;
  border-radius: 0.7rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  color: #334155;
}
@media (max-width: 700px) {
  .analysis-section, .special-awards-section {
    padding: 1rem 0.3rem;
    max-width: 99vw;
  }
  .analysis-candidate {
    padding: 0.7rem 0.3rem;
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

export default function GrantAnalysis(){
    const { user: currentUser } = useUser();
    if (currentUser.id === "1"){
        return <Analysis/>
    }
    else {
        return (
            <>
            <Nav/>
            <h1>admin only page</h1>
            </>
        )
    }

}

function Analysis() {
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
                // Ensure value is always an integer
                const intValue = parseInt(attribute.value, 10) || 0;
                if (!attributeSums[attribute.name]) {
                    attributeSums[attribute.name] = 0;
                    attributeCounts[attribute.name] = 0;
                }
                attributeSums[attribute.name] += intValue;
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
            <div className="analysis-candidate" key={candidate}>
                <h2>Candidate ID: {candidate}</h2>
                <div>
                    {myVotes.map(vote => (
                        <div key={vote.id}>
                            <div className="analysis-voter">Voter ID: {vote.voterID}</div>
                            <ul className="analysis-votes-list">
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
                    <ul className="analysis-avg-list">
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
        <div className="special-awards-section">
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
        <main className="analysis-main">
            <Helmet>
                <title>Candidate Analysis & Special Awards | Ranker</title>
                <meta name="description" content="View detailed candidate analysis, voting breakdowns, and special awards for each year. Discover winners, averages, and more on Ranker." />
                <meta name="keywords" content="candidate analysis, awards, voting, statistics, ranker, results" />
                <meta property="og:title" content="Candidate Analysis & Special Awards | Ranker" />
                <meta property="og:description" content="Explore candidate statistics and special awards. See who won, how they ranked, and more." />
            </Helmet>
            <Nav />
            <SpecialAwards />
            <section className="analysis-section" aria-label="Candidate Analysis">
                {uniqueCandidateIDs.map(candidateID => (
                    <PerCandidate
                        key={candidateID}
                        allVotes={allVotes}
                        candidate={candidateID}
                    />
                ))}
            </section>
        </main>
    );
}