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
            <Helmet>
                <title>Awards | Ranker</title>
                <meta name="description" content="Vote for your favorite awards on Ranker. Discover nominees and winners in various categories." />
                <meta name="keywords" content="awards, voting, ranker, nominees, winners" />
            </Helmet>
            <Nav />
            <nav className="awardNav" aria-label="Awards Navigation">
                <ul style={{ listStyleType: "none", padding: 10,marginTop: 40, margin: 5, display: "flex", flexDirection: "row", gap: 10, flexWrap: "wrap", justifyContent: "space-between" }}>
                    {awards.map(award => (
                        <li key={award.id} style={{height: 140, width: "95%", background: "linear-gradient(90deg,rgba(133, 12, 12, 0.99) 0%, rgb(198, 10, 10) 50%,rgb(135, 7, 7) 100%)", border: "1px solid rgb(96, 77, 77)", padding: 5, margin: 5, borderRadius: 8}} >
                            <h3>{award.name}</h3>
                            <p>{award.description}</p>
                            <button onClick={() => setSelectedAward(award)} style={{backgroundColor:"whitesmoke", border: "2px solid black", padding: 10, justifyContent: "right"}}>
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