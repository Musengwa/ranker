import { Routes, Route } from "react-router-dom";
import Home from "./pages/dash";
import Voting from "./pages/voting";
import Auth from "./pages/login";
import Analysis from "./pages/analysis";
import './App.css';
import { UserContextProvider } from "./context/currentUserContext";

function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dash" element={<Home />} />
        <Route path="/voting" element={<Voting />} />
        <Route path="/analysis" element={<Analysis />} />
      </Routes>
    </UserContextProvider>
  );
}

export default App;