/**
 * 通用颜色选择器组件
 * 支持可视化颜色选择和手动输入色值
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Popover,
  IconButton,
  InputAdornment,
  Typography,
  Stack,
} from '@mui/material';
import { ColorLens, Close } from '@mui/icons-material';
import { HexColorPicker } from 'react-colorful';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  helperText?: string;
  fullWidth?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  helperText,
  fullWidth = true,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [inputValue, setInputValue] = useState(value);

  // 同步外部 value 到 inputValue
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleOpenPicker = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePicker = () => {
    setAnchorEl(null);
  };

  const handleColorChange = (color: string) => {
    setInputValue(color);
    onChange(color);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    
    // 验证是否为有效的十六进制颜色
    if (/^#[0-9A-F]{6}$/i.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleInputBlur = () => {
    // 如果输入无效，恢复到有效值
    if (!/^#[0-9A-F]{6}$/i.test(inputValue)) {
      setInputValue(value);
    }
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <TextField
        fullWidth={fullWidth}
        label={label}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        placeholder="#000000"
        helperText={helperText}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconButton
                onClick={handleOpenPicker}
                edge="start"
                sx={{
                  p: 0,
                  width: 36,
                  height: 36,
                  border: '2px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  backgroundColor: value,
                  '&:hover': {
                    backgroundColor: value,
                    opacity: 0.8,
                  },
                }}
                aria-label="选择颜色"
              >
                <Box sx={{ display: 'none' }}>
                  <ColorLens />
                </Box>
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            fontFamily: 'monospace',
          },
        }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePicker}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: { p: 2, mt: 1 },
          },
        }}
      >
        <Stack spacing={2}>
          {/* 标题栏 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight={600}>
              选择颜色
            </Typography>
            <IconButton size="small" onClick={handleClosePicker}>
              <Close fontSize="small" />
            </IconButton>
          </Box>

          {/* 颜色选择器 */}
          <Box>
            <HexColorPicker
              color={value}
              onChange={handleColorChange}
              style={{ width: '240px', height: '200px' }}
            />
          </Box>

          {/* 当前颜色显示 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1.5,
              backgroundColor: 'background.default',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                backgroundColor: value,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                flexShrink: 0,
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                当前颜色
              </Typography>
              <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                {value.toUpperCase()}
              </Typography>
            </Box>
          </Box>

          {/* 快捷颜色 */}
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              常用颜色
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
              {[
                '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
                '#ffff00', '#ff00ff', '#00ffff', '#808080', '#c0c0c0',
                '#800000', '#008000', '#000080', '#808000', '#800080',
                '#008080', '#ff8000', '#0080ff', '#ff0080', '#80ff00',
              ].map((presetColor) => (
                <Box
                  key={presetColor}
                  onClick={() => handleColorChange(presetColor)}
                  sx={{
                    width: 28,
                    height: 28,
                    backgroundColor: presetColor,
                    borderRadius: 0.5,
                    border: '2px solid',
                    borderColor: value === presetColor ? 'primary.main' : 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      borderColor: 'primary.light',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Stack>
      </Popover>
    </>
  );
};

