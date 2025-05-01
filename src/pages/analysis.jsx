
//should displays total votes
//arrages them by candidate, the votes they recieved
//the an average of it all..
//the average should be an array in an object with the year attached to it
//use a graph comparing the individual attributes of each user
//this should only be viewed by on user, preset in the code, we'll call him the moderater.

import { useEffect, useState } from "react";
import axios from "axios";
import Nav from "../components/nav";

export default function Analysis() {
    const [allVotes, setAllVotes] = useState([]); // Fix: Initialize state properly

    const fetchUsers = async () => {
        try {
            const response = await axios.get("http://localhost:5000/userXvotes");
            const users = response.data;
            setAllVotes(users);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Define PerCandidate as a proper React component
    const PerCandidate = ({ allVotes, candidate }) => {
        const myVotes = allVotes.filter(vote => vote.candidateID === candidate); // Fix: Use candidateID for filtering
        return (
            <div key={candidate}>
                <h2>Candidate ID: {candidate}</h2>
                <div>
                    {myVotes.map(vote => (
                        <div key={vote.id}>
                            <p>Voter ID: {vote.voterID}</p>
                            <ul>
                                {vote.attributes.map(attribute => (
                                    <li key={attribute.id}>
                                        {attribute.name}: {attribute.value}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div>
            <Nav/>
            {allVotes.map(vote => (
                <PerCandidate
                    key={vote.candidateID} // Add a unique key
                    allVotes={allVotes}
                    candidate={vote.candidateID}
                />
            ))}
        </div>
    );
}