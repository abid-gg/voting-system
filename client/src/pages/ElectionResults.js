import React, { useEffect, useState, useMemo, useRef } from 'react';
import BalloonsAnimation from '../components/BalloonsAnimation';
import axios from 'axios';

function ElectionResults() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [voteCounts, setVoteCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const backendURL = 'http://localhost:5000/api';

  // Ref for winner sound
  const winnerAudioRef = useRef(null);
  // Track if sound has played for this election
  const lastWinnerElectionId = useRef(null);

  // Winner detection: returns array of winners (handles tie)
  const winners = useMemo(() => {
    if (!candidates.length) return [];
    let maxVotes = -1;
    candidates.forEach(c => {
      const votes = voteCounts[c._id] || 0;
      if (votes > maxVotes) maxVotes = votes;
    });
    if (maxVotes <= 0) return []; // No votes cast
    return candidates.filter(c => (voteCounts[c._id] || 0) === maxVotes);
  }, [candidates, voteCounts]);

  // Election status: ended or ongoing
  const isElectionEnded = selectedElection && selectedElection.endTime && new Date(selectedElection.endTime) < new Date();

  // Play sound when winner(s) detected for a new election
  useEffect(() => {
    if (
      selectedElection &&
      winners.length > 0 &&
      !loading &&
      selectedElection._id !== lastWinnerElectionId.current
    ) {
      if (winnerAudioRef.current) {
        winnerAudioRef.current.currentTime = 0;
        winnerAudioRef.current.play().catch(() => {});
      }
      lastWinnerElectionId.current = selectedElection._id;
    }
    // Reset tracker if no election selected
    if (!selectedElection) lastWinnerElectionId.current = null;
  }, [selectedElection, winners, loading]);

  // Fetch all elections
  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await axios.get(`${backendURL}/election/all`);
        setElections(res.data);
      } catch (err) {
        setElections([]);
      }
    };
    fetchElections();
  }, []);

  // Fetch candidates and vote counts for selected election
  useEffect(() => {
    if (!selectedElection) return;
    setLoading(true);
    const fetchDetails = async () => {
      try {
        // Get election details (with candidates populated)
        const res = await axios.get(`${backendURL}/election/${selectedElection._id}`);
        setCandidates(res.data.candidates || []);
        // Get vote counts
        const voteRes = await axios.get(`${backendURL}/vote/counts?electionId=${selectedElection._id}`);
        const counts = {};
        voteRes.data.forEach(v => {
          counts[v._id] = v.count;
        });
        setVoteCounts(counts);
      } catch (err) {
        setCandidates([]);
        setVoteCounts({});
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [selectedElection]);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 24, background: '#f5faff', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
      {/* Winner sound effect (royalty-free short mp3, you can replace with your own) */}
      <audio ref={winnerAudioRef} src="/sounds/start-sound.mp3" preload="auto" />
      <button
        onClick={handleGoHome}
        style={{
          marginBottom: 18,
          padding: '10px 22px',
          borderRadius: 20,
          border: 'none',
          cursor: 'pointer',
          backgroundColor: '#1976d2',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: 16,
          boxShadow: '0 2px 10px #ccc',
          transition: 'background-color 0.3s',
          display: 'block',
          marginLeft: 'auto',
        }}
        type="button"
      >
        Go Home
      </button>
      <h1 style={{ textAlign: 'center', color: '#1565c0', marginBottom: 30 }}>📊 Election Results</h1>
      <div style={{ marginBottom: 30 }}>
        <label htmlFor="election-select" style={{ fontWeight: 600, marginRight: 10 }}>Select Election:</label>
        <select
          id="election-select"
          value={selectedElection ? selectedElection._id : ''}
          onChange={e => {
            const found = elections.find(el => el._id === e.target.value);
            setSelectedElection(found || null);
          }}
          style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #bbb', minWidth: 200 }}
        >
          <option value="">-- Select --</option>
          {elections.map(el => (
            <option key={el._id} value={el._id}>
              {el.startTime ? new Date(el.startTime).toLocaleString() : 'No Start'} - {el.endTime ? new Date(el.endTime).toLocaleString() : 'No End'}
            </option>
          ))}
        </select>
      </div>

      {/* Winner Celebration Banner - only show after election ends */}
      {selectedElection && isElectionEnded && !loading && candidates.length > 0 && winners.length > 0 && (
        <div style={{
          background: '#fffbe7',
          border: '2px solid #ffe082',
          borderRadius: 14,
          padding: 24,
          marginBottom: 28,
          textAlign: 'center',
          boxShadow: '0 2px 12px rgba(255,193,7,0.08)',
          position: 'relative',
          animation: 'winner-pop 0.7s',
          overflow: 'hidden',
        }}>
          <BalloonsAnimation />
          <div style={{ fontSize: 36, marginBottom: 10, zIndex: 2, position: 'relative' }}>🎉 Congratulations!</div>
          {winners.length === 1 ? (
            <>
              <img
                src={winners[0].imageUrl ? winners[0].imageUrl : '/default-avatar.png'}
                alt={winners[0].name}
                style={{ width: 70, height: 70, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ffd54f', marginBottom: 10, background: '#fffde7', zIndex: 2, position: 'relative' }}
                onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
              />
              <div style={{ fontSize: 24, fontWeight: 700, color: '#f9a825', marginBottom: 4, zIndex: 2, position: 'relative' }}>{winners[0].name}</div>
              <div style={{ fontSize: 18, color: '#555', marginBottom: 6, zIndex: 2, position: 'relative' }}>{winners[0].position}</div>
              <div style={{ fontSize: 18, color: '#388e3c', fontWeight: 600, zIndex: 2, position: 'relative' }}>is the Winner!</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 20, color: '#f9a825', fontWeight: 700, marginBottom: 6, zIndex: 2, position: 'relative' }}>It's a tie!</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 18, zIndex: 2, position: 'relative' }}>
                {winners.map(w => (
                  <div key={w._id} style={{ textAlign: 'center' }}>
                    <img
                      src={w.imageUrl ? w.imageUrl : '/default-avatar.png'}
                      alt={w.name}
                      style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ffd54f', background: '#fffde7' }}
                      onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
                    />
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#f9a825' }}>{w.name}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 18, color: '#388e3c', fontWeight: 600, marginTop: 8, zIndex: 2, position: 'relative' }}>are the Winners!</div>
            </>
          )}
          {/* Simple confetti effect using emoji */}
          <div style={{ fontSize: 32, marginTop: 10, zIndex: 2, position: 'relative' }}>
            🎊 🎈 🥳 🎊 🎈
          </div>
        </div>
      )}

      {selectedElection && (
        <div>
          <h2 style={{ color: '#1976d2', marginBottom: 16 }}>Results</h2>
          {loading ? (
            <p>Loading...</p>
          ) : candidates.length === 0 ? (
            <p>No candidates found for this election.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {candidates.map(c => (
                <li key={c._id} style={{ marginBottom: 18, padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={c.imageUrl ? c.imageUrl : '/default-avatar.png'} alt={c.name} style={{ width: 44, height: 44, borderRadius: '50%', marginRight: 16, objectFit: 'cover', border: '1px solid #bbb', background: '#f4f4f4' }} onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }} />
                    <div>
                      <strong style={{ fontSize: 17 }}>{c.name}</strong>
                      <br />
                      <span style={{ color: '#555' }}>{c.position}</span>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 18, color: '#1976d2' }}>{voteCounts[c._id] || 0} votes</span>
                </li>
              ))}
            </ul>
          )}
          {/* Show note if election is ongoing */}
          {!isElectionEnded && (
            <div style={{ marginTop: 18, color: '#f9a825', fontWeight: 600, textAlign: 'center' }}>
              Election is ongoing. Winner will be declared after the election ends.
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes winner-pop {
          0% { transform: scale(0.7); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default ElectionResults;
