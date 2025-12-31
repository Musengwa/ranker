import FutPlayerCard from "../components/fc_card";
import { useEffect, useState } from "react";
import supabase from "../config/supabaseClients";
import Nav from "../components/nav"
import AwardResultsView from "../components/awardResults"

export default function ShowRoom() {

  const [cardDeck, setCardDeck] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch users
      const { data: users, error: userErr } = await supabase
        .from("users")
        .select("*");

      if (userErr) {
        console.error("Error fetching users:", userErr);
        return;
      }

      // Fetch attribute results view
      const { data: attrs, error: attrErr } = await supabase
        .from("attribute_results")
        .select("*");

      if (attrErr) {
        console.error("Error fetching attribute results:", attrErr);
        return;
      }

      // Build card deck (round attribute averages to integers and compute integer rating)
      const deck = users.map(user => {
        const userAttrs = attrs.filter(a => a.candidateid === user.id);

        const attrMap = {};
        userAttrs.forEach(row => {
          // Ensure we store integer values
          attrMap[`atr${row.attributeid}`] = Math.round(Number(row.avgrating) || 0);
        });

        const a1 = attrMap.atr1 || 0;
        const a2 = attrMap.atr2 || 0;
        const a3 = attrMap.atr3 || 0;
        const a4 = attrMap.atr4 || 0;
        const a5 = attrMap.atr5 || 0;
        const a6 = attrMap.atr6 || 0;

        return {
          // Integer rating (rounded average of attributes)
          rating: Math.round((a1 + a2 + a3 + a4 + a5 + a6) / 6) || 0,
          position: user.position || "N/A",
          nation: user.country || "zambia.svg",
          club: user.club || "N/A",
          name: user.name,
          pfp: user.pfp || "default_pfp",
          ...attrMap
        };
      });

      setCardDeck(deck);
    };

    fetchData();
  }, []);

  return (
    <div style={{backgroundColor: 'black'}}>
        <Nav/>
     <AwardResultsView/>
      <div className="cardGrid">
        {cardDeck.map((card, i) => (
          <FutPlayerCard
            key={i}
            position = {card.position}
            nation={card.nation}
            club={card.club}
            playerImage = {card.pfp}
            name={card.name}
            pac={card.atr1 || 0}
            sho={card.atr2 || 0}
            pas={card.atr3 || 0}
            dri={card.atr4 || 0}
            def={card.atr5 || 0}
            phy={card.atr6 || 0}
            rating={card.rating || 0}
          />
        ))}
      </div>
    </div>
  );
}
