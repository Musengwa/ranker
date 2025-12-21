import Nav from "../components/nav";
import SpecialAward from "../components/specialAward";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import supabase from "../config/supabaseClients";
import "../pages/awardStyle.css";
import { FiAward, FiAlertTriangle } from "react-icons/fi";

export default function Awards() {
  const [awards, setAwards] = useState([]);
  const [selectedAward, setSelectedAward] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentGroup, setCurrentGroup] = useState(null);

  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching data...");

        // 1. Fetch awards
        const { data: awardsData, error: awardsError } = await supabase
          .from("awards")
          .select("*")
          .order("id", { ascending: true });

        if (awardsError) {
          console.error("Error fetching awards:", awardsError);
          setError("Failed to load awards");
          setAwards([]);
          return;
        }

        console.log("Awards found:", awardsData?.length || 0);
        setAwards(awardsData || []);

        // 2. Try to get the user's group (simplified - you might want to get this from context/URL)
        const { data: groupsData } = await supabase
          .from("groups")
          .select("id, name")
          .limit(1)
          .maybeSingle();

        if (groupsData) {
          console.log("Using group:", groupsData);
          setCurrentGroup(groupsData);
        } else {
          console.log("No groups found, creating default...");
          // Create a default group for testing if none exists
          const { data: newGroup } = await supabase
            .from("groups")
            .insert([{ 
              name: "Default Group", 
              about: "General voting group",
              year: new Date().getFullYear(),
              creatorid: 1 // You'll need to handle this properly
            }])
            .select()
            .single();
          
          if (newGroup) {
            setCurrentGroup(newGroup);
          }
        }

        // 3. Check for location state
        if (location?.state?.selectedAwardId && awardsData && awardsData.length > 0) {
          const found = awardsData.find(a => String(a.id) === String(location.state.selectedAwardId));
          if (found) {
            console.log("Found award from location state:", found);
            setSelectedAward(found);
          }
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location]);

  const closeAwardModal = () => {
    setSelectedAward(null);
  };

  return (
    <>
      <Nav />
      
      <Helmet>
        <title>Awards | Ranker</title>
        <meta
          name="description"
          content="Vote for your favorite awards on Ranker."
        />
      </Helmet>

      <main className="awards-page">
        <div className="awards-header">
          <h1 className="page-title">Awards Gallery</h1>
          <p className="page-subtitle">Vote for your favorite awards. Each vote counts!</p>
          
          {currentGroup && (
            <div className="group-info">
              <span className="group-badge">Group: {currentGroup.name}</span>
            </div>
          )}
          
          {error && (
            <div className="error-banner">
              <p><FiAlertTriangle style={{ verticalAlign: "middle", marginRight: 8 }} /> Error: {error}</p>
            </div>
          )}
          
          <div className="stats-bar">
            <div className="stat">
              <span className="stat-number">{awards.length}</span>
              <span className="stat-label">Active Awards</span>
            </div>
            <div className="stat">
              <span className="stat-number">{new Date().getFullYear()}</span>
              <span className="stat-label">Voting Year</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading awards...</p>
          </div>
        ) : awards.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FiAward size={48} /></div>
            <h3>No Awards Available</h3>
            <p>There are no awards to display at the moment.</p>
            <p className="hint-text">Make sure your Supabase tables are populated with awards.</p>
            <button 
              className="refresh-button"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
        ) : (
          <>
            <section className="awards-grid">
              {awards.map(award => (
                <div 
                  key={award.id}
                  className="award-card"
                  onClick={() => {
                    console.log("Selected award:", award);
                    setSelectedAward(award);
                  }}
                >
                  <div className="award-card-header">
                    <div className="award-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="award-category">VOTING OPEN</span>
                  </div>
                  
                  <h3 className="award-name">{award.name || "Unnamed Award"}</h3>
                  <p className="award-description">
                    {award.details || "No description available"}
                  </p>
                  
                  <div className="award-footer">
                    <button className="vote-button">
                      <span>Vote Now</span>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 0V16M8 16L14 10M8 16L2 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="award-glow"></div>
                </div>
              ))}
            </section>
            
            {!currentGroup && (
              <div className="warning-banner">
                <p><FiAlertTriangle style={{ verticalAlign: "middle", marginRight: 8 }} /> Note: You need to be in a group to vote. Please create or join a group first.</p>
              </div>
            )}
          </>
        )}

        {selectedAward && currentGroup && (
          <div className="award-modal-overlay" onClick={closeAwardModal}>
            <div className="award-modal-content" onClick={e => e.stopPropagation()}>
              <button className="close-modal-btn" onClick={closeAwardModal}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <SpecialAward
                award={selectedAward}
                groupId={currentGroup.id}
                onVoted={closeAwardModal}
              />
            </div>
          </div>
        )}
      </main>
    </>
  );
}