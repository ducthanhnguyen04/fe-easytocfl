import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import beUrl from '../../../api-url/api-backend';
import { showToast } from '../../../utils/toast';

const QuizMode = ({
  currentLessonWords,
  vocabWords,
}) => {
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState(null);
  const [quizChecked, setQuizChecked] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
  const [quizOptions, setQuizOptions] = useState([]);
  
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [xpEarned, setXpEarned] = useState(null);
  const startTimeRef = useRef(Date.now());

  // Generate quiz options on quizIndex change
  useEffect(() => {
    if (currentLessonWords.length > 0 && quizIndex < currentLessonWords.length) {
      const correctWord = currentLessonWords[quizIndex % currentLessonWords.length];
      const correctOption = correctWord.trans;
      const dbTranslations = vocabWords
        .filter(w => w.word !== correctWord.word && w.trans && w.trans !== correctWord.trans)
        .map(w => w.trans);
      let pool = dbTranslations;
      if (pool.length < 3) {
        const fallbacks = ['Chào buổi sáng', 'Tạm biệt', 'Thành phố Đài Bắc', 'Ăn cơm', 'Uống trà', 'Vé tàu cao tốc', 'Trà Ô Long', 'Trực tiếp'];
        pool = Array.from(new Set([...dbTranslations, ...fallbacks]));
      }
      const shuffledPool = pool.sort(() => 0.5 - Math.random()).slice(0, 3);
      const options = [correctOption, ...shuffledPool].sort(() => 0.5 - Math.random());
      setQuizOptions(options);
      setQuizSelectedOption(null);
      setQuizChecked(false);
    }
  }, [quizIndex, currentLessonWords, vocabWords]);

  const handleQuizChoice = (idx) => {
    if (quizChecked) return;
    setQuizSelectedOption(idx);
    setQuizChecked(true);
    const correctWord = currentLessonWords[quizIndex % currentLessonWords.length];
    if (correctWord) {
      const isCorrect = quizOptions[idx] === correctWord.trans;
      setQuizScore(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1
      }));

      // Record answer for backend verification
      setQuizAnswers(prev => [...prev, {
        vocabId: correctWord.id,
        chosenTranslation: quizOptions[idx]
      }]);
    }
  };

  // Keyboard navigation effect
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentLessonWords.length === 0) return;

      if (['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const idx = parseInt(e.key) - 1;
        if (idx < quizOptions.length && !quizChecked) {
          handleQuizChoice(idx);
        }
      } else if ((e.key === ' ' || e.code === 'Space') && quizChecked) {
        e.preventDefault();
        setQuizIndex(prev => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizIndex, quizChecked, quizOptions, currentLessonWords]);

  const isCompleted = quizIndex >= currentLessonWords.length;

  useEffect(() => {
    if (isCompleted && !hasSubmitted && quizAnswers.length > 0) {
      setHasSubmitted(true);
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      
      axios.post(`${beUrl}/score/quiz`, {
        lessonId: currentLessonWords[0]?.lessonId,
        answers: quizAnswers,
        timeSpent: timeSpent
      }, { withCredentials: true })
      .then(res => {
        const points = res.data.data.pointsEarned;
        setXpEarned(points);
        showToast(`🎉 Chúc mừng! Bạn được cộng +${points} XP điểm học tập!`, 'success');
      })
      .catch(err => {
        console.error("Gửi điểm thất bại:", err);
        showToast(err.response?.data?.message || 'Không thể cộng điểm quiz.', 'error');
      });
    }
  }, [isCompleted, hasSubmitted, quizAnswers, currentLessonWords]);

  if (isCompleted) {
    const correctCount = quizScore.correct;
    const totalCount = currentLessonWords.length;
    const incorrectCount = totalCount - correctCount;
    const scorePercent = Math.round((correctCount / totalCount) * 100);

    return (
      <div className="learning-workspace">
        <div className="workspace-card quiz-green" style={{ minHeight: '300px' }}>
          <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '15px' }}>🎉 Hoàn thành Trắc nghiệm!</div>
          
          {xpEarned !== null && (
            <div className="neo-badge" style={{ backgroundColor: 'var(--color-primary)', color: 'white', fontSize: '14px', padding: '6px 14px', marginBottom: '15px', display: 'inline-block' }}>
              🔥 XP Nhận Được: +{xpEarned}
            </div>
          )}

          <div style={{ display: 'flex', gap: '25px', margin: '20px 0', fontSize: '16px', fontWeight: '800', justifyContent: 'center' }}>
            <div style={{ color: 'var(--color-secondary)' }}>✓ Đúng: {correctCount} câu</div>
            <div style={{ color: 'var(--color-primary)' }}>✗ Sai: {incorrectCount} câu</div>
            <div>⭐ Tỉ lệ: {scorePercent}%</div>
          </div>
          <p style={{ fontSize: '14px', color: '#555', maxWidth: '400px', margin: '0 auto 20px', lineHeight: '1.5' }}>
            {scorePercent >= 80
              ? "Tuyệt vời! Bạn đã nắm rất vững từ vựng của bài học này."
              : "Khá tốt, hãy luyện tập thêm để ghi nhớ tốt hơn nữa nhé!"}
          </p>
          <button
            className="neo-btn neo-btn-primary"
            style={{ padding: '10px 20px', fontWeight: '800' }}
            onClick={() => {
              setQuizIndex(0);
              setQuizScore({ correct: 0, total: 0 });
              setQuizAnswers([]);
              setHasSubmitted(false);
              setXpEarned(null);
              startTimeRef.current = Date.now();
            }}
          >
            🔄 Làm lại trắc nghiệm
          </button>
        </div>
      </div>
    );
  }

  const activeQuizWord = currentLessonWords[quizIndex % currentLessonWords.length];

  return (
    <div className="learning-workspace">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div style={{ fontWeight: '800', fontSize: '13px' }}>
          Trắc nghiệm từ vựng
        </div>
        <div style={{ fontSize: '14px', fontWeight: '800' }}>
          {(quizIndex % currentLessonWords.length) + 1} / {currentLessonWords.length}
        </div>
        <div className="neo-badge" style={{ backgroundColor: 'var(--color-secondary)' }}>
          Đúng: {quizScore.correct} / {quizScore.total}
        </div>
      </div>

      <div className="workspace-card quiz-green">
        <div style={{ fontSize: '15px', color: '#555', marginBottom: '10px' }}>Nghĩa của từ này là gì?</div>
        <div style={{ fontSize: '38px', fontWeight: '800', margin: '15px 0' }}>{activeQuizWord?.word}</div>
        <div style={{ fontSize: '18px', color: '#666' }}>({activeQuizWord?.pinyin})</div>
      </div>

      <div className="options-grid">
        {quizOptions.map((opt, idx) => {
          let btnClass = "";
          if (quizChecked) {
            if (opt === activeQuizWord.trans) {
              btnClass = "correct";
            } else if (idx === quizSelectedOption) {
              btnClass = "incorrect";
            }
          }
          return (
            <button
              key={idx}
              className={`option-btn ${btnClass}`}
              onClick={() => handleQuizChoice(idx)}
              disabled={quizChecked}
            >
              <span className="option-idx">{idx + 1}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      <div className="learning-actions-row">
        <button
          className="neo-btn"
          onClick={() => {
            setQuizIndex(prev => prev + 1);
          }}
        >
          {quizChecked ? 'Tiếp tục' : 'Bỏ qua'} →
        </button>
      </div>
      <div className="hotkey-guide-text">
        Nhấn phím 1-4 để chọn đáp án nhanh, phím Space để tiếp tục
      </div>
    </div>
  );
};

export default QuizMode;
