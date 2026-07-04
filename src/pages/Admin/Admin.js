import React, { useState, useEffect } from 'react';
import axios from 'axios';
import beUrl from '../../api-url/api-backend';
import { cacheService } from '../../utils/cacheService';
import './Admin.css';

import AdminLevels from './components/AdminLevels';
import AdminLessons from './components/AdminLessons';
import AdminVocabularies from './components/AdminVocabularies';
import AdminGrammars from './components/AdminGrammars';
import AdminExamples from './components/AdminExamples';
import AdminRadicals from './components/AdminRadicals';
import AdminUsers from './components/AdminUsers';
import AdminExercises from './components/AdminExercises';

const Admin = ({ refreshGlobalData }) => {
  const [activeTab, setActiveTab] = useState('levels');

  // Shared loaded data
  const [levels, setLevels] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [grammars, setGrammars] = useState([]);
  const [vocabularies, setVocabularies] = useState([]);
  const [examples, setExamples] = useState([]);
  const [radicals, setRadicals] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [excersises, setExcersises] = useState([]);

  // Loading & error status
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [levelsRes, lessonsRes, grammarsRes, vocabRes, examplesRes, radicalsRes, usersRes, excersisesRes] = await Promise.all([
        axios.get(`${beUrl}/levels/get-all`, { withCredentials: true }),
        axios.get(`${beUrl}/lessons/get-all`, { withCredentials: true }),
        axios.get(`${beUrl}/grammars/get-all`, { withCredentials: true }),
        axios.get(`${beUrl}/vocabularies/get-all`, { withCredentials: true }),
        axios.get(`${beUrl}/examples/get-all`, { withCredentials: true }),
        axios.get(`${beUrl}/radicals/get-all`, { withCredentials: true }),
        axios.get(`${beUrl}/users/admin/get-all`, { withCredentials: true }),
        axios.get(`${beUrl}/excersises/get-all`, { withCredentials: true }),
      ]);

      setLevels(levelsRes.data.levels || []);
      setLessons(lessonsRes.data.lessons || []);
      setGrammars(grammarsRes.data.grammars || []);
      setVocabularies(vocabRes.data.vocabularies || []);
      setExamples(examplesRes.data.examples || []);
      setRadicals(radicalsRes.data.radicals || []);
      setUsersList(usersRes.data.users || []);
      setExcersises(excersisesRes.data.excersises || []);

    } catch (error) {
      console.error('Error fetching admin data:', error);
      setActionError('Không thể tải dữ liệu từ server. Vui lòng kiểm tra lại kết nối.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    cacheService.clear(); // invalidate cache on client whenever updates are made
    if (typeof refreshGlobalData === 'function') {
      refreshGlobalData();
    }
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const showError = (msg) => {
    setActionError(msg);
    setTimeout(() => setActionError(''), 4000);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="admin-container">
      <div className="page-title-banner" style={{ marginBottom: '30px' }}>
        <div>
          <h2>🛡️ Hệ Thống Quản Trị (CMS)</h2>
          <p>Thêm và cập nhật nội dung giáo trình, bài học, ngữ pháp và ví dụ cho ứng dụng</p>
        </div>
        <button className="neo-btn" style={{ backgroundColor: 'var(--color-white)' }} onClick={fetchData} disabled={loading}>
          {loading ? 'Đang tải...' : '🔄 Làm mới dữ liệu'}
        </button>
      </div>

      {actionSuccess && <div className="settings-alert-success" style={{ marginBottom: '25px' }}>✓ {actionSuccess}</div>}
      {actionError && <div className="settings-alert-error" style={{ marginBottom: '25px' }}>⚠ {actionError}</div>}

      <div className="admin-tabs" style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <button
          className={`neo-btn tab-btn ${activeTab === 'levels' ? 'active' : ''}`}
          onClick={() => handleTabChange('levels')}
        >
          📚 Giáo Trình (Levels) <span className="tab-count-badge">{levels.length}</span>
        </button>
        <button
          className={`neo-btn tab-btn ${activeTab === 'lessons' ? 'active' : ''}`}
          onClick={() => handleTabChange('lessons')}
        >
          📖 Bài Học (Lessons) <span className="tab-count-badge">{lessons.length}</span>
        </button>
        <button
          className={`neo-btn tab-btn ${activeTab === 'vocabularies' ? 'active' : ''}`}
          onClick={() => handleTabChange('vocabularies')}
        >
          🔤 Từ Vựng (Vocabularies) <span className="tab-count-badge">{vocabularies.length}</span>
        </button>
        <button
          className={`neo-btn tab-btn ${activeTab === 'grammars' ? 'active' : ''}`}
          onClick={() => handleTabChange('grammars')}
        >
          📝 Ngữ Pháp (Grammars) <span className="tab-count-badge">{grammars.length}</span>
        </button>
        <button
          className={`neo-btn tab-btn ${activeTab === 'examples' ? 'active' : ''}`}
          onClick={() => handleTabChange('examples')}
        >
          💡 Ví Dụ Mẫu (Examples) <span className="tab-count-badge">{examples.length}</span>
        </button>
        <button
          className={`neo-btn tab-btn ${activeTab === 'radicals' ? 'active' : ''}`}
          onClick={() => handleTabChange('radicals')}
        >
          部 Bộ Thủ (Radicals) <span className="tab-count-badge">{radicals.length}</span>
        </button>
        <button
          className={`neo-btn tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => handleTabChange('users')}
        >
          👥 Người Dùng (Users) <span className="tab-count-badge">{usersList.length}</span>
        </button>
        <button
          className={`neo-btn tab-btn ${activeTab === 'excersises' ? 'active' : ''}`}
          onClick={() => handleTabChange('excersises')}
        >
          🎯 Bài Tập (Exercises) <span className="tab-count-badge">{excersises.length}</span>
        </button>
      </div>

      <div className="admin-grid-layout">
        {activeTab === 'levels' && (
          <AdminLevels
            levels={levels}
            onRefresh={fetchData}
            beUrl={beUrl}
            showError={showError}
            showSuccess={showSuccess}
          />
        )}
        {activeTab === 'lessons' && (
          <AdminLessons
            lessons={lessons}
            levels={levels}
            onRefresh={fetchData}
            beUrl={beUrl}
            showError={showError}
            showSuccess={showSuccess}
          />
        )}
        {activeTab === 'vocabularies' && (
          <AdminVocabularies
            vocabularies={vocabularies}
            lessons={lessons}
            levels={levels}
            onRefresh={fetchData}
            beUrl={beUrl}
            showError={showError}
            showSuccess={showSuccess}
            setLoading={setLoading}
            loading={loading}
          />
        )}
        {activeTab === 'grammars' && (
          <AdminGrammars
            grammars={grammars}
            lessons={lessons}
            levels={levels}
            onRefresh={fetchData}
            beUrl={beUrl}
            showError={showError}
            showSuccess={showSuccess}
          />
        )}
        {activeTab === 'examples' && (
          <AdminExamples
            examples={examples}
            grammars={grammars}
            vocabularies={vocabularies}
            lessons={lessons}
            onRefresh={fetchData}
            beUrl={beUrl}
            showError={showError}
            showSuccess={showSuccess}
          />
        )}
        {activeTab === 'radicals' && (
          <AdminRadicals
            radicals={radicals}
            onRefresh={fetchData}
            beUrl={beUrl}
            showError={showError}
            showSuccess={showSuccess}
          />
        )}
        {activeTab === 'users' && (
          <AdminUsers
            usersList={usersList}
            onRefresh={fetchData}
            beUrl={beUrl}
            showError={showError}
            showSuccess={showSuccess}
          />
        )}
        {activeTab === 'excersises' && (
          <AdminExercises
            excersises={excersises}
            grammars={grammars}
            lessons={lessons}
            onRefresh={fetchData}
            beUrl={beUrl}
            showError={showError}
            showSuccess={showSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default Admin;
