import React, { useState, useEffect, useMemo } from 'react';
import AudioButton from '../../components/AudioButton';
import { useParams, useNavigate } from 'react-router-dom';
import { textbooks, bookLessons, grammarPoints } from '../../data/db';
import { getAIEvaluationFeedback } from '../../utils/feedback';
import axios from 'axios';
import beUrl from '../../api-url/api-backend';
import './Grammar.css';
import { useAuth } from '../../context/authContext';
import { showToast } from '../../utils/toast';
import { cacheService } from '../../utils/cacheService';

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

const Grammar = ({ playAudio }) => {
  const { bookId, lessonId, grammarPointId } = useParams();
  const [levels, setLevels] = useState([]);
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
        console.error("Error fetching levels in Grammar page:", err);
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

  const selectedGrammarBook = currentBook ? currentBook.id : (bookId && !isNaN(bookId) ? parseInt(bookId) : null);

  const lessonsList = useMemo(() => {
    if (!currentBook) return [];
    const list = Array.isArray(currentBook.lessons) ? currentBook.lessons : (bookLessons[selectedGrammarBook] || []);
    return [...list].sort((a, b) => Number(a.id) - Number(b.id));
  }, [currentBook, selectedGrammarBook]);

  const currentLesson = useMemo(() => {
    if (!lessonId) return null;
    return lessonsList.find(l => l.slug === lessonId || String(l.id) === String(lessonId));
  }, [lessonsList, lessonId]);

  const selectedGrammarLesson = currentLesson ? currentLesson.id : (lessonId && !isNaN(lessonId) ? parseInt(lessonId) : null);
  const selectedGrammarPointId = grammarPointId ? parseInt(grammarPointId) : null;

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
    if (!currentLesson) return false;
    const premiumVal = currentLesson.isPremium !== undefined ? currentLesson.isPremium : currentLesson.premium;
    return premiumVal === true ||
      premiumVal === 1 ||
      premiumVal === '1' ||
      String(premiumVal).toLowerCase() === 'true';
  }, [currentLesson]);

  const [localLessonGrammars, setLocalLessonGrammars] = useState([]);
  const [grammarLoading, setGrammarLoading] = useState(false);

  useEffect(() => {
    if (!selectedGrammarLesson) {
      setLocalLessonGrammars([]);
      return;
    }
    setGrammarLoading(true);
    axios.get(`${beUrl}/grammars/get-grammar-by-lesson-id`, {
      params: { lessonId: selectedGrammarLesson },
      withCredentials: true
    }).then(res => {
      const dbGrammars = res.data.grammars || [];
      const mapped = dbGrammars.map(v => {
        const staticMatch = grammarPoints.find(g =>
          g.structure.toLowerCase() === v.structure.toLowerCase() ||
          g.title.toLowerCase().includes(v.grammar.toLowerCase())
        );
        return {
          id: v.id,
          bookId: selectedGrammarBook,
          lessonId: v.lessonId,
          title: v.grammar,
          pattern: v.structure,
          structure: v.grammar,
          definition: v.definition || (staticMatch ? staticMatch.definition : ''),
          scope: v.usage || (staticMatch ? staticMatch.scope : ''),
          note: v.note || (staticMatch ? staticMatch.note : ''),
          examples: (v.examples && v.examples.length > 0)
            ? v.examples.map(ex => ({ id: ex.id, cn: ex.example, vn: ex.meaning }))
            : (staticMatch ? staticMatch.examples : []),
          exercises: (v.excersises && v.excersises.length > 0)
            ? v.excersises.map(ex => ({ id: ex.id, cn: ex.title, vn: ex.meaning }))
            : (staticMatch ? staticMatch.exercises : [])
        };
      });
      const sortedMapped = mapped.sort((a, b) => Number(a.id) - Number(b.id));
      setLocalLessonGrammars(sortedMapped);
    }).catch(err => {
      console.error('Error fetching lesson grammars:', err);
      setLocalLessonGrammars([]);
    }).finally(() => setGrammarLoading(false));
  }, [selectedGrammarLesson, selectedGrammarBook]);

  const [grammarExerciseType, setGrammarExerciseType] = useState('zhToVi'); // 'zhToVi' or 'viToZh'
  const [grammarExercisesInput, setGrammarExercisesInput] = useState({});
  const [grammarExercisesFeedback, setGrammarExercisesFeedback] = useState({});

  // Reset exercises states when point changes
  useEffect(() => {
    setGrammarExercisesInput({});
    setGrammarExercisesFeedback({});
  }, [selectedGrammarPointId, grammarExerciseType]);

  return (
    <div>
      {/* Case 1: Select Textbook */}
      {selectedGrammarBook === null && (
        <div>
          <div className="page-title-banner">
            <div>
              <h2>Giáo trình Ngữ pháp</h2>
              <p>Chọn giáo trình thời đại để học cấu trúc ngữ pháp tương ứng</p>
            </div>
            <div className="neo-badge" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
              TOCFL Band A - C
            </div>
          </div>

          <div className="books-grid">
            {levels.map((book) => (
              <div
                key={book.id}
                className="neo-card book-select-card"
                onClick={() => {
                  navigate(`/grammar/${book.slug || book.id}`);
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
            ))}
          </div>
        </div>
      )}

      {/* Case 2: Select Lesson */}
      {selectedGrammarBook !== null && selectedGrammarLesson === null && (() => {
        const totalLessons = lessonsList.length;
        const bookColor = currentBook?.color || getBookColor(selectedGrammarBook);
        return (
          <div>
            <div className="back-btn-container">
              <button className="neo-btn" onClick={() => navigate('/grammar')}>
                ← Danh sách sách
              </button>
            </div>

            <div className="page-title-banner" style={{ borderLeft: `10px solid ${bookColor}` }}>
              <div>
                <h2>{currentBook?.viTitle || currentBook?.levelName} ({currentBook?.title || currentBook?.level})</h2>
                <p>{currentBook?.level} — {totalLessons} bài học chính thức</p>
              </div>
            </div>

            <div className="lessons-grid">
              {lessonsList.map((lesson) => {
                const lessonGrammarPoints = grammarPoints.filter(g => g.bookId === selectedGrammarBook && g.lessonId === lesson.id);
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
                        navigate(`/grammar/${currentBook?.slug || bookId}/${lesson.slug || lesson.id}`);
                      }
                    }}
                  >
                    <div className="lesson-select-info">
                      <h4 className="lesson-select-title">
                        {displayTitle} {isPremium && <span className="premium-badge">👑 Premium</span>}
                      </h4>
                      {displayTranslation && <span className="lesson-select-translation">{displayTranslation}</span>}
                      <div className="lesson-select-meta">
                        <span>📖 {lessonGrammarPoints.length} cấu trúc ngữ pháp</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Premium Check for Lesson Detail Views */}
      {selectedGrammarBook !== null && selectedGrammarLesson !== null && isLessonPremium && !hasPremiumAccess && (
        <div>
          <div style={{ marginBottom: '15px' }}>
            <button
              className="neo-btn"
              onClick={() => navigate(`/grammar/${currentBook?.slug || bookId}`)}
            >
              ← Danh sách bài học
            </button>
          </div>

          <div className="neo-card premium-upgrade-card" style={{ padding: '40px', textAlign: 'center', marginTop: '20px', border: '2px dashed var(--color-primary)' }}>
            <span style={{ fontSize: '50px' }}>👑</span>
            <h3 style={{ margin: '15px 0', color: 'var(--color-primary)' }}>Nâng cấp tài khoản Premium</h3>
            <p style={{ fontSize: '15px', color: '#555', maxWidth: '500px', margin: '0 auto 25px', lineHeight: '1.6' }}>
              Bài học này chứa các cấu trúc ngữ pháp nâng cao chuyên sâu chỉ dành cho tài khoản <strong>Premium</strong>.
              Vui lòng nâng cấp tài khoản của bạn để truy cập đầy đủ bài học ngữ pháp và luyện tập dịch thuật cùng AI.
            </p>
            <button className="neo-btn neo-btn-primary" onClick={() => navigate('/settings')}>
              Nâng cấp ngay
            </button>
          </div>
        </div>
      )}

      {/* Case 3: Select Grammar Point */}
      {selectedGrammarBook !== null && selectedGrammarLesson !== null && selectedGrammarPointId === null && (!isLessonPremium || hasPremiumAccess) && (() => {
        const bookColor = currentBook?.color || getBookColor(selectedGrammarBook);
        const lessonGrammarPoints = localLessonGrammars;

        if (grammarLoading) {
          return (
            <div className="neo-card" style={{ padding: '40px', textAlign: 'center', fontWeight: 'bold', margin: '20px 0', color: '#666' }}>
              🔄 Đang tải ngữ pháp...
            </div>
          );
        }

        return (
          <div>
            <div style={{ marginBottom: '15px' }}>
              <button
                className="neo-btn"
                onClick={() => navigate(`/grammar/${currentBook?.slug || bookId}`)}
              >
                ← Danh sách bài học
              </button>
            </div>

            <div className="page-title-banner" style={{ borderLeft: `8px solid ${bookColor}` }}>
              <div>
                <h2>{currentLesson?.title}</h2>
                <p>{currentLesson?.trans} • Ngữ pháp cốt lõi</p>
              </div>
              <div className="neo-badge" style={{ backgroundColor: bookColor, color: 'white' }}>
                {lessonGrammarPoints.length} cấu trúc
              </div>
            </div>

            {lessonGrammarPoints.length === 0 ? (
              <div className="neo-card" style={{ padding: '30px', textAlign: 'center', fontWeight: 'bold' }}>
                Bài học này đang được cập nhật thêm ngữ pháp mẫu. Vui lòng chọn bài học khác!
              </div>
            ) : (
              <div className="grammar-container">
                {lessonGrammarPoints.map((gp) => (
                  <div
                    key={gp.id}
                    className="neo-card grammar-card"
                    style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                    onClick={() => {
                      navigate(`/grammar/${currentBook?.slug || bookId}/${currentLesson?.slug || lessonId}/${gp.id}`);
                    }}
                  >
                    <div className="grammar-header">
                      <span className="grammar-structure">{gp.title}</span>
                      <span className="neo-badge" style={{ backgroundColor: bookColor, color: 'white' }}>
                        {currentBook?.level?.split(' • ')[1]}
                      </span>
                    </div>
                    <h4 className="grammar-title">Công thức: {gp.pattern}</h4>
                    <p className="grammar-desc">{gp.definition.slice(0, 150)}...</p>
                    <div style={{ textAlign: 'right', fontWeight: '800', color: 'var(--color-primary)' }}>
                      Xem chi tiết & luyện tập →
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Case 4: Grammar Detail View */}
      {selectedGrammarBook !== null && selectedGrammarLesson !== null && selectedGrammarPointId !== null && (!isLessonPremium || hasPremiumAccess) && (() => {
        const lessonGrammarPoints = localLessonGrammars;
        const gp = lessonGrammarPoints.find(g => Number(g.id) === Number(selectedGrammarPointId));

        if (!gp) {
          return (
            <div className="neo-card" style={{ padding: '30px', textAlign: 'center', fontWeight: 'bold' }}>
              Không tìm thấy cấu trúc ngữ pháp này.
              <button className="neo-btn" style={{ marginLeft: '10px' }} onClick={() => navigate(`/grammar/${currentBook?.slug || bookId}/${currentLesson?.slug || lessonId}`)}>Quay lại</button>
            </div>
          );
        }

        const modelIdx = lessonGrammarPoints.findIndex(g => g.id === gp.id) + 1;

        return (
          <div style={{ paddingBottom: '40px' }}>
            {/* Back button */}
            <div style={{ marginBottom: '15px' }}>
              <button
                className="neo-btn"
                onClick={() => navigate(`/grammar/${currentBook?.slug || bookId}/${currentLesson?.slug || lessonId}`)}
              >
                ← Quay lại danh sách cấu trúc
              </button>
            </div>

            {/* Header Row */}
            <div style={{ background: '#f5f5f5', border: '3px solid #000', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '25px', boxShadow: '5px 5px 0px #000' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span className="neo-badge" style={{ backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: '800' }}>
                  Bài {selectedGrammarLesson} - Mẫu {modelIdx}
                </span>
                <span style={{ fontSize: '18px' }}>🇹🇼</span>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#555' }}>TOCFL {currentBook?.level.split(' • ')[1]}</span>
              </div>
              <h1 style={{ fontSize: '42px', fontWeight: '900', margin: '10px 0', fontFamily: 'Sora, sans-serif' }}>
                {gp.structure}
              </h1>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#333' }}>
                Mẫu câu: <code style={{ background: '#e0e0e0', padding: '2px 6px', borderRadius: '4px' }}>{gp.pattern}</code>
              </div>
            </div>

            {/* 4 Cards Grid */}
            <div className="grammar-info-grid">
              {/* Card 1: Cấu trúc */}
              <div className="grammar-info-card" style={{ borderLeft: '10px solid #673ab7' }}>
                <div className="card-badge" style={{ backgroundColor: '#f3e5f5', color: '#673ab7', borderColor: '#673ab7' }}>
                  ⚡ Cấu trúc
                </div>
                <div className="card-content" style={{ fontWeight: '800', fontSize: '16px' }}>
                  {gp.pattern}
                </div>
              </div>

              {/* Card 2: Định nghĩa */}
              <div className="grammar-info-card" style={{ borderLeft: '10px solid #2196f3' }}>
                <div className="card-badge" style={{ backgroundColor: '#e3f2fd', color: '#2196f3', borderColor: '#2196f3' }}>
                  📝 Định nghĩa
                </div>
                <div className="card-content">
                  {gp.definition}
                </div>
              </div>

              {/* Card 3: Phạm vi sử dụng */}
              <div className="grammar-info-card" style={{ borderLeft: '10px solid #4caf50' }}>
                <div className="card-badge" style={{ backgroundColor: '#e8f5e9', color: '#4caf50', borderColor: '#4caf50' }}>
                  🌐 Phạm vi sử dụng
                </div>
                <div className="card-content">
                  {gp.scope}
                </div>
              </div>

              {/* Card 4: Ghi chú */}
              <div className="grammar-info-card" style={{ borderLeft: '10px solid #ffc107' }}>
                <div className="card-badge" style={{ backgroundColor: '#fffde7', color: '#f57f17', borderColor: '#ffc107' }}>
                  ⚠️ Ghi chú
                </div>
                <div className="card-content">
                  {gp.note}
                </div>
              </div>
            </div>

            {/* Examples Section */}
            <div style={{ marginBottom: '35px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                💬 Ví dụ minh họa
              </h2>
              <div>
                {gp.examples.map((ex, idx) => (
                  <div key={ex.id} className="grammar-example-item">
                    <div className="grammar-example-text">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: '#000', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800' }}>
                          {idx + 1}
                        </span>
                        <span className="grammar-example-cn">{ex.cn}</span>
                      </div>
                      <div className="grammar-example-vn" style={{ marginLeft: '30px' }}>
                        → {ex.vn}
                      </div>
                    </div>
                    <AudioButton
                      onClick={() => playAudio(ex.cn)}
                      showLabel={true}
                      label="Nghe"
                      title="Nghe phát âm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Exercises Section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>
                  ✏️ Bài tập luyện tập
                </h2>
                {/* Exercise direction toggle */}
                <div className="neo-btn-group">
                  <button
                    className={`neo-btn ${grammarExerciseType === 'zhToVi' ? 'active' : ''}`}
                    onClick={() => setGrammarExerciseType('zhToVi')}
                    style={{ padding: '6px 12px', fontSize: '13px' }}
                  >
                    Trung → Việt
                  </button>
                  <button
                    className={`neo-btn ${grammarExerciseType === 'viToZh' ? 'active' : ''}`}
                    onClick={() => setGrammarExerciseType('viToZh')}
                    style={{ padding: '6px 12px', fontSize: '13px' }}
                  >
                    Việt → Trung
                  </button>
                </div>
              </div>

              <div style={{ background: '#eef2f3', border: '3px solid #000', padding: '15px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontWeight: '700', fontSize: '13px' }}>
                {grammarExerciseType === 'zhToVi'
                  ? 'Đọc câu tiếng Trung Phồn thể dưới đây, gõ bản dịch tiếng Việt tương ứng vào ô. Bấm "Kiểm tra" hoặc "AI đánh giá" để nhận phản hồi.'
                  : 'Đọc câu tiếng Việt dưới đây, gõ câu dịch tiếng Trung Phồn thể tương ứng vào ô. Bấm "Kiểm tra" hoặc "AI đánh giá" để nhận phản hồi.'
                }
              </div>

              {gp.exercises.map((exe, idx) => {
                const userVal = grammarExercisesInput[exe.id] || '';
                const feedback = grammarExercisesFeedback[exe.id] || '';
                const questionText = grammarExerciseType === 'zhToVi' ? exe.cn : exe.vn;
                const solutionText = grammarExerciseType === 'zhToVi' ? exe.vn : exe.cn;

                return (
                  <div key={exe.id} className="grammar-exercise-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="grammar-exercise-qn" style={{ margin: 0 }}>
                        <span style={{ background: 'var(--color-primary)', color: '#fff', padding: '2px 8px', borderRadius: '4px', marginRight: '8px', fontSize: '13px' }}>
                          Câu {idx + 1}
                        </span>
                        {questionText}
                      </div>
                      {grammarExerciseType === 'zhToVi' && (
                        <AudioButton
                          onClick={() => playAudio(exe.cn)}
                          showLabel={false}
                          size={14}
                          style={{ width: '32px', height: '32px', padding: 0 }}
                          title="Nghe phát âm"
                        />
                      )}
                    </div>

                    <div className="grammar-exercise-input-row">
                      <textarea
                        className="grammar-exercise-textarea"
                        rows={2}
                        placeholder={grammarExerciseType === 'zhToVi' ? 'Gõ bản dịch tiếng Việt ở đây...' : 'Gõ câu dịch tiếng Trung Phồn thể ở đây...'}
                        value={userVal}
                        onChange={(e) => {
                          setGrammarExercisesInput(prev => ({ ...prev, [exe.id]: e.target.value }));
                        }}
                      />

                      <div className="grammar-exercise-actions">
                        <button
                          className="neo-btn"
                          style={{ padding: '8px 16px', fontSize: '13px' }}
                          onClick={() => {
                            setGrammarExercisesFeedback(prev => ({
                              ...prev,
                              [exe.id]: `💡 **Đáp án tham khảo**: "${solutionText}"`
                            }));
                          }}
                        >
                          👁️ Kiểm tra
                        </button>

                        <button
                          className="neo-btn neo-btn-primary"
                          style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: 'var(--color-accent)' }}
                          onClick={() => {
                            const aiFeedback = getAIEvaluationFeedback(userVal, exe.cn, exe.vn, grammarExerciseType);
                            setGrammarExercisesFeedback(prev => ({
                              ...prev,
                              [exe.id]: aiFeedback
                            }));
                          }}
                        >
                          🤖 AI đánh giá
                        </button>
                      </div>
                    </div>

                    {feedback && (
                      <div
                        className="grammar-exercise-feedback"
                        style={{
                          backgroundColor: feedback.includes('(10/10)') || feedback.includes('(9/10)') || feedback.includes('(7/10)')
                            ? '#e8f5e9'
                            : feedback.startsWith('💡')
                              ? '#e3f2fd'
                              : '#fff8e1',
                          borderLeft: feedback.includes('(10/10)') || feedback.includes('(9/10)') || feedback.includes('(7/10)')
                            ? '5px solid #4caf50'
                            : feedback.startsWith('💡')
                              ? '5px solid #2196f3'
                              : '5px solid #ffb300'
                        }}
                      >
                        <div style={{ whiteSpace: 'pre-line', fontWeight: '600' }}>
                          {feedback}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Grammar;
