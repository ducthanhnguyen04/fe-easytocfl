import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Roadmap.css';

const Roadmap = ({ startQuiz }) => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="page-title-banner">
        <div>
          <h2>Lộ Trình Học Chi Tiết</h2>
          <p>Khung chương trình thiết kế riêng cho kỳ thi TOCFL & giao tiếp tại Đài Loan</p>
        </div>
        <div className="neo-badge" style={{ backgroundColor: 'var(--color-secondary)', color: 'white' }}>
          Chuẩn khung SC-TOP
        </div>
      </div>

      <div className="roadmap-container">
        <div className="neo-card roadmap-card" style={{ borderLeft: '10px solid var(--color-secondary)' }}>
          <div className="roadmap-header">
            <span className="roadmap-stage-title">Giai đoạn 1: Band A (A1 - Nhập môn & A2 - Sơ cấp)</span>
            <span className="neo-badge" style={{ backgroundColor: 'var(--color-secondary-light)' }}>Đã hoàn thành 80%</span>
          </div>
          <p className="roadmap-desc">
            Tập trung vào phát âm chuẩn (chú âm bopomofo hoặc pinyin), học cách viết 500 chữ Phồn thể cơ bản nhất. Đạt khả năng hỏi đường, gọi trà sữa ít đường ít đá, mua sắm đồ đạc tại 7-Eleven và FamilyMart của Đài Loan.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="neo-btn neo-btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={() => navigate('/vocab')}>Học tiếp bài 12</button>
            <button className="neo-btn" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={() => startQuiz('bandA')}>Luyện đề Band A</button>
          </div>
        </div>

        <div className="neo-card roadmap-card" style={{ borderLeft: '10px solid var(--color-accent)' }}>
          <div className="roadmap-header">
            <span className="roadmap-stage-title">Giai đoạn 2: Band B (B1 - Trung cấp & B2 - Bán cao cấp)</span>
            <span className="neo-badge" style={{ backgroundColor: 'var(--color-accent-light)' }}>Chưa kích hoạt</span>
          </div>
          <p className="roadmap-desc">
            Lượng từ vựng nâng lên 1200 từ. Làm quen với các cấu trúc nói gián tiếp, đọc tin tức Đài Loan trên các trang mạng xã hội, giao lưu kết bạn, làm các thủ tục hành chính khi du học/làm việc tại Đài Loan.
          </p>
          <button className="neo-btn" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={() => startQuiz('bandB')}>Làm đề khảo sát đầu vào</button>
        </div>

        <div className="neo-card roadmap-card" style={{ borderLeft: '10px solid var(--color-blue)' }}>
          <div className="roadmap-header">
            <span className="roadmap-stage-title">Giai đoạn 3: Band C (C1 - Cao cấp & C2 - Lưu loát)</span>
            <span className="neo-badge" style={{ backgroundColor: 'var(--color-blue-light)' }}>Chưa kích hoạt</span>
          </div>
          <p className="roadmap-desc">
            Học các thuật ngữ chuyên ngành kinh tế, kỹ thuật, văn hoá xã hội Đài Loan. Viết báo cáo, làm việc chuyên nghiệp tại các tập đoàn công nghệ lớn của Đài Loan (TSMC, Foxconn...) hoặc du học hệ đại học/cao học.
          </p>
          <button className="neo-btn" style={{ padding: '8px 16px', fontSize: '12px', opacity: 0.7 }} disabled>Chưa mở khoá</button>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
