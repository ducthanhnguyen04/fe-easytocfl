'use client';
import styles from "./settings.module.scss";
import Image from 'next/image';
import Xinhyeu from "../../assets/images/tanh8.webp";


export default function Settings() {
  return (
    <div className={styles.settings_wrapper}>
      <div className={styles.settings_content}>
      <h1>Cài đặt</h1>

      <div className={styles.settings_card}>
        <div className={styles.card_header}>
          <span>👤</span> Tài khoản
        </div>
        <div className={styles.profile_section}>
          <Image 
            src={Xinhyeu} 
            alt="Avatar" 
            className={styles.avatar} 
          />
          <div className={styles.info}>
            <h3>Thanh Nguyen Duc</h3>
            <p>ndt.ducthanh04@gmail.com</p>
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
        <button className={styles.logout_btn} onClick={() => alert('Đăng xuất...')}>
          ➞ Đăng xuất khỏi thiết bị
        </button>
      </div>
      </div>
    </div>
  );
}