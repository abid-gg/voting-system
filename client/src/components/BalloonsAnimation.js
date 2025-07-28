import React from "react";

// Simple animated balloons using CSS
export default function BalloonsAnimation() {
  return (
    <div className="balloons-animation">
      {[...Array(7)].map((_, i) => (
        <div key={i} className={`balloon balloon-${i + 1}`}></div>
      ))}
      <style>{`
        .balloons-animation {
          position: absolute;
          left: 0; right: 0; top: 0; bottom: 0;
          pointer-events: none;
          z-index: 100;
        }
        .balloon {
          position: absolute;
          bottom: -80px;
          width: 40px;
          height: 55px;
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          opacity: 0.85;
          animation: balloon-float 3.5s ease-in-out forwards;
        }
        .balloon-1 { left: 10%; background: #ff5252; animation-delay: 0.1s; }
        .balloon-2 { left: 25%; background: #ffd600; animation-delay: 0.5s; }
        .balloon-3 { left: 40%; background: #40c4ff; animation-delay: 0.3s; }
        .balloon-4 { left: 55%; background: #69f0ae; animation-delay: 0.7s; }
        .balloon-5 { left: 70%; background: #ab47bc; animation-delay: 0.2s; }
        .balloon-6 { left: 85%; background: #ff7043; animation-delay: 0.6s; }
        .balloon-7 { left: 50%; background: #fff176; animation-delay: 0.4s; }
        @keyframes balloon-float {
          0% { transform: translateY(0) scale(1); opacity: 0.85; }
          60% { opacity: 1; }
          100% { transform: translateY(-420px) scale(1.08); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
