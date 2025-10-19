/**
 * Emoji 详情弹窗组件
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  alpha,
} from '@mui/material';
import { Close, ContentCopy, Star, StarBorder } from '@mui/icons-material';
import type { EmojiData } from './types';
import { EMOJI_GROUP_NAMES, COPY_FORMATS } from './types';
import { convertEmojiFormat, generateSkinToneVariants } from './utils/emojiUtils';

interface EmojiDetailProps {
  open: boolean;
  emoji: EmojiData | null;
  isFavorite: boolean;
  onClose: () => void;
  onCopy: (text: string, label: string) => void;
  onToggleFavorite: (emoji: string) => void;
  onSkinToneChange: (tone: number) => void;
}

export const EmojiDetail: React.FC<EmojiDetailProps> = ({
  open,
  emoji,
  isFavorite,
  onClose,
  onCopy,
  onToggleFavorite,
  onSkinToneChange,
}) => {
  const [currentEmoji, setCurrentEmoji] = useState<string>('');

  React.useEffect(() => {
    if (emoji) {
      setCurrentEmoji(emoji.emoji);
    }
  }, [emoji]);

  if (!emoji) return null;

  const groupName = EMOJI_GROUP_NAMES[emoji.group] || '未知';
  const variants = generateSkinToneVariants(emoji.emoji);

  const handleCopyFormat = (format: typeof COPY_FORMATS[number]) => {
    const converted = convertEmojiFormat(currentEmoji, format.type);
    onCopy(converted, format.label);
  };

  const handleSkinToneSelect = (tone: number, emojiWithTone: string) => {
    setCurrentEmoji(emojiWithTone);
    onSkinToneChange(tone);
    onCopy(emojiWithTone, 'Emoji 字符');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Emoji 详情</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => onToggleFavorite(currentEmoji)}
            sx={{
              color: isFavorite ? 'warning.main' : 'text.secondary',
            }}
          >
            {isFavorite ? <Star /> : <StarBorder />}
          </IconButton>
          <IconButton size="small" onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          // 自定义滚动条样式（主题适配）
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
        {/* Emoji 预览 */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 4,
            mb: 3,
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05),
            borderRadius: 2,
          }}
        >
          <Box sx={{ fontSize: '6rem' }}>{currentEmoji}</Box>
        </Box>

        {/* 基本信息 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {emoji.label || emoji.annotation}
          </Typography>
          {emoji.label && emoji.annotation && emoji.label !== emoji.annotation && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {emoji.annotation}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Chip label={groupName} size="small" />
            <Chip label={`Unicode ${emoji.version}`} size="small" variant="outlined" />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 肤色变体 */}
        {variants.length > 1 && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                肤色变体
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {variants.map((variant, index) => (
                  <IconButton
                    key={index}
                    onClick={() => handleSkinToneSelect(index, variant)}
                    sx={{
                      width: 56,
                      height: 56,
                      border: variant === currentEmoji ? 2 : 1,
                      borderColor: variant === currentEmoji ? 'primary.main' : 'divider',
                      backgroundColor: variant === currentEmoji
                        ? (theme) => alpha(theme.palette.primary.main, 0.1)
                        : 'transparent',
                    }}
                  >
                    <Box sx={{ fontSize: '2rem' }}>{variant}</Box>
                  </IconButton>
                ))}
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* 复制格式 */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            复制为不同格式
          </Typography>
          <Grid container spacing={1}>
            {COPY_FORMATS.map((format) => {
              const converted = convertEmojiFormat(currentEmoji, format.type);
              return (
                <Grid item xs={12} key={format.type}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05),
                        borderColor: 'primary.main',
                      },
                    }}
                    onClick={() => handleCopyFormat(format)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {format.label}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: 'monospace',
                            color: 'text.secondary',
                            wordBreak: 'break-all',
                          }}
                        >
                          {converted}
                        </Typography>
                      </Box>
                      <IconButton size="small">
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* 标签 */}
        {emoji.tags && emoji.tags.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                相关标签
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {emoji.tags.slice(0, 10).map((tag, index) => (
                  <Chip key={index} label={tag} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>关闭</Button>
        <Button
          variant="contained"
          startIcon={<ContentCopy />}
          onClick={() => onCopy(currentEmoji, 'Emoji 字符')}
        >
          复制 Emoji
        </Button>
      </DialogActions>
    </Dialog>
  );
};

