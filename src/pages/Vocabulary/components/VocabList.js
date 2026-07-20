import React, { useState, useMemo } from 'react';
import AudioButton from '../../../components/AudioButton';

const VocabList = ({
  currentLessonWords,
  vocabWords,
  toggleVocabLearned,
  handlePlayAudio,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVocab = useMemo(() => {
    return currentLessonWords.filter(v => {
      const matchesSearch = v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.pinyin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.trans.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [currentLessonWords, searchQuery]);

  return (
    <>
      {/* Search and filter */}
      <div className="vocab-search-bar">
        <input
          type="text"
          className="vocab-input"
          placeholder="Tìm kiếm từ vựng trong danh sách dưới đây..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="neo-btn neo-btn-primary" onClick={() => setSearchQuery('')}>Xoá lọc</button>
      </div>

      {/* Vocab list grid */}
      <div className="vocab-list">
        {filteredVocab.map((item, index) => {
          const globalIndex = vocabWords.findIndex(v => v.word === item.word);
          return (
            <div key={index} className="neo-card vocab-card">
              <div className="vocab-symbol">
                {item.word.substring(0, 1)}
              </div>
              <div className="vocab-info">
                <div className="vocab-headword">
                  <span className="vocab-word">{item.word}</span>
                  <span className="vocab-pinyin">({item.pinyin})</span>
                  <AudioButton onClick={() => handlePlayAudio(item)} showLabel={true} label="Nghe" />
                </div>
                <p className="vocab-translation">{item.trans}</p>
                {item.englishMeaning && (
                  <p className="vocab-translation-en">{item.englishMeaning}</p>
                )}
                <div style={{ marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="neo-badge" style={{ fontSize: '9px', padding: '2px 6px', backgroundColor: 'var(--color-blue-light)' }}>
                    {item.tag}
                  </span>
                  <button
                    className={`neo-btn ${item.learned ? 'neo-btn-primary' : ''}`}
                    style={{ padding: '4px 10px', fontSize: '10px', borderRadius: '6px', cursor: 'pointer' }}
                    onClick={() => toggleVocabLearned(globalIndex)}
                  >
                    {item.learned ? '✓ Đã thuộc' : 'Chưa thuộc'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filteredVocab.length === 0 && (
          <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px', fontWeight: 'bold' }}>
            Không tìm thấy từ vựng nào phù hợp trong danh sách này.
          </div>
        )}
      </div>
    </>
  );
};

export default VocabList;
