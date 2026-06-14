import React from 'react';
import './Leaderboard.css';

const Leaderboard = () => {
  return (
    <div>
      <div className="page-title-banner">
        <div>
          <h2>Bảng Xếp Hạng Học Viên</h2>
          <p>Thi đua học tập cùng các học viên khác trên hệ thống. Top học viên tích cực trong tuần.</p>
        </div>
        <div className="neo-badge" style={{ backgroundColor: 'var(--color-yellow)', color: 'var(--color-black)' }}>
          Cập nhật: Mới nhất
        </div>
      </div>

      <div className="neo-card" style={{ padding: '20px' }}>
        <div className="leaderboard-list">
          
          <div className="neo-card leaderboard-row" style={{ backgroundColor: '#fffdf4', borderStyle: 'solid' }}>
            <span className="rank-number rank-1">🏆 1</span>
            <div className="leaderboard-user">
              <div className="user-avatar" style={{ backgroundColor: 'var(--color-yellow)' }}>AH</div>
              <div>
                <strong>Anh Hoang Nguyen</strong>
                <div style={{ fontSize: '11px', color: '#666' }}>Đã học 840 từ vựng • 24 Đề thi</div>
              </div>
            </div>
            <span className="leaderboard-score" style={{ color: 'var(--color-primary)' }}>4,820 XP</span>
          </div>

          <div className="neo-card leaderboard-row" style={{ backgroundColor: '#f9f9f9' }}>
            <span className="rank-number rank-2">🥈 2</span>
            <div className="leaderboard-user">
              <div className="user-avatar" style={{ backgroundColor: 'var(--color-secondary)' }}>VT</div>
              <div>
                <strong>Vu Tran Tuan</strong>
                <div style={{ fontSize: '11px', color: '#666' }}>Đã học 510 từ vựng • 18 Đề thi</div>
              </div>
            </div>
            <span className="leaderboard-score">3,150 XP</span>
          </div>

          <div className="neo-card leaderboard-row" style={{ backgroundColor: 'var(--color-primary-light)', borderColor: 'var(--color-primary)' }}>
            <span className="rank-number rank-3">🥉 3</span>
            <div className="leaderboard-user">
              <div className="user-avatar" style={{ backgroundColor: 'var(--color-primary)' }}>TN</div>
              <div>
                <strong>Thanh Nguyen Duc (Bạn)</strong>
                <div style={{ fontSize: '11px', color: '#666' }}>Đã học 216 từ vựng • 4 Đề thi</div>
              </div>
            </div>
            <span className="leaderboard-score" style={{ color: 'var(--color-primary)' }}>2,180 XP</span>
          </div>

          <div className="neo-card leaderboard-row">
            <span className="rank-number">4</span>
            <div className="leaderboard-user">
              <div className="user-avatar" style={{ backgroundColor: 'var(--color-blue)' }}>LH</div>
              <div>
                <strong>Le Huynh Lam</strong>
                <div style={{ fontSize: '11px', color: '#666' }}>Đã học 195 từ vựng • 8 Đề thi</div>
              </div>
            </div>
            <span className="leaderboard-score">1,940 XP</span>
          </div>

          <div className="neo-card leaderboard-row">
            <span className="rank-number">5</span>
            <div className="leaderboard-user">
              <div className="user-avatar" style={{ backgroundColor: 'var(--color-accent)' }}>KP</div>
              <div>
                <strong>Kim Phuong</strong>
                <div style={{ fontSize: '11px', color: '#666' }}>Đã học 120 từ vựng • 2 Đề thi</div>
              </div>
            </div>
            <span className="leaderboard-score">1,210 XP</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
