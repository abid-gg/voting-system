import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function VoterVerify() {
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const verifyOTP = async () => {
    try {
      const email = localStorage.getItem('voterEmail');
      const res = await axios.post('http://localhost:5000/api/user/verify-otp', {
        email, otp
      });

      localStorage.setItem('voterId', res.data.user._id);
      setMessage('✅ OTP verified!');
      navigate('/vote');
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.error || 'Verification failed'));
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>🔐 Verify OTP</h2>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          style={styles.input}
        />
        <button onClick={verifyOTP} style={styles.button}>Confirm</button>
        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to right, #74ebd5, #acb6e5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    textAlign: 'center',
    width: '320px',
  },
  heading: {
    marginBottom: '1rem',
    fontSize: '1.5rem',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px 15px',
    fontSize: '1rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    marginBottom: '1rem',
    outline: 'none',
  },
  button: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    transition: 'background 0.3s ease',
  },
  message: {
    marginTop: '1rem',
    fontWeight: 'bold',
    color: '#333',
  },
};

export default VoterVerify;
