export const textbooks = [
  {
    id: 1,
    title: '當代中文課程 1',
    viTitle: 'Giáo trình Thời đại 1',
    level: 'Sơ cấp 1 • TOCFL Band A1',
    desc: 'Giáo trình bắt đầu cho người mới học. Tập trung vào 15 bài khóa đàm thoại căn bản, phát âm chú âm/pinyin và viết chữ Hán cơ bản.',
    lessons: '15 bài học',
    status: '15 đã mở',
    color: '#e55b44',
  },
  {
    id: 2,
    title: '當代中文課程 2',
    viTitle: 'Giáo trình Thời đại 2',
    level: 'Sơ cấp 2 • TOCFL Band A2',
    desc: 'Nâng cao khả năng giao tiếp. Gồm 15 bài học về cuộc sống sinh hoạt tại Đài Loan, đi lại, thời tiết, ăn uống và mua sắm.',
    lessons: '15 bài học',
    status: '15 đã mở',
    color: '#2a9d8f',
  },
  {
    id: 3,
    title: '當代中文課程 3',
    viTitle: 'Giáo trình Thời đại 3',
    level: 'Trung cấp 1 • TOCFL Band B1',
    desc: 'Bắt đầu giai đoạn trung cấp độc lập. Gồm 12 bài học về các chủ đề văn hóa, phong tục, xã hội Đài Loan và giao tiếp lập luận.',
    lessons: '12 bài học',
    status: '12 đã mở',
    color: '#f4a261',
  },
  {
    id: 4,
    title: '當代中文課程 4',
    viTitle: 'Giáo trình Thời đại 4',
    level: 'Trung cấp 2 • TOCFL Band B2',
    desc: 'Thảo luận sâu sắc về các chủ đề khoa học, công nghệ, giáo dục và việc làm tại Đài Loan. 14 bài học phức tạp.',
    lessons: '14 bài học',
    status: '14 đã mở',
    color: '#3d84b8',
  },
  {
    id: 5,
    title: '當代中文課程 5',
    viTitle: 'Giáo trình Thời đại 5',
    level: 'Cao cấp 1 • TOCFL Band C1',
    desc: 'Đọc hiểu và thảo luận học thuật chuyên nghiệp. Gồm 10 bài khóa dài về kinh tế, chính trị, triết học và văn học Đài Loan.',
    lessons: '10 bài học',
    status: '10 đã mở',
    color: '#9b5de5',
  },
  {
    id: 6,
    title: '當代中文課程 6',
    viTitle: 'Giáo trình Thời đại 6',
    level: 'Cao cấp 2 • TOCFL Band C2',
    desc: 'Hoàn thiện năng lực tiếng Trung tương đương người bản xứ. Gồm 10 bài học nghiên cứu xã hội chuyên sâu, báo chí thời sự phức tạp.',
    lessons: '10 bài học',
    status: '10 đã mở',
    color: '#f15bb5',
  }
];

