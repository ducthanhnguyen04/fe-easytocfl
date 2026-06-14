import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { textbooks, bookLessons, grammarPoints } from '../../data/db';
import { getAIEvaluationFeedback } from '../../utils/feedback';
import './Grammar.css';

const Grammar = ({ playAudio }) => {
  const { bookId, lessonId, grammarPointId } = useParams();
  const navigate = useNavigate();

  const selectedGrammarBook = bookId ? parseInt(bookId) : null;
  const selectedGrammarLesson = lessonId ? parseInt(lessonId) : null;
  const selectedGrammarPointId = grammarPointId ? parseInt(grammarPointId) : null;

  const [grammarExerciseType, setGrammarExerciseType] = useState('zhToVi'); // 'zhToVi' or 'viToZh'
  const [grammarExercisesInput, setGrammarExercisesInput] = useState({});
  const [grammarExercisesFeedback, setGrammarExercisesFeedback] = useState({});

  // Reset exercises states when point changes
  useEffect(() => {
    setGrammarExercisesInput({});
    setGrammarExercisesFeedback({});
  }, [selectedGrammarPointId, grammarExerciseType]);

  return (
    <div>
      {/* Case 1: Select Textbook */}
      {selectedGrammarBook === null && (
        <div>
          <div className="page-title-banner">
            <div>
              <h2>Giáo trình Ngữ pháp</h2>
              <p>Chọn giáo trình thời đại để học cấu trúc ngữ pháp tương ứng</p>
            </div>
            <div className="neo-badge" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
              TOCFL Band A - C
            </div>
          </div>

          <div className="books-grid">
            {textbooks.map((book) => {
              const bookGrammarPoints = grammarPoints.filter(g => g.bookId === book.id);
              return (
                <div 
                  key={book.id} 
                  className="neo-card book-select-card"
                  onClick={() => {
                    navigate(`/grammar/${book.id}`);
                  }}
                >
                  <div className="book-cover" style={{ backgroundColor: book.color }}>
                    <span className="book-cover-title-traditional">當代中文</span>
                    <span className="book-cover-vol">{book.id}</span>
                  </div>
                  <div className="book-select-info">
                    <h4 className="book-select-title">{book.viTitle}</h4>
                    <span className="book-select-level">{book.level}</span>
                    <p className="book-select-desc">{book.desc}</p>
                    <div className="book-select-stats">
                      <span>📖 {book.lessons}</span>
                      <span>🔓 {book.status}</span>
                      <span style={{ color: 'var(--color-primary)' }}>💡 {bookGrammarPoints.length} cấu trúc</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Case 2: Select Lesson */}
      {selectedGrammarBook !== null && selectedGrammarLesson === null && (() => {
        const currentBook = textbooks.find(b => b.id === selectedGrammarBook);
        const lessons = bookLessons[selectedGrammarBook] || [];
        const totalLessons = lessons.length;
        return (
          <div>
            <div className="back-btn-container">
              <button className="neo-btn" onClick={() => navigate('/grammar')}>
                ← Danh sách sách
              </button>
            </div>

            <div className="page-title-banner" style={{ borderLeft: `10px solid ${currentBook?.color || '#000'}` }}>
              <div>
                <h2>{currentBook?.viTitle} ({currentBook?.title})</h2>
                <p>{currentBook?.level} — {totalLessons} bài học chính thức</p>
              </div>
            </div>

            <div className="lessons-grid">
              {lessons.map((lesson) => {
                const lessonGrammarPoints = grammarPoints.filter(g => g.bookId === selectedGrammarBook && g.lessonId === lesson.id);
                return (
                  <div 
                    key={lesson.id} 
                    className="neo-card lesson-select-card"
                    onClick={() => {
                      navigate(`/grammar/${selectedGrammarBook}/${lesson.id}`);
                    }}
                  >
                    <div className="lesson-number-box" style={{ backgroundColor: currentBook?.color || '#000' }}>
                      {lesson.id}
                    </div>
                    <div className="lesson-select-info">
                      <h4 className="lesson-select-title">
                        {lesson.title} {lesson.premium && <span className="premium-badge">👑 Premium</span>}
                      </h4>
                      <span className="lesson-select-translation">{lesson.trans}</span>
                      <div className="lesson-select-meta">
                        <span>📖 {lessonGrammarPoints.length} cấu trúc ngữ pháp</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Case 3: Select Grammar Point */}
      {selectedGrammarBook !== null && selectedGrammarLesson !== null && selectedGrammarPointId === null && (() => {
        const currentBook = textbooks.find(b => b.id === selectedGrammarBook);
        const lessonList = bookLessons[selectedGrammarBook] || [];
        const currentLesson = lessonList.find(l => l.id === selectedGrammarLesson);
        const lessonGrammarPoints = grammarPoints.filter(g => g.bookId === selectedGrammarBook && g.lessonId === selectedGrammarLesson);
        
        return (
          <div>
            <div style={{ marginBottom: '15px' }}>
              <button 
                className="neo-btn" 
                onClick={() => navigate(`/grammar/${selectedGrammarBook}`)}
              >
                ← Danh sách bài học
              </button>
            </div>

            <div className="page-title-banner" style={{ borderLeft: `8px solid ${currentBook?.color || '#000'}` }}>
              <div>
                <h2>{currentLesson?.title}</h2>
                <p>{currentLesson?.trans} • Ngữ pháp cốt lõi</p>
              </div>
              <div className="neo-badge" style={{ backgroundColor: currentBook?.color || '#000', color: 'white' }}>
                {lessonGrammarPoints.length} cấu trúc
              </div>
            </div>

            {lessonGrammarPoints.length === 0 ? (
              <div className="neo-card" style={{ padding: '30px', textAlign: 'center', fontWeight: 'bold' }}>
                Bài học này đang được cập nhật thêm ngữ pháp mẫu. Vui lòng chọn bài học khác!
              </div>
            ) : (
              <div className="grammar-container">
                {lessonGrammarPoints.map((gp) => (
                  <div 
                    key={gp.id} 
                    className="neo-card grammar-card" 
                    style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                    onClick={() => {
                      navigate(`/grammar/${selectedGrammarBook}/${selectedGrammarLesson}/${gp.id}`);
                    }}
                  >
                    <div className="grammar-header">
                      <span className="grammar-structure">{gp.title}</span>
                      <span className="neo-badge" style={{ backgroundColor: currentBook?.color || '#000', color: 'white' }}>
                        {currentBook?.level.split(' • ')[1]}
                      </span>
                    </div>
                    <h4 className="grammar-title">Công thức: {gp.pattern}</h4>
                    <p className="grammar-desc">{gp.definition.slice(0, 150)}...</p>
                    <div style={{ textAlign: 'right', fontWeight: '800', color: 'var(--color-primary)' }}>
                      Xem chi tiết & luyện tập →
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Case 4: Grammar Detail View */}
      {selectedGrammarBook !== null && selectedGrammarLesson !== null && selectedGrammarPointId !== null && (() => {
        const lessonGrammarPoints = grammarPoints.filter(g => g.bookId === selectedGrammarBook && g.lessonId === selectedGrammarLesson);
        const gp = lessonGrammarPoints.find(g => g.id === selectedGrammarPointId);
        
        if (!gp) {
          return (
            <div className="neo-card" style={{ padding: '30px', textAlign: 'center', fontWeight: 'bold' }}>
              Không tìm thấy cấu trúc ngữ pháp này.
              <button className="neo-btn" style={{ marginLeft: '10px' }} onClick={() => navigate(`/grammar/${selectedGrammarBook}/${selectedGrammarLesson}`)}>Quay lại</button>
            </div>
          );
        }

        const currentBook = textbooks.find(b => b.id === selectedGrammarBook);
        const modelIdx = lessonGrammarPoints.findIndex(g => g.id === gp.id) + 1;

        return (
          <div style={{ paddingBottom: '40px' }}>
            {/* Back button */}
            <div style={{ marginBottom: '15px' }}>
              <button 
                className="neo-btn" 
                onClick={() => navigate(`/grammar/${selectedGrammarBook}/${selectedGrammarLesson}`)}
              >
                ← Quay lại danh sách cấu trúc
              </button>
            </div>

            {/* Header Row */}
            <div style={{ background: '#f5f5f5', border: '3px solid #000', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '25px', boxShadow: '5px 5px 0px #000' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span className="neo-badge" style={{ backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: '800' }}>
                  Bài {selectedGrammarLesson} - Mẫu {modelIdx}
                </span>
                <span style={{ fontSize: '18px' }}>🇹🇼</span>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#555' }}>TOCFL {currentBook?.level.split(' • ')[1]}</span>
              </div>
              <h1 style={{ fontSize: '42px', fontWeight: '900', margin: '10px 0', fontFamily: 'Sora, sans-serif' }}>
                {gp.structure}
              </h1>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#333' }}>
                Mẫu câu: <code style={{ background: '#e0e0e0', padding: '2px 6px', borderRadius: '4px' }}>{gp.pattern}</code>
              </div>
            </div>

            {/* 4 Cards Grid */}
            <div className="grammar-info-grid">
              {/* Card 1: Cấu trúc */}
              <div className="grammar-info-card" style={{ borderLeft: '10px solid #673ab7' }}>
                <div className="card-badge" style={{ backgroundColor: '#f3e5f5', color: '#673ab7', borderColor: '#673ab7' }}>
                  ⚡ Cấu trúc
                </div>
                <div className="card-content" style={{ fontWeight: '800', fontSize: '16px' }}>
                  {gp.pattern}
                </div>
              </div>

              {/* Card 2: Định nghĩa */}
              <div className="grammar-info-card" style={{ borderLeft: '10px solid #2196f3' }}>
                <div className="card-badge" style={{ backgroundColor: '#e3f2fd', color: '#2196f3', borderColor: '#2196f3' }}>
                  📝 Định nghĩa
                </div>
                <div className="card-content">
                  {gp.definition}
                </div>
              </div>

              {/* Card 3: Phạm vi sử dụng */}
              <div className="grammar-info-card" style={{ borderLeft: '10px solid #4caf50' }}>
                <div className="card-badge" style={{ backgroundColor: '#e8f5e9', color: '#4caf50', borderColor: '#4caf50' }}>
                  🌐 Phạm vi sử dụng
                </div>
                <div className="card-content">
                  {gp.scope}
                </div>
              </div>

              {/* Card 4: Ghi chú */}
              <div className="grammar-info-card" style={{ borderLeft: '10px solid #ffc107' }}>
                <div className="card-badge" style={{ backgroundColor: '#fffde7', color: '#f57f17', borderColor: '#ffc107' }}>
                  ⚠️ Ghi chú
                </div>
                <div className="card-content">
                  {gp.note}
                </div>
              </div>
            </div>

            {/* Examples Section */}
            <div style={{ marginBottom: '35px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                💬 Ví dụ minh họa
              </h2>
              <div>
                {gp.examples.map((ex, idx) => (
                  <div key={ex.id} className="grammar-example-item">
                    <div className="grammar-example-text">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: '#000', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800' }}>
                          {idx + 1}
                        </span>
                        <span className="grammar-example-cn">{ex.cn}</span>
                      </div>
                      <div className="grammar-example-vn" style={{ marginLeft: '30px' }}>
                        → {ex.vn}
                      </div>
                    </div>
                    <button 
                      className="grammar-audio-btn" 
                      onClick={() => playAudio(ex.cn)}
                      title="Nghe phát âm"
                    >
                      🔊
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Exercises Section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>
                  ✏️ Bài tập luyện tập
                </h2>
                {/* Exercise direction toggle */}
                <div className="neo-btn-group">
                  <button 
                    className={`neo-btn ${grammarExerciseType === 'zhToVi' ? 'active' : ''}`}
                    onClick={() => setGrammarExerciseType('zhToVi')}
                    style={{ padding: '6px 12px', fontSize: '13px' }}
                  >
                    Trung → Việt
                  </button>
                  <button 
                    className={`neo-btn ${grammarExerciseType === 'viToZh' ? 'active' : ''}`}
                    onClick={() => setGrammarExerciseType('viToZh')}
                    style={{ padding: '6px 12px', fontSize: '13px' }}
                  >
                    Việt → Trung
                  </button>
                </div>
              </div>

              <div style={{ background: '#eef2f3', border: '3px solid #000', padding: '15px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontWeight: '700', fontSize: '13px' }}>
                {grammarExerciseType === 'zhToVi' 
                  ? 'Đọc câu tiếng Trung Phồn thể dưới đây, gõ bản dịch tiếng Việt tương ứng vào ô. Bấm "Kiểm tra" hoặc "AI đánh giá" để nhận phản hồi.'
                  : 'Đọc câu tiếng Việt dưới đây, gõ câu dịch tiếng Trung Phồn thể tương ứng vào ô. Bấm "Kiểm tra" hoặc "AI đánh giá" để nhận phản hồi.'
                }
              </div>

              {gp.exercises.map((exe, idx) => {
                const userVal = grammarExercisesInput[exe.id] || '';
                const feedback = grammarExercisesFeedback[exe.id] || '';
                const questionText = grammarExerciseType === 'zhToVi' ? exe.cn : exe.vn;
                const solutionText = grammarExerciseType === 'zhToVi' ? exe.vn : exe.cn;

                return (
                  <div key={exe.id} className="grammar-exercise-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="grammar-exercise-qn" style={{ margin: 0 }}>
                        <span style={{ background: 'var(--color-primary)', color: '#fff', padding: '2px 8px', borderRadius: '4px', marginRight: '8px', fontSize: '13px' }}>
                          Câu {idx + 1}
                        </span>
                        {questionText}
                      </div>
                      {grammarExerciseType === 'zhToVi' && (
                        <button 
                          className="grammar-audio-btn" 
                          style={{ width: '32px', height: '32px', fontSize: '12px' }}
                          onClick={() => playAudio(exe.cn)}
                        >
                          🔊
                        </button>
                      )}
                    </div>

                    <div className="grammar-exercise-input-row">
                      <textarea
                        className="grammar-exercise-textarea"
                        rows={2}
                        placeholder={grammarExerciseType === 'zhToVi' ? 'Gõ bản dịch tiếng Việt ở đây...' : 'Gõ câu dịch tiếng Trung Phồn thể ở đây...'}
                        value={userVal}
                        onChange={(e) => {
                          setGrammarExercisesInput(prev => ({ ...prev, [exe.id]: e.target.value }));
                        }}
                      />
                      
                      <div className="grammar-exercise-actions">
                        <button 
                          className="neo-btn" 
                          style={{ padding: '8px 16px', fontSize: '13px' }}
                          onClick={() => {
                            setGrammarExercisesFeedback(prev => ({
                              ...prev,
                              [exe.id]: `💡 **Đáp án tham khảo**: "${solutionText}"`
                            }));
                          }}
                        >
                          👁️ Kiểm tra
                        </button>
                        
                        <button 
                          className="neo-btn neo-btn-primary" 
                          style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: 'var(--color-accent)' }}
                          onClick={() => {
                            const aiFeedback = getAIEvaluationFeedback(userVal, exe.cn, exe.vn, grammarExerciseType);
                            setGrammarExercisesFeedback(prev => ({
                              ...prev,
                              [exe.id]: aiFeedback
                            }));
                          }}
                        >
                          🤖 AI đánh giá
                        </button>
                      </div>
                    </div>

                    {feedback && (
                      <div 
                        className="grammar-exercise-feedback"
                        style={{ 
                          backgroundColor: feedback.includes('(10/10)') || feedback.includes('(9/10)') || feedback.includes('(7/10)')
                            ? '#e8f5e9' 
                            : feedback.startsWith('💡') 
                              ? '#e3f2fd' 
                              : '#fff8e1',
                          borderLeft: feedback.includes('(10/10)') || feedback.includes('(9/10)') || feedback.includes('(7/10)')
                            ? '5px solid #4caf50'
                            : feedback.startsWith('💡')
                              ? '5px solid #2196f3'
                              : '5px solid #ffb300'
                        }}
                      >
                        <div style={{ whiteSpace: 'pre-line', fontWeight: '600' }}>
                          {feedback}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Grammar;
