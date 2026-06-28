import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import beUrl from '../../api-url/api-backend';
import './Radicals.css';

const Radicals = () => {
  const [radicals, setRadicals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStrokes, setSelectedStrokes] = useState('All');

  const strokeOptions = ['All', '2', '3', '4', '5', '6', '7', '8', '9'];

  useEffect(() => {
    const fetchRadicals = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${beUrl}/radicals/get-all`);
        const dbRadicals = response.data.radicals || [];
        const mapped = dbRadicals.map(r => ({
          id: r.id,
          glyph: r.radical,
          pinyin: r.pinyin,
          strokes: parseInt(r.stroke) || 0,
          meaning: r.meaning,
          desc: r.profoundMeaning || '',
          examples: r.example || ''
        }));
        setRadicals(mapped);
      } catch (err) {
        console.error("Error fetching radicals:", err);
        setRadicals([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRadicals();
  }, []);

  const filteredRadicals = useMemo(() => {
    return radicals.filter(r => {
      const matchesSearch = r.glyph.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.pinyin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.examples.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStrokes = selectedStrokes === 'All' || String(r.strokes) === selectedStrokes;

      return matchesSearch && matchesStrokes;
    });
  }, [radicals, searchQuery, selectedStrokes]);

  if (loading) {
    return (
      <div className="radicals-page">
        <div className="page-title-banner">
          <div>
            <h2>Bộ Thủ Tiếng Trung (Traditional Radicals)</h2>
            <p>Học các bộ thủ phồn thể thường gặp để tra cứu và ghi nhớ chữ Hán dễ dàng hơn</p>
          </div>
        </div>
        <div className="neo-card" style={{ padding: '40px', textAlign: 'center', fontWeight: 'bold', fontSize: '16px', color: 'var(--color-primary)' }}>
          🔄 Đang tải dữ liệu bộ thủ...
        </div>
      </div>
    );
  }

  return (
    <div className="radicals-page">
      <div className="page-title-banner">
        <div>
          <h2>Bộ Thủ Tiếng Trung (Traditional Radicals)</h2>
          <p>Học các bộ thủ phồn thể thường gặp để tra cứu và ghi nhớ chữ Hán dễ dàng hơn</p>
        </div>
        <div className="neo-badge" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
          {radicals.length} Bộ Thủ Cốt Lõi
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
      {radicals.length === 0 ? (
        <div className="neo-card" style={{ padding: '40px', textAlign: 'center', fontWeight: 'bold', fontSize: '18px', color: 'var(--color-primary)' }}>
          📭 No data
        </div>
      ) : filteredRadicals.length === 0 ? (
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

