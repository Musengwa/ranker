import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/currentUserContext";
import { Helmet } from "react-helmet";

// --- Black & White Minimal CSS ---
const loginBWStyles = `
.ranker-login-bg {
  background-color: black;
  display: flex;
  margin-top: 50% 
  align-items: center;
  justify-content: center;
  font-family: 'Segoe UI', 'Roboto', sans-serif;
}
.ranker-login-card {
  background: #181818;
  border-radius: 1.2rem;
  box-shadow: 0 4px 24px #0002;
  padding: 2.5rem 2.2rem 2rem 2.2rem;
  place-self: center;
  min-width: 340px;
  max-width: 95vw;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1.5px solid #222;
}
.ranker-login-title {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: #fff;
  margin-bottom: 1.5rem;
  text-align: center;
}
.ranker-login-form {
  width: 85%;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 10px;
}
.ranker-login-label {
  font-size: 1.1rem;
  color: #e5e5e5;
  margin-bottom: 0.3rem;
  font-weight: 500;
  display: block;
}
.ranker-login-input {
  width: 95%;
  padding: 0.7rem 1rem;
  border-radius: 0.8rem;
  border: 1.5px solid #333;
  background: #111;
  color: #fff;
  font-size: 1rem;
  margin-top: 0.2rem;
  margin-bottom: 0.2rem;
  transition: border 0.2s, background 0.2s;
}
.ranker-login-input:focus {
  border: 2px solid #fff;
  outline: none;
  background: #222;
}
.ranker-login-btn {
  margin-top: 1.2rem;
  background: linear-gradient(90deg, #fff 0%, #222 100%);
  color: #111;
  border: none;
  border-radius: 2rem;
  padding: 0.8rem 2.2rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px #0002;
  transition: background 0.18s, color 0.18s, transform 0.12s;
}
.ranker-login-btn:hover, .ranker-login-btn:focus {
  background: linear-gradient(90deg, #222 0%, #fff 100%);
  color: #fff;
  transform: scale(1.04);
  outline: none;
}
.ranker-login-error {
  color: #fff;
  background: #2c2c2c;
  border-radius: 0.7rem;
  padding: 0.7rem 1rem;
  margin-top: 1rem;
  text-align: center;
  font-size: 1rem;
  border: 1px solid #444;
}
@media (max-width: 600px) {
  .ranker-login-card {
    min-width: 80vw;
    padding: 1.2rem 0.7rem;
    margin-top: 50%;
  }
  .ranker-login-title {
    font-size: 1.3rem;
  }
}
`;

// Inject the CSS into the document head
if (typeof document !== "undefined" && !document.getElementById("ranker-login-bw-css")) {
  const style = document.createElement("style");
  style.id = "ranker-login-bw-css";
  style.innerHTML = loginBWStyles;
  document.head.appendChild(style);
}

export default function Login() {
  const [username, setUsername] = useState(""); // State for username input
  const [userId, setUserId] = useState(""); // State for user ID input
  const { setUser } = useUser(); // Context function to set the current user
  const [error, setError] = useState(null); // State for error handling
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogin = async () => {
    try {
      const response = await axios.get("http://localhost:5000/users");
      const users = response.data;

      // Find the user by username and ID
      const foundUser = users.find(
        (user) => user.name === username && user.id === userId // Compare as strings
      );

      if (foundUser) {
        setUser(foundUser); // Set the user in context
        setError(null); // Clear any previous errors
        alert("Login successful!");
        navigate("/"); // Redirect to the dashboard
      } else {
        setError("Invalid username or ID. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("An error occurred while logging in. Please try again later.");
    }
  };

  return (
    <div className="ranker-login-bg">
      <Helmet>
        <title>Login | Ranker</title>
        <meta name="description" content="Log in to your Ranker account to access your dashboard and manage your rankings." />
        <meta name="robots" content="index,follow" />
      </Helmet>
      <section className="ranker-login-card">
        <h1 className="ranker-login-title">Log In</h1>
        <form
          className="ranker-login-form"
          onSubmit={e => { e.preventDefault(); handleLogin(); }}
        >
          <div>
            <label className="ranker-login-label" htmlFor="username-input">
              Username
            </label>
            <input
              id="username-input"
              className="ranker-login-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="ranker-login-label" htmlFor="userid-input">
              ID
            </label>
            <input
              id="userid-input"
              className="ranker-login-input"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your ID"
              autoComplete="off"
            />
          </div>
          <button className="ranker-login-btn" type="submit">
            Login
          </button>
          {error && <div className="ranker-login-error">{error}</div>}
        </form>
      </section>
    </div>
  );
}