export const bookLessons = {
  1: [
    { id: 1, title: '歡迎來到台灣', trans: 'Chào mừng đến với Đài Loan', vocabCount: 8, premium: false },
    { id: 2, title: '我的家人與朋友', trans: 'Gia định và bạn bè của tôi', vocabCount: 5, premium: true },
    { id: 3, title: '捷運與大眾交通', trans: 'Tàu điện ngầm MRT và giao thông', vocabCount: 6, premium: true },
    { id: 4, title: '夜市的美食文化', trans: 'Văn hóa ẩm thực chợ đêm', vocabCount: 7, premium: true },
    { id: 5, title: '謝謝你的熱情幫忙', trans: 'Cảm ơn sự giúp đỡ nhiệt tình của bạn', vocabCount: 5, premium: true },
    { id: 6, title: '在便利商店買東西', trans: 'Mua sắm đồ tại cửa hàng tiện lợi', vocabCount: 6, premium: true },
    { id: 7, title: '珍珠奶茶的發源地', trans: 'Nơi khởi nguồn của trà sữa trân châu', vocabCount: 8, premium: true },
    { id: 8, title: '悠遊卡與小額支付', trans: 'Thẻ EasyCard và thanh toán', vocabCount: 6, premium: true },
  ],
  2: [
    { id: 1, title: '台灣的天氣與氣候', trans: 'Thời tiết và khí hậu Đài Loan', vocabCount: 5, premium: false },
    { id: 2, title: '去傳統市場買菜', trans: 'Đi mua đồ ở chợ truyền thống', vocabCount: 6, premium: true },
    { id: 3, title: '滷肉飯與台灣小吃', trans: 'Cơm thịt kho và ăn vặt Đài Loan', vocabCount: 5, premium: true },
    { id: 4, title: '租房 với 找室友', trans: 'Thuê nhà và tìm bạn cùng phòng', vocabCount: 7, premium: true },
  ],
  3: [
    { id: 1, title: '繁體字與漢字書法', trans: 'Chữ Phồn thể và thư pháp chữ Hán', vocabCount: 5, premium: false },
    { id: 2, title: '台北一〇一與現代化', trans: 'Taipei 101 và sự hiện đại hóa', vocabCount: 6, premium: true },
    { id: 3, title: '阿里山與自然景觀', trans: 'Núi Alishan và phong cảnh tự nhiên', vocabCount: 5, premium: true },
  ],
  4: [
    { id: 1, title: '台灣的環境保護政策', trans: 'Chính sách bảo vệ môi trường của Đài Loan', vocabCount: 4, premium: false },
    { id: 2, title: '高科技產業與經濟', trans: 'Ngành công nghiệp công nghệ cao và kinh tế', vocabCount: 6, premium: true },
  ],
  5: [
    { id: 1, title: '民主制度與社會選舉', trans: 'Chế độ dân chủ và bầu cử xã hội', vocabCount: 4, premium: false },
    { id: 2, title: '傳統節日與民俗活動', trans: 'Lễ hội truyền thống và hoạt động dân gian', vocabCount: 6, premium: true },
  ],
  6: [
    { id: 1, title: '面對全球化的挑戰', trans: 'Đối mặt với thử thách của toàn cầu hóa', vocabCount: 4, premium: false },
    { id: 2, title: '科技發展對未來的影響', trans: 'Sự phát triển công nghệ ảnh hưởng tới tương lai', vocabCount: 6, premium: true },
  ]
};

