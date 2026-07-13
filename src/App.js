import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AppRoutes from './routes/AppRoutes';
import { quizzes } from './data/db';
import axios from 'axios';
import beUrl from './api-url/api-backend';
import { showToast } from './utils/toast';
import { cacheService } from './utils/cacheService';
import './App.css';

function App() {
  const [vocabWords, setVocabWords] = useState([]);
  const [contactOpen, setContactOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'terracotta');

  const changeTheme = useCallback((themeId) => {
    setTheme(themeId);
    localStorage.setItem('theme', themeId);
    document.body.className = '';
    document.body.classList.add(`theme-${themeId}`);
  }, []);

  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  const toggleDarkMode = () => {
    if (theme === 'dark' || theme === 'cyber') {
      const prevLight = localStorage.getItem('prev-light-theme') || 'terracotta';
      changeTheme(prevLight);
    } else {
      localStorage.setItem('prev-light-theme', theme);
      changeTheme('dark');
    }
  };

  const fetchBackendData = useCallback(async () => {
    try {
      try {
        const versionRes = await axios.get(`${beUrl}/cache-version`);
        const serverVersion = versionRes.data.version;
        const clientVersion = sessionStorage.getItem('client_cache_version');
        if (clientVersion !== String(serverVersion)) {
          cacheService.clear();
          sessionStorage.setItem('client_cache_version', String(serverVersion));
        }
      } catch (versionErr) {
        console.error("Failed to fetch or validate cache version:", versionErr);
      }

      let dbLevels = cacheService.get('levels_all');
      if (!dbLevels) {
        const levelsRes = await axios.get(`${beUrl}/levels/get-all`);
        dbLevels = levelsRes.data.levels || [];
        cacheService.set('levels_all', dbLevels);
      }

      let dbVocabs = cacheService.get('vocabularies_all');
      if (!dbVocabs) {
        const vocabRes = await axios.get(`${beUrl}/vocabularies/get-all`);
        dbVocabs = vocabRes.data.vocabularies || [];
        cacheService.set('vocabularies_all', dbVocabs);
      }

      const mappedVocabs = dbVocabs.map(v => {
        let bookId = null;
        for (const lvl of dbLevels) {
          if (lvl.lessons && lvl.lessons.some(l => l.id === v.lessonId)) {
            bookId = lvl.id;
            break;
          }
        }

        return {
          word: v.vocabulary,
          pinyin: v.pinyin,
          trans: v.meaning,
          englishMeaning: v.englishMeaning,
          learned: false,
          tag: 'Học tập',
          bookId: bookId,
          lessonId: v.lessonId,
          id: v.id,
          audioUrl: v.audioUrl
        };
      });

      setVocabWords(mappedVocabs);
    } catch (err) {
      console.error("Error loading backend vocabularies:", err);
    }
  }, []);

  useEffect(() => {
    fetchBackendData();
  }, [fetchBackendData]);

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
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Attempt to get a Chinese voice, prioritizing Taiwan (zh-TW)
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
      
      // Slower rate for learners
      utterance.rate = 0.85;
      
      window.speechSynthesis.speak(utterance);
    }
    showToast(`🔊 Đang phát âm thanh cho: "${text}"`, 'info');
  };

  const toggleVocabLearned = (index) => {
    const updated = [...vocabWords];
    updated[index].learned = !updated[index].learned;
    setVocabWords(updated);
  };

  const handleWordLearned = () => {
    setDailyWord({ ...dailyWord, learned: true });
    showToast('🎉 Tuyệt vời! Bạn đã thêm chữ "' + dailyWord.word + '" vào kho từ vựng.', 'success');
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
        <Sidebar theme={theme} toggleDarkMode={toggleDarkMode} />

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
            refreshGlobalData={fetchBackendData}
            activeTheme={theme}
            handleThemeChange={changeTheme}
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

        {/* Floating Contact Arc Menu */}
        <div className="contact-fab-wrapper">
          <div className={`contact-fab-socials ${contactOpen ? 'open' : ''}`}>
            <a
              href="https://www.facebook.com/nguyen.duc.thanh.0810/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-arc-item facebook"
              title="Facebook"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/_thahnd_/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-arc-item instagram"
              title="Instagram"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a
              href="https://line.me/ti/p/JhHWg2jK9M?fbclid=IwY2xjawSzhbFleHRuA2FlbQIxMABicmlkETEyc09NejNqbU5lb3NFTXFTc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHpadCLavUF3R8xuCe2X3OtKp0lTi6rPiNpN3GjAsfq97KJBQui8xx6t_7HwB_aem_DfSe09YzrvySUQui8Npn_w"
              target="_blank"
              rel="noopener noreferrer"
              className="social-arc-item line"
              title="Line"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M21.9 8.2c-.3-2-1.7-3.4-3.7-3.7C16.4 4.2 14.2 4 12 4s-4.4.2-6.2.5C3.8 4.8 2.4 6.2 2.1 8.2c-.3 1.8-.4 4-.4 6.2s.1 4.4.4 6.2c.3 2 1.7 3.4 3.7 3.7 1.8.3 4 .4 6.2.4s4.4-.1 6.2-.4c2-.3 3.4-1.7 3.7-3.7.3-1.8.4-4 .4-6.2s-.1-4.4-.4-6.2zm-12 8.7H8.3c-.3 0-.5-.2-.5-.5V10.1c0-.3.2-.5.5-.5h1.6c.3 0 .5.2.5.5v3.9h1.9c.3 0 .5.2.5.5v1c0 .3-.2.4-.5.4zm3.9 0h-1.6c-.3 0-.5-.2-.5-.5V10.1c0-.3.2-.5.5-.5h1.6c.3 0 .5.2.5.5v5.3c0 .3-.2.5-.5.5zm5-1.9c.2.2.3.4.3.7 0 .3-.1.5-.3.7l-1 1c-.2.2-.4.3-.7.3s-.5-.1-.7-.3l-1.9-1.9v1.2c0 .3-.2.5-.5.5h-1.6c-.3 0-.5-.2-.5-.5V10.1c0-.3.2-.5.5-.5h1.6c.3 0 .5.2.5.5v2.8l1.9-1.9c.2-.2.4-.3.7-.3s.5.1.7.3l1 1c.2.2.3.4.3.7 0 .3-.1.5-.3.7l-1 1 1.2 1.2zm2.3 1.9h-3.2c-.3 0-.5-.2-.5-.5V10.1c0-.3.2-.5.5-.5h3.2c.3 0 .5.2.5.5v1c0 .3-.2.5-.5.5h-2.1v.9h1.7c.3 0 .5.2.5.5v.8c0 .3-.2.5-.5.5h-1.7v1.1h2.1c.3 0 .5.2.5.5v1c0 .3-.2.5-.5.5z" />
              </svg>
            </a>
          </div>
          <button
            className={`contact-fab-trigger ${contactOpen ? 'active' : ''}`}
            onClick={() => setContactOpen(!contactOpen)}
            title="Liên hệ với chúng tôi"
          >
            {contactOpen ? '✕' : '💬'}
          </button>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
