import React, { useState } from 'react';
import axios from 'axios';

const AdminLessons = ({
  lessons,
  levels,
  onRefresh,
  beUrl,
  showError,
  showSuccess,
}) => {
  const [lessonName, setLessonName] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonSlug, setLessonSlug] = useState('');
  const [lessonLevelId, setLessonLevelId] = useState('');
  const [lessonIsPremium, setLessonIsPremium] = useState(false);
  const [editId, setEditId] = useState(null);

  const resetForm = () => {
    setEditId(null);
    setLessonName('');
    setLessonTitle('');
    setLessonSlug('');
    setLessonLevelId('');
    setLessonIsPremium(false);
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    if (!lessonName || !lessonTitle || !lessonSlug || !lessonLevelId) {
      showError('Vui lòng điền đầy đủ các trường bắt buộc!');
      return;
    }
    try {
      const payload = {
        lessonName,
        title: lessonTitle,
        slug: lessonSlug,
        levelId: parseInt(lessonLevelId),
        isPremium: lessonIsPremium,
      };
      if (editId) {
        await axios.put(
          `${beUrl}/lessons/update/${editId}`,
          payload,
          { withCredentials: true }
        );
        showSuccess('Cập nhật bài học thành công!');
      } else {
        await axios.post(
          `${beUrl}/lessons/create`,
          payload,
          { withCredentials: true }
        );
        showSuccess('Thêm bài học mới thành công!');
      }
      resetForm();
      onRefresh();
    } catch (error) {
      showError(error.response?.data?.message || 'Có lỗi xảy ra khi lưu bài học.');
    }
  };

  const handleEditClick = (item) => {
    setEditId(item.id);
    setLessonName(item.lessonName);
    setLessonTitle(item.title);
    setLessonSlug(item.slug);
    setLessonLevelId(item.levelId);
    setLessonIsPremium(!!item.isPremium);
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mục này không? Thao tác này không thể hoàn tác.')) {
      return;
    }
    try {
      await axios.delete(`${beUrl}/lessons/delete/${id}`, { withCredentials: true });
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
        <form onSubmit={handleSaveLesson} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 className="form-section-title">
            {editId ? `✏️ Sửa Bài Học (ID: ${editId})` : '📖 Thêm Bài Học Mới'}
          </h3>
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
              👑 Yêu cầu tài khoản Premium
            </label>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="neo-btn neo-btn-primary" style={{ padding: '12px 25px' }}>
              {editId ? 'Cập nhật' : 'Lưu bài học'}
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
            Tổng cộng: {lessons.length}
          </span>
        </h3>

        <div className="data-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Bài học</th>
                <th>Tiêu đề bài học</th>
                <th>Giáo trình</th>
                <th>Premium</th>
                <th style={{ width: '150px' }}>Hành động</th>
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
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="edit-action-btn"
                            onClick={() => handleEditClick(ls)}
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            className="delete-action-btn"
                            onClick={() => handleDeleteItem(ls.id)}
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

export default AdminLessons;
