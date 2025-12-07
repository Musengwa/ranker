import FutPlayerCard from "../components/fc_card";
import { useEffect, useState } from "react";
export default function ShowRoom() {

    const [votes, setVotes] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [cardData, setCardData] = useStatetate({
        ratings: 0,
        position: "N/A",
        nation: "zambia.svg",
        club: "N/A",
        newAtr1: 0,
        newAtr2: 0,
        name: "",
        atr1: 0,
        atr2: 0,
        atr3: 0,
        atr4: 0,
        atr5: 0,
        atr6: 0,
})
    const [cardDeck, setCardDeck] = useState([])

    const handleRankResults = () => {
       candidates.forEach(user => {
        setCardData({
        ratings: 0,
        position: user.position,
        nation: user.nation,
        club: user.club,
        newAtr1: (votes.filter((myVotes)=> {myVotes.candidateId = user.id; myVotes.year = 2025}).reduce((sum, item) => sum + item.newAtr1, 0))/candidates.length,
        newAtr2: votes.filter((myVotes)=> {myVotes.candidateId = user.id; myVotes.year = 2025}).reduce((sum, item) => sum + item.newAtr2, 0),
        name: user.name,
        atr1: votes.filter((myVotes)=> {myVotes.candidateId = user.id; myVotes.year = 2025}).reduce((sum, item) => sum + item.atr1, 0),
        atr2: votes.filter((myVotes)=> {myVotes.candidateId = user.id; myVotes.year = 2025}).reduce((sum, item) => sum + item.atr2, 0),
        atr3: votes.filter((myVotes)=> {myVotes.candidateId = user.id; myVotes.year = 2025}).reduce((sum, item) => sum + item.atr3, 0),
        atr4: votes.filter((myVotes)=> {myVotes.candidateId = user.id; myVotes.year = 2025}).reduce((sum, item) => sum + item.atr4, 0),
        atr5: votes.filter((myVotes)=> {myVotes.candidateId = user.id; myVotes.year = 2025}).reduce((sum, item) => sum + item.atr5, 0),
        atr6: votes.filter((myVotes)=> {myVotes.candidateId = user.id; myVotes.year = 2025}).reduce((sum, item) => sum + item.atr6, 0)
})
setCardDeck([...cardDeck, cardData])
 
       });
    }

    useEffect(() => {
        handleRankResults();
        axios.get("http://localhost:5000/votes").then(res => setVotes(res.data)).catch(error => console.error("Error fetching votes:", error));
        axios.get("http://localhost:5000/users").then(res => setCandidates(res.data)).catch(error => console.error("Error fetching candidates:", error));
    }, []);

    return (
        <>
            <div>
                <div className="cardDisplay">
                    <div className="cardGrid">
                        {cardDeck.map((card)=> (
                            <FutPlayerCard
                                rating={card.rating}
                                position= {card.position}
                                nation= {card.nation}
                                club= {card.club}
                                skill={card.skill}
                                weakFoot={card.weakFoot}
                                name= {card.name}
                                pac={card.atr1}
                                sho={card.atr2}
                                pas={card.atr3}
                                dri={card.atr4}
                                def={card.atr5}
                                phy={card.atr6}
                            />
                        ))
                        }
                    </div>
                </div>
            </div>
        </>
    )
}