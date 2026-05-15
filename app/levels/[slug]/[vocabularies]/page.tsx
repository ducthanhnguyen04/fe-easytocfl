// 'use client';

// import React, { useEffect, useState, useMemo } from "react";
// import Link from "next/link";
// import styles from "./vocabularies.module.scss";
// import { useSearchParams } from "next/navigation";
// import vocabularyService from "@/services/vocabularyService";

// interface Vocabulary {
//     id: number;
//     vocabulary: string;
//     meaning: string;
//     pinyin: string;
//     audioUrl?: string;
// }

// type StudyMode = 'flashcard' | 'quiz' | 'typing' | 'reading';

// const studyModes: { key: StudyMode; name: string; icon: string }[] = [
//     { key: 'flashcard', name: 'Flashcard', icon: '🎴' },
//     { key: 'quiz', name: 'Trắc nghiệm', icon: '🕒' },
//     { key: 'typing', name: 'Gõ từ vựng', icon: '⌨️' },
//     { key: 'reading', name: 'Đọc hiểu', icon: '📖' },
// ];

// export default function LessonStudyPage() {
//     const searchParams = useSearchParams();
//     const lessonId = searchParams.get("lessonId");

//     const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
//     const [currentMode, setCurrentMode] = useState<StudyMode>('flashcard');
//     const [currentIndex, setCurrentIndex] = useState(0);
//     const [loading, setLoading] = useState(true);

//     // Logic States
//     const [isFlipped, setIsFlipped] = useState(false);
//     const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
//     const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
//     const [typedWord, setTypedWord] = useState('');
    
//     // Chỉ lưu số câu đúng, không cần lưu tổng vì sẽ dùng totalVocab
//     const [correctCount, setCorrectCount] = useState(0);

//     const currentVocab = vocabularies[currentIndex];
//     const totalVocab = vocabularies.length;

//     useEffect(() => {
//         const fetchVocabularies = async () => {
//             if (!lessonId) return;
//             try {
//                 setLoading(true);
//                 const response: any = await vocabularyService.getVocabularyByLessonId(lessonId);
//                 setVocabularies(response.vocabularies || []);
//             } catch (error) {
//                 console.error("Error fetching vocabularies:", error);
//             } finally {
//                 setLoading(false);
//             }
//         }
//         fetchVocabularies();
//     }, [lessonId]);

//     const options = useMemo(() => {
//         if (!currentVocab || vocabularies.length < 2) return [];
//         const correct = { id: currentVocab.id, text: currentVocab.meaning, word: currentVocab.vocabulary };
        
//         const wrongAnswers = vocabularies
//             .filter(v => v.id !== currentVocab.id)
//             .sort(() => 0.5 - Math.random())
//             .slice(0, 3)
//             .map(v => ({ id: v.id, text: v.meaning, word: v.vocabulary }));

//         return [correct, ...wrongAnswers].sort(() => 0.5 - Math.random());
//     }, [currentVocab, vocabularies]);

//     const handleNext = () => {
//         if (totalVocab === 0) return;
//         setIsFlipped(false);
//         setSelectedAnswer(null);
//         setIsCorrect(null);
//         setTypedWord('');
//         setCurrentIndex((prev) => (prev + 1) % totalVocab);
//     };

//     const handlePrev = () => {
//         if (totalVocab === 0) return;
//         setIsFlipped(false);
//         setSelectedAnswer(null);
//         setIsCorrect(null);
//         setTypedWord('');
//         setCurrentIndex((prev) => (prev - 1 + totalVocab) % totalVocab);
//     };

//     const checkAnswer = (id: number) => {
//         if (isCorrect !== null) return;
//         setSelectedAnswer(id);
//         const correct = id === currentVocab.id;
//         setIsCorrect(correct);
//         if (correct) {
//             setCorrectCount(prev => prev + 1);
//         }
//     };

//     const playAudio = (url?: string) => {
//         if (url) new Audio(url).play().catch(() => {});
//     };

//     if (loading) return <div className={styles.loading_screen}>Đang tải dữ liệu...</div>;
//     if (!currentVocab) return <div className={styles.error_screen}>Không có dữ liệu bài học.</div>;

