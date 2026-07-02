import React, { useState } from 'react';
import axios from 'axios';

const AdminUsers = ({
  usersList,
  onRefresh,
  beUrl,
  showError,
  showSuccess,
}) => {
  const [userFormName, setUserFormName] = useState('');
  const [userFormEmail, setUserFormEmail] = useState('');
  const [userFormPassword, setUserFormPassword] = useState('');
  const [userFormRole, setUserFormRole] = useState('user');
  const [userFormIsPremium, setUserFormIsPremium] = useState(false);
  const [editId, setEditId] = useState(null);

  const resetForm = () => {
    setEditId(null);
    setUserFormName('');
    setUserFormEmail('');
    setUserFormPassword('');
    setUserFormRole('user');
    setUserFormIsPremium(false);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const originalUser = usersList.find(u => u.id === editId);
        if (!originalUser) return;

        if (userFormRole !== originalUser.role) {
          await axios.put(
            `${beUrl}/users/admin/update-role/${editId}`,
            { role: userFormRole },
            { withCredentials: true }
          );
        }

        if (userFormIsPremium !== !!originalUser.isPremium) {
          await axios.put(
            `${beUrl}/users/admin/toggle-premium/${editId}`,
            {},
            { withCredentials: true }
          );
        }

        showSuccess('Cập nhật người dùng thành công!');
      } else {
        if (!userFormName || !userFormEmail || !userFormPassword) {
          showError('Vui lòng nhập đầy đủ tên hiển thị, email và mật khẩu!');
          return;
        }

        const response = await axios.post(`${beUrl}/auth/register`, {
          userName: userFormName,
          email: userFormEmail,
          password: userFormPassword
        });

        if (response.data.success) {
          const newUserId = response.data.data.id;
          
          if (userFormRole === 'admin') {
            await axios.put(
              `${beUrl}/users/admin/update-role/${newUserId}`,
              { role: 'admin' },
              { withCredentials: true }
            );
          }

          if (userFormIsPremium) {
            await axios.put(
              `${beUrl}/users/admin/toggle-premium/${newUserId}`,
              {},
              { withCredentials: true }
            );
          }

          showSuccess('Thêm người dùng mới thành công!');
        }
      }
      resetForm();
      onRefresh();
    } catch (error) {
      showError(error.response?.data?.message || 'Có lỗi xảy ra khi lưu người dùng.');
    }
  };

  const handleQuickTogglePremium = async (userId) => {
    try {
      await axios.put(
        `${beUrl}/users/admin/toggle-premium/${userId}`,
        {},
        { withCredentials: true }
      );
      showSuccess('Cập nhật trạng thái Premium thành công!');
      onRefresh();
    } catch (error) {
      showError(error.response?.data?.message || 'Không thể cập nhật trạng thái Premium.');
    }
  };

  const handleEditClick = (item) => {
    setEditId(item.id);
    setUserFormName(item.userName || '');
    setUserFormEmail(item.email || '');
    setUserFormPassword('');
    setUserFormRole(item.role || 'user');
    setUserFormIsPremium(!!item.isPremium);
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mục này không? Thao tác này không thể hoàn tác.')) {
      return;
    }
    try {
      await axios.delete(`${beUrl}/users/admin/delete/${id}`, { withCredentials: true });
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
        <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 className="form-section-title">
            {editId ? `✏️ Sửa Quyền Hạn (ID: ${editId})` : '👥 Thêm Người Dùng Mới'}
          </h3>
          <div className="settings-input-group">
            <label className="settings-label">Tên hiển thị (Username) *</label>
            <input
              type="text"
              className="settings-input"
              placeholder="Ví dụ: Nguyễn Văn A"
              value={userFormName}
              onChange={(e) => setUserFormName(e.target.value)}
              disabled={!!editId}
              required
            />
          </div>
          <div className="settings-input-group">
            <label className="settings-label">Địa chỉ Email *</label>
            <input
              type="email"
              className="settings-input"
              placeholder="Ví dụ: email@gmail.com"
              value={userFormEmail}
              onChange={(e) => setUserFormEmail(e.target.value)}
              disabled={!!editId}
              required
            />
          </div>
          {!editId && (
            <div className="settings-input-group">
              <label className="settings-label">Mật khẩu *</label>
              <input
                type="password"
                className="settings-input"
                placeholder="••••••••"
                value={userFormPassword}
                onChange={(e) => setUserFormPassword(e.target.value)}
                required
              />
            </div>
          )}
          <div className="settings-input-group">
            <label className="settings-label">Vai trò (Role) *</label>
            <select
              className="settings-input"
              value={userFormRole}
              onChange={(e) => setUserFormRole(e.target.value)}
              required
            >
              <option value="user">Người dùng thông thường (user)</option>
              <option value="admin">Quản trị viên hệ thống (admin)</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="userFormPremiumCheck"
              checked={userFormIsPremium}
              onChange={(e) => setUserFormIsPremium(e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <label htmlFor="userFormPremiumCheck" style={{ fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>
              👑 Kích hoạt tài khoản Premium
            </label>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="neo-btn neo-btn-primary" style={{ padding: '12px 25px' }}>
              {editId ? 'Cập nhật' : 'Lưu người dùng'}
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
            Tổng cộng: {usersList.length}
          </span>
        </h3>

        <div className="data-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Premium status</th>
                <th style={{ width: '150px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {usersList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-table-row">Chưa có người dùng nào</td>
                </tr>
              ) : (
                usersList.map((us) => (
                  <tr key={us.id}>
                    <td>{us.id}</td>
                    <td style={{ fontWeight: '800' }}>{us.userName}</td>
                    <td>{us.email}</td>
                    <td>
                      <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: us.role === 'admin' ? '#ffe8cc' : '#e3faf2', color: us.role === 'admin' ? '#f76707' : '#0ca678', fontWeight: '800' }}>
                        {us.role}
                      </span>
                    </td>
                    <td>
                      <button
                        className="neo-btn"
                        style={{ padding: '4px 10px', fontSize: '10px', backgroundColor: us.isPremium ? 'var(--color-secondary)' : '#f1f3f5' }}
                        onClick={() => handleQuickTogglePremium(us.id)}
                      >
                        {us.isPremium ? '👑 Premium' : '🔓 Thường'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="edit-action-btn"
                          onClick={() => handleEditClick(us)}
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          className="delete-action-btn"
                          onClick={() => handleDeleteItem(us.id)}
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

export default AdminUsers;
