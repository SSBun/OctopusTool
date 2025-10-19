/**
 * Emoji 大全工具 - 主入口组件
 */

import React, { useState, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Snackbar,
  Paper,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { EmojiCategory } from './emoji/EmojiCategory';
import { EmojiSearch } from './emoji/EmojiSearch';
import { EmojiGrid } from './emoji/EmojiGrid';
import { EmojiDetail } from './emoji/EmojiDetail';
import { EmojiComposer } from './emoji/EmojiComposer';
import { useEmojiData } from './emoji/hooks/useEmojiData';
import { useEmojiSearch } from './emoji/hooks/useEmojiSearch';
import { useEmojiStorage } from './emoji/hooks/useEmojiStorage';
import { useClipboard } from './emoji/hooks/useClipboard';
import type { EmojiData } from './emoji/types';

type ViewMode = 'browse' | 'compose';

export const EmojiTool: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | 'all' | 'favorites' | 'recent'>('all');
  const [selectedEmoji, setSelectedEmoji] = useState<EmojiData | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [copyMessage, setCopyMessage] = useState('');

  // 数据和状态管理
  const { emojis, categories, loading, error } = useEmojiData();
  const storage = useEmojiStorage();
  const { copy } = useClipboard();

  // 根据分类过滤 Emoji
  const categoryFilteredEmojis = useMemo(() => {
    if (selectedCategory === 'all') {
      return emojis;
    }
    
    if (selectedCategory === 'favorites') {
      return emojis.filter(emoji => storage.isFavorite(emoji.emoji));
    }
    
    if (selectedCategory === 'recent') {
      // 按最近使用顺序排列
      const recentMap = new Map(emojis.map(e => [e.emoji, e]));
      return storage.recent
        .map(emoji => recentMap.get(emoji))
        .filter((e): e is EmojiData => e !== undefined);
    }
    
    return emojis.filter(emoji => emoji.group === selectedCategory);
  }, [emojis, selectedCategory, storage]);

  // 搜索功能
  const { query, setQuery, filteredEmojis, isSearching } = useEmojiSearch(
    categoryFilteredEmojis,
    null
  );

  // Emoji 单击处理 - 查看详情
  const handleEmojiClick = (emoji: EmojiData) => {
    setSelectedEmoji(emoji);
    setDetailOpen(true);
    storage.addToRecent(emoji.emoji);
  };

  // 复制功能
  const handleCopy = (text: string, label?: string) => {
    copy(text);
    setCopyMessage(label ? `已复制 ${label}` : '已复制');
  };

  // 关闭通知
  const handleCloseSnackbar = () => {
    setCopyMessage('');
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <ToolDetailHeader
          title="Emoji 大全"
          description="完整的 Emoji 数据库，支持搜索、分类、收藏和组合"
          toolPath="/tools/text/emoji"
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} />
            <Typography sx={{ mt: 2, color: 'text.secondary' }}>
              正在加载 Emoji 数据...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <ToolDetailHeader
          title="Emoji 大全"
          description="完整的 Emoji 数据库，支持搜索、分类、收藏和组合"
          toolPath="/tools/text/emoji"
        />
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <ToolDetailHeader
        title="Emoji 大全"
        description={`完整的 Emoji 数据库（${emojis.length}+ 个），支持搜索、分类、收藏和组合`}
        toolPath="/tools/text/emoji"
      />

      {/* 视图模式切换 */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={viewMode}
          onChange={(_, newValue) => setViewMode(newValue)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
            },
          }}
        >
          <Tab value="browse" label="浏览 Emoji" />
          <Tab value="compose" label="Emoji 组合器" />
        </Tabs>
      </Paper>

      {viewMode === 'browse' ? (
        <>
          {/* 搜索框 */}
          <EmojiSearch value={query} onChange={setQuery} />

          {/* 分类标签 */}
          <EmojiCategory
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            favoritesCount={storage.favorites.length}
            recentCount={storage.recent.length}
            isSearching={isSearching}
          />

          {/* Emoji 网格 */}
          <EmojiGrid
            emojis={filteredEmojis}
            onEmojiClick={handleEmojiClick}
            favorites={storage.favorites}
            onToggleFavorite={storage.toggleFavorite}
            showFavoriteButton
            emptyMessage={
              isSearching
                ? `没有找到匹配 "${query}" 的 Emoji`
                : selectedCategory === 'favorites'
                ? '还没有收藏任何 Emoji，点击 Emoji 上的星标收藏'
                : selectedCategory === 'recent'
                ? '还没有使用过任何 Emoji'
                : '暂无 Emoji'
            }
          />

          {/* 使用提示 */}
          {!isSearching && selectedCategory === 'all' && filteredEmojis.length > 0 && (
            <Alert severity="info" sx={{ mt: 3 }}>
              💡 提示：
              <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                <li>单击 Emoji 查看详细信息，在弹窗中可选择多种格式复制</li>
                <li>悬停在 Emoji 上可快速收藏（点击星标图标）</li>
                <li>支持中文、英文和拼音搜索</li>
              </ul>
            </Alert>
          )}
        </>
      ) : (
        /* Emoji 组合器 */
        <EmojiComposer onCopy={handleCopy} />
      )}

      {/* Emoji 详情弹窗 */}
      <EmojiDetail
        open={detailOpen}
        emoji={selectedEmoji}
        isFavorite={selectedEmoji ? storage.isFavorite(selectedEmoji.emoji) : false}
        onClose={() => setDetailOpen(false)}
        onCopy={handleCopy}
        onToggleFavorite={storage.toggleFavorite}
        onSkinToneChange={storage.setSkinTonePreference}
      />

      {/* 复制成功提示 */}
      <Snackbar
        open={!!copyMessage}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          icon={<CheckCircle />}
          sx={{ width: '100%' }}
        >
          {copyMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

