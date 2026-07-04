import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home/Home';
import Roadmap from '../pages/Roadmap/Roadmap';
import Vocabulary from '../pages/Vocabulary/Vocabulary';
import Grammar from '../pages/Grammar/Grammar';
import Exam from '../pages/Exam/Exam';
import Leaderboard from '../pages/Leaderboard/Leaderboard';
import Settings from '../pages/Settings/Settings';
import Admin from '../pages/Admin/Admin';
import AdminRoute from '../adminRoutes/adminRoute';
import Radicals from '../pages/Radicals/Radicals';

const AppRoutes = ({
  dailyWord,
  handleWordLearned,
  playAudio,
  startQuiz,
  vocabWords,
  toggleVocabLearned,
  resetVocabProgress,
  refreshGlobalData,
  activeTheme,
  handleThemeChange
}) => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Home
            dailyWord={dailyWord}
            handleWordLearned={handleWordLearned}
            playAudio={playAudio}
          />
        }
      />
      <Route
        path="/home"
        element={<Navigate to="/" replace />}
      />
      <Route
        path="/roadmap"
        element={<Roadmap startQuiz={startQuiz} />}
      />

      {/* Vocabulary Module Subroutes */}
      <Route
        path="/vocab"
        element={
          <Vocabulary
            vocabWords={vocabWords}
            toggleVocabLearned={toggleVocabLearned}
            playAudio={playAudio}
          />
        }
      />
      <Route
        path="/vocab/:bookId"
        element={
          <Vocabulary
            vocabWords={vocabWords}
            toggleVocabLearned={toggleVocabLearned}
            playAudio={playAudio}
          />
        }
      />
      <Route
        path="/vocab/:bookId/:lessonId"
        element={
          <Vocabulary
            vocabWords={vocabWords}
            toggleVocabLearned={toggleVocabLearned}
            playAudio={playAudio}
          />
        }
      />

      <Route
        path="/radicals"
        element={<Radicals />}
      />

      {/* Grammar Module Subroutes */}
      <Route
        path="/grammar"
        element={<Grammar playAudio={playAudio} />}
      />
      <Route
        path="/grammar/:bookId"
        element={<Grammar playAudio={playAudio} />}
      />
      <Route
        path="/grammar/:bookId/:lessonId"
        element={<Grammar playAudio={playAudio} />}
      />
      <Route
        path="/grammar/:bookId/:lessonId/:grammarPointId"
        element={<Grammar playAudio={playAudio} />}
      />

      <Route
        path="/exam"
        element={<Exam startQuiz={startQuiz} />}
      />
      <Route
        path="/leaderboard"
        element={<Leaderboard />}
      />
      <Route
        path="/settings"
        element={
          <Settings 
            resetVocabProgress={resetVocabProgress} 
            activeTheme={activeTheme}
            handleThemeChange={handleThemeChange}
          />
        }
      />

      {/* Protected Admin Route */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Admin refreshGlobalData={refreshGlobalData} />
          </AdminRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
};

export default AppRoutes;
