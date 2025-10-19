/**
 * Emoji 组合器组件
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Chip,
  Alert,
  Divider,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  Clear,
  ContentCopy,
  Delete,
  Refresh,
} from '@mui/icons-material';
import { combineEmojis } from './utils/emojiUtils';

interface EmojiComposerProps {
  onCopy: (text: string) => void;
}

interface Template {
  name: string;
  description: string;
  example: string;
  emojis: string[];
}

const PRESET_TEMPLATES: Template[] = [
  {
    name: '家庭',
    description: '创建家庭组合',
    example: '👨‍👩‍👧‍👦',
    emojis: ['👨', '👩', '👧', '👦'],
  },
  {
    name: '职业',
    description: '添加职业',
    example: '👨‍💻',
    emojis: ['👨', '💻'],
  },
  {
    name: '彩虹旗',
    description: '彩虹旗帜',
    example: '🏳️‍🌈',
    emojis: ['🏳️', '🌈'],
  },
  {
    name: '女性职业',
    description: '女性+职业',
    example: '👮‍♀️',
    emojis: ['👮', '♀️'],
  },
  {
    name: '男性职业',
    description: '男性+职业',
    example: '👷‍♂️',
    emojis: ['👷', '♂️'],
  },
];

export const EmojiComposer: React.FC<EmojiComposerProps> = ({ onCopy }) => {
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>([]);
  const [combinedEmoji, setCombinedEmoji] = useState<string>('');
  const [showPreview, setShowPreview] = useState(true);

  // 添加 Emoji 到选择列表
  const addEmoji = (emoji: string) => {
    setSelectedEmojis(prev => [...prev, emoji]);
  };

  // 移除指定位置的 Emoji
  const removeEmoji = (index: number) => {
    setSelectedEmojis(prev => prev.filter((_, i) => i !== index));
  };

  // 清空选择
  const clearSelection = () => {
    setSelectedEmojis([]);
    setCombinedEmoji('');
  };

  // 生成组合 Emoji
  const generateCombined = () => {
    if (selectedEmojis.length < 2) {
      return;
    }
    const combined = combineEmojis(selectedEmojis);
    setCombinedEmoji(combined);
    setShowPreview(true);
  };

  // 应用模板
  const applyTemplate = (template: Template) => {
    setSelectedEmojis(template.emojis);
    const combined = combineEmojis(template.emojis);
    setCombinedEmoji(combined);
    setShowPreview(true);
  };

  // 复制组合结果
  const handleCopy = () => {
    if (combinedEmoji) {
      onCopy(combinedEmoji);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Emoji 组合器
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          选择多个 Emoji 进行组合，创建独特的表情组合
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* 预设模板 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            快速模板
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {PRESET_TEMPLATES.map((template, index) => (
              <Tooltip key={index} title={template.description}>
                <Chip
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ fontSize: '1.2rem' }}>{template.example}</Box>
                      <span>{template.name}</span>
                    </Box>
                  }
                  onClick={() => applyTemplate(template)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 已选择的 Emoji */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2">
              已选择 ({selectedEmojis.length})
            </Typography>
            {selectedEmojis.length > 0 && (
              <Button
                size="small"
                startIcon={<Clear />}
                onClick={clearSelection}
              >
                清空
              </Button>
            )}
          </Box>
          
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              minHeight: 100,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexWrap: 'wrap',
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.02),
            }}
          >
            {selectedEmojis.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                点击下方的 Emoji 来添加到组合中...
              </Typography>
            ) : (
              <>
                {selectedEmojis.map((emoji, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Paper
                      sx={{
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        backgroundColor: 'background.paper',
                      }}
                    >
                      <Box sx={{ fontSize: '2rem' }}>{emoji}</Box>
                      <IconButton
                        size="small"
                        onClick={() => removeEmoji(index)}
                        sx={{ ml: 0.5 }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Paper>
                    {index < selectedEmojis.length - 1 && (
                      <Typography variant="body2" color="text.secondary">
                        +
                      </Typography>
                    )}
                  </Box>
                ))}
              </>
            )}
          </Paper>
        </Box>

        {/* 常用基础 Emoji */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            快速添加
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {['👨', '👩', '👧', '👦', '👶', '💻', '⚕️', '🎓', '💼', '🔧', '🎨', '✈️', '♂️', '♀️', '❤️', '🌈', '⭐'].map((emoji) => (
              <IconButton
                key={emoji}
                onClick={() => addEmoji(emoji)}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <Box sx={{ fontSize: '1.5rem' }}>{emoji}</Box>
              </IconButton>
            ))}
          </Box>
        </Box>

        {/* 生成按钮 */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={generateCombined}
            disabled={selectedEmojis.length < 2}
            fullWidth
          >
            生成组合
          </Button>
        </Box>

        {/* 提示信息 */}
        {selectedEmojis.length === 1 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            至少需要选择 2 个 Emoji 才能进行组合
          </Alert>
        )}
      </Paper>

      {/* 组合结果预览 */}
      {combinedEmoji && showPreview && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            组合结果
          </Typography>
          
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: 4,
              mb: 2,
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05),
              borderRadius: 2,
            }}
          >
            <Box sx={{ fontSize: '6rem' }}>{combinedEmoji}</Box>
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            ⚠️ 注意：某些 Emoji 组合可能在不同的设备或系统上显示效果不同。如果上方显示为多个分开的 Emoji，说明当前系统不支持此组合。
          </Alert>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<ContentCopy />}
              onClick={handleCopy}
              fullWidth
            >
              复制组合 Emoji
            </Button>
            <Button
              variant="outlined"
              onClick={() => setShowPreview(false)}
            >
              关闭
            </Button>
          </Box>
        </Paper>
      )}

      {/* 使用说明 */}
      <Paper sx={{ p: 2, mt: 3, backgroundColor: (theme) => alpha(theme.palette.info.main, 0.05) }}>
        <Typography variant="subtitle2" gutterBottom>
          💡 使用提示
        </Typography>
        <Typography variant="body2" color="text.secondary" component="div">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>使用零宽连接符（ZWJ）将多个 Emoji 组合成一个</li>
            <li>常见组合：人物 + 职业、人物 + 性别符号、旗帜 + 图案</li>
            <li>可以尝试快速模板来了解组合规律</li>
            <li>不是所有组合都被 Unicode 标准支持</li>
          </ul>
        </Typography>
      </Paper>
    </Box>
  );
};

