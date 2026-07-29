import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import beUrl from '../../api-url/api-backend';
import { useAuth } from '../../context/authContext';
import { showToast } from '../../utils/toast';
import './MyVocabulary.css';
import '../Vocabulary/Vocabulary.css';

import FlashcardMode from '../Vocabulary/components/FlashcardMode';
import QuizMode from '../Vocabulary/components/QuizMode';
import TypingMode from '../Vocabulary/components/TypingMode';
import DictationMode from '../Vocabulary/components/DictationMode';
import VocabList from '../Vocabulary/components/VocabList';

const MyVocabulary = ({ playAudio }) => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [listDetails, setListDetails] = useState(null);
  const [itemsLoading, setItemsLoading] = useState(false);

  const [isLearning, setIsLearning] = useState(false);
  const [vocabMode, setVocabMode] = useState('flashcard');

  // Modals / Form states
  const [showListModal, setShowListModal] = useState(false);
  const [listModalMode, setListModalMode] = useState('create'); // 'create' or 'edit'
  const [currentListId, setCurrentListId] = useState(null);
  const [listNameInput, setListNameInput] = useState('');

  const [showItemModal, setShowItemModal] = useState(false);
  const [itemModalMode, setItemModalMode] = useState('create'); // 'create' or 'edit'
  const [currentItemId, setCurrentItemId] = useState(null);
  const [itemVocab, setItemVocab] = useState('');
  const [itemPinyin, setItemPinyin] = useState('');
  const [itemMeaning, setItemMeaning] = useState('');
  const [itemExample, setItemExample] = useState('');
  const [itemExampleMeaning, setItemExampleMeaning] = useState('');

  // Fetch vocabulary lists
  const fetchLists = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await axios.get(`${beUrl}/my-vocabularies`, {
        withCredentials: true,
      });
      setLists(response.data.lists || []);
    } catch (err) {
      console.error('Error fetching vocabulary lists:', err);
      showToast(err.response?.data?.message || 'Không thể tải danh sách bộ từ vựng', 'error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch list details (vocabulary items inside)
  const fetchListDetails = useCallback(async (listId) => {
    setItemsLoading(true);
    try {
      const response = await axios.get(`${beUrl}/my-vocabularies/${listId}`, {
        withCredentials: true,
      });
      setListDetails(response.data.list);
    } catch (err) {
      console.error('Error fetching list details:', err);
      showToast(err.response?.data?.message || 'Không thể tải chi tiết bộ từ vựng', 'error');
    } finally {
      setItemsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchLists();
    }
  }, [user, fetchLists]);

  // Handle selected list change
  useEffect(() => {
    if (selectedList) {
      fetchListDetails(selectedList.id);
    } else {
      setListDetails(null);
    }
    setIsLearning(false);
    setVocabMode('flashcard');
  }, [selectedList, fetchListDetails]);

  // Create or Update List
  const handleSaveList = async (e) => {
    e.preventDefault();
    if (!listNameInput.trim()) {
      showToast('Vui lòng nhập tên bộ từ vựng', 'warning');
      return;
    }

    try {
      if (listModalMode === 'create') {
        const res = await axios.post(
          `${beUrl}/my-vocabularies`,
          { name: listNameInput },
          { withCredentials: true }
        );
        showToast('Tạo bộ từ vựng thành công!', 'success');
        setLists((prev) => [res.data.list, ...prev]);
      } else {
        const res = await axios.put(
          `${beUrl}/my-vocabularies/${currentListId}`,
          { name: listNameInput },
          { withCredentials: true }
        );
        showToast('Cập nhật tên thành công!', 'success');
        setLists((prev) =>
          prev.map((l) => (l.id === currentListId ? res.data.list : l))
        );
        if (selectedList && selectedList.id === currentListId) {
          setSelectedList(res.data.list);
        }
      }
      setShowListModal(false);
      setListNameInput('');
    } catch (err) {
      console.error('Error saving list:', err);
      showToast(err.response?.data?.message || 'Lỗi khi lưu bộ từ vựng', 'error');
    }
  };

  // Delete List
  const handleDeleteList = async (listId, listName) => {
    if (
      !window.confirm(`Bạn có chắc chắn muốn xóa bộ từ vựng "${listName}"? Tất cả từ vựng trong bộ này cũng sẽ bị xóa.`)
    ) {
      return;
    }

    try {
      await axios.delete(`${beUrl}/my-vocabularies/${listId}`, {
        withCredentials: true,
      });
      showToast('Xóa bộ từ vựng thành công!', 'success');
      setLists((prev) => prev.filter((l) => l.id !== listId));
      if (selectedList && selectedList.id === listId) {
        setSelectedList(null);
      }
    } catch (err) {
      console.error('Error deleting list:', err);
      showToast(err.response?.data?.message || 'Lỗi khi xóa bộ từ vựng', 'error');
    }
  };

  // Create or Update Vocab Item
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemVocab.trim() || !itemPinyin.trim() || !itemMeaning.trim()) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc (Từ vựng, Phiên âm, Ý nghĩa)', 'warning');
      return;
    }

    const payload = {
      vocab: itemVocab.trim(),
      pinyin: itemPinyin.trim(),
      meaning: itemMeaning.trim(),
      example: itemExample.trim() || null,
      exampleMeaning: itemExampleMeaning.trim() || null,
    };

    try {
      if (itemModalMode === 'create') {
        const res = await axios.post(
          `${beUrl}/my-vocabularies/${selectedList.id}/items`,
          payload,
          { withCredentials: true }
        );
        showToast('Thêm từ vựng thành công!', 'success');

        // Cập nhật state chi tiết bộ từ vựng
        setListDetails((prev) => {
          if (!prev) return null;
          const updatedItems = prev.vocabularies ? [...prev.vocabularies, res.data.item] : [res.data.item];
          return {
            ...prev,
            vocabularies: updatedItems,
          };
        });
      } else {
        const res = await axios.put(
          `${beUrl}/my-vocabularies/items/${currentItemId}`,
          payload,
          { withCredentials: true }
        );
        showToast('Cập nhật từ vựng thành công!', 'success');

        setListDetails((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            vocabularies: prev.vocabularies.map((item) =>
              item.id === currentItemId ? res.data.item : item
            ),
          };
        });
      }
      setShowItemModal(false);
      resetItemForm();
    } catch (err) {
      console.error('Error saving vocabulary item:', err);
      showToast(err.response?.data?.message || 'Lỗi khi lưu từ vựng', 'error');
    }
  };

  // Delete Vocab Item
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa từ vựng này khỏi bộ?')) {
      return;
    }

    try {
      await axios.delete(`${beUrl}/my-vocabularies/items/${itemId}`, {
        withCredentials: true,
      });
      showToast('Xóa từ vựng thành công!', 'success');
      setListDetails((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          vocabularies: prev.vocabularies.filter((item) => item.id !== itemId),
        };
      });
    } catch (err) {
      console.error('Error deleting vocabulary item:', err);
      showToast(err.response?.data?.message || 'Lỗi khi xóa từ vựng', 'error');
    }
  };

  // Helpers to open modals
  const openCreateListModal = () => {
    setListModalMode('create');
    setListNameInput('');
    setShowListModal(true);
  };

  const openEditListModal = (list, e) => {
    e.stopPropagation();
    setListModalMode('edit');
    setCurrentListId(list.id);
    setListNameInput(list.name);
    setShowListModal(true);
  };

  const openCreateItemModal = () => {
    setItemModalMode('create');
    resetItemForm();
    setShowItemModal(true);
  };

  const openEditItemModal = (item) => {
    setItemModalMode('edit');
    setCurrentItemId(item.id);
    setItemVocab(item.vocab);
    setItemPinyin(item.pinyin);
    setItemMeaning(item.meaning);
    setItemExample(item.example || '');
    setItemExampleMeaning(item.exampleMeaning || '');
    setShowItemModal(true);
  };

  const resetItemForm = () => {
    setCurrentItemId(null);
    setItemVocab('');
    setItemPinyin('');
    setItemMeaning('');
    setItemExample('');
    setItemExampleMeaning('');
  };

  // Formatter for date
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  // If loading authentication state
  if (authLoading) {
    return (
      <div className="my-vocab-page">
        <div className="neo-card loading-card">
          <span className="spinner">🔄</span> Đang xác thực thông tin...
        </div>
      </div>
    );
  }

  // If user is not logged in
  if (!user) {
    return (
      <div className="my-vocab-page">
        <div className="page-title-banner">
          <div>
            <h2>Bộ từ vựng cá nhân</h2>
            <p>Tự thiết lập và ôn luyện các chủ đề từ vựng của riêng bạn</p>
          </div>
        </div>

        <div className="neo-card login-required-card">
          <div className="login-icon-large">🔒</div>
          <h3>Yêu cầu đăng nhập</h3>
          <p>
            Bạn cần có tài khoản và đăng nhập để tạo, lưu trữ và đồng bộ hóa các bộ từ vựng cá nhân.
          </p>
          <div style={{ marginTop: '20px' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#666' }}>
              💡 Vui lòng nhấp vào nút <strong>🔑 Đăng nhập / Đăng ký</strong> ở cuối thanh Sidebar bên trái để bắt đầu.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-vocab-page">
      {/* HEADER BANNER */}
      <div className="page-title-banner">
        <div>
          <h2>Bộ từ vựng cá nhân</h2>
          <p>
            {selectedList
              ? `Đang quản lý bộ từ vựng "${selectedList.name}"`
              : 'Tự thiết lập và ôn luyện các chủ đề từ vựng của riêng bạn'}
          </p>
        </div>
        {!selectedList && (
          <button className="neo-btn neo-btn-primary" onClick={openCreateListModal}>
            ➕ Tạo bộ từ vựng mới
          </button>
        )}
      </div>

      {selectedList ? (
        isLearning ? (
          // LEARNING WORKSPACE VIEW FOR PERSONAL VOCABULARY
          (() => {
            const mappedVocab = (listDetails?.vocabularies || []).map((item) => ({
              id: item.id,
              word: item.vocab,
              pinyin: item.pinyin,
              trans: item.meaning,
              example: item.example,
              exampleMeaning: item.exampleMeaning,
              learned: item.learned || false,
              tag: 'Cá nhân'
            }));

            const handleToggleVocabLearned = (index) => {
              const targetWord = mappedVocab[index];
              if (!targetWord) return;
              setListDetails(prev => {
                if (!prev) return null;
                return {
                  ...prev,
                  vocabularies: prev.vocabularies.map(v =>
                    v.id === targetWord.id ? { ...v, learned: !v.learned } : v
                  )
                };
              });
            };

            const handlePlayAudioLocal = (wordOrObj) => {
              if (!wordOrObj) return;
              const text = typeof wordOrObj === 'string'
                ? wordOrObj
                : (wordOrObj.word || wordOrObj.vocab || wordOrObj.example);
              playAudio(text);
            };

            return (
              <div className="learning-view-container">
                <div className="back-btn-row">
                  <button className="neo-btn" onClick={() => setIsLearning(false)}>
                    ← Quay lại chi tiết bộ
                  </button>
                </div>

                <div className="page-title-banner" style={{ borderLeft: '10px solid var(--color-primary)' }}>
                  <div>
                    <h2>Học từ vựng: {selectedList.name}</h2>
                    <p>Bộ từ vựng cá nhân của bạn</p>
                  </div>
                  <div className="neo-badge" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
                    Đã học: {mappedVocab.filter(v => v.learned).length} / {mappedVocab.length} Từ
                  </div>
                </div>

                {/* Render study mode workspace */}
                {(() => {
                  if (mappedVocab.length === 0) {
                    return (
                      <div className="neo-card" style={{ padding: '30px', textAlign: 'center', fontWeight: 'bold', margin: '20px 0' }}>
                        Chưa có từ vựng nào để học
                      </div>
                    );
                  }

                  if (vocabMode === 'flashcard') {
                    return (
                      <FlashcardMode
                        currentLessonWords={mappedVocab}
                        vocabWords={mappedVocab}
                        toggleVocabLearned={handleToggleVocabLearned}
                        handlePlayAudio={handlePlayAudioLocal}
                        examplesList={[]}
                      />
                    );
                  }

                  if (vocabMode === 'quiz') {
                    return (
                      <QuizMode
                        currentLessonWords={mappedVocab}
                        vocabWords={mappedVocab}
                      />
                    );
                  }

                  if (vocabMode === 'typing') {
                    return (
                      <TypingMode
                        currentLessonWords={mappedVocab}
                      />
                    );
                  }

                  if (vocabMode === 'dictation') {
                    return (
                      <DictationMode
                        currentLessonWords={mappedVocab}
                        handlePlayAudio={handlePlayAudioLocal}
                      />
                    );
                  }

                  return null;
                })()}

                {/* Mode Selector Panel */}
                <div className="mode-selector-panel" style={{ marginTop: '30px' }}>
                  <div className="mode-selector-title">Chọn chế độ học</div>
                  <div className="modes-grid">
                    <div
                      className={`neo-card mode-card ${vocabMode === 'flashcard' ? 'active-flashcard' : ''}`}
                      onClick={() => setVocabMode('flashcard')}
                    >
                      <div className="mode-card-title">🗂️ Flashcard</div>
                      <div className="mode-card-status">
                        {mappedVocab.every(v => v.learned) ? 'Đã thuộc' : 'Đang học'}
                      </div>
                    </div>
                    <div
                      className={`neo-card mode-card ${vocabMode === 'quiz' ? 'active-quiz' : ''}`}
                      onClick={() => setVocabMode('quiz')}
                    >
                      <div className="mode-card-title">❓ Trắc nghiệm</div>
                      <div className="mode-card-status">Luyện tập</div>
                    </div>
                    <div
                      className={`neo-card mode-card ${vocabMode === 'typing' ? 'active-typing' : ''}`}
                      onClick={() => setVocabMode('typing')}
                    >
                      <div className="mode-card-title">⌨️ Gõ từ vựng</div>
                      <div className="mode-card-status">Luyện viết</div>
                    </div>
                    <div
                      className={`neo-card mode-card ${vocabMode === 'dictation' ? 'active-dictation' : ''}`}
                      onClick={() => setVocabMode('dictation')}
                    >
                      <div className="mode-card-title">🎧 Nghe chép</div>
                      <div className="mode-card-status">Nghe nói</div>
                    </div>
                    <div
                      className="neo-card mode-card"
                      style={{ borderColor: 'var(--color-accent)' }}
                      onClick={() => {
                        navigate('/vocab/writing-practice', {
                          state: {
                            initialVocabs: mappedVocab,
                            lessonTitle: `Luyện viết - ${selectedList.name}`
                          }
                        });
                      }}
                    >
                      <div className="mode-card-title">✍️ In tập viết</div>
                      <div className="mode-card-status">Ô chữ Mắt Cáo</div>
                    </div>
                  </div>
                </div>

                {/* Vocabulary list below */}
                <VocabList
                  currentLessonWords={mappedVocab}
                  vocabWords={mappedVocab}
                  toggleVocabLearned={handleToggleVocabLearned}
                  handlePlayAudio={handlePlayAudioLocal}
                />
              </div>
            );
          })()
        ) : (
          // DETAIL VIEW FOR SELECTED VOCABULARY LIST
          <div className="detail-view-container">
            <div className="back-btn-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="neo-btn" onClick={() => setSelectedList(null)}>
                  ← Quay lại danh sách bộ
                </button>
                {listDetails?.vocabularies?.length > 0 && (
                  <button
                    className="neo-btn"
                    style={{ backgroundColor: 'var(--color-yellow-light)', fontWeight: 'bold' }}
                    onClick={() => setIsLearning(true)}
                  >
                    🚀 Bắt đầu học
                  </button>
                )}
              </div>
              <button className="neo-btn neo-btn-primary" onClick={openCreateItemModal}>
                ➕ Thêm từ mới
              </button>
            </div>

            <div className="neo-card list-summary-card">
              <div className="summary-info">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px', color: 'var(--color-primary)' }}>
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    <line x1="9" y1="6" x2="15" y2="6" />
                    <line x1="9" y1="10" x2="15" y2="10" />
                    <line x1="9" y1="14" x2="15" y2="14" />
                  </svg>
                  Bộ: {selectedList.name}
                </h3>
                <p>
                  Tạo ngày {formatDate(selectedList.createdAt)} | Tổng số từ:{' '}
                  <strong>{listDetails?.vocabularies?.length || 0} từ</strong>
                </p>
              </div>
            </div>

            {itemsLoading ? (
              <div className="neo-card loading-card">
                <span className="spinner">🔄</span> Đang tải từ vựng trong bộ...
              </div>
            ) : !listDetails?.vocabularies || listDetails.vocabularies.length === 0 ? (
              <div className="neo-card empty-vocab-card">
                <div className="empty-icon">📭</div>
                <h3>Bộ từ vựng này chưa có từ nào</h3>
                <p>Hãy thêm từ vựng đầu tiên của bạn để bắt đầu ôn tập!</p>
                <button className="neo-btn neo-btn-primary" style={{ marginTop: '15px' }} onClick={openCreateItemModal}>
                  Thêm từ vựng ngay
                </button>
              </div>
            ) : (
              <div className="my-vocab-grid">
                {listDetails.vocabularies.map((item) => (
                  <div key={item.id} className="neo-card my-vocab-card">
                    <div className="vocab-card-header">
                      <div className="word-pinyin">
                        <span className="word-text">
                          {item.vocab}
                        </span>
                        <span className="word-pinyin-text">{item.pinyin}</span>
                      </div>
                      <div className="vocab-card-actions">
                        <button className="icon-btn edit" onClick={() => openEditItemModal(item)} title="Sửa từ vựng">
                          ✏️
                        </button>
                        <button className="icon-btn delete" onClick={() => handleDeleteItem(item.id)} title="Xóa từ vựng">
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="vocab-card-body">
                      <div className="word-meaning">
                        <strong>Nghĩa:</strong> {item.meaning}
                      </div>

                      {item.example && (
                        <div className="word-example-section">
                          <div className="example-title">Ví dụ:</div>
                          <div className="example-text">{item.example}</div>
                          {item.exampleMeaning && (
                            <div className="example-meaning-text">{item.exampleMeaning}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      ) : (
        // LIST VIEW (SHOW ALL LISTS)
        <div className="lists-view-container">
          {loading ? (
            <div className="neo-card loading-card">
              <span className="spinner">🔄</span> Đang tải danh sách bộ từ vựng...
            </div>
          ) : lists.length === 0 ? (
            <div className="neo-card empty-vocab-card">
              <div className="empty-icon">🗂️</div>
              <h3>Bạn chưa tạo bộ từ vựng nào</h3>
              <p>Tạo các bộ từ vựng cá nhân giúp bạn gom nhóm và ôn luyện từ vựng theo nhu cầu riêng.</p>
              <button className="neo-btn neo-btn-primary" style={{ marginTop: '15px' }} onClick={openCreateListModal}>
                Tạo bộ từ vựng đầu tiên
              </button>
            </div>
          ) : (
            <div className="lists-grid">
              {lists.map((list) => (
                <div key={list.id} className="neo-card list-select-card" onClick={() => setSelectedList(list)}>
                  <div className="list-card-main">
                    <div className="folder-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '36px', height: '36px', color: 'var(--color-primary)' }}>
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        <line x1="9" y1="6" x2="15" y2="6" />
                        <line x1="9" y1="10" x2="15" y2="10" />
                        <line x1="9" y1="14" x2="15" y2="14" />
                      </svg>
                    </div>
                    <div className="list-info">
                      <h4 className="list-name">{list.name}</h4>
                      <span className="list-date">Tạo ngày: {formatDate(list.createdAt)}</span>
                    </div>
                  </div>
                  <div className="list-card-footer" onClick={(e) => e.stopPropagation()}>
                    <button className="neo-btn small-btn" onClick={(e) => openEditListModal(list, e)}>
                      ✏️ Đổi tên
                    </button>
                    <button
                      className="neo-btn small-btn"
                      style={{ backgroundColor: 'var(--color-primary-light)', borderColor: 'var(--color-primary)' }}
                      onClick={() => handleDeleteList(list.id, list.name)}
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: CREATE / EDIT LIST */}
      {showListModal && (
        <div className="modal-overlay" onClick={() => setShowListModal(false)}>
          <div className="neo-card modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowListModal(false)}>
              ✕
            </button>
            <h3>{listModalMode === 'create' ? 'Tạo bộ từ vựng mới' : 'Đổi tên bộ từ vựng'}</h3>
            <form onSubmit={handleSaveList}>
              <div className="form-group">
                <label>Tên bộ từ vựng *</label>
                <input
                  type="text"
                  className="neo-input"
                  placeholder="Ví dụ: Từ vựng thi TOCFL, Từ vựng đời sống..."
                  value={listNameInput}
                  onChange={(e) => setListNameInput(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="button" className="neo-btn" onClick={() => setShowListModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="neo-btn neo-btn-primary">
                  Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT VOCABULARY ITEM */}
      {showItemModal && (
        <div className="modal-overlay" onClick={() => setShowItemModal(false)}>
          <div className="neo-card modal-card item-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowItemModal(false)}>
              ✕
            </button>
            <h3>{itemModalMode === 'create' ? '➕ Thêm từ vựng mới' : '✏️ Chỉnh sửa từ vựng'}</h3>
            <form onSubmit={handleSaveItem}>
              <div className="form-row">
                <div className="form-group">
                  <label>Từ vựng (Chữ Hán) *</label>
                  <input
                    type="text"
                    className="neo-input"
                    placeholder="Ví dụ: 飛機"
                    value={itemVocab}
                    onChange={(e) => setItemVocab(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phiên âm (Pinyin) *</label>
                  <input
                    type="text"
                    className="neo-input"
                    placeholder="Ví dụ: fēijī"
                    value={itemPinyin}
                    onChange={(e) => setItemPinyin(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Ý nghĩa (Tiếng Việt) *</label>
                <input
                  type="text"
                  className="neo-input"
                  placeholder="Ví dụ: Máy bay"
                  value={itemMeaning}
                  onChange={(e) => setItemMeaning(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Ví dụ (Câu chữ Hán - Không bắt buộc)</label>
                <input
                  type="text"
                  className="neo-input"
                  placeholder="Ví dụ: 我坐飛機去台灣。"
                  value={itemExample}
                  onChange={(e) => setItemExample(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Ý nghĩa ví dụ (Không bắt buộc)</label>
                <input
                  type="text"
                  className="neo-input"
                  placeholder="Ví dụ: Tôi đi máy bay đến Đài Loan."
                  value={itemExampleMeaning}
                  onChange={(e) => setItemExampleMeaning(e.target.value)}
                />
              </div>

              <div className="modal-buttons">
                <button type="button" className="neo-btn" onClick={() => setShowItemModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="neo-btn neo-btn-primary">
                  {itemModalMode === 'create' ? 'Thêm từ' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyVocabulary;
