import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ConversationMode = ({
  bookId,
  lessonId,
  currentLessonWords = [],
  lessonTitle = "",
  beUrl,
}) => {
  const [dialogue, setDialogue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(-1);
  const playAllRef = useRef(false);

  useEffect(() => {
    const fetchDialogue = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${beUrl}/dialogues/get-by-lesson-id`, {
          params: { lessonId },
          withCredentials: true
        });
        if (response.data && response.data.dialogue) {
          setDialogue(response.data.dialogue);
        } else {
          setDialogue(null);
        }
      } catch (error) {
        console.error("Error fetching dialogue:", error);
        setDialogue(null);
      } finally {
        setLoading(false);
      }
    };

    if (beUrl && lessonId) {
      fetchDialogue();
    } else {
      setLoading(false);
    }
  }, [beUrl, lessonId]);

  // Stop sound if component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const playLine = (index, text, onEndCallback) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setCurrentPlayingIndex(index);
      
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const zhVoice = voices.find(v => v.lang === 'zh-TW') || 
                      voices.find(v => v.lang.includes('zh-TW')) ||
                      voices.find(v => v.lang.includes('zh-HK')) ||
                      voices.find(v => v.lang.includes('zh-CN')) || 
                      voices.find(v => v.lang.startsWith('zh'));
      
      if (zhVoice) {
        utterance.voice = zhVoice;
      } else {
        utterance.lang = 'zh-TW';
      }
      utterance.rate = 0.85; // Natural speed for learners

      utterance.onend = () => {
        setCurrentPlayingIndex(-1);
        if (onEndCallback) onEndCallback();
      };

      utterance.onerror = () => {
        setCurrentPlayingIndex(-1);
        if (onEndCallback) onEndCallback();
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const startPlayAll = () => {
    if (!dialogue || !dialogue.lines || dialogue.lines.length === 0) return;
    setIsPlayingAll(true);
    playAllRef.current = true;
    playNext(0);
  };

  const stopPlayAll = () => {
    setIsPlayingAll(false);
    playAllRef.current = false;
    setCurrentPlayingIndex(-1);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const playNext = (index) => {
    if (!playAllRef.current || !dialogue || !dialogue.lines) return;
    if (index >= dialogue.lines.length) {
      setIsPlayingAll(false);
      playAllRef.current = false;
      setCurrentPlayingIndex(-1);
      return;
    }
    
    // Play current line and schedule next one on end
    playLine(index, dialogue.lines[index].text, () => {
      // Small pause between lines
      setTimeout(() => {
        playNext(index + 1);
      }, 1000);
    });
  };

  // Determine alignment based on speaker
  const getSpeakerStyle = (speaker) => {
    const isLeft = speaker === "中明" || speaker === "東明" || speaker === "莉莉" || speaker === "同學甲" || speaker === "店員";
    return {
      alignSelf: isLeft ? 'flex-start' : 'flex-end',
      bubbleClass: isLeft ? 'bubble-left' : 'bubble-right',
      avatarColor: isLeft ? 'var(--color-primary)' : 'var(--color-secondary)'
    };
  };

  const getIllustrationSrc = (url) => {
    if (!url) return "/dialogue_generic.png";
    if (url.startsWith('http')) return url;
    if (url.startsWith('/dialogue')) return url;
    return `${beUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  if (loading) {
    return (
      <div className="neo-card" style={{ padding: '40px', textAlign: 'center', fontWeight: 'bold', margin: '20px 0', color: '#666' }}>
        🔄 Đang tải bài khóa hội thoại từ hệ thống...
      </div>
    );
  }

  if (!dialogue || !dialogue.lines || dialogue.lines.length === 0) {
    return (
      <div className="neo-card" style={{ padding: '45px 30px', textAlign: 'center', margin: '20px 0', border: '2px dashed var(--color-primary)', backgroundColor: 'var(--color-white)' }}>
        <span style={{ fontSize: '40px', display: 'block', marginBottom: '15px' }}>💬</span>
        <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '8px' }}>
          Chưa có bài khóa hội thoại nào cho bài học này!
        </h4>
        <p style={{ fontSize: '13px', color: '#666', maxWidth: '380px', margin: '0 auto', lineHeight: '1.5' }}>
          Người quản trị hệ thống chưa tạo nội dung hội thoại cho bài này. Vui lòng quay lại sau hoặc thử các bài học khác!
        </p>
      </div>
    );
  }

  return (
    <div className="learning-workspace">
      {/* Control Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--color-black)' }}>
          Bài khóa hội thoại đàm thoại
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className={`neo-btn ${showPinyin ? 'active' : ''}`}
            style={{ padding: '6px 12px', fontSize: '12px' }}
            onClick={() => setShowPinyin(!showPinyin)}
          >
            {showPinyin ? '✓ Phiên âm' : 'Phiên âm'}
          </button>
          <button
            className={`neo-btn ${showTranslation ? 'active' : ''}`}
            style={{ padding: '6px 12px', fontSize: '12px' }}
            onClick={() => setShowTranslation(!showTranslation)}
          >
            {showTranslation ? '✓ Dịch nghĩa' : 'Dịch nghĩa'}
          </button>
          {isPlayingAll ? (
            <button
              className="neo-btn"
              style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: 'var(--color-primary)', color: 'white' }}
              onClick={stopPlayAll}
            >
              ⏹ Dừng phát
            </button>
          ) : (
            <button
              className="neo-btn"
              style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: 'var(--color-secondary)' }}
              onClick={startPlayAll}
            >
              ▶ Phát toàn bộ
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Dialogues on left, Illustration on right */}
      <div className="dialogue-layout-grid">
        {/* Left: Dialogue Scroll View */}
        <div className="dialogue-chat-container">
          <div className="dialogue-header-title">
            {dialogue.header}
          </div>
          
          <div className="dialogue-chat-list">
            {dialogue.lines.map((line, idx) => {
              const { alignSelf, bubbleClass, avatarColor } = getSpeakerStyle(line.character);
              const isHighlighted = currentPlayingIndex === idx;

              return (
                <div
                  key={idx}
                  className="dialogue-row"
                  style={{ alignSelf }}
                >
                  {alignSelf === 'flex-start' && (
                    <div className="dialogue-avatar" style={{ backgroundColor: avatarColor }}>
                      {line.character.substring(0, 1)}
                    </div>
                  )}

                  <div
                    className={`dialogue-bubble ${bubbleClass} ${isHighlighted ? 'highlighted' : ''}`}
                    onClick={() => playLine(idx, line.text)}
                    title="Nhấp để nghe phát âm dòng này"
                  >
                    {/* Speaker meta */}
                    <div className="dialogue-speaker-name" style={{ color: avatarColor }}>
                      {line.character}
                    </div>

                    {/* Chinese Text */}
                    <div className="dialogue-text-cn">
                      {line.text}
                      <span className="dialogue-inline-play">🔊</span>
                    </div>

                    {/* Pinyin (Conditional) */}
                    {showPinyin && (
                      <div className="dialogue-text-pinyin">
                        {line.pinyin}
                      </div>
                    )}

                    {/* Translation (Conditional) */}
                    {showTranslation && (
                      <div className="dialogue-text-vn">
                        {line.translation}
                      </div>
                    )}
                  </div>

                  {alignSelf === 'flex-end' && (
                    <div className="dialogue-avatar" style={{ backgroundColor: avatarColor }}>
                      {line.character.substring(0, 1)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Graphic Illustration */}
        <div className="dialogue-graphic-panel neo-card">
          <img
            src={getIllustrationSrc(dialogue.illustrationUrl)}
            alt="Dialogue illustration"
            className="dialogue-illustration-img"
          />
          <div className="dialogue-caption-card">
            <span style={{ fontWeight: '800' }}>💡 Mẹo học:</span> Nhấp trực tiếp vào bất kỳ hộp thoại hội thoại nào để nghe phát âm câu nói đó bằng giọng đọc chuẩn!
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationMode;
