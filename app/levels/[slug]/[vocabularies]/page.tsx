'use client'; 

import React, { useEffect, useState } from "react";
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
  createdAt: string;
  updatedAt: string;
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
  const [currentMode, setCurrentMode] = useState<StudyMode>('flashcard'); 
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [typedWord, setTypedWord] = useState('');
  const [loading, setLoading] = useState(true);

  const currentVocab = vocabularies[currentIndex];
  const totalVocab = vocabularies.length;

  useEffect(() => {
    const fetchVocabularies = async () => {
      if(!lessonId) return;
      try {
        setLoading(true);
        const response: any = await vocabularyService.getVocabularyByLessonId(lessonId);
        setVocabularies(response.vocabularies || []);
      } catch (error) {
        console.error("Error fetching vocabularies:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchVocabularies();
  }, [lessonId]);

  const handleNext = () => {
    if (totalVocab === 0) return;
    setIsFlipped(false);
    setSelectedAnswer(null);
    setTypedWord('');
    setCurrentIndex((prev) => (prev + 1) % totalVocab);
  };

  const handlePrev = () => {
    if (totalVocab === 0) return;
    setIsFlipped(false);
    setSelectedAnswer(null);
    setTypedWord('');
    setCurrentIndex((prev) => (prev - 1 + totalVocab) % totalVocab);
  };

  const playAudio = (url?: string) => {
    if (url) {
      const audio = new Audio(url);
      audio.play().catch(e => console.error("Audio error:", e));
    }
  };

  if (loading) return <div className={styles.loading_screen}>Đang tải từ vựng...</div>;
  if (!currentVocab && !loading) return <div className={styles.error_screen}>Không tìm thấy dữ liệu bài học.</div>;

  const renderFlashcard = () => (
    <div className={styles.flashcard_container}>
      <div 
        className={`${styles.flashcard_card} ${isFlipped ? styles.flipped : ''}`} 
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <button className={styles.audio_btn_top} onClick={(e) => { e.stopPropagation(); playAudio(currentVocab.audioUrl); }}>
          🔊
        </button>
        
        <div className={styles.card_content}>
          {isFlipped ? (
            <div>
              <h2 className={styles.card_mean}>{currentVocab.meaning}</h2>
              <p className={styles.card_pinyin}>{currentVocab.pinyin}</p>
              <p className={styles.flip_hint}>Click để xem từ gốc</p>
            </div>
          ) : (
            <div>
              <h2 className={styles.card_word}>{currentVocab.vocabulary}</h2>
              <p className={styles.flip_hint}>Click để xem nghĩa</p>
            </div>
          )}
        </div>
      </div>

      <div className={styles.footer_nav}>
        <button className={styles.nav_btn} onClick={handlePrev}>&lt; Trước</button>
        <button className={styles.nav_btn} onClick={handleNext}>Sau &gt;</button>
      </div>
    </div>
  );

  const renderQuiz = () => {
    const options = [
        { id: currentVocab.id, text: currentVocab.meaning },
        { id: 999, text: "Nghĩa giả lập 1" },
        { id: 998, text: "Nghĩa giả lập 2" },
        { id: 997, text: "Nghĩa giả lập 3" },
    ];

    return (
        <div className={styles.study_area}>
            <div className={`${styles.question_card} ${styles.green}`}>
                <p className={styles.q_text}>Nghĩa của từ này là gì?</p>
                <h2 className={styles.q_word}>{currentVocab.vocabulary}</h2>
            </div>
            <div className={styles.answer_grid}>
                {options.map((opt, index) => (
                    <button 
                        key={index} 
                        className={`${styles.answer_btn} ${selectedAnswer === opt.id ? styles.selected : ''}`}
                        onClick={() => setSelectedAnswer(opt.id)}
                    >
                        <span className={styles.ans_num}>{index + 1}</span> {opt.text}
                    </button>
                ))}
            </div>
        </div>
    );
  };

  const renderTyping = () => (
    <div className={styles.study_area}>
        <div className={`${styles.question_card} ${styles.orange}`}>
            <p className={styles.q_text}>Hãy gõ lại từ vựng có nghĩa là:</p>
            <h2 className={styles.q_mean}>{currentVocab.meaning}</h2>
            <p className={styles.q_pinyin}>({currentVocab.pinyin})</p>
        </div>
        <div className={styles.typing_area}>
            <input 
                type="text" 
                value={typedWord}
                onChange={(e) => setTypedWord(e.target.value)}
                placeholder="Nhập từ vựng..."
                className={styles.typing_input}
            />
            <button className={styles.check_btn}>Kiểm tra</button>
        </div>
    </div>
  );

  const renderReading = () => (
    <div className={styles.study_area}>
        <div className={`${styles.question_card} ${styles.yellow}`}>
            <p className={styles.q_text}>Chọn từ đúng để hoàn thành nghĩa:</p>
            <h2 className={styles.q_word}>{currentVocab.vocabulary}</h2>
            <p className={styles.q_pinyin}>{currentVocab.pinyin}</p>
        </div>
        <div className={styles.answer_grid}>
            <button className={`${styles.answer_btn} ${selectedAnswer === currentVocab.id ? styles.selected : ''}`} onClick={() => setSelectedAnswer(currentVocab.id)}>
              {currentVocab.meaning}
            </button>
            <button className={styles.answer_btn}>Nghĩa sai khác</button>
        </div>
    </div>
  );

  return (
    <div className={styles.main_wrapper}>
      <header className={styles.header}>
        <Link href="/vocabularies" className={styles.back_link}>&lt; Danh sách bài</Link>
        <div className={styles.header_content}>
            <span className={styles.badge_yellow}>Học từ vựng</span>
            <span className={styles.total_text}>{totalVocab} từ vựng</span>
        </div>
        <h1 className={styles.lesson_title}>Dữ liệu bài học</h1>
      </header>

      <main className={styles.study_main_section}>
        <div className={styles.top_controls}>
            <div className={styles.counter}>{currentIndex + 1} / {totalVocab}</div>
            <div className={styles.score_text}>Tiến độ: {Math.round(((currentIndex + 1) / totalVocab) * 100)}%</div>
        </div>

        {currentMode === 'flashcard' && renderFlashcard()}
        {currentMode === 'quiz' && renderQuiz()}
        {currentMode === 'typing' && renderTyping()}
        {currentMode === 'reading' && renderReading()}
      </main>

      <section className={styles.mode_selector_section}>
        <h3 className={styles.section_title}>Chọn chế độ học</h3>
        <div className={styles.mode_grid}>
            {studyModes.map((mode) => (
                <button 
                    key={mode.key}
                    className={`${styles.mode_btn} ${currentMode === mode.key ? styles.active : ''}`}
                    onClick={() => setCurrentMode(mode.key)}
                >
                    <span className={styles.mode_icon}>{mode.icon}</span> {mode.name}
                </button>
            ))}
        </div>
      </section>

      <section className={styles.vocab_list_section}>
        <h3 className={styles.section_title}>Danh sách từ vựng trong bài ({totalVocab})</h3>
        <div className={styles.vocab_grid}>
            {vocabularies.map((item, index) => (
                <div key={item.id} className={styles.vocab_item_card}>
                    <div className={styles.card_top}>
                        <div className={styles.word_area}>
                            <span className={styles.idx}>{index + 1}.</span>
                            <div className={styles.word_info}>
                                <h4 className={styles.k_word}>{item.vocabulary}</h4>
                                <p className={styles.l_word}>{item.pinyin}</p>
                                <p className={styles.v_word}>{item.meaning}</p>
                            </div>
                        </div>
                        <button className={styles.audio_btn} onClick={() => playAudio(item.audioUrl)}>🔊</button>
                    </div>
                </div>
            ))}
        </div>
      </section>
    </div>
  );
}


















































































































































































