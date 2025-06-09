import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/currentUserContext";
import { Helmet } from "react-helmet"; // Add this import

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
    <div>
      <Helmet>
        <title>Login | Ranker</title>
        <meta name="description" content="Log in to your Ranker account to access your dashboard and manage your rankings." />
        <meta name="robots" content="index,follow" />
      </Helmet>
      <form>
        <h1>Log In</h1>
        <div>
          <label>
            Username:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </label>
        </div>
        <div>
          <label>
            ID:
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your ID"
            />
          </label>
        </div>
        <button type="button" onClick={handleLogin}>
          Login
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}