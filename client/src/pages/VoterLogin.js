import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function VoterLogin() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const sendOTP = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/user/send-otp', {
        email, name
      });

      setMessage(res.data.message);
      localStorage.setItem('voterEmail', email); // Store for next step
      navigate('/verify-otp');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to send OTP');
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e3f2fd 0%, #90caf9 100%)',
    }}>
      <div style={{
        background: '#fff',
        padding: '32px 28px',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        maxWidth: 350,
        width: '100%',
        textAlign: 'center',
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
        <h2 style={{
          color: '#1565c0',
          marginBottom: 24,
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: 1,
        }}>
          🗳️ Voter Login
        </h2>
        <div style={{ marginBottom: 18 }}>
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #bdbdbd',
              marginBottom: 12,
              fontSize: 16,
              outline: 'none',
              boxSizing: 'border-box',
              background: '#f7fbff',
              transition: 'border 0.2s',
            }}
          />
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #bdbdbd',
              marginBottom: 12,
              fontSize: 16,
              outline: 'none',
              boxSizing: 'border-box',
              background: '#f7fbff',
              transition: 'border 0.2s',
            }}
          />
        </div>
        <button
          onClick={sendOTP}
          style={{
            width: '100%',
            padding: '12px 0',
            borderRadius: 8,
            border: 'none',
            background: '#1976d2',
            color: '#fff',
            fontWeight: 700,
            fontSize: 18,
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.12)',
            cursor: 'pointer',
            marginBottom: 10,
            transition: 'background 0.2s',
          }}
        >
          Send OTP
        </button>
        {message && (
          <div style={{
            marginTop: 10,
            color: message.toLowerCase().includes('fail') ? '#c62828' : '#2e7d32',
            fontWeight: 500,
            fontSize: 15,
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default VoterLogin;
