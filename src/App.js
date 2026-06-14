import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AppRoutes from './routes/AppRoutes';
import { initialVocabWords, quizzes } from './data/db';
import './App.css';

function App() {
  const [vocabWords, setVocabWords] = useState(initialVocabWords);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'terracotta';
    document.body.className = '';
    document.body.classList.add(`theme-${savedTheme}`);
  }, []);

  // Daily Challenge state
  const [dailyWord, setDailyWord] = useState({
    word: '學',
    pinyin: 'xué',
    meaning: 'Học, học tập, nghiên cứu',
    exampleCn: '我正在學習繁體中文。',
    exampleVn: 'Tôi đang học tiếng Trung Phồn thể.',
    learned: false
  });

  // Practice Exam Modal state
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const playAudio = (text) => {
    alert(`🔊 Đang phát âm thanh mô phỏng cho: "${text}"`);
  };

  const toggleVocabLearned = (index) => {
    const updated = [...vocabWords];
    updated[index].learned = !updated[index].learned;
    setVocabWords(updated);
  };

  const handleWordLearned = () => {
    setDailyWord({ ...dailyWord, learned: true });
    alert('🎉 Tuyệt vời! Bạn đã thêm chữ "' + dailyWord.word + '" vào kho từ vựng.');
  };

  const handleAnswerSelect = (qId, optionIdx) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [qId]: optionIdx
    });
  };

  const submitQuiz = () => {
    setQuizSubmitted(true);
  };

  const startQuiz = (key) => {
    setActiveQuiz(quizzes[key]);
    setSelectedAnswers({});
    setQuizSubmitted(false);
  };

  const resetVocabProgress = () => {
    setVocabWords(vocabWords.map(v => ({ ...v, learned: false })));
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Sidebar Section */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="main-panel">
          <AppRoutes 
            dailyWord={dailyWord}
            handleWordLearned={handleWordLearned}
            playAudio={playAudio}
            startQuiz={startQuiz}
            vocabWords={vocabWords}
            toggleVocabLearned={toggleVocabLearned}
            resetVocabProgress={resetVocabProgress}
          />
        </main>

        {/* Interactive Practice Exam Quiz Modal */}
        {activeQuiz && (
          <div className="quiz-overlay">
            <div className="neo-card quiz-modal">
              <div className="quiz-header">
                <h3>{activeQuiz.title}</h3>
                <button className="quiz-close-btn" onClick={() => setActiveQuiz(null)}>×</button>
              </div>

              {!quizSubmitted ? (
                <div>
                  {activeQuiz.questions.map((question, qIdx) => (
                    <div key={question.id} style={{ marginBottom: '25px' }}>
                      <p className="quiz-question">{qIdx + 1}. {question.q}</p>
                      <div className="quiz-options">
                        {question.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            className={`quiz-option-btn ${selectedAnswers[question.id] === oIdx ? 'selected' : ''}`}
                            onClick={() => handleAnswerSelect(question.id, oIdx)}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    className="neo-btn neo-btn-primary" 
                    style={{ width: '100%', marginTop: '10px' }}
                    onClick={submitQuiz}
                    disabled={Object.keys(selectedAnswers).length < activeQuiz.questions.length}
                  >
                    Nộp bài thi thử
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <span style={{ fontSize: '50px' }} role="img" aria-label="party">🎉</span>
                  <h3 style={{ margin: '15px 0 10px 0' }}>Hoàn thành bài thi!</h3>
                  
                  <div style={{ margin: '20px 0', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {activeQuiz.questions.map((question, qIdx) => {
                      const isCorrect = selectedAnswers[question.id] === question.correct;
                      return (
                        <div key={question.id} className="neo-card" style={{ padding: '15px', borderColor: isCorrect ? 'var(--color-secondary)' : 'var(--color-primary)' }}>
                          <p style={{ fontWeight: '700', fontSize: '14px', marginBottom: '8px' }}>
                            Câu {qIdx + 1}: {question.q}
                          </p>
                          <p style={{ fontSize: '13px' }}>
                            Đáp án của bạn: <span style={{ fontWeight: '700' }}>{question.options[selectedAnswers[question.id]]}</span>
                          </p>
                          {isCorrect ? (
                            <p className="quiz-result-success">✓ Đúng rồi!</p>
                          ) : (
                            <div>
                              <p className="quiz-result-error">✗ Chưa chính xác!</p>
                              <p style={{ fontSize: '13px', color: '#555' }}>
                                Đáp án đúng: <span style={{ fontWeight: '700', color: 'var(--color-secondary)' }}>{question.options[question.correct]}</span>
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
                    <button 
                      className="neo-btn" 
                      style={{ flex: 1 }}
                      onClick={() => {
                        setSelectedAnswers({});
                        setQuizSubmitted(false);
                      }}
                    >
                      Làm lại
                    </button>
                    <button 
                      className="neo-btn neo-btn-primary" 
                      style={{ flex: 1 }}
                      onClick={() => setActiveQuiz(null)}
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
