import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import axios from 'axios';
import beUrl from '../../api-url/api-backend';
import './Home.css';
import { showToast } from '../../utils/toast';
import { cacheService } from '../../utils/cacheService';

const Home = ({ dailyWord, handleWordLearned, playAudio }) => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [levels, setLevels] = useState([]);
  const [levelsLoading, setLevelsLoading] = useState(false);
  const [commentsList, setCommentsList] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchLevels = async () => {
      setLevelsLoading(true);
      try {
        let data = cacheService.get('levels_all');
        if (!data) {
          const response = await axios.get(`${beUrl}/levels/get-all`);
          data = response.data.levels || [];
          cacheService.set('levels_all', data);
        }
        const sorted = [...data].sort((a, b) => Number(a.id) - Number(b.id));
        setLevels(sorted);
      } catch (err) {
        console.error("Error fetching levels in Home page:", err);
        setLevels([]);
      } finally {
        setLevelsLoading(false);
      }
    };
    fetchLevels();
  }, []);

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
      showToast("Không thể gửi bình luận. Vui lòng thử lại!", "error");
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
      </header>

      {/* Stats Dashboard Row */}
      {/* <section className="stats-grid">
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
      </section> */}

      {/* Textbook Levels Section */}
      <section className="section-container">
        <div className="section-header-container">
          <h3 className="section-title">📚 Danh sách giáo trình học Phồn thể</h3>
        </div>

        {levelsLoading ? (
          <div className="neo-card" style={{ padding: '30px', textAlign: 'center', fontWeight: 'bold' }}>
            🔄 Đang tải danh sách giáo trình...
          </div>
        ) : (
          <div className="books-grid-cover">
            {levels.map((book) => (
              <div
                key={book.id}
                className="book-cover-item-card"
                onClick={() => {
                  navigate(`/vocab/${book.slug || book.id}`);
                }}
              >
                <div className="book-cover-img-wrapper">
                  <img src={book.image} alt={book.levelName || book.title} className="book-cover-full-img" />
                </div>
                <h4 className="book-cover-item-title">{book.levelName || book.title}</h4>
              </div>
            ))}
          </div>
        )}
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
                  <img src={user.avatarUrl} alt="Avatar" referrerPolicy="no-referrer" className="comment-avatar-img" />
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
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-black)', opacity: 0.6, fontWeight: 'bold' }}>
              📭 Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ!
            </div>
          ) : (
            commentsList.map((c) => (
              <div key={c.id} className="comment-card">
                <div className="comment-avatar">
                  {c.user?.avatarUrl ? (
                    <img src={c.user.avatarUrl} alt={c.user.userName} referrerPolicy="no-referrer" className="comment-avatar-img" />
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
    </div>
  );
};

export default Home;
