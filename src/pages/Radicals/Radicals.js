import React, { useState, useMemo } from 'react';
import './Radicals.css';

const radicalsList = [
  { id: 1, glyph: '人 (亻)', pinyin: 'nhân (rén)', strokes: 2, meaning: 'Người', desc: 'Liên quan đến con người, hành vi hoặc tư thế của con người.', examples: '你 (nǐ), 他 (tā), 們 (men), 借 (jiè)' },
  { id: 2, glyph: '口', pinyin: 'khẩu (kǒu)', strokes: 3, meaning: 'Cái miệng', desc: 'Liên quan đến ăn uống, nói năng, hoặc các vật có dạng giống miệng.', examples: '吃 (chī), 喝 (hē), 叫 (jiào), 唱 (chàng)' },
  { id: 3, glyph: '心 (忄)', pinyin: 'tâm (xīn)', strokes: 4, meaning: 'Trái tim', desc: 'Biểu thị tư duy, cảm xúc, tâm trạng hoặc suy nghĩ con người.', examples: '想 (xiǎng), 忙 (máng), 慢 (màn), 愛 (ài)' },
  { id: 4, glyph: '木', pinyin: 'mộc (mù)', strokes: 4, meaning: 'Cây cối', desc: 'Chỉ các loài thực vật, gỗ hoặc đồ đạc chế tác từ gỗ.', examples: '林 (lín), 森 (sēn), 校 (xiào), 椅 (yǐ)' },
  { id: 5, glyph: '水 (氵)', pinyin: 'thủy (shuǐ)', strokes: 4, meaning: 'Nước', desc: 'Liên quan đến nước, chất lỏng, sông ngòi hoặc hiện tượng ẩm ướt.', examples: '江 (jiāng), 海 (hǎi), 汁 (zhī), 洗 (xǐ)' },
  { id: 6, glyph: '火 (灬)', pinyin: 'hỏa (huǒ)', strokes: 4, meaning: 'Lửa', desc: 'Chỉ sức nóng, ánh sáng, nấu nướng hoặc sự thiêu đốt.', examples: '燈 (dēng), 熱 (rè), 照 (zhào), 燒 (shāo)' },
  { id: 7, glyph: '手 (扌)', pinyin: 'thủ (shǒu)', strokes: 4, meaning: 'Bàn tay', desc: 'Biểu thị động tác thực hiện bằng tay hoặc cầm nắm.', examples: '打 (dǎ), 拿 (ná), 提 (tí), 推 (tuī)' },
  { id: 8, glyph: '女', pinyin: 'nữ (nǚ)', strokes: 3, meaning: 'Con gái', desc: 'Chỉ phái nữ, hôn nhân hoặc quan hệ thân thích phụ nữ.', examples: '媽 (mā), 姐 (jiě), 妹 (mèi), 妻 (qī)' },
  { id: 9, glyph: '宀', pinyin: 'miên (mián)', strokes: 3, meaning: 'Mái nhà', desc: 'Liên quan đến nhà cửa, nơi cư trú hoặc che đậy bảo vệ.', examples: '家 (jiā), 安 (ān), 室 (shì), 宿 (sù)' },
  { id: 10, glyph: '土', pinyin: 'thổ (tǔ)', strokes: 3, meaning: 'Đất', desc: 'Chỉ đất đai, địa điểm xây dựng hoặc khoáng sản mặt đất.', examples: '地 (dì), 在 (zài), 壞 (huài), 塔 (tǎ)' },
  { id: 11, glyph: '日', pinyin: 'nhật (rì)', strokes: 4, meaning: 'Mặt trời', desc: 'Liên quan đến mặt trời, thời gian, ánh sáng ban ngày.', examples: '明 (míng), 昨 (zuó), 時 (shí), 晴 (qíng)' },
  { id: 12, glyph: '月', pinyin: 'nguyệt (yuè)', strokes: 4, meaning: 'Mặt trăng', desc: 'Liên quan đến mặt trăng, tháng, hoặc cơ thể thịt (nhục - 月).', examples: '朋 (péng), 期 (qī), 朗 (lǎng), 臉 (liǎn)' },
  { id: 13, glyph: '言 (讠)', pinyin: 'ngôn (yán)', strokes: 7, meaning: 'Lời nói', desc: 'Liên quan đến lời nói, ngôn ngữ, viết lách, giao tiếp.', examples: '說 (shuō), 語 (yǔ), 話 (huà), 謝 (xiè)' },
  { id: 14, glyph: '彳', pinyin: 'sách (chì)', strokes: 3, meaning: 'Bước chân trái', desc: 'Biểu thị đường đi, bước đi, hành vi di chuyển ngoài đường.', examples: '行 (xíng), 往 (wǎng), 律 (lǜ), 德 (dé)' },
  { id: 15, glyph: '辶', pinyin: 'sước (chuò)', strokes: 3, meaning: 'Bước đi dài', desc: 'Chỉ sự di chuyển, hành trình xa, khoảng cách hoặc thời gian.', examples: '這 (zhè), 送 (sòng), 迎 (yíng), 通 (tōng)' },
  { id: 16, glyph: '貝 (贝)', pinyin: 'bối (bèi)', strokes: 7, meaning: 'Vỏ sò (Tiền)', desc: 'Liên quan đến tiền bạc, tài sản, buôn bán hoặc quý giá.', examples: '買 (mǎi), 賣 (mài), 貴 (guì), 貨 (huò)' },
  { id: 17, glyph: '戈', pinyin: 'qua (gē)', strokes: 4, meaning: 'Cây mác', desc: 'Chỉ binh khí dài thời cổ, chiến tranh hoặc sự xung đột.', examples: '我 (wǒ), 戰 (zhàn), 或 (huò), 戚 (qī)' },
  { id: 18, glyph: '糸 (纟)', pinyin: 'mịch (mì)', strokes: 6, meaning: 'Sợi tơ', desc: 'Liên quan đến sợi tơ, dệt vải, quần áo hoặc kết nối ràng buộc.', examples: '紅 (hóng), 綠 (lǜ), 結 (jié), 線 (xiàn)' },
  { id: 19, glyph: '金 (钅)', pinyin: 'kim (jīn)', strokes: 8, meaning: 'Kim loại', desc: 'Chỉ vàng bạc, sắt thép, kim khí hoặc tiền xu kim loại.', examples: '銀 (yín), 鐵 (tiě), 鐘 (zhōng), 錢 (qián)' },
  { id: 20, glyph: '食 (飠/饣)', pinyin: 'thực (shí)', strokes: 9, meaning: 'Thức ăn', desc: 'Liên quan đến đồ ăn, ăn uống, đói khát hoặc ẩm thực.', examples: '飯 (fàn), 飲 (yǐn), 飽 (bǎo), 餃 (jiǎo)' },
  { id: 21, glyph: '目', pinyin: 'mục (mù)', strokes: 5, meaning: 'Con mắt', desc: 'Liên quan đến con mắt, cái nhìn, sự quan sát hoặc thị lực.', examples: '看 (kàn), 睡 (shuì), 眼 (yǎn), 睛 (jīng)' },
  { id: 22, glyph: '足', pinyin: 'túc (zú)', strokes: 7, meaning: 'Cái chân', desc: 'Liên quan đến động tác di chuyển bằng chân hoặc đá chạy.', examples: '跑 (pǎo), 跳 (tiào), 路 (lù), 跟 (gēn)' },
  { id: 23, glyph: '疒', pinyin: 'nạch (nè)', strokes: 5, meaning: 'Bệnh tật', desc: 'Liên quan đến các loại bệnh tật, vết thương hoặc trạng thái đau yếu.', examples: '病 (bìng), 痛 (tòng), 疼 (téng), 瘦 (shòu)' },
  { id: 24, glyph: '阜 (阝)', pinyin: 'phụ (fù)', strokes: 8, meaning: 'Gò đất (trái)', desc: 'Liên quan đến địa hình cao, rào cản, bức tường phòng thủ (nằm bên trái chữ).', examples: '院 (yuàn), 防 (fáng), 阻 (zǔ), 附 (fù)' }
];

