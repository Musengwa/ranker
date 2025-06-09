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
                <ul>
                    {awards.map(award => (
                        <li key={award.id}>
                            <button onClick={() => setSelectedAward(award)}>
                                {award.name}
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