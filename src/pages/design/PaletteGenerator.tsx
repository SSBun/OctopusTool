/**
 * 调色板生成器工具
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  ButtonGroup,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  alpha,
} from '@mui/material';
import { ContentCopy, CheckCircle, Refresh } from '@mui/icons-material';
import chroma from 'chroma-js';
import { ToolDetailHeader } from '../../components/ToolDetailHeader';
import { ColorPicker } from '../../components/ColorPicker';

type PaletteMode = 'monochromatic' | 'complementary' | 'analogous' | 'triadic' | 'split-complementary' | 'tetradic';

interface ColorPalette {
  color: string;
  name: string;
}

export const PaletteGenerator: React.FC = () => {
  const [baseColor, setBaseColor] = useState('#3f51b5');
  const [paletteMode, setPaletteMode] = useState<PaletteMode>('monochromatic');
  const [palette, setPalette] = useState<ColorPalette[]>([]);
  const [copyMessage, setCopyMessage] = useState('');

  // 生成调色板
  const generatePalette = () => {
    const colors: ColorPalette[] = [];
    const base = chroma(baseColor);

    switch (paletteMode) {
      case 'monochromatic':
        // 单色调色板 - 不同明度
        const lightness = [0.95, 0.85, 0.70, 0.50, 0.30, 0.15];
        lightness.forEach((l, index) => {
          const color = base.set('hsl.l', l).hex();
          colors.push({
            color,
            name: `Color ${index + 1}`
          });
        });
        break;

      case 'complementary':
        // 互补色
        colors.push({ color: base.hex(), name: 'Base' });
        colors.push({ color: base.set('hsl.h', '+180').hex(), name: 'Complement' });
        // 添加一些变体
        colors.push({ color: base.brighten(0.5).hex(), name: 'Light Base' });
        colors.push({ color: base.darken(0.5).hex(), name: 'Dark Base' });
        colors.push({ color: base.set('hsl.h', '+180').brighten(0.5).hex(), name: 'Light Complement' });
        colors.push({ color: base.set('hsl.h', '+180').darken(0.5).hex(), name: 'Dark Complement' });
        break;

      case 'analogous':
        // 类比色 - 相邻色
        [-60, -30, 0, 30, 60, 90].forEach((offset, index) => {
          const color = base.set('hsl.h', `+${offset}`).hex();
          colors.push({
            color,
            name: `Color ${index + 1}`
          });
        });
        break;

      case 'triadic':
        // 三角色 - 120度间隔
        [0, 120, 240].forEach((offset, index) => {
          const color = base.set('hsl.h', `+${offset}`).hex();
          colors.push({ color, name: `Primary ${index + 1}` });
          // 添加明暗变体
          colors.push({ color: chroma(color).brighten(0.7).hex(), name: `Light ${index + 1}` });
          colors.push({ color: chroma(color).darken(0.7).hex(), name: `Dark ${index + 1}` });
        });
        setPalette(colors.slice(0, 6)); // 限制为6个颜色
        return;

      case 'split-complementary':
        // 分裂互补色
        colors.push({ color: base.hex(), name: 'Base' });
        colors.push({ color: base.set('hsl.h', '+150').hex(), name: 'Split 1' });
        colors.push({ color: base.set('hsl.h', '+210').hex(), name: 'Split 2' });
        // 添加变体
        colors.push({ color: base.brighten(0.5).hex(), name: 'Light Base' });
        colors.push({ color: base.set('hsl.h', '+150').brighten(0.5).hex(), name: 'Light Split 1' });
        colors.push({ color: base.set('hsl.h', '+210').brighten(0.5).hex(), name: 'Light Split 2' });
        break;

      case 'tetradic':
        // 四分色 - 90度间隔
        [0, 90, 180, 270].forEach((offset, idx) => {
          const color = base.set('hsl.h', `+${offset}`).hex();
          colors.push({ color, name: `Color ${idx + 1}` });
        });
        // 添加一些变体
        colors.push({ color: base.brighten(1).hex(), name: 'Very Light' });
        colors.push({ color: base.darken(1).hex(), name: 'Very Dark' });
        break;
    }

    setPalette(colors);
  };

  // 当基色或模式改变时重新生成
  useEffect(() => {
    try {
      generatePalette();
    } catch (error) {
      console.error('Invalid color', error);
    }
  }, [baseColor, paletteMode]);

  // 复制颜色
  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopyMessage(`已复制 ${color}`);
  };

  // 复制整个调色板
  const copyPalette = () => {
    const colors = palette.map(p => p.color).join(', ');
    navigator.clipboard.writeText(colors);
    setCopyMessage('已复制调色板');
  };

  // 导出 CSS 变量
  const exportCSS = () => {
    const css = palette.map((p) => {
      const varName = p.name.toLowerCase().replace(/\s+/g, '-');
      return `  --color-${varName}: ${p.color};`;
    }).join('\n');
    const cssCode = `:root {\n${css}\n}`;
    navigator.clipboard.writeText(cssCode);
    setCopyMessage('已复制 CSS 代码');
  };

  // 导出 JSON
  const exportJSON = () => {
    const json = JSON.stringify(palette, null, 2);
    navigator.clipboard.writeText(json);
    setCopyMessage('已复制 JSON 数据');
  };

  // 模式说明
  const getModeDescription = () => {
    const descriptions: Record<PaletteMode, string> = {
      monochromatic: '单色调色板 - 使用同一色相的不同明度',
      complementary: '互补色调色板 - 使用色轮上相对的颜色',
      analogous: '类比色调色板 - 使用色轮上相邻的颜色',
      triadic: '三角色调色板 - 色轮上等距的三个颜色',
      'split-complementary': '分裂互补色 - 基色和互补色两侧的颜色',
      tetradic: '四分色调色板 - 色轮上等距的四个颜色',
    };
    return descriptions[paletteMode];
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader
        title="调色板生成器"
        description="基于主色生成配色方案，支持多种配色规则"
        toolPath="/tools/design/palette-generator"
      />

      <Grid container spacing={4}>
        {/* 左侧：配置区 */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              基础颜色
            </Typography>
            
            {/* 颜色输入 */}
            <Box sx={{ mb: 3 }}>
              <ColorPicker
                label="基础颜色"
                value={baseColor}
                onChange={setBaseColor}
                helperText="点击色块打开颜色选择器，自动生成配色方案"
              />
              
              {/* 大色块预览 */}
              <Box
                sx={{
                  width: '100%',
                  height: 80,
                  backgroundColor: baseColor,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  mt: 2,
                }}
              />
            </Box>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              配色规则
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {getModeDescription()}
            </Typography>

            {/* 模式选择 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant={paletteMode === 'monochromatic' ? 'contained' : 'outlined'}
                onClick={() => setPaletteMode('monochromatic')}
                fullWidth
              >
                单色 Monochromatic
              </Button>
              <Button
                variant={paletteMode === 'complementary' ? 'contained' : 'outlined'}
                onClick={() => setPaletteMode('complementary')}
                fullWidth
              >
                互补色 Complementary
              </Button>
              <Button
                variant={paletteMode === 'analogous' ? 'contained' : 'outlined'}
                onClick={() => setPaletteMode('analogous')}
                fullWidth
              >
                类比色 Analogous
              </Button>
              <Button
                variant={paletteMode === 'triadic' ? 'contained' : 'outlined'}
                onClick={() => setPaletteMode('triadic')}
                fullWidth
              >
                三角色 Triadic
              </Button>
              <Button
                variant={paletteMode === 'split-complementary' ? 'contained' : 'outlined'}
                onClick={() => setPaletteMode('split-complementary')}
                fullWidth
              >
                分裂互补 Split-Complementary
              </Button>
              <Button
                variant={paletteMode === 'tetradic' ? 'contained' : 'outlined'}
                onClick={() => setPaletteMode('tetradic')}
                fullWidth
              >
                四分色 Tetradic
              </Button>
            </Box>

            {/* 操作按钮 */}
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={generatePalette}
                fullWidth
              >
                重新生成
              </Button>
              <Button
                variant="outlined"
                startIcon={<ContentCopy />}
                onClick={copyPalette}
                fullWidth
              >
                复制所有颜色
              </Button>
              <ButtonGroup variant="outlined" fullWidth>
                <Button onClick={exportCSS}>导出 CSS</Button>
                <Button onClick={exportJSON}>导出 JSON</Button>
              </ButtonGroup>
            </Box>
          </Paper>
        </Grid>

        {/* 右侧：调色板展示 */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              生成的调色板
            </Typography>

            <Grid container spacing={2}>
              {palette.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.name}>
                  <Paper
                    variant="outlined"
                    sx={{
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3,
                      },
                    }}
                  >
                    {/* 颜色块 */}
                    <Box
                      sx={{
                        height: 120,
                        backgroundColor: item.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                      onClick={() => copyColor(item.color)}
                    >
                      <Tooltip title="点击复制">
                      <IconButton
                        sx={{
                          color: chroma(item.color).luminance() > 0.5 ? 'black' : 'white',
                          backgroundColor: alpha(
                            chroma(item.color).luminance() > 0.5 ? '#000' : '#fff',
                            0.1
                          ),
                          '&:hover': {
                            backgroundColor: alpha(
                              chroma(item.color).luminance() > 0.5 ? '#000' : '#fff',
                              0.2
                            ),
                          },
                        }}
                        >
                          <ContentCopy />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {/* 颜色信息 */}
                    <Box sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {item.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        fontFamily="monospace"
                        color="text.secondary"
                      >
                        {item.color.toUpperCase()}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 0.5 }}>
                        <Chip 
                          label={`RGB(${chroma(item.color).rgb().map(Math.round).join(', ')})`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* 使用提示 */}
            <Alert severity="info" sx={{ mt: 3 }}>
              💡 提示：
              <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                <li>点击颜色块可复制单个颜色</li>
                <li>使用"导出 CSS"生成 CSS 变量代码</li>
                <li>使用"导出 JSON"获取结构化数据</li>
                <li>尝试不同的配色规则，找到最适合的方案</li>
              </ul>
            </Alert>
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