const Radicals = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStrokes, setSelectedStrokes] = useState('All');

  const strokeOptions = ['All', '2', '3', '4', '5', '6', '7', '8', '9'];

  const filteredRadicals = useMemo(() => {
    return radicalsList.filter(r => {
      const matchesSearch = r.glyph.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.pinyin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.examples.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStrokes = selectedStrokes === 'All' || String(r.strokes) === selectedStrokes;

      return matchesSearch && matchesStrokes;
    });
  }, [searchQuery, selectedStrokes]);

  return (
    <div className="radicals-page">
      <div className="page-title-banner">
        <div>
          <h2>Bộ Thủ Tiếng Trung (Traditional Radicals)</h2>
          <p>Học các bộ thủ phồn thể thường gặp để tra cứu và ghi nhớ chữ Hán dễ dàng hơn</p>
        </div>
        <div className="neo-badge" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
          {radicalsList.length} Bộ Thủ Cốt Lõi
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="neo-card filter-container" style={{ padding: '20px', marginBottom: '30px' }}>
        <div className="filter-row">
          <div className="search-box-wrapper">
            <label className="filter-label">Tìm kiếm bộ thủ</label>
            <input
              type="text"
              className="neo-input search-input"
              placeholder="Nhập chữ Hán, phiên âm hoặc nghĩa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="stroke-filter-wrapper">
            <label className="filter-label">Lọc theo số nét</label>
            <div className="stroke-btn-group">
              {strokeOptions.map(opt => (
                <button
                  key={opt}
                  className={`neo-btn stroke-btn ${selectedStrokes === opt ? 'active' : ''}`}
                  onClick={() => setSelectedStrokes(opt)}
                >
                  {opt === 'All' ? 'Tất cả' : `${opt} nét`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Radicals Grid */}
      {filteredRadicals.length === 0 ? (
        <div className="neo-card" style={{ padding: '40px', textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>
          🔍 Không tìm thấy bộ thủ nào phù hợp với điều kiện tìm kiếm.
        </div>
      ) : (
        <div className="radicals-grid">
          {filteredRadicals.map((rad) => (
            <div key={rad.id} className="neo-card radical-card">
              <div className="radical-header">
                <div className="radical-glyph">{rad.glyph}</div>
                <div className="radical-meta">
                  <span className="neo-badge stroke-badge">{rad.strokes} nét</span>
                </div>
              </div>
              <div className="radical-body">
                <h4 className="radical-pinyin">{rad.pinyin}</h4>
                <div className="radical-meaning">{rad.meaning}</div>
                <p className="radical-desc">{rad.desc}</p>
                <div className="radical-examples">
                  <strong>Ví dụ chữ Hán:</strong>
                  <div className="examples-list">{rad.examples}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Radicals;
