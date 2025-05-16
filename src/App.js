import { Routes, Route } from "react-router-dom";
import Home from "./pages/dash";
import Voting from "./pages/voting";
import Auth from "./pages/login";
import Analysis from "./pages/analysis";
import Awards from "./pages/awards";
import './App.css';
import { UserContextProvider } from "./context/currentUserContext";

function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/" element={<Home />} />
        <Route path="/voting" element={<Voting />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/awards" element={<Awards />} />
      </Routes>
    </UserContextProvider>
  );
}

export default App;