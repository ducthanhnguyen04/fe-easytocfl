import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import './Home.css';

const Home = ({ dailyWord, handleWordLearned, playAudio }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  console.log("user:", user);

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
          <h1 className="welcome-title">Chào, {user?.name || 'bạn'} 👋</h1>
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

      {/* Course Band Selection Cards */}
      <section className="section-container">
        <div className="section-header-container">
          <h3 className="section-title">Lộ trình học theo trình độ</h3>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-primary)', cursor: 'pointer' }} onClick={() => navigate('/roadmap')}>
            Xem tất cả →
          </span>
        </div>
        <div className="course-grid">

          {/* Course 1 */}
          <div className="neo-card course-card" style={{ borderTop: '10px solid var(--color-secondary)' }}>
            <div className="course-header">
              <span className="course-tag">Mới học</span>
              <span className="course-band" style={{ color: 'var(--color-secondary)' }}>Band A</span>
            </div>
            <div>
              <h4 className="course-name">TOCFL Sơ Cấp (A1 & A2)</h4>
              <p className="course-desc">Nền tảng phát âm bồi, bộ chữ cơ bản, giao tiếp hàng ngày ở mức cơ bản, mua sắm và đi tàu MRT.</p>
            </div>
            <div className="course-footer">
              <span className="course-stats">50 bài học • 500 Từ</span>
              <button className="neo-btn neo-btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={() => navigate('/vocab')}>Vào học</button>
            </div>
          </div>

          {/* Course 2 */}
          <div className="neo-card course-card" style={{ borderTop: '10px solid var(--color-accent)' }}>
            <div className="course-header">
              <span className="course-tag">Khá tốt</span>
              <span className="course-band" style={{ color: 'var(--color-accent)' }}>Band B</span>
            </div>
            <div>
              <h4 className="course-name">TOCFL Trung Cấp (B1 & B2)</h4>
              <p className="course-desc">Diễn đạt ý kiến cá nhân, thuyết trình cơ bản, đọc hiểu tin tức xã hội Đài Loan, làm quen văn hoá sâu hơn.</p>
            </div>
            <div className="course-footer">
              <span className="course-stats">80 bài học • 1200 Từ</span>
              <button className="neo-btn neo-btn-primary" style={{ padding: '8px 16px', fontSize: '12px', backgroundColor: 'var(--color-accent)' }} onClick={() => navigate('/vocab')}>Vào học</button>
            </div>
          </div>

          {/* Course 3 */}
          <div className="neo-card course-card" style={{ borderTop: '10px solid var(--color-blue)' }}>
            <div className="course-header">
              <span className="course-tag">Cao cấp</span>
              <span className="course-band" style={{ color: 'var(--color-blue)' }}>Band C</span>
            </div>
            <div>
              <h4 className="course-name">TOCFL Cao Cấp (C1 & C2)</h4>
              <p className="course-desc">Sử dụng tiếng Trung nhuần nhuyễn trong nghiên cứu học thuật, dịch thuật, công việc văn phòng chuyên nghiệp tại Đài Loan.</p>
            </div>
            <div className="course-footer">
              <span className="course-stats">100 bài học • 2500 Từ</span>
              <button className="neo-btn neo-btn-primary" style={{ padding: '8px 16px', fontSize: '12px', backgroundColor: 'var(--color-blue)' }} onClick={() => navigate('/vocab')}>Vào học</button>
            </div>
          </div>

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
