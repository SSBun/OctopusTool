/**
 * Emoji 搜索 Hook
 */

import { useState, useMemo } from 'react';
import { pinyin } from 'pinyin-pro';
import type { EmojiData } from '../types';

interface UseEmojiSearchResult {
  query: string;
  setQuery: (query: string) => void;
  filteredEmojis: EmojiData[];
  isSearching: boolean;
}

/**
 * 检查是否匹配拼音
 */
function matchesPinyin(text: string, query: string): boolean {
  try {
    // 获取拼音（不带音调）
    const pinyinStr = pinyin(text, { toneType: 'none', type: 'array' }).join('');
    const lowerPinyin = pinyinStr.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    // 完整匹配
    if (lowerPinyin.includes(lowerQuery)) {
      return true;
    }
    
    // 首字母匹配
    const initials = pinyin(text, { pattern: 'first', type: 'array' }).join('').toLowerCase();
    if (initials.includes(lowerQuery)) {
      return true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * 增强版搜索（支持拼音）
 */
function enhancedSearch(emojis: EmojiData[], query: string): EmojiData[] {
  if (!query.trim()) return emojis;
  
  const lowerQuery = query.toLowerCase();
  
  return emojis.filter(emoji => {
    // 搜索 Emoji 本身
    if (emoji.emoji.includes(query)) {
      return true;
    }
    
    // 搜索中文名称（包括拼音）
    if (emoji.label) {
      if (emoji.label.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      if (matchesPinyin(emoji.label, lowerQuery)) {
        return true;
      }
    }
    
    // 搜索英文名称
    if (emoji.annotation && emoji.annotation.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // 搜索标签
    if (emoji.tags && emoji.tags.some(tag => {
      const lowerTag = tag.toLowerCase();
      return lowerTag.includes(lowerQuery) || matchesPinyin(tag, lowerQuery);
    })) {
      return true;
    }
    
    return false;
  });
}

export function useEmojiSearch(
  emojis: EmojiData[],
  selectedCategory: number | null = null
): UseEmojiSearchResult {
  const [query, setQuery] = useState('');

  // 先按分类过滤
  const categoryFiltered = useMemo(() => {
    if (selectedCategory === null) return emojis;
    return emojis.filter(emoji => emoji.group === selectedCategory);
  }, [emojis, selectedCategory]);

  // 再按搜索词过滤
  const filteredEmojis = useMemo(() => {
    if (!query.trim()) return categoryFiltered;
    return enhancedSearch(categoryFiltered, query);
  }, [categoryFiltered, query]);

  const isSearching = query.trim().length > 0;

  return {
    query,
    setQuery,
    filteredEmojis,
    isSearching,
  };
}

