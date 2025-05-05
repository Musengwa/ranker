import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export default function UserCard({ candidate, voter }) {
    const [attributeValues, setAttributeValues] = useState({});
    const [updatedValues, setUpdatedValues] = useState({});
    const [attributes, setAttributes] = useState([]);

    // Fetch attributes from JSON server
    const fetchAttributes = useCallback(async () => {
        try {
            const response = await axios.get("http://localhost:5000/attribute");
            setAttributes(response.data);
        } catch (error) {
            console.error("Error fetching attributes:", error);
        }
    }, []);

    // Fetch existing vote data for the candidate and voter
    const fetchExistingVote = useCallback(async () => {
        try {
            const response = await axios.get("http://localhost:5000/userXvotes", {
                params: {
                    candidateID: candidate.id,
                    voterID: voter.id,
                },
            });

            const existingVote = response.data[0]; // Assuming the API returns an array
            if (existingVote) {
                const existingAttributeValues = {};
                existingVote.attributes.forEach((attr) => {
                    existingAttributeValues[attr.name] = attr.value;
                });
                setAttributeValues(existingAttributeValues);
            }
        } catch (error) {
            console.error("Error fetching existing vote:", error);
        }
    }, [candidate.id, voter.id]);

    useEffect(() => {
        fetchAttributes();
        fetchExistingVote();
    }, [fetchAttributes, fetchExistingVote]);

    // Handle changes for individual attributes
    const handleAttributeChange = (name, value) => {
        setUpdatedValues((prevValues) => ({
            ...prevValues,
            [name]: value, // Track only changed fields
        }));
    };

    const handleAttributesValues = async () => {
        try {
            const existingVoteResponse = await axios.get("http://localhost:5000/userXvotes", {
                params: {
                    candidateID: candidate.id,
                    voterID: voter.id,
                },
            });

            const existingVote = existingVoteResponse.data[0];
            const payload = {
                candidateID: candidate.id,
                voterID: voter.id,
                attributes: Object.entries({
                    ...attributeValues,
                    ...updatedValues, // Merge existing values with updated values
                }).map(([name, value]) => ({
                    name,
                    value,
                })),
            };

            if (existingVote) {
                await axios.put(`http://localhost:5000/userXvotes/${existingVote.id}`, payload);
                alert("Vote updated successfully!");
            } else {
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
                        <label htmlFor={attr.name}>{attr.name}</label>
                        <input
                            name={attr.name}
                            placeholder={attributeValues[attr.name] || ""} // Show last value as placeholder
                            defaultValue={updatedValues[attr.name] || ""} // Allow editing
                            type="text"
                            onChange={(e) => handleAttributeChange(attr.name, e.target.value)} // Track changes
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