//     const renderFlashcard = () => (
//         <div className={styles.flashcard_container}>
//             <div className={`${styles.flashcard_card} ${isFlipped ? styles.flipped : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
//                 <button className={styles.audio_btn_top} onClick={(e) => { e.stopPropagation(); playAudio(currentVocab.audioUrl); }}>🔊</button>
//                 <div className={styles.card_content}>
//                     {isFlipped ? (
//                         <div>
//                             <h2 className={styles.card_mean}>{currentVocab.meaning}</h2>
//                             <p className={styles.card_pinyin}>{currentVocab.pinyin}</p>
//                         </div>
//                     ) : (
//                         <h2 className={styles.card_word}>{currentVocab.vocabulary}</h2>
//                     )}
//                 </div>
//             </div>
//             <div className={styles.footer_nav}>
//                 <button className={styles.nav_btn} onClick={handlePrev}>&lt; Trước</button>
//                 <button className={styles.nav_btn} onClick={handleNext}>Sau &gt;</button>
//             </div>
//         </div>
//     );

//     const renderQuiz = () => (
//         <div className={styles.study_area}>
//             <div className={`${styles.question_card} ${styles.green}`}>
//                 <p className={styles.q_text}>Nghĩa của từ này là gì?</p>
//                 <h2 className={styles.q_word}>{currentVocab.vocabulary}</h2>
//             </div>
//             <div className={styles.answer_grid}>
//                 {options.map((opt, index) => {
//                     // Logic xác định class màu sắc
//                     let buttonStyle = styles.answer_btn;
//                     if (isCorrect !== null) {
//                         if (opt.id === currentVocab.id) {
//                             buttonStyle += ` ${styles.selected}`; // Hiện xanh cho câu đúng
//                         } else if (selectedAnswer === opt.id && !isCorrect) {
//                             buttonStyle += ` ${styles.wrong}`; // Hiện đỏ cho câu vừa chọn sai
//                         }
//                     }

//                     return (
//                         <button 
//                             key={index} 
//                             className={buttonStyle}
//                             onClick={() => checkAnswer(opt.id)}
//                             disabled={isCorrect !== null}
//                         >
//                             <span className={styles.ans_num}>{index + 1}</span> {opt.text}
//                         </button>
//                     );
//                 })}
//             </div>
//             {isCorrect !== null && <button className={styles.check_btn} style={{marginTop: '20px'}} onClick={handleNext}>Tiếp theo</button>}
//         </div>
//     );

//     const renderTyping = () => (
//         <div className={styles.study_area}>
//             <div className={`${styles.question_card} ${styles.orange}`}>
//                 <p className={styles.q_text}>Hãy gõ lại từ vựng có nghĩa là:</p>
//                 <h2 className={styles.q_mean}>{currentVocab.meaning}</h2>
//                 <p className={styles.q_pinyin}>({currentVocab.pinyin})</p>
//             </div>
//             <div className={styles.typing_area}>
//                 <input 
//                     type="text" 
//                     value={typedWord}
//                     onChange={(e) => setTypedWord(e.target.value)}
//                     placeholder="Nhập từ vựng..."
//                     className={`${styles.typing_input} ${isCorrect === false ? styles.input_error : ''}`}
//                     onKeyDown={(e) => e.key === 'Enter' && checkAnswer(typedWord.trim() === currentVocab.vocabulary.trim() ? currentVocab.id : -1)}
//                 />
//                 <button className={styles.check_btn} onClick={() => checkAnswer(typedWord.trim() === currentVocab.vocabulary.trim() ? currentVocab.id : -1)}>Kiểm tra</button>
//             </div>
//             {isCorrect === false && <p className={styles.correct_hint}>Đáp án đúng: <strong>{currentVocab.vocabulary}</strong></p>}
//             {isCorrect !== null && <button className={styles.check_btn} style={{marginTop: '10px', background: '#666'}} onClick={handleNext}>Tiếp theo</button>}
//         </div>
//     );

//     const renderReading = () => (
//         <div className={styles.study_area}>
//             <div className={`${styles.question_card} ${styles.yellow}`}>
//                 <p className={styles.q_text}>Chọn từ vựng viết đúng cho nghĩa:</p>
//                 <h2 className={styles.q_word}>{currentVocab.meaning}</h2>
//             </div>
//             <div className={styles.answer_grid}>
//                 {options.map((opt, index) => {
//                     let buttonStyle = styles.answer_btn;
//                     if (isCorrect !== null) {
//                         if (opt.id === currentVocab.id) {
//                             buttonStyle += ` ${styles.selected}`;
//                         } else if (selectedAnswer === opt.id && !isCorrect) {
//                             buttonStyle += ` ${styles.wrong}`;
//                         }
//                     }

