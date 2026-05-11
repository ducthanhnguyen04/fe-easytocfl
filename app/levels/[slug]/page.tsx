"use client";
import Link from "next/link";
import styles from "./levelsDetail.module.scss";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import lessonService from "@/services/lessonService";

interface LessonData {
  id: number;
  lessonName: string;
  title: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export default function LevelsDetail() {
  const searchParams = useSearchParams();
  const levelId = searchParams.get("levelId");
  const [lessons, setLessons] = useState<LessonData[]>([]);
  
  useEffect(() => {
    const fetchLessons = async () => {
      if(!levelId) {
        return;
      }
      try {
        const response: any = await lessonService.getLessonsByLevelId(levelId);
        setLessons(response.lessons || []);
      } catch (error) {
        console.error("Error fetching lessons:", error);
      }
    }
    fetchLessons();
  }, [levelId])

  return (
    <div className={styles.vocabulary_detail_wrapper}>
      <Link href="/vocabularies" className={styles.back_link}>
         &lt; Danh sách sách
      </Link>

      <header className={styles.header}>
        <span className={styles.badge}>TOCFL A1</span>
        <span className={styles.lesson_count}>15 bài</span>
        <h1 className={styles.main_title}>Tiếng Trung Tổng Hợp</h1>
        <p className={styles.sub_title}>
          Sơ cấp 1 — Giáo trình chuẩn dành cho người Việt Nam học tiếng Trung — 15 bài sơ cấp
        </p>
      </header>

      <div className={styles.units_grid}>
        {lessons.map((lesson) => (
          <Link href={`/levels/${lesson.slug}/vocabularies?lessonId=${lesson.id}`} key={lesson.id} className={styles.unit_link}>
            <div key={lesson.id} className={`${styles.unit_card}`}>
            <div className={styles.unit_number}>{lesson.id}</div>
            <div className={styles.unit_info}>
              <h3>{lesson.lessonName} </h3>
              <p className={styles.unit_sub}>{lesson.title}</p>
              {/* <p className={styles.unit_meta}>📖 {unit.count}</p> */}
            </div>
          </div>
          </Link>
        ))}
      </div>
    </div>
  );
}