import Nav from "../components/nav";
import SpecialAward from "../components/specialAward";
import { useEffect, useState } from "react";
import axios from "axios";
import { Helmet } from "react-helmet"; // Add this import

export default function Awards() {
    const [awards, setAwards] = useState([]);
    const [selectedAward, setSelectedAward] = useState(null);

    useEffect(() => {
        const fetchAwards = async () => {
            const res = await axios.get("http://localhost:5000/awards");
            setAwards(res.data);
        };
        fetchAwards();
    }, []);

    return (
        <>
        <Nav />
            <Helmet>
                <title>Awards | Ranker</title>
                <meta name="description" content="Vote for your favorite awards on Ranker. Discover nominees and winners in various categories." />
                <meta name="keywords" content="awards, voting, ranker, nominees, winners" />
            </Helmet>
            <nav className="awardNav" aria-label="Awards Navigation">
                <ul style={{ listStyleType: "none", padding: 15,marginTop: 40, margin: 2, display: "flex", flexDirection: "row", gap: 2, flexWrap: "wrap", justifyContent: "space-between" }}>
                    {awards.map(award => (
                        <li key={award.id} style={{height: 170, width: "47%", background: "linear-gradient(90deg,rgba(12, 50, 133, 0.99) 0%, rgba(9, 59, 100, 1) 50%,rgba(9, 46, 149, 1) 100%)", border: "1px solid rgba(66, 66, 66, 1)", paddingBottom: 30, paddingRight: 20, paddingLeft: 20, margin: 3, borderRadius: 8}} >
                            <h3 style ={{color: "whitesmoke"}}>{award.name}</h3>
                            <p style ={{color: "whitesmoke"}}>{award.description}</p>
                            <button onClick={() => setSelectedAward(award)} style={{color:"whitesmoke", backgroundColor:"black", border: "2px solid grey", padding: 15, justifyContent: "right", borderRadius: 4, alignSelf: 'center'}}>
                                vote now!!!
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
            <main>
                {selectedAward && (
                    <SpecialAward award={selectedAward} onVoted={() => setSelectedAward(null)} />
                )}
            </main>
        </>
    );
}