import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Shadowing.css';

const Shadowing = () => {
  const navigate = useNavigate();

  return (
    <div className="shadowing-dev-container">
      <div className="shadowing-glass-card">
        <div className="shadowing-icon-wrapper">
          <span className="shadowing-pulse-ring"></span>
          <span className="shadowing-pulse-ring delay-1"></span>
          <span className="shadowing-main-icon">🎙️</span>
        </div>

        <h1 className="shadowing-title">Tính Năng Shadowing</h1>

        <div className="shadowing-badge">
          🚧 ĐANG PHÁT TRIỂN
        </div>
      </div>
    </div>
  );
};

export default Shadowing;
