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
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: auth } = await supabase.auth.getUser();
    setUser(auth?.user);

    const { data: totals } = await supabase
      .from("candidate_vote_totals")
      .select("*")
      .eq("year", year);

    const { data: attrs } = await supabase
      .from("candidate_attribute_analysis")
      .select("*")
      .eq("year", year);

    setVoteTotals(totals || []);
    setAttributeData(attrs || []);
  };

  const totalVotes = voteTotals.reduce((s, v) => s + v.votes, 0);

  // Pie chart data
  const pieData = voteTotals.map((c, i) => ({
    id: i,
    value: c.votes,
    label: c.candidate_name
  }));

  // Group attribute data
  const attributes = [...new Set(attributeData.map(a => a.attribute))];
  const candidates = [...new Set(attributeData.map(a => a.candidate_name))];
  const voters = [...new Set(attributeData.map(a => a.voterid))];

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

          {/* PIE — VOTES PER CANDIDATE */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h6">Vote Distribution</Typography>
            <PieChart
              series={[{ data: pieData }]}
              height={260}
            />
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
                    parseFloat(((v.votes / totalVotes) * 100).toFixed(1))
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
