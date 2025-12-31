import UserCard from "../components/userCard";
import { useEffect, useState, useCallback } from "react";
import Nav from "../components/nav";
import { useUser } from "../context/currentUserContext";
import { Helmet } from "react-helmet";
import supabase from "../config/supabaseClients";
import { useNavigate } from "react-router-dom";

export default function Vote() {
  const { user: currentUser, setUser } = useUser();
  const [candidates, setCandidates] = useState([]); // candidates list
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch users from Supabase and exclude the current user
  const fetchUsers = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      // If no currentUser we still fetch candidates (useful for anonymous browsing),
      // but many flows will want to redirect to login. Uncomment redirect if desired.
      // if (!currentUser) { navigate("/login"); return; }

      // If there is a currentUser, filter them out server-side.
      let query = supabase.from("users").select("*");

      if (currentUser && currentUser.id !== undefined && currentUser.id !== null) {
        // Use server-side filter to avoid transferring unnecessary data
        query = query.neq("id", currentUser.id);
      }

      const { data: users, error: fetchErr } = await query;

      if (fetchErr) {
        throw fetchErr;
      }

      // Filter out the current user (server-side filter applied above when possible,
      // this is an extra client-side safeguard)
      const usersList = (users || []).filter(u => !(currentUser && u.id === currentUser.id));

      // Set candidates to other users (or all users if no currentUser)
      setCandidates(usersList);

      // If we have a currentUser and want to refresh the context user from DB:
      if (currentUser && currentUser.id !== undefined && currentUser.id !== null) {
        // attempt to fetch the authoritative currentUser record
        const { data: freshUser, error: userErr } = await supabase
          .from("users")
          .select("*")
          .eq("id", currentUser.id)
          .maybeSingle();

        if (!userErr && freshUser) {
          setUser(freshUser);
        }
      }
    } catch (err) {
      console.error("Error fetching users from Supabase:", err);
      setError(err.message || "Failed to load users");
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser, setUser, navigate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <>
      <Nav />
      <Helmet>
        <title>Rank Candidates | Voting Page</title>
        <meta name="description" content="Vote and rank candidates on the Ranker platform." />
        <meta name="keywords" content="voting, ranker, candidates, user ranking" />
      </Helmet>

      <div style={{ padding: 20 }}>
        <h1 style={{ color: "ghostwhite", fontSize: 30, fontWeight: 300, padding: 7, marginLeft: 30 }}>
          rank
        </h1>

        {error && (
          <div style={{ color: "salmon", marginLeft: 30 }}>{error}</div>
        )}

        <div className="candidates" style={{ display: "grid", gap: 12, padding: 20 }}>
          {candidates.length === 0 && !loading && (
            <div style={{ color: "#94a3b8", marginLeft: 30 }}>
              No candidates found.
            </div>
          )}

          {candidates.map(candidate => (
            <UserCard
              key={candidate.id}
              candidate={candidate}
              voter={currentUser}
            />
          ))}
        </div>
      </div>
    </>
  );
}