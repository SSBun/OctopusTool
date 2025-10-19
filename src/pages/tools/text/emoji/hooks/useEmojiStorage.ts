/**
 * Emoji 本地存储 Hook
 */

import { useState, useEffect, useCallback } from 'react';
import type { EmojiStorage } from '../types';

const STORAGE_KEY = 'octopus_emoji_storage';
const MAX_RECENT = 50;

const DEFAULT_STORAGE: EmojiStorage = {
  recent: [],
  favorites: [],
  skinTonePreference: 0,
};

/**
 * 从 LocalStorage 读取数据
 */
function loadStorage(): EmojiStorage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_STORAGE, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load emoji storage:', error);
  }
  return DEFAULT_STORAGE;
}

/**
 * 保存数据到 LocalStorage
 */
function saveStorage(data: EmojiStorage): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save emoji storage:', error);
  }
}

export function useEmojiStorage() {
  const [storage, setStorage] = useState<EmojiStorage>(loadStorage);

  // 保存到 LocalStorage
  useEffect(() => {
    saveStorage(storage);
  }, [storage]);

  // 添加到最近使用
  const addToRecent = useCallback((emoji: string) => {
    setStorage(prev => {
      const filtered = prev.recent.filter(e => e !== emoji);
      const newRecent = [emoji, ...filtered].slice(0, MAX_RECENT);
      return { ...prev, recent: newRecent };
    });
  }, []);

  // 清空最近使用
  const clearRecent = useCallback(() => {
    setStorage(prev => ({ ...prev, recent: [] }));
  }, []);

  // 添加到收藏
  const addToFavorites = useCallback((emoji: string) => {
    setStorage(prev => {
      if (prev.favorites.includes(emoji)) {
        return prev;
      }
      return { ...prev, favorites: [...prev.favorites, emoji] };
    });
  }, []);

  // 从收藏移除
  const removeFromFavorites = useCallback((emoji: string) => {
    setStorage(prev => ({
      ...prev,
      favorites: prev.favorites.filter(e => e !== emoji),
    }));
  }, []);

  // 切换收藏状态
  const toggleFavorite = useCallback((emoji: string) => {
    setStorage(prev => {
      const isFavorite = prev.favorites.includes(emoji);
      return {
        ...prev,
        favorites: isFavorite
          ? prev.favorites.filter(e => e !== emoji)
          : [...prev.favorites, emoji],
      };
    });
  }, []);

  // 检查是否已收藏
  const isFavorite = useCallback((emoji: string): boolean => {
    return storage.favorites.includes(emoji);
  }, [storage.favorites]);

  // 清空收藏
  const clearFavorites = useCallback(() => {
    setStorage(prev => ({ ...prev, favorites: [] }));
  }, []);

  // 设置肤色偏好
  const setSkinTonePreference = useCallback((tone: number) => {
    setStorage(prev => ({ ...prev, skinTonePreference: tone }));
  }, []);

  return {
    recent: storage.recent,
    favorites: storage.favorites,
    skinTonePreference: storage.skinTonePreference,
    addToRecent,
    clearRecent,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    setSkinTonePreference,
  };
}