//                     return (
//                         <button 
//                             key={index} 
//                             className={buttonStyle}
//                             onClick={() => checkAnswer(opt.id)}
//                             disabled={isCorrect !== null}
//                         >
//                             <span className={styles.ans_num}>{index + 1}</span> {opt.word}
//                         </button>
//                     );
//                 })}
//             </div>
//             {isCorrect !== null && <button className={styles.check_btn} style={{marginTop: '20px'}} onClick={handleNext}>Tiếp theo</button>}
//         </div>
//     );

//     return (
//         <div className={styles.main_wrapper}>
//             <header className={styles.header}>
//                 <Link href="/vocabularies" className={styles.back_link}>&lt; Danh sách bài</Link>
//                 <div className={styles.header_content}>
//                     <span className={styles.badge_yellow}>Học từ vựng</span>
//                     <span className={styles.total_text}>{totalVocab} từ vựng</span>
//                 </div>
//                 {/* Sửa hiển thị Đúng: X / Tổng số từ */}
//                 <h1 className={styles.lesson_title}>Đúng: {correctCount}/{totalVocab}</h1>
//             </header>

//             <main className={styles.study_main_section}>
//                 <div className={styles.top_controls}>
//                     <div className={styles.counter}>{currentIndex + 1} / {totalVocab}</div>
//                     <div className={styles.score_text}>Tiến độ: {Math.round(((currentIndex + 1) / totalVocab) * 100)}%</div>
//                 </div>

//                 {currentMode === 'flashcard' && renderFlashcard()}
//                 {currentMode === 'quiz' && renderQuiz()}
//                 {currentMode === 'typing' && renderTyping()}
//                 {currentMode === 'reading' && renderReading()}
//             </main>

//             <section className={styles.mode_selector_section}>
//                 <h3 className={styles.section_title}>Chọn chế độ học</h3>
//                 <div className={styles.mode_grid}>
//                     {studyModes.map((mode) => (
//                         <button 
//                             key={mode.key}
//                             className={`${styles.mode_btn} ${currentMode === mode.key ? styles.active : ''}`}
//                             onClick={() => {
//                                 setCurrentMode(mode.key);
//                                 setIsCorrect(null);
//                                 setSelectedAnswer(null);
//                                 // Tùy chọn: Reset điểm khi đổi chế độ nếu muốn
//                                 // setCorrectCount(0); 
//                             }}
//                         >
//                             <span className={mode.icon}>{mode.icon}</span> {mode.name}
//                         </button>
//                     ))}
//                 </div>
//             </section>

//             <section className={styles.vocab_list_section}>
//                 <h3 className={styles.section_title}>Danh sách từ ({totalVocab})</h3>
//                 <div className={styles.vocab_grid}>
//                     {vocabularies.map((item, index) => (
//                         <div key={item.id} className={styles.vocab_item_card}>
//                             <div className={styles.card_top}>
//                                 <div className={styles.word_area}>
//                                     <span className={styles.idx}>{index + 1}.</span>
//                                     <div className={styles.word_info}>
//                                         <h4 className={styles.k_word}>{item.vocabulary}</h4>
//                                         <p className={styles.l_word}>{item.pinyin}</p>
//                                         <p className={styles.v_word}>{item.meaning}</p>
//                                     </div>
//                                 </div>
//                                 <button className={styles.audio_btn} onClick={() => playAudio(item.audioUrl)}>🔊</button>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </section>
//         </div>
//     );
// }

// 'use client';

// import React, { useEffect, useState, useMemo } from "react";
// import Link from "next/link";
// import styles from "./vocabularies.module.scss";
// import { useSearchParams } from "next/navigation";
// import vocabularyService from "@/services/vocabularyService";

// interface Vocabulary {
//     id: number;
//     vocabulary: string;
//     meaning: string;
//     pinyin: string;
//     audioUrl?: string;
// }

// type StudyMode = 'flashcard' | 'quiz' | 'typing' | 'reading';

