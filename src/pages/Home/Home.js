import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import axios from 'axios';
import beUrl from '../../api-url/api-backend';
import './Home.css';

const Home = ({ dailyWord, handleWordLearned, playAudio }) => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  const [commentsList, setCommentsList] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${beUrl}/comments/get-all`);
      const sorted = (response.data.comments || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setCommentsList(sorted);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    if (!user) return;

    setSubmittingComment(true);
    try {
      await axios.post(`${beUrl}/comments/create`, {
        content: newCommentText,
        userId: user.id
      });
      setNewCommentText('');
      fetchComments();
    } catch (err) {
      console.error("Error posting comment:", err);
      alert("Không thể gửi bình luận. Vui lòng thử lại!");
    } finally {
      setSubmittingComment(false);
    }
  };

  const love = {
    birthday: "0201"
  }
  function heart() {
    return console.log("心情每天都好")
  }
  function getLove() {
    if (love.birthday === "0201") {
      heart();
    }
    return 0;
  }
  console.log(getLove());

  return (
    <div>
      {/* Header / Welcome widget */}
      <header className="dashboard-header">
        <div>
          <h1 className="welcome-title">Chào, {loading ? '...' : (user?.name || 'bạn')} 👋</h1>
          <p className="welcome-subtitle">Chúc bạn một ngày học tập đầy hứng khởi! Cùng chinh phục TOCFL nào.</p>
        </div>
        <button className="neo-btn neo-btn-primary" onClick={() => navigate('/roadmap')}>
          Xem tiến trình học
        </button>
      </header>

      {/* Stats Dashboard Row */}
      <section className="stats-grid">
        <div className="neo-card stat-card" style={{ borderLeft: '8px solid var(--color-primary)' }}>
          <span className="stat-card-title">Xếp hạng của bạn</span>
          <span className="stat-card-value">3 / #3442</span>
          <span className="stat-card-desc">Cố gắng giữ vững top 3 nhé!</span>
        </div>
        <div className="neo-card stat-card" style={{ borderLeft: '8px solid var(--color-secondary)' }}>
          <span className="stat-card-title">Từ vựng đã thuộc</span>
          <span className="stat-card-value">18%</span>
          <span className="stat-card-desc">216 / 1200 từ vựng cốt lõi</span>
        </div>
        <div className="neo-card stat-card" style={{ borderLeft: '8px solid var(--color-accent)' }}>
          <span className="stat-card-title">Đề thi đã luyện</span>
          <span className="stat-card-value">4 đề</span>
          <span className="stat-card-desc">Trung bình đạt: 72 điểm</span>
        </div>
        <div className="neo-card stat-card" style={{ borderLeft: '8px solid var(--color-blue)' }}>
          <span className="stat-card-title">Trình độ ước tính</span>
          <span className="stat-card-value">Band A2</span>
          <span className="stat-card-desc">Sắp sửa lên tới Band B1!</span>
        </div>
      </section>

      {/* Hero Section with Custom Taiwan/Taipei 101 content */}
      <section className="hero-section">
        <div className="neo-card hero-banner-card">
          <div className="neo-badge" style={{ backgroundColor: 'var(--color-primary)', color: 'white', marginBottom: '15px', width: 'fit-content' }}>
            Lộ trình Phồn Thể 🇹🇼
          </div>
          <h2 className="hero-banner-title">Học Tiếng Trung Đài Loan Hiệu Quả & Vui Vẻ!</h2>
          <p className="hero-banner-desc">
            Hệ thống bài học chuẩn khung năng lực TOCFL của Đài Loan. Tập trung sâu vào chữ viết Phồn thể thanh lịch, từ vựng đời sống Đài Loan (MRT, Chợ đêm, Trà sữa) cùng ngữ pháp ứng dụng cực dễ nhớ.
          </p>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button className="neo-btn neo-btn-primary" onClick={() => navigate('/vocab')}>Học từ vựng ngay</button>
            <button className="neo-btn" onClick={() => navigate('/exam')}>Luyện thi thử</button>
          </div>
        </div>

        {/* Taipei 101 image card */}
        <div className="neo-card taipei-showcase-card">
          <img src="/taipei101.png" alt="Taipei 101 Neo-brutalist Illustration" className="taipei-image" />
          <div className="taipei-caption">
            <div className="taipei-caption-text">
              <h4>Taipei 101 - Biểu tượng Đài Loan</h4>
              <p>Học chữ Phồn thể, mở khoá cuộc sống Đài Loan</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comments Board Section */}
      <section className="comments-section">
        <div className="comments-header">
          <h3 className="comments-title">
            💬 Góc Bình Luận & Chia Sẻ
            <span className="comments-count-badge">{commentsList.length}</span>
          </h3>
        </div>

        {user ? (
          <form onSubmit={handleSendComment} className="comment-input-area">
            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
              <div className="comment-avatar">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="comment-avatar-img" />
                ) : (
                  user.name ? user.name[0].toUpperCase() : 'U'
                )}
              </div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>
                  Đang bình luận dưới tên: <span style={{ color: 'var(--color-primary)' }}>{user.name}</span> ({user.email})
                </div>
                <textarea
                  className="comment-textarea"
                  placeholder="Chia sẻ ý kiến hoặc thắc mắc của bạn về lộ trình học..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="neo-btn neo-btn-primary"
                  style={{ padding: '8px 20px', fontSize: '13px' }}
                  disabled={submittingComment}
                >
                  {submittingComment ? 'Đang gửi...' : 'Gửi bình luận 🚀'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="login-to-comment-box" style={{ marginBottom: '30px' }}>
            🔒 Vui lòng đăng nhập để tham gia bình luận cùng mọi người!
          </div>
        )}

        <div className="comments-list">
          {commentsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#666', fontWeight: 'bold' }}>
              📭 Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ!
            </div>
          ) : (
            commentsList.map((c) => (
              <div key={c.id} className="comment-card">
                <div className="comment-avatar">
                  {c.user?.avatarUrl ? (
                    <img src={c.user.avatarUrl} alt={c.user.userName} className="comment-avatar-img" />
                  ) : (
                    c.user?.userName ? c.user.userName[0].toUpperCase() : '?'
                  )}
                </div>
                <div className="comment-content-wrapper">
                  <div className="comment-user-info">
                    <span className="comment-username">{c.user?.userName || 'Người ẩn danh'}</span>
                    <span className="comment-email">{c.user?.email}</span>
                    <span className="comment-time">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <div className="comment-text">
                    {c.content}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Daily Challenge Component */}
      <section className="neo-card daily-widget">
        <h3 className="daily-title">
          <span role="img" aria-label="word">💡</span> Từ vựng mỗi ngày (Phồn Thể)
        </h3>
        <div className="chinese-character-display">
          <div className="character-card">
            {dailyWord.word}
          </div>
          <div className="character-details">
            <div className="character-pinyin">
              {dailyWord.pinyin}
              <button
                className="audio-play-btn"
                style={{ display: 'inline-flex', marginLeft: '10px', verticalAlign: 'middle' }}
                onClick={() => playAudio(dailyWord.word)}
              >
                🔊
              </button>
            </div>
            <h4 className="character-meaning">Ý nghĩa: {dailyWord.meaning}</h4>
            <p className="character-example"><strong>Ví dụ:</strong> {dailyWord.exampleCn} ({dailyWord.exampleVn})</p>
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <button
                className="neo-btn neo-btn-primary"
                style={{ padding: '8px 16px', fontSize: '12px' }}
                onClick={handleWordLearned}
                disabled={dailyWord.learned}
              >
                {dailyWord.learned ? '✓ Đã lưu từ' : 'Đánh dấu đã học'}
              </button>
              <button
                className="neo-btn"
                style={{ padding: '8px 16px', fontSize: '12px' }}
                onClick={() => alert('Đang chuyển hướng tới phần viết chữ Hán...')}
              >
                Xem hướng dẫn tập viết
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
