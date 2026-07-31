import React, { useState, useRef } from 'react';
import axios from 'axios';

const AdminVocabularies = ({
  vocabularies,
  lessons,
  levels,
  onRefresh,
  beUrl,
  showError,
  showSuccess,
  setLoading,
  loading,
}) => {
  const [vocabText, setVocabText] = useState('');
  const [vocabMeaning, setVocabMeaning] = useState('');
  const [vocabEnglishMeaning, setVocabEnglishMeaning] = useState('');
  const [vocabPinyin, setVocabPinyin] = useState('');
  const [vocabAudioUrl, setVocabAudioUrl] = useState('');
  const [vocabLessonId, setVocabLessonId] = useState('');
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fileInputRef = useRef(null);

  const resetForm = () => {
    setEditId(null);
    setVocabText('');
    setVocabMeaning('');
    setVocabEnglishMeaning('');
    setVocabPinyin('');
    setVocabAudioUrl('');
    setVocabLessonId('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    if (vocabLessonId) {
      formData.append('lessonId', vocabLessonId);
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${beUrl}/vocabularies/import`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );
      if (response.status === 200 || response.data) {
        showSuccess(`Nhập dữ liệu thành công! Đã thêm ${response.data.count || 0} từ vựng.`);
        onRefresh();
        resetForm();
      } else {
        showError(response.data?.message || 'Lỗi khi import file Excel.');
      }
    } catch (err) {
      console.error('Import excel error:', err);
      showError(err.response?.data?.message || err.response?.data?.error || 'Có lỗi xảy ra khi import file.');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleSaveVocab = async (e) => {
    e.preventDefault();
    if (!vocabText || !vocabMeaning || !vocabEnglishMeaning || !vocabPinyin || !vocabLessonId) {
      showError('Vui lòng điền đầy đủ các trường bắt buộc!');
      return;
    }
    try {
      const payload = {
        vocabulary: vocabText,
        meaning: vocabMeaning,
        englishMeaning: vocabEnglishMeaning,
        pinyin: vocabPinyin,
        audioUrl: vocabAudioUrl,
        lessonId: parseInt(vocabLessonId),
      };

      if (editId) {
        await axios.put(
          `${beUrl}/vocabularies/update/${editId}`,
          payload,
          { withCredentials: true }
        );
        showSuccess('Cập nhật từ vựng thành công!');
      } else {
        await axios.post(
          `${beUrl}/vocabularies/create`,
          payload,
          { withCredentials: true }
        );
        showSuccess('Thêm từ vựng mới thành công!');
      }
      resetForm();
      onRefresh();
    } catch (error) {
      showError(error.response?.data?.message || 'Có lỗi xảy ra khi lưu từ vựng.');
    }
  };

  const handleEditClick = (item) => {
    setEditId(item.id);
    setVocabText(item.vocabulary || '');
    setVocabMeaning(item.meaning || '');
    setVocabEnglishMeaning(item.englishMeaning || '');
    setVocabPinyin(item.pinyin || '');
    setVocabAudioUrl(item.audioUrl || '');
    setVocabLessonId(item.lessonId || '');
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa từ vựng này không? Thao tác này không thể hoàn tác.')) {
      return;
    }
    try {
      await axios.delete(`${beUrl}/vocabularies/delete/${id}`, { withCredentials: true });
      showSuccess('Xóa mục thành công!');
      if (editId === id) {
        resetForm();
      }
      onRefresh();
    } catch (error) {
      console.error('Delete item error:', error);
      const errMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Có lỗi xảy ra khi xóa mục.';
      showError(errMsg);
    }
  };

  const filteredVocabularies = vocabularies.filter((vc) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const ls = lessons.find((l) => l.id === vc.lessonId);
    return (
      vc.id?.toString().includes(query) ||
      vc.vocabulary?.toLowerCase().includes(query) ||
      vc.meaning?.toLowerCase().includes(query) ||
      vc.englishMeaning?.toLowerCase().includes(query) ||
      vc.pinyin?.toLowerCase().includes(query) ||
      (ls && ls.lessonName?.toLowerCase().includes(query)) ||
      (ls && ls.title?.toLowerCase().includes(query))
    );
  });

  return (
    <>
      <div className="neo-card admin-form-card" style={{ padding: '25px' }}>
        <form onSubmit={handleSaveVocab} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 className="form-section-title">
            {editId ? `✏️ Sửa Từ Vựng (ID: ${editId})` : '🔤 Thêm Từ Vựng Mới'}
          </h3>
          <div className="settings-input-group">
            <label className="settings-label">Thuộc Bài Học *</label>
            <select
              className="settings-input"
              value={vocabLessonId}
              onChange={(e) => setVocabLessonId(e.target.value)}
              required
            >
              <option value="">-- Chọn bài học --</option>
              {lessons.map((ls) => {
                const lvl = levels.find((l) => l.id === ls.levelId);
                return (
                  <option key={ls.id} value={ls.id}>
                    {lvl ? `${lvl.levelName} - ` : ''}{ls.lessonName}: {ls.title}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="settings-input-group">
            <label className="settings-label">Từ vựng (Chữ Hán Phồn thể) *</label>
            <input
              type="text"
              className="settings-input"
              placeholder="Ví dụ: 台灣"
              value={vocabText}
              onChange={(e) => setVocabText(e.target.value)}
              required
            />
          </div>
          <div className="settings-input-group">
            <label className="settings-label">Phiên âm Pinyin *</label>
            <input
              type="text"
              className="settings-input"
              placeholder="Ví dụ: Táiwān"
              value={vocabPinyin}
              onChange={(e) => setVocabPinyin(e.target.value)}
              required
            />
          </div>
          <div className="settings-input-group">
            <label className="settings-label">Giải nghĩa tiếng Việt *</label>
            <input
              type="text"
              className="settings-input"
              placeholder="Ví dụ: Đài Loan"
              value={vocabMeaning}
              onChange={(e) => setVocabMeaning(e.target.value)}
              required
            />
          </div>
          <div className="settings-input-group">
            <label className="settings-label">Giải nghĩa tiếng Anh (English Meaning) *</label>
            <input
              type="text"
              className="settings-input"
              placeholder="Ví dụ: Taiwan"
              value={vocabEnglishMeaning}
              onChange={(e) => setVocabEnglishMeaning(e.target.value)}
              required
            />
          </div>
          <div className="settings-input-group">
            <label className="settings-label">Đường dẫn âm thanh phát âm (Audio URL - Tùy chọn)</label>
            <input
              type="text"
              className="settings-input"
              placeholder="Ví dụ: /uploads/audio/taiwan.mp3 hoặc link online"
              value={vocabAudioUrl}
              onChange={(e) => setVocabAudioUrl(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="neo-btn neo-btn-primary" style={{ padding: '12px 25px' }}>
              {editId ? 'Cập nhật' : 'Lưu từ vựng'}
            </button>
            {editId && (
              <button type="button" className="neo-btn" onClick={resetForm} style={{ padding: '12px 25px', backgroundColor: 'var(--color-bg)' }}>
                Hủy sửa
              </button>
            )}
          </div>
        </form>

        {!editId && (
          <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '2px dashed var(--color-black)' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '900', marginBottom: '10px' }}>📥 Nhập danh sách từ Excel</h4>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleImportExcel}
              style={{ display: 'none' }}
              ref={fileInputRef}
              id="excelImportInput"
            />
            <button
              type="button"
              className="neo-btn"
              style={{ backgroundColor: 'var(--color-yellow-light)', width: '100%' }}
              onClick={() => document.getElementById('excelImportInput').click()}
              disabled={loading}
            >
              {loading ? '⏳ Đang xử lý file...' : '📊 Import từ Excel (.xlsx, .xls)'}
            </button>
          </div>
        )}
      </div>

      <div className="neo-card admin-list-card" style={{ padding: '25px', maxHeight: '720px', overflowY: 'auto' }}>
        <h3 className="form-section-title" style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span> Danh Sách Hiện Tại</span>
          <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#e2e8f0', borderRadius: '10px' }}>
            {searchQuery ? `Tìm thấy: ${filteredVocabularies.length} / ${vocabularies.length}` : `Tổng cộng: ${vocabularies.length}`}
          </span>
        </h3>

        <div className="admin-search-container">
          <input
            type="text"
            className="admin-search-input"
            placeholder="🔍 Tìm theo ID, từ vựng, pinyin, nghĩa Việt/Anh, bài học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="admin-search-clear" onClick={() => setSearchQuery('')}>
              Hủy tìm
            </button>
          )}
        </div>

        <div className="data-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Từ vựng</th>
                <th>Giải nghĩa</th>
                <th>Bài học</th>
                <th style={{ width: '150px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredVocabularies.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-table-row">
                    {searchQuery ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có từ vựng nào'}
                  </td>
                </tr>
              ) : (
                filteredVocabularies.map((vc) => {
                  const ls = lessons.find((l) => l.id === vc.lessonId);
                  return (
                    <tr key={vc.id}>
                      <td>{vc.id}</td>
                      <td>
                        <div style={{ fontWeight: '800', fontSize: '15px', color: 'var(--color-primary)' }}>{vc.vocabulary}</div>
                        <div style={{ color: '#666', fontSize: '12px', fontStyle: 'italic' }}>{vc.pinyin}</div>
                      </td>
                      <td>{vc.meaning}</td>
                      <td>{ls ? `${ls.lessonName} - ${ls.title}` : `ID: ${vc.lessonId}`}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="edit-action-btn"
                            onClick={() => handleEditClick(vc)}
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            className="delete-action-btn"
                            onClick={() => handleDeleteItem(vc.id)}
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminVocabularies;