// const studyModes: { key: StudyMode; name: string; icon: string }[] = [
//     { key: 'flashcard', name: 'Flashcard', icon: '🎴' },
//     { key: 'quiz', name: 'Trắc nghiệm', icon: '🕒' },
//     { key: 'typing', name: 'Gõ từ vựng', icon: '⌨️' },
//     { key: 'reading', name: 'Đọc hiểu', icon: '📖' },
// ];

// export default function LessonStudyPage() {
//     const searchParams = useSearchParams();
//     const lessonId = searchParams.get("lessonId");

//     const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
//     const [currentMode, setCurrentMode] = useState<StudyMode>('flashcard');
//     const [currentIndex, setCurrentIndex] = useState(0);
//     const [loading, setLoading] = useState(true);

//     const [isFlipped, setIsFlipped] = useState(false);
//     const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
//     const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
//     const [typedWord, setTypedWord] = useState('');
    
//     // Lưu danh sách ID những từ đã hoàn thành đúng để không tính điểm lặp lại
//     const [completedIds, setCompletedIds] = useState<number[]>([]);

//     const currentVocab = vocabularies[currentIndex];
//     const totalVocab = vocabularies.length;

//     useEffect(() => {
//         const fetchVocabularies = async () => {
//             if (!lessonId) return;
//             try {
//                 setLoading(true);
//                 const response: any = await vocabularyService.getVocabularyByLessonId(lessonId);
//                 setVocabularies(response.vocabularies || []);
//             } catch (error) {
//                 console.error("Error fetching vocabularies:", error);
//             } finally {
//                 setLoading(false);
//             }
//         }
//         fetchVocabularies();
//     }, [lessonId]);

//     const options = useMemo(() => {
//         if (!currentVocab || vocabularies.length < 2) return [];
//         const correct = { id: currentVocab.id, text: currentVocab.meaning, word: currentVocab.vocabulary };
//         const wrongAnswers = vocabularies
//             .filter(v => v.id !== currentVocab.id)
//             .sort(() => 0.5 - Math.random())
//             .slice(0, 3)
//             .map(v => ({ id: v.id, text: v.meaning, word: v.vocabulary }));
//         return [correct, ...wrongAnswers].sort(() => 0.5 - Math.random());
//     }, [currentVocab, vocabularies]);

//     const handleNext = () => {
//         if (totalVocab === 0) return;
//         setIsFlipped(false);
//         setSelectedAnswer(null);
//         setIsCorrect(null);
//         setTypedWord('');
//         setCurrentIndex((prev) => (prev + 1) % totalVocab);
//     };

//     const handlePrev = () => {
//         if (totalVocab === 0) return;
//         setIsFlipped(false);
//         setSelectedAnswer(null);
//         setIsCorrect(null);
//         setTypedWord('');
//         setCurrentIndex((prev) => (prev - 1 + totalVocab) % totalVocab);
//     };

//     const checkAnswer = (id: number) => {
//         if (isCorrect !== null) return;
//         setSelectedAnswer(id);
//         const correct = id === currentVocab.id;
//         setIsCorrect(correct);
        
//         // LOGIC MỚI: Chỉ thêm vào danh sách hoàn thành nếu trả lời đúng 
//         // và từ này chưa được tính điểm trước đó
//         if (correct && !completedIds.includes(currentVocab.id)) {
//             setCompletedIds(prev => [...prev, currentVocab.id]);
//         }
//     };

//     const playAudio = (url?: string) => {
//         if (url) new Audio(url).play().catch(() => {});
//     };

//     // Tính toán tiến độ thực tế dựa trên số câu ĐÚNG
//     const progressPercent = totalVocab > 0 
//         ? Math.round((completedIds.length / totalVocab) * 100) 
//         : 0;

//     if (loading) return <div className={styles.loading_screen}>Đang tải...</div>;
//     if (!currentVocab) return <div className={styles.error_screen}>Không có dữ liệu.</div>;

