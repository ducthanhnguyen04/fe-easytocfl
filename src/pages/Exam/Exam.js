import React from 'react';
import './Exam.css';

const Exam = () => {
  return (
    <div>
      <div className="page-title-banner">
        <div>
          <h2>Luyện Thi Thử TOCFL</h2>
          <p>Thực hành làm đề thi thử nghiệm để chuẩn bị tốt nhất cho kỳ thi chính thức</p>
        </div>
      </div>

      <div className="neo-card" style={{ padding: '60px 40px', textAlign: 'center', marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '64px', marginBottom: '20px', display: 'block' }}>🚧</span>
        <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '15px', color: 'var(--color-primary)' }}>Tính năng đang được phát triển</h3>
        <p style={{ fontSize: '16px', color: '#555', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          Đội ngũ Easy TOCFL đang nỗ lực xây dựng kho đề thi thử đa dạng, bám sát cấu trúc đề thi chính thức với đầy đủ 2 kỹ năng Nghe và Đọc. Tính năng này sẽ sớm ra mắt trong các phiên bản cập nhật tiếp theo!
        </p>
      </div>
    </div>
  );
};

export default Exam;
