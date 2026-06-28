import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { textbooks, bookLessons } from '../../data/db';
import beUrl from '../../api-url/api-backend';
import './Vocabulary.css';
import axios from 'axios';
import { useAuth } from '../../context/authContext';

const getBookColor = (bookId) => {
  const colors = {
    1: '#e55b44',
    2: '#2a9d8f',
    3: '#f4a261',
    4: '#3d84b8',
    5: '#9b5de5',
    6: '#f15bb5'
  };
  return colors[bookId] || '#4f46e5';
};

const Vocabulary = ({ vocabWords, toggleVocabLearned, playAudio }) => {
  const { bookId, lessonId } = useParams();
  const [levels, setLevels] = useState([]);
  useEffect(() => {
    const fecthLevel = async () => {
      try {
        const response = await axios.get(`${beUrl}/levels/get-all`);
        const sorted = (response.data.levels || []).sort((a, b) => Number(a.id) - Number(b.id));
        setLevels(sorted);
      } catch (err) {
        console.error("Error fetching levels in Vocabulary page:", err);
        setLevels([]);
      }
    }
    fecthLevel();
  }, [])
  console.log("level:", levels);
  const navigate = useNavigate();

  const selectedBook = bookId ? parseInt(bookId) : null;
  const selectedLesson = lessonId ? parseInt(lessonId) : null;

  const { user } = useAuth();
  const hasPremiumAccess = useMemo(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.isPremium === true || 
           user.isPremium === 1 || 
           user.isPremium === '1' || 
           String(user.isPremium).toLowerCase() === 'true';
  }, [user]);

  const currentBook = useMemo(() => {
    return levels.find(b => Number(b.id) === Number(selectedBook)) || textbooks.find(b => Number(b.id) === Number(selectedBook));
  }, [levels, selectedBook]);

  const lessonsList = useMemo(() => {
    const list = Array.isArray(currentBook?.lessons) ? currentBook.lessons : (bookLessons[selectedBook] || []);
    return [...list].sort((a, b) => Number(a.id) - Number(b.id));
  }, [currentBook, selectedBook]);

  const currentLessonObj = useMemo(() => {
    return lessonsList.find(l => Number(l.id) === Number(selectedLesson));
  }, [lessonsList, selectedLesson]);

  const isLessonPremium = useMemo(() => {
    if (!currentLessonObj) return false;
    const premiumVal = currentLessonObj.isPremium !== undefined ? currentLessonObj.isPremium : currentLessonObj.premium;
    return premiumVal === true || 
           premiumVal === 1 || 
           premiumVal === '1' || 
           String(premiumVal).toLowerCase() === 'true';
  }, [currentLessonObj]);

  console.log("=== Debug Premium ===");
  console.log("User:", user);
  console.log("hasPremiumAccess:", hasPremiumAccess);
  console.log("currentLessonObj:", currentLessonObj);
  console.log("isLessonPremium:", isLessonPremium);

  const [vocabMode, setVocabMode] = useState('flashcard'); // 'flashcard', 'quiz', 'typing', 'reading', 'dictation'
  const [searchQuery, setSearchQuery] = useState('');
  const [localLessonVocabs, setLocalLessonVocabs] = useState([]);
  const [vocabLoading, setVocabLoading] = useState(false);

  // Fetch vocabularies for current lesson directly from backend
  useEffect(() => {
    if (!selectedLesson) {
      setLocalLessonVocabs([]);
      return;
    }
    setVocabLoading(true);
    axios.get(`${beUrl}/vocabularies/get-vocabulary-by-lesson-id`, {
      params: { lessonId: selectedLesson },
      withCredentials: true
    }).then(res => {
      const dbVocabs = res.data.vocabularies || [];
      const mapped = dbVocabs.map(v => ({
        word: v.vocabulary,
        pinyin: v.pinyin,
        trans: v.meaning,
        englishMeaning: v.englishMeaning,
        learned: false,
        tag: 'Học tập',
        bookId: selectedBook,
        lessonId: v.lessonId,
        id: v.id,
        audioUrl: v.audioUrl
      }));
      const sortedMapped = mapped.sort((a, b) => Number(a.id) - Number(b.id));
      setLocalLessonVocabs(sortedMapped);
    }).catch(err => {
      console.error('Error fetching lesson vocabularies:', err);
      setLocalLessonVocabs([]);
    }).finally(() => setVocabLoading(false));
  }, [selectedLesson, selectedBook]);

  // Flashcard states
  const [flashIndex, setFlashIndex] = useState(0);
  const [flashFlipped, setFlashFlipped] = useState(false);
  const [flashTranslationMode, setFlashTranslationMode] = useState('ZH-VI'); // 'ZH-VI' or 'VI-ZH'
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  // Quiz states
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState(null);
  const [quizChecked, setQuizChecked] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
  const [quizOptions, setQuizOptions] = useState([]);

  // Typing states
  const [typingIndex, setTypingIndex] = useState(0);
  const [typingInput, setTypingInput] = useState('');
  const [typingFeedback, setTypingFeedback] = useState(null);
  const [typingScore, setTypingScore] = useState({ correct: 0, total: 0 });

  // Reading states
  const [readingIndex, setReadingIndex] = useState(0);
  const [readingSelectedOption, setReadingSelectedOption] = useState(null);
  const [readingChecked, setReadingChecked] = useState(false);
  const [readingScore, setReadingScore] = useState({ correct: 0, total: 0 });
  const [readingOptions, setReadingOptions] = useState([]);

  // Dictation states
  const [dictationIndex, setDictationIndex] = useState(0);
  const [dictationInput, setDictationInput] = useState('');
  const [dictationFeedback, setDictationFeedback] = useState(null);
  const [dictationScore, setDictationScore] = useState({ correct: 0, total: 0 });
  const [showDictationHint, setShowDictationHint] = useState(false);

  // Chỉ hiển thị từ vựng từ DB
  const currentLessonWords = useMemo(() => {
    return localLessonVocabs.map(dbVocab => {
      const propMatch = vocabWords.find(v => v.word === dbVocab.word);
      return propMatch ? { ...dbVocab, learned: propMatch.learned } : dbVocab;
    });
  }, [localLessonVocabs, vocabWords]);

  // Generate quiz options on quizIndex change
  useEffect(() => {
    if (vocabMode === 'quiz' && currentLessonWords.length > 0) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizIndex, vocabMode, selectedLesson, selectedBook, vocabWords]);

  // Generate reading options on readingIndex change
  useEffect(() => {
    if (vocabMode === 'reading' && currentLessonWords.length > 0) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readingIndex, vocabMode, selectedLesson, selectedBook, vocabWords]);

  // Reset spelling & dictation states on index change
  useEffect(() => {
    setTypingInput('');
    setTypingFeedback(null);
  }, [typingIndex]);

  useEffect(() => {
    setDictationInput('');
    setDictationFeedback(null);
    setShowDictationHint(false);
  }, [dictationIndex]);

  // General reset when switching mode or lesson
  useEffect(() => {
    setFlashIndex(0);
    setFlashFlipped(false);
    setQuizIndex(0);
    setQuizScore({ correct: 0, total: 0 });
    setTypingIndex(0);
    setTypingScore({ correct: 0, total: 0 });
    setReadingIndex(0);
    setReadingScore({ correct: 0, total: 0 });
    setDictationIndex(0);
    setDictationScore({ correct: 0, total: 0 });
  }, [vocabMode, selectedLesson, selectedBook]);

  const handlePlayAudio = (wordOrObj) => {
    let vocabObj = null;
    if (typeof wordOrObj === 'string') {
      vocabObj = currentLessonWords.find(v => v.word === wordOrObj) || vocabWords.find(v => v.word === wordOrObj);
    } else {
      vocabObj = wordOrObj;
    }

    if (vocabObj && vocabObj.audioUrl) {
      const audioUrl = vocabObj.audioUrl.startsWith('http')
        ? vocabObj.audioUrl
        : `${beUrl}${vocabObj.audioUrl.startsWith('/') ? '' : '/'}${vocabObj.audioUrl}`;
      const audio = new Audio(audioUrl);
      audio.play().catch(err => {
        console.error("Error playing audio from db:", err);
        playAudio(vocabObj.word);
      });
    } else {
      playAudio(vocabObj ? vocabObj.word : wordOrObj);
    }
  };

  // Autoplay vocabulary audio when card changes in Flashcard mode
  useEffect(() => {
    if (vocabMode === 'flashcard' && isAutoPlay && currentLessonWords.length > 0) {
      const activeWord = currentLessonWords[flashIndex % currentLessonWords.length];
      if (activeWord) {
        handlePlayAudio(activeWord);
      }
    }
  }, [flashIndex, vocabMode, isAutoPlay, currentLessonWords]);

  // Autoplay vocabulary audio when dictation word changes
  useEffect(() => {
    if (vocabMode === 'dictation' && currentLessonWords.length > 0) {
      const activeWord = currentLessonWords[dictationIndex % currentLessonWords.length];
      if (activeWord) {
        handlePlayAudio(activeWord);
      }
    }
  }, [dictationIndex, vocabMode, currentLessonWords]);

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
    }
  };

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

  // Keyboard navigation effect
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedBook || !selectedLesson) return;

      const isInputFocused = document.activeElement.tagName === 'INPUT';

      if (vocabMode === 'flashcard') {
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
      } else if (vocabMode === 'quiz') {
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
      } else if (vocabMode === 'typing') {
        if (e.key === 'Enter' && typingFeedback !== null) {
          e.preventDefault();
          setTypingIndex(prev => prev + 1);
        } else if ((e.key === ' ' || e.code === 'Space') && typingFeedback !== null && !isInputFocused) {
          e.preventDefault();
          setTypingIndex(prev => prev + 1);
        }
      } else if (vocabMode === 'reading') {
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
      } else if (vocabMode === 'dictation') {
        if (e.key === 'Enter' && dictationFeedback !== null) {
          e.preventDefault();
          setDictationIndex(prev => prev + 1);
        } else if ((e.key === ' ' || e.code === 'Space') && dictationFeedback !== null && !isInputFocused) {
          e.preventDefault();
          setDictationIndex(prev => prev + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedBook, selectedLesson, vocabMode,
    flashIndex, quizIndex, quizChecked, quizOptions,
    typingIndex, typingFeedback, readingIndex, readingChecked,
    readingOptions, dictationIndex, dictationFeedback, currentLessonWords, isAutoPlay
  ]);

  // Danh sách từ vựng được lọc tìm kiếm
  const filteredVocab = useMemo(() => {
    return currentLessonWords.filter(v => {
      const matchesSearch = v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.pinyin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.trans.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [currentLessonWords, searchQuery]);

  return (
    <div>
      {selectedBook === null ? (
        // TEXTBOOK LISTING VIEW
        <div>
          <div className="page-title-banner">
            <div>
              <h2>Từ vựng tiếng Trung Phồn thể</h2>
              <p>Chọn giáo trình thời đại TOCFL để bắt đầu học từ vựng</p>
            </div>
            <div className="neo-badge" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
              {vocabWords.filter(v => v.learned).length} / {vocabWords.length} Từ Đã Học
            </div>
          </div>

          <div className="books-grid">
            {levels.map((book) => {
              const bookWords = vocabWords.filter(v => parseInt(v.bookId) === parseInt(book.id));
              const learnedCount = bookWords.filter(v => v.learned).length;

              return (
                <div
                  key={book.id}
                  className="neo-card book-select-card"
                  onClick={() => {
                    navigate(`/vocab/${book.id}`);
                  }}
                >
                  <div className="book-cover" style={{ backgroundColor: book.color }}>
                    <span className="book-cover-title-traditional">{book.levelName}</span>
                    <span className="book-cover-vol">{book.level}</span>
                  </div>
                  <div className="book-select-info">
                    <h4 className="book-select-title">{book.levelName}</h4>
                    <span className="book-select-level">{book.level}</span>
                    <p className="book-select-desc">Giáo trình dành cho du học sinh quốc tế tại Đài Loan level - {book.level}</p>
                    <div className="book-select-stats">
                      <span>📖 {book?.lessons.length} bài học</span>
                      {/* <span>🔓 {book.status}</span> */}
                      {/* <span style={{ color: 'var(--color-secondary)' }}>✓ {learnedCount}/{bookWords.length} từ</span> */}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : selectedLesson === null ? (
        // LESSONS LISTING VIEW FOR SELECTED BOOK
        <div>
          <div className="back-btn-container">
            <button className="neo-btn" onClick={() => navigate('/vocab')}>
              ← Danh sách sách
            </button>
          </div>

          {(() => {
            const totalLessons = lessonsList.length;
            const completedLessonsCount = lessonsList.filter(lesson => {
              const lessonWords = vocabWords.filter(v => parseInt(v.bookId) === parseInt(selectedBook) && parseInt(v.lessonId) === parseInt(lesson.id));
              return lessonWords.length > 0 && lessonWords.every(v => v.learned);
            }).length;
            const completionPercentage = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;
            const bookColor = currentBook?.color || getBookColor(selectedBook);

            return (
              <div>
                <div className="page-title-banner" style={{ borderLeft: `10px solid ${bookColor}` }}>
                  <div>
                    <h2>{currentBook?.viTitle || currentBook?.levelName} ({currentBook?.title || currentBook?.level})</h2>
                    <p>{currentBook?.level} — {totalLessons} bài học chính thức</p>
                  </div>
                </div>

                {/* Lesson Progress Card */}
                <div className="neo-card lesson-progress-card">
                  <div className="lesson-progress-header">
                    <span>Tiến độ học</span>
                    <span>{completedLessonsCount} / {totalLessons} bài</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${completionPercentage}%`, backgroundColor: bookColor }}></div>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: 'bold', color: '#666', textAlign: 'right' }}>
                    {completionPercentage}% hoàn thành
                  </div>
                </div>

                {/* Lessons Grid */}
                <div className="lessons-grid">
                  {lessonsList.map((lesson) => {
                    const lessonWords = vocabWords.filter(v => parseInt(v.bookId) === parseInt(selectedBook) && parseInt(v.lessonId) === parseInt(lesson.id));
                    const learnedInLesson = lessonWords.filter(v => v.learned).length;
                    const isCompleted = lessonWords.length > 0 && lessonWords.every(v => v.learned);
                    const displayTitle = lesson.lessonName ? `${lesson.lessonName}: ${lesson.title}` : lesson.title;
                    const displayTranslation = lesson.trans || '';
                    const isPremium = lesson.isPremium || lesson.premium;

                    return (
                      <div
                        key={lesson.id}
                        className="neo-card lesson-select-card"
                        onClick={() => {
                          if (isPremium && !hasPremiumAccess) {
                            alert("Bài học này chỉ dành cho tài khoản Premium. Vui lòng nâng cấp tài khoản!");
                            navigate('/settings');
                          } else {
                            navigate(`/vocab/${selectedBook}/${lesson.id}`);
                          }
                        }}
                      >
                        <div className="lesson-number-box" style={{ backgroundColor: isCompleted ? 'var(--color-secondary)' : bookColor }}>
                          {lesson.id}
                        </div>
                        <div className="lesson-select-info">
                          <h4 className="lesson-select-title">
                            {displayTitle} {isPremium && <span className="premium-badge">👑 Premium</span>}
                          </h4>
                          {displayTranslation && <span className="lesson-select-translation">{displayTranslation}</span>}
                          <div className="lesson-select-meta">
                            <span>📖 {lessonWords.length} từ vựng</span>
                            <span>✓ Đã thuộc {learnedInLesson}/{lessonWords.length}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        // VOCABULARY DRILL-DOWN VIEW FOR SELECTED LESSON
        <div>
          <div className="back-btn-container">
            <button className="neo-btn" onClick={() => navigate(`/vocab/${selectedBook}`)}>
              ← Quay lại danh sách bài
            </button>
          </div>

          {isLessonPremium && !hasPremiumAccess ? (
            <div className="neo-card premium-upgrade-card" style={{ padding: '40px', textAlign: 'center', marginTop: '20px', border: '2px dashed var(--color-primary)' }}>
              <span style={{ fontSize: '50px' }}>👑</span>
              <h3 style={{ margin: '15px 0', color: 'var(--color-primary)' }}>Nâng cấp tài khoản Premium</h3>
              <p style={{ fontSize: '15px', color: '#555', maxWidth: '500px', margin: '0 auto 25px', lineHeight: '1.6' }}>
                Bài học này chứa các nội dung nâng cao chuyên sâu chỉ dành cho tài khoản <strong>Premium</strong>. 
                Vui lòng nâng cấp tài khoản của bạn để truy cập toàn bộ từ vựng, ngữ pháp và bài tập thực hành.
              </p>
              <button className="neo-btn neo-btn-primary" onClick={() => navigate('/settings')}>
                Nâng cấp ngay
              </button>
            </div>
          ) : (
            <>
              {(() => {
                const currentLearned = currentLessonWords.filter(v => v.learned).length;
                const bookColor = currentBook?.color || getBookColor(selectedBook);
                const lessonTitleText = currentLessonObj ? (currentLessonObj.lessonName ? `${currentLessonObj.lessonName}: ${currentLessonObj.title}` : `Bài ${selectedLesson}: ${currentLessonObj.title}`) : `Bài ${selectedLesson}`;
                const lessonSubTitleText = currentLessonObj?.trans || '';

                return (
                  <div className="page-title-banner" style={{ borderLeft: `10px solid ${bookColor}` }}>
                    <div>
                      <h2>{lessonTitleText}</h2>
                      <p>{currentBook?.viTitle || currentBook?.levelName} {lessonSubTitleText ? `— ${lessonSubTitleText}` : ''}</p>
                    </div>
                    <div className="neo-badge" style={{ backgroundColor: bookColor, color: 'white' }}>
                      Đã học: {currentLearned} / {currentLessonWords.length} Từ
                    </div>
                  </div>
                );
              })()}

          {/* Learning workspace based on active mode */}
          {(() => {
            if (vocabLoading) {
              return (
                <div className="neo-card" style={{ padding: '40px', textAlign: 'center', fontWeight: 'bold', margin: '20px 0', color: '#666' }}>
                  🔄 Đang tải từ vựng...
                </div>
              );
            }
            if (currentLessonWords.length === 0) {
              return (
                <div className="neo-card" style={{ padding: '30px', textAlign: 'center', fontWeight: 'bold', margin: '20px 0' }}>
                  Chưa có từ vựng nào
                </div>
              );
            }

            if (vocabMode === 'flashcard') {
              const activeFlashWord = currentLessonWords[flashIndex % currentLessonWords.length];
              return (
                <div className="learning-workspace">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div className="neo-btn-group">
                      <button className="neo-btn active" style={{ padding: '6px 12px', fontSize: '12px' }}>Từ vựng</button>
                      <button className="neo-btn" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => alert(`Ví dụ: ${activeFlashWord?.word} 是一句非常有用的話。`)}>Ví dụ</button>
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
            }

            if (vocabMode === 'quiz') {
              const isCompleted = quizIndex >= currentLessonWords.length;

              if (isCompleted) {
                const correctCount = quizScore.correct;
                const totalCount = currentLessonWords.length;
                const incorrectCount = totalCount - correctCount;
                const scorePercent = Math.round((correctCount / totalCount) * 100);

                return (
                  <div className="learning-workspace">
                    <div className="workspace-card quiz-green" style={{ minHeight: '300px' }}>
                      <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '15px' }}>🎉 Hoàn thành Trắc nghiệm!</div>
                      <div style={{ display: 'flex', gap: '25px', margin: '20px 0', fontSize: '16px', fontWeight: '800' }}>
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
            }

            if (vocabMode === 'typing') {
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
            }

            if (vocabMode === 'reading') {
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
            }

            if (vocabMode === 'dictation') {
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

                    <button className="dictation-speaker-btn" onClick={() => handlePlayAudio(activeDictationWord)}>
                      🔊
                    </button>

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
            }

            return null;
          })()}

          {currentLessonWords.length > 0 && (
            <>
              {/* Mode Selector Panel */}
              <div className="mode-selector-panel">
                <div className="mode-selector-title">Chọn chế độ học</div>
                <div className="modes-grid">
                  <div
                    className={`neo-card mode-card ${vocabMode === 'flashcard' ? 'active-flashcard' : ''}`}
                    onClick={() => setVocabMode('flashcard')}
                  >
                    <div className="mode-card-title">🗂️ Flashcard</div>
                    <div className="mode-card-status">
                      {currentLessonWords.every(v => v.learned) ? 'Đã thuộc' : 'Đang học'}
                    </div>
                  </div>
                  <div
                    className={`neo-card mode-card ${vocabMode === 'quiz' ? 'active-quiz' : ''}`}
                    onClick={() => setVocabMode('quiz')}
                  >
                    <div className="mode-card-title">❓ Trắc nghiệm</div>
                    <div className="mode-card-status">Luyện tập</div>
                  </div>
                  <div
                    className={`neo-card mode-card ${vocabMode === 'typing' ? 'active-typing' : ''}`}
                    onClick={() => setVocabMode('typing')}
                  >
                    <div className="mode-card-title">⌨️ Gõ từ vựng</div>
                    <div className="mode-card-status">Luyện viết</div>
                  </div>
                  <div
                    className={`neo-card mode-card ${vocabMode === 'reading' ? 'active-reading' : ''}`}
                    onClick={() => setVocabMode('reading')}
                  >
                    <div className="mode-card-title">📖 Đọc hiểu</div>
                    <div className="mode-card-status">Ngữ cảnh</div>
                  </div>
                  <div
                    className={`neo-card mode-card ${vocabMode === 'dictation' ? 'active-dictation' : ''}`}
                    onClick={() => setVocabMode('dictation')}
                  >
                    <div className="mode-card-title">🎧 Nghe chép</div>
                    <div className="mode-card-status">Nghe nói</div>
                  </div>
                </div>
              </div>

              {/* Search and filter */}
              <div className="vocab-search-bar">
                <input
                  type="text"
                  className="vocab-input"
                  placeholder="Tìm kiếm từ vựng trong danh sách dưới đây..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="neo-btn neo-btn-primary" onClick={() => setSearchQuery('')}>Xoá lọc</button>
              </div>

              {/* Vocab list grid */}
              <div className="vocab-list">
                {filteredVocab.map((item, index) => {
                  const globalIndex = vocabWords.findIndex(v => v.word === item.word);
                  return (
                    <div key={index} className="neo-card vocab-card">
                      <div className="vocab-symbol">
                        {item.word.substring(0, 1)}
                      </div>
                      <div className="vocab-info">
                        <div className="vocab-headword">
                          <span className="vocab-word">{item.word}</span>
                          <span className="vocab-pinyin">({item.pinyin})</span>
                          <button className="audio-play-btn" onClick={() => handlePlayAudio(item)}>🔊</button>
                        </div>
                        <p className="vocab-translation">{item.trans}</p>
                        {item.englishMeaning && (
                          <p className="vocab-translation-en">{item.englishMeaning}</p>
                        )}
                        <div style={{ marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span className="neo-badge" style={{ fontSize: '9px', padding: '2px 6px', backgroundColor: 'var(--color-blue-light)' }}>
                            {item.tag}
                          </span>
                          <button
                            className={`neo-btn ${item.learned ? 'neo-btn-primary' : ''}`}
                            style={{ padding: '4px 10px', fontSize: '10px', borderRadius: '6px', cursor: 'pointer' }}
                            onClick={() => toggleVocabLearned(globalIndex)}
                          >
                            {item.learned ? '✓ Đã thuộc' : 'Chưa thuộc'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredVocab.length === 0 && (
                  <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px', fontWeight: 'bold' }}>
                    Không tìm thấy từ vựng nào phù hợp trong danh sách này.
                  </div>
                )}
              </div>
            </>
          )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Vocabulary;
