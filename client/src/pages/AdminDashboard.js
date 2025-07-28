import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const Card = ({ title, value, color, darkMode }) => (
  <div
    style={{
      flex: '1 1 250px',
      background: darkMode ? '#222' : '#fff',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: darkMode
        ? '0 0 15px rgba(0,0,0,0.7)'
        : '0 4px 8px rgba(0,0,0,0.1)',
      borderTop: `5px solid ${color}`,
      color: darkMode ? '#eee' : '#333',
      transition: 'background-color 0.3s, color 0.3s',
      userSelect: 'none',
    }}
  >
    <h3 style={{ color: darkMode ? '#bbb' : '#777', fontSize: '18px', marginBottom: '10px' }}>
      {title}
    </h3>
    <p style={{ fontSize: '28px', fontWeight: 'bold', color }}>{value}</p>
  </div>
);


function AdminDashboard() {
  // Toast logic must be at the top so it can be used in all hooks
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('adminId');
    window.location.href = '/admin-login';
  };

  const [candidatesCount, setCandidatesCount] = useState(0);
  const [votersCount, setVotersCount] = useState(0);
  const [startTime, setStartTime] = useState(''); // for input field (formatted)
  const [endTime, setEndTime] = useState('');     // for input field (formatted)
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]); // for election

  // Ensure input value is always a string (never undefined/null)
  const safeInputValue = (val) => (typeof val === 'string' ? val : (val ? String(val) : ''));
  // Removed unused isEditingStart and isEditingEnd
  const [dirtyStart, setDirtyStart] = useState(false);
  const [dirtyEnd, setDirtyEnd] = useState(false);
  // Removed unused startTimeRaw and endTimeRaw
  // Helper to format ISO string to 'YYYY-MM-DDTHH:mm' for datetime-local
  const formatForInput = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const [status, setStatus] = useState('loading');
  const [startCountdown, setStartCountdown] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [percentElapsed, setPercentElapsed] = useState(0);
  const [error, setError] = useState('');

  const [darkMode, setDarkMode] = useState(false);

  // Admin management state (must be inside the component)
  const [admins, setAdmins] = useState([]);
  const [addAdmin, setAddAdmin] = useState({ username: '', password: '' });
  const [addAdminLoading, setAddAdminLoading] = useState(false);
  const [editAdminId, setEditAdminId] = useState(null);
  const [editAdmin, setEditAdmin] = useState({ username: '', password: '' });
  const [adminView, setAdminView] = useState(false);

  // Fetch all admins
  const fetchAdmins = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/all');
      setAdmins(res.data);
    } catch {
      showToast('Failed to load admins.', 'error');
    }
  }, [showToast]);

  // Add admin handler
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setAddAdminLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/admin/add', addAdmin);
      showToast(res.data.message || 'Admin added!');
      setAddAdmin({ username: '', password: '' });
      fetchAdmins();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to add admin', 'error');
    } finally {
      setAddAdminLoading(false);
    }
  };

  // Edit admin handlers
  const startEditAdmin = (admin) => {
    setEditAdminId(admin._id);
    setEditAdmin({ username: admin.username, password: '' });
  };
  const cancelEditAdmin = () => {
    setEditAdminId(null);
    setEditAdmin({ username: '', password: '' });
  };
  const handleEditAdminChange = (e) => {
    const { name, value } = e.target;
    setEditAdmin((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...editAdmin };
      if (!payload.password) delete payload.password;
      await axios.put(`http://localhost:5000/api/admin/edit/${editAdminId}`, payload);
      showToast('Admin updated!');
      fetchAdmins();
      setEditAdminId(null);
      setEditAdmin({ username: '', password: '' });
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update admin', 'error');
    }
  };

  // Add candidate form state
  const [addCandidate, setAddCandidate] = useState({
    name: '',
    position: '',
    email: '',
    password: '',
    offering: '',
    image: null // file object
  });
  const [addCandidateLoading, setAddCandidateLoading] = useState(false);
  // View state: 'add', 'list', or '' (none open by default)
  const [view, setView] = useState('');

  // Candidate list and edit state
  const [candidates, setCandidates] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editCandidate, setEditCandidate] = useState({ name: '', position: '', email: '', password: '', offering: '' });
  const [editLoading, setEditLoading] = useState(false);

  // Fetch all candidates
  const fetchCandidates = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/candidate/');
      setCandidates(res.data);
    } catch {
      showToast('Failed to load candidates.', 'error');
    }
  }, [showToast]);

  const prevStatusRef = useRef('');
  const audioStart = useRef(null);
  const audioEnd = useRef(null);
  // Removed duplicate toastTimeoutRef and showToast declarations


  const fetchCandidateCount = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/candidate/total/count');
      setCandidatesCount(res.data.totalCandidates);
    } catch {
      showToast('Failed to load candidates count.', 'error');
    }
  }, [showToast]);

  // Fetch total voters
  const fetchVoterCount = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/user/total/count');
      setVotersCount(res.data.totalVoters);
    } catch {
      showToast('Failed to load voters count.', 'error');
    }
  }, [showToast]);

  const lastStatusRef = useRef('');
  const fetchStatus = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/status');
      const data = res.data;

      // Play sounds on status change (catch play() errors to avoid runtime popup)
      if (prevStatusRef.current && prevStatusRef.current !== data.status) {
        if (data.status === 'running' && audioStart.current) {
          audioStart.current.play().catch(() => {});
        }
        if (data.status === 'ended' && audioEnd.current) {
          audioEnd.current.play().catch(() => {});
        }
      }

      // Only clear start/end time if status transitions from not-ended to ended
      if (lastStatusRef.current !== 'ended' && data.status === 'ended') {
        setStartTime('');
        setEndTime('');
        setDirtyStart(false);
        setDirtyEnd(false);
      }
      lastStatusRef.current = data.status;
      prevStatusRef.current = data.status;

      setStatus(data.status || 'unknown');
      setStartCountdown(data.startCountdown || '');
      setTimeRemaining(data.timeRemaining || '');

      // Only update start/end time from backend if not dirty (user not editing)
      if (data.status === 'running') {
        if (!dirtyStart) setStartTime(data.startTime ? safeInputValue(formatForInput(data.startTime)) : '');
        if (!dirtyEnd) setEndTime(data.endTime ? safeInputValue(formatForInput(data.endTime)) : '');
        setDirtyStart(false);
        setDirtyEnd(false);
      } else if (data.status === 'not-started') {
        if (!dirtyStart) setStartTime(data.startTime ? safeInputValue(formatForInput(data.startTime)) : '');
        if (!dirtyEnd) setEndTime(data.endTime ? safeInputValue(formatForInput(data.endTime)) : '');
      }

      // Use raw ISO values for calculation
      if (data.status === 'running' && data.startTime && data.endTime) {
        const now = new Date();
        const start = new Date(data.startTime);
        const end = new Date(data.endTime);
        const total = end - start;
        const elapsed = now - start;
        let percent = 0;
        if (total > 0) {
          if (now < start) {
            percent = 0;
          } else if (now > end) {
            percent = 100;
          } else {
            percent = Math.floor((elapsed / total) * 100);
          }
        }
        // Debug log
        // eslint-disable-next-line no-console
        console.log('ProgressBar Debug:', { now, start, end, total, elapsed, percent });
        setPercentElapsed(Math.max(0, Math.min(100, percent)));
      } else {
        setPercentElapsed(0);
      }
    } catch {
      setStatus('error');
      showToast('Error fetching election status.', 'error');
    }
  }, [showToast, dirtyStart, dirtyEnd]);

  useEffect(() => {
    fetchCandidateCount();
    fetchVoterCount();
    fetchStatus();
    fetchCandidates();
    const interval = setInterval(() => {
      fetchCandidateCount();
      fetchVoterCount();
      fetchStatus();
      fetchCandidates();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchCandidateCount, fetchVoterCount, fetchStatus, fetchCandidates]);

  const validateTimes = () => {
    if (!startTime || !endTime) {
      setError('Please enter both start and end times.');
      return false;
    }
    if (new Date(endTime) <= new Date(startTime)) {
      setError('End time must be after start time.');
      return false;
    }
    setError('');
    return true;
  };

  const startElection = async () => {
    if (!validateTimes()) return;
    if (selectedCandidateIds.length === 0) {
      setError('Please select at least one candidate for the election.');
      return;
    }
    try {
      // Use input values (local time) and convert to ISO for backend
      const res = await axios.post('http://localhost:5000/api/election/create-or-update', {
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        candidateIds: selectedCandidateIds,
      });
      showToast(res.data.message || 'Election started.');
      setDirtyStart(false);
      setDirtyEnd(false);
      fetchStatus();
    } catch {
      showToast('Error starting election.', 'error');
    }
  };

  const endElection = async () => {
    if (!window.confirm('Are you sure you want to end the election?')) return;
    try {
      const res = await axios.post('http://localhost:5000/api/admin/end');
      showToast(res.data.message || 'Election ended.');
      // Wait a moment to ensure backend updates, then refresh status
      setTimeout(() => {
        fetchStatus();
      }, 500);
    } catch {
      showToast('Failed to end election.', 'error');
    }
  };

  // Add candidate handler
  const handleAddCandidate = async (e) => {
    e.preventDefault();
    setAddCandidateLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', addCandidate.name);
      formData.append('position', addCandidate.position);
      formData.append('email', addCandidate.email);
      formData.append('password', addCandidate.password);
      formData.append('offering', addCandidate.offering);
      if (addCandidate.image) {
        formData.append('image', addCandidate.image);
      }
      const res = await axios.post('http://localhost:5000/api/candidate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast(res.data.message || 'Candidate added!');
      setAddCandidate({ name: '', position: '', email: '', password: '', offering: '', image: null });
      fetchCandidateCount();
      fetchCandidates();
    } catch (err) {
      showToast(
        err.response?.data?.error || 'Failed to add candidate',
        'error'
      );
    } finally {
      setAddCandidateLoading(false);
    }
  };

  // Edit candidate handlers
  const startEdit = (candidate) => {
    setEditId(candidate._id);
    setEditCandidate({
      name: candidate.name,
      position: candidate.position,
      email: candidate.email,
      password: '', // don't show password
      offering: candidate.offering || ''
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditCandidate({ name: '', position: '', email: '', password: '', offering: '' });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditCandidate((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      // Only send password if changed
      const payload = { ...editCandidate };
      if (!payload.password) delete payload.password;
      await axios.put(`http://localhost:5000/api/candidate/${editId}`, payload);
      showToast('Candidate updated!');
      fetchCandidates();
      setEditId(null);
      setEditCandidate({ name: '', position: '', email: '', password: '', offering: '' });
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update candidate', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: 32,
        maxWidth: 1100,
        margin: '40px auto',
        minHeight: '80vh',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: darkMode ? '#121212' : '#f4f6f9',
        color: darkMode ? '#eee' : '#222',
        borderRadius: 18,
        boxShadow: darkMode
          ? '0 0 30px rgba(0,0,0,0.9)'
          : '0 0 20px rgba(0,0,0,0.1)',
        transition: 'background-color 0.3s, color 0.3s',
        userSelect: 'none',
        boxSizing: 'border-box',
      }}
    >

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ textAlign: 'center', margin: 0 }}>🗳️ Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => {
              setAdminView((v) => !v);
              if (!adminView) fetchAdmins();
            }}
            style={{
              padding: '10px 22px',
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: '#1976d2',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 16,
              boxShadow: darkMode ? '0 0 10px #111' : '0 2px 10px #ccc',
              transition: 'background-color 0.3s',
            }}
            type="button"
          >
            {adminView ? 'Hide Admins' : 'Manage Admins'}
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 22px',
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: '#f44336',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 16,
              boxShadow: darkMode ? '0 0 10px #111' : '0 2px 10px #ccc',
              transition: 'background-color 0.3s',
            }}
            type="button"
          >
            Logout
          </button>
        </div>
      </div>
      {/* Admin Management Section */}
      {adminView && (
        <div style={{
          background: darkMode ? '#23272f' : '#fff',
          borderRadius: 12,
          boxShadow: darkMode ? '0 0 10px #111' : '0 2px 10px #ccc',
          padding: 24,
          marginBottom: 32,
          maxWidth: 600,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: 18, color: darkMode ? '#fff' : '#222' }}>Manage Admins</h2>
          {/* Add Admin Form */}
          <form onSubmit={handleAddAdmin} style={{ marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
            <input
              type="text"
              placeholder="Username"
              value={addAdmin.username}
              onChange={e => setAddAdmin(a => ({ ...a, username: e.target.value }))}
              required
              style={{ padding: 10, borderRadius: 8, border: '1px solid #bbb', fontSize: 16, minWidth: 160 }}
            />
            <input
              type="password"
              placeholder="Password"
              value={addAdmin.password}
              onChange={e => setAddAdmin(a => ({ ...a, password: e.target.value }))}
              required
              style={{ padding: 10, borderRadius: 8, border: '1px solid #bbb', fontSize: 16, minWidth: 160 }}
            />
            <button
              type="submit"
              disabled={addAdminLoading}
              style={{ padding: '10px 22px', borderRadius: 8, background: '#1976d2', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', cursor: addAdminLoading ? 'not-allowed' : 'pointer' }}
            >
              {addAdminLoading ? 'Adding...' : 'Add Admin'}
            </button>
          </form>
          {/* Admins List */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 0 }}>
            <thead>
              <tr style={{ background: darkMode ? '#222' : '#f4f6f9', color: darkMode ? '#eee' : '#333' }}>
                <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Username</th>
                <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a._id} style={{ background: editAdminId === a._id ? (darkMode ? '#333' : '#e3f2fd') : 'inherit' }}>
                  {editAdminId === a._id ? (
                    <>
                      <td style={{ padding: 8 }}>
                        <input name="username" value={editAdmin.username} onChange={handleEditAdminChange} style={{ width: '100%' }} />
                      </td>
                      <td style={{ padding: 8 }}>
                        <form onSubmit={handleEditAdminSubmit} style={{ display: 'flex', gap: 4 }}>
                          <input name="password" type="password" value={editAdmin.password} onChange={handleEditAdminChange} placeholder="New Password (optional)" style={{ width: 120 }} />
                          <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 700, cursor: 'pointer' }}>Save</button>
                          <button type="button" onClick={cancelEditAdmin} style={{ background: '#aaa', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                        </form>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ padding: 8 }}>{a.username}</td>
                      <td style={{ padding: 8 }}>
                        <button onClick={() => startEditAdmin(a)} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 700, cursor: 'pointer' }}>Edit</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            padding: '10px 18px',
            borderRadius: 20,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: darkMode ? '#444' : '#ddd',
            color: darkMode ? '#eee' : '#333',
            fontWeight: 'bold',
            fontSize: 16,
            transition: 'background-color 0.3s',
          }}
          aria-label="Toggle dark mode"
          type="button"
        >
          {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
      </div>

      <audio ref={audioStart} src="/sounds/start-sound.mp3" preload="auto" />
      <audio ref={audioEnd} src="/sounds/end-sound.mp3" preload="auto" />



      {/* First row: Cards centered */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 32,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 18,
        }}
      >
        <Card title="Total Candidates" value={candidatesCount} color="#4caf50" darkMode={darkMode} />
        <Card title="Total Voters" value={votersCount} color="#1976d2" darkMode={darkMode} />
      </div>

      {/* Second row: Action buttons centered */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 20,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 32,
        }}
      >
        <button
          onClick={() => setView(view === 'add' ? '' : 'add')}
          style={{
            padding: '18px 32px',
            borderRadius: 20,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: view === 'add' ? '#1976d2' : '#4caf50',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 20,
            marginBottom: 0,
            transition: 'background-color 0.3s',
            minWidth: 180,
            minHeight: 60,
            boxShadow: darkMode ? '0 0 10px #111' : '0 2px 10px #ccc',
          }}
          type="button"
        >
          {view === 'add' ? 'Hide Add Candidate' : 'Add Candidate'}
        </button>
        <button
          onClick={() => setView(view === 'list' ? '' : 'list')}
          style={{
            padding: '18px 32px',
            borderRadius: 20,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: view === 'list' ? '#1976d2' : '#4caf50',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 20,
            marginBottom: 0,
            transition: 'background-color 0.3s',
            minWidth: 180,
            minHeight: 60,
            boxShadow: darkMode ? '0 0 10px #111' : '0 2px 10px #ccc',
          }}
          type="button"
        >
          {view === 'list' ? 'Hide All Candidates' : 'Show All Candidates'}
        </button>
      </div>


      {/* Candidate List and Edit - only show if view is 'list' */}
      {view === 'list' && (
        <div style={{
          background: darkMode ? '#23272f' : '#fff',
          borderRadius: 12,
          boxShadow: darkMode ? '0 0 10px #111' : '0 2px 10px #ccc',
          padding: 24,
          marginBottom: 32,
          width: '100%',
          boxSizing: 'border-box',
          marginLeft: 0,
          marginRight: 0,
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: 18, color: darkMode ? '#fff' : '#222' }}>All Candidates</h2>
          {candidates.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888' }}>No candidates found.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 0 }}>
              <thead>
                <tr style={{ background: darkMode ? '#222' : '#f4f6f9', color: darkMode ? '#eee' : '#333' }}>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Image</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Name</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Position</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Email</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Offering</th>
                  <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c._id} style={{ background: editId === c._id ? (darkMode ? '#333' : '#e3f2fd') : 'inherit' }}>
                    {editId === c._id ? (
                      <>
                        <td style={{ padding: 8 }}>
                          {/* Image upload for edit not implemented in quick version */}
                          <span style={{ color: '#888', fontSize: 12 }}>N/A</span>
                        </td>
                        <td style={{ padding: 8 }}>
                          <input name="name" value={editCandidate.name} onChange={handleEditChange} style={{ width: '100%' }} />
                        </td>
                        <td style={{ padding: 8 }}>
                          <input name="position" value={editCandidate.position} onChange={handleEditChange} style={{ width: '100%' }} />
                        </td>
                        <td style={{ padding: 8 }}>
                          <input name="email" value={editCandidate.email} onChange={handleEditChange} style={{ width: '100%' }} />
                        </td>
                        <td style={{ padding: 8 }}>
                          <input name="offering" value={editCandidate.offering} onChange={handleEditChange} style={{ width: '100%' }} />
                        </td>
                        <td style={{ padding: 8 }}>
                          <form onSubmit={handleEditSubmit} style={{ display: 'flex', gap: 4 }}>
                            <input name="password" type="password" value={editCandidate.password} onChange={handleEditChange} placeholder="New Password (optional)" style={{ width: 120 }} />
                            <button type="submit" disabled={editLoading} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 700, cursor: editLoading ? 'not-allowed' : 'pointer' }}>Save</button>
                            <button type="button" onClick={cancelEdit} style={{ background: '#aaa', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                          </form>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: 8 }}>
                          {c.imageUrl ? (
                            <img src={c.imageUrl} alt={c.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '50%', border: '1px solid #ccc' }} />
                          ) : (
                            <span style={{ color: '#bbb', fontSize: 12 }}>No Image</span>
                          )}
                        </td>
                        <td style={{ padding: 8 }}>{c.name}</td>
                        <td style={{ padding: 8 }}>{c.position}</td>
                        <td style={{ padding: 8 }}>{c.email}</td>
                        <td style={{ padding: 8 }}>{c.offering}</td>
                        <td style={{ padding: 8 }}>
                          <button onClick={() => startEdit(c)} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 700, cursor: 'pointer' }}>Edit</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add Candidate Form - show when view is 'add' */}
      {view === 'add' && (
        <div style={{
          background: darkMode ? '#23272f' : '#fff',
          borderRadius: 12,
          boxShadow: darkMode ? '0 0 10px #111' : '0 2px 10px #ccc',
          padding: 24,
          marginBottom: 32,
          maxWidth: 480,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: 18, color: darkMode ? '#fff' : '#222' }}>Add New Candidate</h2>
          <form onSubmit={handleAddCandidate} encType="multipart/form-data">
            <input
              type="text"
              placeholder="Name"
              value={addCandidate.name}
              onChange={e => setAddCandidate(c => ({ ...c, name: e.target.value }))}
              required
              style={{ width: '100%', padding: 10, marginBottom: 12, borderRadius: 8, border: '1px solid #bbb', fontSize: 16 }}
            />
            <input
              type="text"
              placeholder="Position"
              value={addCandidate.position}
              onChange={e => setAddCandidate(c => ({ ...c, position: e.target.value }))}
              required
              style={{ width: '100%', padding: 10, marginBottom: 12, borderRadius: 8, border: '1px solid #bbb', fontSize: 16 }}
            />
            <input
              type="email"
              placeholder="Email"
              value={addCandidate.email}
              onChange={e => setAddCandidate(c => ({ ...c, email: e.target.value }))}
              required
              style={{ width: '100%', padding: 10, marginBottom: 12, borderRadius: 8, border: '1px solid #bbb', fontSize: 16 }}
            />
            <input
              type="password"
              placeholder="Password"
              value={addCandidate.password}
              onChange={e => setAddCandidate(c => ({ ...c, password: e.target.value }))}
              required
              style={{ width: '100%', padding: 10, marginBottom: 12, borderRadius: 8, border: '1px solid #bbb', fontSize: 16 }}
            />
            <textarea
              placeholder="Campaign Offering (optional)"
              value={addCandidate.offering}
              onChange={e => setAddCandidate(c => ({ ...c, offering: e.target.value }))}
              rows={3}
              style={{ width: '100%', padding: 10, marginBottom: 16, borderRadius: 8, border: '1px solid #bbb', fontSize: 16 }}
            />
            <input
              type="file"
              accept="image/*"
              onChange={e => setAddCandidate(c => ({ ...c, image: e.target.files[0] }))}
              style={{ width: '100%', marginBottom: 16 }}
            />
            <button
              type="submit"
              disabled={addCandidateLoading}
              style={{ width: '100%', padding: 12, borderRadius: 8, background: '#1976d2', color: '#fff', fontWeight: 700, fontSize: 17, border: 'none', cursor: addCandidateLoading ? 'not-allowed' : 'pointer' }}
            >
              {addCandidateLoading ? 'Adding...' : 'Add Candidate'}
            </button>
          </form>
        </div>
      )}

      <div
        style={{
          backgroundColor: darkMode ? '#1f1f1f' : '#fff',
          borderRadius: 12,
          boxShadow: darkMode
            ? '0 0 15px rgba(0,0,0,0.7)'
            : '0 4px 20px rgba(0,0,0,0.1)',
          padding: 20,
          marginBottom: 30,
          maxWidth: 480,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <label htmlFor="startTime" style={{ display: 'block', fontWeight: '600', marginBottom: 6, color: darkMode ? '#ccc' : '#444', userSelect: 'none' }}>
          Start Time
        </label>
        <input
          id="startTime"
          type="datetime-local"
          value={safeInputValue(startTime)}
          onChange={(e) => {
            setStartTime(e.target.value);
            setDirtyStart(true);
          }}
          style={{
            width: '100%',
            padding: 10,
            borderRadius: 8,
            border: darkMode ? '1px solid #444' : '1px solid #ccc',
            marginBottom: 16,
            backgroundColor: darkMode ? '#222' : '#fff',
            color: darkMode ? '#eee' : '#222',
            fontSize: 16,
          }}
        />

        <label htmlFor="endTime" style={{ display: 'block', fontWeight: '600', marginBottom: 6, color: darkMode ? '#ccc' : '#444', userSelect: 'none' }}>
          End Time
        </label>
        <input
          id="endTime"
          type="datetime-local"
          value={safeInputValue(endTime)}
          onChange={(e) => {
            setEndTime(e.target.value);
            setDirtyEnd(true);
          }}
          style={{
            width: '100%',
            padding: 10,
            borderRadius: 8,
            border: darkMode ? '1px solid #444' : '1px solid #ccc',
            backgroundColor: darkMode ? '#222' : '#fff',
            color: darkMode ? '#eee' : '#222',
            fontSize: 16,
          }}
        />

        <label style={{ display: 'block', fontWeight: '600', marginBottom: 6, color: darkMode ? '#ccc' : '#444', userSelect: 'none' }}>
          Select Candidates for Election
        </label>
        <div style={{ marginBottom: 16 }}>
          {candidates.length === 0 ? (
            <p style={{ color: '#888', fontSize: 15 }}>No candidates available.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {candidates.map((c) => (
                <label key={c._id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: selectedCandidateIds.includes(c._id) ? '#e3f2fd' : '#f4f6f9',
                  borderRadius: 8,
                  padding: '8px 12px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: 15,
                  border: selectedCandidateIds.includes(c._id) ? '2px solid #1976d2' : '1px solid #bbb',
                  marginBottom: 6,
                  minWidth: 180,
                }}>
                  <input
                    type="checkbox"
                    checked={selectedCandidateIds.includes(c._id)}
                    onChange={e => {
                      setSelectedCandidateIds(ids =>
                        e.target.checked
                          ? [...ids, c._id]
                          : ids.filter(id => id !== c._id)
                      );
                    }}
                    style={{ marginRight: 10 }}
                  />
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.name} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: '50%', border: '1px solid #ccc', marginRight: 10 }} />
                  ) : (
                    <span style={{ color: '#bbb', fontSize: 12, marginRight: 10 }}>No Image</span>
                  )}
                  <span>{c.name} ({c.position})</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div style={{ color: '#e55353', marginBottom: 12, fontWeight: '600', fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 8 }}>
          <button
            onClick={startElection}
            type="button"
            style={{
              flex: 1,
              padding: '14px 0',
              borderRadius: 30,
              border: 'none',
              backgroundColor: '#4caf50',
              color: '#fff',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: 16,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4caf50')}
          >
            Start Election
          </button>

          <button
            onClick={endElection}
            type="button"
            disabled={status !== 'running'}
            style={{
              flex: 1,
              padding: '14px 0',
              borderRadius: 30,
              border: 'none',
              backgroundColor: status === 'running' ? '#f44336' : '#aaa',
              color: '#fff',
              fontWeight: '700',
              cursor: status === 'running' ? 'pointer' : 'not-allowed',
              fontSize: 16,
            }}
            onMouseEnter={(e) => {
              if (status === 'running') e.currentTarget.style.backgroundColor = '#d32f2f';
            }}
            onMouseLeave={(e) => {
              if (status === 'running') e.currentTarget.style.backgroundColor = '#f44336';
            }}
          >
            End Election
          </button>
        </div>
      </div>

      <section style={{ textAlign: 'center', marginTop: 32, userSelect: 'none' }} aria-live="polite">
        <h3 style={{
          marginBottom: 12,
          color: status === 'running'
            ? '#4caf50'
            : status === 'ended'
            ? '#f44336'
            : status === 'not-started'
            ? '#f9a825'
            : '#777',
          fontWeight: '700',
          fontSize: 22,
        }}>
          Election Status: {status.toUpperCase()}
        </h3>

        {status === 'not-started' && startCountdown && (
          <p style={{ fontSize: 20, color: darkMode ? '#ccc' : '#555', fontWeight: '600', marginTop: 8 }}>
            ⏳ Starting In: {startCountdown}
          </p>
        )}

        {status === 'running' && timeRemaining && (
          <>
            <p style={{ fontSize: 20, color: darkMode ? '#ccc' : '#555', fontWeight: '600', marginTop: 8 }}>
              ⏱️ Time Remaining: {timeRemaining}
            </p>

            <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentElapsed}
              style={{
                height: 28,
                backgroundColor: darkMode ? '#333' : '#eee',
                borderRadius: 30,
                overflow: 'hidden',
                margin: '20px auto 0',
                maxWidth: 360,
              }}>
              <div style={{
                width: `${percentElapsed}%`,
                height: '100%',
                backgroundColor: '#4caf50',
                transition: 'width 1s ease-in-out',
                borderRadius: '30px 0 0 30px',
                textAlign: 'right',
                color: '#fff',
                fontWeight: '700',
                paddingRight: 14,
                lineHeight: '28px',
                fontSize: 16,
              }}>
                {percentElapsed}%
              </div>
            </div>
          </>
        )}

        {status === 'ended' && (
          <p style={{ fontSize: 20, color: '#f44336', marginTop: 10, fontWeight: '700' }}>
            ✅ The election has ended.
          </p>
        )}

        {status === 'loading' && <p>⏳ Loading election status...</p>}
        {status === 'error' && <p style={{ color: '#e55353' }}>Error loading election status.</p>}
      </section>

      {toast && (
        <div role="alert" aria-live="assertive" style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: toast.type === 'error' ? '#e55353' : '#4caf50',
          color: '#fff',
          padding: '14px 26px',
          borderRadius: 30,
          boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
          fontWeight: '700',
          zIndex: 1000,
          animation: 'fadeinout 3.5s forwards',
        }}>
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes fadeinout {
          0% {opacity: 0; transform: translateX(-50%) translateY(20px);}
          10%, 90% {opacity: 1; transform: translateX(-50%) translateY(0);}
          100% {opacity: 0; transform: translateX(-50%) translateY(20px);}
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;
