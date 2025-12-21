import { useEffect, useState } from "react";
import supabase from "../config/supabaseClients";

export default function AwardResultsView() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const year = new Date().getFullYear();

  useEffect(() => {
    const fetchResults = async () => {
      const { data, error } = await supabase
        .from("award_vote_results")
        .select("*")
        .eq("year", year)
        .order("award_name", { ascending: true })
        .order("candidate_name", { ascending: true });

      if (error) {
        console.error("Results fetch error:", error);
        return;
      }

      setResults(data);
      setLoading(false);
    };

    fetchResults();
  }, [year]);

  if (loading) {
    return <p style={{ color: "#6fa8dc" }}>Loading results…</p>;
  }

  // Group by award → candidate
  const grouped = results.reduce((acc, row) => {
    acc[row.award_name] ??= {};
    acc[row.award_name][row.candidate_name] ??= [];
    acc[row.award_name][row.candidate_name].push(row.voter_name);
    return acc;
  }, {});

  return (
    <section style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 20 }}>Award Voting Results ({year})</h1>

      {Object.entries(grouped.map ?? grouped).map(([award, candidates]) => (
        <article
          key={award}
          style={{
            marginBottom: 30,
            border: "1px solid #2a2a2a",
            borderRadius: 10,
            padding: 16,
            background: "#111"
          }}
        >
          <h2 style={{ borderBottom: "1px solid #333", paddingBottom: 8 }}>
            🏆 {award}
          </h2>

          {Object.entries(candidates).map(([candidate, voters]) => (
            <div
              key={candidate}
              style={{
                marginTop: 14,
                padding: 12,
                background: "#161616",
                borderRadius: 8
              }}
            >
              <strong style={{ fontSize: 16 }}>
                {candidate}
              </strong>
              <span style={{ marginLeft: 8, color: "#aaa" }}>
                ({voters.length} vote{voters.length !== 1 && "s"})
              </span>

              <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                {voters.map((voter, i) => (
                  <li key={i} style={{ color: "#bbb", fontSize: 14 }}>
                    {voter}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </article>
      ))}
    </section>
  );
}
