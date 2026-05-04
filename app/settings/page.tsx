'use client';
import styles from "./settings.module.scss";
import axios from "axios";
import { useAuth } from "../auth/authContext";
import beUrl from "../../api-url";

export default function Settings() {
  const { user, setUser, loading } = useAuth();
  
 console.log("User in Settings:", user, "Loading:", loading);
 if (loading) {
    return <div className={styles.loading}>Đang kiểm tra đăng nhập...</div>;
  }

  if (!user) {
    return (
      <div className={styles.centeredPage}>
        <div className={styles.error}>Bạn cần đăng nhập để xem trang này.</div>
      </div>
    );
  }

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
    <div className={styles.settings_wrapper}>
      <div className={styles.settings_content}>
      <h1>Cài đặt</h1>

      <div className={styles.settings_card}>
        <div className={styles.card_header}>
          <span>👤</span> Tài khoản
        </div>
        <div className={styles.profile_section}>
          <img 
            src={`${beUrl}/avatars/default.png`} 
            alt="Avatar" 
            className={styles.avatar} 
            width={65}
            height={65}
          />
          <div className={styles.info}>
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>
        </div>
      </div>

      <div className={styles.settings_card}>
        <div className={styles.card_header}>
          <span>🔒</span> Đặt mật khẩu
        </div>
        <div className={styles.password_form}>
          <p className={styles.sub_note}>
            Tài khoản đang đăng nhập qua Google. Đặt mật khẩu để có thể đăng nhập bằng email + mật khẩu.
          </p>
          <input 
            type="password" 
            placeholder="Mật khẩu mới (tối thiểu 6 ký tự)" 
            className={styles.input_field}
          />
          <input 
            type="password" 
            placeholder="Xác nhận mật khẩu mới" 
            className={styles.input_field}
          />
          <button className={styles.blue_btn}>Đặt mật khẩu</button>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button className={styles.logout_btn} onClick={handleLogout}>
          ➞ Đăng xuất khỏi thiết bị
        </button>
      </div>
      </div>
    </div>
  );
}