export const grammarPoints = [
  {
    id: 1,
    bookId: 1,
    lessonId: 1,
    title: 'Cấu trúc phán đoán: 是 (shì)',
    pattern: 'A + 是 + B (A là B)',
    structure: '是',
    definition: 'Từ 「是」 dùng để biểu thị hai sự vật, hiện tượng là một, hoặc đối tượng A thuộc một phạm trù B nào đó. Nó tương đương với động từ "to be" (thì, là, ở) trong tiếng Anh.',
    scope: 'Đứng giữa câu, làm vị ngữ liên kết giữa chủ ngữ và tân ngữ danh từ. Dạng phủ định là 「不是」(bú shì). Nghi vấn dùng 「...嗎？」 hoặc câu hỏi chính phản 「是不是...？」.',
    note: 'Không dùng 「是」 trực tiếp trước tính từ để nối chủ vị (ví dụ: không nói 我是高, mà phải nói 我很高).',
    examples: [
      { id: 1, cn: '我是越南人。', vn: 'Tôi là người Việt Nam.' },
      { id: 2, cn: '他是我的老師。', vn: 'Thầy ấy là giáo viên của tôi.' },
      { id: 3, cn: '這是一本書。', vn: 'Đây là một quyển sách.' }
    ],
    exercises: [
      { id: 101, cn: '你是學生嗎？', vn: 'Bạn là học sinh phải không?' },
      { id: 102, cn: '台北是台灣の首都。', vn: 'Đài Bắc là thủ đô của Đài Loan.' }
    ]
  },
  {
    id: 2,
    bookId: 1,
    lessonId: 1,
    title: 'Trợ từ nghi vấn tỉnh lược: 呢 (ne)',
    pattern: 'Danh từ / Đại từ + 呢？ (Còn ... thì sao?)',
    structure: '呢',
    definition: 'Được đặt ở cuối câu tỉnh lược để hỏi về thông tin đã đề cập phía trước đối với một đối tượng mới.',
    scope: 'Dùng trong hội thoại hàng ngày để tránh lặp lại câu hỏi dài dòng. Cần có một ngữ cảnh rõ ràng trước đó.',
    note: 'Tránh nhầm lẫn với trợ từ 「呢」 dùng để nhấn mạnh trạng thái đang diễn diễn ra của hành động (như 正在...呢).',
    examples: [
      { id: 4, cn: '我是學生，你呢？', vn: 'Tôi là học sinh, còn bạn thì sao?' },
      { id: 5, cn: '這杯茶很好喝，那杯呢？', vn: 'Ly trà này ngon quá, còn ly kia thì sao?' }
    ],
    exercises: [
      { id: 103, cn: '我不去夜市，你呢？', vn: 'Tôi không đi chợ đêm, còn bạn?' },
      { id: 104, cn: '這本書很漂亮，那本呢？', vn: 'Quyển sách này rất đẹp, còn quyển kia thì sao?' }
    ]
  },
  {
    id: 3,
    bookId: 1,
    lessonId: 2,
    title: 'Động từ sở hữu / tồn tại: 有 (yǒu)',
    pattern: 'Chủ ngữ + 有 + Danh từ (Có ...)',
    structure: 'High',
    definition: 'Dùng để biểu thị sự sở hữu của chủ thể đối với vật thể, hoặc sự hiện hữu của đối tượng ở một địa điểm nào đó.',
    scope: 'Khẳng định dùng 「有」. Phủ định của 「有」 luôn luôn là 「沒有」 (méi yǒu), tuyệt đối không được dùng 「不有」.',
    note: 'Dưới dạng phủ định, danh từ phía sau có thể đi kèm lượng từ hoặc lược bỏ hoàn toàn.',
    examples: [
      { id: 6, cn: '我有兩個哥哥。', vn: 'Tôi có hai người anh trai.' },
      { id: 7, cn: '捷運站有很多人。', vn: 'Trạm tàu điện ngầm có rất nhiều người.' }
    ],
    exercises: [
      { id: 105, cn: '你家有貓嗎？', vn: 'Nhà bạn có mèo không?' },
      { id: 106, cn: '我沒有錢。', vn: 'Tôi không có tiền.' }
    ]
  },
  {
    id: 4,
    bookId: 1,
    lessonId: 3,
    title: 'Câu liên động mục đích: 去 (qù) + Địa điểm + Động từ',
    pattern: 'S + 去 + Place + V (Đi đâu làm gì)',
    structure: '去',
    definition: 'Diễn tả hành động di chuyển đến một địa điểm cụ thể nhằm thực hiện một hành vi hoặc mục đích nào đó.',
    scope: 'Trật tự từ bắt buộc: Địa điểm (Place) đứng trước động từ chỉ hành động chính (V). Phủ định đặt 「不去」 trước 「去」.',
    note: 'Không đặt động từ hành động trước địa điểm (ví dụ: không nói 我看書去圖書館).',
    examples: [
      { id: 8, cn: '我們去台北一〇一玩。', vn: 'Chúng ta đi Taipei 101 chơi.' },
      { id: 9, cn: '我去圖書館看書。', vn: 'Tôi đi thư viện đọc sách.' }
    ],
    exercises: [
      { id: 107, cn: '她去商店買水果。', vn: 'Cô ấy đi cửa hàng mua trái cây.' },
      { id: 108, cn: '我想去台灣學中文。', vn: 'Tôi muốn đi Đài Loan học tiếng Trung.' }
    ]
  },
  {
    id: 5,
    bookId: 2,
    lessonId: 1,
    title: 'Phó từ chỉ mức độ cảm thán: 太...了 (tài... le)',
    pattern: '太 + Tính từ + 了 (Quá ... rồi)',
    structure: '太...了',
    definition: 'Biểu thị mức độ cao vượt trội, mang tính chất cảm thán, dùng khen ngợi hoặc phàn nàn về một tính chất nào đó.',
    scope: 'Thường đứng trước tính từ, kết thúc câu bằng trợ từ 「了」. Khi phủ định mang nghĩa "không quá" dùng 「不太 + Adj」 (không đi với 了).',
    note: 'Đây là cấu trúc đi liền thành cặp, nhớ đừng quên chữ 「了」 ở cuối câu.',
    examples: [
      { id: 10, cn: '這間房子太貴了！', vn: 'Căn nhà này đắt quá rồi!' },
      { id: 11, cn: '珍珠奶茶太好喝了！', vn: 'Trà sữa trân châu ngon quá đi!' }
    ],
    exercises: [
      { id: 109, cn: '台灣小吃太美味了！', vn: 'Món ăn vặt Đài Loan ngon quá rồi!' },
      { id: 110, cn: '今天的天氣太熱了。', vn: 'Thời tiết hôm nay nóng quá rồi.' }
    ]
  },
  {
    id: 6,
    bookId: 3,
    lessonId: 1,
    title: 'Cấu trúc so sánh hơn: 比 (bǐ)',
    pattern: 'A + 比 + B + Tính từ (A hơn B)',
    structure: '比',
    definition: 'Dùng để so sánh tính chất giữa hai đối tượng A và B, biểu thị A có mức độ tính chất cao hơn B.',
    scope: 'Đối tượng A đứng trước, đối tượng B đứng sau 「比」, cuối cùng là tính từ so sánh. Phủ định dùng 「A 沒有 B + Adj」 (A không ... bằng B).',
    note: 'Không được thêm các phó từ chỉ mức độ tuyệt đối vào trước tính từ vị ngữ trong câu so sánh này.',
    examples: [
      { id: 12, cn: '台北的夏天比河內更熱一些。', vn: 'Mùa hè của Đài Bắc nóng hơn Hà Nội một chút.' },
      { id: 13, cn: '捷運比公車快。', vn: 'Tàu điện ngầm nhanh hơn xe buýt.' }
    ],
    exercises: [
      { id: 111, cn: '今天比昨天熱。', vn: 'Hôm nay nóng hơn hôm qua.' },
      { id: 112, cn: '繁體字比簡體字漂亮。', vn: 'Chữ Phồn thể đẹp hơn chữ Giản thể.' }
    ]
  }
];

