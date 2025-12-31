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

      // Build card deck
      const deck = users.map(user => {
        const userAttrs = attrs.filter(a => a.candidateid === user.id);

        const attrMap = {};
        userAttrs.forEach(row => {
          attrMap[`atr${row.attributeid}`] = row.avgrating || 0;
        });

        return {
          rating: 0,
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
            rating={(card.atr1 + card.atr2 + card.atr3 + card.atr4 + card.atr5 + card.atr6) / 6}
          />
        ))}
      </div>
    </div>
  );
}
