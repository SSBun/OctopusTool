/**
 * 颜色选择器工具
 */

import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Grid,
  Button,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { ContentCopy, CheckCircle } from '@mui/icons-material';
import { HexColorPicker, RgbaColorPicker, HslaColorPicker } from 'react-colorful';
import { ToolDetailHeader } from '../../components/ToolDetailHeader';

type PickerMode = 'hex' | 'rgb' | 'hsl';

export const ColorPicker: React.FC = () => {
  // Hex 模式
  const [hexColor, setHexColor] = useState('#3f51b5');
  
  // RGB 模式
  const [rgbColor, setRgbColor] = useState({ r: 63, g: 81, b: 181, a: 1 });
  
  // HSL 模式
  const [hslColor, setHslColor] = useState({ h: 231, s: 48, l: 48, a: 1 });
  
  const [pickerMode, setPickerMode] = useState<PickerMode>('hex');
  const [copyMessage, setCopyMessage] = useState('');

  // 颜色格式转换函数
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: 1
    } : rgbColor;
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const rgbToHsl = (r: number, g: number, b: number, a: number = 1) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
      a
    };
  };

  const hslToRgb = (h: number, s: number, l: number, a: number = 1) => {
    h = h / 360;
    s = s / 100;
    l = l / 100;
    
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
      a
    };
  };

  // 同步颜色值
  const syncColors = (mode: PickerMode, value: any) => {
    if (mode === 'hex') {
      setHexColor(value);
      const rgb = hexToRgb(value);
      setRgbColor(rgb);
      setHslColor(rgbToHsl(rgb.r, rgb.g, rgb.b, rgb.a));
    } else if (mode === 'rgb') {
      setRgbColor(value);
      setHexColor(rgbToHex(value.r, value.g, value.b));
      setHslColor(rgbToHsl(value.r, value.g, value.b, value.a));
    } else if (mode === 'hsl') {
      setHslColor(value);
      const rgb = hslToRgb(value.h, value.s, value.l, value.a);
      setRgbColor(rgb);
      setHexColor(rgbToHex(rgb.r, rgb.g, rgb.b));
    }
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyMessage(`已复制 ${label}`);
  };

  // 获取当前显示的颜色（用于预览）
  const getCurrentColor = () => {
    if (pickerMode === 'hex') return hexColor;
    if (pickerMode === 'rgb') return `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${rgbColor.a})`;
    return `hsla(${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%, ${hslColor.a})`;
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader
        title="颜色选择器"
        description="可视化颜色选择，支持 HEX、RGB、HSL 等多种格式"
        toolPath="/tools/design/color-picker"
      />

      <Grid container spacing={4}>
        {/* 左侧：颜色选择器 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              选择颜色
            </Typography>

            {/* 模式切换 */}
            <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
              <Button
                variant={pickerMode === 'hex' ? 'contained' : 'outlined'}
                onClick={() => setPickerMode('hex')}
                size="small"
              >
                HEX
              </Button>
              <Button
                variant={pickerMode === 'rgb' ? 'contained' : 'outlined'}
                onClick={() => setPickerMode('rgb')}
                size="small"
              >
                RGB
              </Button>
              <Button
                variant={pickerMode === 'hsl' ? 'contained' : 'outlined'}
                onClick={() => setPickerMode('hsl')}
                size="small"
              >
                HSL
              </Button>
            </Box>

            {/* 颜色选择器 */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              mb: 3,
              '& .react-colorful': {
                width: '100%',
                height: '250px',
              }
            }}>
              {pickerMode === 'hex' && (
                <HexColorPicker 
                  color={hexColor} 
                  onChange={(color) => syncColors('hex', color)} 
                />
              )}
              {pickerMode === 'rgb' && (
                <RgbaColorPicker 
                  color={rgbColor} 
                  onChange={(color) => syncColors('rgb', color)} 
                />
              )}
              {pickerMode === 'hsl' && (
                <HslaColorPicker 
                  color={hslColor} 
                  onChange={(color) => syncColors('hsl', color)} 
                />
              )}
            </Box>

            {/* 当前颜色值输入 */}
            <TextField
              fullWidth
              label={`当前颜色 (${pickerMode.toUpperCase()})`}
              value={getCurrentColor()}
              onChange={(e) => {
                if (pickerMode === 'hex') {
                  syncColors('hex', e.target.value);
                }
              }}
              sx={{ mb: 2 }}
            />
          </Paper>
        </Grid>

        {/* 右侧：颜色预览和格式输出 */}
        <Grid item xs={12} md={6}>
          {/* 颜色预览 */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              颜色预览
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: 200,
                backgroundColor: getCurrentColor(),
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  color: (() => {
                    // 计算文字颜色（黑或白）
                    const { r, g, b } = rgbColor;
                    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                    return luminance > 0.5 ? 'black' : 'white';
                  })(),
                  textShadow: '0 0 10px rgba(0,0,0,0.3)',
                }}
              >
                示例文本
              </Typography>
            </Box>
          </Paper>

          {/* 格式输出 */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              颜色格式
            </Typography>

            {/* HEX */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2">HEX</Typography>
                <Tooltip title="复制">
                  <IconButton 
                    size="small"
                    onClick={() => copyToClipboard(hexColor, 'HEX')}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Typography fontFamily="monospace">{hexColor}</Typography>
              </Paper>
            </Box>

            {/* RGB */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2">RGB</Typography>
                <Tooltip title="复制">
                  <IconButton 
                    size="small"
                    onClick={() => copyToClipboard(`rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`, 'RGB')}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Typography fontFamily="monospace">
                  rgb({rgbColor.r}, {rgbColor.g}, {rgbColor.b})
                </Typography>
              </Paper>
            </Box>

            {/* RGBA */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2">RGBA</Typography>
                <Tooltip title="复制">
                  <IconButton 
                    size="small"
                    onClick={() => copyToClipboard(`rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${rgbColor.a})`, 'RGBA')}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Typography fontFamily="monospace">
                  rgba({rgbColor.r}, {rgbColor.g}, {rgbColor.b}, {rgbColor.a})
                </Typography>
              </Paper>
            </Box>

            {/* HSL */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2">HSL</Typography>
                <Tooltip title="复制">
                  <IconButton 
                    size="small"
                    onClick={() => copyToClipboard(`hsl(${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%)`, 'HSL')}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Typography fontFamily="monospace">
                  hsl({hslColor.h}, {hslColor.s}%, {hslColor.l}%)
                </Typography>
              </Paper>
            </Box>

            {/* HSLA */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2">HSLA</Typography>
                <Tooltip title="复制">
                  <IconButton 
                    size="small"
                    onClick={() => copyToClipboard(`hsla(${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%, ${hslColor.a})`, 'HSLA')}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Typography fontFamily="monospace">
                  hsla({hslColor.h}, {hslColor.s}%, {hslColor.l}%, {hslColor.a})
                </Typography>
              </Paper>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 复制成功提示 */}
      <Snackbar
        open={!!copyMessage}
        autoHideDuration={2000}
        onClose={() => setCopyMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setCopyMessage('')}
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

