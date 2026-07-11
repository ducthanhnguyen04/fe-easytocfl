import React, { useState } from 'react';
import axios from 'axios';

const AdminDialogues = ({
  dialogues,
  lessons,
  levels,
  onRefresh,
  beUrl,
  showError,
  showSuccess,
}) => {
  const [lessonId, setLessonId] = useState('');
  const [header, setHeader] = useState('');
  const [illustrationUrl, setIllustrationUrl] = useState('');
  const [lines, setLines] = useState([]); // array of { lineOrder, character, text, pinyin, translation, audioUrl }
  const [editId, setEditId] = useState(null);

  const resetForm = () => {
    setEditId(null);
    setLessonId('');
    setHeader('');
    setIllustrationUrl('');
    setLines([]);
  };

  const handleAddLine = () => {
    setLines([
      ...lines,
      {
        lineOrder: lines.length + 1,
        character: '',
        text: '',
        pinyin: '',
        translation: '',
        audioUrl: ''
      }
    ]);
  };

  const handleRemoveLine = (idx) => {
    const updated = lines.filter((_, i) => i !== idx).map((line, i) => ({
      ...line,
      lineOrder: i + 1
    }));
    setLines(updated);
  };

  const handleLineChange = (idx, field, value) => {
    const updated = [...lines];
    updated[idx] = {
      ...updated[idx],
      [field]: value
    };
    setLines(updated);
  };

  const handleSaveDialogue = async (e) => {
    e.preventDefault();
    if (!lessonId) {
      showError('Vui lòng chọn bài học!');
      return;
    }
    try {
      const payload = {
        lessonId: parseInt(lessonId),
        header,
        illustrationUrl,
        lines: lines.map((l, i) => ({ ...l, lineOrder: i + 1 }))
      };

      if (editId) {
        await axios.put(
          `${beUrl}/dialogues/update/${editId}`,
          payload,
          { withCredentials: true }
        );
        showSuccess('Cập nhật bài khóa thành công!');
      } else {
        await axios.post(
          `${beUrl}/dialogues/create`,
          payload,
          { withCredentials: true }
        );
        showSuccess('Thêm bài khóa mới thành công!');
      }
      resetForm();
      onRefresh();
    } catch (error) {
      showError(error.response?.data?.message || 'Có lỗi xảy ra khi lưu bài khóa.');
    }
  };

  const handleEditClick = (item) => {
    setEditId(item.id);
    setLessonId(item.lessonId);
    setHeader(item.header || '');
    setIllustrationUrl(item.illustrationUrl || '');
    setLines(item.lines ? [...item.lines].sort((a, b) => a.lineOrder - b.lineOrder) : []);
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài khóa này không? Thao tác này không thể hoàn tác.')) {
      return;
    }
    try {
      await axios.delete(`${beUrl}/dialogues/delete/${id}`, { withCredentials: true });
      showSuccess('Xóa bài khóa thành công!');
      if (editId === id) {
        resetForm();
      }
      onRefresh();
    } catch (error) {
      showError(error.response?.data?.message || 'Có lỗi xảy ra khi xóa bài khóa.');
    }
  };

  return (
    <>
      <div className="neo-card admin-form-card" style={{ padding: '25px', gridColumn: 'span 2' }}>
        <form onSubmit={handleSaveDialogue} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 className="form-section-title">
            {editId ? `✏️ Sửa Bài Khóa Hội Thoại (ID: ${editId})` : '💬 Thêm Bài Khóa Hội Thoại Mới'}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            <div className="settings-input-group">
              <label className="settings-label">Thuộc Bài Học</label>
              <select
                className="settings-input"
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value)}
                required
              >
                <option value="">-- Chọn bài học --</option>
                {lessons.map((ls) => {
                  const lvl = levels.find((l) => l.id === ls.levelId);
                  return (
                    <option key={ls.id} value={ls.id}>
                      {lvl ? `${lvl.levelName} - ` : ''}{ls.lessonName}: {ls.title}
                    </option>
                  );
                })}
              </select>
            </div>
            
            <div className="settings-input-group">
              <label className="settings-label">Khung Cảnh / Header</label>
              <input
                type="text"
                className="settings-input"
                placeholder="Ví dụ: (在教室 In the classroom)"
                value={header}
                onChange={(e) => setHeader(e.target.value)}
              />
            </div>

            <div className="settings-input-group">
              <label className="settings-label">Đường Dẫn Ảnh Minh Họa</label>
              <input
                type="text"
                className="settings-input"
                placeholder="Ví dụ: /dialogue_lesson_1.png"
                value={illustrationUrl}
                onChange={(e) => setIllustrationUrl(e.target.value)}
              />
            </div>
          </div>

          {/* Dialogue Lines Section */}
          <div className="lines-form-section" style={{ borderTop: '2px dashed var(--color-black)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{ margin: 0, fontWeight: '800', fontSize: '15px' }}>🎙️ Danh Sách Câu Thoại Hội Thoại</h4>
              <button
                type="button"
                className="neo-btn"
                style={{ padding: '6px 15px', fontSize: '12px', backgroundColor: 'var(--color-secondary-light)' }}
                onClick={handleAddLine}
              >
                ＋ Thêm dòng thoại
              </button>
            </div>

            {lines.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', border: '2px dashed #ccc', borderRadius: '8px', color: '#666', fontSize: '13px', fontWeight: 'bold' }}>
                Chưa có câu thoại nào. Nhấn "Thêm dòng thoại" ở trên để bắt đầu nhập.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {lines.map((line, idx) => (
                  <div
                    key={idx}
                    className="neo-card"
                    style={{
                      padding: '15px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '2px solid var(--color-black)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: '900', color: 'var(--color-primary)' }}>
                        Thoại #{idx + 1} (Thứ tự: {idx + 1})
                      </span>
                      <button
                        type="button"
                        className="neo-btn"
                        style={{ padding: '3px 10px', fontSize: '11px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                        onClick={() => handleRemoveLine(idx)}
                      >
                        ✕ Xóa dòng này
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: '10px' }}>
                      <div className="settings-input-group">
                        <label className="settings-label" style={{ fontSize: '11px' }}>Nhân vật</label>
                        <input
                          type="text"
                          className="settings-input"
                          style={{ padding: '8px 12px', fontSize: '13px' }}
                          placeholder="Ví dụ: 中明"
                          value={line.character}
                          onChange={(e) => handleLineChange(idx, 'character', e.target.value)}
                          required
                        />
                      </div>
                      <div className="settings-input-group">
                        <label className="settings-label" style={{ fontSize: '11px' }}>Chữ Hán Phồn thể</label>
                        <input
                          type="text"
                          className="settings-input"
                          style={{ padding: '8px 12px', fontSize: '13px' }}
                          placeholder="Ví dụ: 妳好！"
                          value={line.text}
                          onChange={(e) => handleLineChange(idx, 'text', e.target.value)}
                          required
                        />
                      </div>
                      <div className="settings-input-group">
                        <label className="settings-label" style={{ fontSize: '11px' }}>Phiên âm Pinyin</label>
                        <input
                          type="text"
                          className="settings-input"
                          style={{ padding: '8px 12px', fontSize: '13px' }}
                          placeholder="Ví dụ: Nǐ hǎo!"
                          value={line.pinyin}
                          onChange={(e) => handleLineChange(idx, 'pinyin', e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="settings-input-group">
                        <label className="settings-label" style={{ fontSize: '11px' }}>Dịch tiếng Việt</label>
                        <input
                          type="text"
                          className="settings-input"
                          style={{ padding: '8px 12px', fontSize: '13px' }}
                          placeholder="Ví dụ: Xin chào!"
                          value={line.translation}
                          onChange={(e) => handleLineChange(idx, 'translation', e.target.value)}
                        />
                      </div>
                      <div className="settings-input-group">
                        <label className="settings-label" style={{ fontSize: '11px' }}>Đường dẫn âm thanh (Audio URL)</label>
                        <input
                          type="text"
                          className="settings-input"
                          style={{ padding: '8px 12px', fontSize: '13px' }}
                          placeholder="Ví dụ: /uploads/...mp3"
                          value={line.audioUrl}
                          onChange={(e) => handleLineChange(idx, 'audioUrl', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" className="neo-btn neo-btn-primary" style={{ padding: '12px 25px' }}>
              {editId ? 'Cập nhật bài khóa' : 'Lưu bài khóa'}
            </button>
            <button type="button" className="neo-btn" onClick={resetForm} style={{ padding: '12px 25px', backgroundColor: 'var(--color-bg)' }}>
              {editId ? 'Hủy sửa' : 'Làm sạch form'}
            </button>
          </div>
        </form>
      </div>

      <div className="neo-card admin-list-card" style={{ padding: '25px', gridColumn: 'span 2', marginTop: '20px' }}>
        <h3 className="form-section-title" style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span> Danh Sách Bài Khóa Hiện Tại</span>
          <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#e2e8f0', borderRadius: '10px' }}>
            Tổng cộng: {dialogues.length}
          </span>
        </h3>

        <div className="data-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Bài Học</th>
                <th>Khung Cảnh (Header)</th>
                <th>Đường Dẫn Ảnh</th>
                <th>Số Câu Thoại</th>
                <th style={{ width: '160px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {dialogues.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-table-row">Chưa có bài khóa hội thoại nào</td>
                </tr>
              ) : (
                dialogues.map((item) => {
                  const lesson = lessons.find((l) => l.id === item.lessonId);
                  return (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td style={{ fontWeight: '800' }}>
                        {lesson ? `${lesson.lessonName}: ${lesson.title}` : `ID: ${item.lessonId}`}
                      </td>
                      <td>{item.header || '---'}</td>
                      <td>{item.illustrationUrl || '---'}</td>
                      <td>{item.lines ? item.lines.length : 0} câu</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="edit-action-btn"
                            onClick={() => handleEditClick(item)}
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            className="delete-action-btn"
                            onClick={() => handleDeleteItem(item.id)}
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

export default AdminDialogues;
