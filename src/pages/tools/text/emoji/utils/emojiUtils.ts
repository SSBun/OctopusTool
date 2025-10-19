/**
 * Emoji 工具函数
 */

import type { EmojiData, CopyFormat } from '../types';

/**
 * 将 Emoji 转换为 Unicode 编码
 */
export function emojiToUnicode(emoji: string): string {
  const codePoints = Array.from(emoji).map(char => {
    const codePoint = char.codePointAt(0);
    return codePoint ? `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}` : '';
  });
  return codePoints.join(' ');
}

/**
 * 将 Emoji 转换为 HTML 实体
 */
export function emojiToHtml(emoji: string): string {
  const codePoints = Array.from(emoji).map(char => {
    const codePoint = char.codePointAt(0);
    return codePoint ? `&#${codePoint};` : '';
  });
  return codePoints.join('');
}

/**
 * 将 Emoji 转换为 JavaScript 转义序列
 */
export function emojiToJs(emoji: string): string {
  const codeUnits: string[] = [];
  for (let i = 0; i < emoji.length; i++) {
    const code = emoji.charCodeAt(i);
    codeUnits.push(`\\u${code.toString(16).toUpperCase().padStart(4, '0')}`);
  }
  return codeUnits.join('');
}

/**
 * 将 Emoji 转换为 CSS 转义
 */
export function emojiToCss(emoji: string): string {
  const codePoints = Array.from(emoji).map(char => {
    const codePoint = char.codePointAt(0);
    return codePoint ? `\\${codePoint.toString(16).toUpperCase()}` : '';
  });
  return codePoints.join(' ');
}

/**
 * 根据格式类型转换 Emoji
 */
export function convertEmojiFormat(emoji: string, format: CopyFormat['type']): string {
  switch (format) {
    case 'emoji':
      return emoji;
    case 'unicode':
      return emojiToUnicode(emoji);
    case 'html':
      return emojiToHtml(emoji);
    case 'js':
      return emojiToJs(emoji);
    case 'css':
      return emojiToCss(emoji);
    default:
      return emoji;
  }
}

/**
 * 检查 Emoji 是否支持肤色修饰符
 */
export function hasSkinToneSupport(emoji: string): boolean {
  // 常见支持肤色的 Emoji 基础码点范围
  const codePoint = emoji.codePointAt(0);
  if (!codePoint) return false;
  
  // 检查是否已经包含肤色修饰符
  if (emoji.includes('\u{1F3FB}') || emoji.includes('\u{1F3FC}') || 
      emoji.includes('\u{1F3FD}') || emoji.includes('\u{1F3FE}') || 
      emoji.includes('\u{1F3FF}')) {
    return true;
  }
  
  // 人物相关的 Emoji 通常支持肤色
  // 这里简化处理，实际应该基于 emojibase 的数据
  return (codePoint >= 0x1F385 && codePoint <= 0x1F3C7) ||
         (codePoint >= 0x1F3CA && codePoint <= 0x1F3CC) ||
         (codePoint >= 0x1F442 && codePoint <= 0x1F4AA) ||
         (codePoint >= 0x1F466 && codePoint <= 0x1F478) ||
         (codePoint >= 0x1F47C && codePoint <= 0x1F481) ||
         (codePoint >= 0x1F483 && codePoint <= 0x1F487) ||
         (codePoint >= 0x1F48F && codePoint <= 0x1F491) ||
         (codePoint >= 0x1F4AA && codePoint <= 0x1F4AA) ||
         (codePoint >= 0x1F574 && codePoint <= 0x1F575) ||
         (codePoint >= 0x1F57A && codePoint <= 0x1F57A) ||
         (codePoint >= 0x1F590 && codePoint <= 0x1F590) ||
         (codePoint >= 0x1F595 && codePoint <= 0x1F596) ||
         (codePoint >= 0x1F645 && codePoint <= 0x1F647) ||
         (codePoint >= 0x1F64B && codePoint <= 0x1F64F) ||
         (codePoint >= 0x1F6A3 && codePoint <= 0x1F6A3) ||
         (codePoint >= 0x1F6B4 && codePoint <= 0x1F6B6) ||
         (codePoint >= 0x1F6C0 && codePoint <= 0x1F6C0) ||
         (codePoint >= 0x1F6CC && codePoint <= 0x1F6CC) ||
         (codePoint >= 0x1F90C && codePoint <= 0x1F93E) ||
         (codePoint >= 0x1F977 && codePoint <= 0x1F9B9) ||
         (codePoint >= 0x1F9BB && codePoint <= 0x1F9DF);
}

