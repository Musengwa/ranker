import supabase from "../config/supabaseClients";
import { useUser } from "../context/currentUserContext";
import { useEffect, useState } from "react";
import "../pages/awardStyle.css";
import { FiAlertTriangle, FiUser, FiInfo } from "react-icons/fi";

// Static inline SVG icon used for all user avatars
const STATIC_USER_SVG = `
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
  <defs>
    <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='#6f42c1'/>
      <stop offset='1' stop-color='#7b2ff7'/>
    </linearGradient>
  </defs>
  <circle cx='100' cy='100' r='96' fill='url(#g)' stroke='white' stroke-width='8'/>
  <circle cx='100' cy='70' r='28' fill='white'/>
  <path d='M60 140c20-24 60-24 80 0' fill='none' stroke='white' stroke-width='10' stroke-linecap='round' stroke-linejoin='round'/>
</svg>`;

const STATIC_USER_ICON = `data:image/svg+xml;utf8,${encodeURIComponent(STATIC_USER_SVG)}`;

export default function SpecialAward({ award, groupId, onVoted }) {
  const { user: currentUser } = useUser();
  const [candidates, setCandidates] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedCandidate, setVotedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [error, setError] = useState(null);

  const year = new Date().getFullYear();

  useEffect(() => {
    console.log("SpecialAward mounted with:", { 
      award, 
      groupId, 
      currentUser: currentUser?.id 
    });
    
    if (!currentUser) {
      console.log("No current user");
      setError("Please log in to vote");
      setLoading(false);
      return;
    }
    
    if (!award) {
      console.log("No award provided");
      setError("No award selected");
      setLoading(false);
      return;
    }
    
    if (!groupId) {
      console.log("No group ID provided");
      setError("No group selected");
      setLoading(false);
      return;
    }
    
    loadData();
    // eslint-disable-next-line
  }, [award, currentUser, groupId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Loading data for award:", award.id, "group:", groupId);
      console.log("Current user:", currentUser.id);

      // 1️⃣ First, get all users in the same group (excluding current user)
      console.log("Fetching group members...");
      const { data: groupMembers, error: groupError } = await supabase
        .from("user_groups")
        .select(`
          userid,
          users!inner (id, name, pfp, email)
        `)
        .eq("groupid", groupId)
        .neq("users.id", currentUser.id); // Exclude current user

      if (groupError) {
        console.error("Error fetching group members:", groupError);
        setError("Failed to load group members");
        throw groupError;
      }

      // Extract user data from the join
      const users = groupMembers?.map(gm => gm.users) || [];
      console.log("Candidates found:", users.length);
      setCandidates(users);

      // 2️⃣ Check if user already voted for this award in this group
      console.log("Checking existing vote...");
      
      // First, get the vote for this user in this group and year
      const { data: existingVote, error: voteError } = await supabase
        .from("votes")
        .select(`
          id,
          candidateid,
          vote_award_values (
            awardid
          )
        `)
        .eq("voterid", currentUser.id)
        .eq("groupid", groupId)
        .eq("year", year)
        .maybeSingle();

      if (voteError && voteError.code !== 'PGRST116') {
        console.error("Error checking vote:", voteError);
        setError("Failed to check voting status");
        throw voteError;
      }

      console.log("Existing vote:", existingVote);

      if (existingVote) {
        // Check if this vote is linked to our award
        const awardLinked = existingVote.vote_award_values?.some(
          vav => vav.awardid === award.id
        );
        
        if (awardLinked) {
          setHasVoted(true);
          const votedUser = users.find(u => u.id === existingVote.candidateid);
          if (votedUser) {
            setVotedCandidate(votedUser);
          } else {
            console.warn("Voted candidate not found in users list");
            // Try to fetch the candidate directly
            const { data: candidateData } = await supabase
              .from("users")
              .select("*")
              .eq("id", existingVote.candidateid)
              .single();
            
            if (candidateData) {
              setVotedCandidate(candidateData);
            } else {
              setVotedCandidate({ 
                id: existingVote.candidateid, 
                name: "Unknown Candidate" 
              });
            }
          }
        } else {
          setHasVoted(false);
          setVotedCandidate(null);
        }
      } else {
        setHasVoted(false);
        setVotedCandidate(null);
      }

    } catch (err) {
      console.error("Error in loadData:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (candidate) => {
    if (!currentUser) {
      setError("Please log in to vote");
      return;
    }
    
    if (!groupId) {
      setError("No group selected");
      return;
    }
    
    setSelectedCandidate(candidate);
    setShowConfirmation(true);
  };

  const confirmVote = async () => {
    if (!selectedCandidate || !currentUser || !groupId) return;

    try {
      setError(null);
      
      console.log("Creating vote for candidate:", selectedCandidate.id);
      console.log("In group:", groupId, "For award:", award.id);

      // 1️⃣ Create vote (with groupid as required by schema)
      const { data: vote, error: voteErr } = await supabase
        .from("votes")
        .insert({
          voterid: currentUser.id,
          candidateid: selectedCandidate.id,
          groupid: groupId,
          year: year
        })
        .select()
        .single();

      if (voteErr) {
        console.error("Vote creation error:", voteErr);
        setError("Failed to submit vote: " + voteErr.message);
        return;
      }

      console.log("Vote created:", vote.id);

      // 2️⃣ Link award to vote
      const { error: awardErr } = await supabase
        .from("vote_award_values")
        .insert({
          voteid: vote.id,
          awardid: award.id
        });

      if (awardErr) {
        console.error("Award link error:", awardErr);
        // Rollback the vote if award linking fails
        await supabase.from("votes").delete().eq("id", vote.id);
        setError("Failed to link award: " + awardErr.message);
        return;
      }

      console.log("Award linked successfully");
      setHasVoted(true);
      setVotedCandidate(selectedCandidate);
      setShowConfirmation(false);
      
      // Show success for 2 seconds before closing
      setTimeout(() => {
        if (onVoted) onVoted();
      }, 2000);
      
    } catch (err) {
      console.error("Vote error:", err);
      setError("An unexpected error occurred: " + err.message);
    }
  };

  const handleVoteAgain = async () => {
    if (!currentUser || !groupId) return;
    
    try {
      setLoading(true);
      
      console.log("Deleting existing vote...");
      
      // Find and delete the existing vote for this user, group, and year
      const { data: existingVote } = await supabase
        .from("votes")
        .select("id")
        .eq("voterid", currentUser.id)
        .eq("groupid", groupId)
        .eq("year", year)
        .maybeSingle();

      if (existingVote) {
        // Delete from vote_award_values first (foreign key constraint)
        await supabase
          .from("vote_award_values")
          .delete()
          .eq("voteid", existingVote.id);
        
        // Then delete the vote
        await supabase
          .from("votes")
          .delete()
          .eq("id", existingVote.id);
        
        console.log("Vote deleted:", existingVote.id);
      }

      setHasVoted(false);
      setVotedCandidate(null);
      setShowConfirmation(false);
      await loadData();
      
    } catch (err) {
      console.error("Error deleting vote:", err);
      setError("Failed to reset vote: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-pulse"></div>
        <p className="loading-text">Loading voting interface...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon"><FiAlertTriangle size={28} /></div>
        <h3>Error</h3>
        <p>{error}</p>
        <button 
          className="retry-button"
          onClick={loadData}
        >
          Retry
        </button>
        <button 
          className="secondary-button"
          onClick={onVoted}
          style={{ marginTop: '10px' }}
        >
          Close
        </button>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="login-prompt">
        <h3>Login Required</h3>
        <p>Please log in to participate in voting.</p>
        <button 
          className="primary-button"
          onClick={onVoted}
          style={{ marginTop: '20px' }}
        >
          Close
        </button>
      </div>
    );
  }

  if (hasVoted && votedCandidate) {
    return (
      <div className="voted-container">
        <div className="success-header">
          <div className="success-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" stroke="#9333EA" strokeWidth="3"/>
              <path d="M16 24L22 30L32 20" stroke="#9333EA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="success-title">Vote Submitted!</h2>
          <p className="success-subtitle">
            Your vote for <span className="award-highlight">{award.name}</span> has been recorded
          </p>
        </div>
        
        <div className="voted-card">
          <div className="voted-avatar">
            <img
              src={STATIC_USER_ICON}
              alt={votedCandidate.name}
              className="avatar-image"
            />
            <div className="voted-badge">Your Pick</div>
          </div>
          <div className="voted-details">
            <h3 className="voted-name">{votedCandidate.name || "Unknown Candidate"}</h3>
            <p className="voted-bio">
              Thank you for participating in this year's awards!
            </p>
            <p className="voted-year">
              Year: {year} • Group Voting
            </p>
          </div>
        </div>
        
        <div className="action-buttons">
          <button className="secondary-button" onClick={handleVoteAgain}>
            Change Vote
          </button>
          <button className="primary-button" onClick={onVoted}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="award-voting-container">
      {/* Confirmation Modal */}
      {showConfirmation && selectedCandidate && (
        <div className="confirmation-overlay">
          <div className="confirmation-modal">
            <h3 className="confirmation-title">Confirm Your Vote</h3>
            <p className="confirmation-text">
              You are about to vote for <strong>{selectedCandidate.name}</strong> in the{" "}
              <strong>{award.name}</strong> category.
            </p>
            <p className="confirmation-details">
              Year: {year} • Group Voting
            </p>
            <p className="confirmation-warning">
              This action cannot be undone unless you use "Change Vote".
            </p>
            
            <div className="confirmation-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-button"
                onClick={confirmVote}
              >
                Confirm Vote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Award Header */}
      <div className="award-header">
        <div className="award-title-section">
          <h1 className="award-title">{award.name}</h1>
          <p className="award-description">{award.details}</p>
        </div>
        <div className="award-meta">
          <span className="meta-tag">Voting Open</span>
          <span className="meta-tag">{year} Awards</span>
          <span className="meta-tag">Group Voting</span>
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="candidates-section">
        <div className="section-header">
          <h2 className="section-title">
            Select Your Candidate {candidates.length > 0 && `(${candidates.length} available)`}
          </h2>
          <p className="section-subtitle">
            Click on a candidate to cast your vote
          </p>
        </div>

        {candidates.length === 0 ? (
          <div className="no-candidates">
            <div className="no-candidates-icon"><FiUser size={36} /></div>
            <h4>No Candidates Available</h4>
            <p>There are no other users in your group to vote for.</p>
            <p className="hint-text">Make sure users are added to your group in the user_groups table.</p>
          </div>
        ) : (
          <div className="candidates-grid">
            {candidates.map(candidate => (
              <div
                key={candidate.id}
                className="candidate-card"
                onClick={() => handleVote(candidate)}
              >
                <div className="candidate-avatar">
                  <img
                    src={STATIC_USER_ICON}
                    alt={candidate.name}
                    className="candidate-image"
                  />
                  <div className="vote-overlay">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                
                <div className="candidate-info">
                  <h3 className="candidate-name">{candidate.name}</h3>
                  <p className="candidate-position">Group Member</p>
                  <p className="candidate-email">{candidate.email || "No email"}</p>
                </div>
                
                <button className="select-button">
                  Select
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 0V16M8 16L14 10M8 16L2 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="voting-info">
          <p><FiInfo style={{ verticalAlign: "middle", marginRight: 8 }} /> You can only vote once per award per year. Use "Change Vote" to modify your selection.</p>
        </div>
      </div>
    </div>
  );
}