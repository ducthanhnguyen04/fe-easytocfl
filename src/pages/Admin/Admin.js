import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import beUrl from '../../api-url/api-backend';
import { AuthContext } from '../../context/authContext';
import './Admin.css';

const Admin = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('levels');

  // Shared loaded data
  const [levels, setLevels] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [grammars, setGrammars] = useState([]);
  const [vocabularies, setVocabularies] = useState([]);
  const [examples, setExamples] = useState([]);

  // Loading & error status
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Form states
  // 1. Level form
  const [levelName, setLevelName] = useState('');
  const [levelCode, setLevelCode] = useState('');

  // 2. Lesson form
  const [lessonName, setLessonName] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonSlug, setLessonSlug] = useState('');
  const [lessonLevelId, setLessonLevelId] = useState('');
  const [lessonIsPremium, setLessonIsPremium] = useState(false);

  // 3. Grammar form
  const [grammarName, setGrammarName] = useState('');
  const [grammarStructure, setGrammarStructure] = useState('');
  const [grammarUsage, setGrammarUsage] = useState('');
  const [grammarNote, setGrammarNote] = useState('');
  const [grammarLessonId, setGrammarLessonId] = useState('');

  // 4. Example form
  const [exampleText, setExampleText] = useState('');
  const [exampleMeaning, setExampleMeaning] = useState('');
  const [examplePinyin, setExamplePinyin] = useState('');
  const [exampleAudioUrl, setExampleAudioUrl] = useState('');
  const [exampleGrammarId, setExampleGrammarId] = useState('');
  const [exampleVocabId, setExampleVocabId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [levelsRes, lessonsRes, grammarsRes, vocabRes, examplesRes] = await Promise.all([
        axios.get(`${beUrl}/levels/get-all`, { withCredentials: true }),
        axios.get(`${beUrl}/lessons/get-all`, { withCredentials: true }),
        axios.get(`${beUrl}/grammars/get-all`, { withCredentials: true }),
        axios.get(`${beUrl}/vocabularies/get-all`, { withCredentials: true }),
        axios.get(`${beUrl}/examples/get-all`, { withCredentials: true }),
      ]);

      setLevels(levelsRes.data.levels || []);
      setLessons(lessonsRes.data.lessons || []);
      setGrammars(grammarsRes.data.grammars || []);
      setVocabularies(vocabRes.data.vocabularies || []);
      setExamples(examplesRes.data.examples || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setActionError('Không thể tải dữ liệu từ server. Vui lòng kiểm tra lại kết nối.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const showError = (msg) => {
    setActionError(msg);
    setTimeout(() => setActionError(''), 4000);
  };

  // Submit Handlers
  const handleAddLevel = async (e) => {
    e.preventDefault();
    if (!levelName || !levelCode) {
      showError('Vui lòng nhập đầy đủ tên và mã cấp độ!');
      return;
    }
    try {
      const res = await axios.post(
        `${beUrl}/levels/create`,
        { levelName, level: levelCode },
        { withCredentials: true }
      );
      showSuccess('Thêm giáo trình (cấp độ) mới thành công!');
      setLevelName('');
      setLevelCode('');
      fetchData();
    } catch (error) {
      showError(error.response?.data?.message || 'Có lỗi xảy ra khi tạo giáo trình.');
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!lessonName || !lessonTitle || !lessonSlug || !lessonLevelId) {
      showError('Vui lòng điền đầy đủ các trường bắt buộc!');
      return;
    }
    try {
      await axios.post(
        `${beUrl}/lessons/create`,
        {
          lessonName,
          title: lessonTitle,
          slug: lessonSlug,
          levelId: parseInt(lessonLevelId),
          isPremium: lessonIsPremium,
        },
        { withCredentials: true }
      );
      showSuccess('Thêm bài học mới thành công!');
      setLessonName('');
      setLessonTitle('');
      setLessonSlug('');
      setLessonLevelId('');
      setLessonIsPremium(false);
      fetchData();
    } catch (error) {
      showError(error.response?.data?.message || 'Có lỗi xảy ra khi tạo bài học.');
    }
  };

  const handleAddGrammar = async (e) => {
    e.preventDefault();
    if (!grammarName || !grammarStructure || !grammarUsage || !grammarLessonId) {
      showError('Vui lòng điền đầy đủ thông tin cấu trúc ngữ pháp!');
      return;
    }
    try {
      await axios.post(
        `${beUrl}/grammars/create`,
        {
          grammar: grammarName,
          structure: grammarStructure,
          usage: grammarUsage,
          note: grammarNote,
          lessonId: parseInt(grammarLessonId),
        },
        { withCredentials: true }
      );
      showSuccess('Thêm mẫu ngữ pháp mới thành công!');
      setGrammarName('');
      setGrammarStructure('');
      setGrammarUsage('');
      setGrammarNote('');
      setGrammarLessonId('');
      fetchData();
    } catch (error) {
      showError(error.response?.data?.message || 'Có lỗi xảy ra khi tạo ngữ pháp.');
    }
  };

  const handleAddExample = async (e) => {
    e.preventDefault();
    if (!exampleText || !exampleMeaning || !examplePinyin) {
      showError('Vui lòng điền đầy đủ thông tin ví dụ mẫu!');
      return;
    }
    try {
      const payload = {
        example: exampleText,
        meaning: exampleMeaning,
        pinyin: examplePinyin,
        audioUrl: exampleAudioUrl || null,
        grammarId: exampleGrammarId ? parseInt(exampleGrammarId) : null,
        vocabularyId: exampleVocabId ? parseInt(exampleVocabId) : null,
      };
      await axios.post(`${beUrl}/examples/create`, payload, { withCredentials: true });
      showSuccess('Thêm ví dụ mẫu thành công!');
      setExampleText('');
      setExampleMeaning('');
      setExamplePinyin('');
      setExampleAudioUrl('');
      setExampleGrammarId('');
      setExampleVocabId('');
      fetchData();
    } catch (error) {
      showError(error.response?.data?.message || 'Có lỗi xảy ra khi tạo câu ví dụ.');
    }
  };

  // Delete Handlers
  const handleDeleteItem = async (route, id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mục này không? Thao tác này không thể hoàn tác.')) {
      return;
    }
    try {
      await axios.delete(`${beUrl}/${route}/delete/${id}`, { withCredentials: true });
      showSuccess('Xóa mục thành công!');
      fetchData();
    } catch (error) {
      showError(error.response?.data?.message || 'Có lỗi xảy ra khi xóa mục.');
    }
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

      {/* Admin Tab Navigation */}
      <div className="admin-tabs" style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <button
          className={`neo-btn tab-btn ${activeTab === 'levels' ? 'active' : ''}`}
          onClick={() => setActiveTab('levels')}
        >
          📚 Giáo Trình (Levels) <span className="tab-count-badge">{levels.length}</span>
        </button>
        <button
          className={`neo-btn tab-btn ${activeTab === 'lessons' ? 'active' : ''}`}
          onClick={() => setActiveTab('lessons')}
        >
          📖 Bài Học (Lessons) <span className="tab-count-badge">{lessons.length}</span>
        </button>
        <button
          className={`neo-btn tab-btn ${activeTab === 'grammars' ? 'active' : ''}`}
          onClick={() => setActiveTab('grammars')}
        >
          📝 Ngữ Pháp (Grammars) <span className="tab-count-badge">{grammars.length}</span>
        </button>
        <button
          className={`neo-btn tab-btn ${activeTab === 'examples' ? 'active' : ''}`}
          onClick={() => setActiveTab('examples')}
        >
          💡 Ví Dụ Mẫu (Examples) <span className="tab-count-badge">{examples.length}</span>
        </button>
      </div>

      <div className="admin-grid-layout">
        {/* Left: Input Form Card */}
        <div className="neo-card admin-form-card" style={{ padding: '25px' }}>
          {activeTab === 'levels' && (
            <form onSubmit={handleAddLevel} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 className="form-section-title">📚 Thêm Giáo Trình (Level)</h3>
              <div className="settings-input-group">
                <label className="settings-label">Tên giáo trình</label>
                <input
                  type="text"
                  className="settings-input"
                  placeholder="Ví dụ: Band A (Sơ cấp)"
                  value={levelName}
                  onChange={(e) => setLevelName(e.target.value)}
                  required
                />
              </div>
              <div className="settings-input-group">
                <label className="settings-label">Mã Cấp độ (Level code)</label>
                <input
                  type="text"
                  className="settings-input"
                  placeholder="Ví dụ: A"
                  value={levelCode}
                  onChange={(e) => setLevelCode(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="neo-btn neo-btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 25px' }}>
                Lưu giáo trình
              </button>
            </form>
          )}

          {activeTab === 'lessons' && (
            <form onSubmit={handleAddLesson} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 className="form-section-title">📖 Thêm Bài Học Mới</h3>
              <div className="settings-input-group">
                <label className="settings-label">Thuộc Giáo Trình</label>
                <select
                  className="settings-input"
                  value={lessonLevelId}
                  onChange={(e) => setLessonLevelId(e.target.value)}
                  required
                >
                  <option value="">-- Chọn giáo trình --</option>
                  {levels.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.levelName} (Cấp {lvl.level})
                    </option>
                  ))}
                </select>
              </div>
              <div className="settings-input-group">
                <label className="settings-label">Tên bài học</label>
                <input
                  type="text"
                  className="settings-input"
                  placeholder="Ví dụ: Bài 1"
                  value={lessonName}
                  onChange={(e) => setLessonName(e.target.value)}
                  required
                />
              </div>
              <div className="settings-input-group">
                <label className="settings-label">Tiêu đề bài học</label>
                <input
                  type="text"
                  className="settings-input"
                  placeholder="Ví dụ: Chào hỏi căn bản"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  required
                />
              </div>
              <div className="settings-input-group">
                <label className="settings-label">Đường dẫn tĩnh (Slug)</label>
                <input
                  type="text"
                  className="settings-input"
                  placeholder="Ví dụ: bai-1-chao-hoi"
                  value={lessonSlug}
                  onChange={(e) => setLessonSlug(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="isPremiumCheck"
                  checked={lessonIsPremium}
                  onChange={(e) => setLessonIsPremium(e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label htmlFor="isPremiumCheck" style={{ fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>
                  🔑 Bài học Premium (Yêu cầu tài khoản trả phí)
                </label>
              </div>
              <button type="submit" className="neo-btn neo-btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 25px' }}>
                Lưu bài học
              </button>
            </form>
          )}

          {activeTab === 'grammars' && (
            <form onSubmit={handleAddGrammar} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 className="form-section-title">📝 Thêm Cấu Trúc Ngữ Pháp</h3>
              <div className="settings-input-group">
                <label className="settings-label">Thuộc Bài Học (Lesson)</label>
                <select
                  className="settings-input"
                  value={grammarLessonId}
                  onChange={(e) => setGrammarLessonId(e.target.value)}
                  required
                >
                  <option value="">-- Chọn bài học --</option>
                  {lessons.map((ls) => (
                    <option key={ls.id} value={ls.id}>
                      {ls.lessonName} - {ls.title} ({levels.find(l => l.id === ls.levelId)?.levelName || `Level ID: ${ls.levelId}`})
                    </option>
                  ))}
                </select>
              </div>
              <div className="settings-input-group">
                <label className="settings-label">Mẫu ngữ pháp</label>
                <input
                  type="text"
                  className="settings-input"
                  placeholder="Ví dụ: 是...được"
                  value={grammarName}
                  onChange={(e) => setGrammarName(e.target.value)}
                  required
                />
              </div>
              <div className="settings-input-group">
                <label className="settings-label">Công thức cấu trúc</label>
                <input
                  type="text"
                  className="settings-input"
                  placeholder="Ví dụ: Chủ ngữ + 是 + [Trạng từ] + Động từ + 的"
                  value={grammarStructure}
                  onChange={(e) => setGrammarStructure(e.target.value)}
                  required
                />
              </div>
              <div className="settings-input-group">
                <label className="settings-label">Cách dùng / Ý nghĩa</label>
                <textarea
                  className="settings-input"
                  placeholder="Giải thích chi tiết cách sử dụng mẫu ngữ pháp này..."
                  style={{ minHeight: '80px', fontFamily: 'inherit' }}
                  value={grammarUsage}
                  onChange={(e) => setGrammarUsage(e.target.value)}
                  required
                />
              </div>
              <div className="settings-input-group">
                <label className="settings-label">Ghi chú thêm (Lưu ý)</label>
                <input
                  type="text"
                  className="settings-input"
                  placeholder="Ví dụ: Thường dùng với các động từ chỉ quá khứ..."
                  value={grammarNote}
                  onChange={(e) => setGrammarNote(e.target.value)}
                />
              </div>
              <button type="submit" className="neo-btn neo-btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 25px' }}>
                Lưu ngữ pháp
              </button>
            </form>
          )}

          {activeTab === 'examples' && (
            <form onSubmit={handleAddExample} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 className="form-section-title">💡 Thêm Ví Dụ Minh Họa</h3>
              <div className="settings-input-group">
                <label className="settings-label">Liên kết tới Ngữ pháp (Tùy chọn)</label>
                <select
                  className="settings-input"
                  value={exampleGrammarId}
                  onChange={(e) => setExampleGrammarId(e.target.value)}
                >
                  <option value="">-- Không liên kết / Chọn ngữ pháp --</option>
                  {grammars.map((gm) => (
                    <option key={gm.id} value={gm.id}>
                      {gm.grammar} ({lessons.find(ls => ls.id === gm.lessonId)?.lessonName})
                    </option>
                  ))}
                </select>
              </div>
              <div className="settings-input-group">
                <label className="settings-label">Liên kết tới Từ vựng (Tùy chọn)</label>
                <select
                  className="settings-input"
                  value={exampleVocabId}
                  onChange={(e) => setExampleVocabId(e.target.value)}
                >
                  <option value="">-- Không liên kết / Chọn từ vựng --</option>
                  {vocabularies.map((vc) => (
                    <option key={vc.id} value={vc.id}>
                      {vc.vocabulary} ({vc.meaning})
                    </option>
                  ))}
                </select>
              </div>
              <div className="settings-input-group">
                <label className="settings-label">Câu ví dụ (Phồn thể)</label>
                <input
                  type="text"
                  className="settings-input"
                  placeholder="Ví dụ: 我們是昨天坐飛機來的。"
                  value={exampleText}
                  onChange={(e) => setExampleText(e.target.value)}
                  required
                />
              </div>
              <div className="settings-input-group">
                <label className="settings-label">Phiên âm Pinyin</label>
                <input
                  type="text"
                  className="settings-input"
                  placeholder="Ví dụ: wǒmen shì zuótiān zuò fēijī lái de."
                  value={examplePinyin}
                  onChange={(e) => setExamplePinyin(e.target.value)}
                  required
                />
              </div>
              <div className="settings-input-group">
                <label className="settings-label">Dịch nghĩa tiếng Việt</label>
                <input
                  type="text"
                  className="settings-input"
                  placeholder="Ví dụ: Chúng tôi đi máy bay đến đây ngày hôm qua."
                  value={exampleMeaning}
                  onChange={(e) => setExampleMeaning(e.target.value)}
                  required
                />
              </div>
              <div className="settings-input-group">
                <label className="settings-label">Đường dẫn âm thanh câu phát âm (Audio URL - Tùy chọn)</label>
                <input
                  type="text"
                  className="settings-input"
                  placeholder="Ví dụ: /audios/examples/example1.mp3"
                  value={exampleAudioUrl}
                  onChange={(e) => setExampleAudioUrl(e.target.value)}
                />
              </div>
              <button type="submit" className="neo-btn neo-btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 25px' }}>
                Lưu ví dụ
              </button>
            </form>
          )}
        </div>

        {/* Right: Data List View Card */}
        <div className="neo-card admin-list-card" style={{ padding: '25px', maxHeight: '720px', overflowY: 'auto' }}>
          <h3 className="form-section-title" style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span> Danh Sách Hiện Tại</span>
            <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#e2e8f0', borderRadius: '10px' }}>
              Tổng cộng: {activeTab === 'levels' ? levels.length : activeTab === 'lessons' ? lessons.length : activeTab === 'grammars' ? grammars.length : examples.length}
            </span>
          </h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666', fontWeight: 'bold' }}>
              🔄 Đang cập nhật danh sách...
            </div>
          ) : (
            <div className="data-table-container">
              {activeTab === 'levels' && (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tên Giáo Trình</th>
                      <th>Mã Cấp Độ</th>
                      <th style={{ width: '80px' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {levels.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="empty-table-row">Chưa có giáo trình nào</td>
                      </tr>
                    ) : (
                      levels.map((lvl) => (
                        <tr key={lvl.id}>
                          <td>{lvl.id}</td>
                          <td style={{ fontWeight: '800' }}>{lvl.levelName}</td>
                          <td><span className="level-code-badge">{lvl.level}</span></td>
                          <td>
                            <button
                              className="delete-action-btn"
                              onClick={() => handleDeleteItem('levels', lvl.id)}
                            >
                              🗑️ Xóa
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {activeTab === 'lessons' && (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Bài học</th>
                      <th>Tiêu đề bài học</th>
                      <th>Giáo trình</th>
                      <th>Premium</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lessons.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="empty-table-row">Chưa có bài học nào</td>
                      </tr>
                    ) : (
                      lessons.map((ls) => {
                        const lvl = levels.find((l) => l.id === ls.levelId);
                        return (
                          <tr key={ls.id}>
                            <td>{ls.id}</td>
                            <td style={{ fontWeight: '800' }}>{ls.lessonName}</td>
                            <td>{ls.title}</td>
                            <td>{lvl ? lvl.levelName : `ID: ${ls.levelId}`}</td>
                            <td>{ls.isPremium ? '🔒 Có' : '🔓 Không'}</td>
                            <td>
                              <button
                                className="delete-action-btn"
                                onClick={() => handleDeleteItem('lessons', ls.id)}
                              >
                                🗑️ Xóa
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}

              {activeTab === 'grammars' && (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Ngữ pháp</th>
                      <th>Cấu trúc công thức</th>
                      <th>Bài học</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grammars.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="empty-table-row">Chưa có ngữ pháp nào</td>
                      </tr>
                    ) : (
                      grammars.map((gm) => {
                        const ls = lessons.find((l) => l.id === gm.lessonId);
                        return (
                          <tr key={gm.id}>
                            <td>{gm.id}</td>
                            <td style={{ fontWeight: '800', color: 'var(--color-primary)' }}>{gm.grammar}</td>
                            <td><code>{gm.structure}</code></td>
                            <td>{ls ? `${ls.lessonName} - ${ls.title}` : `ID: ${gm.lessonId}`}</td>
                            <td>
                              <button
                                className="delete-action-btn"
                                onClick={() => handleDeleteItem('grammars', gm.id)}
                              >
                                🗑️ Xóa
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}

              {activeTab === 'examples' && (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Câu Ví dụ</th>
                      <th>Dịch nghĩa</th>
                      <th>Liên kết ngữ pháp</th>
                      <th style={{ width: '80px' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examples.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="empty-table-row">Chưa có câu ví dụ nào</td>
                      </tr>
                    ) : (
                      examples.map((ex) => {
                        const gm = grammars.find((g) => g.id === ex.grammarId);
                        return (
                          <tr key={ex.id}>
                            <td>
                              <div style={{ fontWeight: '800', fontSize: '15px' }}>{ex.example}</div>
                              <div style={{ color: '#666', fontSize: '12px', fontStyle: 'italic' }}>{ex.pinyin}</div>
                            </td>
                            <td>{ex.meaning}</td>
                            <td>{gm ? gm.grammar : 'Không'}</td>
                            <td>
                              <button
                                className="delete-action-btn"
                                onClick={() => handleDeleteItem('examples', ex.id)}
                              >
                                🗑️ Xóa
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
