import Link from "next/link";
import styles from "./vocabDetail.module.scss";

export default function VocabularyDetail() {
  // Dữ liệu mẫu y hệt trong ảnh
  const units = [
    { id: 1, title: "소개", sub: "Giới thiệu", count: "32 từ vựng", status: "open" },
    { id: 2, title: "이건 뭐예요?", sub: "Đồ vật xung quanh tôi", count: "Sắp ra mắt", status: "locked" },
    { id: 3, title: "학교 생활", sub: "Cuộc sống học đường", count: "Sắp ra mắt", status: "locked" },
    { id: 4, title: "가족", sub: "Gia đình", count: "Sắp ra mắt", status: "locked" },
    { id: 5, title: "하루 일과", sub: "Sinh hoạt hằng ngày", count: "Sắp ra mắt", status: "locked" },
    { id: 6, title: "음식", sub: "Món ăn", count: "Sắp ra mắt", status: "locked" },
  ];

  return (
    <div className={styles.vocabulary_detail_wrapper}>
      {/* Nút quay lại */}
      <Link href="/vocabularies" className={styles.back_link}>
         &lt; Danh sách sách
      </Link>

      {/* Header Section */}
      <header className={styles.header}>
        <span className={styles.badge}>TOCFL A1</span>
        <span className={styles.lesson_count}>15 bài</span>
        <h1 className={styles.main_title}>Tiếng Trung Tổng Hợp</h1>
        <p className={styles.sub_title}>
          Sơ cấp 1 — Giáo trình chuẩn dành cho người Việt Nam học tiếng Trung — 15 bài sơ cấp
        </p>
      </header>

      {/* Grid bài học */}
      <div className={styles.units_grid}>
        {units.map((unit) => (
          <div key={unit.id} className={`${styles.unit_card} ${unit.status === 'locked' ? styles.locked : ''}`}>
            <div className={styles.unit_number}>{unit.id}</div>
            <div className={styles.unit_info}>
              <h3>{unit.title} {unit.status === 'locked' && "🔒"}</h3>
              <p className={styles.unit_sub}>{unit.sub}</p>
              <p className={styles.unit_meta}>📖 {unit.count}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}