import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Alert,
} from '@mui/material';
import { ColorLens, Clear, CheckCircle } from '@mui/icons-material';

interface ColorValues {
  hex: string;
  rgb: string;
  hsl: string;
}

export const ColorTool: React.FC = () => {
  const [hexInput, setHexInput] = useState('#3b82f6');
  const [rgbInput, setRgbInput] = useState('');
  const [result, setResult] = useState<ColorValues>({
    hex: '#3b82f6',
    rgb: 'rgb(59, 130, 246)',
    hsl: 'hsl(217, 91%, 60%)',
  });
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  };

  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
      : null;
  };

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const handleHexConvert = () => {
    setError('');
    try {
      const rgb = hexToRgb(hexInput);
      if (!rgb) throw new Error('无效的 HEX 颜色格式');
      
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      setResult({
        hex: hexInput.toLowerCase(),
        rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败');
    }
  };

  const handleRgbConvert = () => {
    setError('');
    try {
      const match = rgbInput.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (!match) throw new Error('无效的 RGB 格式，请使用 rgb(r, g, b)');
      
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      
      if (r > 255 || g > 255 || b > 255) throw new Error('RGB 值必须在 0-255 之间');
      
      const hex = rgbToHex(r, g, b);
      const hsl = rgbToHsl(r, g, b);
      
      setResult({
        hex,
        rgb: rgbInput,
        hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败');
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setHexInput('#3b82f6');
    setRgbInput('');
    setResult({
      hex: '#3b82f6',
      rgb: 'rgb(59, 130, 246)',
      hsl: 'hsl(217, 91%, 60%)',
    });
    setError('');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          颜色转换工具
        </Typography>
        <Typography color="text.secondary" paragraph>
          RGB, HEX, HSL 等颜色格式相互转换
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {copied && (
        <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
          已复制到剪贴板！
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              HEX 颜色
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                label="HEX 颜色值"
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                placeholder="#3b82f6"
                sx={{ '& .MuiOutlinedInput-root': { fontFamily: 'monospace' } }}
              />
              <Box
                sx={{
                  width: 60,
                  height: 56,
                  bgcolor: hexInput,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              />
            </Box>
            <Button
              variant="contained"
              startIcon={<ColorLens />}
              onClick={handleHexConvert}
              fullWidth
              sx={{ mt: 2 }}
            >
              转换
            </Button>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              RGB 颜色
            </Typography>
            <TextField
              fullWidth
              label="RGB 颜色值"
              value={rgbInput}
              onChange={(e) => setRgbInput(e.target.value)}
              placeholder="rgb(59, 130, 246)"
              sx={{ '& .MuiOutlinedInput-root': { fontFamily: 'monospace' } }}
            />
            <Button
              variant="contained"
              startIcon={<ColorLens />}
              onClick={handleRgbConvert}
              fullWidth
              sx={{ mt: 2 }}
            >
              转换
            </Button>
          </Paper>
        </Box>

        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              转换结果
            </Typography>
            
            <Box
              sx={{
                width: '100%',
                height: 150,
                bgcolor: result.hex,
                borderRadius: 2,
                mb: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  HEX
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                  }}
                  onClick={() => handleCopy(result.hex)}
                >
                  {result.hex}
                </Paper>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  RGB
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                  }}
                  onClick={() => handleCopy(result.rgb)}
                >
                  {result.rgb}
                </Paper>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  HSL
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                  }}
                  onClick={() => handleCopy(result.hsl)}
                >
                  {result.hsl}
                </Paper>
              </Box>
            </Box>
          </Paper>

          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={handleClear}
            fullWidth
          >
            清空
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

