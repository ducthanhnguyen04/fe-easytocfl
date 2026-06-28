import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Icon from './Icon';
import './Sidebar.css';
import { useAuth } from '../context/authContext';
import beUrl from '../api-url/api-backend';
import { showToast } from '../utils/toast';

const Sidebar = () => {
  const { user, setUser, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserModal, setShowUserModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [vocabExpanded, setVocabExpanded] = useState(
    location.pathname.startsWith('/vocab') || location.pathname.startsWith('/radicals')
  );

  React.useEffect(() => {
    if (location.pathname.startsWith('/vocab') || location.pathname.startsWith('/radicals')) {
      setVocabExpanded(true);
    }
  }, [location.pathname]);

  const handleGoogleLoginCallback = async (response) => {
    try {
      const { credential } = response;
      const res = await axios.post(`${beUrl}/auth/google-login`, {
        credential
      }, {
        withCredentials: true
      });
      const userData = res.data.user || res.data;
      if (userData) {
        setUser({ ...userData });
        setShowLoginModal(false);
        setLoginEmail('');
        setLoginPassword('');
        setLoginError('');
        showToast('Đăng nhập bằng Google thành công!', 'success');
      }
    } catch (error) {
      console.error("Google login error:", error);
      alert(error.response?.data?.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.');
    }
  };

  React.useEffect(() => {
    if (showLoginModal) {
      const timer = setTimeout(() => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: "652750728253-m7vfrdsrp2iuma5ct7h52n0buppmb0eh.apps.googleusercontent.com",
            callback: handleGoogleLoginCallback
          });
          window.google.accounts.id.renderButton(
            document.getElementById("google-signin-btn"),
            { theme: "outline", size: "large", width: 340 }
          );
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [showLoginModal]);

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');

  const openLoginModal = () => {
    setIsLoginMode(true);
    setLoginEmail('');
    setLoginPassword('');
    setLoginError('');
    setRegisterName('');
    setRegisterEmail('');
    setRegisterPassword('');
    setRegisterConfirmPassword('');
    setRegisterError('');
    setShowLoginModal(true);
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    return location.pathname.startsWith(path);
  };

  const getInitials = (name) => {
    if (!name) return 'UN';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    try {
      const response = await axios.post(`${beUrl}/auth/login`, {
        email: loginEmail,
        password: loginPassword
      },
        {
          withCredentials: true
        }
      );
      const userData = response.data.data || response.data.user || response.data;
      if (userData) {
        setUser({ ...userData });
        setShowLoginModal(false);
        setLoginEmail('');
        setLoginPassword('');
        setLoginError('');
        showToast('Đăng nhập thành công!', 'success');
        console.log(user);
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(error.response?.data?.message || error.message || 'Đăng nhập thất bại');
      alert("Đăng nhập thất bại. Vui lòng thử lại.");
    }
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('Mật khẩu xác nhận không khớp');
      return;
    }
    try {
      const response = await axios.post(`${beUrl}/auth/register`, {
        userName: registerName,
        email: registerEmail,
        password: registerPassword
      });
      if (response.data.success) {
        showToast('Đăng ký thành công! Đang tự động đăng nhập...', 'success');
        const loginResponse = await axios.post(`${beUrl}/auth/login`, {
          email: registerEmail,
          password: registerPassword
        },
          {
            withCredentials: true
          }
        );
        const userData = loginResponse.data.data || loginResponse.data.user || loginResponse.data;
        if (userData) {
          setUser({ ...userData });
          setShowLoginModal(false);
          setRegisterName('');
          setRegisterEmail('');
          setRegisterPassword('');
          setRegisterConfirmPassword('');
          setRegisterError('');
          setLoginEmail('');
          setLoginPassword('');
          setLoginError('');
        }
      }
    } catch (error) {
      console.error("Register error:", error);
      setRegisterError(error.response?.data?.message || error.message || 'Đăng ký thất bại');
      alert(error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${beUrl}/auth/logout`,
        {},
        {
          withCredentials: true
        }
      );
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo" onClick={() => navigate('/')}>
          <div className="logo-icon">台</div>
          <div className="logo-text">
            <span className="logo-title">EASY TOCFL <span style={{ color: 'var(--color-primary)' }}>輕鬆學</span></span>
            <span className="logo-subtitle">Tiếng Trung Phồn Thể</span>
          </div>
        </div>

        <span className="sidebar-section-title">Học tập chính</span>
        <ul className="sidebar-menu">
          <li className="sidebar-item">
            <Link
              to="/"
              className={`sidebar-link ${isActive('/') ? 'active' : ''}`}
            >
              <Icon name="home" /> Trang chủ
            </Link>
          </li>
          <li className="sidebar-item">
            <Link
              to="/roadmap"
              className={`sidebar-link ${isActive('/roadmap') ? 'active' : ''}`}
            >
              <Icon name="route" /> Lộ trình
              <span className="demo-badge">Hot</span>
            </Link>
          </li>
          <li className="sidebar-item">
            <button
              onClick={(e) => {
                e.preventDefault();
                setVocabExpanded(!vocabExpanded);
              }}
              className={`sidebar-link ${isActive('/vocab') || isActive('/radicals') ? 'active' : ''}`}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon name="vocab" /> Từ vựng
              </div>
              <span style={{ 
                fontSize: '10px', 
                transition: 'transform 0.2s', 
                transform: vocabExpanded ? 'rotate(90deg)' : 'none',
                display: 'inline-block'
              }}>
                ▶
              </span>
            </button>

            {vocabExpanded && (
              <ul className="sidebar-submenu">
                <li className="sidebar-subitem">
                  <Link
                    to="/vocab"
                    className={`sidebar-sublink ${location.pathname.startsWith('/vocab') ? 'active' : ''}`}
                  >
                    📖 Từ vựng chính khóa
                  </Link>
                </li>
                <li className="sidebar-subitem">
                  <Link
                    to="/radicals"
                    className={`sidebar-sublink ${location.pathname.startsWith('/radicals') ? 'active' : ''}`}
                  >
                    🧩 Học bộ thủ chữ Hán
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li className="sidebar-item">
            <Link
              to="/grammar"
              className={`sidebar-link ${isActive('/grammar') ? 'active' : ''}`}
            >
              <Icon name="grammar" /> Ngữ pháp
            </Link>
          </li>
          <li className="sidebar-item">
            <Link
              to="/exam"
              className={`sidebar-link ${isActive('/exam') ? 'active' : ''}`}
            >
              <Icon name="exam" /> Đề thi thử
              <span className="demo-badge">TOCFL</span>
            </Link>
          </li>
          <li className="sidebar-item">
            <Link
              to="/leaderboard"
              className={`sidebar-link ${isActive('/leaderboard') ? 'active' : ''}`}
            >
              <Icon name="leaderboard" /> Bảng xếp hạng
            </Link>
          </li>
          <li className="sidebar-item">
            <Link
              to="/settings"
              className={`sidebar-link ${isActive('/settings') ? 'active' : ''}`}
            >
              <Icon name="settings" /> Cài đặt
            </Link>
          </li>
          {user?.role === 'admin' && (
            <li className="sidebar-item">
              <Link
                to="/admin"
                className={`sidebar-link ${isActive('/admin') ? 'active' : ''}`}
              >
                <Icon name="admin" /> Quản trị (Admin)
              </Link>
            </li>
          )}
        </ul>

        <div className="sidebar-footer">
          {loading ? (
            <div className="user-profile-widget-loading" style={{ height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800', color: '#666', border: '2px dashed #ccc', borderRadius: 'var(--radius-sm)' }}>
              🔄 Đang xác thực...
            </div>
          ) : user ? (
            <div className="user-profile-widget" onClick={() => setShowUserModal(true)}>
              <div className="user-avatar">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  getInitials(user.name)
                )}
              </div>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-email">{user.email}</span>
              </div>
            </div>
          ) : (
            <button
              className="neo-btn neo-btn-primary"
              style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' }}
              onClick={openLoginModal}
            >
              🔑 Đăng nhập / Đăng ký
            </button>
          )}
        </div>
      </aside>

      {/* User Account Options Modal */}
      {showUserModal && user && (
        <div className="quiz-overlay" onClick={() => setShowUserModal(false)}>
          <div className="neo-card" style={{ width: '350px', backgroundColor: 'var(--color-white)', border: '3px solid #000', borderRadius: 'var(--radius-md)', padding: '25px', boxShadow: '8px 8px 0px #000', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button
              style={{ position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}
              onClick={() => setShowUserModal(false)}
            >
              ✕
            </button>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '3px solid #000', backgroundColor: 'var(--color-primary-light)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '900', margin: '0 auto 10px auto', boxShadow: '3px 3px 0px #000', overflow: 'hidden' }}>
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  getInitials(user.name)
                )}
              </div>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: '900' }}>{user.name}</h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#666', fontWeight: '700' }}>{user.email}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {user?.role === 'admin' && (
                <button
                  className="neo-btn"
                  style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', backgroundColor: 'var(--color-primary-light)' }}
                  onClick={() => {
                    navigate('/admin');
                    setShowUserModal(false);
                  }}
                >
                  🛡️ Quản trị (Admin)
                </button>
              )}
              <button
                className="neo-btn"
                style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' }}
                onClick={() => {
                  navigate('/settings');
                  setShowUserModal(false);
                }}
              >
                ⚙️ Cài đặt tài khoản
              </button>
              <button
                className="neo-btn"
                style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', backgroundColor: 'var(--color-primary)', color: 'white' }}
                onClick={async () => {
                  await handleLogout();
                  setShowUserModal(false);
                  showToast('Đăng xuất thành công!', 'success');
                }} logout
              >
                🚪 Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login / Register Modal */}
      {showLoginModal && (
        <div className="quiz-overlay" onClick={() => setShowLoginModal(false)}>
          <div
            className="neo-card"
            style={{
              width: '400px',
              maxWidth: '90%',
              backgroundColor: 'var(--color-white)',
              border: '3px solid #000',
              borderRadius: 'var(--radius-md)',
              padding: '30px',
              boxShadow: '8px 8px 0px #000',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={{
                position: 'absolute',
                top: '12px',
                right: '18px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                fontWeight: 'bold',
                cursor: 'pointer',
                color: 'var(--color-black)'
              }}
              onClick={() => setShowLoginModal(false)}
            >
              ✕
            </button>

            {isLoginMode ? (
              <>
                <h3 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '20px', textAlign: 'center' }}>
                  🔑 Đăng Nhập
                </h3>

                {loginError && (
                  <div
                    style={{
                      backgroundColor: 'var(--color-primary-light)',
                      border: '2px solid var(--color-primary)',
                      color: '#721c24',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px',
                      fontSize: '13px',
                      fontWeight: '700',
                      marginBottom: '15px'
                    }}
                  >
                    ⚠ {loginError}
                  </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-black)' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #000',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '14px',
                        fontWeight: '700',
                        outline: 'none',
                        backgroundColor: 'white',
                        color: 'black'
                      }}
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-black)' }}>
                      Mật khẩu
                    </label>
                    <input
                      type="password"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #000',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '14px',
                        fontWeight: '700',
                        outline: 'none',
                        backgroundColor: 'white',
                        color: 'black'
                      }}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="neo-btn neo-btn-primary"
                    style={{ width: '100%', padding: '12px', marginTop: '5px', fontSize: '14px' }}
                  >
                    Đăng nhập bằng Email
                  </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-black)' }}>
                    Chưa có tài khoản?{' '}
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary)',
                        fontWeight: '800',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: 0,
                        fontSize: '13px'
                      }}
                      onClick={() => {
                        setIsLoginMode(false);
                        setRegisterError('');
                      }}
                    >
                      Đăng ký ngay
                    </button>
                  </span>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '20px', textAlign: 'center' }}>
                  📝 Đăng Ký Tài Khoản
                </h3>

                {registerError && (
                  <div
                    style={{
                      backgroundColor: 'var(--color-primary-light)',
                      border: '2px solid var(--color-primary)',
                      color: '#721c24',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px',
                      fontSize: '13px',
                      fontWeight: '700',
                      marginBottom: '15px'
                    }}
                  >
                    ⚠ {registerError}
                  </div>
                )}

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-black)' }}>
                      Tên hiển thị
                    </label>
                    <input
                      type="text"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #000',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '14px',
                        fontWeight: '700',
                        outline: 'none',
                        backgroundColor: 'white',
                        color: 'black'
                      }}
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-black)' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #000',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '14px',
                        fontWeight: '700',
                        outline: 'none',
                        backgroundColor: 'white',
                        color: 'black'
                      }}
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-black)' }}>
                      Mật khẩu
                    </label>
                    <input
                      type="password"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #000',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '14px',
                        fontWeight: '700',
                        outline: 'none',
                        backgroundColor: 'white',
                        color: 'black'
                      }}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-black)' }}>
                      Xác nhận mật khẩu
                    </label>
                    <input
                      type="password"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #000',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '14px',
                        fontWeight: '700',
                        outline: 'none',
                        backgroundColor: 'white',
                        color: 'black'
                      }}
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="neo-btn neo-btn-primary"
                    style={{ width: '100%', padding: '12px', marginTop: '5px', fontSize: '14px' }}
                  >
                    Tạo tài khoản mới
                  </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-black)' }}>
                    Đã có tài khoản?{' '}
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary)',
                        fontWeight: '800',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: 0,
                        fontSize: '13px'
                      }}
                      onClick={() => {
                        setIsLoginMode(true);
                        setRegisterError('');
                      }}
                    >
                      Đăng nhập
                    </button>
                  </span>
                </div>
              </>
            )}

            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '10px' }}>
              <div style={{ flex: 1, height: '2px', backgroundColor: '#000' }}></div>
              <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#666' }}>Hoặc</span>
              <div style={{ flex: 1, height: '2px', backgroundColor: '#000' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '5px' }}>
              <div id="google-signin-btn"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
