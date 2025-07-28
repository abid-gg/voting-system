
import React, { useState } from 'react';
import axios from 'axios';

function CandidateLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/candidate/login', { email, password });
      if (res.data && res.data._id) {
        localStorage.setItem('candidateId', res.data._id);
        window.location.href = '/candidate-dashboard';
      } else {
        setError('Login failed.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f2fd 0%, #90caf9 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        maxWidth: 400,
        width: '100%',
        background: '#fff',
        borderRadius: 18,
        boxShadow: '0 6px 32px rgba(25, 118, 210, 0.10)',
        padding: 36,
        margin: '40px 0',
        position: 'relative',
      }}>
        <button
          onClick={handleGoHome}
          style={{
            position: 'absolute',
            left: 20,
            top: 20,
            padding: '7px 18px',
            borderRadius: 18,
            border: 'none',
            backgroundColor: '#1976d2',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 15,
            cursor: 'pointer',
            boxShadow: '0 2px 8px #c5cae9',
            zIndex: 2,
          }}
          type="button"
        >
          Go Home
        </button>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src="/logo192.png" alt="Logo" style={{ width: 56, height: 56, marginBottom: 8 }} />
          <h2 style={{ margin: 0, color: '#1976d2', fontWeight: 700, fontSize: 28 }}>Candidate Login</h2>
          <p style={{ color: '#555', margin: '8px 0 0 0', fontSize: 16 }}>Access your dashboard</p>
        </div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email" style={{ fontWeight: 600, color: '#1976d2', fontSize: 15, marginBottom: 4, display: 'block' }}>Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: 12, marginBottom: 18, borderRadius: 8, border: '1px solid #bbb', fontSize: 16, background: '#f7fbff' }}
          />
          <label htmlFor="password" style={{ fontWeight: 600, color: '#1976d2', fontSize: 15, marginBottom: 4, display: 'block' }}>Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 12, marginBottom: 18, borderRadius: 8, border: '1px solid #bbb', fontSize: 16, background: '#f7fbff' }}
          />
          {error && <div style={{ color: '#e55353', marginBottom: 16, textAlign: 'center', fontWeight: 600 }}>{error}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: 14, borderRadius: 8, background: '#1976d2', color: '#fff', fontWeight: 700, fontSize: 18, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: 1, marginTop: 4, boxShadow: loading ? '0 0 10px #1976d2' : 'none', transition: 'all 0.3s' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CandidateLogin;
