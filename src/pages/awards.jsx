import Nav from "../components/nav";
import SpecialAward from "../components/specialAward";
import { useEffect, useState } from "react";
import axios from "axios";

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
            <div className="awardNav">
                <ul>
                    {awards.map(award => (
                        <li key={award.id}>
                            <button onClick={() => setSelectedAward(award)}>
                                {award.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                {selectedAward && (
                    <SpecialAward award={selectedAward} onVoted={() => setSelectedAward(null)} />
                )}
            </div>
        </>
    );
}