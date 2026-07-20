import React, { useState, useEffect, useRef } from 'react';
import AudioButton from '../../components/AudioButton';
import { generateRoleplayReply } from '../../services/geminiService';
import { showToast } from '../../utils/toast';
import './AIConversation.css';

const QUICK_SUGGESTIONS = [
  { topic: 'Gọi món ở quán ăn Đài Loan', partner: 'Nhân viên quán ăn', icon: '🍜' },
  { topic: 'Phỏng vấn xin việc', partner: 'Nhà tuyển dụng', icon: '💼' },
  { topic: 'Hỏi đường đến ga tàu / MRT', partner: 'Người qua đường', icon: '🧭' },
  { topic: 'Mua quần áo ở cửa hàng', partner: 'Nhân viên bán hàng', icon: '🛍️' },
  { topic: 'Nhận phòng khách sạn', partner: 'Lễ tân khách sạn', icon: '🏨' },
  { topic: 'Rủ bạn đi chơi cuối tuần', partner: 'Người bạn thân', icon: '☕' }
];

const AIConversation = ({ playAudio }) => {
  // Setup state
  const [topic, setTopic] = useState('Mua quần áo ở cửa hàng');
  const [partnerRole, setPartnerRole] = useState('Nhân viên bán hàng');
  const [level, setLevel] = useState('Sơ cấp (Band A)');
  const [inConversation, setInConversation] = useState(false);
  const [loading, setLoading] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [accumulatedVocab, setAccumulatedVocab] = useState([]);
  const [suggestedResponses, setSuggestedResponses] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  // Support toggle switches (Right sidebar)
  const [showPinyin, setShowPinyin] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showCorrections, setShowCorrections] = useState(true);

  // Active translation state per message id
  const [revealedTranslations, setRevealedTranslations] = useState({});

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (inConversation) {
      scrollToBottom();
    }
  }, [messages, loading, inConversation]);

  // Speech Recognition setup (Voice to text for Chinese)
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'zh-TW';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsRecording(false);
        showToast(`🎙️ Đã nhận diện: "${transcript}"`, 'info');
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        showToast('Không thể thu âm giọng nói. Vui lòng thử gõ văn bản!', 'error');
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      showToast('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói tiếng Trung', 'warning');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        showToast('🎙️ Đang lắng nghe giọng nói tiếng Trung (Đài Loan)...', 'info');
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Start Roleplay Session
  const handleStartConversation = async () => {
    if (!topic.trim() || !partnerRole.trim()) {
      showToast('Vui lòng nhập chủ đề và vai nói chuyện!', 'warning');
      return;
    }

    setInConversation(true);
    setLoading(true);
    setMessages([]);
    setAccumulatedVocab([]);
    setSuggestedResponses([]);
    setRevealedTranslations({});

    try {
      const initialReply = await generateRoleplayReply({
        topic,
        partnerRole,
        level,
        history: []
      });

      const firstMsg = {
        id: Date.now(),
        sender: 'ai',
        replyCn: initialReply.replyCn,
        replyPinyin: initialReply.replyPinyin,
        replyVn: initialReply.replyVn,
        correction: initialReply.correction
      };

      setMessages([firstMsg]);
      setSuggestedResponses(initialReply.suggestedResponses || []);
      if (initialReply.vocabList && initialReply.vocabList.length > 0) {
        setAccumulatedVocab(initialReply.vocabList);
      }
    } catch (err) {
      console.error('Error starting roleplay:', err);
      showToast('Khởi tạo cuộc hội thoại thất bại. Vui lòng thử lại!', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Send User Message
  const handleSendMessage = async (textToSend) => {
    const messageText = textToSend || inputMessage;
    if (!messageText.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: messageText.trim()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    setLoading(true);

    // Prepare conversation history for Gemini
    const historyPayload = updatedMessages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      text: m.sender === 'user' ? m.text : m.replyCn
    }));

    try {
      const aiReply = await generateRoleplayReply({
        topic,
        partnerRole,
        level,
        history: historyPayload
      });

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        replyCn: aiReply.replyCn,
        replyPinyin: aiReply.replyPinyin,
        replyVn: aiReply.replyVn,
        correction: aiReply.correction
      };

      setMessages(prev => [...prev, aiMsg]);
      setSuggestedResponses(aiReply.suggestedResponses || []);

      // Merge new vocab items into accumulated list without duplicates
      if (aiReply.vocabList && aiReply.vocabList.length > 0) {
        setAccumulatedVocab(prev => {
          const existingWords = new Set(prev.map(v => v.vocab));
          const newUnique = aiReply.vocabList.filter(v => !existingWords.has(v.vocab));
          return [...prev, ...newUnique];
        });
      }
    } catch (err) {
      console.error('Error getting AI reply:', err);
      showToast('Gợi ý từ AI chưa tải thành công. Vui lòng thử lại!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleTranslationVisibility = (msgId) => {
    setRevealedTranslations(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const handleEndConversation = () => {
    setInConversation(false);
    setMessages([]);
  };

  return (
    <div className="roleplay-page">
      {!inConversation ? (
        /* SETUP SCREEN */
        <div className="roleplay-setup-container">
          {/* Header Banner */}
          <div className="neo-card roleplay-banner-card">
            <div className="roleplay-badge-row">
              <span className="neo-badge roleplay-badge-new">NEW</span>
            </div>
            <h2 className="roleplay-banner-title">Hội thoại nhập vai (對話)</h2>
            <p className="roleplay-banner-subtitle">
              Tự chọn chủ đề & vai — gia sư AI nhập vai trò chuyện, sửa lỗi & gợi ý
            </p>
          </div>

          {/* Configuration Form Card */}
          <div className="neo-card roleplay-form-card">
            {/* Quick suggestions section */}
            <div className="quick-suggestions-section">
              <label className="field-label-bold">
                Gợi ý nhanh <span className="label-hint">(bấm để điền, vẫn sửa được)</span>
              </label>
              <div className="quick-suggestions-grid">
                {QUICK_SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="suggestion-pill-btn"
                    onClick={() => {
                      setTopic(item.topic);
                      setPartnerRole(item.partner);
                    }}
                  >
                    <span>{item.icon}</span> {item.topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Inputs */}
            <div className="roleplay-form-group">
              <label className="field-label-bold">Chủ đề / tình huống <span className="required-star">*</span></label>
              <input
                type="text"
                className="neo-input roleplay-input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ví dụ: Mua quần áo ở cửa hàng..."
              />
            </div>

            <div className="roleplay-form-group">
              <label className="field-label-bold">Bạn nói chuyện với ai? <span className="required-star">*</span></label>
              <input
                type="text"
                className="neo-input roleplay-input"
                value={partnerRole}
                onChange={(e) => setPartnerRole(e.target.value)}
                placeholder="Ví dụ: Nhân viên bán hàng..."
              />
            </div>

            {/* Level Selector */}
            <div className="roleplay-form-group">
              <label className="field-label-bold">Trình độ</label>
              <div className="level-options-group">
                {[
                  { id: 'Sơ cấp (Band A)', label: 'Sơ cấp', badge: '初級' },
                  { id: 'Trung cấp (Band B)', label: 'Trung cấp', badge: '中級' },
                  { id: 'Cao cấp (Band C)', label: 'Cao cấp', badge: '高級' }
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    className={`level-select-btn ${level === lvl.id ? 'active' : ''}`}
                    onClick={() => setLevel(lvl.id)}
                  >
                    <span className="level-btn-badge">{lvl.badge}</span>
                    <span>{lvl.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              type="button"
              className="neo-btn neo-btn-primary start-roleplay-btn"
              onClick={handleStartConversation}
            >
              💬 Bắt đầu trò chuyện
            </button>
            <p className="form-footer-tip">
              ✨ Gia sư AI sẽ chào mở màn theo vai bạn chọn.
            </p>
          </div>
        </div>
      ) : (
        /* CHAT & PRACTICE SCREEN */
        <div className="roleplay-chat-layout">
          {/* LEFT: Main Chat Box */}
          <div className="neo-card roleplay-chat-box">
            {/* Header */}
            <div className="chat-box-header">
              <div className="chat-partner-info">
                <div className="partner-avatar">🛍️</div>
                <div>
                  <h4 className="partner-name">{partnerRole}</h4>
                  <span className="partner-status">{partnerRole} - đang nhập vai</span>
                </div>
              </div>
              <button
                className="neo-btn end-chat-btn"
                onClick={handleEndConversation}
              >
                Kết thúc
              </button>
            </div>

            {/* Messages Body */}
            <div className="chat-messages-body">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-msg-row ${msg.sender === 'user' ? 'user-row' : 'ai-row'}`}
                >
                  {msg.sender === 'ai' ? (
                    <div className="ai-msg-container">
                      <div className="ai-avatar">🛍️</div>
                      <div className="ai-bubble-wrapper">
                        {/* Grammar correction box if present */}
                        {showCorrections && msg.correction && (
                          <div className="grammar-correction-alert">
                            <span className="correction-icon">💡</span>
                            <div>
                              <strong>Nhận xét & Sửa lỗi:</strong> {msg.correction}
                            </div>
                          </div>
                        )}

                        {/* Main AI response bubble */}
                        <div className="neo-card ai-msg-bubble">
                          <h3 className="ai-chinese-text">{msg.replyCn}</h3>
                          
                          {showPinyin && msg.replyPinyin && (
                            <div className="ai-pinyin-text">{msg.replyPinyin}</div>
                          )}

                          <div className="ai-bubble-actions">
                            <AudioButton onClick={() => playAudio(msg.replyCn)} />
                            
                            {showTranslation && (
                              <button
                                className="neo-btn translation-toggle-btn"
                                onClick={() => toggleTranslationVisibility(msg.id)}
                              >
                                🌐 {revealedTranslations[msg.id] ? 'Ẩn dịch' : 'Dịch tiếng Việt'}
                              </button>
                            )}
                          </div>

                          {showTranslation && revealedTranslations[msg.id] && msg.replyVn && (
                            <div className="ai-vietnamese-translation">
                              🇻🇳 {msg.replyVn}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* User message bubble */
                    <div className="neo-card user-msg-bubble">
                      <p className="user-text-content">{msg.text}</p>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="chat-msg-row ai-row">
                  <div className="ai-avatar">🛍️</div>
                  <div className="neo-card ai-msg-bubble loading-bubble">
                    <span className="typing-indicator">💬 {partnerRole} đang suy nghĩ câu trả lời...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested quick responses if toggle is ON */}
            {showSuggestions && suggestedResponses.length > 0 && !loading && (
              <div className="suggested-responses-container">
                <span className="suggested-label">💡 Gợi ý trả lời (bấm để dùng):</span>
                <div className="suggested-pills-row">
                  {suggestedResponses.map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      className="suggested-pill"
                      onClick={() => handleSendMessage(sug)}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Input Area */}
            <div className="chat-input-area">
              <button
                className={`neo-btn voice-mic-btn ${isRecording ? 'recording' : ''}`}
                onClick={toggleVoiceRecording}
                title={isRecording ? 'Đang thu âm... Bấm để dừng' : 'Bấm để nói tiếng Trung'}
              >
                {isRecording ? '🔴' : '🎙️'}
              </button>
              <input
                type="text"
                className="neo-input chat-text-input"
                placeholder="Gõ câu trả lời bằng tiếng Trung/Phồn thể..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                disabled={loading}
              />
              <button
                className="neo-btn neo-btn-primary send-msg-btn"
                onClick={() => handleSendMessage()}
                disabled={loading || !inputMessage.trim()}
              >
                🚀
              </button>
            </div>
          </div>

          {/* RIGHT: Support & Vocabulary Panel */}
          <div className="roleplay-sidebar-panel">
            {/* TÌNH HUỐNG CARD */}
            <div className="neo-card sidebar-widget-card">
              <h4 className="widget-title">TÌNH HUỐNG</h4>
              <div className="topic-summary-box">
                <span className="topic-summary-icon">🛍️</span>
                <div className="topic-summary-text">{topic}</div>
              </div>
            </div>

            {/* HỖ TRỢ TOGGLES CARD */}
            <div className="neo-card sidebar-widget-card">
              <h4 className="widget-title">HỖ TRỢ</h4>
              <div className="toggles-list">
                <div className="toggle-row">
                  <span>Phiên âm (Pinyin)</span>
                  <label className="neo-switch">
                    <input
                      type="checkbox"
                      checked={showPinyin}
                      onChange={(e) => setShowPinyin(e.target.checked)}
                    />
                    <span className="switch-slider"></span>
                  </label>
                </div>

                <div className="toggle-row">
                  <span>Gợi ý trả lời</span>
                  <label className="neo-switch">
                    <input
                      type="checkbox"
                      checked={showSuggestions}
                      onChange={(e) => setShowSuggestions(e.target.checked)}
                    />
                    <span className="switch-slider"></span>
                  </label>
                </div>

                <div className="toggle-row">
                  <span>Dịch tiếng Việt</span>
                  <label className="neo-switch">
                    <input
                      type="checkbox"
                      checked={showTranslation}
                      onChange={(e) => setShowTranslation(e.target.checked)}
                    />
                    <span className="switch-slider"></span>
                  </label>
                </div>

                <div className="toggle-row">
                  <span>Sửa lỗi ngữ pháp</span>
                  <label className="neo-switch">
                    <input
                      type="checkbox"
                      checked={showCorrections}
                      onChange={(e) => setShowCorrections(e.target.checked)}
                    />
                    <span className="switch-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* TỪ VỰNG TRONG BÀI CARD */}
            <div className="neo-card sidebar-widget-card">
              <h4 className="widget-title">
                TỪ VỰNG TRONG BÀI
                {accumulatedVocab.length > 0 && (
                  <span className="vocab-count-badge">{accumulatedVocab.length}</span>
                )}
              </h4>
              {accumulatedVocab.length === 0 ? (
                <p className="empty-vocab-desc">Chưa có từ vựng nào.</p>
              ) : (
                <div className="accumulated-vocab-list">
                  {accumulatedVocab.map((vItem, vIdx) => (
                    <div key={vIdx} className="vocab-mini-item">
                      <div className="vocab-mini-header">
                        <span className="vocab-mini-word">{vItem.vocab}</span>
                        <span className="vocab-mini-pinyin">{vItem.pinyin}</span>
                      </div>
                      <div className="vocab-mini-meaning">{vItem.meaning}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIConversation;
