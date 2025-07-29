import React, { useEffect, useState, useMemo, useRef } from 'react';
import jsPDF from 'jspdf';
import BalloonsAnimation from '../components/BalloonsAnimation';
import axios from 'axios';

function ElectionResults() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [voteCounts, setVoteCounts] = useState({});
  const [loading, setLoading] = useState(false);
const backendURL = 'https://voting-system-i2uh.onrender.com/api';

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

  // Download report handler (PDF)
  const handleDownloadReport = async () => {
    if (!selectedElection || candidates.length === 0 || winners.length === 0) return;
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Election Report', 15, y);
    doc.setFont('helvetica', 'normal');
    y += 12;
    doc.setFontSize(14);
    doc.text(`Election ID: ${selectedElection._id}`, 15, y);
    y += 8;
    doc.text(`Start: ${selectedElection.startTime ? new Date(selectedElection.startTime).toLocaleString() : 'N/A'}`, 15, y);
    y += 8;
    doc.text(`End: ${selectedElection.endTime ? new Date(selectedElection.endTime).toLocaleString() : 'N/A'}`, 15, y);
    y += 12;

    // Winner section with image and effect (safe: no emojis)
    if (winners.length === 1) {
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Winner:', 15, y);
      doc.text(winners[0].name, 40, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(15);
      doc.text(`(${winners[0].position})`, 15, y + 8);
      y += 20;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Votes: ${voteCounts[winners[0]._id] || 0}`, 15, y);
      doc.setFont('helvetica', 'normal');
      y += 5;

      // Add winner image with effect (draw circle, then image)
      let imgY = y;
      let imgX = 80;
      // Load winner image
      let imgUrl = winners[0].imageUrl ? winners[0].imageUrl : '/default-avatar.png';
      try {
        const toDataUrl = url => fetch(url)
          .then(r => r.blob())
          .then(blob => new Promise((resolve, reject) => {
            const reader = new window.FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          }));
        const base64 = await toDataUrl(imgUrl);
        doc.addImage(base64, 'JPEG', imgX, imgY, 40, 40, undefined, 'FAST');
        doc.setDrawColor(40, 167, 69);
        doc.setLineWidth(1.5);
        doc.rect(imgX, imgY, 40, 40);
      } catch (e) {
        // fallback: no image
      }
      y += 48;
      doc.setFontSize(16);
      doc.setTextColor(249, 168, 37);
      doc.setFont('helvetica', 'bold');
      doc.text('The campus celebrates your victory!', 15, y);
      doc.setFont('helvetica', 'normal');
      y += 10;
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(13);
      doc.text('With determination and spirit, you have inspired many.', 15, y);
      y += 10;
      doc.text('May your leadership bring joy and progress to all!', 15, y);
      y += 12;
    } else {
      doc.setFontSize(16);
      doc.text('Tie between:', 15, y);
      y += 8;
      doc.setFontSize(13);
      winners.forEach(w => {
        doc.text(`- ${w.name} (${w.position}), Votes: ${voteCounts[w._id] || 0}`, 15, y);
        y += 8;
      });
      y += 4;
      doc.setFontSize(14);
      doc.setTextColor(249, 168, 37);
      doc.setFont('helvetica', 'bold');
      doc.text('The campus celebrates your shared victory!', 15, y);
      doc.setFont('helvetica', 'normal');
      y += 10;
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(13);
      doc.text('May your teamwork bring joy and progress to all!', 15, y);
      y += 12;
    }
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('All Candidates:', 15, y);
    doc.setFont('helvetica', 'normal');
    y += 8;
    doc.setFontSize(12);
    candidates.forEach(c => {
      doc.text(`- ${c.name} (${c.position}): ${voteCounts[c._id] || 0} votes`, 15, y);
      y += 7;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    // Add second page with custom message for winner
    doc.addPage();
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    if (winners.length === 1) {
      // Wrap long lines manually for PDF compatibility
      doc.text(`We proudly announce that ${winners[0].name} has been elected as`, 15, 30);
      doc.text(`the winner of our university election!`, 15, 40);
      doc.text('Congratulations to our new leader!', 15, 60);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(`With great energy and bold vision, ${winners[0].name} promises to bring exciting changes to our university life.`, 15, 70);
      doc.text(`Here's what we can look forward to under their leadership:`, 15, 90);
      let y2 = 100;
      doc.setFontSize(10);
      doc.text('- More events, less stress – From game nights to surprise snack giveaways, campus life is about to get better!', 15, y2);
      y2 += 10;
      doc.text('- Extended canteen hours – Midnight cravings? Solved.', 15, y2);
      y2 += 10;
      doc.text('- One extra holiday (somehow) – Democracy has spoken. Let us manifest it.', 15, y2);
      y2 += 10;
      doc.text('- Air conditioning in classrooms... in our dreams? – At least they will try.', 15, y2);
      y2 += 10;
      doc.text('- Official Meme Monday – Because laughter is the best study break.', 15, y2);
      y2 += 14;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`These are just a few of the changes promised by our new student champion, ${winners[0].name}. Whether they deliver or not… well, we voted for fun, and fun we shall have!`, 15, y2);
      doc.setFont('helvetica', 'normal');
    } else {
      doc.text('We proudly announce that our winners have tied in the university election!', 15, 30);
      doc.text('Congratulations to our new leaders!', 15, 40);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(14);
      doc.text('With great energy and bold vision, our champions promise to bring exciting changes to our university life.', 15, 50);
      doc.text('Here is what we can look forward to under their leadership:', 15, 60);
      let y2 = 60;
      doc.setFontSize(13);
      doc.text('- More events, less stress – From game nights to surprise snack giveaways, campus life is about to get better!', 15, y2);
      y2 += 10;
      doc.text('- Extended canteen hours – Midnight cravings? Solved.', 15, y2);
      y2 += 10;
      doc.text('- One extra holiday (somehow) – Democracy has spoken. Let us manifest it.', 15, y2);
      y2 += 10;
      doc.text('- Air conditioning in classrooms... in our dreams? – At least they will try.', 15, y2);
      y2 += 10;
      doc.text('- Official Meme Monday – Because laughter is the best study break.', 15, y2);
      y2 += 14;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('These are just a few of the changes promised by our new student champions. Whether they deliver or not… well, we voted for fun, and fun we shall have!', 15, y2);
      doc.setFont('helvetica', 'normal');
    }
    doc.save(`election_report_${selectedElection._id}.pdf`);
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 24, background: '#f5faff', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
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
          {/* Download Report Button */}
          <button
            onClick={handleDownloadReport}
            style={{
              marginTop: 18,
              padding: '10px 22px',
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: '#43a047',
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
            Download Report
          </button>
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
