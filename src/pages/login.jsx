import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/currentUserContext";
import { Helmet } from "react-helmet";
import supabase from "../config/supabaseClients";

// --- Black & White Minimal CSS ---
const loginBWStyles = `
.ranker-login-bg {
  background-color: black;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Segoe UI', 'Roboto', sans-serif;
  padding: 20px;
}
.ranker-login-card {
  background: #181818;
  border-radius: 1.2rem;
  box-shadow: 0 4px 24px #0002;
  padding: 2.5rem 2.2rem 2rem 2.2rem;
  width: 100%;
  max-width: 400px;
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
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.ranker-login-label {
  font-size: 1.1rem;
  color: #e5e5e5;
  margin-bottom: 0.3rem;
  font-weight: 500;
  display: block;
}
.ranker-login-input {
  width: 100%;
  padding: 0.7rem 1rem;
  border-radius: 0.8rem;
  border: 1.5px solid #333;
  background: #111;
  color: #fff;
  font-size: 1rem;
  margin-top: 0.2rem;
  margin-bottom: 0.2rem;
  transition: border 0.2s, background 0.2s;
  box-sizing: border-box;
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
  width: 100%;
}
.ranker-login-btn:hover:not(:disabled), 
.ranker-login-btn:focus:not(:disabled) {
  background: linear-gradient(90deg, #222 0%, #fff 100%);
  color: #fff;
  transform: scale(1.02);
  outline: none;
}
.ranker-login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.ranker-login-error {
  color: #fff;
  background: #ff3333;
  border-radius: 0.7rem;
  padding: 0.7rem 1rem;
  margin-top: 1rem;
  text-align: center;
  font-size: 1rem;
  border: 1px solid #ff6666;
}
.ranker-login-success {
  color: #fff;
  background: #33cc33;
  border-radius: 0.7rem;
  padding: 0.7rem 1rem;
  margin-top: 1rem;
  text-align: center;
  font-size: 1rem;
  border: 1px solid #66ff66;
}
.ranker-login-debug {
  color: #aaa;
  background: #222;
  border-radius: 0.7rem;
  padding: 0.7rem 1rem;
  margin-top: 1rem;
  text-align: left;
  font-size: 0.9rem;
  border: 1px solid #444;
  font-family: monospace;
  max-height: 200px;
  overflow-y: auto;
}
.loading-spinner {
  border: 3px solid #333;
  border-top: 3px solid #fff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 10px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const { setUser } = useUser();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const navigate = useNavigate();

  // Test the connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log("Testing Supabase connection...");
        const { data, error } = await supabase
          .from('users')
          .select('count', { count: 'exact', head: true });
        
        if (error) {
          console.error("Supabase connection error:", error);
          setDebugInfo(prev => prev + `Connection Error: ${error.message}\n`);
        } else {
          console.log("Supabase connected successfully");
          setDebugInfo(prev => prev + `✓ Connected to Supabase\n`);
        }
      } catch (err) {
        console.error("Connection test failed:", err);
        setDebugInfo(prev => prev + `Connection test failed: ${err.message}\n`);
      }
    };
    
    testConnection();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setDebugInfo("");
    
    // Validate inputs
    if (!username.trim() || !userId.trim()) {
      setError("Please enter both username and ID");
      return;
    }
    
    // Convert userId to number
    const numericId = parseInt(userId, 10);
    if (isNaN(numericId)) {
      setError("ID must be a number");
      return;
    }
    
    setLoading(true);
    setDebugInfo(`Attempting login with:\nUsername: "${username}"\nID: ${numericId}\n\n`);
    
    try {
      // METHOD 1: Try querying by ID first
      setDebugInfo(prev => prev + "Querying by ID only...\n");
      const { data: userById, error: idError } = await supabase
        .from("users")
        .select("*")
        .eq("id", numericId)
        .single();
      
      if (idError) {
        setDebugInfo(prev => prev + `ID query error: ${idError.message}\n`);
        
        // METHOD 2: Try querying by name only
        setDebugInfo(prev => prev + "Querying by name only...\n");
        const { data: userByName, error: nameError } = await supabase
          .from("users")
          .select("*")
          .eq("name", username.trim())
          .maybeSingle();
        
        if (nameError) {
          setDebugInfo(prev => prev + `Name query error: ${nameError.message}\n`);
        } else if (userByName) {
          setDebugInfo(prev => prev + `Found user by name: ${JSON.stringify(userByName, null, 2)}\n`);
        }
        
        // METHOD 3: Fetch all users and filter locally
        setDebugInfo(prev => prev + "Fetching all users...\n");
        const { data: allUsers, error: allError } = await supabase
          .from("users")
          .select("*");
        
        if (allError) {
          throw new Error(`Failed to fetch users: ${allError.message}`);
        }
        
        setDebugInfo(prev => prev + `Total users in database: ${allUsers?.length || 0}\n`);
        
        if (allUsers && allUsers.length > 0) {
          // Show first few users for debugging
          setDebugInfo(prev => prev + "First 5 users in database:\n" + 
            allUsers.slice(0, 5).map(u => `ID: ${u.id}, Name: "${u.name}"`).join('\n') + '\n');
          
          // Try to find user with loose matching
          const foundUser = allUsers.find(user => {
            const dbName = user.name?.toString().trim().toLowerCase();
            const inputName = username.trim().toLowerCase();
            const dbId = user.id;
            
            // Check both exact and contains matching
            const nameMatches = dbName === inputName || 
                               (dbName && dbName.includes(inputName)) ||
                               (inputName && inputName.includes(dbName));
            const idMatches = dbId === numericId;
            
            return nameMatches && idMatches;
          });
          
          if (foundUser) {
            // Success!
            setDebugInfo(prev => prev + `✓ Found user: ${JSON.stringify(foundUser, null, 2)}\n`);
            setUser(foundUser);
            setSuccess(`Welcome back, ${foundUser.name}!`);
            
            // Store user in localStorage for persistence
            localStorage.setItem('ranker_user', JSON.stringify(foundUser));
            localStorage.setItem('ranker_user_id', foundUser.id);
            
            // Navigate after a short delay
            setTimeout(() => {
              navigate("/");
            }, 1500);
          } else {
            // Try to find partial matches
            const partialMatches = allUsers.filter(user => {
              const dbName = user.name?.toString().trim().toLowerCase();
              const inputName = username.trim().toLowerCase();
              return dbName === inputName || user.id === numericId;
            });
            
            if (partialMatches.length > 0) {
              setDebugInfo(prev => prev + `Partial matches found:\n${partialMatches.map(u => `ID: ${u.id}, Name: "${u.name}"`).join('\n')}\n`);
              setError(`Found partial matches. Please check:\n${partialMatches.map(u => `- ID ${u.id}: "${u.name}"`).join('\n')}`);
            } else {
              setError(`No user found with ID ${numericId} and username "${username}".\nTry: ID 1 with "James Banda"`);
            }
          }
        } else {
          setError("No users found in the database.");
        }
      } else if (userById) {
        // User found by ID, check name match
        setDebugInfo(prev => prev + `Found by ID: ${JSON.stringify(userById, null, 2)}\n`);
        
        const dbName = userById.name?.toString().trim().toLowerCase();
        const inputName = username.trim().toLowerCase();
        
        if (dbName === inputName) {
          // Exact match
          setDebugInfo(prev => prev + `✓ Username matches!\n`);
          setUser(userById);
          setSuccess(`Welcome back, ${userById.name}!`);
          
          localStorage.setItem('ranker_user', JSON.stringify(userById));
          localStorage.setItem('ranker_user_id', userById.id);
          
          setTimeout(() => {
            navigate("/");
          }, 1500);
        } else {
          setDebugInfo(prev => prev + `Username mismatch.\nDatabase: "${dbName}"\nInput: "${inputName}"\n`);
          setError(`ID ${numericId} belongs to "${userById.name}", not "${username}"`);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setDebugInfo(prev => prev + `Error: ${error.message}\n`);
      setError(error.message || "An error occurred while logging in.");
    } finally {
      setLoading(false);
    }
  };

  // Check for stored user on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('ranker_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUser(user);
        setDebugInfo("Found stored user, redirecting...\n");
        navigate("/");
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem('ranker_user');
      }
    }
  }, [navigate, setUser]);

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
          onSubmit={handleLogin}
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
              disabled={loading}
            />
          </div>
          <div>
            <label className="ranker-login-label" htmlFor="userid-input">
              ID
            </label>
            <input
              id="userid-input"
              className="ranker-login-input"
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your ID"
              autoComplete="off"
              disabled={loading}
            />
          </div>
          <button 
            className="ranker-login-btn" 
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
          
          {error && <div className="ranker-login-error">{error}</div>}
          {success && <div className="ranker-login-success">{success}</div>}
          

          
          {/* Test credentials reminder */}
          <div style={{ 
            marginTop: '10px', 
            fontSize: '0.85rem', 
            color: '#888',
            textAlign: 'center' 
          }}>
            Try: <br/>
            <strong>ID: 1</strong> with <strong>Username: James Banda</strong>
          </div>
        </form>
      </section>
    </div>
  );
}