import UserCard from "../components/userCard";
import { useEffect, useState } from "react";
import axios from "axios";
import Nav from "../components/nav";
import { useUser } from "../context/currentUserContext";

export default function Vote() {
    const { user: currentUser, setUser } = useUser();
    const [candidates, setCandidates] = useState([]); // State to store candidates
    
    // Fetch users from JSON server
    const fetchUsers = async () => {
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
    };

    useEffect(() => {
        fetchUsers();
    }, [currentUser]);

    return (
        <div>
            <Nav/>
            <h1>rank</h1>
            <div className="candidates">
                {candidates.map(candidate => (
                    <UserCard
                        key={candidate.id}
                        candidate={candidate}
                        voter={currentUser}
                    />
                ))}
            </div>
        </div>);
        }