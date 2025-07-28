import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './pages/Home';
import VoterLogin from './pages/VoterLogin';
import VoterVerify from './pages/VoterVerify';
import VotingPage from './pages/VotingPage';
import AdminLogin from './pages/AdminLogin';
import CandidateLogin from './pages/CandidateLogin';
import CandidateDashboard from './pages/CandidateDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ElectionResults from './pages/ElectionResults';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/voter-login" element={<VoterLogin />} />
        <Route path="/verify-otp" element={<VoterVerify />} />
        <Route path="/vote" element={<VotingPage />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/candidate-login" element={<CandidateLogin />} />
        <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
        <Route path="/results" element={<ElectionResults />} />
      </Routes>
    </Router>
  );
}

export default App;