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
      showError('Vui lòng điền đầy đủ thông tin bài tập!');
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
    if (!window.confirm('Bạn có chắc chắn muốn xóa mục này không? Thao tác này không thể hoàn tác.')) {
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

  return (
    <>
      <div className="neo-card admin-form-card" style={{ padding: '25px' }}>
        <form onSubmit={handleSaveExcersise} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 className="form-section-title">
            {editId ? `✏️ Sửa Bài Tập (ID: ${editId})` : '🎯 Thêm Bài Tập Mới'}
          </h3>
          <div className="settings-input-group">
            <label className="settings-label">Thuộc Cấu Trúc Ngữ Pháp *</label>
            <select
              className="settings-input"
              value={excersiseGrammarId}
              onChange={(e) => setExcersiseGrammarId(e.target.value)}
              required
            >
              <option value="">-- Chọn cấu trúc ngữ pháp --</option>
              {grammars.map((gm) => (
                <option key={gm.id} value={gm.id}>
                  {gm.grammar} ({lessons.find(ls => ls.id === gm.lessonId)?.lessonName})
                </option>
              ))}
            </select>
          </div>
          <div className="settings-input-group">
            <label className="settings-label">Câu hỏi / Đề bài (Tiếng Trung) *</label>
            <textarea
              className="settings-input"
              placeholder="Ví dụ: 請翻譯這句：我是昨天坐飛機來的。"
              style={{ minHeight: '60px', fontFamily: 'inherit' }}
              value={excersiseTitle}
              onChange={(e) => setExcersiseTitle(e.target.value)}
              required
            />
          </div>
          <div className="settings-input-group">
            <label className="settings-label">Đáp án / Giải nghĩa tiếng Việt *</label>
            <textarea
              className="settings-input"
              placeholder="Ví dụ: Tôi đi máy bay đến đây ngày hôm qua."
              style={{ minHeight: '60px', fontFamily: 'inherit' }}
              value={excersiseMeaning}
              onChange={(e) => setExcersiseMeaning(e.target.value)}
              required
            />
          </div>
          <div className="settings-input-group">
            <label className="settings-label">Đáp án / Giải nghĩa tiếng Anh *</label>
            <textarea
              className="settings-input"
              placeholder="Ví dụ: I came by plane yesterday."
              style={{ minHeight: '60px', fontFamily: 'inherit' }}
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
            Tổng cộng: {excersises.length}
          </span>
        </h3>

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
              {excersises.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-table-row">Chưa có bài tập nào</td>
                </tr>
              ) : (
                excersises.map((ex) => {
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
