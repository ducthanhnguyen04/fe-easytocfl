'use client'; // BẮT BUỘC vì dùng useState

import React, { useState } from "react";
import Link from "next/link";
import styles from "./detail.module.scss";

// --- 1. MOCK DATA (Thay bằng API thật của bạn) ---
// Định nghĩa kiểu dữ liệu cho một từ vựng
interface VocabItem {
  id: number;
  word: string;      // Từ tiếng Hàn
  latin: string;     // Phiên âm (latin)
  mean: string;      // Nghĩa tiếng Việt
  example: string;   // Câu ví dụ tiếng Hàn
  exampleMean: string; // Nghĩa câu ví dụ
  audioWord?: string;  // Link file âm thanh từ
  audioEx?: string;    // Link file âm thanh ví dụ
}

const mockLessonData: VocabItem[] = [
  { 
    id: 1, word: "한국", latin: "han-guk", mean: "Hàn Quốc, Nam Hàn", 
    example: "저는 한국 사람이에요", exampleMean: "Tôi là người Hàn Quốc",
    audioWord: "/audio/word_1.mp3", audioEx: "/audio/ex_1.mp3"
  },
  { 
    id: 2, word: "인도네시아", latin: "in-do-ne-si-a", mean: "In-đô-nê-xi-a", 
    example: "인도네시아는 섬나라입니다", exampleMean: "In-đô-nê-xi-a là quốc gia vạn đảo",
    audioWord: "/audio/word_2.mp3", audioEx: "/audio/ex_2.mp3"
  },
  { 
    id: 3, word: "베트남", latin: "be-teu-nam", mean: "Việt Nam", 
    example: "베트남 요리는 맛있어요", exampleMean: "Món ăn Việt Nam rất ngon",
    audioWord: "/audio/word_3.mp3", audioEx: "/audio/ex_3.mp3"
  },
  { 
    id: 4, word: "말레이시아", latin: "mal-lei-si-a", mean: "Ma-lai-xi-a", 
    example: "말레이시아에서 왔어요", exampleMean: "Tôi đến từ Ma-lai-xi-a",
    audioWord: "/audio/word_4.mp3", audioEx: "/audio/ex_4.mp3"
  },
];

// Định nghĩa các chế độ học
type StudyMode = 'flashcard' | 'quiz' | 'typing' | 'reading';

const studyModes: { key: StudyMode; name: string; icon: string }[] = [
    { key: 'flashcard', name: 'Flashcard', icon: '🎴' },
    { key: 'quiz', name: 'Trắc nghiệm', icon: '🕒' },
    { key: 'typing', name: 'Gõ từ vựng', icon: '⌨️' },
    { key: 'reading', name: 'Đọc hiểu', icon: '📖' },
];


