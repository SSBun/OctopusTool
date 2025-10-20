/**
 * 渐变生成器工具
 */

import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Slider,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  Select,
  MenuItem,
  alpha,
} from '@mui/material';
import {
  ContentCopy,
  CheckCircle,
  Add,
  Delete,
  Refresh,
} from '@mui/icons-material';
import { ToolDetailHeader } from '../../components/ToolDetailHeader';
import { ColorPicker } from '../../components/ColorPicker';

interface GradientStop {
  color: string;
  position: number;
}

type GradientType = 'linear' | 'radial' | 'conic';
type GradientDirection = 'to right' | 'to left' | 'to top' | 'to bottom' | 'to top right' | 'to top left' | 'to bottom right' | 'to bottom left';

export const GradientGenerator: React.FC = () => {
  const [gradientType, setGradientType] = useState<GradientType>('linear');
  const [direction, setDirection] = useState<GradientDirection>('to right');
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState<GradientStop[]>([
    { color: '#3f51b5', position: 0 },
    { color: '#e91e63', position: 100 },
  ]);
  const [copyMessage, setCopyMessage] = useState('');

  // 生成 CSS 代码
  const generateCSS = () => {
    const stopString = stops
      .sort((a, b) => a.position - b.position)
      .map(stop => `${stop.color} ${stop.position}%`)
      .join(', ');

    if (gradientType === 'linear') {
      if (direction.startsWith('to')) {
        return `linear-gradient(${direction}, ${stopString})`;
      }
      return `linear-gradient(${angle}deg, ${stopString})`;
    } else if (gradientType === 'radial') {
      return `radial-gradient(circle, ${stopString})`;
    } else {
      return `conic-gradient(from ${angle}deg, ${stopString})`;
    }
  };

  // 添加颜色停止点
  const addStop = () => {
    const newPosition = stops.length > 0 ? 50 : 0;
    setStops([...stops, { color: '#9c27b0', position: newPosition }]);
  };

  // 删除颜色停止点
  const removeStop = (index: number) => {
    if (stops.length > 2) {
      setStops(stops.filter((_, i) => i !== index));
    }
  };

  // 更新颜色停止点
  const updateStop = (index: number, field: 'color' | 'position', value: string | number) => {
    const newStops = [...stops];
    if (field === 'color') {
      newStops[index].color = value as string;
    } else {
      newStops[index].position = value as number;
    }
    setStops(newStops);
  };

  // 随机生成渐变
  const randomGradient = () => {
    const randomColor = () => {
      const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
      return colors[Math.floor(Math.random() * colors.length)];
    };

    const numStops = Math.floor(Math.random() * 3) + 2; // 2-4 stops
    const newStops: GradientStop[] = [];
    for (let i = 0; i < numStops; i++) {
      newStops.push({
        color: randomColor(),
        position: Math.round((i / (numStops - 1)) * 100),
      });
    }
    setStops(newStops);
  };

  // 复制 CSS 代码
  const copyCSSCode = () => {
    const css = `background: ${generateCSS()};`;
    navigator.clipboard.writeText(css);
    setCopyMessage('已复制 CSS 代码');
  };

  // 预设渐变
  const presets = [
    {
      name: '日落',
      stops: [
        { color: '#ff6b6b', position: 0 },
        { color: '#feca57', position: 50 },
        { color: '#ee5a6f', position: 100 },
      ],
    },
    {
      name: '海洋',
      stops: [
        { color: '#2E3192', position: 0 },
        { color: '#1BFFFF', position: 100 },
      ],
    },
    {
      name: '森林',
      stops: [
        { color: '#134E5E', position: 0 },
        { color: '#71B280', position: 100 },
      ],
    },
    {
      name: '火焰',
      stops: [
        { color: '#FF416C', position: 0 },
        { color: '#FF4B2B', position: 100 },
      ],
    },
    {
      name: '薰衣草',
      stops: [
        { color: '#8E2DE2', position: 0 },
        { color: '#4A00E0', position: 100 },
      ],
    },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setStops(preset.stops);
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader
        title="渐变生成器"
        description="创建 CSS 渐变，支持线性、径向、圆锥渐变"
        toolPath="/tools/design/gradient-generator"
      />

      <Grid container spacing={4}>
        {/* 左侧：配置区 */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              渐变类型
            </Typography>
            <ToggleButtonGroup
              value={gradientType}
              exclusive
              onChange={(_, value) => value && setGradientType(value)}
              fullWidth
              sx={{ mb: 3 }}
            >
              <ToggleButton value="linear">线性</ToggleButton>
              <ToggleButton value="radial">径向</ToggleButton>
              <ToggleButton value="conic">圆锥</ToggleButton>
            </ToggleButtonGroup>

            {gradientType === 'linear' && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  方向
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <Select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value as GradientDirection)}
                  >
                    <MenuItem value="to right">向右 →</MenuItem>
                    <MenuItem value="to left">向左 ←</MenuItem>
                    <MenuItem value="to top">向上 ↑</MenuItem>
                    <MenuItem value="to bottom">向下 ↓</MenuItem>
                    <MenuItem value="to top right">右上 ↗</MenuItem>
                    <MenuItem value="to top left">左上 ↖</MenuItem>
                    <MenuItem value="to bottom right">右下 ↘</MenuItem>
                    <MenuItem value="to bottom left">左下 ↙</MenuItem>
                  </Select>
                </FormControl>

                <Typography variant="subtitle2" gutterBottom>
                  角度: {angle}°
                </Typography>
                <Slider
                  value={angle}
                  onChange={(_, value) => setAngle(value as number)}
                  min={0}
                  max={360}
                  sx={{ mb: 2 }}
                />
              </>
            )}

            {(gradientType === 'radial' || gradientType === 'conic') && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  旋转角度: {angle}°
                </Typography>
                <Slider
                  value={angle}
                  onChange={(_, value) => setAngle(value as number)}
                  min={0}
                  max={360}
                  sx={{ mb: 2 }}
                />
              </>
            )}

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              颜色停止点
            </Typography>

            {stops.map((stop, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2">Stop {index + 1}</Typography>
                  {stops.length > 2 && (
                    <IconButton size="small" onClick={() => removeStop(index)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  )}
                </Box>

                <ColorPicker
                  label={`颜色 ${index + 1}`}
                  value={stop.color}
                  onChange={(color) => updateStop(index, 'color', color)}
                />

                <Typography variant="caption" gutterBottom>
                  位置: {stop.position}%
                </Typography>
                <Slider
                  value={stop.position}
                  onChange={(_, value) => updateStop(index, 'position', value as number)}
                  min={0}
                  max={100}
                  size="small"
                />
              </Box>
            ))}

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Add />}
              onClick={addStop}
            >
              添加停止点
            </Button>

            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={randomGradient}
                fullWidth
              >
                随机渐变
              </Button>
              <Button
                variant="contained"
                startIcon={<ContentCopy />}
                onClick={copyCSSCode}
                fullWidth
              >
                复制 CSS 代码
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* 右侧：预览和代码 */}
        <Grid item xs={12} md={8}>
          {/* 预览 */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              渐变预览
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: 300,
                background: generateCSS(),
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  color: 'white',
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                  fontWeight: 'bold',
                }}
              >
                Gradient Preview
              </Typography>
            </Box>
          </Paper>

          {/* CSS 代码 */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                CSS 代码
              </Typography>
              <Tooltip title="复制">
                <IconButton onClick={copyCSSCode}>
                  <ContentCopy />
                </IconButton>
              </Tooltip>
            </Box>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.5),
              }}
            >
              <Typography
                component="pre"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {`background: ${generateCSS()};`}
              </Typography>
            </Paper>
          </Paper>

          {/* 预设渐变 */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              预设渐变
            </Typography>
            <Grid container spacing={2}>
              {presets.map((preset, index) => {
                const presetGradient = `linear-gradient(to right, ${preset.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`;
                return (
                  <Grid item xs={6} sm={4} key={index}>
                    <Box
                      onClick={() => applyPreset(preset)}
                      sx={{
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        overflow: 'hidden',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 3,
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          height: 80,
                          background: presetGradient,
                        }}
                      />
                      <Box sx={{ p: 1, textAlign: 'center' }}>
                        <Typography variant="body2">{preset.name}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
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

