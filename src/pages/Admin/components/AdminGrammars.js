import React, { useState } from 'react';
import axios from 'axios';

const AdminGrammars = ({
  grammars,
  lessons,
  levels,
  onRefresh,
  beUrl,
  showError,
  showSuccess,
}) => {
  const [grammarName, setGrammarName] = useState('');
  const [grammarStructure, setGrammarStructure] = useState('');
  const [grammarUsage, setGrammarUsage] = useState('');
  const [grammarDefinition, setGrammarDefinition] = useState('');
  const [grammarNote, setGrammarNote] = useState('');
  const [grammarLessonId, setGrammarLessonId] = useState('');
  const [editId, setEditId] = useState(null);

  const resetForm = () => {
    setEditId(null);
    setGrammarName('');
    setGrammarStructure('');
    setGrammarUsage('');
    setGrammarDefinition('');
    setGrammarNote('');
    setGrammarLessonId('');
  };

  const handleSaveGrammar = async (e) => {
    e.preventDefault();
    if (!grammarName || !grammarStructure || !grammarUsage || !grammarDefinition || !grammarLessonId) {
      showError('Vui lòng điền đầy đủ thông tin cấu trúc ngữ pháp!');
      return;
    }
    try {
      const payload = {
        grammar: grammarName,
        structure: grammarStructure,
        usage: grammarUsage,
        definition: grammarDefinition,
        note: grammarNote,
        lessonId: parseInt(grammarLessonId),
      };
      if (editId) {
        await axios.put(
          `${beUrl}/grammars/update/${editId}`,
          payload,
          { withCredentials: true }
        );
        showSuccess('Cập nhật ngữ pháp thành công!');
      } else {
        await axios.post(
          `${beUrl}/grammars/create`,
          payload,
          { withCredentials: true }
        );
        showSuccess('Thêm mẫu ngữ pháp mới thành công!');
      }
      resetForm();
      onRefresh();
    } catch (error) {
      showError(error.response?.data?.message || 'Có lỗi xảy ra khi lưu ngữ pháp.');
    }
  };

  const handleEditClick = (item) => {
    setEditId(item.id);
    setGrammarName(item.grammar);
    setGrammarStructure(item.structure);
    setGrammarUsage(item.usage);
    setGrammarDefinition(item.definition || '');
    setGrammarNote(item.note || '');
    setGrammarLessonId(item.lessonId);
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mục này không? Thao tác này không thể hoàn tác.')) {
      return;
    }
    try {
      await axios.delete(`${beUrl}/grammars/delete/${id}`, { withCredentials: true });
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
        <form onSubmit={handleSaveGrammar} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 className="form-section-title">
            {editId ? `✏️ Sửa Ngữ Pháp (ID: ${editId})` : '📝 Thêm Ngữ Pháp Mới'}
          </h3>
          <div className="settings-input-group">
            <label className="settings-label">Thuộc Bài Học *</label>
            <select
              className="settings-input"
              value={grammarLessonId}
              onChange={(e) => setGrammarLessonId(e.target.value)}
              required
            >
              <option value="">-- Chọn bài học --</option>
              {lessons.map((ls) => {
                const lvl = levels.find((l) => l.id === ls.levelId);
                return (
                  <option key={ls.id} value={ls.id}>
                    {ls.lessonName} - {ls.title} ({lvl ? lvl.levelName : `Cấp ${ls.levelId}`})
                  </option>
                );
              })}
            </select>
          </div>
          <div className="settings-input-group">
            <label className="settings-label">Tên điểm Ngữ pháp *</label>
            <input
              type="text"
              className="settings-input"
              placeholder="Ví dụ: 是...的 (Nhấn mạnh)"
              value={grammarName}
              onChange={(e) => setGrammarName(e.target.value)}
              required
            />
          </div>
          <div className="settings-input-group">
            <label className="settings-label">Cấu trúc công thức *</label>
            <input
              type="text"
              className="settings-input"
              placeholder="Ví dụ: Chủ ngữ + 是 + [Đối tượng cần nhấn mạnh] + 的"
              value={grammarStructure}
              onChange={(e) => setGrammarStructure(e.target.value)}
              required
            />
          </div>
          <div className="settings-input-group">
            <label className="settings-label">Cách dùng / Ngữ cảnh *</label>
            <textarea
              className="settings-input"
              placeholder="Ví dụ: Dùng để nhấn mạnh thời gian, địa điểm, phương thức của hành động đã xảy ra..."
              style={{ minHeight: '80px', fontFamily: 'inherit' }}
              value={grammarUsage}
              onChange={(e) => setGrammarUsage(e.target.value)}
              required
            />
          </div>
          <div className="settings-input-group">
            <label className="settings-label">Định nghĩa / Giải nghĩa chi tiết *</label>
            <textarea
              className="settings-input"
              placeholder="Ví dụ: Cấu trúc dùng nhấn mạnh thông tin trong quá khứ..."
              style={{ minHeight: '80px', fontFamily: 'inherit' }}
              value={grammarDefinition}
              onChange={(e) => setGrammarDefinition(e.target.value)}
              required
            />
          </div>
          <div className="settings-input-group">
            <label className="settings-label">Chú ý quan trọng (Note - Tùy chọn)</label>
            <textarea
              className="settings-input"
              placeholder="Ví dụ: Chú ý chữ '是' có thể lược bỏ trong câu khẳng định nhưng không được bỏ trong câu phủ định..."
              style={{ minHeight: '60px', fontFamily: 'inherit' }}
              value={grammarNote}
              onChange={(e) => setGrammarNote(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="neo-btn neo-btn-primary" style={{ padding: '12px 25px' }}>
              {editId ? 'Cập nhật' : 'Lưu ngữ pháp'}
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
            Tổng cộng: {grammars.length}
          </span>
        </h3>

        <div className="data-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ngữ pháp</th>
                <th>Cấu trúc công thức</th>
                <th>Bài học</th>
                <th style={{ width: '150px' }}>Hành động</th>
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
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="edit-action-btn"
                            onClick={() => handleEditClick(gm)}
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            className="delete-action-btn"
                            onClick={() => handleDeleteItem(gm.id)}
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

export default AdminGrammars;
