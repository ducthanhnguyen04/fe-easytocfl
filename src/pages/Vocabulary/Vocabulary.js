import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { textbooks, bookLessons } from '../../data/db';
import beUrl from '../../api-url/api-backend';
import './Vocabulary.css';
import axios from 'axios';
import { useAuth } from '../../context/authContext';
import { showToast } from '../../utils/toast';

import FlashcardMode from './components/FlashcardMode';
import QuizMode from './components/QuizMode';
import TypingMode from './components/TypingMode';
import ReadingMode from './components/ReadingMode';
import DictationMode from './components/DictationMode';
import VocabList from './components/VocabList';

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
    };
    fecthLevel();
  }, []);
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

  // Chỉ hiển thị từ vựng từ DB
  const currentLessonWords = useMemo(() => {
    return localLessonVocabs.map(dbVocab => {
      const propMatch = vocabWords.find(v => v.word === dbVocab.word);
      return propMatch ? { ...dbVocab, learned: propMatch.learned } : dbVocab;
    });
  }, [localLessonVocabs, vocabWords]);

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
              return (
                <div
                  key={book.id}
                  className="neo-card book-select-card"
                  onClick={() => {
                    navigate(`/vocab/${book.id}`);
                  }}
                >
                  <div className="book-image">
                    <img src={book.image} alt={book.levelName} className="book-cover-img" />
                  </div>
                  <div className="book-select-info">
                    <h4 className="book-select-title">{book.levelName}</h4>
                    <span className="book-select-level">{book.level}</span>
                    <p className="book-select-desc">Giáo trình dành cho du học sinh quốc tế tại Đài Loan level - {book.level}</p>
                    <div className="book-select-stats">
                      <span>📖 {book?.lessons.length} bài học</span>
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
                    const displayTitle = lesson.lessonName ? `${lesson.lessonName}: ${lesson.title}` : lesson.title;
                    const displayTranslation = lesson.trans || '';
                    const isPremium = lesson.isPremium || lesson.premium;

                    return (
                      <div
                        key={lesson.id}
                        className="neo-card lesson-select-card"
                        onClick={() => {
                          if (isPremium && !hasPremiumAccess) {
                            showToast("Bài học này chỉ dành cho tài khoản Premium. Vui lòng nâng cấp tài khoản!", "warning");
                            navigate('/settings');
                          } else {
                            navigate(`/vocab/${selectedBook}/${lesson.id}`);
                          }
                        }}
                      >
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
                  return (
                    <FlashcardMode
                      currentLessonWords={currentLessonWords}
                      vocabWords={vocabWords}
                      toggleVocabLearned={toggleVocabLearned}
                      handlePlayAudio={handlePlayAudio}
                    />
                  );
                }

                if (vocabMode === 'quiz') {
                  return (
                    <QuizMode
                      currentLessonWords={currentLessonWords}
                      vocabWords={vocabWords}
                    />
                  );
                }

                if (vocabMode === 'typing') {
                  return (
                    <TypingMode
                      currentLessonWords={currentLessonWords}
                    />
                  );
                }

                if (vocabMode === 'reading') {
                  return (
                    <ReadingMode
                      currentLessonWords={currentLessonWords}
                      vocabWords={vocabWords}
                    />
                  );
                }

                if (vocabMode === 'dictation') {
                  return (
                    <DictationMode
                      currentLessonWords={currentLessonWords}
                      handlePlayAudio={handlePlayAudio}
                    />
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

                  <VocabList
                    currentLessonWords={currentLessonWords}
                    vocabWords={vocabWords}
                    toggleVocabLearned={toggleVocabLearned}
                    handlePlayAudio={handlePlayAudio}
                  />
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
