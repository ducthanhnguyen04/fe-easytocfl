import React, { useState, useEffect } from 'react';
import { showToast } from '../../../utils/toast';

const FlashcardMode = ({
  currentLessonWords,
  vocabWords,
  toggleVocabLearned,
  handlePlayAudio,
}) => {
  const [flashIndex, setFlashIndex] = useState(0);
  const [flashFlipped, setFlashFlipped] = useState(false);
  const [flashTranslationMode, setFlashTranslationMode] = useState('ZH-VI'); // 'ZH-VI' or 'VI-ZH'
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  const activeFlashWord = currentLessonWords[flashIndex % currentLessonWords.length];

  // Autoplay vocabulary audio when card changes in Flashcard mode
  useEffect(() => {
    if (isAutoPlay && currentLessonWords.length > 0) {
      const activeWord = currentLessonWords[flashIndex % currentLessonWords.length];
      if (activeWord) {
        handlePlayAudio(activeWord);
      }
    }
  }, [flashIndex, isAutoPlay, currentLessonWords, handlePlayAudio]);

  // Keyboard navigation effect
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentLessonWords.length === 0) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFlashIndex(prev => (prev - 1 + currentLessonWords.length) % currentLessonWords.length);
        setFlashFlipped(false);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFlashIndex(prev => (prev + 1) % currentLessonWords.length);
        setFlashFlipped(false);
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setFlashFlipped(prev => !prev);
      } else if (e.key.toLowerCase() === 'a') {
        e.preventDefault();
        const activeWord = currentLessonWords[flashIndex % currentLessonWords.length];
        if (activeWord) handlePlayAudio(activeWord);
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsAutoPlay(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [flashIndex, currentLessonWords, handlePlayAudio, isAutoPlay]);

  if (!activeFlashWord) return null;

  return (
    <div className="learning-workspace">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div className="neo-btn-group">
          <button className="neo-btn active" style={{ padding: '6px 12px', fontSize: '12px' }}>Từ vựng</button>
          <button className="neo-btn" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => showToast(`Ví dụ: ${activeFlashWord?.word} 是一句非常有用的話。`, 'info')}>Ví dụ</button>
        </div>
        <div style={{ fontSize: '14px', fontWeight: '800' }}>
          {(flashIndex % currentLessonWords.length) + 1} / {currentLessonWords.length}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="neo-btn"
            style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: 'var(--color-bg)' }}
            onClick={() => setFlashTranslationMode(flashTranslationMode === 'ZH-VI' ? 'VI-ZH' : 'ZH-VI')}
          >
            {flashTranslationMode === 'ZH-VI' ? 'ZH → VI' : 'VI → ZH'}
          </button>
          <button
            className={`neo-btn ${isAutoPlay ? 'active' : ''}`}
            style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: isAutoPlay ? 'var(--color-secondary)' : '' }}
            onClick={() => {
              setIsAutoPlay(!isAutoPlay);
              if (!isAutoPlay) {
                const activeWord = currentLessonWords[flashIndex % currentLessonWords.length];
                if (activeWord) handlePlayAudio(activeWord);
              }
            }}
          >
            Tự động phát: {isAutoPlay ? 'BẬT' : 'TẮT'}
          </button>
        </div>
      </div>

      <div
        className="flashcard-container"
        onClick={() => setFlashFlipped(!flashFlipped)}
      >
        <div className={`flashcard-inner ${flashFlipped ? 'flipped' : ''}`}>
          <div className="flashcard-face flashcard-front">
            {flashTranslationMode === 'ZH-VI' ? (
              <div>
                <div className="flashcard-word">{activeFlashWord?.word}</div>
                <div className="flashcard-pinyin">{activeFlashWord?.pinyin}</div>
              </div>
            ) : (
              <div className="flashcard-trans">
                <div>{activeFlashWord?.trans}</div>
                {activeFlashWord?.englishMeaning && (
                  <div className="flashcard-english">{activeFlashWord.englishMeaning}</div>
                )}
              </div>
            )}
            <div className="flashcard-hint">✨ Click hoặc Space để lật thẻ</div>
          </div>

          <div className="flashcard-face flashcard-back">
            {flashTranslationMode === 'ZH-VI' ? (
              <div className="flashcard-trans">
                <div>{activeFlashWord?.trans}</div>
                {activeFlashWord?.englishMeaning && (
                  <div className="flashcard-english">{activeFlashWord.englishMeaning}</div>
                )}
              </div>
            ) : (
              <div>
                <div className="flashcard-word">{activeFlashWord?.word}</div>
                <div className="flashcard-pinyin">{activeFlashWord?.pinyin}</div>
              </div>
            )}
            <div className="flashcard-hint">✨ Click hoặc Space để lật thẻ</div>
          </div>
        </div>
      </div>

      <div className="learning-actions-row">
        <button
          className="neo-btn"
          onClick={() => {
            setFlashIndex((flashIndex - 1 + currentLessonWords.length) % currentLessonWords.length);
            setFlashFlipped(false);
          }}
        >
          ← Trước
        </button>

        <button
          className="neo-btn"
          style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
          onClick={() => {
            const globalIdx = vocabWords.findIndex(v => v.word === activeFlashWord.word);
            if (globalIdx !== -1 && activeFlashWord.learned) toggleVocabLearned(globalIdx);
            setFlashIndex((flashIndex + 1) % currentLessonWords.length);
            setFlashFlipped(false);
          }}
        >
          ✘ Chưa thuộc
        </button>

        <button
          className="neo-btn"
          style={{ backgroundColor: 'var(--color-secondary)' }}
          onClick={() => {
            const globalIdx = vocabWords.findIndex(v => v.word === activeFlashWord.word);
            if (globalIdx !== -1 && !activeFlashWord.learned) toggleVocabLearned(globalIdx);
            setFlashIndex((flashIndex + 1) % currentLessonWords.length);
            setFlashFlipped(false);
          }}
        >
          ✓ Đã thuộc
        </button>

        <button
          className="neo-btn"
          onClick={() => {
            setFlashIndex((flashIndex + 1) % currentLessonWords.length);
            setFlashFlipped(false);
          }}
        >
          Sau →
        </button>
      </div>
      <div className="hotkey-guide-text">
        Dùng phím ← → để điều hướng, Space để lật thẻ, A để nghe âm thanh, P để tự động phát
      </div>
    </div>
  );
};

export default FlashcardMode;
