import React, { useState, useEffect } from 'react';

const ReadingMode = ({
  currentLessonWords,
  vocabWords,
}) => {
  const [readingIndex, setReadingIndex] = useState(0);
  const [readingSelectedOption, setReadingSelectedOption] = useState(null);
  const [readingChecked, setReadingChecked] = useState(false);
  const [readingScore, setReadingScore] = useState({ correct: 0, total: 0 });
  const [readingOptions, setReadingOptions] = useState([]);

  const getSentenceWithBlank = (word) => {
    if (!word) return { cn: '___ 是一個好地方。', vn: '___ là một nơi tốt đẹp.' };
    if (word.word === '臺灣') return { cn: '我非常喜歡去 ___ 旅遊。', vn: 'Tôi rất thích đi du lịch ___.' };
    if (word.word === '學習') return { cn: '我們每天都要 ___ 新單字。', vn: 'Chúng tôi phải ___ từ mới mỗi ngày.' };
    if (word.word === '謝謝') return { cn: '___ 老師的用心教導。', vn: '___ thầy cô đã tận tâm dạy dỗ.' };
    if (word.word === '捷運') return { cn: '在台北搭乘 ___ 非常方便。', vn: 'Đi tàu điện ngầm ___ ở Đài Bắc rất tiện lợi.' };
    if (word.word === '珍珠奶茶') return { cn: '我想喝一杯台灣的 ___。', vn: 'Tôi muốn uống một cốc ___ của Đài Loan.' };
    if (word.word === '夜市') return { cn: '晚上我們去 ___ 吃小吃。', vn: 'Buổi tối chúng tôi đi ___ ăn vặt.' };
    return {
      cn: `這語句是我最喜歡的 ___。`,
      vn: `Đây là ___ yêu thích nhất của tôi.`
    };
  };

  // Wait, let's fix getSentenceWithBlank for "學習":
  // In the original code (lines 341-342):
  // if (word.word === '學習') return { cn: 'Chúng tôi phải ___ từ mới mỗi ngày.', cn: '我們每天都要 ___ 新單字。', vn: 'Chúng tôi phải ___ từ mới mỗi ngày.' };
  // Let's rewrite it:
  // if (word.word === '學習') return { cn: 'Chúng tôi phải ___ từ mới mỗi ngày.', cn: '我們每天都要 ___ 新單字。', vn: 'Chúng tôi phải ___ từ mới mỗi ngày.' };
  // Actually, the keys duplicated in JS objects will overwrite. Let's just use:
  // if (word.word === '學習') return { cn: '我們每天都要 ___ 新單字。', vn: 'Chúng tôi phải ___ từ mới mỗi ngày.' };

  // Generate reading options on readingIndex change
  useEffect(() => {
    if (currentLessonWords.length > 0 && readingIndex < currentLessonWords.length) {
      const correctWord = currentLessonWords[readingIndex % currentLessonWords.length];
      const correctOption = correctWord.word;
      const dbWords = vocabWords
        .filter(w => w.word !== correctWord.word)
        .map(w => w.word);
      let pool = dbWords;
      if (pool.length < 3) {
        const fallbacks = ['學習', '臺灣', '謝謝', '捷運', '學生', '夜市', '習慣', '民主'];
        pool = Array.from(new Set([...dbWords, ...fallbacks]));
      }
      const shuffledPool = pool.sort(() => 0.5 - Math.random()).slice(0, 3);
      const options = [correctOption, ...shuffledPool].sort(() => 0.5 - Math.random());
      setReadingOptions(options);
      setReadingSelectedOption(null);
      setReadingChecked(false);
    }
  }, [readingIndex, currentLessonWords, vocabWords]);

  const handleReadingChoice = (idx) => {
    if (readingChecked) return;
    setReadingSelectedOption(idx);
    setReadingChecked(true);
    const correctWord = currentLessonWords[readingIndex % currentLessonWords.length];
    if (correctWord) {
      const isCorrect = readingOptions[idx] === correctWord.word;
      setReadingScore(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1
      }));
    }
  };

  // Keyboard navigation effect
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentLessonWords.length === 0) return;

      if (['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const idx = parseInt(e.key) - 1;
        if (idx < readingOptions.length && !readingChecked) {
          handleReadingChoice(idx);
        }
      } else if ((e.key === ' ' || e.code === 'Space') && readingChecked) {
        e.preventDefault();
        setReadingIndex(prev => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readingIndex, readingChecked, readingOptions, currentLessonWords]);

  const isCompleted = readingIndex >= currentLessonWords.length;

  if (isCompleted) {
    const correctCount = readingScore.correct;
    const totalCount = currentLessonWords.length;
    const incorrectCount = totalCount - correctCount;
    const scorePercent = Math.round((correctCount / totalCount) * 100);

    return (
      <div className="learning-workspace">
        <div className="workspace-card reading-blue" style={{ minHeight: '300px' }}>
          <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '15px' }}>🎉 Hoàn thành Đọc hiểu!</div>
          <div style={{ display: 'flex', gap: '25px', margin: '20px 0', fontSize: '16px', fontWeight: '800' }}>
            <div style={{ color: 'var(--color-secondary)' }}>✓ Đúng: {correctCount} câu</div>
            <div style={{ color: 'var(--color-primary)' }}>✗ Sai: {incorrectCount} câu</div>
            <div>⭐ Tỉ lệ: {scorePercent}%</div>
          </div>
          <p style={{ fontSize: '14px', color: '#555', maxWidth: '400px', margin: '0 auto 20px', lineHeight: '1.5' }}>
            {scorePercent >= 80
              ? "Tuyệt vời! Bạn có khả năng hiểu ngữ cảnh rất tốt."
              : "Hãy thử lại để cải thiện điểm số đọc hiểu của mình!"}
          </p>
          <button
            className="neo-btn neo-btn-primary"
            style={{ padding: '10px 20px', fontWeight: '800' }}
            onClick={() => {
              setReadingIndex(0);
              setReadingScore({ correct: 0, total: 0 });
            }}
          >
            🔄 Làm lại Đọc hiểu
          </button>
        </div>
      </div>
    );
  }

  const activeReadingWord = currentLessonWords[readingIndex % currentLessonWords.length];
  const readingSentence = getSentenceWithBlank(activeReadingWord);

  return (
    <div className="learning-workspace">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div style={{ fontWeight: '800', fontSize: '13px' }}>
          Đọc hiểu ngữ cảnh
        </div>
        <div style={{ fontSize: '14px', fontWeight: '800' }}>
          {(readingIndex % currentLessonWords.length) + 1} / {currentLessonWords.length}
        </div>
        <div className="neo-badge" style={{ backgroundColor: 'var(--color-blue)' }}>
          Đúng: {readingScore.correct} / {readingScore.total}
        </div>
      </div>

      <div className="workspace-card reading-blue">
        <div style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '2px', marginBottom: '15px' }}>
          {readingSentence.cn}
        </div>
        <div style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
          ({readingSentence.vn})
        </div>
      </div>

      <div className="options-grid">
        {readingOptions.map((opt, idx) => {
          let btnClass = "";
          if (readingChecked) {
            if (opt === activeReadingWord.word) {
              btnClass = "correct";
            } else if (idx === readingSelectedOption) {
              btnClass = "incorrect";
            }
          }
          return (
            <button
              key={idx}
              className={`option-btn ${btnClass}`}
              onClick={() => handleReadingChoice(idx)}
              disabled={readingChecked}
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
            setReadingIndex(prev => prev + 1);
          }}
        >
          {readingChecked ? 'Tiếp tục' : 'Bỏ qua'} →
        </button>
      </div>
      <div className="hotkey-guide-text">
        Chọn chữ Hán Phồn thể thích hợp điền vào ô trống
      </div>
    </div>
  );
};

export default ReadingMode;
