/**
 * Emoji 搜索组件
 */

import React from 'react';
import { TextField, InputAdornment, Box, IconButton, Tooltip } from '@mui/material';
import { Search, Clear } from '@mui/icons-material';

interface EmojiSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const EmojiSearch: React.FC<EmojiSearchProps> = ({
  value,
  onChange,
  placeholder = '搜索 Emoji... (支持中文、英文、拼音)',
}) => {
  const handleClear = () => {
    onChange('');
  };

  return (
    <Box sx={{ mb: 3 }}>
      <TextField
        fullWidth
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        variant="outlined"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
          endAdornment: value && (
            <InputAdornment position="end">
              <Tooltip title="清空">
                <IconButton size="small" onClick={handleClear}>
                  <Clear />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          },
        }}
      />
      {value && (
        <Box sx={{ mt: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
          💡 提示：可以使用拼音首字母快速搜索，如 "xx" 可以搜到"笑笑"相关表情
        </Box>
      )}
    </Box>
  );
};

