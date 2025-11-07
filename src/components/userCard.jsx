import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { FiUser, FiStar, FiInfo, FiCheckCircle, FiX } from "react-icons/fi";

// --- Dark Glass UserCard with Background Image ---
const userCardStyles = `
.ranker-usercard {
  position: relative;
  width: 100%;
  max-width: 300px;
  aspect-ratio: 3/4;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  color: #e2e8f0;
  margin: 1rem auto;
}

.ranker-usercard-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  z-index: 1;
}

.ranker-usercard-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(50, 50, 60, 0.76);
  backdrop-filter: blur(15px);
  z-index: 2;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

.ranker-usercard-header {
  text-align: center;
  margin-bottom: 1.5rem;
  z-index: 3;
}

.ranker-usercard-name {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #e2e8f0;
}

.ranker-usercard-details {
  font-size: 0.9rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.ranker-usercard-attributes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.2rem;
  background: rgba(19, 21, 25, 0.5);
  border: 1px solid rgba(74, 90, 121, 0.2);
  border-radius: 0.6rem;
  margin-bottom: 0.5rem;
  padding: 8px
  z-index: 3;
}

.ranker-usercard-attr-item {
  padding: 0.2rem;
  margin top: 0.1 rem;
}

.ranker-usercard-label {
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.4rem;
  display: flex;
  align-items: center;
  gap: 0rem;
  color: #94a3b8;
}

.ranker-usercard-label svg {
  color: #f59e0b;
}

.ranker-usercard-input {
  width: 70%;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(74, 90, 121, 0.3);
  border-radius: 0.5rem;
  padding: 0.2rem;
  color: #e2e8f0;
  text-align: center;
  font-size: 0.8rem;
}

.ranker-usercard-input:focus {
  outline: none;
  border-color: #818cf8;
}

.ranker-usercard-attr-details {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 85%;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(74, 90, 121, 0.3);
  border-radius: 0.8rem;
  padding: 0.7rem;
  z-index: 10;
  backdrop-filter: blur(10px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.ranker-usercard-submit {
  width: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 0.7rem;
  padding: 0.8rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: auto;
  z-index: 3;
}

@media (max-width: 400px) {
  .ranker-usercard {
    max-width: 280px;
  }
  
  .ranker-usercard-attributes {
    grid-template-columns: 1fr;
  }
}
`;

// Inject the CSS
if (typeof document !== "undefined" && !document.getElementById("ranker-usercard-css")) {
  const style = document.createElement("style");
  style.id = "ranker-usercard-css";
  style.innerHTML = userCardStyles;
  document.head.appendChild(style);
}

export default function UserCard({ candidate, voter }) {
  const [attributeValues, setAttributeValues] = useState({});
  const [attributes, setAttributes] = useState([]);
  const [openDetail, setOpenDetail] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/attribute")
      .then(response => setAttributes(response.data))
      .catch(error => console.error("Error fetching attributes:", error));
  }, []);

  const handleAttributeChange = (id, value) => {
    setAttributeValues(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const toInt = (val) => {
    const num = parseInt(val, 10);
    return isNaN(num) ? 0 : num;
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
        attributes: Object.entries(attributeValues).map(([id, value]) => {
          const attr = attributes.find(a => a.id === id);
          return {
            name: attr ? attr.name : id,
            value: toInt(value),
          };
        }),
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
    <article className="ranker-usercard">
      <div 
        className="ranker-usercard-bg"
        style={{ backgroundImage: `url(${candidate.pfp || '/images/default-avatar.jpg'})` }}
      ></div>
      
      <div className="ranker-usercard-overlay">
        <div className="ranker-usercard-header">
          <h2 className="ranker-usercard-name">
            <FiUser size={20} />
            {candidate.name}
          </h2>
          <div className="ranker-usercard-details">{candidate.details}</div>
        </div>
        
        <form
          className="ranker-usercard-attributes"
          onSubmit={e => {
            e.preventDefault();
            handleAttributesValues();
          }}
        >
          {attributes.map((attr) => (
            <div key={attr.id} className="ranker-usercard-attr-item">
              <label
                htmlFor={`attr-${attr.id}`}
                className="ranker-usercard-label"
                onClick={() => setOpenDetail(openDetail === attr.id ? null : attr.id)}
              >
                <FiStar size={14} />
                {attr.name}
                <FiInfo size={13} style={{ marginLeft: 5, cursor: "pointer" }} />
              </label>
              <input
                id={`attr-${attr.id}`}
                name={attr.name}
                value={attributeValues[attr.id] || ""}
                type="text"
                className="ranker-usercard-input"
                onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                maxLength={6}
                inputMode="numeric"
                placeholder="0-100"
              />
            </div>
          ))}
        </form>
        
        <button className="ranker-usercard-submit" type="submit">
          <FiCheckCircle size={18} />
          Submit Vote
        </button>
      </div>
      
      {openDetail && (
        <div className="ranker-usercard-attr-details">
          <button 
            onClick={() => setOpenDetail(null)}
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <FiX size={18} />
          </button>
          {attributes.find(a => a.id === openDetail)?.details}
        </div>
      )}
    </article>
  );
}

UserCard.propTypes = {
  candidate: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    pfp: PropTypes.string,
    details: PropTypes.string
  }).isRequired,
  voter: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
  }).isRequired
};