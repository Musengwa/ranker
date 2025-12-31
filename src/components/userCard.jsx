import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FiUser, FiStar, FiInfo, FiCheckCircle, FiX } from "react-icons/fi";
import supabase from "../config/supabaseClients";

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
  /* Default background is the provided artwork; this image is used as the fixed card background */
  background-image: url('/images/1763198776206.jpg');
  background-size: cover;
  background-position: center;
  filter: saturate(1.05) contrast(0.95);
  z-index: 1;
}

.ranker-usercard-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: hsla(0, 0%, 9%, 0.76);
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

.ranker-usercard-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #7b2ff7 0%, #6f42c1 100%);
  background-size: cover;
  color: #ffffff;
  border: 2px solid rgba(255,255,255,0.08);
  box-shadow: 0 4px 12px rgba(0,0,0,0.35);
  flex-shrink: 0;
}

.ranker-usercard-attributes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.2rem;
  background: rgba(19, 21, 25, 0.5);
  border: 1px solid rgba(74, 90, 121, 0.2);
  border-radius: 0.6rem;
  margin-bottom: 0.5rem;
  padding: 8px;
  z-index: 3;
}

.ranker-usercard-attr-item {
  padding: 0.2rem;
  margin-top: 0.1rem;
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
  color: #0b1ff5ff;
}

