export interface CharacterStats {
  stamina: number;      // 体力 (0-100)
  endurance: number;    // 耐力 (0-100)
  vision: number;       // 视力 (0-100)
  patience: number;     // 耐心 (0-100)
  hearing: number;      // 听觉 (0-100)
  taste: number;        // 味觉 (0-100)
  smell: number;        // 嗅觉 (0-100)
  luck: number;         // 运气 (0-100)
  constitution: number; // 体质 (0-100)
}

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
}

export interface TimelineEvent {
  id: string;
  year: string;        // 年代 / 时间节点 (如：星历302年, 2024, 纪元前100年)
  title: string;       // 事件标题
  description: string; // 事件简述
}

export interface CharacterRelationship {
  id: string;
  targetCharacterId: string; // 关联的 OC ID
  relationType: string;      // 关系类型 (挚友、宿敌、搭档、恋人、师徒、亲属等)
  description: string;       // 关系说明与纠葛
}

export interface Character {
  id: string;
  createdAt: number;
  updatedAt: number;

  // 1. 基础信息
  name: string;                // 名字
  nickname: string;            // 别称
  gender: string;              // 性别
  age: string;                 // 年龄
  birthday: string;            // 生日
  birthDate: string;           // 出生日期
  race: string;                // 种族
  occupation: string;          // 职位 / 身份
  superpower: string;          // 异能 / 特殊能力
  weaponStyle: string;         // 武器风格
  languages: string;           // 语种

  // 2. 外貌体征
  height: string;              // 身高
  weight: string;              // 体重
  bodyType: string;            // 体型
  hairColor: string;           // 发色
  hairLength: string;          // 发长
  hairStyle: string;           // 发型
  faceShape: string;           // 脸型
  eyeColor: string;            // 瞳色
  eyeShape: string;            // 眼睛形状
  earAccessories: string;      // 耳饰
  hairAccessories: string;     // 发饰
  attractiveness: string;      // 颜值
  otherFeatures: string;       // 其他特点 (伤疤、印记、纹身等)

  // 3. 象征与标志
  representativeFlower: string;// 代表花
  representativeColor: string; // 代表色 (Hex 格式)
  representativeItem: string;  // 代表物
  catchphrase: string;         // 口头禅

  // 4. 喜好与生活
  tastePreference: string;     // 口味偏好
  favoriteActivities: string;  // 喜欢的活动
  dietaryHabits: string;       // 特殊饮食习惯
  allergies: string;           // 过敏
  hobbies: string;             // 兴趣爱好
  likes: string;               // 喜欢
  dislikes: string;            // 讨厌

  // 5. 数值雷达与属性 (体力、耐力、视力、耐心、听觉、味觉、嗅觉、运气、体质)
  stats: CharacterStats;

  // 6. 心理与健康
  personality: string;         // 性格
  mentalState: string;         // 精神状态
  trauma: string;              // 心理阴影
  illnesses: string;           // 疾病
  behaviorHabits: string;      // 行为习惯
  fears: string;               // 恐惧
  proficiencies: string;       // 擅长
  aspirations: string;         // 追求

  // 7. 历史背景与世界
  birthplace: string;          // 出生地
  residence: string;           // 现居地
  religion: string;            // 宗教信仰
  familyBackground: string;    // 家庭背景
  familyCustoms: string;       // 家族习俗
  familyHeirloom: string;      // 家族传家宝
  bio: string;                 // 简介
  worldview: string;           // 世界观
  timeline: string;            // 世界线文本
  timelineEvents: TimelineEvent[]; // 可视化时间轴条目 (按年代排序)
  relationships: CharacterRelationship[]; // 关联的OC关系列表

  // 8. 视觉资源与标签
  avatar: string;              // 头像 (Base64 / URL)
  standingIllustration: string;// 立绘 / 全身图
  gallery: GalleryItem[];      // 相册插画
  tags: string[];              // 文本标签分类 (如：主角、反派、现代AU、魔导士等)
}

export const DEFAULT_CHARACTER: Omit<Character, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  nickname: '',
  gender: '',
  age: '',
  birthday: '',
  birthDate: '',
  race: '',
  occupation: '',
  superpower: '',
  weaponStyle: '',
  languages: '',

  height: '',
  weight: '',
  bodyType: '',
  hairColor: '',
  hairLength: '',
  hairStyle: '',
  faceShape: '',
  eyeColor: '',
  eyeShape: '',
  earAccessories: '',
  hairAccessories: '',
  attractiveness: '',
  otherFeatures: '',

  representativeFlower: '',
  representativeColor: '',
  representativeItem: '',
  catchphrase: '',

  tastePreference: '',
  favoriteActivities: '',
  dietaryHabits: '',
  allergies: '',
  hobbies: '',
  likes: '',
  dislikes: '',

  stats: {
    stamina: 70,
    endurance: 65,
    vision: 80,
    patience: 75,
    hearing: 85,
    taste: 60,
    smell: 65,
    luck: 50,
    constitution: 75,
  },

  personality: '',
  mentalState: '',
  trauma: '',
  illnesses: '',
  behaviorHabits: '',
  fears: '',
  proficiencies: '',
  aspirations: '',

  birthplace: '',
  residence: '',
  religion: '',
  familyBackground: '',
  familyCustoms: '',
  familyHeirloom: '',
  bio: '',
  worldview: '',
  timeline: '',
  timelineEvents: [],
  relationships: [],

  avatar: '',
  standingIllustration: '',
  gallery: [],
  tags: [],
};

export const COMMON_TAG_SUGGESTIONS = [
  '主角', '配角', '反派', '白月光', '中立势力', 
  '奇幻魔法', '赛博朋克', '星际科幻', '架空古风', '现代都市',
  '病娇', '高岭之花', '傲娇', '元气', '腹黑', '忠犬', '深藏不露',
  '双重人格', '神明转世', '佣兵', '学者', '皇室贵族', '人造人'
];
