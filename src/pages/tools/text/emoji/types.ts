/**
 * Emoji 数据类型定义
 */

export interface EmojiData {
  emoji: string;              // Emoji 字符
  label: string;              // 中文名称（如果有）
  annotation: string;         // 英文名称
  tags: string[];             // 标签关键词
  group: number;              // 分组编号
  order: number;              // 排序
  hexcode: string;            // 十六进制编码
  version: number;            // Unicode 版本
  skins?: EmojiData[];        // 肤色变体
  tone?: number;              // 肤色编号 (1-5)
}

export interface EmojiCategory {
  id: number;
  name: string;
  icon: string;
  emojis: EmojiData[];
}

export interface EmojiStorage {
  recent: string[];           // 最近使用的 Emoji（存储 emoji 字符）
  favorites: string[];        // 收藏的 Emoji
  skinTonePreference: number; // 肤色偏好 (0-5, 0 为默认)
}

export interface CopyFormat {
  type: 'emoji' | 'unicode' | 'html' | 'js' | 'css';
  label: string;
  example: string;
}

// Emoji 分组
export enum EmojiGroup {
  SMILEYS_EMOTION = 0,
  PEOPLE_BODY = 1,
  ANIMALS_NATURE = 2,
  FOOD_DRINK = 3,
  TRAVEL_PLACES = 4,
  ACTIVITIES = 5,
  OBJECTS = 6,
  SYMBOLS = 7,
  FLAGS = 8,
}

export const EMOJI_GROUP_NAMES: Record<number, string> = {
  [EmojiGroup.SMILEYS_EMOTION]: '表情与情感',
  [EmojiGroup.PEOPLE_BODY]: '人物与身体',
  [EmojiGroup.ANIMALS_NATURE]: '动物与自然',
  [EmojiGroup.FOOD_DRINK]: '食物与饮料',
  [EmojiGroup.TRAVEL_PLACES]: '旅行与地点',
  [EmojiGroup.ACTIVITIES]: '活动与运动',
  [EmojiGroup.OBJECTS]: '物品',
  [EmojiGroup.SYMBOLS]: '符号',
  [EmojiGroup.FLAGS]: '旗帜',
};

export const EMOJI_GROUP_ICONS: Record<number, string> = {
  [EmojiGroup.SMILEYS_EMOTION]: '😀',
  [EmojiGroup.PEOPLE_BODY]: '👤',
  [EmojiGroup.ANIMALS_NATURE]: '🐻',
  [EmojiGroup.FOOD_DRINK]: '🍔',
  [EmojiGroup.TRAVEL_PLACES]: '🌍',
  [EmojiGroup.ACTIVITIES]: '⚽',
  [EmojiGroup.OBJECTS]: '🎨',
  [EmojiGroup.SYMBOLS]: '🔣',
  [EmojiGroup.FLAGS]: '🎌',
};

// 肤色修饰符
export const SKIN_TONES = [
  { id: 0, name: '默认', emoji: '✋' },
  { id: 1, name: '浅肤色', emoji: '✋🏻' },
  { id: 2, name: '中浅肤色', emoji: '✋🏼' },
  { id: 3, name: '中等肤色', emoji: '✋🏽' },
  { id: 4, name: '中深肤色', emoji: '✋🏾' },
  { id: 5, name: '深肤色', emoji: '✋🏿' },
];

// 肤色修饰符 Unicode
export const SKIN_TONE_MODIFIERS = [
  '', // 默认（无修饰符）
  '\u{1F3FB}', // Light Skin Tone
  '\u{1F3FC}', // Medium-Light Skin Tone
  '\u{1F3FD}', // Medium Skin Tone
  '\u{1F3FE}', // Medium-Dark Skin Tone
  '\u{1F3FF}', // Dark Skin Tone
];

// 复制格式
export const COPY_FORMATS: CopyFormat[] = [
  {
    type: 'emoji',
    label: 'Emoji 字符',
    example: '😀',
  },
  {
    type: 'unicode',
    label: 'Unicode 编码',
    example: 'U+1F600',
  },
  {
    type: 'html',
    label: 'HTML 实体',
    example: '&#128512;',
  },
  {
    type: 'js',
    label: 'JavaScript',
    example: '\\uD83D\\uDE00',
  },
  {
    type: 'css',
    label: 'CSS',
    example: '\\1F600',
  },
];