.ranker-usercard-input {
  width: 50%;
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

@media (max-width: 480px) {
  .ranker-usercard {
    max-width: 98%;
    margin: 0.75rem auto;
    aspect-ratio: auto;
    min-height: 240px;
    padding: 0.75rem;
    aspect-ratio: 3 / 5;
    margin-bottom: 20%;
  }

  .ranker-usercard-name {
    font-size: 1.1rem;
  }

  .ranker-usercard-details {
    font-size: 0.85rem;
  }

  .ranker-usercard-avatar {
    width: 36px;
    height: 36px;
  }

  /* Keep attributes as a compact 2-column grid on mobile for better density */
  .ranker-usercard-attributes {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.1rem;
    padding: 4px;
  }

  .ranker-usercard-input {
    width: 70%;
    font-size: 0.85rem;
    padding: 0.2rem;
  }

  .ranker-usercard-submit {
    padding: 0.65rem;
    font-size: 0.95rem;
  }
}

/* Very narrow screens stack attributes to one column to avoid cramped inputs */
@media (max-width: 360px) {
  .ranker-usercard-attributes {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.1rem;
    padding: 4px;
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

// Static inline SVG icon used for all user avatars (purple circle with white user outline)
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

export default function UserCard({ candidate, voter }) {
  const [attributeValues, setAttributeValues] = useState({});
  const [attributes, setAttributes] = useState([]);
  const [openDetail, setOpenDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [existingVoteId, setExistingVoteId] = useState(null);

  // Static user icon: use a fixed purple avatar for all users (do not display candidate-specific images)
  // This replaces the previous avatar resolution behavior that tried multiple filenames.


  useEffect(() => {
    // load attributes and any existing vote for this voter+candidate for the current year
    const load = async () => {
      try {
        // 1. load attribute definitions
        const { data: attrData, error: attrErr } = await supabase
          .from("attributes")
          .select("*")
          .order("id", { ascending: true });

        if (attrErr) {
          console.error("Error fetching attributes:", attrErr);
        } else {
          setAttributes(attrData || []);
        }

        // 2. if we have a voter and candidate, try to load an existing vote row
        if (!voter || !voter.id || !candidate || !candidate.id) return;

        const currentYear = new Date().getFullYear();

        const { data: voteRow, error: voteErr } = await supabase
          .from("votes")
          .select("*")
          .eq("candidateid", candidate.id)
          .eq("voterid", voter.id)
          .eq("year", currentYear)
          .eq("groupid", 1)  // hardcoded groupid
          .maybeSingle();

        if (voteErr) {
          console.error("Error fetching vote row:", voteErr);
        } else if (voteRow) {
          setExistingVoteId(voteRow.id);

          // fetch attribute values for that vote
          const { data: valData, error: valErr } = await supabase
            .from("vote_attribute_values")
            .select("*")
            .eq("voteid", voteRow.id);

          if (valErr) {
            console.error("Error fetching vote attribute values:", valErr);
          } else if (valData) {
            // map to attributeValues state (use string keys for safety)
            const mapping = {};
            valData.forEach(vav => {
              mapping[String(vav.attributeid)] = vav.value;
            });
            setAttributeValues(mapping);
          }
        }
      } catch (err) {
        console.error("Unexpected error loading user card data:", err);
      }
    };

    load();
    // only re-run when candidate or voter changes
  }, [candidate?.id, voter?.id]);

  const handleAttributeChange = (id, value) => {
    setAttributeValues(prev => ({
      ...prev,
      [String(id)]: value,
    }));
  };

  const toInt = (val) => {
    const num = parseInt(val, 10);
    return isNaN(num) ? 0 : num;
  };

  const handleAttributesValues = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!voter || !voter.id || !candidate || !candidate.id) {
      alert("Missing voter or candidate information.");
      return;
    }

    setLoading(true);
    try {
      const currentYear = new Date().getFullYear();

      // 1) ensure there is a votes row for this voter/candidate/year
      let voteId = existingVoteId;

      if (!voteId) {
        // Insert a new vote row
        const { data: inserted, error: insertErr } = await supabase
          .from("votes")
          .insert([{
            candidateid: candidate.id,
            voterid: voter.id,
            year: currentYear,
            groupid: 1,  // hardcoded groupid
          }])
          .select()
          .single();

        if (insertErr) {
          throw insertErr;
        }
        voteId = inserted.id;
        setExistingVoteId(voteId);
      } else {
        // Optionally update updated_at or other metadata on existing vote
        await supabase
          .from("votes")
          .update({ /* optionally add fields */ })
          .eq("id", voteId);
      }

      // 2) replace existing vote_attribute_values for this vote with current values
      // Delete any existing attribute rows for this vote, then insert the current set.
      const { error: delErr } = await supabase
        .from("vote_attribute_values")
        .delete()
        .eq("voteid", voteId);

      if (delErr) {
        console.error("Error deleting old attribute values:", delErr);
        // not fatal — we'll still attempt inserts
      }

      // Prepare insert array
      const toInsert = attributes.map(attr => {
        const key = String(attr.id);
        const rawVal = attributeValues[key];
        return {
          voteid: voteId,
          attributeid: attr.id,
          value: toInt(rawVal),
        };
      });

      if (toInsert.length > 0) {
        const { error: insertValsErr } = await supabase
          .from("vote_attribute_values")
          .insert(toInsert);

        if (insertValsErr) {
          throw insertValsErr;
        }
      }

      // Optionally, you may want to create a record in vote_award_values here where appropriate
      alert("Vote saved successfully!");
    } catch (error) {
      console.error("Error submitting or updating vote:", error);
      alert("Failed to save vote. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="ranker-usercard">
      <div
        className="ranker-usercard-bg"
        aria-hidden="true"
      ></div> 

      <div className="ranker-usercard-overlay">
        <div className="ranker-usercard-header">
          <h2 className="ranker-usercard-name">
            <div
              className="ranker-usercard-avatar"
              aria-hidden="true"
              style={{ backgroundImage: `url("${STATIC_USER_ICON}")` }}
            />
            {candidate.name}
          </h2>
          <div className="ranker-usercard-details">{candidate.details}</div>
        </div>

        <form
          className="ranker-usercard-attributes"
          onSubmit={handleAttributesValues}
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
                value={attributeValues[String(attr.id)] ?? ""}
                type="text"
                className="ranker-usercard-input"
                onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                maxLength={6}
                inputMode="numeric"
                placeholder={String(attributeValues[String(attr.id)] ?? "") || "0-100"}
                disabled={loading}
              />
            </div>
          ))}
        </form>

        <button
          className="ranker-usercard-submit"
          type="button"
          onClick={handleAttributesValues}
          disabled={loading}
        >
          <FiCheckCircle size={18} />
          {loading ? "Saving..." : "Submit Vote"}
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