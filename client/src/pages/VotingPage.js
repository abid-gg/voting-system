import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function VotingPage() {
  const [candidates, setCandidates] = useState([]);
  const [voted, setVoted] = useState(false);
  const [status, setStatus] = useState('loading');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [startCountdown, setStartCountdown] = useState('');
  const [loadingVoteId, setLoadingVoteId] = useState(null);
  const [confirmCandidate, setConfirmCandidate] = useState(null);
  const [electionId, setElectionId] = useState(null);
  const [voteCounts, setVoteCounts] = useState({});

  const voterId = localStorage.getItem('voterId');
  const backendURL = 'http://localhost:5000/api';

  // Fetch current election and candidates
  useEffect(() => {
    const fetchElection = async () => {
      try {
        const res = await axios.get(`${backendURL}/election/current`);
        const election = res.data;
        setElectionId(election._id);
        setCandidates(election.candidates || []);
        // Determine status
        const now = new Date();
        let status = 'not-started';
        let startCountdown = '';
        let timeRemaining = '';
        if (election.startTime && now >= new Date(election.startTime)) {
          if (election.endTime && now < new Date(election.endTime)) {
            status = 'running';
            const diff = new Date(election.endTime) - now;
            if (diff > 0) {
              const h = Math.floor(diff / (1000 * 60 * 60));
              const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              const s = Math.floor((diff % (1000 * 60)) / 1000);
              timeRemaining = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            } else {
              timeRemaining = '00:00:00';
            }
          } else {
            status = 'ended';
          }
        }
        if (status === 'not-started' && election.startTime) {
          const diff = new Date(election.startTime) - now;
          if (diff > 0) {
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            startCountdown = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
          } else {
            startCountdown = '00:00:00';
          }
        }
        setStatus(status);
        setTimeRemaining(timeRemaining);
        setStartCountdown(startCountdown);
      } catch (err) {
        setStatus('error');
        setCandidates([]);
      }
    };
    fetchElection();
  }, []);

  // Fetch vote counts for current election
  const fetchVoteCounts = async () => {
    if (!electionId) return;
    try {
      const res = await axios.get(`${backendURL}/vote/counts?electionId=${electionId}`);
      const counts = {};
      res.data.forEach(v => {
        counts[v._id] = v.count;
      });
      setVoteCounts(counts);
    } catch (err) {
      setVoteCounts({});
    }
  };
  useEffect(() => {
    fetchVoteCounts();
  }, [electionId]);

  // Vote for a candidate
  const handleVote = async (candidateId) => {
    if (!voterId) {
      toast.error('Please login first!');
      return;
    }
    if (voted) {
      toast.info('You have already voted!');
      return;
    }
    if (status !== 'running') {
      toast.warn('Election is not running currently.');
      return;
    }
    try {
      setLoadingVoteId(candidateId);
      const res = await axios.post(`${backendURL}/vote/cast`, {
        electionId,
        candidateId,
        voterId,
      });
      toast.success(res.data.message || 'Vote submitted successfully!');
      setVoted(true);
      setConfirmCandidate(null);
      await fetchVoteCounts(); // Refresh vote counts after voting
    } catch (error) {
      toast.error(error.response?.data?.error || 'Voting failed');
    } finally {
      setLoadingVoteId(null);
    }
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: '40px auto',
        padding: 20,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: 'linear-gradient(135deg, #e3f2fd 0%, #90caf9 100%)',
        borderRadius: 12,
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
      }}
    >
      <ToastContainer position="top-center" />
      <h1 style={{ textAlign: 'center', color: '#1565c0', marginBottom: 20 }}>
        🗳️ Voting Page
      </h1>

      {/* Election status info */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: 20,
          fontSize: 18,
          fontWeight: '600',
          color:
            status === 'running'
              ? '#2e7d32'
              : status === 'ended'
              ? '#c62828'
              : status === 'not-started'
              ? '#f9a825'
              : '#6a6a6a',
        }}
      >
        {status === 'loading' && '⏳ Loading election status...'}
        {status === 'not-started' && (
          <>
            🕒 Election has not started yet.
            {startCountdown && (
              <>
                <br />⏳ Starts in: <strong>{startCountdown}</strong>
              </>
            )}
          </>
        )}
        {status === 'running' && <>🕒 Time Remaining: <strong>{timeRemaining}</strong></>}
        {status === 'ended' && <>✅ Election has ended.</>}
        {status === 'error' && <>⚠️ Error fetching election status.</>}
      </div>

      {/* Candidates list */}
      {status === 'running' && (
        <>
          <h2 style={{ color: '#1565c0', marginBottom: 16 }}>Choose your candidate</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {candidates.map((c) => (
              <li
                key={c._id}
                style={{
                  marginBottom: 16,
                  padding: 16,
                  background: '#ffffffcc',
                  borderRadius: 10,
                  boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'transform 0.3s ease',
                  cursor: voted ? 'default' : 'pointer',
                  userSelect: 'none',
                }}
                onClick={() => !voted && setConfirmCandidate(c)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !voted) setConfirmCandidate(c);
                }}
                tabIndex={0}
                role="button"
                aria-pressed={voted}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src={c.imageUrl ? c.imageUrl : '/default-avatar.png'}
                    alt={c.name}
                    style={{ width: 50, height: 50, borderRadius: '50%', marginRight: 16, objectFit: 'cover', border: '1px solid #bbb', background: '#f4f4f4' }}
                    onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
                  />
                  <div>
                    <strong style={{ fontSize: 18 }}>{c.name}</strong>
                    <br />
                    <span style={{ color: '#555' }}>{c.position}</span>
                    <br />
                    <span style={{ color: '#888', fontSize: 14 }}>
                      {voteCounts[c._id] || 0} votes
                    </span>
                  </div>
                </div>
                <button
                  disabled={voted || loadingVoteId === c._id}
                  style={{
                    backgroundColor: voted ? '#9e9e9e' : '#1976d2',
                    border: 'none',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: 8,
                    fontWeight: '600',
                    fontSize: 16,
                    cursor: voted ? 'not-allowed' : 'pointer',
                    minWidth: 100,
                    boxShadow: loadingVoteId === c._id ? '0 0 10px #1976d2' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {loadingVoteId === c._id ? 'Voting...' : voted ? 'Voted' : 'Vote'}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {(status === 'not-started' || status === 'ended') && candidates.length > 0 && (
        <p style={{ textAlign: 'center', marginTop: 30, color: '#555' }}>
          {status === 'not-started'
            ? 'Candidates will be available when the election starts.'
            : 'Thank you for participating!'}
        </p>
      )}

      {/* Confirm vote modal */}
      {confirmCandidate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setConfirmCandidate(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 12,
              padding: 24,
              minWidth: 320,
              maxWidth: 400,
              boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
          >
            <h3 id="confirm-dialog-title" style={{ marginBottom: 16 }}>
              Confirm Your Vote
            </h3>
            <p>
              Are you sure you want to vote for <strong>{confirmCandidate.name}</strong> (
              {confirmCandidate.position})?
            </p>
            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <button
                onClick={() => setConfirmCandidate(null)}
                style={{
                  marginRight: 12,
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  backgroundColor: '#eee',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleVote(confirmCandidate._id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Confirm Vote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VotingPage;
