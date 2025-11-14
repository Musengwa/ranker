import { useEffect, useState } from "react";
import axios from "axios";
//import MyPie from "./graph";

export default function AwardAnalysis({ award_id }) {
 // const [graphData, setGraphData] = useState([]);
 // const colors = ["blue", "green", "red", "orange", "yellow", "purple", "grey"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/awards");
        const award = response.data.find(a => a.id === award_id);
        
        if (award) {
          // Get the most recent year's data
          const latestYear = award.years.reduce((latest, current) => 
            current.year > latest.year ? current : latest
          );

          // Transform candidates into pie chart data
          /**const pieData = latestYear.candidates
            .filter(candidate => candidate.voters.length > 0)
            .map((candidate, index) => ({
              id: candidate.candidate,
              value: candidate.voters.length,
              label: candidate.candidate,
              color: colors[index % colors.length]
            }));

          setGraphData(pieData);  */
        }
      } catch (error) {
        console.error("Error fetching awards:", error);
      }
    };

    fetchData();
  }, [award_id]);

  return (
    <div>
      {/**<MyPie data={graphData} title={award_id} />**/}
    </div>
  );
}