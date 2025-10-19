/**
 * Emoji 数据加载 Hook
 */

import { useState, useEffect, useMemo } from 'react';
import type { EmojiData } from '../types';
import { EMOJI_GROUP_NAMES, EMOJI_GROUP_ICONS } from '../types';

interface UseEmojiDataResult {
  emojis: EmojiData[];
  categories: { id: number; name: string; icon: string; count: number }[];
  loading: boolean;
  error: string | null;
}

/**
 * 转换 emojibase 数据到我们的格式
 */
function transformEmojiData(data: any[]): EmojiData[] {
  return data.map((item, index) => ({
    emoji: item.emoji || String.fromCodePoint(...(item.hexcode || '').split('-').map((h: string) => parseInt(h, 16))),
    label: item.label || '',
    annotation: item.annotation || '',
    tags: item.tags || [],
    group: item.group || 0,
    order: item.order || index,
    hexcode: item.hexcode || '',
    version: item.version || 1,
    skins: item.skins?.map((skin: any) => ({
      emoji: skin.emoji || String.fromCodePoint(...(skin.hexcode || '').split('-').map((h: string) => parseInt(h, 16))),
      label: skin.label || '',
      annotation: skin.annotation || '',
      tags: skin.tags || [],
      group: item.group || 0,
      order: item.order || index,
      hexcode: skin.hexcode || '',
      version: skin.version || 1,
      tone: skin.tone,
    })) || undefined,
  }));
}

export function useEmojiData(): UseEmojiDataResult {
  const [emojis, setEmojis] = useState<EmojiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadEmojis = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 开始加载 Emoji 数据...');

        // 方案1: 从 jsdelivr CDN 加载（更稳定）
        const CDN_URL = 'https://cdn.jsdelivr.net/npm/emojibase-data@latest/zh/data.json';
        
        const response = await fetch(CDN_URL);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('✅ Emoji 数据加载成功:', data.length, '个');

        if (mounted && Array.isArray(data)) {
          const transformed = transformEmojiData(data);
          console.log('✅ 数据转换完成:', transformed.length, '个');
          setEmojis(transformed);
        }
      } catch (err) {
        console.error('❌ 加载 Emoji 数据失败:', err);
        if (mounted) {
          setError('加载 Emoji 数据失败，请检查网络连接或刷新页面重试');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadEmojis();

    return () => {
      mounted = false;
    };
  }, []);

  // 计算分类统计
  const categories = useMemo(() => {
    const groups: Record<number, number> = {};
    
    emojis.forEach(emoji => {
      groups[emoji.group] = (groups[emoji.group] || 0) + 1;
    });

    return Object.entries(EMOJI_GROUP_NAMES).map(([id, name]) => ({
      id: Number(id),
      name,
      icon: EMOJI_GROUP_ICONS[Number(id)],
      count: groups[Number(id)] || 0,
    }));
  }, [emojis]);

  return {
    emojis,
    categories,
    loading,
    error,
  };
}
