'use client';
import Image from "next/image";
import styles from "./page.module.scss";
import HomBanner from "../assets/images/book.jpeg"; // Kiểm tra lại tên file ảnh
import Link from "next/link";
import { useState } from "react";
import Xinhyeu from "../assets/images/tanh8.webp";

export default function Home() {
  const [feedback, setFeedback] = useState("");

  const feedbacks = [
    { id: 1, user: "giang nguyễn", time: "09:47:35 19/4/2026", content: "ad có thể cho tính năng bọn e tự thêm từ vào đc k ạ" },
    { id: 2, user: "Quynh Dao Nhu", time: "01:57:06 19/4/2026", content: "좋아" },
    { id: 3, user: "A Ly", time: "18:55:06 18/4/2026", content: "hóng app hoàn thiện" },
    { id: 4, user: "Nhi Dao", time: "10:28:08 18/4/2026", content: "Hóng shop mãi tụi em đợi shop sớm ra mắt" },
    { id: 5, user: "Nhung Lê", time: "19:07:06 17/4/2026", content: "hóng web từng ngày, arigathankyou thợ code" },
  ];

  return (
    <div className={styles.home_wrapper}>
      <div className={styles.left_column}>
        <div className={styles.info_box}>
          📢 <strong>Thông báo:</strong> Website đang phát triển nội dung, dự kiến hoàn thành vào 1/6.
        </div>
        <div className={styles.main_banner}>
          <h1>HỌC BẢN CHẤT – KHÔNG HỌC VẸT</h1>
          <p>Không chỉ là <span className={styles.blue}>nghĩa của từ</span> mà là <span className={styles.orange}>cách dùng đúng</span> của từ.</p>
        </div>
        <Link href={"/"}>
          <div className={styles.book_section}>
            <Image src={HomBanner} className={styles.book_image} alt="Book" width={350} height={450} priority />
          </div>
        </Link>
      </div>
      <aside className={styles.right_column}>
        <div className={styles.feedback_container}>
          <h3>Góp ý tính năng</h3>
          <div className={styles.feedback_list}>
            {feedbacks.map((f) => (
              <div key={f.id} className={styles.feedback_card}>
                <div className={styles.user_info}>
                  <strong><Image src={Xinhyeu} alt="Xinhyeu" width={30} height={30} style={{borderRadius: "50%"}}/></strong> {f.user} <span>{f.time}</span>
                </div>
                <p>{f.content}</p>
              </div>
            ))}
          </div>
          <div className={styles.input_section}>
            <div className={styles.input_wrapper}>
              <input 
                placeholder="Góp ý..." 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <button>↵</button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}