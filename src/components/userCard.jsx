import { useState, useEffect } from "react";
import axios from "axios";

export default function UserCard({ candidate, voter }) {
    // State to store all attribute values
    const [attributeValues, setAttributeValues] = useState({});
    const [attributes, setAttributes] = useState([]);

    // Fetch attributes from JSON server
    const fetchAttributes = async () => {
        try {
            const response = await axios.get("http://localhost:5000/attribute");
            setAttributes(response.data);
        } catch (error) {
            console.error("Error fetching attributes:", error);
        }
    };

    useEffect(() => {
        fetchAttributes();
    }, []);

    // Function to handle changes for individual attributes
    const handleAttributeChange = (id, value) => {
        // Update only the specific attribute value in the state
        setAttributeValues((prevValues) => ({
            ...prevValues,
            [id]: value, // Use the attribute ID as the key
        }));
    };

    const handleAttributesValues = async () => {
        try {
            // Check if a vote already exists for this candidate and voter
            const existingVoteResponse = await axios.get("http://localhost:5000/userXvotes", {
                params: {
                    candidateID: candidate.id,
                    voterID: voter.id,
                },
            });

            const existingVote = existingVoteResponse.data[0]; // Assuming the API returns an array

            // Prepare the payload with the updated attribute values
            const payload = {
                candidateID: candidate.id,
                voterID: voter.id,
                attributes: Object.entries(attributeValues).map(([name, value]) => ({
                    name,
                    value,
                })),
            };

            if (existingVote) {
                // Update the existing vote
                await axios.put(`http://localhost:5000/userXvotes/${existingVote.id}`, payload);
                alert("Vote updated successfully!");
            } else {
                // Create a new vote
                await axios.post("http://localhost:5000/userXvotes", payload);
                alert("Vote submitted successfully!");
            }
        } catch (error) {
            console.error("Error submitting or updating vote:", error);
        }
    };

    return (
        <div className="card">
            <div className="candidate-info" key={candidate.id}>
                <h2>name: {candidate.name}</h2>
            </div>
            <div className="attributes">
                {attributes.map((attr) => (
                    <div key={attr.id}>
                        {/* Render each attribute input field */}
                        <label htmlFor={attr.name}>{attr.name}</label>
                        <input
                            name={attr.name}
                            value={attributeValues[attr.id] || ""} // Ensure independent values
                            type="text"
                            onChange={(e) => handleAttributeChange(attr.id, e.target.value)} // Update specific attribute
                        />
                    </div>
                ))}
            </div>
            <button className="submit" onClick={handleAttributesValues}>
                Submit
            </button>
        </div>
    );
}