//     const renderFlashcard = () => (
//         <div className={styles.flashcard_container}>
//             <div className={`${styles.flashcard_card} ${isFlipped ? styles.flipped : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
//                 <button className={styles.audio_btn_top} onClick={(e) => { e.stopPropagation(); playAudio(currentVocab.audioUrl); }}>🔊</button>
//                 <div className={styles.card_content}>
//                     {isFlipped ? (
//                         <div><h2 className={styles.card_mean}>{currentVocab.meaning}</h2><p className={styles.card_pinyin}>{currentVocab.pinyin}</p></div>
//                     ) : (
//                         <h2 className={styles.card_word}>{currentVocab.vocabulary}</h2>
//                     )}
//                 </div>
//             </div>
//             <div className={styles.footer_nav}>
//                 <button className={styles.nav_btn} onClick={handlePrev}>&lt; Trước</button>
//                 <button className={styles.nav_btn} onClick={handleNext}>Sau &gt;</button>
//             </div>
//         </div>
//     );

//     const renderQuiz = () => (
//         <div className={styles.study_area}>
//             <div className={`${styles.question_card} ${styles.green}`}>
//                 <p className={styles.q_text}>Nghĩa của từ này là gì?</p>
//                 <h2 className={styles.q_word}>{currentVocab.vocabulary}</h2>
//             </div>
//             <div className={styles.answer_grid}>
//                 {options.map((opt, index) => {
//                     let btnClass = styles.answer_btn;
//                     if (isCorrect !== null) {
//                         if (opt.id === currentVocab.id) btnClass += ` ${styles.selected}`;
//                         else if (selectedAnswer === opt.id && !isCorrect) btnClass += ` ${styles.wrong}`;
//                     }
//                     return (
//                         <button key={index} className={btnClass} onClick={() => checkAnswer(opt.id)} disabled={isCorrect !== null}>
//                             <span className={styles.ans_num}>{index + 1}</span> {opt.text}
//                         </button>
//                     );
//                 })}
//             </div>
//             {isCorrect !== null && <button className={styles.check_btn} style={{marginTop: '20px'}} onClick={handleNext}>Tiếp theo</button>}
//         </div>
//     );

//     const renderTyping = () => (
//         <div className={styles.study_area}>
//             <div className={`${styles.question_card} ${styles.orange}`}>
//                 <p className={styles.q_text}>Gõ lại từ vựng có nghĩa là:</p>
//                 <h2 className={styles.q_mean}>{currentVocab.meaning}</h2>
//             </div>
//             <div className={styles.typing_area}>
//                 <input 
//                     type="text" value={typedWord} 
//                     onChange={(e) => setTypedWord(e.target.value)}
//                     className={`${styles.typing_input} ${isCorrect === false ? styles.input_error : ''}`}
//                     onKeyDown={(e) => e.key === 'Enter' && checkAnswer(typedWord.trim() === currentVocab.vocabulary.trim() ? currentVocab.id : -1)}
//                 />
//                 <button className={styles.check_btn} onClick={() => checkAnswer(typedWord.trim() === currentVocab.vocabulary.trim() ? currentVocab.id : -1)}>Kiểm tra</button>
//             </div>
//             {isCorrect === false && <p style={{color: 'red', marginTop: '10px'}}>Đáp án đúng: {currentVocab.vocabulary}</p>}
//             {isCorrect !== null && <button className={styles.check_btn} style={{marginTop: '10px', background: '#666'}} onClick={handleNext}>Tiếp theo</button>}
//         </div>
//     );

//     const renderReading = () => (
//         <div className={styles.study_area}>
//             <div className={`${styles.question_card} ${styles.yellow}`}>
//                 <p className={styles.q_text}>Chọn từ viết đúng:</p>
//                 <h2 className={styles.q_word}>{currentVocab.meaning}</h2>
//             </div>
//             <div className={styles.answer_grid}>
//                 {options.map((opt, index) => {
//                     let btnClass = styles.answer_btn;
//                     if (isCorrect !== null) {
//                         if (opt.id === currentVocab.id) btnClass += ` ${styles.selected}`;
//                         else if (selectedAnswer === opt.id && !isCorrect) btnClass += ` ${styles.wrong}`;
//                     }
//                     return (
//                         <button key={index} className={btnClass} onClick={() => checkAnswer(opt.id)} disabled={isCorrect !== null}>
//                             <span className={styles.ans_num}>{index + 1}</span> {opt.word}
//                         </button>
//                     );
//                 })}
//             </div>
//             {isCorrect !== null && <button className={styles.check_btn} style={{marginTop: '20px'}} onClick={handleNext}>Tiếp theo</button>}
//         </div>
//     );

