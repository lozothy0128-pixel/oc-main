import { Character, DEFAULT_CHARACTER } from '../types/character';

const DB_NAME = 'OC_DATABASE_V1';
const DB_VERSION = 1;
const STORE_NAME = 'characters';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
        store.createIndex('name', 'name', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllCharacters(): Promise<Character[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const chars = (request.result || []) as Character[];
      chars.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      resolve(chars);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getCharacterById(id: string): Promise<Character | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function saveCharacter(character: Character): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const itemToSave = {
      ...character,
      updatedAt: Date.now(),
      createdAt: character.createdAt || Date.now(),
    };
    const request = store.put(itemToSave);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteCharacter(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function exportAllData(): Promise<string> {
  const list = await getAllCharacters();
  const exportPayload = {
    appName: 'OC_INDEPENDENT_ARCHIVE',
    version: '1.0',
    exportDate: new Date().toISOString(),
    count: list.length,
    characters: list,
  };
  return JSON.stringify(exportPayload, null, 2);
}

export async function importData(jsonData: string, mode: 'merge' | 'replace' = 'merge'): Promise<number> {
  const parsed = JSON.parse(jsonData);
  const chars: Character[] = Array.isArray(parsed) ? parsed : (parsed.characters || []);

  if (!chars || !Array.isArray(chars)) {
    throw new Error('无效的备份数据格式');
  }

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    if (mode === 'replace') {
      store.clear();
    }

    let count = 0;
    for (const char of chars) {
      if (char.id && char.name) {
        store.put(char);
        count++;
      }
    }

    tx.oncomplete = () => resolve(count);
    tx.onerror = () => reject(tx.error);
  });
}

export const PRESET_CHARACTERS: Character[] = [
  {
    ...DEFAULT_CHARACTER,
    id: 'preset_oc_1',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 2,
    name: '艾尔诺斯·星芒 (Elnos Staris)',
    nickname: '月影隐修 / 白夜守望',
    gender: '男',
    age: '24岁 (表象) / 真实未知',
    birthday: '10月24日',
    birthDate: '霜降之月',
    race: '星灵月裔 (Astral Elf)',
    occupation: '深空星轨观测者 / 游荡魔导师',
    superpower: '重力曲翘、星光具象化、短距空间折跃',
    weaponStyle: '星轨提灯与符文轻剑，擅长中远距离空间控场与优雅刺杀',
    languages: '星灵古语、通用大陆语、高位天界符文',
    
    height: '183 cm',
    weight: '67 kg',
    bodyType: '修长匀称，略显清瘦但爆发力极强',
    hairColor: '银白泛淡紫荧光',
    hairLength: '及肩长发，微卷',
    hairStyle: '侧边微挽，脑后用银质发簪轻束',
    faceShape: '清冷英挺的鹅蛋脸，下颌线分明',
    eyeColor: '琉璃紫与金瞳异色',
    eyeShape: '微扬的凤眼，睫毛浓密纤长',
    earAccessories: '左耳垂悬坠一枚微缩星盘银晶耳坠',
    hairAccessories: '星芒透光银簪',
    attractiveness: '9.6 / 10 (容貌清绝如月，初见极具疏离感)',
    otherFeatures: '后颈有一枚伴生星座契约胎记，情绪剧烈起伏时会隐隐发光',

    representativeFlower: '幽夜昙华 (Night Lumina)',
    representativeColor: '#8b5cf6',
    representativeItem: '永曜星轨罗盘',
    catchphrase: '“繁星从不向黑夜低头，我也一样。”',

    tastePreference: '偏好清冽微甜的冰酿、薄荷茶与浆果冻',
    favoriteActivities: '在高处塔尖观星绘图、在古书馆研读禁咒残卷',
    dietaryHabits: '不耐油腻重辛辣，进食极少但需吸收星光能量',
    allergies: '对枯萎的曼陀罗花粉轻度过敏',
    hobbies: '星象星图测算、古代提琴独奏、搜集旧机械齿轮',
    likes: '清澈宁静的夜空、古旧羊皮纸的气味、雪后初晴',
    dislikes: '嘈杂虚伪的贵族宴会、无意义的教条束缚、潮湿闷热的雨林',

    stats: {
      stamina: 75,
      endurance: 78,
      vision: 96,
      patience: 90,
      hearing: 88,
      taste: 65,
      smell: 72,
      luck: 60,
      constitution: 82,
    },

    personality: '外冷内热，理性克制，面对认可的同伴极具护短倾向与责任感',
    mentalState: '表面平静无波，内底潜藏对母星覆灭的隐痛与警惕',
    trauma: '曾亲眼目睹月辉圣城在漆黑裂隙中坍缩，排斥绝对寂静与封闭空间',
    illnesses: '偶尔伴随星力透支引起的间歇性偏头痛',
    behaviorHabits: '沉思时会下意识转动左手食指的银戒，说话语调平缓低沉',
    fears: '同伴在自己眼前再度消逝、完全失去星光共鸣的失灵感',
    proficiencies: '星轨轨迹推衍、全域地图记忆、精湛的制图与轻剑术',
    aspirations: '寻找遗失的“原初星核”，重构消逝的母星星轨之门',

    birthplace: '第七悬空浮岛·月辉祭仪殿堂',
    residence: '流浪于苍穹之舟“极光号”',
    religion: '星辰守望古律（非神明崇拜，敬畏自然天体法则）',
    familyBackground: '星轨一脉末裔执礼者，曾世代守护维系天空屏障的星之钥',
    familyCustoms: '成年礼需独自在极寒雪峰观测流星雨并写下第一册誓言',
    familyHeirloom: '“逆流之刻”星轨金表',
    bio: '诞生于浮空大陆最后的荣耀时代。当深渊天蚀降临吞噬母城，他带着传承星盘乘舟流浪大陆。冷静优雅的学者面具下，是随时准备拔剑守护仅存世界的决绝战士。',
    worldview: '以魔晶与以太能驱动的高魔架空奇幻大陆《原初天穹》，天界、地表与深渊裂隙并存',
    timeline: '【星陨纪元 342年】天城崩塌；【347年】结识主角团游历诸国',
    timelineEvents: [
      { id: 't1', year: '星陨前50年', title: '星灵月裔传承', description: '诞生于浮空大陆月辉殿堂，受洗觉醒原初星轨共鸣' },
      { id: 't2', year: '星陨纪元 342年', title: '天城覆灭之灾', description: '深渊裂隙吞噬母城，佩戴星盘登上极光号流浪大陆' },
      { id: 't3', year: '星陨纪元 347年', title: '穿越时空裂隙', description: '在边境星港观测到异常量子波动，与跨界游侠建立深厚联结' },
      { id: 't4', year: '星历新纪 01年', title: '守望者誓约', description: '建立深空守望网络，矢志阻止深渊再次撕裂现实屏障' },
    ],
    relationships: [
      {
        id: 'r1',
        targetCharacterId: 'preset_oc_2',
        relationType: '时空盟友',
        description: '在异界裂隙偶遇的赛博游侠，虽性格大相径庭，但在对抗深渊侵蚀时达成了不可思议的默契协防',
      },
    ],

    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    standingIllustration: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    gallery: [
      {
        id: 'g1',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
        caption: '星轨观测站日常记录',
      },
    ],
    tags: ['主角', '奇幻魔法', '高岭之花', '学者', '深藏不露'],
  },
  {
    ...DEFAULT_CHARACTER,
    id: 'preset_oc_2',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 1,
    name: '弥娅·“霓虹鬼影” (Mia Vane)',
    nickname: '代码猎犬 / 零点幽灵',
    gender: '女',
    age: '19岁',
    birthday: '7月17日',
    birthDate: '新历2089年7月17日',
    race: '半义体改造人类 (Cyborg Human)',
    occupation: '黑客佣兵 / 自由信息经纪人',
    superpower: '神经接口直连军用网络、视网膜数据透视、微秒级超频反应',
    weaponStyle: '电磁腕刃与折叠近战冲锋枪，灵活敏捷、近身跑酷战术',
    languages: '赛博俚语、汇编加密语言、东亚多国街头方言',
    
    height: '166 cm',
    weight: '52 kg (含轻量化钛合金骨骼)',
    bodyType: '矫健轻盈，线条充满机械与流体力学张力',
    hairColor: '霓虹荧光粉黑挑染',
    hairLength: '短发不对称波波头',
    hairStyle: '左侧剃青刺入荧光电路纹，右侧微卷覆耳',
    faceShape: '灵动小巧的瓜子脸',
    eyeColor: '机械义眼（电子洋红色，常有微小终端字符滑动）',
    eyeShape: '杏眼，眼神狡黠且充满戒备',
    earAccessories: '工业级哑光黑合金数据耳钉（兼具短距通信中继功能）',
    hairAccessories: '荧光发带与全息发卡',
    attractiveness: '9.3 / 10 (甜酷赛博感十足，辨识度拉满)',
    otherFeatures: '右颈部至肩胛骨分布着防水发光神经接口插槽',

    representativeFlower: '机械电子曼陀罗',
    representativeColor: '#ec4899',
    representativeItem: '改制全息数据掌机',
    catchphrase: '“别把后背留给防火墙，更别留给我。”',

    tastePreference: '爆裂酸甜味的高能合成碳酸饮料、微辣街头烤串',
    favoriteActivities: '夜间摩天楼天台跑酷、逆向工程大财阀的防火墙系统',
    dietaryHabits: '偏爱便于携带的压缩能量凝胶与浓缩咖啡',
    allergies: '对劣质机油催化剂及某些化学清洗剂过敏',
    hobbies: '重金属摇滚合成器创作、搜集20世纪复古软盘与磁带',
    likes: '雨夜的霓虹反光街景、高带宽无限制网络、高纯度能源棒',
    dislikes: '财阀的安全监控机器人、条条框框的雇佣合约、断网掉线',

    stats: {
      stamina: 82,
      endurance: 76,
      vision: 98,
      patience: 55,
      hearing: 92,
      taste: 50,
      smell: 55,
      luck: 88,
      constitution: 85,
    },

    personality: '叛逆张扬、机敏警觉、快人快语，对认可的家人抱有狂热忠诚',
    mentalState: '高亢亢奋，咖啡因依赖，时刻处于战术警戒',
    trauma: '曾在下城区地下实验室充当财阀义体试药体，极度憎恶被束缚监禁',
    illnesses: '神经接口排异反应，需定期注射免疫抑制稳定剂',
    behaviorHabits: '紧张时会快速敲击机械手指模拟键盘敲代码',
    fears: '自己的中枢神经被远程劫持洗脑重置',
    proficiencies: '黑客渗透、城市地形速降跑酷、机械改装与即兴爆破',
    aspirations: '摧毁垄断下城区的“新泰坦生物重工”，带家人前往绿洲城市',

    birthplace: '夜幕城地下三层“锈蚀街区”',
    residence: '改装防爆厢式货车“流浪猫号”',
    religion: '无神论（信仰算力与手中武器）',
    familyBackground: '流浪孤儿互助联盟出身，与三名机械技师同伴共组小队',
    familyCustoms: '每次大任务凯旋后都要在废弃车厢内开廉价香槟聚餐',
    familyHeirloom: '生母遗留的生锈铜质八音盒机芯',
    bio: '夜幕城黑市声名鹊起的年轻独行黑客。身负军用级改造义体，以高超的侵入技术与敏捷身手穿梭于浮华天街与阴暗底巢之间。',
    worldview: '赛博朋克架空反乌托邦巨型都市《夜幕城》，财阀垄断政权与科技',
    timeline: '【新历2108】逃离下城实验室；【新历2109】成立“零点”佣兵团',
    timelineEvents: [
      { id: 'tm1', year: '新历2089年', title: '诞生于锈蚀街区', description: '出生于夜幕城地下三层，在拾荒与电磁噪音中长大' },
      { id: 'tm2', year: '新历2102年', title: '人体义体改造', description: '被财阀黑机构抓捕进行神经接口实验，险死还生' },
      { id: 'tm3', year: '新历2108年', title: '冲出地下研究所', description: '黑入中央服务器引发自毁程序，率领孤儿同伴逃出生天' },
      { id: 'tm4', year: '新历2109年', title: '成立“零点”佣兵团', description: '改装厢式货车游走于黑市，成为令各大财阀头痛的顶级网络猎犬' },
    ],
    relationships: [
      {
        id: 'r2',
        targetCharacterId: 'preset_oc_1',
        relationType: '异界搭档',
        description: '被她戏称为“古董星光神棍”的法师，曾帮她净化过致命的数据污染病毒，互相视作生死相托的挚友',
      },
    ],

    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    standingIllustration: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80',
    gallery: [],
    tags: ['主角', '赛博朋克', '傲娇', '元气', '佣兵'],
  },
];

export async function checkAndInitPresets(): Promise<void> {
  const current = await getAllCharacters();
  if (current.length === 0) {
    for (const preset of PRESET_CHARACTERS) {
      await saveCharacter(preset);
    }
  }
}