export const initialVocabWords = [
  { word: '臺灣', pinyin: 'Táiwān', trans: 'Đài Loan', learned: false, tag: 'Bản xứ', bookId: 1, lessonId: 1 },
  { word: '學習', pinyin: 'xuéxí', trans: 'Học tập', learned: false, tag: 'Học thuật', bookId: 1, lessonId: 1 },
  { word: '謝謝', pinyin: 'xièxie', trans: 'Cảm ơn', learned: true, tag: 'Giao tiếp', bookId: 1, lessonId: 5 },
  { word: '你好', pinyin: 'nǐ hǎo', trans: 'Xin chào', learned: true, tag: 'Giao tiếp', bookId: 1, lessonId: 1 },
  { word: '捷運', pinyin: 'jiéyùn', trans: 'Tàu điện ngầm MRT (Đặc trưng Đài Loan)', learned: false, tag: 'Hàng ngày', bookId: 1, lessonId: 3 },
  { word: '學生', pinyin: 'xuéshēng', trans: 'Học sinh, sinh viên', learned: false, tag: 'Học đường', bookId: 1, lessonId: 1 },
  
  { word: '珍珠奶茶', pinyin: 'zhēnzhū nǎichá', trans: 'Trà sữa trân châu', learned: false, tag: 'Đồ ăn', bookId: 2, lessonId: 3 },
  { word: '夜市', pinyin: 'yèshì', trans: 'Chợ đêm', learned: false, tag: 'Văn hoá', bookId: 2, lessonId: 3 },
  { word: '悠遊卡', pinyin: 'yōuyóukǎ', trans: 'Thẻ EasyCard (Thẻ đi xe điện/mua sắm)', learned: false, tag: 'Đời sống', bookId: 2, lessonId: 3 },
  { word: '滷肉飯', pinyin: 'lǔròufàn', trans: 'Cơm thịt kho tàu Đài Loan', learned: false, tag: 'Ẩm thực', bookId: 2, lessonId: 3 },
  { word: '便利商店', pinyin: 'biànlì shāngdiàn', trans: 'Cửa hàng tiện lợi', learned: false, tag: 'Mua sắm', bookId: 2, lessonId: 2 },
  
  { word: '繁體字', pinyin: 'fántǐzì', trans: 'Chữ Phồn thể', learned: false, tag: 'Ngôn ngữ', bookId: 3, lessonId: 1 },
  { word: '台北一〇一', pinyin: 'Táiběi yī líng yī', trans: 'Tháp Taipei 101', learned: true, tag: 'Biểu tượng', bookId: 3, lessonId: 2 },
  { word: '熱情', pinyin: 'rèqíng', trans: 'Nhiệt tình, hiếu khách', learned: false, tag: 'Tính cách', bookId: 3, lessonId: 1 },
  { word: '九份', pinyin: 'Jiǔfèn', trans: 'Địa danh Cửu Phần', learned: false, tag: 'Du lịch', bookId: 3, lessonId: 3 },
  { word: '高鐵', pinyin: 'gāotiě', trans: 'Tàu hoả cao tốc THSR', learned: false, tag: 'Giao thông', bookId: 3, lessonId: 3 },

  { word: '習慣', pinyin: 'xíguàn', trans: 'Thói quen, thích nghi', learned: false, tag: 'Đời sống', bookId: 4, lessonId: 1 },
  { word: '環境', pinyin: 'huánjìng', trans: 'Môi trường', learned: false, tag: 'Khoa học', bookId: 4, lessonId: 1 },
  { word: '經濟', pinyin: 'jīngjì', trans: 'Kinh tế', learned: false, tag: 'Kinh tế', bookId: 4, lessonId: 2 },
  { word: '技術', pinyin: 'jìshù', trans: 'Kỹ thuật, công nghệ', learned: false, tag: 'Công nghệ', bookId: 4, lessonId: 2 },

  { word: '民主', pinyin: 'mínzhǔ', trans: 'Dân chủ', learned: false, tag: 'Chính trị', bookId: 5, lessonId: 1 },
  { word: '選舉', pinyin: 'xuǎnjǔ', trans: 'Bầu cử', learned: false, tag: 'Chính trị', bookId: 5, lessonId: 1 },
  { word: '投資', pinyin: 'tóuzī', trans: 'Đầu tư', learned: false, tag: 'Kinh doanh', bookId: 5, lessonId: 2 },
  { word: '傳統', pinyin: 'chuántǒng', trans: 'Truyền thống', learned: false, tag: 'Văn hoá', bookId: 5, lessonId: 2 },

  { word: '挑戰', pinyin: 'tiǎozhàn', trans: 'Thách thức, thử thách', learned: false, tag: 'Đời sống', bookId: 6, lessonId: 1 },
  { word: '發展', pinyin: 'fāzhǎn', trans: 'Phát triển', learned: false, tag: 'Xã hội', bookId: 6, lessonId: 2 },
  { word: '影響', pinyin: 'yǐngxiǎng', trans: 'Ảnh hưởng', learned: false, tag: 'Xã hội', bookId: 6, lessonId: 2 },
  { word: '貢獻', pinyin: 'gòngxiàn', trans: 'Cống hiến, đóng góp', learned: false, tag: 'Nghiên cứu', bookId: 6, lessonId: 2 }
];

