import React, { useState } from 'react';
import axios from 'axios';

const AdminComments = ({
  comments = [],
  onRefresh,
  beUrl,
  showError,
  showSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này không? Thao tác này không thể hoàn tác.')) {
      return;
    }
    try {
      await axios.delete(`${beUrl}/comments/delete/${id}`, { withCredentials: true });
      showSuccess('Xóa bình luận thành công!');
      onRefresh();
    } catch (error) {
      console.error('Delete comment error:', error);
      const errMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Có lỗi xảy ra khi xóa bình luận.';
      showError(errMsg);
    }
  };

  // Filter comments based on query
  const filteredComments = comments.filter((c) => {
    const query = searchQuery.toLowerCase();
    const contentMatch = c.content?.toLowerCase().includes(query);
    const usernameMatch = c.user?.userName?.toLowerCase().includes(query);
    const emailMatch = c.user?.email?.toLowerCase().includes(query);
    return contentMatch || usernameMatch || emailMatch;
  });

  // Calculate stats
  const totalComments = comments.length;
  const uniqueUsers = new Set(comments.map((c) => c.user?.email).filter(Boolean)).size;

  return (
    <>
      {/* Left Column: Filter and Stats */}
      <div className="neo-card admin-form-card" style={{ padding: '25px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 className="form-section-title">🔍 Bộ Lọc & Thống Kê</h3>
          
          <div className="settings-input-group">
            <label className="settings-label">Tìm kiếm bình luận</label>
            <input
              type="text"
              className="settings-input"
              placeholder="Nhập nội dung, tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {searchQuery && (
            <button 
              className="neo-btn" 
              onClick={() => setSearchQuery('')}
              style={{ padding: '10px', backgroundColor: 'var(--color-bg)' }}
            >
              🧹 Xóa bộ lọc tìm kiếm
            </button>
          )}

          <div style={{ marginTop: '20px', borderTop: '2px solid var(--color-black)', paddingTop: '15px' }}>
            <h4 style={{ fontWeight: '900', marginBottom: '10px' }}>📊 Số liệu tổng quan</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700' }}>
                <span>Tổng số bình luận:</span>
                <span className="level-code-badge">{totalComments}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700' }}>
                <span>Người dùng đã bình luận:</span>
                <span className="level-code-badge">{uniqueUsers}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '10px', backgroundColor: 'var(--color-yellow-light)', padding: '15px', borderRadius: 'var(--radius-sm)', border: '2px dashed var(--color-black)' }}>
            <p style={{ fontSize: '11px', fontWeight: '800', margin: 0, color: 'var(--color-black)', lineHeight: '1.4' }}>
              ⚠️ <strong>Lưu ý kiểm duyệt:</strong> Việc xóa bình luận sẽ gỡ bỏ bình luận ngay lập tức khỏi bảng bình luận công khai ở trang chủ. Hãy cẩn trọng trước khi thực hiện.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Comments List */}
      <div className="neo-card admin-list-card" style={{ padding: '25px', maxHeight: '720px', overflowY: 'auto' }}>
        <h3 className="form-section-title" style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>💬 Danh Sách Bình Luận</span>
          <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#e2e8f0', borderRadius: '10px' }}>
            Kết quả: {filteredComments.length}
          </span>
        </h3>

        <div className="data-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Nội dung</th>
                <th>Thời gian</th>
                <th style={{ width: '100px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredComments.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-table-row">
                    {searchQuery ? 'Không tìm thấy bình luận phù hợp' : 'Chưa có bình luận nào'}
                  </td>
                </tr>
              ) : (
                filteredComments.map((c) => {
                  const formattedTime = c.createdAt 
                    ? new Date(c.createdAt).toLocaleString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Không rõ';

                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={c.user?.avatarUrl || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                            alt="Avatar"
                            referrerPolicy="no-referrer"
                            style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--color-black)' }}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: '800', fontSize: '13px' }}>
                              {c.user?.userName || 'Người ẩn danh'}
                            </span>
                            <span style={{ fontSize: '11px', color: '#666' }}>
                              {c.user?.email || 'no-email'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '13px', lineHeight: '1.4' }}>
                        {c.content}
                      </td>
                      <td style={{ fontSize: '12px', color: '#666', whiteSpace: 'nowrap' }}>
                        {formattedTime}
                      </td>
                      <td>
                        <button
                          className="delete-action-btn"
                          onClick={() => handleDeleteItem(c.id)}
                          style={{ padding: '6px 10px', fontSize: '11px' }}
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
        </div>
      </div>
    </>
  );
};

export default AdminComments;
