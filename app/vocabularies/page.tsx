import styles from "./vocabulary.module.scss";

export default function Vocabularys() {
  const books = [
    {
      id: 1,
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
        {books.map((book) => (
          <div key={book.id} className={styles.book_card}>
            <div className={styles.book_icon}>
              TIẾNG TRUNG
            </div>

            <div className={styles.book_info}>
              <div className={styles.tag}>{book.tag}</div>
              <h3>{book.title}</h3>
              <span>{book.level}</span>
              <p>{book.desc}</p>
              <div className={styles.stats}>{book.stats}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}