import { useEffect, useState } from "react";
import Nav from "../components/nav";
import { Helmet } from "react-helmet";
import supabase from "../config/supabaseClients";

import {
  PieChart,
  LineChart,
  BarChart
} from "@mui/x-charts";
import { Box, Typography } from "@mui/material";

export default function AwardAnalysis() {
  const year = new Date().getFullYear();

  const [voteTotals, setVoteTotals] = useState([]);
  const [attributeData, setAttributeData] = useState([]);
  const [awardDistributions, setAwardDistributions] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: auth } = await supabase.auth.getUser();
    setUser(auth?.user);

    // attributes (for attribute charts)
    const { data: attrs } = await supabase
      .from("candidate_attribute_analysis")
      .select("*")
      .eq("year", year);

    // awards master list
    const { data: awards } = await supabase.from("awards").select("*");

    // votes for the year
    const { data: votes } = await supabase
      .from("votes")
      .select("id,candidateid")
      .eq("year", year);

    const voteIds = (votes || []).map(v => v.id);

    // award assignments for votes
    let awardValues = [];
    if (voteIds.length) {
      const { data } = await supabase
        .from("vote_award_values")
        .select("voteid,awardid")
        .in("voteid", voteIds);
      awardValues = data || [];
    }

    // candidate names map
    const candidateIds = [...new Set((votes || []).map(v => v.candidateid))];
    let users = [];
    if (candidateIds.length) {
      const { data } = await supabase
        .from("users")
        .select("id,name")
        .in("id", candidateIds);
      users = data || [];
    }
    const usersMap = Object.fromEntries((users || []).map(u => [u.id, u.name]));
    const votesMap = Object.fromEntries((votes || []).map(v => [v.id, v.candidateid]));

    // build award distributions
    const awardDistributions = (awards || []).map(award => {
      const counts = {};
      awardValues.forEach(av => {
        if (av.awardid === award.id) {
          const candidateid = votesMap[av.voteid];
          if (candidateid) counts[candidateid] = (counts[candidateid] || 0) + 1;
        }
      });
      const totals = Object.entries(counts).map(([cid, cnt]) => ({
        candidate_name: usersMap[cid] || `#${cid}`,
        votes: cnt
      }));
      return { awardId: award.id, awardName: award.name, totals };
    });

    // overall totals across awards
    const candidateTotalsMap = {};
    awardValues.forEach(av => {
      const candidateid = votesMap[av.voteid];
      if (candidateid) candidateTotalsMap[candidateid] = (candidateTotalsMap[candidateid] || 0) + 1;
    });
    const candidateTotals = Object.entries(candidateTotalsMap).map(([cid, cnt]) => ({
      candidate_name: usersMap[cid] || `#${cid}`,
      votes: cnt
    }));

    setAwardDistributions(awardDistributions);
    setVoteTotals(candidateTotals);
    setAttributeData(attrs || []);
  };

  const totalVotes = voteTotals.reduce((s, v) => s + v.votes, 0);

  // Group attribute data
  const attributes = [...new Set(attributeData.map(a => a.attribute))];
  const candidates = [...new Set(attributeData.map(a => a.candidate_name))];
  const voters = [...new Set(attributeData.map(a => a.voterid))];

  // Award distributions are computed in loadData and stored in state as `awardDistributions`

  return (
    <>
      <Nav />
      <Helmet>
        <title>Analysis | Ranker</title>
      </Helmet>

<Box sx={{ padding: 4, background: "#0b0b0b", minHeight: "100vh", color: "#fff" }}>
          {/* Force chart elements and page text to white via scoped CSS */}
          <style>{`.analysis-charts, .analysis-charts * { color: #fff !important; }
            .analysis-charts svg text { fill: #fff !important; }
            .analysis-charts svg .legend text { fill: #fff !important; }
            .analysis-charts .legend, .analysis-charts .legend * { color: #fff !important; }
            .analysis-charts .MuiTypography-root { color: #fff !important; }
        `}</style> 

        <div className="analysis-charts">
          <Typography variant="h4" gutterBottom>
            Moderator Analysis ({year})
          </Typography>

          <Typography sx={{ mb: 3 }}>
            Total Votes Cast: <b>{totalVotes}</b>
          </Typography>

          {/* PIE — VOTES PER AWARD */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h6">Vote Distribution by Award</Typography>
            {awardDistributions.length === 0 ? (
              <Typography>No awards or votes yet.</Typography>
            ) : (
              awardDistributions.map(a => (
                <Box key={a.awardId} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1">{a.awardName}</Typography>
                  {a.totals.length === 0 ? (
                    <Typography variant="caption">No votes for this award yet.</Typography>
                  ) : (
                    <PieChart
                      series={[{ data: a.totals.map((t, i) => ({ id: i, value: t.votes, label: t.candidate_name })) }]}
                      height={220}
                    />
                  )}
                </Box>
              ))
            )}
          </Box>

          {/* LINE — ATTRIBUTE PER VOTER */}
          {attributes.map(attr => {
            const series = voters.map(voter => ({
              label: `Voter ${voter}`,
              data: candidates.map(candidate => {
                const entry = attributeData.find(
                  a =>
                    a.attribute === attr &&
                    a.voterid === voter &&
                    a.candidate_name === candidate
                );
                return entry ? entry.value : 0;
              })
            })); 

            return (
              <Box key={attr} sx={{ mb: 6 }}>
                <Typography variant="h6">{attr} — Voter Comparison</Typography>
                <LineChart
                  xAxis={[{ scaleType: "band", data: candidates }]}
                  yAxis={[{ min: 0, max: 100 }]}
                  series={series}
                  height={300}
                />
              </Box>
            );
          })}

          {/* BAR — % OF TOTAL VOTES */}
          <Box sx={{ mt: 6 }}>
            <Typography variant="h6">Vote Share (%)</Typography>
            <BarChart
              xAxis={[{ scaleType: "band", data: candidates }]}
              yAxis={[{ min: 0, max: 100 }]}
              series={[
                {
                  data: voteTotals.map(v =>
                    totalVotes ? parseFloat(((v.votes / totalVotes) * 100).toFixed(1)) : 0
                  )
                }
              ]}
              height={300}
            />
          </Box>
        </div>
      </Box>
    </>
  );
}
