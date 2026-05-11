'use client';
import styles from "./sidebar.module.scss";
import { useState } from 'react';
import axios from "axios";
import { useRouter } from "next/navigation";
import { Ma_Shan_Zheng } from 'next/font/google';
import Link from "next/link";
import { useAuth } from "@/app/auth/authContext";
import beUrl from "../../api-url";

declare global {
  interface Window {
    google: any;
  }
}
const zhFontTitle = Ma_Shan_Zheng({ weight: '400', subsets: ['latin'] });

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const router = useRouter();
    
    const { user, setUser, loading } = useAuth();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    const closeAll = () => {
        setIsOpen(false);
        setIsLoginOpen(false);
    };
   
    const handleLogin = async () => {
      try {
        const response = await axios.post(`${beUrl}/auth/login`, 
          { email, password }, 
          { withCredentials: true }
        );

        const userData = response.data.data || response.data.user || response.data;

        if (userData) {
          setUser({ ...userData });
          closeAll();
          setEmail('');
          setPassword('');
          router.refresh();
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("Đăng nhập thất bại!");
      }
    }

    return (
        <div className={styles.sidebar_wrapper}>
          <button 
            className={`${styles.mobileMenuBtn} ${isOpen ? styles.hideBtn : ''}`} 
            onClick={() => setIsOpen(true)}
          >
            ☰
          </button>

          {(isOpen || isLoginOpen) && <div className={styles.overlay} onClick={closeAll} />}

          <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
            <div className={`${styles.logo} ${zhFontTitle.className}`}>
              <span style={{ color: '#3b82f6' }}>漢語</span> Easy Tocfl
            </div>

            <nav className={styles.navGroup}>
              <Link href={"/"} className={styles.navLink} onClick={() => setIsOpen(false)}>
                <div className={`${styles.navItem} ${styles.active}`}>
                  <span className={styles.icon}>🏠</span> <span>Trang chủ</span>
                </div>
              </Link>
              <div className={styles.navItem}><span className={styles.icon}>🔤</span> <span>Bảng chữ cái</span></div>
              <Link href={"/levels"} className={styles.navLink} onClick={() => setIsOpen(false)}>
                <div className={styles.navItem}><span className={styles.icon}>📖</span> <span>Từ vựng</span></div>
              </Link>
              <div className={styles.navItem}><span className={styles.icon}>⚖️</span> <span>Ngữ pháp</span></div>
              <div className={styles.navItem}><span className={styles.icon}>📝</span> <span>Luyện đề</span></div>
              <div className={styles.navItem}><span className={styles.icon}>🎧</span> <span>Shadowing</span></div>
            </nav>

            <div className={styles.footerLinks}>
              <div className={styles.navItem}><span className={styles.icon}>❓</span> <span>Trợ giúp</span></div>
              
              <Link href="/settings" className={styles.navLink} onClick={() => setIsOpen(false)}>
                <div className={styles.navItem}><span className={styles.icon}>⚙️</span> <span>Cài đặt</span></div>
              </Link>
              
              <div className={styles.authSection}>
                {loading ? (
                  <div className={styles.navItem}>
                    <span className={styles.icon}>⏳</span> <span>Đang tải...</span>
                  </div>
                ) : !user ? (
                  <button 
                    className={styles.loginBtn} 
                    onClick={() => { setIsLoginOpen(true); setIsOpen(false); }}
                  >
                    ➞ Đăng nhập
                  </button>
                ) : (
                  <div className={styles.account}>
                    <div className={styles.userIcon}>
                      <img 
                        src={user.avatarUrl || "/default-avatar.png"} 
                        alt="avatar" 
                        width={35} 
                        height={35} 
                        style={{ borderRadius: "50%", border: "2px solid #3b82f6", objectFit: "cover" }}
                      />
                    </div>
                    <div className={styles.userName}>
                      <p>{user.name}</p>
                      <span>{user.email}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {isLoginOpen && (
            <div className={styles.loginModal}>
              <div className={styles.modalContent}>
                <h3>Đăng nhập</h3>
                <p className={styles.subText}>Đăng nhập để đồng bộ tiến trình học của bạn.</p>
                
                <div id="googleBtn" style={{display: 'flex', justifyContent: 'center', margin: '20px 0'}}></div>

                <div className={styles.divider}><span>HOẶC</span></div>

                <div className={styles.inputGroup}>
                  <div className={styles.inputField}>
                    <span>📧</span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                  </div>
                  <div className={styles.inputField}>
                    <span>🔒</span>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu" />
                  </div>
                </div>
                <button className={styles.submitBtn} onClick={handleLogin}>Đăng nhập</button>
              </div>
            </div>
          )}
        </div>
    );
}