//     return (
//         <div className={styles.main_wrapper}>
//             <header className={styles.header}>
//                 <Link href="/vocabularies" className={styles.back_link}>&lt; Thoát</Link>
//                 {/* Hiển thị số lượng từ đã hoàn thành đúng / Tổng số từ */}
//                 <h1 className={styles.lesson_title}>Đúng: {completedIds.length}/{totalVocab}</h1>
//             </header>

//             <main className={styles.study_main_section}>
//                 <div className={styles.top_controls}>
//                     <div className={styles.counter}>{currentIndex + 1} / {totalVocab}</div>
//                     {/* Tiến độ giờ đây chỉ tăng khi bạn trả lời đúng */}
//                     <div className={styles.score_text}>Tiến độ: {progressPercent}%</div>
//                 </div>
//                 {currentMode === 'flashcard' && renderFlashcard()}
//                 {currentMode === 'quiz' && renderQuiz()}
//                 {currentMode === 'typing' && renderTyping()}
//                 {currentMode === 'reading' && renderReading()}
//             </main>

//             <section className={styles.mode_selector_section}>
//                 <div className={styles.mode_grid}>
//                     {studyModes.map((mode) => (
//                         <button key={mode.key} className={`${styles.mode_btn} ${currentMode === mode.key ? styles.active : ''}`}
//                             onClick={() => { 
//                                 setCurrentMode(mode.key); 
//                                 setIsCorrect(null); 
//                                 setSelectedAnswer(null); 
//                             }}>
//                             {mode.icon} {mode.name}
//                         </button>
//                     ))}
//                 </div>
//             </section>
//         </div>
//     );
// }


'use client';

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import styles from "./vocabularies.module.scss";
import { useSearchParams } from "next/navigation";
import vocabularyService from "@/services/vocabularyService";

interface Vocabulary {
    id: number;
    vocabulary: string;
    meaning: string;
    pinyin: string;
    audioUrl?: string;
}

type StudyMode = 'flashcard' | 'quiz' | 'typing' | 'reading';

const studyModes: { key: StudyMode; name: string; icon: string }[] = [
    { key: 'flashcard', name: 'Flashcard', icon: '🎴' },
    { key: 'quiz', name: 'Trắc nghiệm', icon: '🕒' },
    { key: 'typing', name: 'Gõ từ vựng', icon: '⌨️' },
    { key: 'reading', name: 'Đọc hiểu', icon: '📖' },
];

