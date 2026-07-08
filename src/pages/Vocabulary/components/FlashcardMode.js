import React, { useState, useEffect, useMemo, useRef } from 'react';

const FlashcardMode = ({
  currentLessonWords,
  vocabWords,
  toggleVocabLearned,
  handlePlayAudio,
  examplesList = [],
}) => {
  const [flashIndex, setFlashIndex] = useState(0);
  const [flashFlipped, setFlashFlipped] = useState(false);
  const [flashTranslationMode, setFlashTranslationMode] = useState('ZH-VI'); // 'ZH-VI' or 'VI-ZH'
  const [flashContentType, setFlashContentType] = useState('vocab'); // 'vocab' or 'example'
  const [isAutoPlayActive, setIsAutoPlayActive] = useState(false);
  const [showAutoplayModal, setShowAutoplayModal] = useState(false);
  const [flipDuration, setFlipDuration] = useState(3);
  const [nextDuration, setNextDuration] = useState(2);
  const [slideDirection, setSlideDirection] = useState('next'); // 'next' or 'prev'

  const vocabBtnRef = useRef(null);
  const exampleBtnRef = useRef(null);

  const activeFlashWord = currentLessonWords[flashIndex % currentLessonWords.length];

  const activeExample = useMemo(() => {
    if (!activeFlashWord) return null;
    const found = examplesList.find(e => Number(e.vocabularyId) === Number(activeFlashWord.id));
    if (found) return found;

    // Natural fallback for any vocabulary word
    const wordText = activeFlashWord.word;
    if (wordText === '臺灣' || wordText === '台湾') {
      return { example: '我非常喜歡去臺灣旅遊。', pinyin: 'Wǒ fēicháng xǐhuan qù Táiwān lǚyóu.', meaning: 'Tôi rất thích đi du lịch Đài Loan.' };
    }
    if (wordText === '學習' || wordText === '学习') {
      return { example: '我們每天都要學習新單字。', pinyin: 'Wǒmen měitiān dōu yào xuéxí xīn dānzì.', meaning: 'Chúng tôi phải học từ mới mỗi ngày.' };
    }
    if (wordText === '謝謝' || wordText === '谢谢') {
      return { example: '謝謝老師的用心教導。', pinyin: 'Xièxie lǎoshī de yòngxīn jiàodǎo.', meaning: 'Cảm ơn sự dạy dỗ tận tâm của thầy cô.' };
    }
    if (wordText === '捷運' || wordText === '捷运') {
      return { example: '在台北搭乘捷運非常方便。', pinyin: 'Zài Táiběi dāchéng jiéyùn fēicháng fāngbiàn.', meaning: 'Đi tàu điện ngầm ở Đài Bắc rất tiện lợi.' };
    }
    if (wordText === '珍珠奶茶') {
      return { example: '我想喝一杯台灣的珍珠奶茶。', pinyin: 'Wǒ xiǎng hē yī bēi Táiwān de zhēnzhū nǎichá.', meaning: 'Tôi muốn uống một cốc trà sữa trân châu của Đài Loan.' };
    }
    if (wordText === '夜市') {
      return { example: '晚上我們去夜市吃小吃。', pinyin: 'Wǎnshàng wǒmen qù yèshì chī xiǎochī.', meaning: 'Buổi tối chúng tôi đi chợ đêm ăn vặt.' };
    }

    return {
      example: `我們來學習「${wordText}」這個詞。`,
      pinyin: `Wǒmen lái xuéxí "${wordText}" zhè ge cí.`,
      meaning: `Chúng ta hãy cùng học từ "${activeFlashWord.trans}" này.`
    };
  }, [activeFlashWord, examplesList]);

  // Autoplay Slideshow Effect
  useEffect(() => {
    if (!isAutoPlayActive || currentLessonWords.length === 0) return;

    let timer;
    if (!flashFlipped) {
      // Front side: wait flipDuration, then flip
      timer = setTimeout(() => {
        setFlashFlipped(true);
      }, flipDuration * 1000);
    } else {
      // Back side: wait nextDuration, then go to next
      timer = setTimeout(() => {
        setFlashFlipped(false);
        setSlideDirection('next');
        setFlashIndex(prev => (prev + 1) % currentLessonWords.length);
      }, nextDuration * 1000);
    }

    return () => clearTimeout(timer);
  }, [isAutoPlayActive, flashFlipped, flashIndex, flipDuration, nextDuration, currentLessonWords.length]);

  // Autoplay vocabulary audio when card flips to front in slideshow mode
  useEffect(() => {
    if (isAutoPlayActive && !flashFlipped && currentLessonWords.length > 0) {
      const activeWord = currentLessonWords[flashIndex % currentLessonWords.length];
      if (activeWord) {
        handlePlayAudio(activeWord);
      }
    }
  }, [flashIndex, flashFlipped, isAutoPlayActive, currentLessonWords, handlePlayAudio]);

  // Keyboard navigation effect
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentLessonWords.length === 0) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIsAutoPlayActive(false);
        setSlideDirection('prev');
        setFlashIndex(prev => (prev - 1 + currentLessonWords.length) % currentLessonWords.length);
        setFlashFlipped(false);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIsAutoPlayActive(false);
        setSlideDirection('next');
        setFlashIndex(prev => (prev + 1) % currentLessonWords.length);
        setFlashFlipped(false);
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsAutoPlayActive(false);
        setFlashFlipped(prev => !prev);
      } else if (e.key.toLowerCase() === 'a') {
        e.preventDefault();
        const activeWord = currentLessonWords[flashIndex % currentLessonWords.length];
        if (activeWord) handlePlayAudio(activeWord);
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (isAutoPlayActive) {
          setIsAutoPlayActive(false);
        } else {
          setShowAutoplayModal(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [flashIndex, currentLessonWords, handlePlayAudio, isAutoPlayActive]);

  if (!activeFlashWord) return null;

  return (
    <div className="learning-workspace">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div className="neo-btn-group">
          <button
            ref={vocabBtnRef}
            className={`neo-btn ${flashContentType === 'vocab' ? 'active' : ''}`}
            style={{ padding: '6px 12px', fontSize: '12px' }}
            onClick={() => {
              setFlashContentType('vocab');
              setFlashFlipped(false);
              vocabBtnRef.current?.focus();
            }}
          >
            Từ vựng
          </button>
          <button
            ref={exampleBtnRef}
            className={`neo-btn ${flashContentType === 'example' ? 'active' : ''}`}
            style={{ padding: '6px 12px', fontSize: '12px' }}
            onClick={() => {
              setFlashContentType('example');
              setFlashFlipped(false);
              exampleBtnRef.current?.focus();
            }}
          >
            Ví dụ
          </button>
        </div>
        <div style={{ fontSize: '14px', fontWeight: '800' }}>
          {(flashIndex % currentLessonWords.length) + 1} / {currentLessonWords.length}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {flashContentType === 'vocab' && (
            <button
              className="neo-btn"
              style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: 'var(--color-bg)' }}
              onClick={() => setFlashTranslationMode(flashTranslationMode === 'ZH-VI' ? 'VI-ZH' : 'ZH-VI')}
            >
              {flashTranslationMode === 'ZH-VI' ? 'ZH → VI' : 'VI → ZH'}
            </button>
          )}
          <button
            className={`neo-btn ${isAutoPlayActive ? 'active' : ''}`}
            style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: isAutoPlayActive ? 'var(--color-secondary)' : '' }}
            onClick={() => {
              if (isAutoPlayActive) {
                setIsAutoPlayActive(false);
              } else {
                setShowAutoplayModal(true);
              }
            }}
          >
            {isAutoPlayActive ? '⏹ Dừng phát' : '▶ Tự động phát'}
          </button>
        </div>
      </div>

      <div
        key={`${flashIndex}-${slideDirection}`}
        className={`flashcard-container slide-${slideDirection}`}
        onClick={() => {
          setIsAutoPlayActive(false);
          setFlashFlipped(!flashFlipped);
        }}
      >
        <div className={`flashcard-inner ${flashFlipped ? 'flipped' : ''}`}>
          <div className="flashcard-face flashcard-front">
            {(flashContentType === 'example' || flashTranslationMode === 'ZH-VI') && (
              <button
                className="neo-btn"
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  padding: '0',
                  fontSize: '16px',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  backgroundColor: 'var(--color-white)',
                  border: '2px solid var(--color-black)'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayAudio(activeFlashWord);
                }}
                title="Phát âm từ vựng"
              >
                🔊
              </button>
            )}
            {flashContentType === 'example' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                <div className="flashcard-word" style={{ color: 'var(--color-primary)' }}>{activeFlashWord?.word}</div>
                <div className="flashcard-pinyin">{activeFlashWord?.pinyin}</div>
                <div className="vocab-translation" style={{ fontSize: '16px', fontWeight: '800', marginTop: '5px' }}>
                  {activeFlashWord?.trans}
                </div>
              </div>
            ) : flashTranslationMode === 'ZH-VI' ? (
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
            {(flashContentType === 'example' || flashTranslationMode === 'VI-ZH') && (
              <button
                className="neo-btn"
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  padding: '0',
                  fontSize: '16px',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  backgroundColor: 'var(--color-white)',
                  border: '2px solid var(--color-black)'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (flashContentType === 'example' && activeExample) {
                    handlePlayAudio(activeExample.example);
                  } else {
                    handlePlayAudio(activeFlashWord);
                  }
                }}
                title={flashContentType === 'example' ? "Phát âm câu ví dụ" : "Phát âm từ vựng"}
              >
                🔊
              </button>
            )}
            {flashContentType === 'example' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', padding: '10px' }}>
                <div style={{ fontSize: '22px', fontWeight: '800', lineHeight: '1.4', wordBreak: 'break-word', color: 'var(--color-black)' }}>
                  {activeExample?.example}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--color-secondary)', fontWeight: '700' }}>
                  {activeExample?.pinyin}
                </div>
                <div style={{ fontSize: '15px', color: 'var(--color-black)', opacity: 0.8, fontWeight: '600' }}>
                  {activeExample?.meaning}
                </div>
              </div>
            ) : flashTranslationMode === 'ZH-VI' ? (
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
            setIsAutoPlayActive(false);
            setSlideDirection('prev');
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
            setIsAutoPlayActive(false);
            setSlideDirection('next');
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
            setIsAutoPlayActive(false);
            setSlideDirection('next');
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
            setIsAutoPlayActive(false);
            setSlideDirection('next');
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

      {/* Tự động phát thẻ Modal */}
      {showAutoplayModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div className="neo-card" style={{
            backgroundColor: 'var(--color-white)',
            color: 'var(--color-black)',
            padding: '30px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: 'var(--shadow-thick)',
            position: 'relative'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⏱️ Tự động phát thẻ
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '25px' }}>
              {/* Row 1 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '14px' }}>Thời gian để lật thẻ</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-black)', opacity: 0.6 }}>
                    Hiện mặt trước bao lâu rồi lật sang mặt sau
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <button 
                    className="neo-btn" 
                    style={{ padding: '6px 12px', fontSize: '14px', fontWeight: '900' }}
                    onClick={() => setFlipDuration(prev => Math.max(1, prev - 1))}
                  >-</button>
                  <span style={{ fontWeight: '900', fontSize: '16px', minWidth: '25px', textAlign: 'center' }}>{flipDuration}</span>
                  <button 
                    className="neo-btn" 
                    style={{ padding: '6px 12px', fontSize: '14px', fontWeight: '900' }}
                    onClick={() => setFlipDuration(prev => Math.min(10, prev + 1))}
                  >+</button>
                  <span style={{ fontSize: '12px', fontWeight: '700', marginLeft: '2px' }}>giây</span>
                </div>
              </div>

              {/* Row 2 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '14px' }}>Thời gian để sang thẻ mới</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-black)', opacity: 0.6 }}>
                    Xem mặt sau bao lâu rồi chuyển thẻ kế tiếp
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <button 
                    className="neo-btn" 
                    style={{ padding: '6px 12px', fontSize: '14px', fontWeight: '900' }}
                    onClick={() => setNextDuration(prev => Math.max(1, prev - 1))}
                  >-</button>
                  <span style={{ fontWeight: '900', fontSize: '16px', minWidth: '25px', textAlign: 'center' }}>{nextDuration}</span>
                  <button 
                    className="neo-btn" 
                    style={{ padding: '6px 12px', fontSize: '14px', fontWeight: '900' }}
                    onClick={() => setNextDuration(prev => Math.min(10, prev + 1))}
                  >+</button>
                  <span style={{ fontSize: '12px', fontWeight: '700', marginLeft: '2px' }}>giây</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                className="neo-btn" 
                style={{ padding: '8px 16px', fontSize: '13px' }}
                onClick={() => setShowAutoplayModal(false)}
              >
                Hủy
              </button>
              <button 
                className="neo-btn neo-btn-primary" 
                style={{ padding: '8px 20px', fontSize: '13px', backgroundColor: 'var(--color-blue)', display: 'flex', alignItems: 'center', gap: '5px' }}
                onClick={() => {
                  setIsAutoPlayActive(true);
                  setShowAutoplayModal(false);
                  setFlashFlipped(false);
                }}
              >
                ▶ Bắt đầu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardMode;
