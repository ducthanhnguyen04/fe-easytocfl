import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { textbooks, bookLessons } from '../../data/db';
import beUrl from '../../api-url/api-backend';
import './Vocabulary.css';
import axios from 'axios';
import { useAuth } from '../../context/authContext';
import { showToast } from '../../utils/toast';
import { cacheService } from '../../utils/cacheService';

import FlashcardMode from './components/FlashcardMode';
import QuizMode from './components/QuizMode';
import TypingMode from './components/TypingMode';
import DictationMode from './components/DictationMode';
import VocabList from './components/VocabList';
import ConversationMode from './components/ConversationMode';

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
  
  const [lessonSubmittedMap, setLessonSubmittedMap] = useState({});
  const lessonStartTimeRef = useRef(Date.now());
  useEffect(() => {
    const fecthLevel = async () => {
      try {
        let data = cacheService.get('levels_all');
        if (!data) {
          const response = await axios.get(`${beUrl}/levels/get-all`);
          data = response.data.levels || [];
          cacheService.set('levels_all', data);
        }
        const sorted = [...data].sort((a, b) => Number(a.id) - Number(b.id));
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

  const currentBook = useMemo(() => {
    if (!bookId) return null;
    return levels.find(b => b.slug === bookId || String(b.id) === String(bookId)) ||
           textbooks.find(b => b.slug === bookId || String(b.id) === String(bookId));
  }, [levels, bookId]);

  const selectedBook = currentBook ? currentBook.id : (bookId && !isNaN(bookId) ? parseInt(bookId) : null);

  const lessonsList = useMemo(() => {
    if (!currentBook) return [];
    const list = Array.isArray(currentBook.lessons) ? currentBook.lessons : (bookLessons[selectedBook] || []);
    return [...list].sort((a, b) => Number(a.id) - Number(b.id));
  }, [currentBook, selectedBook]);

  const currentLessonObj = useMemo(() => {
    if (!lessonId) return null;
    return lessonsList.find(l => l.slug === lessonId || String(l.id) === String(lessonId));
  }, [lessonsList, lessonId]);

  const selectedLesson = currentLessonObj ? currentLessonObj.id : (lessonId && !isNaN(lessonId) ? parseInt(lessonId) : null);

  const { user } = useAuth();
  const hasPremiumAccess = useMemo(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.isPremium === true ||
      user.isPremium === 1 ||
      user.isPremium === '1' ||
      String(user.isPremium).toLowerCase() === 'true';
  }, [user]);

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

  const [vocabMode, setVocabMode] = useState('flashcard'); // 'flashcard', 'quiz', 'typing', 'dictation'
  const [localLessonVocabs, setLocalLessonVocabs] = useState([]);
  const [vocabLoading, setVocabLoading] = useState(false);
  const [examplesList, setExamplesList] = useState([]);

  useEffect(() => {
    axios.get(`${beUrl}/examples/get-all`)
      .then(res => {
        setExamplesList(res.data.examples || []);
      })
      .catch(err => {
        console.error("Error fetching examples in Vocabulary page:", err);
      });
  }, []);

  // Review states
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewSelecting, setReviewSelecting] = useState(false);
  const [selectedLessonIdsForReview, setSelectedLessonIdsForReview] = useState([]);

  useEffect(() => {
    setIsReviewMode(false);
    setReviewSelecting(false);
    setSelectedLessonIdsForReview([]);
  }, [bookId, lessonId]);

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

  // Reset start time when selected lesson changes
  useEffect(() => {
    lessonStartTimeRef.current = Date.now();
  }, [selectedLesson]);

  // Automatically submit lesson completion to backend
  useEffect(() => {
    if (selectedLesson && currentLessonWords.length > 0) {
      const allLearned = currentLessonWords.every(v => v.learned);
      const alreadySubmitted = lessonSubmittedMap[selectedLesson];

      if (allLearned && !alreadySubmitted) {
        setLessonSubmittedMap(prev => ({ ...prev, [selectedLesson]: true }));
        const timeSpent = Math.round((Date.now() - lessonStartTimeRef.current) / 1000);

        axios.post(`${beUrl}/score/lesson`, {
          lessonId: selectedLesson,
          timeSpent: timeSpent
        }, { withCredentials: true })
        .then(res => {
          const points = res.data.data.pointsEarned;
          showToast(`🎉 Chúc mừng! Bạn đã học hết từ vựng của bài học này. Cộng +${points} XP!`, 'success');
        })
        .catch(err => {
          console.error("Gửi điểm hoàn thành bài học thất bại:", err);
          // Don't show toast error if user already completed this lesson (to avoid noisy duplicate toasts)
          if (err.response?.status !== 400 || !err.response?.data?.message?.includes('đã nhận')) {
            showToast(err.response?.data?.message || 'Không thể gửi điểm bài học.', 'error');
          }
        });
      }
    }
  }, [currentLessonWords, selectedLesson, lessonSubmittedMap]);

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
        playAudio(vocabObj.word || vocabObj.example || wordOrObj);
      });
    } else {
      playAudio(vocabObj ? (vocabObj.word || vocabObj.example) : wordOrObj);
    }
  };

  const handleStartReview = async () => {
    if (!user) {
      showToast("Vui lòng đăng nhập để sử dụng chức năng tổng ôn tập!", "warning");
      navigate('/settings');
      return;
    }
    if (selectedLessonIdsForReview.length === 0) return;
    setVocabLoading(true);
    setIsReviewMode(true);
    setReviewSelecting(false);

    try {
      const requests = selectedLessonIdsForReview.map(lId =>
        axios.get(`${beUrl}/vocabularies/get-vocabulary-by-lesson-id`, {
          params: { lessonId: lId },
          withCredentials: true
        })
      );

      const responses = await Promise.all(requests);
      const allVocabs = [];
      responses.forEach(res => {
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
        allVocabs.push(...mapped);
      });

      const sortedMapped = allVocabs.sort((a, b) => Number(a.id) - Number(b.id));
      setLocalLessonVocabs(sortedMapped);
    } catch (err) {
      console.error('Error fetching review vocabularies:', err);
      showToast('Có lỗi xảy ra khi tải dữ liệu ôn tập.', 'error');
      setLocalLessonVocabs([]);
      setIsReviewMode(false);
    } finally {
      setVocabLoading(false);
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
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                className="neo-btn neo-btn-primary"
                style={{ backgroundColor: 'var(--color-accent)', padding: '10px 16px', fontSize: '13px' }}
                onClick={() => {
                  navigate('/vocab/writing-practice');
                }}
              >
                📝 Tạo file viết từ vựng
              </button>
              <div className="neo-badge" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
                {vocabWords.filter(v => v.learned).length} / {vocabWords.length} Từ Đã Học
              </div>
            </div>
          </div>

          <div className="books-grid">
            {levels.map((book) => {
              return (
                <div
                  key={book.id}
                  className="neo-card book-select-card"
                  onClick={() => {
                    navigate(`/vocab/${book.slug || book.id}`);
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
                      <span>📖 {book?.lessons?.length || 0} bài học</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (selectedLesson === null && !isReviewMode) ? (
        // LESSONS LISTING VIEW FOR SELECTED BOOK
        <div>
          <div className="back-btn-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="neo-btn" onClick={() => navigate('/vocab')}>
              ← Danh sách sách
            </button>

            {!reviewSelecting ? (
              <button
                className="neo-btn"
                style={{ backgroundColor: 'var(--color-yellow-light)', fontWeight: 'bold' }}
                onClick={() => {
                  if (!user) {
                    showToast("Vui lòng đăng nhập để sử dụng chức năng tổng ôn tập!", "warning");
                    navigate('/settings');
                    return;
                  }
                  setReviewSelecting(true);
                  setSelectedLessonIdsForReview([]);
                }}
              >
                🔁 Tổng ôn tập
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="neo-btn neo-btn-primary"
                  onClick={handleStartReview}
                  disabled={selectedLessonIdsForReview.length === 0}
                >
                  🚀 Bắt đầu ôn tập ({selectedLessonIdsForReview.length} bài)
                </button>
                <button
                  className="neo-btn"
                  style={{ backgroundColor: '#e2e8f0' }}
                  onClick={() => {
                    setReviewSelecting(false);
                    setSelectedLessonIdsForReview([]);
                  }}
                >
                  Hủy
                </button>
              </div>
            )}
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
                    const isSelected = selectedLessonIdsForReview.includes(lesson.id);

                    return (
                      <div
                        key={lesson.id}
                        className={`neo-card lesson-select-card ${isSelected ? 'selected-for-review' : ''}`}
                        style={isSelected ? { border: '2.5px solid var(--color-primary)', backgroundColor: 'var(--color-primary-light)' } : {}}
                        onClick={() => {
                          if (isPremium && !hasPremiumAccess) {
                            showToast("Bài học này chỉ dành cho tài khoản Premium. Vui lòng nâng cấp tài khoản!", "warning");
                            if (!reviewSelecting) {
                              navigate('/settings');
                            }
                          } else {
                            if (reviewSelecting) {
                              if (isSelected) {
                                setSelectedLessonIdsForReview(prev => prev.filter(id => id !== lesson.id));
                              } else {
                                setSelectedLessonIdsForReview(prev => [...prev, lesson.id]);
                              }
                            } else {
                              navigate(`/vocab/${currentBook?.slug || bookId}/${lesson.slug || lesson.id}`);
                            }
                          }
                        }}
                      >
                        <div className="lesson-select-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <div>
                            <h4 className="lesson-select-title">
                              {displayTitle} {isPremium && <span className="premium-badge">👑 Premium</span>}
                            </h4>
                            {displayTranslation && <span className="lesson-select-translation">{displayTranslation}</span>}
                            <div className="lesson-select-meta">
                              <span>📖 {lessonWords.length} từ vựng</span>
                              <span>✓ Đã thuộc {learnedInLesson}/{lessonWords.length}</span>
                            </div>
                          </div>
                          {reviewSelecting && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              readOnly
                              style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                            />
                          )}
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
        // VOCABULARY DRILL-DOWN VIEW FOR SELECTED LESSON OR REVIEW MODE
        <div>
          <div className="back-btn-container">
            <button
              className="neo-btn"
              onClick={() => {
                if (isReviewMode) {
                  setIsReviewMode(false);
                  setLocalLessonVocabs([]);
                  setReviewSelecting(true);
                } else {
                  navigate(`/vocab/${currentBook?.slug || bookId}`);
                }
              }}
            >
              ← Quay lại danh sách bài
            </button>
          </div>

          {isLessonPremium && !hasPremiumAccess && !isReviewMode ? (
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
                
                let lessonTitleText = '';
                let lessonSubTitleText = '';
                
                if (isReviewMode) {
                  const names = selectedLessonIdsForReview.map(id => {
                    const l = lessonsList.find(lesson => lesson.id === id);
                    return l ? l.lessonName || `Bài ${id}` : `Bài ${id}`;
                  }).join(', ');
                  lessonTitleText = 'Tổng ôn tập từ vựng';
                  lessonSubTitleText = `Các bài ôn tập: ${names}`;
                } else {
                  lessonTitleText = currentLessonObj ? (currentLessonObj.lessonName ? `${currentLessonObj.lessonName}: ${currentLessonObj.title}` : `Bài ${selectedLesson}: ${currentLessonObj.title}`) : `Bài ${selectedLesson}`;
                  lessonSubTitleText = currentLessonObj?.trans || '';
                }

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
                      examplesList={examplesList}
                    />
                  );
                }

                if (vocabMode === 'conversation') {
                  return (
                    <ConversationMode
                      bookId={selectedBook}
                      lessonId={selectedLesson}
                      currentLessonWords={currentLessonWords}
                      lessonTitle={currentLessonObj ? currentLessonObj.title : ""}
                      beUrl={beUrl}
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
                        className={`neo-card mode-card ${vocabMode === 'conversation' ? 'active-conversation' : ''}`}
                        onClick={() => setVocabMode('conversation')}
                      >
                        <div className="mode-card-title">💬 Bài khóa</div>
                        <div className="mode-card-status">Hội thoại</div>
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
                        className={`neo-card mode-card ${vocabMode === 'dictation' ? 'active-dictation' : ''}`}
                        onClick={() => setVocabMode('dictation')}
                      >
                        <div className="mode-card-title">🎧 Nghe chép</div>
                        <div className="mode-card-status">Nghe nói</div>
                      </div>

                      <div
                        className="neo-card mode-card"
                        style={{ borderColor: 'var(--color-accent)' }}
                        onClick={() => {
                          const lessonTitle = isReviewMode
                            ? 'Luyện viết - Tổng ôn tập'
                            : (currentLessonObj
                                ? `Luyện viết - ${currentLessonObj.lessonName ? `${currentLessonObj.lessonName}: ${currentLessonObj.title}` : `Bài ${selectedLesson}: ${currentLessonObj.title}`}`
                                : `Luyện viết - Bài ${selectedLesson}`);
                          navigate('/vocab/writing-practice', {
                            state: {
                              initialVocabs: currentLessonWords,
                              lessonTitle: lessonTitle
                            }
                          });
                        }}
                      >
                        <div className="mode-card-title">✍️ In tập viết</div>
                        <div className="mode-card-status">Ô chữ Mắt Cáo</div>
                      </div>
                    </div>
                  </div>

                  {!isReviewMode && (
                    <VocabList
                      currentLessonWords={currentLessonWords}
                      vocabWords={vocabWords}
                      toggleVocabLearned={toggleVocabLearned}
                      handlePlayAudio={handlePlayAudio}
                    />
                  )}
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
