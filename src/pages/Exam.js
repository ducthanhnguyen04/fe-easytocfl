import React from 'react';
import Icon from '../components/Icon';
import './Exam.css';

const Exam = ({ startQuiz }) => {
  return (
    <div>
      <div className="page-title-banner">
        <div>
          <h2>Luyện Thi Thử TOCFL</h2>
          <p>Thực hành làm đề thi thử nghiệm để chuẩn bị tốt nhất cho kỳ thi chính thức</p>
        </div>
        <div className="neo-badge" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
          Đầy đủ Kỹ năng Nghe & Đọc
        </div>
      </div>

      <div className="exam-grid">
        
        <div className="neo-card exam-card">
          <div>
            <h4 className="exam-title">TOCFL Band A - Đề thi Đọc hiểu số 01</h4>
            <div className="exam-details">
              <span className="exam-detail-item">
                <Icon name="book-open" style={{ width: '14px', stroke: '#666', strokeWidth: '3' }} /> 3 Cụm Câu hỏi
              </span>
              <span className="exam-detail-item">
                <Icon name="clock" style={{ width: '14px', stroke: '#666', strokeWidth: '3' }} /> 10 phút
              </span>
              <span className="exam-detail-item">
                <Icon name="award" style={{ width: '14px', stroke: '#666', strokeWidth: '3' }} /> Band A (A1/A2)
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>Đề thi trắc nghiệm bao gồm chữ Phồn thể cơ bản, kiểm tra từ vựng sinh hoạt Đài Loan và các ngữ pháp căn bản.</p>
          </div>
          <button className="neo-btn neo-btn-primary" onClick={() => startQuiz('bandA')}>Bắt đầu làm đề</button>
        </div>

        <div className="neo-card exam-card">
          <div>
            <h4 className="exam-title">TOCFL Band B - Đề thi Đọc hiểu thử nghiệm</h4>
            <div className="exam-details">
              <span className="exam-detail-item">
                <Icon name="book-open" style={{ width: '14px', stroke: '#666', strokeWidth: '3' }} /> 2 Cụm Câu hỏi
              </span>
              <span className="exam-detail-item">
                <Icon name="clock" style={{ width: '14px', stroke: '#666', strokeWidth: '3' }} /> 15 phút
              </span>
              <span className="exam-detail-item">
                <Icon name="award" style={{ width: '14px', stroke: '#666', strokeWidth: '3' }} /> Band B (B1/B2)
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>Độ khó trung cấp. Kiểm tra từ vựng phức hợp, liên từ và khả năng đọc hiểu các thông báo biển hiệu thực tế của Đài Loan.</p>
          </div>
          <button className="neo-btn neo-btn-primary" style={{ backgroundColor: 'var(--color-accent)' }} onClick={() => startQuiz('bandB')}>Bắt đầu làm đề</button>
        </div>

      </div>
    </div>
  );
};

export default Exam;
