/**
 * Emoji 网格展示组件（使用 @tanstack/react-virtual 虚拟滚动）
 */

import React, { useState, useCallback, useRef } from 'react';
import { Box, Tooltip, IconButton, alpha } from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { EmojiData } from './types';

interface EmojiGridProps {
  emojis: EmojiData[];
  onEmojiClick: (emoji: EmojiData) => void;
  favorites: string[];
  onToggleFavorite: (emoji: string) => void;
  showFavoriteButton?: boolean;
  emptyMessage?: string;
}

const EMOJI_SIZE = 56;
const EMOJI_GAP = 8;
const CELL_SIZE = EMOJI_SIZE + EMOJI_GAP;
const CONTAINER_PADDING = 16; // 左右padding各8px

export const EmojiGrid: React.FC<EmojiGridProps> = ({
  emojis,
  onEmojiClick,
  favorites,
  onToggleFavorite,
  showFavoriteButton = true,
  emptyMessage = '没有找到 Emoji',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  // 计算每行可以显示多少个 Emoji
  const [columnCount, setColumnCount] = useState(10);

  // 监听容器宽度变化
  React.useEffect(() => {
    const updateColumnCount = () => {
      if (parentRef.current) {
        const width = parentRef.current.offsetWidth - CONTAINER_PADDING;
        const cols = Math.max(1, Math.floor(width / CELL_SIZE));
        setColumnCount(cols);
      }
    };

    // 延迟执行以确保容器已渲染
    const timer = setTimeout(updateColumnCount, 0);
    window.addEventListener('resize', updateColumnCount);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateColumnCount);
    };
  }, []);

  // 计算行数
  const rowCount = Math.ceil(emojis.length / columnCount);

  // 创建虚拟滚动器
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => CELL_SIZE,
    overscan: 5, // 预渲染5行
  });

  // 单击查看详情
  const handleEmojiClick = useCallback((emoji: EmojiData) => {
    onEmojiClick(emoji);
  }, [onEmojiClick]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent, emoji: string) => {
    e.stopPropagation();
    onToggleFavorite(emoji);
  }, [onToggleFavorite]);

  if (emojis.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
          color: 'text.secondary',
          fontSize: '1.2rem',
        }}
      >
        {emptyMessage}
      </Box>
    );
  }

  return (
    <Box
      ref={parentRef}
      sx={{
        height: 'calc(100vh - 400px)',
        minHeight: 400,
        maxHeight: 600,
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        py: 2, // 添加上下 padding，防止第一行和最后一行被裁切
        // 自定义滚动条样式
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: (theme) => theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.05)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: (theme) => theme.palette.primary.main,
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: (theme) => theme.palette.primary.dark,
          },
        },
      }}
    >
      <Box
        sx={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
          px: 1, // 添加左右 padding
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columnCount;
          const rowEmojis = emojis.slice(startIndex, startIndex + columnCount);

          return (
            <Box
              key={virtualRow.key}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: 'flex',
                flexWrap: 'nowrap',
                gap: `${EMOJI_GAP}px`,
              }}
            >
              {rowEmojis.map((emoji, colIndex) => {
                const globalIndex = startIndex + colIndex;
                const isFavorite = favorites.includes(emoji.emoji);
                const isHovered = hoveredIndex === globalIndex;
                const displayName = emoji.label || emoji.annotation;

                return (
                  <Box
                    key={`${emoji.hexcode}-${globalIndex}`}
                    onMouseEnter={() => setHoveredIndex(globalIndex)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    sx={{ flexShrink: 0 }}
                  >
                    <Tooltip title={displayName} arrow>
                      <Box
                        sx={{
                          position: 'relative',
                          width: EMOJI_SIZE,
                          height: EMOJI_SIZE,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          cursor: 'pointer',
                          borderRadius: 1,
                          transition: 'all 0.2s',
                          backgroundColor: isHovered
                            ? (theme) => alpha(theme.palette.primary.main, 0.1)
                            : 'transparent',
                          '&:hover': {
                            transform: 'scale(1.2)',
                            zIndex: 10,
                            boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                          },
                        }}
                        onClick={() => handleEmojiClick(emoji)}
                      >
                        <Box sx={{ fontSize: '2rem', userSelect: 'none' }}>
                          {emoji.emoji}
                        </Box>
                        
                        {showFavoriteButton && isHovered && (
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: -4,
                              right: -4,
                              backgroundColor: 'background.paper',
                              boxShadow: 1,
                              padding: '2px',
                              '&:hover': {
                                backgroundColor: 'primary.main',
                                color: 'primary.contrastText',
                              },
                            }}
                            onClick={(e) => handleFavoriteClick(e, emoji.emoji)}
                          >
                            {isFavorite ? (
                              <Star sx={{ fontSize: '0.9rem', color: 'warning.main' }} />
                            ) : (
                              <StarBorder sx={{ fontSize: '0.9rem' }} />
                            )}
                          </IconButton>
                        )}
                      </Box>
                    </Tooltip>
                  </Box>
                );
              })}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
