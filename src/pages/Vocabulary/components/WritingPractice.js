import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import beUrl from '../../../api-url/api-backend';
import { useAuth } from '../../../context/authContext';
import { showToast } from '../../../utils/toast';
import './WritingPractice.css';

const WritingPractice = ({ initialVocabs = [], onBack }) => {
  const { user } = useAuth();
  const location = useLocation();
  const effectiveInitialVocabs = location.state?.initialVocabs || initialVocabs;
  const hasProcessedRef = useRef(false);

  const [savedSheets, setSavedSheets] = useState([]);
  const [currentSheetId, setCurrentSheetId] = useState(null);
  const [sheetTitle, setSheetTitle] = useState('Luyện viết từ vựng');
  const [items, setItems] = useState([]);
  const [viewMode, setViewMode] = useState('editor'); // 'editor' or 'sheetPreview'
  const [loading, setLoading] = useState(false);

  // Input form state
  const [vocabInput, setVocabInput] = useState('');
  const [pinyinInput, setPinyinInput] = useState('');
  const [meaningInput, setMeaningInput] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Fetch writing sheets from backend database on mount and handle lesson state
  useEffect(() => {
    const fetchSheets = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${beUrl}/writing-sheets`, { withCredentials: true });
        const list = res.data.sheets || [];

        const targetTitle = location.state?.lessonTitle || (location.state?.initialVocabs?.length > 0 ? 'Luyện viết từ vựng' : null);
        const navVocabs = location.state?.initialVocabs || initialVocabs;

        if (targetTitle && !hasProcessedRef.current) {
          hasProcessedRef.current = true;

          // Ask backend to find or create sheet atomically by title
          const createRes = await axios.post(
            `${beUrl}/writing-sheets`,
            { title: targetTitle, findIfExists: true },
            { withCredentials: true }
          );

          const { sheet, isNew } = createRes.data;

          if (sheet) {
            if (isNew) {
              // Newly created sheet -> add vocabulary items once
              const newItems = [];
              if (navVocabs && navVocabs.length > 0) {
                for (const v of navVocabs) {
                  const vocab = v.word || v.vocab || v.vocabulary || '';
                  const pinyin = v.pinyin || '';
                  const meaning = v.trans || v.meaning || '';
                  if (vocab && pinyin && meaning) {
                    const itemRes = await axios.post(
                      `${beUrl}/writing-sheets/${sheet.id}/items`,
                      { vocab, pinyin, meaning },
                      { withCredentials: true }
                    );
                    if (itemRes.data.item) {
                      newItems.push(itemRes.data.item);
                    }
                  }
                }
              }
              sheet.items = newItems;
              const updatedSheets = [sheet, ...list.filter(s => s.id !== sheet.id)];
              setSavedSheets(updatedSheets);
              setCurrentSheetId(sheet.id);
              setSheetTitle(sheet.title);
              setItems(newItems.sort((a, b) => Number(a.id) - Number(b.id)));
              showToast(`Đã tạo file luyện viết "${sheet.title}" với ${newItems.length} từ vựng!`, 'success');
            } else {
              // Sheet already existed in DB -> Open it without adding duplicate items
              const updatedSheets = list.some(s => s.id === sheet.id) ? list : [sheet, ...list];
              setSavedSheets(updatedSheets);
              setCurrentSheetId(sheet.id);
              setSheetTitle(sheet.title);
              const sorted = [...(sheet.items || [])].sort((a, b) => Number(a.id) - Number(b.id));
              setItems(sorted);
              showToast(`Đã mở file luyện viết "${sheet.title}"`, 'info');
            }
          }

          // Clear router state to prevent re-triggering on subsequent renders
          window.history.replaceState({}, document.title);
        } else {
          // Standard load (no targetTitle passed or already processed)
          setSavedSheets(list);
          if (list.length > 0) {
            const firstSheet = list[0];
            setCurrentSheetId(firstSheet.id);
            setSheetTitle(firstSheet.title);
            const sorted = [...(firstSheet.items || [])].sort((a, b) => Number(a.id) - Number(b.id));
            setItems(sorted);
          } else {
            // Auto create first sheet in DB if no sheets exist
            const createRes = await axios.post(
              `${beUrl}/writing-sheets`,
              { title: 'File luyện viết #1' },
              { withCredentials: true }
            );
            const created = createRes.data.sheet;
            created.items = [];
            setSavedSheets([created]);
            setCurrentSheetId(created.id);
            setSheetTitle(created.title);
            setItems([]);
          }
        }
      } catch (err) {
        console.error("Error fetching writing sheets from DB:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSheets();
  }, []);

  // Select writing sheet from dropdown
  const handleSelectSheet = async (sheetId) => {
    try {
      setLoading(true);
      const res = await axios.get(`${beUrl}/writing-sheets/${sheetId}`, { withCredentials: true });
      const sheet = res.data.sheet;
      if (sheet) {
        setCurrentSheetId(sheet.id);
        setSheetTitle(sheet.title);
        const sorted = [...(sheet.items || [])].sort((a, b) => Number(a.id) - Number(b.id));
        setItems(sorted);
        setEditingId(null);
        setVocabInput('');
        setPinyinInput('');
        setMeaningInput('');
      }
    } catch (err) {
      console.error("Error loading sheet detail:", err);
      showToast('Tải chi tiết file thất bại!', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Create new writing sheet in database
  const handleCreateNewSheet = async () => {
    const titlePrompt = prompt('Nhập tên file luyện viết mới:', `File luyện viết #${savedSheets.length + 1}`);
    if (!titlePrompt || !titlePrompt.trim()) return;

    try {
      const res = await axios.post(
        `${beUrl}/writing-sheets`,
        { title: titlePrompt.trim() },
        { withCredentials: true }
      );
      const created = res.data.sheet;
      created.items = [];
      setSavedSheets([created, ...savedSheets]);
      setCurrentSheetId(created.id);
      setSheetTitle(created.title);
      setItems([]);
      showToast('Đã tạo file luyện viết mới!', 'success');
    } catch (err) {
      console.error("Error creating new sheet in DB:", err);
      showToast('Tạo file mới thất bại!', 'error');
    }
  };

  // Delete current writing sheet from database
  const handleDeleteCurrentSheet = async () => {
    if (!currentSheetId) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa file "${sheetTitle}"?`)) return;

    try {
      await axios.delete(`${beUrl}/writing-sheets/${currentSheetId}`, { withCredentials: true });
      const updatedSheets = savedSheets.filter(s => s.id !== currentSheetId);
      setSavedSheets(updatedSheets);
      showToast('Đã xóa file!', 'info');

      if (updatedSheets.length > 0) {
        handleSelectSheet(updatedSheets[0].id);
      } else {
        handleCreateNewSheet();
      }
    } catch (err) {
      console.error("Error deleting sheet:", err);
      showToast('Xóa file thất bại!', 'error');
    }
  };

  // Save or update sheet title
  const handleUpdateSheetTitle = async (newTitle) => {
    setSheetTitle(newTitle);
    if (currentSheetId) {
      try {
        await axios.put(`${beUrl}/writing-sheets/${currentSheetId}`, { title: newTitle }, { withCredentials: true });
        setSavedSheets(savedSheets.map(s => s.id === currentSheetId ? { ...s, title: newTitle } : s));
      } catch (err) {
        console.error("Error updating sheet title:", err);
      }
    }
  };

  // Handle Item Form Submit (Add to DB or Update in DB)
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!vocabInput.trim() || !pinyinInput.trim() || !meaningInput.trim()) {
      showToast('Vui lòng điền đầy đủ Từ vựng, Pinyin và Nghĩa tiếng Việt!', 'warning');
      return;
    }

    try {
      let activeSheetId = currentSheetId;
      if (!activeSheetId) {
        const createRes = await axios.post(
          `${beUrl}/writing-sheets`,
          { title: sheetTitle },
          { withCredentials: true }
        );
        activeSheetId = createRes.data.sheet.id;
        setCurrentSheetId(activeSheetId);
      }

      if (editingId) {
        // Update item in database
        const res = await axios.put(
          `${beUrl}/writing-sheets/items/${editingId}`,
          {
            vocab: vocabInput.trim(),
            pinyin: pinyinInput.trim(),
            meaning: meaningInput.trim()
          },
          { withCredentials: true }
        );
        const updated = res.data.item;
        setItems(items.map(it => it.id === editingId ? (updated || { ...it, vocab: vocabInput.trim(), pinyin: pinyinInput.trim(), meaning: meaningInput.trim() }) : it));
        setEditingId(null);
        showToast('Đã cập nhật từ vựng!', 'success');
      } else {
        // Add new item to database
        const res = await axios.post(
          `${beUrl}/writing-sheets/${activeSheetId}/items`,
          {
            vocab: vocabInput.trim(),
            pinyin: pinyinInput.trim(),
            meaning: meaningInput.trim()
          },
          { withCredentials: true }
        );
        const newItem = res.data.item;
        setItems([...items, newItem]);
        showToast('Đã thêm từ vựng mới thành công!', 'success');
      }

      setVocabInput('');
      setPinyinInput('');
      setMeaningInput('');
    } catch (err) {
      console.error("Error saving item to DB:", err);
      showToast('Lỗi khi lưu từ vựng vào CSDL!', 'error');
    }
  };

  // Edit item click
  const handleEditClick = (item) => {
    setEditingId(item.id);
    setVocabInput(item.vocab);
    setPinyinInput(item.pinyin);
    setMeaningInput(item.meaning);
  };

  // Delete item from database
  const handleDeleteItem = async (id) => {
    try {
      await axios.delete(`${beUrl}/writing-sheets/items/${id}`, { withCredentials: true });
      setItems(items.filter(it => it.id !== id));
      showToast('Đã xóa từ vựng!', 'info');
    } catch (err) {
      console.error("Error deleting item from DB:", err);
      showToast('Xóa từ vựng thất bại!', 'error');
    }
  };

  // Quick preset sample data saved directly to DB
  const handleAddSampleData = async () => {
    try {
      let activeSheetId = currentSheetId;
      if (!activeSheetId) {
        const createRes = await axios.post(
          `${beUrl}/writing-sheets`,
          { title: sheetTitle },
          { withCredentials: true }
        );
        activeSheetId = createRes.data.sheet.id;
        setCurrentSheetId(activeSheetId);
      }

      const samples = [
        { vocab: '你好', pinyin: 'nǐ hǎo', meaning: 'Xin chào' },
        { vocab: '學校', pinyin: 'xuéxiào', meaning: 'Trường học' },
        { vocab: '老師', pinyin: 'lǎoshī', meaning: 'Giáo viên' },
        { vocab: '學生', pinyin: 'xuéshēng', meaning: 'Học sinh' },
        { vocab: '謝謝', pinyin: 'xièxie', meaning: 'Cảm ơn' }
      ];

      const newItems = [];
      for (const s of samples) {
        const res = await axios.post(
          `${beUrl}/writing-sheets/${activeSheetId}/items`,
          s,
          { withCredentials: true }
        );
        if (res.data.item) {
          newItems.push(res.data.item);
        }
      }
      setItems(prev => [...prev, ...newItems]);
      showToast('Đã thêm 5 từ vựng mẫu!', 'success');
    } catch (err) {
      console.error("Error adding sample data to DB:", err);
      showToast('Thêm từ vựng mẫu thất bại!', 'error');
    }
  };

  // Handle Print Action
  const handlePrint = () => {
    window.print();
  };

  // Render Tian Zi Ge Grid Row for a word
  const renderTianzigeRow = (vocabStr) => {
    const chars = Array.from(vocabStr || '');
    if (chars.length === 0) return null;

    const totalBoxesPerRow = 12;
    const repeatedBoxes = [];

    // Fill all boxes sequentially with characters from the word
    for (let i = 0; i < totalBoxesPerRow; i++) {
      repeatedBoxes.push(chars[i % chars.length]);
    }

    return (
      <div className="tianzige-row">
        {repeatedBoxes.map((char, bIdx) => (
          <div key={bIdx} className="tianzige-box">
            {char && <span className="tianzige-char">{char}</span>}
          </div>
        ))}
      </div>
    );
  };

  if (viewMode === 'sheetPreview') {
    return (
      <div>
        {/* Top Control Bar (Hidden when printing) */}
        <div className="writing-sheet-control-bar">
          <button
            className="neo-btn"
            onClick={() => setViewMode('editor')}
          >
            ← Quay lại chỉnh sửa
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="neo-btn neo-btn-primary"
              style={{ backgroundColor: '#e53e3e', color: '#ffffff' }}
              onClick={handlePrint}
            >
              🖨️ In / Lưu PDF
            </button>
          </div>
        </div>

        {/* Printable Document (A4 Styling) */}
        <div className="writing-paper-document">
          <div className="writing-paper-header">
            <h1 className="writing-paper-title">{sheetTitle || 'Luyện viết từ vựng'}</h1>
            <p className="writing-paper-domain">easytocfl.com — Tiếng Trung Phồn Thể</p>
          </div>

          {items.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888', fontWeight: 'bold' }}>
              Chưa có từ vựng nào trong danh sách. Vui lòng quay lại và thêm từ vựng!
            </div>
          ) : (
            items.map((item, index) => (
              <div key={item.id || index} className="writing-item-block">
                <div className="writing-item-vocab-line">
                  <span>{item.vocab}</span>
                  <span className="writing-item-pinyin">({item.pinyin})</span>
                </div>
                <div className="writing-item-meaning">
                  {item.meaning}
                </div>
                {renderTianzigeRow(item.vocab)}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="writing-practice-container">
      {/* Title Banner */}
      <div className="page-title-banner" style={{ borderLeft: '10px solid var(--color-primary)' }}>
        <div>
          <h2>📝 Tạo File Luyện Viết Từ Vựng</h2>
          <p>Tự tạo tập viết chữ Hán Phồn thể chuẩn khung ô Điền Tự Cách (田字格) có nét in mờ & xuất file in/PDF</p>
        </div>
        {onBack && (
          <button className="neo-btn" onClick={onBack}>
            ← Quay lại
          </button>
        )}
      </div>

      {/* Editor Form Card */}
      <div className="writing-editor-card">
        {/* Saved Sheets Manager Dropdown */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px dashed #ccc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
            <label style={{ fontWeight: '800', fontSize: '13px', whiteSpace: 'nowrap' }}>📁 Chọn file luyện viết:</label>
            <select
              className="settings-input"
              style={{ flex: 1, padding: '8px 12px' }}
              value={currentSheetId || ''}
              onChange={(e) => handleSelectSheet(e.target.value)}
              disabled={loading}
            >
              {savedSheets.map(s => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.items?.length || 0} từ)
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="neo-btn neo-btn-primary"
              style={{ padding: '8px 14px', fontSize: '13px' }}
              onClick={handleCreateNewSheet}
            >
              ➕ Tạo file mới
            </button>
            {savedSheets.length > 1 && (
              <button
                type="button"
                className="neo-btn"
                style={{ padding: '8px 14px', fontSize: '13px', backgroundColor: '#fed7d7', color: '#9b2c2c' }}
                onClick={handleDeleteCurrentSheet}
              >
                🗑️ Xóa file này
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}>
            {editingId ? '✏️ Chỉnh sửa từ vựng' : '➕ Thêm từ vựng mới'}
          </h3>
          <button
            type="button"
            className="neo-btn"
            style={{ fontSize: '12px', padding: '6px 12px', backgroundColor: '#edf2f7' }}
            onClick={handleAddSampleData}
          >
            ✨ Thêm từ vựng mẫu
          </button>
        </div>

        <form onSubmit={handleSaveItem}>
          <div className="settings-input-group" style={{ marginBottom: '15px' }}>
            <label className="settings-label">Tên file luyện viết</label>
            <input
              type="text"
              className="settings-input"
              value={sheetTitle}
              onChange={(e) => handleUpdateSheetTitle(e.target.value)}
              placeholder="Ví dụ: Luyện viết từ vựng Bài 1"
              required
            />
          </div>

          <div className="writing-form-grid">
            <div className="settings-input-group">
              <label className="settings-label">Từ vựng (Chữ Hán)</label>
              <input
                type="text"
                className="settings-input"
                value={vocabInput}
                onChange={(e) => setVocabInput(e.target.value)}
                placeholder="Ví dụ: 學生"
              />
            </div>
            <div className="settings-input-group">
              <label className="settings-label">Phiên âm (Pinyin)</label>
              <input
                type="text"
                className="settings-input"
                value={pinyinInput}
                onChange={(e) => setPinyinInput(e.target.value)}
                placeholder="Ví dụ: xuéshēng"
              />
            </div>
            <div className="settings-input-group">
              <label className="settings-label">Nghĩa tiếng Việt</label>
              <input
                type="text"
                className="settings-input"
                value={meaningInput}
                onChange={(e) => setMeaningInput(e.target.value)}
                placeholder="Ví dụ: Học sinh"
              />
            </div>
            <div>
              <button
                type="submit"
                className="neo-btn neo-btn-primary"
                style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}
              >
                {editingId ? 'Lưu chỉnh sửa' : '➕ Thêm từ vựng'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Vocabulary List Table Card */}
      <div className="writing-table-card">
        <div className="writing-card-header">
          <h3 style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}>
            📋 Danh sách từ vựng ({items.length} từ)
          </h3>

          <button
            type="button"
            className="neo-btn neo-btn-primary"
            style={{ backgroundColor: 'var(--color-secondary)', padding: '10px 20px' }}
            onClick={() => {
              if (items.length === 0) {
                showToast('Vui lòng thêm ít nhất 1 từ vựng trước khi tạo bản viết tay!', 'warning');
                return;
              }
              setViewMode('sheetPreview');
            }}
          >
            📄 Tạo bản viết tay ({items.length} từ)
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', fontWeight: 'bold', color: '#666' }}>
            🔄 Đang tải dữ liệu...
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#777', fontWeight: '700', marginTop: '15px' }}>
            Chưa có từ vựng nào trong file này. Vui lòng nhập từ vựng ở form trên hoặc bấm "Thêm từ vựng mẫu".
          </div>
        ) : (
          <div className="writing-table-wrapper">
            <table className="writing-vocab-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th>Từ vựng (Chữ Hán)</th>
                  <th>Pinyin</th>
                  <th>Nghĩa tiếng Việt</th>
                  <th style={{ width: '140px' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td><span className="writing-vocab-char">{item.vocab}</span></td>
                    <td>{item.pinyin}</td>
                    <td>{item.meaning}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="edit-action-btn"
                          onClick={() => handleEditClick(item)}
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          type="button"
                          className="delete-action-btn"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WritingPractice;
