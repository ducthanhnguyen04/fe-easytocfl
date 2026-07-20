import React, { useState, useEffect } from 'react';
import AudioButton from '../../../components/AudioButton';

const DictationMode = ({
  currentLessonWords,
  handlePlayAudio,
}) => {
  const [dictationIndex, setDictationIndex] = useState(0);
  const [dictationInput, setDictationInput] = useState('');
  const [dictationFeedback, setDictationFeedback] = useState(null);
  const [dictationScore, setDictationScore] = useState({ correct: 0, total: 0 });
  const [showDictationHint, setShowDictationHint] = useState(false);

  // Reset spelling & dictation states on index change
  useEffect(() => {
    setDictationInput('');
    setDictationFeedback(null);
    setShowDictationHint(false);
  }, [dictationIndex]);

  // Autoplay vocabulary audio when dictation word changes
  useEffect(() => {
    if (currentLessonWords.length > 0) {
      const activeWord = currentLessonWords[dictationIndex % currentLessonWords.length];
      if (activeWord) {
        handlePlayAudio(activeWord);
      }
    }
  }, [dictationIndex, currentLessonWords, handlePlayAudio]);

  const handleDictationCheck = () => {
    if (!dictationInput.trim()) return;
    const activeDictationWord = currentLessonWords[dictationIndex % currentLessonWords.length];
    if (activeDictationWord) {
      const isCorrect = dictationInput.trim().toLowerCase() === activeDictationWord.word ||
        dictationInput.trim().toLowerCase() === activeDictationWord.pinyin.toLowerCase();
      setDictationFeedback(
        isCorrect ? "🎉 Chính xác!" : `❌ Chưa đúng! Từ phát âm là: ${activeDictationWord.word} (${activeDictationWord.pinyin})`
      );
      setDictationScore(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1
      }));
    }
  };

  const getDictationHintPattern = (word) => {
    if (!word) return '';
    const chars = word.word.split('');
    return chars.map((c, i) => i === 0 ? c : '_').join(' ');
  };

  // Keyboard navigation effect
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentLessonWords.length === 0) return;

      const isInputFocused = document.activeElement.tagName === 'INPUT';

      if (e.key === 'Enter' && dictationFeedback !== null) {
        e.preventDefault();
        setDictationIndex(prev => prev + 1);
      } else if ((e.key === ' ' || e.code === 'Space') && dictationFeedback !== null && !isInputFocused) {
        e.preventDefault();
        setDictationIndex(prev => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dictationFeedback, currentLessonWords]);

  const isCompleted = dictationIndex >= currentLessonWords.length;

  if (isCompleted) {
    const correctCount = dictationScore.correct;
    const totalCount = currentLessonWords.length;
    const incorrectCount = totalCount - correctCount;
    const scorePercent = Math.round((correctCount / totalCount) * 100);

    return (
      <div className="learning-workspace">
        <div className="workspace-card dictation-yellow" style={{ minHeight: '300px' }}>
          <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '15px' }}>🎉 Hoàn thành Nghe chép!</div>
          <div style={{ display: 'flex', gap: '25px', margin: '20px 0', fontSize: '16px', fontWeight: '800' }}>
            <div style={{ color: 'var(--color-secondary)' }}>✓ Đúng: {correctCount} câu</div>
            <div style={{ color: 'var(--color-primary)' }}>✗ Sai: {incorrectCount} câu</div>
            <div>⭐ Tỉ lệ: {scorePercent}%</div>
          </div>
          <p style={{ fontSize: '14px', color: '#555', maxWidth: '400px', margin: '0 auto 20px', lineHeight: '1.5' }}>
            {scorePercent >= 80
              ? "Kỹ năng nghe của bạn thật xuất sắc! Hãy tiếp tục phát huy."
              : "Hãy luyện nghe chép lại để nâng cao phản xạ âm thanh nhé!"}
          </p>
          <button
            className="neo-btn neo-btn-primary"
            style={{ padding: '10px 20px', fontWeight: '800' }}
            onClick={() => {
              setDictationIndex(0);
              setDictationScore({ correct: 0, total: 0 });
            }}
          >
            🔄 Làm lại Nghe chép
          </button>
        </div>
      </div>
    );
  }

  const activeDictationWord = currentLessonWords[dictationIndex % currentLessonWords.length];

  return (
    <div className="learning-workspace">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div style={{ fontWeight: '800', fontSize: '13px' }}>
          Nghe chép chính tả chữ Hán Phồn thể
        </div>
        <div style={{ fontSize: '14px', fontWeight: '800' }}>
          {(dictationIndex % currentLessonWords.length) + 1} / {currentLessonWords.length}
        </div>
        <div className="neo-badge" style={{ backgroundColor: 'var(--color-yellow)' }}>
          Đúng: {dictationScore.correct} / {dictationScore.total}
        </div>
      </div>

      <div className="workspace-card dictation-yellow">
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>Bấm nút nghe rồi gõ lại chữ Hán / Pinyin bạn nghe được</div>

        <AudioButton
          onClick={() => handlePlayAudio(activeDictationWord)}
          showLabel={true}
          label="Nghe lại phát âm"
          size={20}
          style={{ padding: '10px 22px', fontSize: '15px' }}
        />

        {showDictationHint && (
          <div style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '4px', margin: '10px 0', color: 'var(--color-primary)' }}>
            Gợi ý từ: {getDictationHintPattern(activeDictationWord)}
          </div>
        )}

        {dictationFeedback && (
          <div className="typing-feedback" style={{ color: dictationFeedback.startsWith('🎉') ? 'var(--color-secondary)' : 'var(--color-primary)' }}>
            {dictationFeedback}
          </div>
        )}
      </div>

      <div className="typing-control-box">
        <input
          type="text"
          className="typing-text-input"
          placeholder="Gõ chữ Hán hoặc Pinyin..."
          value={dictationInput}
          onChange={(e) => setDictationInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleDictationCheck();
          }}
          disabled={dictationFeedback !== null}
          autoFocus
        />

        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
          <button
            className="neo-btn"
            style={{ flex: 1 }}
            onClick={() => setShowDictationHint(true)}
            disabled={showDictationHint}
          >
            💡 Gợi ý
          </button>
          {dictationFeedback === null ? (
            <button className="neo-btn neo-btn-primary" style={{ flex: 2 }} onClick={handleDictationCheck}>
              Kiểm tra
            </button>
          ) : (
            <button
              className="neo-btn neo-btn-primary"
              style={{ flex: 2, backgroundColor: 'var(--color-secondary)' }}
              onClick={() => setDictationIndex(prev => prev + 1)}
            >
              Tiếp tục →
            </button>
          )}
        </div>
      </div>
      <div className="hotkey-guide-text" style={{ marginTop: '15px' }}>
        Nhấn Enter để kiểm tra, Space hoặc click nút Tiếp tục để chuyển câu
      </div>
    </div>
  );
};

export default DictationMode;