// --- 2. HÀM CHÍNH (COMPONENT) ---
export default function LessonStudyPage() {
  const [currentMode, setCurrentMode] = useState<StudyMode>('flashcard'); // Chế độ mặc định
  const [currentIndex, setCurrentIndex] = useState(0); // Từ hiện tại đang học
  
  // State cho chế độ Flashcard
  const [isFlipped, setIsFlipped] = useState(false);

  // State cho chế độ Trắc nghiệm
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // State cho chế độ Gõ từ
  const [typedWord, setTypedWord] = useState('');

  const currentVocab = mockLessonData[currentIndex];
  const totalVocab = mockLessonData.length;

  // --- 3. XỬ LÝ LOGIC ---
  const handleNext = () => {
    // Reset các state phụ khi sang từ mới
    setIsFlipped(false);
    setSelectedAnswer(null);
    setTypedWord('');
    setCurrentIndex((prev) => (prev + 1) % totalVocab);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setSelectedAnswer(null);
    setTypedWord('');
    setCurrentIndex((prev) => (prev - 1 + totalVocab) % totalVocab);
  };

  const playAudio = (url?: string) => {
    if (url) {
      new Audio(url).play();
    }
  };


  const renderFlashcard = () => (
    <div className={styles.flashcard_container}>
      <div 
        className={`${styles.flashcard_card} ${isFlipped ? styles.flipped : ''}`} 
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <button className={styles.audio_btn_top} onClick={(e) => { e.stopPropagation(); playAudio(currentVocab.audioWord); }}>
          🔊
        </button>
        
        <div className={styles.card_content}>
          {isFlipped ? (
            <div>
              <h2 className={styles.card_mean}>{currentVocab.mean}</h2>
              <p className={styles.flip_hint}>Click để xem từ gốc</p>
            </div>
          ) : (
            <div>
              <h2 className={styles.card_word}>{currentVocab.word}</h2>
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
  // 4.2. Render Trắc nghiệm (Giả lập đáp án)
  const renderQuiz = () => {
    // Trong thực tế, bạn cần logic để tạo 3 đáp án sai từ các từ khác
    const options = [
        { id: currentVocab.id, text: currentVocab.mean },
        { id: 99, text: "Nhân viên công ty, nhân viên văn phòng" }, // Sai
        { id: 98, text: "Xin chào, Bạn có khỏe không?" }, // Sai
        { id: 97, text: "Úc, Australia" }, // Sai
    ];

    return (
        <div className={styles.study_area}>
            <div className={`${styles.question_card} styles.green`}>
                <p className={styles.q_text}>Nghĩa của từ này là gì?</p>
                <h2 className={styles.q_word}>{currentVocab.word}</h2>
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

  // 4.3. Render Gõ từ
  const renderTyping = () => (
    <div className={styles.study_area}>
        <div className={`${styles.question_card} ${styles.orange}`}>
            <p className={styles.q_text}>Gõ từ tiếng Hàn có nghĩa là:</p>
            <h2 className={styles.q_mean}>{currentVocab.mean}</h2>
        </div>
        <div className={styles.typing_area}>
            <input 
                type="text" 
                value={typedWord}
                onChange={(e) => setTypedWord(e.target.value)}
                placeholder="vd: 한국, 안녕하세요"
                className={styles.typing_input}
            />
            <button className={styles.check_btn}>Kiểm tra</button>
        </div>
    </div>
  );

  // 4.4. Render Đọc hiểu
  const renderReading = () => (
    <div className={styles.study_area}>
        <div className={`${styles.question_card} ${styles.yellow}`}>
            <h2 className={styles.q_example}>{currentVocab.example.replace('한국', '______')}</h2>
            <p className={styles.q_ex_mean}>{currentVocab.exampleMean}</p>
        </div>
        <div className={styles.answer_grid}>
            {/* Giả lập các từ để chọn */}
            <button className={styles.answer_btn}><span className={styles.ans_num}>1</span> 일본</button>
            <button className={`${styles.answer_btn} styles.selected`}><span className={styles.ans_num}>2</span> 한국</button>
            <button className={styles.answer_btn}><span className={styles.ans_num}>3</span> 안녕히 가세요</button>
            <button className={styles.answer_btn}><span className={styles.ans_num}>4</span> 영국</button>
        </div>
    </div>
  );


  // --- 5. RENDER CHÍNH ---
  return (
    <div className={styles.main_wrapper}>
      {/* 5.1. Header Section */}
      <header className={styles.header}>
        <Link href="/vocabularies" className={styles.back_link}>&lt; Danh sách bài</Link>
        <div className={styles.header_content}>
            <span className={styles.badge_yellow}>Bài 1</span>
            <span className={styles.total_text}>{totalVocab} từ vựng</span>
        </div>
        <h1 className={styles.lesson_title}>소개</h1>
        <p className={styles.lesson_sub}>Giới thiệu</p>
      </header>

      <main className={styles.study_main_section}>
        <div className={styles.top_controls}>
            <div className={styles.counter}>{currentIndex + 1} / {totalVocab}</div>
            <div className={styles.score_text}>Đúng: 0/0</div>
        </div>

        {currentMode === 'flashcard' && renderFlashcard()}
        {currentMode === 'quiz' && renderQuiz()}
        {currentMode === 'typing' && renderTyping()}
        {currentMode === 'reading' && renderReading()}
      </main>


      {/* 5.3. CHỌN CHẾ ĐỘ HỌC (Mode Selector) */}
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


      {/* 5.4. DANH SÁCH TỪ VỰNG BÊN DƯỚI */}
      <section className={styles.vocab_list_section}>
        <h3 className={styles.section_title}>Danh sách từ vựng ({totalVocab})</h3>
        <div className={styles.vocab_grid}>
            {mockLessonData.map((item, index) => (
                <div key={item.id} className={styles.vocab_item_card}>
                    <div className={styles.card_top}>
                        <div className={styles.word_area}>
                            <span className={styles.idx}>{index + 1}.</span>
                            <div className={styles.word_info}>
                                <h4 className={styles.k_word}>{item.word}</h4>
                                <p className={styles.l_word}>{item.latin}</p>
                                <p className={styles.v_word}>{item.mean}</p>
                            </div>
                        </div>
                        <button className={styles.audio_btn} onClick={() => playAudio(item.audioWord)}>🔊</button>
                    </div>
                    
                    <div className={styles.card_bottom}>
                        <div className={styles.ex_area}>
                            <p className={styles.k_ex}>{item.example}</p>
                            <p className={styles.v_ex}>{item.exampleMean}</p>
                        </div>
                        <button className={styles.audio_btn_sm} onClick={() => playAudio(item.audioEx)}>🔊</button>
                    </div>
                </div>
            ))}
        </div>
      </section>
    </div>
  );
}