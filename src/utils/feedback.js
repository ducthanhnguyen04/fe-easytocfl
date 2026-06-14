export const getAIEvaluationFeedback = (userInput, targetCn, targetVn, direction) => {
  if (!userInput || userInput.trim() === '') {
    return '❌ Vui lòng nhập bản dịch trước khi gửi AI đánh giá!';
  }
  
  const cleanInput = userInput.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?？。，！!]/g,"");
  const target = direction === 'zhToVi' ? targetVn : targetCn;
  const cleanTarget = target.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?？。，！!]/g,"");
  
  if (cleanInput === cleanTarget) {
    return `🎉 **Đánh giá của AI (10/10)**: Bản dịch hoàn hảo! Bạn đã nắm vững cấu trúc ngữ pháp và dịch chính xác 100%. Cách diễn đạt tự nhiên và chuẩn văn phong bản xứ.`;
  }
  
  // Word similarity check
  const inputWords = cleanInput.split(/\s+/).filter(Boolean);
  const targetWords = cleanTarget.split(/\s+/).filter(Boolean);
  
  let matchCount = 0;
  if (direction === 'zhToVi') {
    inputWords.forEach(w => {
      if (targetWords.includes(w)) matchCount++;
    });
  } else {
    const inputChars = cleanInput.replace(/\s+/g, '').split('');
    const targetChars = cleanTarget.replace(/\s+/g, '').split('');
    inputChars.forEach(c => {
      if (targetChars.includes(c)) matchCount++;
    });
    matchCount = (matchCount / Math.max(1, targetChars.length)) * targetWords.length;
  }
  
  const totalWords = targetWords.length;
  const ratio = matchCount / Math.max(1, totalWords);
  
  if (ratio >= 0.75) {
    return `👍 **Đánh giá của AI (9/10)**: Bản dịch rất xuất sắc! Bạn đã nắm bắt đúng cấu trúc lõi và dịch đúng hầu hết các từ quan trọng. Chỉ có một chút khác biệt nhỏ về cách diễn đạt (Đáp án mẫu: "${target}").`;
  } else if (ratio >= 0.5) {
    return `👌 **Đánh giá của AI (7/10)**: Khá tốt! Câu dịch đã truyền tải được ý nghĩa chính. Tuy nhiên, bạn nên chú ý tinh chỉnh thứ tự từ và cấu trúc ngữ pháp để câu chuẩn hơn (Đáp án mẫu: "${target}").`;
  } else if (ratio >= 0.25) {
    return `⚠️ **Đánh giá của AI (4/10)**: Bản dịch còn sơ sài và chưa chính xác về mặt ngữ pháp. Hãy xem kỹ phần 'Cấu trúc' và 'Phạm vi sử dụng' để sắp xếp từ đúng vị trí hơn (Đáp án mẫu: "${target}").`;
  } else {
    return `❌ **Đánh giá của AI (2/10)**: Bản dịch chưa đạt yêu cầu. Có thể bạn đã dịch sai nghĩa của các từ cốt lõi hoặc sai trật tự ngữ pháp nghiêm trọng. Đừng nản chí, hãy xem lại phần lý thuyết và thử lại nhé! (Đáp án mẫu: "${target}").`;
  }
};
