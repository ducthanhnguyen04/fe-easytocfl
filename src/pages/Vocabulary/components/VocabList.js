import React, { useState, useMemo } from 'react';
import AudioButton from '../../../components/AudioButton';

const VocabList = ({
  currentLessonWords,
  vocabWords,
  toggleVocabLearned,
  handlePlayAudio,
  examplesList = [],
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

                {/* Example sentence block */}
                <div className="vocab-example-block" style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #e2e8f0', fontSize: '13px' }}>
                  {(() => {
                    const activeExample = item.example
                      ? { example: item.example, pinyin: '', meaning: item.exampleMeaning }
                      : (examplesList || []).find(e => Number(e.vocabularyId) === Number(item.id));

                    if (activeExample) {
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ fontWeight: '800', color: 'var(--color-primary)' }}>Ví dụ:</div>
                          <div className="font-kaiti" style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--color-black)' }}>
                            {activeExample.example}
                          </div>
                          {activeExample.pinyin && (
                            <div style={{ fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
                              {activeExample.pinyin}
                            </div>
                          )}
                          <div style={{ fontSize: '12px', color: '#555', fontWeight: '500' }}>
                            {activeExample.meaning}
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div style={{ color: '#a0aec0', fontStyle: 'italic', fontSize: '12px' }}>
                          Chưa có ví dụ cho từ vựng này
                        </div>
                      );
                    }
                  })()}
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
