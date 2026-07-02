import React, { useState } from 'react';
import axios from 'axios';

const AdminLevels = ({
  levels,
  onRefresh,
  beUrl,
  showError,
  showSuccess,
}) => {
  const [levelName, setLevelName] = useState('');
  const [levelCode, setLevelCode] = useState('');
  const [levelImage, setLevelImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editId, setEditId] = useState(null);

  const resetForm = () => {
    setEditId(null);
    setLevelName('');
    setLevelCode('');
    setLevelImage('');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    try {
      const response = await axios.post(
        `${beUrl}/levels/upload-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );
      if (response.data.imageUrl) {
        setLevelImage(response.data.imageUrl);
        showSuccess('Tải ảnh đại diện lên thành công!');
      } else {
        showError('Không nhận được đường dẫn ảnh từ server.');
      }
    } catch (err) {
      console.error('Upload image error:', err);
      showError(err.response?.data?.message || err.response?.data?.error || 'Có lỗi xảy ra khi tải ảnh lên.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSaveLevel = async (e) => {
    e.preventDefault();
    if (!levelName || !levelCode) {
      showError('Vui lòng nhập đầy đủ tên và mã cấp độ!');
      return;
    }
    try {
      if (editId) {
        await axios.put(
          `${beUrl}/levels/update/${editId}`,
          { levelName, level: levelCode, image: levelImage },
          { withCredentials: true }
        );
        showSuccess('Cập nhật giáo trình thành công!');
      } else {
        await axios.post(
          `${beUrl}/levels/create`,
          { levelName, level: levelCode, image: levelImage },
          { withCredentials: true }
        );
        showSuccess('Thêm giáo trình mới thành công!');
      }
      resetForm();
      onRefresh();
    } catch (error) {
      showError(error.response?.data?.message || 'Có lỗi xảy ra khi lưu giáo trình.');
    }
  };

  const handleEditClick = (item) => {
    setEditId(item.id);
    setLevelName(item.levelName);
    setLevelCode(item.level);
    setLevelImage(item.image || '');
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mục này không? Thao tác này không thể hoàn tác.')) {
      return;
    }
    try {
      await axios.delete(`${beUrl}/levels/delete/${id}`, { withCredentials: true });
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
        <form onSubmit={handleSaveLevel} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 className="form-section-title">
            {editId ? `✏️ Sửa Giáo Trình (ID: ${editId})` : '📚 Thêm Giáo Trình (Level)'}
          </h3>
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
          <div className="settings-input-group">
            <label className="settings-label">Hình ảnh giáo trình (Tùy chọn)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              style={{ display: 'none' }}
              id="levelImageInput"
            />
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '5px' }}>
              <button
                type="button"
                className="neo-btn"
                style={{ backgroundColor: '#edf2f7', fontSize: '13px', padding: '8px 15px' }}
                onClick={() => document.getElementById('levelImageInput').click()}
                disabled={uploadingImage}
              >
                {uploadingImage ? '⏳ Đang tải ảnh...' : '📥 Chọn ảnh đại diện'}
              </button>
              {levelImage && (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={levelImage}
                    alt="Preview"
                    style={{ width: '60px', height: '60px', borderRadius: '6px', border: '2px solid #000', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={() => setLevelImage('')}
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      background: 'red',
                      color: 'white',
                      border: '2px solid black',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}
                  >
                    X
                  </button>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="neo-btn neo-btn-primary" style={{ padding: '12px 25px' }} disabled={uploadingImage}>
              {editId ? 'Cập nhật' : 'Lưu giáo trình'}
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
            Tổng cộng: {levels.length}
          </span>
        </h3>

        <div className="data-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Hình ảnh</th>
                <th>Tên Giáo Trình</th>
                <th>Mã Cấp Độ</th>
                <th style={{ width: '150px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {levels.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-table-row">Chưa có giáo trình nào</td>
                </tr>
              ) : (
                levels.map((lvl) => (
                  <tr key={lvl.id}>
                    <td>{lvl.id}</td>
                    <td>
                      {lvl.image ? (
                        <img src={lvl.image} alt={lvl.levelName} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1.5px solid #000' }} />
                      ) : (
                        <span style={{ color: '#aaa', fontSize: '11px' }}>Không có ảnh</span>
                      )}
                    </td>
                    <td style={{ fontWeight: '800' }}>{lvl.levelName}</td>
                    <td><span className="level-code-badge">{lvl.level}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="edit-action-btn"
                          onClick={() => handleEditClick(lvl)}
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          className="delete-action-btn"
                          onClick={() => handleDeleteItem(lvl.id)}
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

export default AdminLevels;
