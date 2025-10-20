/**
 * 颜色提取器工具
 */

import React, { useState, useRef } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload,
  ContentCopy,
  CheckCircle,
  Delete,
  ImageOutlined,
} from '@mui/icons-material';
import ColorThief from 'colorthief';
import chroma from 'chroma-js';
import { ToolDetailHeader } from '../../components/ToolDetailHeader';

interface ExtractedColor {
  rgb: [number, number, number];
  hex: string;
  percentage?: number;
}

export const ColorExtractor: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dominantColor, setDominantColor] = useState<ExtractedColor | null>(null);
  const [palette, setPalette] = useState<ExtractedColor[]>([]);
  const [copyMessage, setCopyMessage] = useState('');
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // 处理图片上传
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件');
      return;
    }

    // 检查文件大小（限制 5MB）
    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过 5MB');
      return;
    }

    setLoading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 处理图片加载完成
  const handleImageLoad = () => {
    if (!imageRef.current) return;

    const colorThief = new ColorThief();
    
    try {
      // 提取主色
      const dominant = colorThief.getColor(imageRef.current);
      const dominantHex = chroma(dominant).hex();
      setDominantColor({
        rgb: dominant,
        hex: dominantHex,
      });

      // 提取调色板（8种颜色）
      const paletteColors = colorThief.getPalette(imageRef.current, 8);
      const paletteWithHex = paletteColors.map((color: [number, number, number]) => ({
        rgb: color,
        hex: chroma(color).hex(),
      }));
      setPalette(paletteWithHex);

      setLoading(false);
    } catch (err) {
      console.error('颜色提取失败:', err);
      setError('颜色提取失败，请尝试其他图片');
      setLoading(false);
    }
  };

  // 复制颜色
  const copyColor = (color: string, label: string) => {
    navigator.clipboard.writeText(color);
    setCopyMessage(`已复制 ${label}`);
  };

  // 复制所有颜色
  const copyAllColors = () => {
    const colors = palette.map(c => c.hex).join('\n');
    navigator.clipboard.writeText(colors);
    setCopyMessage('已复制所有颜色');
  };

  // 导出 CSS
  const exportCSS = () => {
    const css = palette.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n');
    const cssCode = `:root {\n${css}\n}`;
    navigator.clipboard.writeText(cssCode);
    setCopyMessage('已复制 CSS 代码');
  };

  // 重置
  const handleReset = () => {
    setImage(null);
    setDominantColor(null);
    setPalette([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 获取文字颜色
  const getTextColor = (rgb: [number, number, number]) => {
    const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader
        title="颜色提取器"
        description="从图片提取主色调和调色板"
        toolPath="/tools/design/color-extractor"
      />

      <Grid container spacing={4}>
        {/* 左侧：图片上传 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              上传图片
            </Typography>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />

            {!image ? (
              <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  height: 300,
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: (theme) => theme.palette.action.hover,
                  },
                }}
              >
                <ImageOutlined sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  点击或拖拽上传图片
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  支持 JPG, PNG, GIF 等格式，最大 5MB
                </Typography>
              </Box>
            ) : (
              <Box>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    maxHeight: 400,
                    overflow: 'hidden',
                    borderRadius: 2,
                    mb: 2,
                  }}
                >
                  <img
                    ref={imageRef}
                    src={image}
                    alt="Uploaded"
                    crossOrigin="anonymous"
                    onLoad={handleImageLoad}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                    }}
                  />
                </Box>

                {loading && <LinearProgress sx={{ mb: 2 }} />}

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    onClick={() => fileInputRef.current?.click()}
                    fullWidth
                  >
                    更换图片
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={handleReset}
                  >
                    清除
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>

          {/* 使用说明 */}
          <Alert severity="info">
            <Typography variant="subtitle2" gutterBottom>
              💡 使用提示
            </Typography>
            <Typography variant="body2" component="div">
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>支持 JPG、PNG、GIF 等常见图片格式</li>
                <li>自动提取图片中的主色调</li>
                <li>生成 8 种颜色的调色板</li>
                <li>点击颜色块可快速复制</li>
                <li>支持导出为 CSS 变量</li>
              </ul>
            </Typography>
          </Alert>
        </Grid>

        {/* 右侧：提取的颜色 */}
        <Grid item xs={12} md={6}>
          {!image ? (
            <Paper
              sx={{
                p: 4,
                height: 300,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ImageOutlined sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                上传图片后查看提取的颜色
              </Typography>
            </Paper>
          ) : (
            <>
              {/* 主色调 */}
              {dominantColor && (
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    主色调
                  </Typography>
                  <Tooltip title={`点击复制 ${dominantColor.hex}`}>
                    <Paper
                      onClick={() => copyColor(dominantColor.hex, '主色调')}
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
                          backgroundColor: dominantColor.hex,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconButton
                          sx={{
                            color: getTextColor(dominantColor.rgb),
                            backgroundColor:
                              getTextColor(dominantColor.rgb) === '#ffffff'
                                ? 'rgba(255,255,255,0.1)'
                                : 'rgba(0,0,0,0.1)',
                          }}
                        >
                          <ContentCopy />
                        </IconButton>
                      </Box>
                      <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          主色调
                        </Typography>
                        <Typography variant="body2" fontFamily="monospace">
                          {dominantColor.hex}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          RGB({dominantColor.rgb.join(', ')})
                        </Typography>
                      </Box>
                    </Paper>
                  </Tooltip>
                </Paper>
              )}

              {/* 调色板 */}
              {palette.length > 0 && (
                <Paper sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">调色板</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={copyAllColors}
                      >
                        复制全部
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={exportCSS}
                      >
                        导出 CSS
                      </Button>
                    </Box>
                  </Box>

                  <Grid container spacing={1.5}>
                    {palette.map((color, index) => (
                      <Grid item xs={6} sm={4} md={6} key={index}>
                        <Tooltip title={`点击复制 ${color.hex}`}>
                          <Paper
                            onClick={() => copyColor(color.hex, `颜色 ${index + 1}`)}
                            sx={{
                              cursor: 'pointer',
                              overflow: 'hidden',
                              transition: 'all 0.2s',
                              '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: 3,
                              },
                            }}
                          >
                            <Box
                              sx={{
                                height: 80,
                                backgroundColor: color.hex,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: getTextColor(color.rgb),
                                  fontWeight: 600,
                                  opacity: 0,
                                  transition: 'opacity 0.2s',
                                  '.MuiPaper-root:hover &': {
                                    opacity: 1,
                                  },
                                }}
                              >
                                {index + 1}
                              </Typography>
                            </Box>
                            <Box sx={{ p: 1, textAlign: 'center' }}>
                              <Typography
                                variant="caption"
                                fontFamily="monospace"
                                display="block"
                              >
                                {color.hex}
                              </Typography>
                            </Box>
                          </Paper>
                        </Tooltip>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              )}
            </>
          )}
        </Grid>
      </Grid>

      {/* 错误提示 */}
      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

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

