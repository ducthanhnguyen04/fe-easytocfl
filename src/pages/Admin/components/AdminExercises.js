import React, { useState } from 'react';
import axios from 'axios';

const AdminExercises = ({
  excersises,
  grammars,
  lessons,
  onRefresh,
  beUrl,
  showError,
  showSuccess,
}) => {
  const [excersiseTitle, setExcersiseTitle] = useState('');
  const [excersiseMeaning, setExcersiseMeaning] = useState('');
  const [excersiseEnglishMeaning, setExcersiseEnglishMeaning] = useState('');
  const [excersiseGrammarId, setExcersiseGrammarId] = useState('');
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const resetForm = () => {
    setEditId(null);
    setExcersiseTitle('');
    setExcersiseMeaning('');
    setExcersiseEnglishMeaning('');
    setExcersiseGrammarId('');
  };

  const handleSaveExcersise = async (e) => {
    e.preventDefault();
    if (!excersiseTitle || !excersiseMeaning || !excersiseEnglishMeaning || !excersiseGrammarId) {
      showError('Vui lòng điền đầy đủ các trường bắt buộc!');
      return;
    }
    try {
      const payload = {
        title: excersiseTitle,
        meaning: excersiseMeaning,
        englishMeaning: excersiseEnglishMeaning,
        grammarId: parseInt(excersiseGrammarId),
      };
      if (editId) {
        await axios.put(
          `${beUrl}/excersises/update/${editId}`,
          payload,
          { withCredentials: true }
        );
        showSuccess('Cập nhật bài tập thành công!');
      } else {
        await axios.post(
          `${beUrl}/excersises/create`,
          payload,
          { withCredentials: true }
        );
        showSuccess('Thêm bài tập mới thành công!');
      }
      resetForm();
      onRefresh();
    } catch (error) {
      showError(error.response?.data?.message || 'Có lỗi xảy ra khi lưu bài tập.');
    }
  };

  const handleEditClick = (item) => {
    setEditId(item.id);
    setExcersiseTitle(item.title || '');
    setExcersiseMeaning(item.meaning || '');
    setExcersiseEnglishMeaning(item.englishMeaning || '');
    setExcersiseGrammarId(item.grammarId || '');
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài tập này không? Thao tác này không thể hoàn tác.')) {
      return;
    }
    try {
      await axios.delete(`${beUrl}/excersises/delete/${id}`, { withCredentials: true });
      showSuccess('Xóa mục thành công!');
      if (editId === id) {
        resetForm();
      }
      onRefresh();
    } catch (error) {
      console.error('Delete item error:', error);
      const errMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Có lỗi xảy ra khi xóa mục.';
      showError(errMsg);
    }
  };

  const filteredExercises = excersises.filter((ex) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const gm = grammars.find((g) => g.id === ex.grammarId);
    return (
      ex.id?.toString().includes(query) ||
      ex.title?.toLowerCase().includes(query) ||
      ex.meaning?.toLowerCase().includes(query) ||
      ex.englishMeaning?.toLowerCase().includes(query) ||
      (gm && gm.grammar?.toLowerCase().includes(query))
    );
  });

  return (
    <>
      <div className="neo-card admin-form-card" style={{ padding: '25px' }}>
        <form onSubmit={handleSaveExcersise} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 className="form-section-title">
            {editId ? `✏️ Sửa Bài Tập (ID: ${editId})` : '🎯 Thêm Bài Tập Mới'}
          </h3>
          <div className="settings-input-group">
            <label className="settings-label">Thuộc Ngữ Pháp *</label>
            <select
              className="settings-input"
              value={excersiseGrammarId}
              onChange={(e) => setExcersiseGrammarId(e.target.value)}
              required
            >
              <option value="">-- Chọn điểm ngữ pháp --</option>
              {grammars.map((gm) => (
                <option key={gm.id} value={gm.id}>
                  {gm.grammar} ({lessons.find(ls => ls.id === gm.lessonId)?.lessonName})
                </option>
              ))}
            </select>
          </div>
          <div className="settings-input-group">
            <label className="settings-label">Đề bài (Bài tập tiếng Trung) *</label>
            <input
              type="text"
              className="settings-input"
              placeholder="Ví dụ: 我___昨天來的。(填: 是)"
              value={excersiseTitle}
              onChange={(e) => setExcersiseTitle(e.target.value)}
              required
            />
          </div>
          <div className="settings-input-group">
            <label className="settings-label">Đáp án / Giải nghĩa Việt *</label>
            <input
              type="text"
              className="settings-input"
              placeholder="Ví dụ: 是 (Dịch: Tôi là đến ngày hôm qua)"
              value={excersiseMeaning}
              onChange={(e) => setExcersiseMeaning(e.target.value)}
              required
            />
          </div>
          <div className="settings-input-group">
            <label className="settings-label">Đáp án / Giải nghĩa Anh *</label>
            <input
              type="text"
              className="settings-input"
              placeholder="Ví dụ: 是 (Meaning: I came yesterday)"
              value={excersiseEnglishMeaning}
              onChange={(e) => setExcersiseEnglishMeaning(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="neo-btn neo-btn-primary" style={{ padding: '12px 25px' }}>
              {editId ? 'Cập nhật' : 'Lưu bài tập'}
            </button>
            {editId && (
              <button type="button" className="neo-btn" onClick={resetForm} style={{ padding: '12px 25px', backgroundColor: 'var(--color-bg)' }}>
                Hủy sửa
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="neo-card admin-list-card" style={{ padding: '25px', maxHeight: '720px', overflowY: 'auto' }}>
        <h3 className="form-section-title" style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span> Danh Sách Hiện Tại</span>
          <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#e2e8f0', borderRadius: '10px' }}>
            {searchQuery ? `Tìm thấy: ${filteredExercises.length} / ${excersises.length}` : `Tổng cộng: ${excersises.length}`}
          </span>
        </h3>

        <div className="admin-search-container">
          <input
            type="text"
            className="admin-search-input"
            placeholder="🔍 Tìm theo ID, đề bài, giải nghĩa, cấu trúc ngữ pháp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="admin-search-clear" onClick={() => setSearchQuery('')}>
              Hủy tìm
            </button>
          )}
        </div>

        <div className="data-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Bài Tập (Đề bài)</th>
                <th>Đáp án (VI)</th>
                <th>Cấu trúc ngữ pháp</th>
                <th style={{ width: '150px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredExercises.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-table-row">
                    {searchQuery ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có bài tập nào'}
                  </td>
                </tr>
              ) : (
                filteredExercises.map((ex) => {
                  const gm = grammars.find((g) => g.id === ex.grammarId);
                  return (
                    <tr key={ex.id}>
                      <td>{ex.id}</td>
                      <td style={{ fontWeight: '800' }}>{ex.title}</td>
                      <td>{ex.meaning}</td>
                      <td>{gm ? gm.grammar : `Grammar ID: ${ex.grammarId}`}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="edit-action-btn"
                            onClick={() => handleEditClick(ex)}
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            className="delete-action-btn"
                            onClick={() => handleDeleteItem(ex.id)}
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminExercises;
