import React, { useState, useEffect } from 'react';

const TypingMode = ({ currentLessonWords }) => {
  const [typingIndex, setTypingIndex] = useState(0);
  const [typingInput, setTypingInput] = useState('');
  const [typingFeedback, setTypingFeedback] = useState(null);
  const [typingScore, setTypingScore] = useState({ correct: 0, total: 0 });

  // Reset spelling states on index change
  useEffect(() => {
    setTypingInput('');
    setTypingFeedback(null);
  }, [typingIndex]);

  const handleTypingCheck = () => {
    if (!typingInput.trim()) return;
    const activeTypingWord = currentLessonWords[typingIndex % currentLessonWords.length];
    if (activeTypingWord) {
      const isCorrect = typingInput.trim() === activeTypingWord.word;
      setTypingFeedback({
        success: isCorrect,
        msg: isCorrect ? "🎉 Chính xác!" : `❌ Sai rồi! Chữ đúng là: ${activeTypingWord.word} (${activeTypingWord.pinyin})`
      });
      setTypingScore(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1
      }));
    }
  };

  // Keyboard navigation effect
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentLessonWords.length === 0) return;

      const isInputFocused = document.activeElement.tagName === 'INPUT';

      if (e.key === 'Enter' && typingFeedback !== null) {
        e.preventDefault();
        setTypingIndex(prev => prev + 1);
      } else if ((e.key === ' ' || e.code === 'Space') && typingFeedback !== null && !isInputFocused) {
        e.preventDefault();
        setTypingIndex(prev => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [typingFeedback, currentLessonWords]);

  const isCompleted = typingIndex >= currentLessonWords.length;

  if (isCompleted) {
    const correctCount = typingScore.correct;
    const totalCount = currentLessonWords.length;
    const incorrectCount = totalCount - correctCount;
    const scorePercent = Math.round((correctCount / totalCount) * 100);

    return (
      <div className="learning-workspace">
        <div className="workspace-card typing-orange" style={{ minHeight: '300px' }}>
          <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '15px' }}>🎉 Hoàn thành Luyện viết!</div>
          <div style={{ display: 'flex', gap: '25px', margin: '20px 0', fontSize: '16px', fontWeight: '800' }}>
            <div style={{ color: 'var(--color-secondary)' }}>✓ Đúng: {correctCount} câu</div>
            <div style={{ color: 'var(--color-primary)' }}>✗ Sai: {incorrectCount} câu</div>
            <div>⭐ Tỉ lệ: {scorePercent}%</div>
          </div>
          <p style={{ fontSize: '14px', color: '#555', maxWidth: '400px', margin: '0 auto 20px', lineHeight: '1.5' }}>
            {scorePercent >= 80
              ? "Rất giỏi! Bạn viết chữ Hán Phồn thể cực kỳ chuẩn xác."
              : "Hãy kiên trì luyện tập viết thêm để thành thạo mặt chữ nhé!"}
          </p>
          <button
            className="neo-btn neo-btn-primary"
            style={{ padding: '10px 20px', fontWeight: '800' }}
            onClick={() => {
              setTypingIndex(0);
              setTypingScore({ correct: 0, total: 0 });
            }}
          >
            🔄 Làm lại Luyện viết
          </button>
        </div>
      </div>
    );
  }

  const activeTypingWord = currentLessonWords[typingIndex % currentLessonWords.length];

  return (
    <div className="learning-workspace">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div style={{ fontWeight: '800', fontSize: '13px' }}>
          Luyện viết từ vựng Phồn thể
        </div>
        <div style={{ fontSize: '14px', fontWeight: '800' }}>
          {(typingIndex % currentLessonWords.length) + 1} / {currentLessonWords.length}
        </div>
        <div className="neo-badge" style={{ backgroundColor: 'var(--color-accent)' }}>
          Đúng: {typingScore.correct} / {typingScore.total}
        </div>
      </div>

      <div className="workspace-card typing-orange">
        <div style={{ fontSize: '15px', color: '#666' }}>Gõ chữ Hán Phồn thể có nghĩa là:</div>
        <div style={{ fontSize: '28px', fontWeight: '800', margin: '20px 0', color: 'var(--color-primary)' }}>
          <div>{activeTypingWord?.trans}</div>
          {activeTypingWord?.englishMeaning && (
            <div style={{ fontSize: '16px', color: '#555', marginTop: '8px', fontWeight: 'normal', fontStyle: 'italic' }}>
              ({activeTypingWord.englishMeaning})
            </div>
          )}
        </div>
        {typingFeedback && (
          <div className={`typing-feedback ${typingFeedback.success ? 'success' : 'error'}`} style={{ color: typingFeedback.success ? 'var(--color-secondary)' : 'var(--color-primary)' }}>
            {typingFeedback.msg}
          </div>
        )}
      </div>

      <div className="typing-control-box">
        <input
          type="text"
          className="typing-text-input"
          placeholder="Gõ chữ Hán Phồn thể..."
          value={typingInput}
          onChange={(e) => setTypingInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleTypingCheck();
          }}
          disabled={typingFeedback !== null}
          autoFocus
        />

        {typingFeedback === null ? (
          <button className="neo-btn neo-btn-primary typing-check-btn" onClick={handleTypingCheck}>
            Kiểm tra
          </button>
        ) : (
          <button
            className="neo-btn neo-btn-primary typing-check-btn"
            style={{ backgroundColor: 'var(--color-secondary)' }}
            onClick={() => setTypingIndex(prev => prev + 1)}
          >
            Tiếp tục →
          </button>
        )}
      </div>
      <div className="hotkey-guide-text" style={{ marginTop: '15px' }}>
        Nhấn Enter để kiểm tra, Space hoặc click nút Tiếp tục để chuyển câu
      </div>
    </div>
  );
};

export default TypingMode;
