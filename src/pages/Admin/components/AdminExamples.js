import React, { useState } from 'react';
import axios from 'axios';

const AdminExamples = ({
  examples,
  grammars,
  vocabularies,
  lessons,
  onRefresh,
  beUrl,
  showError,
  showSuccess,
}) => {
  const [exampleText, setExampleText] = useState('');
  const [exampleMeaning, setExampleMeaning] = useState('');
  const [examplePinyin, setExamplePinyin] = useState('');
  const [exampleAudioUrl, setExampleAudioUrl] = useState('');
  const [exampleGrammarId, setExampleGrammarId] = useState('');
  const [exampleVocabId, setExampleVocabId] = useState('');
  const [editId, setEditId] = useState(null);

  const resetForm = () => {
    setEditId(null);
    setExampleText('');
    setExampleMeaning('');
    setExamplePinyin('');
    setExampleAudioUrl('');
    setExampleGrammarId('');
    setExampleVocabId('');
  };

  const handleSaveExample = async (e) => {
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
      if (editId) {
        await axios.put(
          `${beUrl}/examples/update/${editId}`,
          payload,
          { withCredentials: true }
        );
        showSuccess('Cập nhật câu ví dụ thành công!');
      } else {
        await axios.post(
          `${beUrl}/examples/create`,
          payload,
          { withCredentials: true }
        );
        showSuccess('Thêm ví dụ mẫu thành công!');
      }
      resetForm();
      onRefresh();
    } catch (error) {
      showError(error.response?.data?.message || 'Có lỗi xảy ra khi lưu câu ví dụ.');
    }
  };

  const handleEditClick = (item) => {
    setEditId(item.id);
    setExampleText(item.example);
    setExampleMeaning(item.meaning);
    setExamplePinyin(item.pinyin);
    setExampleAudioUrl(item.audioUrl || '');
    setExampleGrammarId(item.grammarId || '');
    setExampleVocabId(item.vocabularyId || '');
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mục này không? Thao tác này không thể hoàn tác.')) {
      return;
    }
    try {
      await axios.delete(`${beUrl}/examples/delete/${id}`, { withCredentials: true });
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
        <form onSubmit={handleSaveExample} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 className="form-section-title">
            {editId ? `✏️ Sửa Câu Ví Dụ (ID: ${editId})` : '💡 Thêm Ví Dụ Mới'}
          </h3>
          <div className="settings-input-group">
            <label className="settings-label">Thuộc Điểm Ngữ Pháp (Tùy chọn)</label>
            <select
              className="settings-input"
              value={exampleGrammarId}
              onChange={(e) => setExampleGrammarId(e.target.value)}
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
            <label className="settings-label">Thuộc Từ Vựng (Tùy chọn)</label>
            <select
              className="settings-input"
              value={exampleVocabId}
              onChange={(e) => setExampleVocabId(e.target.value)}
            >
              <option value="">-- Chọn từ vựng liên kết --</option>
              {vocabularies.map((vc) => (
                <option key={vc.id} value={vc.id}>
                  {vc.vocabulary} ({vc.pinyin})
                </option>
              ))}
            </select>
          </div>
          <div className="settings-input-group">
            <label className="settings-label">Câu ví dụ bằng tiếng Trung *</label>
            <textarea
              className="settings-input"
              placeholder="Ví dụ: 我是昨天坐飛機來的。"
              style={{ minHeight: '60px', fontFamily: 'inherit' }}
              value={exampleText}
              onChange={(e) => setExampleText(e.target.value)}
              required
            />
          </div>
          <div className="settings-input-group">
            <label className="settings-label">Phiên âm Pinyin tiếng Trung *</label>
            <textarea
              className="settings-input"
              placeholder="Ví dụ: Wǒ shì zuótiān zuò fēijī lái de."
              style={{ minHeight: '60px', fontFamily: 'inherit' }}
              value={examplePinyin}
              onChange={(e) => setExamplePinyin(e.target.value)}
              required
            />
          </div>
          <div className="settings-input-group">
            <label className="settings-label">Dịch nghĩa tiếng Việt câu mẫu *</label>
            <textarea
              className="settings-input"
              placeholder="Ví dụ: Tôi đi máy bay đến đây ngày hôm qua."
              style={{ minHeight: '60px', fontFamily: 'inherit' }}
              value={exampleMeaning}
              onChange={(e) => setExampleMeaning(e.target.value)}
              required
            />
          </div>
          <div className="settings-input-group">
            <label className="settings-label">Đường dẫn âm thanh phát âm (Audio URL - Tùy chọn)</label>
            <input
              type="text"
              className="settings-input"
              placeholder="Ví dụ: /uploads/audio/example1.mp3"
              value={exampleAudioUrl}
              onChange={(e) => setExampleAudioUrl(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="neo-btn neo-btn-primary" style={{ padding: '12px 25px' }}>
              {editId ? 'Cập nhật' : 'Lưu câu ví dụ'}
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
            Tổng cộng: {examples.length}
          </span>
        </h3>

        <div className="data-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Câu Ví dụ</th>
                <th>Dịch nghĩa</th>
                <th>Liên kết ngữ pháp</th>
                <th style={{ width: '150px' }}>Hành động</th>
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

export default AdminExamples;