export default function LessonStudyPage() {
    const searchParams = useSearchParams();
    const lessonId = searchParams.get("lessonId");

    const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
    const [originalVocabularies, setOriginalVocabularies] = useState<Vocabulary[]>([]);
    
    const [currentMode, setCurrentMode] = useState<StudyMode>('flashcard');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    const [isFlipped, setIsFlipped] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [typedWord, setTypedWord] = useState('');
    
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongIds, setWrongIds] = useState<number[]>([]);
    const [isFinished, setIsFinished] = useState(false);

    const currentVocab = vocabularies[currentIndex];
    const totalVocab = vocabularies.length;

    useEffect(() => {
        const fetchVocabularies = async () => {
            if (!lessonId) return;
            try {
                setLoading(true);
                const response: any = await vocabularyService.getVocabularyByLessonId(lessonId);
                const data = response.vocabularies || [];
                setVocabularies(data);
                setOriginalVocabularies(data);
            } catch (error) {
                console.error("Error fetching vocabularies:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchVocabularies();
    }, [lessonId]);

    const options = useMemo(() => {
        if (!currentVocab || vocabularies.length < 2) return [];
        const correct = { id: currentVocab.id, text: currentVocab.meaning, word: currentVocab.vocabulary };
        const wrongAnswers = vocabularies
            .filter(v => v.id !== currentVocab.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map(v => ({ id: v.id, text: v.meaning, word: v.vocabulary }));
        return [correct, ...wrongAnswers].sort(() => 0.5 - Math.random());
    }, [currentVocab, vocabularies]);

    const handleNext = () => {
        // Chỉ hiện kết quả nếu KHÔNG PHẢI là chế độ Flashcard
        if (currentIndex === totalVocab - 1) {
            if (currentMode !== 'flashcard') {
                setIsFinished(true);
                return;
            } else {
                // Flashcard thì quay lại từ đầu để học tiếp
                setCurrentIndex(0);
                setIsFlipped(false);
                return;
            }
        }
        setIsFlipped(false);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setTypedWord('');
        setCurrentIndex(prev => prev + 1);
    };

    const handleRestartAll = () => {
        setVocabularies(originalVocabularies);
        setCurrentIndex(0);
        setCorrectCount(0);
        setWrongIds([]);
        setIsFinished(false);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setTypedWord('');
        setIsFlipped(false);
    };

    const handleRestartWrong = () => {
        const filtered = originalVocabularies.filter(v => wrongIds.includes(v.id));
        if (filtered.length > 0) {
            setVocabularies(filtered);
            setCurrentIndex(0);
            setCorrectCount(0);
            setWrongIds([]);
            setIsFinished(false);
            setSelectedAnswer(null);
            setIsCorrect(null);
            setTypedWord('');
        }
    };

    const checkAnswer = (id: number) => {
        if (isCorrect !== null) return;
        setSelectedAnswer(id);
        const isRight = id === currentVocab.id;
        setIsCorrect(isRight);
        if (isRight) setCorrectCount(prev => prev + 1);
        else setWrongIds(prev => [...prev, currentVocab.id]);
    };

    const playAudio = (url?: string) => {
        if (url) new Audio(url).play().catch(() => {});
    };

    if (loading) return <div className={styles.loading_screen}>Đang tải...</div>;
    if (!currentVocab && !isFinished) return <div className={styles.error_screen}>Không có dữ liệu.</div>;

    // --- CÁC HÀM RENDER ---

    const renderFlashcard = () => (
        <div className={styles.flashcard_container}>
            <div className={`${styles.flashcard_card} ${isFlipped ? styles.flipped : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
                <button className={styles.audio_btn_top} onClick={(e) => { e.stopPropagation(); playAudio(currentVocab.audioUrl); }}>🔊</button>
                <div className={styles.card_content}>
                    {isFlipped ? (
                        <div><h2 className={styles.card_mean}>{currentVocab.meaning}</h2><p className={styles.card_pinyin}>{currentVocab.pinyin}</p></div>
                    ) : (
                        <h2 className={styles.card_word}>{currentVocab.vocabulary}</h2>
                    )}
                </div>
            </div>
            <div className={styles.footer_nav}>
                <button className={styles.nav_btn} onClick={() => setCurrentIndex(prev => (prev - 1 + totalVocab) % totalVocab)}>Trước</button>
                <button className={styles.nav_btn} onClick={handleNext}>Sau</button>
            </div>
        </div>
    );

    const renderQuiz = () => (
        <div className={styles.study_area}>
            <div className={`${styles.question_card} ${styles.green}`}>
                <p className={styles.q_text}>Nghĩa của từ này là gì?</p>
                <h2 className={styles.q_word}>{currentVocab.vocabulary}</h2>
            </div>
            <div className={styles.answer_grid}>
                {options.map((opt, index) => {
                    let btnClass = styles.answer_btn;
                    if (isCorrect !== null) {
                        if (opt.id === currentVocab.id) btnClass += ` ${styles.selected}`;
                        else if (selectedAnswer === opt.id && !isCorrect) btnClass += ` ${styles.wrong}`;
                    }
                    return (
                        <button key={index} className={btnClass} onClick={() => checkAnswer(opt.id)} disabled={isCorrect !== null}>
                            <span className={styles.ans_num}>{index + 1}</span> {opt.text}
                        </button>
                    );
                })}
            </div>
            {isCorrect !== null && <button className={styles.check_btn} style={{marginTop: '20px'}} onClick={handleNext}>Tiếp theo</button>}
        </div>
    );

    const renderTyping = () => (
        <div className={styles.study_area}>
            <div className={`${styles.question_card} ${styles.orange}`}>
                <p className={styles.q_text}>Gõ lại từ vựng có nghĩa là:</p>
                <h2 className={styles.q_mean}>{currentVocab.meaning}</h2>
            </div>
            <div className={styles.typing_area}>
                <input 
                    type="text" value={typedWord} 
                    onChange={(e) => setTypedWord(e.target.value)}
                    className={`${styles.typing_input} ${isCorrect === false ? styles.input_error : ''}`}
                    onKeyDown={(e) => e.key === 'Enter' && checkAnswer(typedWord.trim() === currentVocab.vocabulary.trim() ? currentVocab.id : -1)}
                />
                <button className={styles.check_btn} onClick={() => checkAnswer(typedWord.trim() === currentVocab.vocabulary.trim() ? currentVocab.id : -1)}>Kiểm tra</button>
            </div>
            {isCorrect === false && <p style={{color: 'red', marginTop: '10px'}}>Đáp án đúng: {currentVocab.vocabulary}</p>}
            {isCorrect !== null && <button className={styles.check_btn} style={{marginTop: '10px'}} onClick={handleNext}>Tiếp theo</button>}
        </div>
    );

    const renderReading = () => (
        <div className={styles.study_area}>
            <div className={`${styles.question_card} ${styles.yellow}`}>
                <p className={styles.q_text}>Chọn từ viết đúng:</p>
                <h2 className={styles.q_word}>{currentVocab.meaning}</h2>
            </div>
            <div className={styles.answer_grid}>
                {options.map((opt, index) => {
                    let btnClass = styles.answer_btn;
                    if (isCorrect !== null) {
                        if (opt.id === currentVocab.id) btnClass += ` ${styles.selected}`;
                        else if (selectedAnswer === opt.id && !isCorrect) btnClass += ` ${styles.wrong}`;
                    }
                    return (
                        <button key={index} className={btnClass} onClick={() => checkAnswer(opt.id)} disabled={isCorrect !== null}>
                            <span className={styles.ans_num}>{index + 1}</span> {opt.word}
                        </button>
                    );
                })}
            </div>
            {isCorrect !== null && <button className={styles.check_btn} style={{marginTop: '20px'}} onClick={handleNext}>Tiếp theo</button>}
        </div>
    );

    const renderResult = () => (
        <div className={styles.result_container}>
            <div className={styles.result_card}>
                <h2 className={styles.result_title}>Kết quả</h2>
                <div className={styles.result_score}>
                    <span className={styles.score_big}>{correctCount}/{totalVocab}</span>
                </div>
                <p className={styles.result_rate}>Tỷ lệ đúng: {totalVocab > 0 ? Math.round((correctCount / totalVocab) * 100) : 0}%</p>
                <div className={styles.result_actions}>
                    <button className={styles.btn_restart_all} onClick={handleRestartAll}>🔄 Làm lại toàn bộ</button>
                    {wrongIds.length > 0 && (
                        <button className={styles.btn_restart_wrong} onClick={handleRestartWrong}>❌ Làm lại {wrongIds.length} câu sai</button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className={styles.main_wrapper}>
            <header className={styles.header}>
                <Link href="/vocabularies" className={styles.back_link}>&lt; Thoát</Link>
                {/* Chỉ hiện số câu đúng/tổng khi không ở chế độ Flashcard */}
                <h1 className={styles.lesson_title}>
                    {currentMode === 'flashcard' ? 'Học từ vựng' : `Đúng: ${correctCount}/${totalVocab}`}
                </h1>
            </header>

            <main className={styles.study_main_section}>
                {isFinished ? (
                    renderResult()
                ) : (
                    <>
                        <div className={styles.top_controls}>
                            <div className={styles.counter}>{currentIndex + 1} / {totalVocab}</div>
                            {/* Ẩn tiến độ phần trăm ở Flashcard để người dùng tập trung học */}
                            {currentMode !== 'flashcard' && (
                                <div className={styles.score_text}>Tiến độ: {totalVocab > 0 ? Math.round((currentIndex / totalVocab) * 100) : 0}%</div>
                            )}
                        </div>
                        {currentMode === 'flashcard' && renderFlashcard()}
                        {currentMode === 'quiz' && renderQuiz()}
                        {currentMode === 'typing' && renderTyping()}
                        {currentMode === 'reading' && renderReading()}
                    </>
                )}
            </main>

            <section className={styles.mode_selector_section}>
                <div className={styles.mode_grid}>
                    {studyModes.map((mode) => (
                        <button key={mode.key} 
                            className={`${styles.mode_btn} ${currentMode === mode.key ? styles.active : ''}`}
                            onClick={() => {
                                setCurrentMode(mode.key);
                                handleRestartAll(); 
                            }}
                        >
                            {mode.icon} {mode.name}
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );
}















































































































































































