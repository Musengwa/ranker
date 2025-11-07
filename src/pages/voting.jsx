import UserCard from "../components/userCard";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Nav from "../components/nav";
import { useUser } from "../context/currentUserContext";
import { Helmet } from "react-helmet";

export default function Vote() {
    const { user: currentUser, setUser } = useUser();
    const [candidates, setCandidates] = useState([]); // State to store candidates
    
    // Fetch users from JSON server
    const fetchUsers = useCallback(async () => {
        try {
            const response = await axios.get("http://localhost:5000/users");
            const users = response.data;

            // Filter out the current user
            const filteredCandidates = users.filter(user => user.id !== currentUser.id);
            setCandidates(filteredCandidates);

            // Set the current user
            const user = users.find(user => user.id === currentUser.id);
            setUser(user);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }, [currentUser, setUser]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return (
        <>
            <Nav/>
            <Helmet>
                <title>Rank Candidates | Voting Page</title>
                <meta name="description" content="Vote and rank candidates on the Ranker platform." />
                <meta name="keywords" content="voting, ranker, candidates, user ranking" />
            </Helmet>
            <h1 style={{color: "ghostwhite", fontSize: 30, fontWeight:300, padding: 7, marginLeft: 30 }}>rank</h1>
            <div className="candidates">
                {candidates.map(candidate => (
                    <UserCard
                        key={candidate.id}
                        candidate={candidate}
                        voter={currentUser}
                    />
                ))}
            </div>
        </>
    );
}