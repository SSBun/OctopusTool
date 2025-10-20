/**
 * 明暗色生成器工具
 */

import React, { useState, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Grid,
  Slider,
  Tooltip,
  IconButton,
  Snackbar,
  Alert,
  ButtonGroup,
  Button,
} from '@mui/material';
import { ContentCopy, CheckCircle } from '@mui/icons-material';
import chroma from 'chroma-js';
import { ToolDetailHeader } from '../../components/ToolDetailHeader';

export const TintShadeGenerator: React.FC = () => {
  const [baseColor, setBaseColor] = useState('#3f51b5');
  const [tintSteps, setTintSteps] = useState(5);
  const [shadeSteps, setShadeSteps] = useState(5);
  const [copyMessage, setCopyMessage] = useState('');

  // 生成 Tints（明色变体 - 添加白色）
  const tints = useMemo(() => {
    try {
      const base = chroma(baseColor);
      const colors = [];
      for (let i = 1; i <= tintSteps; i++) {
        const t = i / (tintSteps + 1);
        const tintColor = chroma.mix(base, '#ffffff', t, 'rgb').hex();
        colors.push({
          color: tintColor,
          percentage: Math.round(t * 100),
          name: `Tint ${Math.round(t * 100)}%`,
        });
      }
      return colors;
    } catch {
      return [];
    }
  }, [baseColor, tintSteps]);

  // 生成 Shades（暗色变体 - 添加黑色）
  const shades = useMemo(() => {
    try {
      const base = chroma(baseColor);
      const colors = [];
      for (let i = 1; i <= shadeSteps; i++) {
        const t = i / (shadeSteps + 1);
        const shadeColor = chroma.mix(base, '#000000', t, 'rgb').hex();
        colors.push({
          color: shadeColor,
          percentage: Math.round(t * 100),
          name: `Shade ${Math.round(t * 100)}%`,
        });
      }
      return colors;
    } catch {
      return [];
    }
  }, [baseColor, shadeSteps]);

  // 生成 Tones（色调 - 添加灰色）
  const tones = useMemo(() => {
    try {
      const base = chroma(baseColor);
      const colors = [];
      for (let i = 1; i <= 5; i++) {
        const t = i / 6;
        const toneColor = chroma.mix(base, '#808080', t, 'rgb').hex();
        colors.push({
          color: toneColor,
          percentage: Math.round(t * 100),
          name: `Tone ${Math.round(t * 100)}%`,
        });
      }
      return colors;
    } catch {
      return [];
    }
  }, [baseColor]);

  // 复制颜色
  const copyColor = (color: string, name: string) => {
    navigator.clipboard.writeText(color);
    setCopyMessage(`已复制 ${name}: ${color}`);
  };

  // 导出所有颜色
  const exportAllColors = () => {
    const allColors = [
      ...tints.map(t => `${t.name}: ${t.color}`),
      `Base: ${baseColor}`,
      ...shades.map(s => `${s.name}: ${s.color}`),
    ].join('\n');
    navigator.clipboard.writeText(allColors);
    setCopyMessage('已复制所有颜色');
  };

  // 导出 CSS 变量
  const exportCSS = () => {
    const css = [
      ...tints.map(t => `  --color-tint-${t.percentage}: ${t.color};`),
      `  --color-base: ${baseColor};`,
      ...shades.map(s => `  --color-shade-${s.percentage}: ${s.color};`),
    ].join('\n');
    const cssCode = `:root {\n${css}\n}`;
    navigator.clipboard.writeText(cssCode);
    setCopyMessage('已复制 CSS 代码');
  };

  // 导出 Tailwind 配置
  const exportTailwind = () => {
    const config = {
      colors: {
        primary: {
          ...Object.fromEntries(tints.map((t, i) => [100 * (i + 1), t.color])),
          500: baseColor,
          ...Object.fromEntries(shades.map((s, i) => [600 + 100 * i, s.color])),
        },
      },
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopyMessage('已复制 Tailwind 配置');
  };

  // 获取文字颜色
  const getTextColor = (bgColor: string) => {
    try {
      return chroma(bgColor).luminance() > 0.5 ? '#000000' : '#ffffff';
    } catch {
      return '#000000';
    }
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader
        title="明暗色生成器"
        description="生成颜色的 Tints（明色）和 Shades（暗色）变体"
        toolPath="/tools/design/tint-shade-generator"
      />

      <Grid container spacing={4}>
        {/* 左侧：配置区 */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              基础颜色
            </Typography>

            <TextField
              fullWidth
              label="HEX 颜色值"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              placeholder="#3f51b5"
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: baseColor,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      mr: 1,
                    }}
                  />
                ),
              }}
            />

            {/* 基色预览 */}
            <Box
              sx={{
                width: '100%',
                height: 100,
                backgroundColor: baseColor,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: getTextColor(baseColor),
                  fontWeight: 'bold',
                }}
              >
                Base Color
              </Typography>
            </Box>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              生成配置
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tints 数量: {tintSteps}
              </Typography>
              <Slider
                value={tintSteps}
                onChange={(_, value) => setTintSteps(value as number)}
                min={1}
                max={10}
                marks
                valueLabelDisplay="auto"
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Shades 数量: {shadeSteps}
              </Typography>
              <Slider
                value={shadeSteps}
                onChange={(_, value) => setShadeSteps(value as number)}
                min={1}
                max={10}
                marks
                valueLabelDisplay="auto"
              />
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              导出选项
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<ContentCopy />}
                onClick={exportAllColors}
                fullWidth
              >
                复制所有颜色
              </Button>
              <ButtonGroup variant="outlined" fullWidth orientation="vertical">
                <Button onClick={exportCSS}>导出 CSS 变量</Button>
                <Button onClick={exportTailwind}>导出 Tailwind 配置</Button>
              </ButtonGroup>
            </Box>
          </Paper>
        </Grid>

        {/* 右侧：颜色展示 */}
        <Grid item xs={12} md={8}>
          {/* Tints（明色） */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tints（明色变体）
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              向基色中添加白色，使颜色更亮
            </Typography>

            <Grid container spacing={1}>
              {tints.map((tint, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <Tooltip title={`点击复制 ${tint.color}`}>
                    <Paper
                      onClick={() => copyColor(tint.color, tint.name)}
                      sx={{
                        cursor: 'pointer',
                        overflow: 'hidden',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          height: 100,
                          backgroundColor: tint.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconButton
                          sx={{
                            color: getTextColor(tint.color),
                            backgroundColor:
                              getTextColor(tint.color) === '#ffffff'
                                ? 'rgba(255,255,255,0.1)'
                                : 'rgba(0,0,0,0.1)',
                          }}
                        >
                          <ContentCopy />
                        </IconButton>
                      </Box>
                      <Box sx={{ p: 1.5, textAlign: 'center' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {tint.percentage}%
                        </Typography>
                        <Typography
                          variant="caption"
                          fontFamily="monospace"
                          color="text.secondary"
                        >
                          {tint.color}
                        </Typography>
                      </Box>
                    </Paper>
                  </Tooltip>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Base Color */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Base Color（基色）
            </Typography>

            <Grid container spacing={1}>
              <Grid item xs={12} sm={6} md={4}>
                <Tooltip title={`点击复制 ${baseColor}`}>
                  <Paper
                    onClick={() => copyColor(baseColor, 'Base')}
                    sx={{
                      cursor: 'pointer',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        height: 120,
                        backgroundColor: baseColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconButton
                        sx={{
                          color: getTextColor(baseColor),
                          backgroundColor:
                            getTextColor(baseColor) === '#ffffff'
                              ? 'rgba(255,255,255,0.1)'
                              : 'rgba(0,0,0,0.1)',
                        }}
                      >
                        <ContentCopy />
                      </IconButton>
                    </Box>
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Base Color
                      </Typography>
                      <Typography
                        variant="body2"
                        fontFamily="monospace"
                        color="text.secondary"
                      >
                        {baseColor}
                      </Typography>
                    </Box>
                  </Paper>
                </Tooltip>
              </Grid>
            </Grid>
          </Paper>

          {/* Shades（暗色） */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Shades（暗色变体）
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              向基色中添加黑色，使颜色更暗
            </Typography>

            <Grid container spacing={1}>
              {shades.map((shade, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <Tooltip title={`点击复制 ${shade.color}`}>
                    <Paper
                      onClick={() => copyColor(shade.color, shade.name)}
                      sx={{
                        cursor: 'pointer',
                        overflow: 'hidden',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          height: 100,
                          backgroundColor: shade.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconButton
                          sx={{
                            color: getTextColor(shade.color),
                            backgroundColor:
                              getTextColor(shade.color) === '#ffffff'
                                ? 'rgba(255,255,255,0.1)'
                                : 'rgba(0,0,0,0.1)',
                          }}
                        >
                          <ContentCopy />
                        </IconButton>
                      </Box>
                      <Box sx={{ p: 1.5, textAlign: 'center' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {shade.percentage}%
                        </Typography>
                        <Typography
                          variant="caption"
                          fontFamily="monospace"
                          color="text.secondary"
                        >
                          {shade.color}
                        </Typography>
                      </Box>
                    </Paper>
                  </Tooltip>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Tones（色调） */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tones（色调变体）
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              向基色中添加灰色，降低饱和度
            </Typography>

            <Grid container spacing={1}>
              {tones.map((tone, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <Tooltip title={`点击复制 ${tone.color}`}>
                    <Paper
                      onClick={() => copyColor(tone.color, tone.name)}
                      sx={{
                        cursor: 'pointer',
                        overflow: 'hidden',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          height: 100,
                          backgroundColor: tone.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconButton
                          sx={{
                            color: getTextColor(tone.color),
                            backgroundColor:
                              getTextColor(tone.color) === '#ffffff'
                                ? 'rgba(255,255,255,0.1)'
                                : 'rgba(0,0,0,0.1)',
                          }}
                        >
                          <ContentCopy />
                        </IconButton>
                      </Box>
                      <Box sx={{ p: 1.5, textAlign: 'center' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {tone.percentage}%
                        </Typography>
                        <Typography
                          variant="caption"
                          fontFamily="monospace"
                          color="text.secondary"
                        >
                          {tone.color}
                        </Typography>
                      </Box>
                    </Paper>
                  </Tooltip>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* 使用说明 */}
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              📚 使用说明
            </Typography>
            <Typography variant="body2" component="div">
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>
                  <strong>Tints</strong>: 适用于背景、浅色主题、hover 状态
                </li>
                <li>
                  <strong>Shades</strong>: 适用于文字、深色主题、按下状态
                </li>
                <li>
                  <strong>Tones</strong>: 适用于禁用状态、占位符文字
                </li>
                <li>点击颜色块可快速复制色值</li>
                <li>支持导出为 CSS 变量或 Tailwind 配置</li>
              </ul>
            </Typography>
          </Alert>
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

