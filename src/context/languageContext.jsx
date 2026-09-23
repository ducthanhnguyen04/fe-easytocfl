import React, { createContext, useContext, useState } from 'react';

export const translations = {
  vi: {
    mainLearning: "Học tập chính",
    home: "Trang chủ",
    vocabulary: "Từ vựng",
    radicals: "214 bộ thủ",
    myVocabulary: "Sổ tay từ vựng",
    writingPractice: "Tạo file luyện viết",
    grammar: "Ngữ pháp",
    shadowing: "Shadowing",
    roleplay: "Hội thoại nhập vai",
    practiceExam: "Đề thi thử",
    leaderboard: "Bảng xếp hạng",
    settings: "Cài đặt",
    admin: "Quản trị (Admin)",
    lightMode: "Chế độ sáng",
    darkMode: "Chế độ tối",
    loginRegister: "Đăng nhập / Đăng ký",
    logout: "Đăng xuất",
    verifying: "Đang xác thực...",

    settingsTitle: "Cài Đặt Hệ Thống",
    settingsDesc: "Tuỳ chỉnh tài khoản, ngôn ngữ, đổi mật khẩu và thiết lập học tập của bạn",
    appLanguage: "🌐 Ngôn ngữ ứng dụng (App Language)",
    appLanguageDesc: "Chọn ngôn ngữ hiển thị giao diện và giải nghĩa từ vựng / ví dụ",
    appThemes: "🎨 Giao diện ứng dụng (Themes)",
    streakStats: "🔥 Thống Kê & Kỷ Lục Chuỗi Học Tập",
    longestStreak: "Kỷ lục chuỗi dài nhất",
    currentStreak: "Chuỗi học hiện tại",
    todayStudyTime: "Hôm nay đã học",
    days: "ngày",
    minutes: "phút",
    accountInfo: "👤 Thông tin tài khoản",
    fullName: "Họ và Tên",
    emailAddr: "Địa chỉ Email",
    avatar: "Ảnh đại diện (Avatar)",
    selectAvatar: "Chọn ảnh",
    deleteAvatar: "Xoá",
    saveChanges: "Lưu thay đổi",
    changePassword: "🔑 Đổi mật khẩu",
    currentPassword: "Mật khẩu hiện tại",
    newPassword: "Mật khẩu mới",
    confirmPassword: "Xác nhận mật khẩu mới",
    updatePassword: "Cập nhật mật khẩu",

    bookList: "← Danh sách sách",
    lessonList: "← Quay lại danh sách bài",
    reviewAll: "🔁 Tổng ôn tập",
    startReview: "🚀 Bắt đầu ôn tập",
    cancel: "Hủy",
    wordsCount: "từ vựng",
    learnedCount: "Đã thuộc",
    selectMode: "Chọn chế độ học",
    flashcardMode: "Flashcard",
    conversationMode: "Bài khóa",
    quizMode: "Trắc nghiệm",
    typingMode: "Gõ từ vựng",
    dictationMode: "Nghe chép",
    printPractice: "In tập viết",

    vocab: "Từ vựng",
    example: "Ví dụ",
    autoPlay: "▶ Tự động phát",
    stopPlay: "⏹ Dừng phát",
    prev: "← Trước",
    next: "Sau →",
    roundProgress: "📖 Tiến độ",
    roundCompleted: "🎉 Đã hoàn thành! 🔄 Học lại từ đầu",

    whatMeaning: "Nghĩa của từ này là gì?",
    correct: "Đúng",
    incorrect: "Sai",
    scoreRate: "Tỉ lệ",
    redoQuiz: "🔄 Làm lại trắc nghiệm",

    leaderboardTitle: "Bảng Xếp Hạng Học Viên",
    leaderboardDesc: "Thi đua học tập cùng các học viên khác trên hệ thống. Top học viên tích cực trong tuần.",
    rank: "Hạng",
    learnedWordsStat: "từ vựng",
    examsStat: "Đề thi",

    loading: "Đang tải...",
    success: "Thành công!",
    error: "Có lỗi xảy ra!"
  },
  en: {
    mainLearning: "Main Learning",
    home: "Home",
    vocabulary: "Vocabulary",
    radicals: "214 Radicals",
    myVocabulary: "Vocabulary Notebook",
    writingPractice: "Writing Worksheets",
    grammar: "Grammar",
    shadowing: "Shadowing",
    roleplay: "Roleplay Dialogue",
    practiceExam: "Mock Exam",
    leaderboard: "Leaderboard",
    settings: "Settings",
    admin: "Admin Control",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    loginRegister: "Login / Register",
    logout: "Logout",
    verifying: "Authenticating...",

    settingsTitle: "System Settings",
    settingsDesc: "Customize your account, language, password, and study preferences",
    appLanguage: "🌐 App Language",
    appLanguageDesc: "Choose UI display language and vocabulary / example translations",
    appThemes: "🎨 App Themes",
    streakStats: "🔥 Study Streak Statistics",
    longestStreak: "Longest Streak Record",
    currentStreak: "Current Study Streak",
    todayStudyTime: "Study Time Today",
    days: "days",
    minutes: "mins",
    accountInfo: "👤 Account Information",
    fullName: "Full Name",
    emailAddr: "Email Address",
    avatar: "Profile Avatar",
    selectAvatar: "Choose Image",
    deleteAvatar: "Remove",
    saveChanges: "Save Changes",
    changePassword: "🔑 Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    updatePassword: "Update Password",

    bookList: "← Books List",
    lessonList: "← Back to Lessons",
    reviewAll: "🔁 Comprehensive Review",
    startReview: "🚀 Start Review",
    cancel: "Cancel",
    wordsCount: "words",
    learnedCount: "Mastered",
    selectMode: "Select Study Mode",
    flashcardMode: "Flashcards",
    conversationMode: "Dialogue Text",
    quizMode: "Quiz",
    typingMode: "Vocab Typing",
    dictationMode: "Dictation",
    printPractice: "Print Worksheets",

    vocab: "Vocabulary",
    example: "Examples",
    autoPlay: "▶ Autoplay",
    stopPlay: "⏹ Stop Play",
    prev: "← Prev",
    next: "Next →",
    roundProgress: "📖 Progress",
    roundCompleted: "🎉 Round Completed! 🔄 Restart Deck",

    whatMeaning: "What is the meaning of this word?",
    correct: "Correct",
    incorrect: "Incorrect",
    scoreRate: "Score Rate",
    redoQuiz: "🔄 Retake Quiz",

    leaderboardTitle: "Student Leaderboard",
    leaderboardDesc: "Compete with fellow learners on the platform. Top active students this week.",
    rank: "Rank",
    learnedWordsStat: "words learned",
    examsStat: "Exams taken",

    loading: "Loading...",
    success: "Success!",
    error: "An error occurred!"
  },
  id: {
    mainLearning: "Pembelajaran Utama",
    home: "Beranda",
    vocabulary: "Kosakata",
    radicals: "214 Radikal",
    myVocabulary: "Buku Catatan Kosakata",
    writingPractice: "Lembar Latihan Menulis",
    grammar: "Tata Bahasa",
    shadowing: "Shadowing",
    roleplay: "Bermain Peran Percakapan",
    practiceExam: "Ujian Simulasi",
    leaderboard: "Papan Peringkat",
    settings: "Pengaturan",
    admin: "Kontrol Admin",
    lightMode: "Mode Terang",
    darkMode: "Mode Gelap",
    loginRegister: "Masuk / Daftar",
    logout: "Keluar",
    verifying: "Memverifikasi...",

    settingsTitle: "Pengaturan Sistem",
    settingsDesc: "Sesuaikan akun, bahasa, kata sandi, dan preferensi belajar Anda",
    appLanguage: "🌐 Bahasa Aplikasi (App Language)",
    appLanguageDesc: "Pilih bahasa antarmuka dan terjemahan kosakata / contoh kalimat",
    appThemes: "🎨 Tema Aplikasi",
    streakStats: "🔥 Statistik Rentetan Belajar",
    longestStreak: "Rekor Rentetan Terpanjang",
    currentStreak: "Rentetan Saat Ini",
    todayStudyTime: "Waktu Belajar Hari Ini",
    days: "hari",
    minutes: "menit",
    accountInfo: "👤 Informasi Akun",
    fullName: "Nama Lengkap",
    emailAddr: "Alamat Email",
    avatar: "Foto Profil (Avatar)",
    selectAvatar: "Pilih Gambar",
    deleteAvatar: "Hapus",
    saveChanges: "Simpan Perubahan",
    changePassword: "🔑 Ubah Kata Sandi",
    currentPassword: "Kata Sandi Saat Ini",
    newPassword: "Kata Sandi Baru",
    confirmPassword: "Konfirmasi Kata Sandi Baru",
    updatePassword: "Perbarui Kata Sandi",

    bookList: "← Daftar Buku",
    lessonList: "← Kembali ke Daftar Pelajaran",
    reviewAll: "🔁 Ulasan Menyeluruh",
    startReview: "🚀 Mulai Ulasan",
    cancel: "Batal",
    wordsCount: "kosakata",
    learnedCount: "Dikuasai",
    selectMode: "Pilih Mode Belajar",
    flashcardMode: "Kartu Kilat (Flashcard)",
    conversationMode: "Teks Percakapan",
    quizMode: "Kuis Pilihan Ganda",
    typingMode: "Mengetik Kosakata",
    dictationMode: "Mendikte & Menulis",
    printPractice: "Cetak Lembar Kerja",

    vocab: "Kosakata",
    example: "Contoh Kalimat",
    autoPlay: "▶ Putar Otomatis",
    stopPlay: "⏹ Hentikan",
    prev: "← Sblm",
    next: "Lanjut →",
    roundProgress: "📖 Kemajuan",
    roundCompleted: "🎉 Putaran Selesai! 🔄 Mulai Ulang",

    whatMeaning: "Apa arti dari kata ini?",
    correct: "Benar",
    incorrect: "Salah",
    scoreRate: "Tingkat Skor",
    redoQuiz: "🔄 Ulangi Kuis",

    leaderboardTitle: "Papan Peringkat Siswa",
    leaderboardDesc: "Bersaing dengan sesama pembelajar di platform. Siswa paling aktif minggu ini.",
    rank: "Peringkat",
    learnedWordsStat: "kosakata dipelajari",
    examsStat: "Ujian diselesaikan",

    loading: "Memuat...",
    success: "Berhasil!",
    error: "Terjadi kesalahan!"
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('app_language') || 'vi';
  });

  const changeLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key) => {
    const langDict = translations[language] || translations.vi;
    return langDict[key] || translations.vi[key] || key;
  };

  const getVocabMeaning = (vocab) => {
    if (!vocab) return '';
    if (language === 'id' && vocab.indonesianMeaning) {
      return vocab.indonesianMeaning;
    }
    if (language === 'en' && vocab.englishMeaning) {
      return vocab.englishMeaning;
    }
    return vocab.trans || vocab.meaning || vocab.englishMeaning || vocab.indonesianMeaning || '';
  };

  const getExampleMeaning = (ex) => {
    if (!ex) return '';
    if (language === 'id' && ex.indonesianMeaning) {
      return ex.indonesianMeaning;
    }
    if (language === 'en' && ex.englishMeaning) {
      return ex.englishMeaning;
    }
    return ex.meaning || ex.englishMeaning || ex.indonesianMeaning || '';
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t,
        getVocabMeaning,
        getExampleMeaning
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'vi',
      changeLanguage: () => {},
      t: (key) => translations.vi[key] || key,
      getVocabMeaning: (v) => v?.trans || v?.meaning || '',
      getExampleMeaning: (e) => e?.meaning || ''
    };
  }
  return context;
};