/**
 * 移除 Emoji 的肤色修饰符
 */
export function removeSkinTone(emoji: string): string {
  return emoji.replace(/[\u{1F3FB}-\u{1F3FF}]/gu, '');
}

/**
 * 为 Emoji 应用肤色修饰符
 */
export function applySkinTone(emoji: string, skinTone: number): string {
  if (skinTone === 0) return removeSkinTone(emoji);
  
  const baseEmoji = removeSkinTone(emoji);
  const skinToneModifiers = [
    '',
    '\u{1F3FB}',
    '\u{1F3FC}',
    '\u{1F3FD}',
    '\u{1F3FE}',
    '\u{1F3FF}',
  ];
  
  const modifier = skinToneModifiers[skinTone];
  if (!modifier) return baseEmoji;
  
  // 插入肤色修饰符（通常在第一个字符之后）
  const chars = Array.from(baseEmoji);
  if (chars.length > 0) {
    return chars[0] + modifier + chars.slice(1).join('');
  }
  
  return baseEmoji;
}

/**
 * 检查两个 Emoji 是否相同（忽略肤色）
 */
export function isSameEmoji(emoji1: string, emoji2: string): boolean {
  return removeSkinTone(emoji1) === removeSkinTone(emoji2);
}

/**
 * 组合多个 Emoji（使用零宽连接符）
 */
export function combineEmojis(emojis: string[]): string {
  const ZWJ = '\u200D'; // Zero Width Joiner
  return emojis.join(ZWJ);
}

/**
 * 拆分组合的 Emoji
 */
export function splitCombinedEmoji(emoji: string): string[] {
  const ZWJ = '\u200D';
  return emoji.split(ZWJ);
}

/**
 * 检查 Emoji 是否为组合 Emoji
 */
export function isCombinedEmoji(emoji: string): boolean {
  return emoji.includes('\u200D');
}

/**
 * 获取 Emoji 的显示名称
 */
export function getEmojiDisplayName(emoji: EmojiData): string {
  return emoji.label || emoji.annotation || emoji.emoji;
}

/**
 * 过滤和搜索 Emoji
 */
export function searchEmojis(
  emojis: EmojiData[],
  query: string
): EmojiData[] {
  if (!query.trim()) return emojis;
  
  const lowerQuery = query.toLowerCase();
  
  return emojis.filter(emoji => {
    // 搜索中文名称
    if (emoji.label && emoji.label.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // 搜索英文名称
    if (emoji.annotation && emoji.annotation.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // 搜索标签
    if (emoji.tags && emoji.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) {
      return true;
    }
    
    // 搜索 Emoji 本身
    if (emoji.emoji.includes(query)) {
      return true;
    }
    
    return false;
  });
}

/**
 * 按分组排序 Emoji
 */
export function sortEmojisByGroup(emojis: EmojiData[]): EmojiData[] {
  return [...emojis].sort((a, b) => {
    if (a.group !== b.group) {
      return a.group - b.group;
    }
    return a.order - b.order;
  });
}

/**
 * 生成肤色变体
 */
export function generateSkinToneVariants(baseEmoji: string): string[] {
  const variants = [baseEmoji]; // 默认（无肤色）
  
  if (hasSkinToneSupport(baseEmoji)) {
    for (let i = 1; i <= 5; i++) {
      variants.push(applySkinTone(baseEmoji, i));
    }
  }
  
  return variants;
}