export const quizzes = {
  bandA: {
    title: 'Đề luyện tập TOCFL Band A - Đề số 1',
    questions: [
      {
        id: 1,
        q: 'Chọn chữ viết đúng cho từ "Đài Loan" (Phồn thể):',
        options: ['A. 台灣', 'B. 臺灣', 'C. 台湾', 'D. 台湾'],
        correct: 1 // B. 臺灣
      },
      {
        id: 2,
        q: 'Từ "捷運" (jiéyùn) ở Đài Loan có nghĩa là gì?',
        options: ['A. Tàu hoả cao tốc', 'B. Xe buýt nhanh', 'C. Tàu điện ngầm (MRT)', 'D. Xe máy điện'],
        correct: 2 // C
      },
      {
        id: 3,
        q: 'Điền từ thích hợp: "我很喜歡喝台灣的___。"',
        options: ['A. 滷肉飯', 'B. 珍珠奶茶', 'C. 悠遊卡', 'D. 捷運'],
        correct: 1 // B
      }
    ]
  },
  bandB: {
    title: 'Đề thi thử TOCFL Band B - Đề đọc hiểu',
    questions: [
      {
        id: 1,
        q: 'Từ "繁體字" có nghĩa là gì?',
        options: ['A. Chữ Giản thể', 'B. Chữ Nôm', 'C. Chữ Phồn thể', 'D. Chữ Kanji'],
        correct: 2 // C
      },
      {
        id: 2,
        q: 'Ý nghĩa của câu "請用悠遊卡刷卡上下車" là gì?',
        options: ['A. Vui lòng xếp hàng lên xe', 'B. Vui lòng quẹt thẻ EasyCard khi lên xuống xe', 'C. Vui lòng chuẩn bị tiền lẻ', 'D. Hãy nhường ghế cho người già'],
        correct: 1 // B
      }
    ]
  }
};
