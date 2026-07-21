import React, { useState, useEffect } from 'react';
import axios from 'axios';
import beUrl from '../../api-url/api-backend';
import { useAuth } from '../../context/authContext';
import './Leaderboard.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    axios.get(`${beUrl}/score/leaderboard`)
      .then(res => {
        setLeaderboard(res.data.leaderboard || []);
      })
      .catch(err => {
        console.error("Lỗi khi tải bảng xếp hạng:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getInitials = (name) => {
    if (!name) return 'UN';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getAvatarBg = (rank) => {
    const colors = ['var(--color-yellow)', 'var(--color-secondary)', 'var(--color-primary)', 'var(--color-blue)', 'var(--color-accent)'];
    return colors[(rank - 1) % colors.length];
  };

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
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', fontWeight: '800', color: '#666' }}>
            🔄 Đang tải bảng xếp hạng...
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', fontWeight: '800', color: '#666' }}>
            Chưa có dữ liệu xếp hạng nào. Hãy bắt đầu học để đứng đầu bảng!
          </div>
        ) : (
          <div className="leaderboard-list">
            {leaderboard.map((item, idx) => {
              const rank = idx + 1;
              const isCurrentUser = user && item.id === user.id;
              
              let rowStyle = {};
              let rankBadge = `${rank}`;
              let rowClass = "neo-card leaderboard-row";

              if (rank === 1) {
                rankBadge = "🏆 1";
                rowStyle = { backgroundColor: '#fffdf4', borderStyle: 'solid' };
              } else if (rank === 2) {
                rankBadge = "🥈 2";
                rowStyle = { backgroundColor: '#f9f9f9' };
              } else if (rank === 3) {
                rankBadge = "🥉 3";
              }

              if (isCurrentUser) {
                rowStyle = { 
                  ...rowStyle, 
                  backgroundColor: 'var(--color-primary-light)', 
                  borderColor: 'var(--color-primary)',
                  borderWidth: '2.5px'
                };
              }

              return (
                <div key={item.id} className={rowClass} style={rowStyle}>
                  <span className={`rank-number ${rank <= 3 ? `rank-${rank}` : ''}`}>
                    {rankBadge}
                  </span>
                  <div className="leaderboard-user">
                    <div className="user-avatar" style={{ backgroundColor: getAvatarBg(rank), overflow: 'hidden' }}>
                      {item.avatarUrl ? (
                        <img 
                          src={item.avatarUrl} 
                          alt="Avatar" 
                          referrerPolicy="no-referrer"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ) : (
                        getInitials(item.userName)
                      )}
                    </div>
                    <div>
                      <strong>
                        {item.userName} {isCurrentUser ? '(Bạn)' : ''}
                      </strong>
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        Đã học {item.vocabCount || 0} từ vựng • {item.examCount || 0} Đề thi
                      </div>
                    </div>
                  </div>
                  <span className="leaderboard-score" style={{ color: rank === 1 || isCurrentUser ? 'var(--color-primary)' : 'inherit' }}>
                    {item.score.toLocaleString()} XP
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
