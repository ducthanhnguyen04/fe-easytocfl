import React, { useState } from 'react';
import axios from 'axios';

const AdminRadicals = ({
  radicals,
  onRefresh,
  beUrl,
  showError,
  showSuccess,
}) => {
  const [radicalText, setRadicalText] = useState('');
  const [radicalPinyin, setRadicalPinyin] = useState('');
  const [radicalMeaning, setRadicalMeaning] = useState('');
  const [radicalEnglishMeaning, setRadicalEnglishMeaning] = useState('');
  const [radicalProfoundMeaning, setRadicalProfoundMeaning] = useState('');
  const [radicalExample, setRadicalExample] = useState('');
  const [radicalStroke, setRadicalStroke] = useState('');
  const [editId, setEditId] = useState(null);

  const resetForm = () => {
    setEditId(null);
    setRadicalText('');
    setRadicalPinyin('');
    setRadicalMeaning('');
    setRadicalEnglishMeaning('');
    setRadicalProfoundMeaning('');
    setRadicalExample('');
    setRadicalStroke('');
  };

  const handleSaveRadical = async (e) => {
    e.preventDefault();
    if (!radicalText || !radicalPinyin || !radicalMeaning || !radicalEnglishMeaning || !radicalStroke) {
      showError('Vui lòng điền đầy đủ các trường bắt buộc cho bộ thủ!');
      return;
    }
    try {
      const payload = {
        radical: radicalText,
        pinyin: radicalPinyin,
        meaning: radicalMeaning,
        englishMeaning: radicalEnglishMeaning,
        profoundMeaning: radicalProfoundMeaning || '',
        example: radicalExample || '',
        stroke: radicalStroke
      };
      if (editId) {
        await axios.put(
          `${beUrl}/radicals/update/${editId}`,
          payload,
          { withCredentials: true }
        );
        showSuccess('Cập nhật bộ thủ thành công!');
      } else {
        await axios.post(
          `${beUrl}/radicals/create`,
          payload,
          { withCredentials: true }
        );
        showSuccess('Thêm bộ thủ mới thành công!');
      }
      resetForm();
      onRefresh();
    } catch (error) {
      showError(error.response?.data?.message || 'Có lỗi xảy ra khi lưu bộ thủ.');
    }
  };

  const handleEditClick = (item) => {
    setEditId(item.id);
    setRadicalText(item.radical);
    setRadicalPinyin(item.pinyin);
    setRadicalMeaning(item.meaning);
    setRadicalEnglishMeaning(item.englishMeaning || '');
    setRadicalProfoundMeaning(item.profoundMeaning || '');
    setRadicalExample(item.example || '');
    setRadicalStroke(item.stroke);
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mục này không? Thao tác này không thể hoàn tác.')) {
      return;
    }
    try {
      await axios.delete(`${beUrl}/radicals/delete/${id}`, { withCredentials: true });
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
        <form onSubmit={handleSaveRadical} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 className="form-section-title">
            {editId ? `✏️ Sửa Bộ Thủ (ID: ${editId})` : '部 Thêm Bộ Thủ Mới'}
          </h3>
          <div className="settings-input-group">
            <label className="settings-label">Chữ Bộ thủ (Chữ Hán) *</label>
            <input
              type="text"
              className="settings-input"
              placeholder="Ví dụ: 人"
              value={radicalText}
              onChange={(e) => setRadicalText(e.target.value)}
              required
            />
          </div>
          <div className="settings-input-group">
            <label className="settings-label">Phiên âm Pinyin *</label>
            <input
              type="text"
              className="settings-input"
              placeholder="Ví dụ: rén"
              value={radicalPinyin}
              onChange={(e) => setRadicalPinyin(e.target.value)}
              required
            />
          </div>
          <div className="settings-input-group">
            <label className="settings-label">Giải nghĩa tiếng Việt *</label>
            <input
              type="text"
              className="settings-input"
              placeholder="Ví dụ: Người"
              value={radicalMeaning}
              onChange={(e) => setRadicalMeaning(e.target.value)}
              required
            />
          </div>
          <div className="settings-input-group">
            <label className="settings-label">Giải nghĩa tiếng Anh (English Meaning) *</label>
            <input
              type="text"
              className="settings-input"
              placeholder="Ví dụ: Person"
              value={radicalEnglishMeaning}
              onChange={(e) => setRadicalEnglishMeaning(e.target.value)}
              required
            />
          </div>
          <div className="settings-input-group">
            <label className="settings-label">Số nét (Stroke count) *</label>
            <input
              type="number"
              className="settings-input"
              placeholder="Ví dụ: 2"
              value={radicalStroke}
              onChange={(e) => setRadicalStroke(e.target.value)}
              required
            />
          </div>
          <div className="settings-input-group">
            <label className="settings-label">Ý nghĩa sâu xa/Nguồn gốc (Tùy chọn)</label>
            <textarea
              className="settings-input"
              placeholder="Ví dụ: Hình ảnh hai chân người đang đứng hoặc đi bộ..."
              style={{ minHeight: '60px', fontFamily: 'inherit' }}
              value={radicalProfoundMeaning}
              onChange={(e) => setRadicalProfoundMeaning(e.target.value)}
            />
          </div>
          <div className="settings-input-group">
            <label className="settings-label">Ví dụ các chữ có chứa bộ thủ này (Tùy chọn)</label>
            <input
              type="text"
              className="settings-input"
              placeholder="Ví dụ: 仔, 估, 伸, 伴"
              value={radicalExample}
              onChange={(e) => setRadicalExample(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="neo-btn neo-btn-primary" style={{ padding: '12px 25px' }}>
              {editId ? 'Cập nhật' : 'Lưu bộ thủ'}
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
            Tổng cộng: {radicals.length}
          </span>
        </h3>

        <div className="data-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Bộ Thủ</th>
                <th>Phiên âm</th>
                <th>Ý nghĩa (VI)</th>
                <th>Ý nghĩa (EN)</th>
                <th>Số nét</th>
                <th style={{ width: '150px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {radicals.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-table-row">Chưa có bộ thủ nào</td>
                </tr>
              ) : (
                radicals.map((rd) => (
                  <tr key={rd.id}>
                    <td style={{ fontSize: '20px', fontWeight: '900', color: 'var(--color-primary)' }}>{rd.radical}</td>
                    <td>{rd.pinyin}</td>
                    <td>{rd.meaning}</td>
                    <td>{rd.englishMeaning}</td>
                    <td>{rd.stroke}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="edit-action-btn"
                          onClick={() => handleEditClick(rd)}
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          className="delete-action-btn"
                          onClick={() => handleDeleteItem(rd.id)}
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminRadicals;
