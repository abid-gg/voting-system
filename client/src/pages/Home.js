// client/src/pages/Home.js
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 60% 40%, #e3f2fd 0%, #90caf9 100%)',
      fontFamily: 'Segoe UI, Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative background pattern */}
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, opacity: 0.08 }}>
        <circle cx="80" cy="80" r="60" fill="#1976d2" />
        <circle cx="90%" cy="30" r="40" fill="#43a047" />
        <circle cx="20%" cy="90%" r="50" fill="#f9a825" />
      </svg>
      <header style={{
        width: '100%',
        padding: '32px 0 0 0',
        textAlign: 'center',
        zIndex: 2,
        position: 'relative',
      }}>
        <img src="/logo192.png" alt="Voting Logo" style={{ width: 70, marginBottom: 10 }} />
        <h1 style={{
          fontSize: '2.7rem',
          fontWeight: 800,
          color: '#1976d2',
          marginBottom: 6,
          letterSpacing: '1.5px',
          textShadow: '0 2px 8px #90caf9',
        }}>Online Voting System</h1>
        <div style={{
          color: '#333',
          fontSize: '1.18rem',
          marginBottom: 18,
          fontWeight: 500,
          letterSpacing: '0.2px',
        }}>
          Secure, transparent, and easy voting for everyone.
        </div>
      </header>
      <main style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
        zIndex: 2,
        position: 'relative',
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.98)',
          borderRadius: '22px',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.13)',
          padding: '40px 28px 32px 28px',
          maxWidth: '440px',
          width: '95%',
          textAlign: 'center',
          marginTop: 10,
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}>
            <RoleCard
              title="Admin Login"
              description="Manage elections, candidates, and results."
              to="/admin-login"
              color="#1976d2"
              icon="🛡️"
            />
            <RoleCard
              title="Candidate Login"
              description="Participate as a candidate and view your dashboard."
              to="/candidate-login"
              color="#43a047"
              icon="🎤"
            />
            <RoleCard
              title="Voter Login"
              description="Vote securely and view election status."
              to="/voter-login"
              color="#f9a825"
              icon="🗳️"
            />
            <RoleCard
              title="Election Results"
              description="View results of all past elections."
              to="/results"
              color="#1565c0"
              icon="📊"
            />
          </div>
        </div>
      </main>
      <footer style={{ color: '#1976d2', marginTop: 40, fontSize: 15, opacity: 0.85, textAlign: 'center', zIndex: 2, position: 'relative' }}>
        &copy; {new Date().getFullYear()} Online Voting System. All rights reserved.
      </footer>
    </div>
  );
}

function RoleCard({ title, description, to, color, icon }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div
        style={{
          background: color,
          color: '#fff',
          borderRadius: '14px',
          padding: '20px 26px',
          boxShadow: '0 2px 12px rgba(30,60,114,0.13)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          transition: 'transform 0.18s, box-shadow 0.18s',
          cursor: 'pointer',
          fontWeight: 500,
          fontSize: '1.13rem',
          marginBottom: 0,
          border: 'none',
          outline: 'none',
        }}
        onMouseOver={e => {
          e.currentTarget.style.transform = 'scale(1.045)';
          e.currentTarget.style.boxShadow = '0 4px 18px #1976d2aa';
        }}
        onMouseOut={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 12px rgba(30,60,114,0.13)';
        }}
      >
        <span style={{ fontSize: '2.2rem' }}>{icon}</span>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '1.18rem', fontWeight: 700 }}>{title}</div>
          <div style={{ fontSize: '1.01rem', opacity: 0.93 }}>{description}</div>
        </div>
      </div>
    </Link>
  );
}
export default Home;
