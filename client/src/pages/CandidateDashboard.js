import React, { useEffect, useState } from 'react';
import axios from 'axios';

function CandidateDashboard() {
  const [candidate, setCandidate] = useState(null);
  const [offering, setOffering] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [electionStatus, setElectionStatus] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [maxVotes, setMaxVotes] = useState(0);

  const candidateId = localStorage.getItem('candidateId'); // saved after login

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/candidate/${candidateId}`);
        setCandidate(res.data);
        setOffering(res.data.offering || '');
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch candidate:', err);
      }
    };
    fetchCandidate();
  }, [candidateId]);

  useEffect(() => {
    // Fetch election status and notifications (mocked for now)
    const fetchElectionStatus = async () => {
      try {
        // Replace with your real API endpoint if available
        const res = await axios.get('http://localhost:5000/api/election/current');
        setElectionStatus(res.data.status || 'Ongoing');
        setMaxVotes(res.data.totalVoters || 100); // fallback if not provided
      } catch (err) {
        setElectionStatus('Ongoing');
        setMaxVotes(100);
      }
    };
    fetchElectionStatus();
    // Mock notifications
    setNotifications([
      { id: 1, message: 'Election is live! Encourage your supporters to vote.' },
      { id: 2, message: 'Results will be announced after voting ends.' },
    ]);
  }, []);

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5000/api/candidate/${candidateId}`, { offering });
      setEditing(false);
      alert('Profile updated!');
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update profile');
    }
  };

  if (loading) return <p>Loading profile...</p>;

  // Calculate vote progress
  const votePercent = maxVotes > 0 ? Math.min(100, Math.round((candidate.voteCount / maxVotes) * 100)) : 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f2fd 0%, #90caf9 100%)',
      padding: '40px 0',
    }}>
      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        background: '#fff',
        borderRadius: 18,
        boxShadow: '0 6px 32px rgba(25, 118, 210, 0.10)',
        padding: 32,
        position: 'relative',
      }}>
        {/* Election Status */}
        <div style={{ marginBottom: 18, textAlign: 'center' }}>
          <span style={{
            background: electionStatus === 'Ended' ? '#e55353' : '#43a047',
            color: '#fff',
            borderRadius: 8,
            padding: '6px 18px',
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: 1,
            boxShadow: '0 1px 4px #e3f2fd',
          }}>
            Election Status: {electionStatus}
          </span>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div style={{ marginBottom: 18, background: '#e3f2fd', borderRadius: 10, padding: '10px 18px', color: '#1976d2', fontWeight: 500, fontSize: 15 }}>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {notifications.map(note => (
                <li key={note.id} style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span role="img" aria-label="info">🔔</span> {note.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
          <img
            src={candidate.imageUrl ? candidate.imageUrl : '/default-avatar.png'}
            alt={candidate.name}
            style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid #1976d2', marginRight: 28, background: '#f4f4f4', boxShadow: '0 2px 8px #e3f2fd' }}
            onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
          />
          <div>
            <h2 style={{ margin: 0, fontSize: 28, color: '#1976d2', fontWeight: 700 }}>Welcome, {candidate.name}</h2>
            <p style={{ margin: '6px 0 0 0', fontSize: 17, color: '#333' }}><strong>Position:</strong> {candidate.position}</p>
            <p style={{ margin: 0, fontSize: 16, color: '#555' }}><strong>Vote Count:</strong> {candidate.voteCount}</p>
          </div>
        </div>

        {/* Vote Progress Bar */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 15, color: '#1976d2', fontWeight: 600, marginBottom: 6 }}>Vote Progress</div>
          <div style={{ background: '#e3f2fd', borderRadius: 8, height: 18, width: '100%', boxShadow: '0 1px 4px #e3f2fd', overflow: 'hidden' }}>
            <div style={{
              width: votePercent + '%',
              background: votePercent === 100 ? '#43a047' : '#1976d2',
              height: '100%',
              borderRadius: 8,
              transition: 'width 0.5s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              paddingRight: 10,
            }}>{votePercent}%</div>
          </div>
        </div>

        <div style={{ marginBottom: 28, background: '#f4f6fa', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px #e3f2fd' }}>
          <h3 style={{ margin: 0, marginBottom: 10, color: '#1976d2', fontWeight: 600, fontSize: 20 }}>Campaign Offering</h3>
          {editing ? (
            <>
              <textarea
                rows="4"
                value={offering}
                onChange={(e) => setOffering(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #bbb', fontSize: 16, marginBottom: 10 }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handleUpdate}
                  style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
                >Save</button>
                <button
                  onClick={() => setEditing(false)}
                  style={{ background: '#aaa', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
                >Cancel</button>
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize: 16, color: '#444', marginBottom: 10 }}><strong>Offering:</strong> {candidate.offering || <span style={{ color: '#888' }}>No campaign message yet</span>}</p>
              <button
                onClick={() => setEditing(true)}
                style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
              >Edit Offering</button>
            </>
          )}
        </div>

        <button
          onClick={() => {
            localStorage.removeItem('candidateId');
            window.location.href = '/candidate-login';
          }}
          style={{ background: '#e55353', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 32px', fontWeight: 700, fontSize: 17, cursor: 'pointer', width: '100%', letterSpacing: 1 }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default CandidateDashboard;
