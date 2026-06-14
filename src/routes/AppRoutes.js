import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Roadmap from '../pages/Roadmap';
import Vocabulary from '../pages/Vocabulary';
import Grammar from '../pages/Grammar';
import Exam from '../pages/Exam';
import Leaderboard from '../pages/Leaderboard';
import Settings from '../pages/Settings';
import Admin from '../pages/Admin';
import AdminRoute from '../adminRoutes/adminRoute';

const AppRoutes = ({
  dailyWord,
  handleWordLearned,
  playAudio,
  startQuiz,
  vocabWords,
  toggleVocabLearned,
  resetVocabProgress
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
        element={<Settings resetVocabProgress={resetVocabProgress} />}
      />

      {/* Protected Admin Route */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Admin />
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
