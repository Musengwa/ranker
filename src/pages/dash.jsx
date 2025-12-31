import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/currentUserContext";
import Nav from "../components/nav";
import UserCard from "../components/userCard";
import { Helmet } from "react-helmet";
import supabase from "../config/supabaseClients";
import { 
  FiRefreshCw, FiX, FiUser, FiAward, FiCheck, FiTrash2, 
  FiBarChart2, FiList, FiStar, FiShare2,
  FiUsers, FiThumbsUp, FiActivity, FiTrendingUp, FiTarget
} from "react-icons/fi";

import "./dash.css";

const HandleCard = ({ candidate, voter, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">
            <FiUser /> Candidate Details
          </h3>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <div className="modal-content">
          <div
            style={{
              borderRadius: "1rem",
              overflow: "hidden",
              boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
              background: "#18181b",
              maxWidth: 320,
              margin: "0 auto"
            }}
          >
            <UserCard candidate={candidate} voter={voter} />
          </div>
        </div>
      </div>
    </div>
  );
};


const VotedAwardsSection = ({ awards, users, currentUser, onVoteAgain }) => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  if (!currentUser) return null;

  return (
    <div>
      <div className="section-title">
        <FiAward size={26} />
        <h2>{currentYear} Awards</h2>
      </div>

      <div className="awards-grid">
        {awards.map(award => {
          // In relational DB design the mapping is different — this UI displays whether the current user
          // has any vote_award_values entry for the current year.
          // We'll mark Voted if `award._votedByCurrentUser` was set when loading awards (or compute externally).
          const voted = !!award._votedByCurrentUser;
          const votedCandidateName = award._votedCandidateName || null;

          return (
            <div
              className="award-card"
              key={award.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate('/awards', { state: { selectedAwardId: award.id } })}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate('/awards', { state: { selectedAwardId: award.id } }); }}
              style={{ cursor: 'pointer' }}
            >
              <div className="award-name">
                <FiStar size={20} color="#f59e0b" />
                {award.name}
              </div>
              
              <div className="voted-info">
                {votedCandidateName ? (
                  <span className="voted-candidate">
                    <FiCheck size={18} color="#10b981" />
                    {votedCandidateName}
                  </span>
                ) : (
                  <span className="voted-candidate" style={{ color: "#94a3b8" }}>
                    Not voted
                  </span>
                )}
                
                {voted && (
                  <button 
                    className="icon-btn"
                    onClick={(e) => { e.stopPropagation(); onVoteAgain(award.id); }}
                    title="Remove vote"
                    aria-label={`Remove vote for ${award.name}`}
                  >
                    <FiTrash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const HandleDisplay = () => {
  const [myVotes, setMyVotes] = useState([]);
  const [selectedVote, setSelectedVote] = useState(null);
  const [awards, setAwards] = useState([]);
  const [users, setUsers] = useState([]);
  const [view, setView] = useState("awards");

  const { user: currentUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  // Fetch users and awards once on mount
  useEffect(() => {
    const loadInitial = async () => {
      try {
        const [{ data: usersData, error: usersError }, { data: awardsData, error: awardsError }] = await Promise.all([
          supabase.from("users").select("*"),
          supabase.from("awards").select("*")
        ]);

        if (usersError) throw usersError;
        if (awardsError) throw awardsError;

        setUsers(usersData || []);
        setAwards(awardsData || []);
      } catch (err) {
        console.error("Error loading initial data:", err);
      }
    };

    loadInitial();
  }, []);

  const enrichAwardsWithUserVotes = useCallback(async (awardsList, voterId, year) => {
    // For quick UI marks: for each award, check if there exists a vote_award_values entry for this voter+year linking to the award
    try {
      if (!voterId) return awardsList;

      // get votes IDs for this voter + year (we also need candidateid)
      const { data: votesForVoter, error: votesErr } = await supabase
        .from("votes")
        .select("id,candidateid")
        .eq("voterid", voterId)
        .eq("year", year);

      if (votesErr) throw votesErr;
      const voteIds = (votesForVoter || []).map(v => v.id);
      if (voteIds.length === 0) {
        // no votes yet — mark nothing
        return awardsList.map(a => ({ ...a, _votedByCurrentUser: false, _votedCandidateName: null }));
      }

      const { data: awardLinks, error: awardLinksErr } = await supabase
        .from("vote_award_values")
        .select("voteid,awardid")
        .in("voteid", voteIds);

      if (awardLinksErr) throw awardLinksErr;

      // Map awardId -> voteId (take first found)
      const awardToVote = {};
      awardLinks.forEach(al => {
        if (!awardToVote[al.awardid]) awardToVote[al.awardid] = al.voteid;
      });

      // Ensure we have candidate user records for all votes (avoid missing names)
      const candidateIds = [...new Set((votesForVoter || []).map(v => v.candidateid).filter(Boolean))];
      const missingCandidateIds = candidateIds.filter(id => !users.find(u => String(u.id) === String(id)));

      let fetchedCandidates = [];
      if (missingCandidateIds.length > 0) {
        const { data: fetched, error: fetchedErr } = await supabase
          .from("users")
          .select("*")
          .in("id", missingCandidateIds.map(String));

        if (fetchedErr) {
          console.warn("Could not fetch missing candidate users:", fetchedErr);
        } else {
          fetchedCandidates = fetched || [];
          // merge into users state to cache them for later
          setUsers(prev => {
            const existingIds = new Set(prev.map(u => String(u.id)));
            const toAdd = fetchedCandidates.filter(c => !existingIds.has(String(c.id)));
            return toAdd.length ? [...prev, ...toAdd] : prev;
          });
        }
      }

      // Build a local map of id -> name using both cached users and fetched candidates
      const localUserMap = {};
      (users || []).forEach(u => { localUserMap[String(u.id)] = u.name; });
      fetchedCandidates.forEach(u => { localUserMap[String(u.id)] = u.name; });

      // Map voteId -> candidate name using votesForVoter -> localUserMap
      const voteIdToCandidateName = {};
      for (const v of votesForVoter) {
        const candName = localUserMap[String(v.candidateid)] || null;
        if (candName) voteIdToCandidateName[v.id] = candName;
      }

      // Attach helper flags to awards
      return awardsList.map(a => {
        const voteId = awardToVote[a.id];
        return {
          ...a,
          _votedByCurrentUser: !!voteId,
          _votedCandidateName: voteId ? voteIdToCandidateName[voteId] : null
        };
      });
    } catch (err) {
      console.error("Error enriching awards:", err);
      return awardsList;
    }
  }, [users]);

  // Load the current user's votes for the current year
  const handleMyVotes = useCallback(async () => {
    try {
      if (!currentUser) {
        setMyVotes([]);
        return;
      }
      const currentYear = new Date().getFullYear();

      // 1) Get votes rows for this voter and year
      const { data: votesData, error: votesError } = await supabase
        .from("votes")
        .select("*")
        .eq("voterid", currentUser.id)
        .eq("year", currentYear);

      if (votesError) throw votesError;

      const votesWithDetails = [];

      // Fetch all attribute rows for the votes in one batch if possible
      const voteIds = (votesData || []).map(v => v.id);
      let attributeRows = [];
      if (voteIds.length > 0) {
        const { data: avData, error: avError } = await supabase
          .from("vote_attribute_values")
          .select("*")
          .in("voteid", voteIds);

        if (avError) throw avError;
        attributeRows = avData || [];
      }

      // Preload attributes definitions for all attributeids we need
      const attributeIds = [...new Set(attributeRows.map(a => a.attributeid))].filter(Boolean);
      let attributeDefs = [];
      if (attributeIds.length > 0) {
        const { data: attrsData, error: attrsError } = await supabase
          .from("attributes")
          .select("*")
          .in("id", attributeIds);

        if (attrsError) throw attrsError;
        attributeDefs = attrsData || [];
      }

      // Build votesWithDetails array
      for (const v of (votesData || [])) {
        const candidate = users.find(u => String(u.id) === String(v.candidateid)) || null;
        const voter = users.find(u => String(u.id) === String(v.voterid)) || null;

        // attributes for this vote
        const thisVoteAttrRows = attributeRows.filter(ar => String(ar.voteid) === String(v.id));
        const attributes = thisVoteAttrRows.map(ar => {
          const def = attributeDefs.find(d => String(d.id) === String(ar.attributeid));
          return {
            id: ar.attributeid,
            name: def ? def.name : `Attr ${ar.attributeid}`,
            value: ar.value
          };
        });

        votesWithDetails.push({
          ...v,
          candidate,
          voter,
          attributes
        });
      }

      setMyVotes(votesWithDetails);

      // Also update awards flags for the UI
      const currentAwards = await enrichAwardsWithUserVotes(await (async () => {
        const { data } = await supabase.from("awards").select("*");
        return data || [];
      })(), currentUser.id, currentYear);

      setAwards(currentAwards);
    } catch (error) {
      console.error("Error fetching votes:", error);
    }
  }, [currentUser, users, enrichAwardsWithUserVotes]);

  useEffect(() => {
    handleMyVotes();
    // ensure awards & users are fresh
    const reload = async () => {
      try {
        const { data: awardsData } = await supabase.from("awards").select("*");
        const { data: usersData } = await supabase.from("users").select("*");
        setAwards(awardsData || []);
        setUsers(usersData || []);
      } catch (err) {
        console.error("Error reloading awards/users:", err);
      }
    };
    reload();
  }, [handleMyVotes]);

  // Realtime: refresh when any vote_award_values change so dashboard reflects votes immediately
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('public:vote_award_values')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vote_award_values' }, () => {
        // Refresh the current user's votes/award marks — handleMyVotes is safe and will be a no-op if not needed
        handleMyVotes();
      })
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        // supabase client variations may use different unsubscribe methods; don't let this crash
        console.warn('Failed to remove realtime channel', err);
      }
    };
  }, [currentUser, handleMyVotes]);

  const fetchCandidateAndVoter = useCallback(async (candidateID, voterID) => {
    try {
      // Try to use cached users first
      let candidate = users.find(u => String(u.id) === String(candidateID));
      let voter = users.find(u => String(u.id) === String(voterID));

      // If not found, fetch them directly
      if (!candidate || !voter) {
        const idsToFetch = [candidateID, voterID].filter(Boolean).map(String);
        const { data: fetchedUsers, error: usersError } = await supabase
          .from("users")
          .select("*")
          .in("id", idsToFetch);

        if (usersError) throw usersError;

        if (!candidate) candidate = fetchedUsers.find(u => String(u.id) === String(candidateID)) || null;
        if (!voter) voter = fetchedUsers.find(u => String(u.id) === String(voterID)) || null;
      }

      setSelectedVote({ candidate, voter });
    } catch (error) {
      console.error("Error fetching candidate and voter:", error);
    }
  }, [users]);

  const handleCloseCard = () => {
    setSelectedVote(null);
  };

  // Remove a user's vote link to an award (delete vote_award_values rows for the current user's votes for that award)
  const handleVoteAgain = async (awardId) => {
    try {
      if (!currentUser) return;
      const currentYear = new Date().getFullYear();

      // 1) Get vote IDs for this voter + year
      const { data: votesForVoter, error: votesErr } = await supabase
        .from("votes")
        .select("id")
        .eq("voterid", currentUser.id)
        .eq("year", currentYear);

      if (votesErr) throw votesErr;
      const voteIds = (votesForVoter || []).map(v => v.id);
      if (voteIds.length === 0) return;

      // 2) Delete vote_award_values where voteid in (...) AND awardid == awardId
      const { error: delErr } = await supabase
        .from("vote_award_values")
        .delete()
        .in("voteid", voteIds)
        .eq("awardid", awardId);

      if (delErr) throw delErr;

      // Refresh local state
      await handleMyVotes();
    } catch (err) {
      console.error("Error removing vote:", err);
    }
  };

  // Stats data for dashboard (you can compute live values with queries later)
  const stats = [
    { icon: <FiUsers />, value: "9", label: "Total Candidates" },
    { icon: <FiThumbsUp />, value: String(myVotes.length), label: "Your Votes" },
  ];

  return (
    <>
    <Nav/>
    <main className="ranker-main">
      <Helmet>
        <title>Your Votes Dashboard | Ranker</title>
        <meta name="description" content="View and manage your votes on Ranker. See candidates, attributes, and more." />
      </Helmet>
      
      <div className="content-wrapper">
        <div className="header-container">
          <h1 className="app-title">
            <FiBarChart2 /> Ranker Dashboard
          </h1>
          
          <div className="user-info">
            <div className="user-details">
              <div className="user-name">{currentUser?.name || "User"}</div>
              <div className="user-role">Voter</div>
            </div>
            <div className="user-avatar">
              <FiUser size={22} />
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div className="stat-card" key={index}>
              <div className="stat-icon">
                {stat.icon}
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
        
        <div className="tab-container">
          <button 
            className={`tab-btn ${view === "awards" ? "active" : ""}`}
            onClick={() => setView("awards")}
          >
            <FiAward size={20} />
            <span>Awards</span>
          </button>
          
          <button 
            className={`tab-btn ${view === "votes" ? "active" : ""}`}
            onClick={() => setView("votes")}
          >
            <FiList size={20} />
            <span>Your Votes</span>
          </button>
        </div>
        
        {view === "awards" && (
          <VotedAwardsSection
            awards={awards}
            users={users}
            currentUser={currentUser}
            onVoteAgain={handleVoteAgain}
          />
        )}
        
        {view === "votes" && (
          <div>
            <div className="section-title">
              <FiList size={26} />
              <h2>Your Votes</h2>
              
              <button 
                className="icon-btn" 
                onClick={handleMyVotes}
                style={{ marginLeft: "auto" }}
                title="Refresh votes"
              >
                <FiRefreshCw size={20} />
              </button>
            </div>
            
            <div className="card-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {myVotes.map((myVote, index) => (
                <div 
                  className="card vote-card" 
                  key={myVote.id}
                  style={{ "--index": index, backgroundImage: `url(/images/voter_card.jpg)` }}
                >
                  <div className="card-header">
                    <h3 
                      className="card-title" 
                      onClick={() => fetchCandidateAndVoter(myVote.candidateid, myVote.voterid)}
                      style={{ cursor: "pointer" }}
                    >
                      <FiUser size={18} />
                      {myVote.candidate ? myVote.candidate.name : `Candidate ${myVote.candidateid}`}
                    </h3>
                    
                    <div className="card-actions">
                      <button className="icon-btn" title="Share">
                        <FiShare2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="attributes-grid">
                    {myVote.attributes.map((attribute, aIndex) => (
                      <div className="attribute-item" key={`${myVote.id}-${attribute.id || aIndex}`}>
                        <div className="attribute-label">
                          <FiTarget size={14} />
                          {attribute.name}
                        </div>
                        <div className="attribute-value">
                          <FiStar size={16} color="#f59e0b" />
                          {attribute.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {selectedVote && (
        <HandleCard
          candidate={selectedVote.candidate}
          voter={selectedVote.voter}
          onClose={handleCloseCard}
        />
      )}
    </main>
    </>
  );
};

export default HandleDisplay;