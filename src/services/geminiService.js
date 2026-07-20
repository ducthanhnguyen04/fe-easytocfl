import axios from 'axios';

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

/**
 * Generates an AI roleplay response using Google Gemini API
 * @param {Object} params 
 * @param {string} params.topic - Conversation scenario/topic
 * @param {string} params.partnerRole - Role played by the AI
 * @param {string} params.level - Learner level (Sơ cấp A / Trung cấp B / Cao cấp C)
 * @param {Array} params.history - Array of previous chat messages [{ role: 'user'|'model', text: string }]
 * @returns {Promise<Object>} Structured JSON response with replyCn, replyPinyin, replyVn, correction, suggestedResponses, vocabList
 */
export const generateRoleplayReply = async ({ topic, partnerRole, level, history = [] }) => {
  // Ordered models list prioritizing active, high-quota endpoints for this key
  const modelsToTry = [
    'gemini-3.1-flash-lite',
    'gemini-3-flash-preview',
    'gemma-4-26b-a4b-it',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash'
  ];

  const systemInstruction = `Bạn là một gia sư tiếng Trung Phồn thể Đài Loan (繁體中文 - 台灣) kiêm diễn viên nhập vai.
Nhiệm vụ: Nhập vai làm "${partnerRole}" trong tình huống "${topic}".
Trình độ của học viên là "${level}". Hãy sử dụng từ vựng, ngữ pháp và độ dài phù hợp với trình độ này.

Yêu cầu BẮT BUỘC:
1. Trả về câu trả lời ở dạng duy nhất một chuỗi JSON hợp lệ (JSON format only, no markdown code block formatting or extra text outside JSON).
2. QUY TẮC NGÔN NGỮ QUAN TRỌNG:
   - Trường "correction" BẮT BUỘC PHẢI VIẾT BẰNG TIẾNG VIỆT 100%. Tuyệt đối KHÔNG ĐƯỢC dùng tiếng Trung để giải thích trong trường "correction".
   - Trường "replyVn" và "meaning" BẮT BUỘC viết bằng Tiếng Việt.
   - Trường "replyCn" và "suggestedResponses" BẮT BUỘC viết bằng tiếng Trung Phồn thể (台灣繁體中文).

3. JSON phải tuân theo chính xác cấu trúc sau:
{
  "replyCn": "Nội dung nói tiếng Trung Phồn thể Đài Loan",
  "replyPinyin": "Phiên âm Pinyin kèm dấu giọng (ví dụ: Nǐ hǎo! Xūyào bāngmáng ma?)",
  "replyVn": "Bản dịch tiếng Việt tự nhiên của câu trên",
  "correction": "Nếu câu nói gần nhất của học viên có lỗi sai hoặc chưa tự nhiên, hãy nhận xét và giải thích BẰNG TIẾNG VIỆT 100% (Ví dụ: Khi nói về kích thước quần, người Đài Loan thường dùng 'tôi mặc size 32' thay vì...). Nếu học viên nói đúng và tự nhiên hoặc đây là lượt đầu tiên, trả về null.",
  "suggestedResponses": [
    "Gợi ý câu trả lời mẫu 1 bằng tiếng Trung Phồn thể (chỉ viết chữ Hán, không kèm phiên âm trong ngoặc)",
    "Gợi ý câu trả lời mẫu 2 bằng tiếng Trung Phồn thể (chỉ viết chữ Hán, không kèm phiên âm trong ngoặc)",
    "Gợi ý câu trả lời mẫu 3 bằng tiếng Trung Phồn thể (chỉ viết chữ Hán, không kèm phiên âm trong ngoặc)"
  ],
  "vocabList": [
    {
      "vocab": "Từ vựng tiếng Trung Phồn thể",
      "pinyin": "pinyin",
      "meaning": "nghĩa tiếng Việt"
    }
  ]
}`;

  // Format conversation history for Gemini API
  const formattedContents = [
    {
      role: 'user',
      parts: [{ text: `Bắt đầu cuộc hội thoại nhập vai. Tình huống: "${topic}". Vai bạn nhập: "${partnerRole}". Trình độ của tôi: "${level}". Hãy chào mở màn!` }]
    }
  ];

  history.forEach(item => {
    formattedContents.push({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: item.text }]
    });
  });

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;

      const response = await axios.post(
        url,
        {
          contents: formattedContents,
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const candidates = response.data?.candidates;
      if (candidates && candidates.length > 0) {
        const textContent = candidates[0].content?.parts[0]?.text || '';
        const cleanJsonText = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanJsonText);

        // Clean up suggested responses to ensure pure Chinese text
        if (parsed.suggestedResponses && Array.isArray(parsed.suggestedResponses)) {
          parsed.suggestedResponses = parsed.suggestedResponses.map(s =>
            typeof s === 'string' ? s.replace(/\s*\(.*?\)/g, '').trim() : s
          );
        }

        return parsed;
      }
    } catch (err) {
      console.warn(`Gemini model ${modelName} returned error:`, err?.response?.data?.error?.message || err.message);
      lastError = err;
    }
  }

  // Extreme fallback if all network requests fail
  console.error("All Gemini API models failed:", lastError);
  return {
    replyCn: "你好！歡迎光臨，請問您今天想找些什麼呢？",
    replyPinyin: "Nǐ hǎo! Huānyíng guānglín, qǐngwèn nín jīntiān xiǎng zhǎo xiē shénme ne?",
    replyVn: "Xin chào! Chào mừng bạn, xin hỏi hôm nay bạn muốn tìm gì ạ?",
    correction: null,
    suggestedResponses: [
      "我想看這件衣服。",
      "請問這要多少錢？",
      "有別的顏色或尺寸嗎？"
    ],
    vocabList: [
      { vocab: "歡迎光臨", pinyin: "huānyíng guānglín", meaning: "chào mừng quý khách" },
      { vocab: "尺寸", pinyin: "chǐcùn", meaning: "kích cỡ" }
    ]
  };
};
