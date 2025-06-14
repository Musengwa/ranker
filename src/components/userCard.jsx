import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";

// --- Modern, Fun, Responsive CSS for UserCard ---
const userCardStyles = `
.card {
  background-color: rgb(19, 19, 19);
  border: 2px solid rgb(40, 40, 40);
  border-radius: 1.5rem;
  box-shadow: 0 4px 24pxrgba(99, 101, 241, 0.06);
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  margin: 2rem auto;
  width: 90%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: box-shadow 0.18s, transform 0.18s;
}
.card:hover {
  box-shadow: 0 8px 32pxrgba(99, 165, 241, 0.07);
  transform: translateY(-2px) scale(1.01);
}
.candidate-info {
  text-align: center;
  margin-bottom: 1.2rem;
  width: 100%;
  color: grey;
}
.candidate-info h2, .detailss {
  color:rgb(210, 210, 214);
  font-size: 1.8rem;
  font-weight: 200;
  margin-left: 10px;
  letter-spacing: 1.5px;
  text-align: center;
}
.attributes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.1rem 1.2rem;
  width: 100%;
  justify-items: center;
  align-items: start;
  padding: 5px;
  margin-bottom: 1rem;
  margin-top: 6rem;
}

.label-input {
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin-bottom: 0.7rem;
  gap: 0.2rem; 
}
.attributes > div {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.7rem;
  gap: 0.5rem;
}
.attributes label {
  font-weight: 200;
  color:rgb(165, 164, 186);
  font-size: 1rem;
  cursor: pointer;
  text-align: right;
  margin-bottom: 0;
  min-width: 70px;
}
.attributes input[type="text"] {
  width: 70px;
  min-width: 60px;
  max-width: 90px;
  padding: 0.4rem 0.5rem;
  border: solid 1.5px rgb(117, 117, 117)
  border-radius: 0.7rem;
  font-size: 1rem;
  margin-bottom: 0;
  background:rgb(33, 33, 33);
  color:rgb(216, 216, 216);
  transition: border 0.18s;
  text-align: center;
  display: inline-block;
}
.attributes input[type="text"]:focus {
  border: 2px solidrgb(138, 138, 138);
  outline: none;
  background:rgb(13, 13, 13);
}
.attributes small {
  color: #64748b;
  font-size: 0.93rem;
  margin-left: 0.2rem;
}
.submit {
  margin-top: 1.2rem;
  margin-left: 2rem;
  background: linear-gradient(90deg,rgb(82, 128, 227) 0%,rgb(5, 73, 200) 100%);
  color: #fff;
  border: none;
  border-radius: 2rem;
  padding: 0.7rem 2.2rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8pxrgba(99, 99, 241, 0.13);
  transition: background 0.18s, transform 0.12s;
  align-self: center;
  justify-self: center;

  width: 90%;
  max-width: 320px;
}
.submit:hover, .submit:focus {
  background: linear-gradient(90deg,rgb(14, 65, 250) 0%,rgb(48, 83, 209) 100%);
  transform: scale(1.04);
  outline: none;
}
@media (max-width: 600px) {
  .card {
    padding: 1.2rem 0.5rem 05rem 0.2rem;
    max-width: 98vw;
    min-width: 0;
    margin-top
  }
  .candidate-info h2 {
    font-size: 1.15rem;
  }
  .attributes input[type="text"], .submit {
    font-size: 1rem;
    padding: 0.6rem 0.7rem;
    width: 98%;
    max-width: 98vw;
  }
  
.userimg{
height: 100px;
width: 100px;
border-radius: 50px;
background: white;
border: solid white 1.5px;
}

}
@media (max-width: 700px) {
  .attributes {
    grid-template-columns: 1fr 1fr 1fr ;
    gap: 1rem 0;
  }
  
  .attributes input[type="text"] {
  width: 70px;
  min-width: 40px;
  max-width: 60px;
  padding: 1rem 1rem;
  border: solid 1.5px rgb(117, 117, 117);
  border-radius: 0.8rem;
  font-size: 1rem;
  margin-bottom: 0;
  background:rgb(17, 17, 17);
  color:rgb(174, 174, 174);
  transition: border 0.18s;
  text-align: center;
  display: inline-block;
}

.userimg{
height: 100px;
width: 100px;
border-radius: 50px;
background: white;
border: solid white 1.5px;
margin-bottom: 30px;
padding 10px;
align-self: center;
align-content: center;
justify-self: center;
justify-content: center;
}

.userimg> 

.user-dets{
margin-bottom: 0px;
margin-top: 10px
}
}
`;

// Inject the CSS into the document head
if (typeof document !== "undefined" && !document.getElementById("ranker-usercard-css")) {
  const style = document.createElement("style");
  style.id = "ranker-usercard-css";
  style.innerHTML = userCardStyles;
  document.head.appendChild(style);
}

export default function UserCard({ candidate, voter }) {
    // State to store all attribute values
    const [attributeValues, setAttributeValues] = useState({});
    const [attributes, setAttributes] = useState([]);
    const [openDetail, setOpenDetail] = useState(null); // Track which detail is open

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
        setAttributeValues((prevValues) => ({
            ...prevValues,
            [id]: value,
        }));
    };

    // Helper to safely convert string to integer
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
                attributes: Object.entries(attributeValues).map(([name, value]) => ({
                    name,
                    value: toInt(value), // ensure integer
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
        <article className="card" aria-label={`Vote for ${candidate.name}`}>
          <div className="user-dets">
            <header className="candidate-info" key={candidate.id}>
                <h2>{candidate.name}</h2>
            </header>
            <div className="userimg">
              <img
                alt={candidate.name}
                src={candidate.pfp && candidate.pfp.startsWith("/") ? candidate.pfp : `/images/default-avatar.jpg`}
                onError={e => { e.target.onerror = null; e.target.src = "/images/default-avatar.jpg"; }}
                style={{ width: 100, height: 100, borderRadius: "50%" }}
              /> 
            </div>
            <p className="detailss">{candidate.details}</p>
          </div>            
            <form
  className="attributes"
  onSubmit={e => {
    e.preventDefault();
    handleAttributesValues();
  }}
  aria-label={`Attribute voting form for ${candidate.name}`}
>
  {attributes.map((attr) => (
    <div key={attr.id} className="label-input">
      <label
        htmlFor={`attr-${attr.id}`}
        style={{ cursor: "pointer" }}
        onClick={() => setOpenDetail(openDetail === attr.id ? null : attr.id)}
      >
        {attr.name}
      </label>
      <input
        id={`attr-${attr.id}`}
        name={attr.name}
        value={attributeValues[attr.id] || ""}
        type="text"
        onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
        aria-describedby={`desc-${attr.id}`}
        maxLength={6}
        inputMode="numeric"
      />
      {openDetail === attr.id && (
        <div
          id={`desc-${attr.id}`}
          style={{
            background: "#f1f5f9",
            color: "#334155",
            borderRadius: "0.7rem",
            padding: "0.6rem 1rem",
            margin: "0.3rem 1rem 0.2rem 0",
            fontSize: "0.97rem",
            boxShadow: "0 2px 8px #6366f122",
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2,
            minWidth: "180px",
            textAlign: "center"
          }}
          onClick={() => setOpenDetail(openDetail === attr.id ? null : attr.id)}
        >
          {attr.details}
        </div>
      )}
    </div>
  ))}
  <button className="submit" type="submit">
    Submit
  </button>
</form>
        </article>
    );
}

UserCard.propTypes = {
  candidate: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  voter: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
  }).isRequired
};