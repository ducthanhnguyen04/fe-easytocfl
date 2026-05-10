"use client";
import styles from "./vocabulary.module.scss";
import { useState, useEffect } from 'react';
import levelService from "@/services/levelService";

interface LevelData {
  id: number;
  levelName: string;
  level: string;  
  createdAt: string;
  updatedAt: string;
}

export default function Vocabularys() {
  const [levels, setLevels] = useState<LevelData[]>([]);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response: any = await levelService.getAllLevels();
        setLevels(response.levels || []); 
      } catch (error) {
        console.error("Error fetching levels:", error);
      }
    }
    fetchLevels();
  }, [])
  const books = [
    {
      id: 1,
      title: "Tiếng Trung Tổng Hợp",
      level: "Sơ cấp 1",
      tag: "TOCFL A1",
      desc: "Giáo trình chuẩn dành cho người Việt Nam học tiếng Trung — Sơ cấp",
      stats: "📖 15 bài · 1 đã mở"
    },
    {
      id: 2,
      title: "Tiếng Trung Tổng Hợp",
      level: "Sơ cấp 1",
      tag: "TOCFL A1",
      desc: "Giáo trình chuẩn dành cho người Việt Nam học tiếng Trung — Sơ cấp",
      stats: "📖 15 bài · 1 đã mở"
    },
    {
      id: 3,
      title: "Tiếng Trung Tổng Hợp",
      level: "Sơ cấp 1",
      tag: "TOCFL A1",
      desc: "Giáo trình chuẩn dành cho người Việt Nam học tiếng Trung — Sơ cấp",
      stats: "📖 15 bài · 1 đã mở"
    }

  ];

  return (
    <div className={styles.vocabularys_wrapper}>
      <div className={styles.header_section}>
        <h1>Từ vựng tiếng Trung</h1>
        <p>Chọn giáo trình để bắt đầu học</p>
      </div>

      <div className={styles.books_grid}>
        {levels.map((book) => (
          <div key={book.id} className={styles.book_card}>
            <div className={styles.book_icon}>
              TIẾNG TRUNG
            </div>

            <div className={styles.book_info}>
              <div className={styles.tag}>{book.levelName}</div>
              <h3>Tiếng Trung Tổng Hợp</h3>
              <span>{book.level}</span>
              <p>Giáo trình chuẩn dành cho người Việt Nam học tiếng Trung</p>
              <div className={styles.stats}>📖 15 bài</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}