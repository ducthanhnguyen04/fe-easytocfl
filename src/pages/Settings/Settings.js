import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import beUrl from '../../api-url/api-backend';
import './Settings.css';
import { showToast } from '../../utils/toast';
import { AuthContext } from '../../context/authContext';

const Settings = ({ resetVocabProgress, activeTheme, handleThemeChange }) => {
  const { user, setUser } = useContext(AuthContext);
  const isGoogleUser = !!user?.isGoogleLogin;

  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setAvatarUrl(user.avatarUrl || '');
    } else {
      setName('');
      setEmail('');
      setAvatarUrl('');
    }
  }, [user]);

  const presetAvatars = [
    { name: 'Mặc định', url: `${beUrl}/avatars/default.png` },
    { name: 'Boy 1', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix' },
    { name: 'Girl 1', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka' },
    { name: 'Boy 2', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack' },
    { name: 'Girl 2', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Cookie' },
    { name: 'Cat', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Milo' },
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Preferences state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bopomofoEnabled, setBopomofoEnabled] = useState(false);
  const [devModeEnabled, setDevModeEnabled] = useState(false);

  // Themes list definition
  const themes = [
    { id: 'terracotta', name: 'Terracotta Red', desc: 'Đỏ Đất Nung (Mặc định)', primaryColor: '#e55b44', bgColor: '#fcf9f5' },
    { id: 'ocean', name: 'Ocean Blue', desc: 'Xanh Đại Dương', primaryColor: '#3d84b8', bgColor: '#f2f7fa' },
    { id: 'gold', name: 'Jiufen Gold', desc: 'Cửu Phần Cổ Kính', primaryColor: '#e9c46a', bgColor: '#fdfaf4' },
    { id: 'mint', name: 'Neo Mint', desc: 'Xanh Bạc Hà Tươi Mới', primaryColor: '#2a9d8f', bgColor: '#f4faf8' },
    { id: 'dark', name: 'Classic Dark', desc: 'Tối Cổ Điển (Sắc nét)', primaryColor: '#e55b44', bgColor: '#121212' },
    { id: 'cyber', name: 'Cyber Dark', desc: 'Neon Cyberpunk (Tối)', primaryColor: '#f43f5e', bgColor: '#121214' }
  ];

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);

    if (!name.trim() || !email.trim()) {
      setProfileError('Vui lòng điền đầy đủ họ tên và email!');
      return;
    }

    try {
      const response = await axios.put(
        `${beUrl}/users/change-profile`,
        {
          userName: name,
          email: email,
          avatarUrl: avatarUrl
        },
        {
          withCredentials: true
        }
      );

      const updatedUser = response.data.user;
      if (updatedUser) {
        setUser({ ...updatedUser });
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setProfileError(error.response?.data?.message || error.message || 'Cập nhật thất bại');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Vui lòng điền đầy đủ tất cả các trường mật khẩu!');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp với mật khẩu mới!');
      return;
    }

    try {
      await axios.put(
        `${beUrl}/users/change-password`,
        { currentPassword, newPassword },
        { withCredentials: true }
      );
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại!');
    }
  };

  if (!user) {
    return (
      <div>
        <div className="page-title-banner">
          <div>
            <h2>Cài Đặt Hệ Thống</h2>
            <p>Tuỳ chỉnh tài khoản, đổi mật khẩu và thiết lập học tập của bạn</p>
          </div>
        </div>

        <div className="neo-card" style={{ padding: '40px', textAlign: 'center', marginTop: '20px', border: '2px dashed var(--color-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '50px', marginBottom: '15px' }}>🔒</span>
          <h3 style={{ margin: '10px 0', color: 'var(--color-primary)', fontWeight: '900' }}>Yêu cầu đăng nhập</h3>
          <p style={{ fontSize: '15px', color: '#555', maxWidth: '500px', margin: '0 auto 15px', lineHeight: '1.6', fontWeight: '600' }}>
            Vui lòng đăng nhập hoặc đăng ký tài khoản để truy cập trang cài đặt hệ thống và lưu trữ tiến trình học tập của bạn.
          </p>
          <div style={{ fontSize: '13px', color: '#666', fontStyle: 'italic', fontWeight: 'bold' }}>
            💡 Mẹo: Bấm nút "Đăng nhập / Đăng ký" ở góc dưới bên trái menu để tiếp tục.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-title-banner">
        <div>
          <h2>Cài Đặt Hệ Thống</h2>
          <p>Tuỳ chỉnh tài khoản, đổi mật khẩu và thiết lập học tập của bạn</p>
        </div>
      </div>

      {/* Theme selection card */}
      <div className="neo-card" style={{ padding: '25px', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '900', borderBottom: '3px solid var(--color-black)', paddingBottom: '10px', marginBottom: '20px' }}>
          🎨 Giao diện ứng dụng (Themes)
        </h3>
        <div className="themes-row">
          {themes.map((t) => (
            <button
              key={t.id}
              className={`theme-select-btn ${activeTheme === t.id ? 'active' : ''}`}
              onClick={() => handleThemeChange(t.id)}
            >
              <div
                className="theme-preview-dot"
                style={{
                  background: `linear-gradient(135deg, ${t.primaryColor} 50%, ${t.bgColor} 50%)`
                }}
              />
              <div>
                <div className="theme-select-name">{t.name}</div>
                <div className="theme-select-desc">{t.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="settings-grid-layout">
        {/* Left Column: Account Info & Preferences */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

          {/* Account Profile Form */}
          <form className="settings-section-card" onSubmit={handleUpdateProfile}>
            <h3 style={{ fontSize: '18px', fontWeight: '900', borderBottom: '3px solid var(--color-black)', paddingBottom: '10px' }}>
              👤 Thông tin tài khoản
            </h3>

            {profileSuccess && (
              <div className="settings-alert-success">
                ✓ Cập nhật thông tin tài khoản thành công!
              </div>
            )}

            {profileError && (
              <div className="settings-alert-error">
                ⚠ {profileError}
              </div>
            )}

            {/* Avatar Selection Section */}
            <div className="settings-avatar-container" style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '10px 0' }}>
              <div
                className="settings-avatar-preview"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  border: '3px solid #000',
                  boxShadow: '4px 4px 0px #000',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--color-primary-light)',
                  fontSize: '28px',
                  fontWeight: '900',
                  color: '#000',
                  position: 'relative'
                }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  getInitials(name)
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="settings-label" style={{ marginBottom: '2px' }}>Ảnh đại diện (Avatar)</label>
                {!isGoogleUser ? (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="neo-btn"
                      style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: 'var(--color-white)' }}
                      onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                    >
                      🖼️ Chọn ảnh
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        className="neo-btn"
                        style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#ffe5e0', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                        onClick={() => setAvatarUrl('')}
                      >
                        🗑️ Xoá
                      </button>
                    )}
                  </div>
                ) : (
                  <span style={{ fontSize: '12.5px', color: '#666', fontStyle: 'italic', fontWeight: 'bold' }}>
                    * Ảnh đại diện được đồng bộ từ Google
                  </span>
                )}
              </div>
            </div>

            {showAvatarPicker && !isGoogleUser && (
              <div
                className="neo-card"
                style={{
                  padding: '15px',
                  border: '2px solid #000',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#fbf9f5',
                  boxShadow: '4px 4px 0px #000'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: '800', marginBottom: '10px' }}>CHỌN AVATAR MẪU:</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', marginBottom: '15px' }}>
                  {presetAvatars.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      style={{
                        border: avatarUrl === preset.url ? '3px solid var(--color-primary)' : '2px solid #000',
                        borderRadius: '50%',
                        width: '45px',
                        height: '45px',
                        padding: 0,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        backgroundColor: '#fff',
                        transform: avatarUrl === preset.url ? 'scale(1.05)' : 'none',
                        boxShadow: avatarUrl === preset.url ? '2px 2px 0px #000' : 'none',
                        transition: 'all 0.1s ease'
                      }}
                      onClick={() => setAvatarUrl(preset.url)}
                    >
                      <img src={preset.url} alt={preset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>

                <div className="settings-input-group">
                  <label className="settings-label" style={{ fontSize: '11px' }}>Hoặc nhập URL ảnh tùy chỉnh:</label>
                  <input
                    type="text"
                    className="settings-input"
                    style={{ padding: '8px 12px', fontSize: '13px' }}
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/your-avatar.png"
                  />
                </div>
              </div>
            )}

            <div className="settings-input-group">
              <label className="settings-label">Họ và Tên</label>
              <input
                type="text"
                className="settings-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập họ tên của bạn"
                disabled={isGoogleUser}
              />
            </div>

            <div className="settings-input-group">
              <label className="settings-label">Địa chỉ Email</label>
              <input
                type="email"
                className="settings-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                disabled={isGoogleUser}
              />
            </div>
            {!isGoogleUser ? (
              <button type="submit" className="neo-btn neo-btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 20px' }}>
                Lưu thay đổi
              </button>
            ) : (
              <div style={{ fontSize: '13px', color: '#666', fontStyle: 'italic', fontWeight: '800', marginTop: '10px', padding: '8px 12px', borderLeft: '3px solid var(--color-primary)', backgroundColor: 'var(--color-primary-light)' }}>
                ℹ Tài khoản liên kết Google không hỗ trợ sửa đổi trực tiếp trên hệ thống.
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Password Change & Danger Zone */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

          {/* Password Change Form */}
          {!isGoogleUser ? (
            <form className="settings-section-card" onSubmit={handleUpdatePassword}>
              <h3 style={{ fontSize: '18px', fontWeight: '900', borderBottom: '3px solid var(--color-black)', paddingBottom: '10px' }}>
                🔑 Đổi mật khẩu
              </h3>

              {passwordSuccess && (
                <div className="settings-alert-success">
                  ✓ Đổi mật khẩu thành công! Mật khẩu mới đã được lưu.
                </div>
              )}

              {passwordError && (
                <div className="settings-alert-error">
                  ⚠ {passwordError}
                </div>
              )}

              <div className="settings-input-group">
                <label className="settings-label">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  className="settings-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="settings-input-group">
                <label className="settings-label">Mật khẩu mới</label>
                <input
                  type="password"
                  className="settings-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                />
              </div>

              <div className="settings-input-group">
                <label className="settings-label">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  className="settings-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>

              <button type="submit" className="neo-btn neo-btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 20px', backgroundColor: 'var(--color-accent)' }}>
                Cập nhật mật khẩu
              </button>
            </form>
          ) : (
            <div className="settings-section-card" style={{ opacity: 0.85 }}>
              <h3 style={{ fontSize: '18px', fontWeight: '900', borderBottom: '3px solid var(--color-black)', paddingBottom: '10px' }}>
                🔑 Đổi mật khẩu
              </h3>
              <div style={{ padding: '15px', backgroundColor: '#f0f4f8', border: '2px solid #b0c4de', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: '700', color: '#4a5568' }}>
                💡 Tài khoản đăng nhập bằng Google. Vui lòng đổi mật khẩu thông qua trang quản lý tài khoản Google của bạn.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
