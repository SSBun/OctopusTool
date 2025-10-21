import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Stack,
  Alert,
  Divider,
  TextField,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Snackbar,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { Download, Image as ImageIcon, TextFields, RestartAlt, CloudUpload } from '@mui/icons-material';
import { ImageUploadBox } from '../../../components/ImageUploadBox';
import { ColorPicker } from '../../../components/ColorPicker';

type WatermarkType = 'text' | 'image';

export const WatermarkTool: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string>('');
  const [watermarkedImage, setWatermarkedImage] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 水印类型
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('text');

  // 文字水印设置
  const [watermarkText, setWatermarkText] = useState<string>('水印文字');
  const [fontSize, setFontSize] = useState<number>(48);
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [opacity, setOpacity] = useState<number>(50);
  const [fontFamily, setFontFamily] = useState<string>('Arial');
  const [fontWeight, setFontWeight] = useState<number>(400);
  const [rotation, setRotation] = useState<number>(0);

  // 图片水印设置
  const [watermarkImageUrl, setWatermarkImageUrl] = useState<string>('');
  const [watermarkImageSize, setWatermarkImageSize] = useState<number>(100);

  // 位置设置（使用百分比，便于拖动）
  const [watermarkX, setWatermarkX] = useState<number>(80); // 默认右下，百分比
  const [watermarkY, setWatermarkY] = useState<number>(80);
  
  // 拖动状态
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const fontOptions = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Impact', label: 'Impact' },
  ];

  const fontWeightOptions = [
    { value: 100, label: '极细 (100)' },
    { value: 200, label: '纤细 (200)' },
    { value: 300, label: '细体 (300)' },
    { value: 400, label: '正常 (400)' },
    { value: 500, label: '中等 (500)' },
    { value: 600, label: '半粗 (600)' },
    { value: 700, label: '粗体 (700)' },
    { value: 800, label: '特粗 (800)' },
    { value: 900, label: '黑体 (900)' },
  ];

  // 位置预设
  type PresetPosition = 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'custom';
  
  const positionPresets: { value: PresetPosition; label: string; x: number; y: number }[] = [
    { value: 'top-left', label: '↖ 左上角', x: 10, y: 10 },
    { value: 'top-center', label: '↑ 顶部居中', x: 50, y: 10 },
    { value: 'top-right', label: '↗ 右上角', x: 90, y: 10 },
    { value: 'middle-left', label: '← 左侧居中', x: 10, y: 50 },
    { value: 'middle-center', label: '· 正中央', x: 50, y: 50 },
    { value: 'middle-right', label: '→ 右侧居中', x: 90, y: 50 },
    { value: 'bottom-left', label: '↙ 左下角', x: 10, y: 90 },
    { value: 'bottom-center', label: '↓ 底部居中', x: 50, y: 90 },
    { value: 'bottom-right', label: '↘ 右下角', x: 90, y: 90 },
  ];

  // 获取当前位置对应的预设值
  const getCurrentPosition = (): PresetPosition => {
    const preset = positionPresets.find(p => p.x === watermarkX && p.y === watermarkY);
    return preset?.value || 'custom';
  };

  const handlePresetPosition = (preset: PresetPosition) => {
    if (preset === 'custom') return;
    const pos = positionPresets.find(p => p.value === preset);
    if (pos) {
      setWatermarkX(pos.x);
      setWatermarkY(pos.y);
    }
  };

  const showMessage = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showMessage('请选择图片文件', 'error');
      return;
    }

    setFileName(file.name);
    setWatermarkedImage('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setOriginalImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleWatermarkImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showMessage('请选择图片文件', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setWatermarkImageUrl(result);
    };
    reader.readAsDataURL(file);
  };

  // 计算水印位置（基于百分比）
  const getPosition = (
    canvasWidth: number,
    canvasHeight: number,
    watermarkWidth: number,
    watermarkHeight: number
  ): { x: number; y: number } => {
    // 将百分比转换为实际像素位置
    let x = (watermarkX / 100) * canvasWidth - watermarkWidth / 2;
    let y = (watermarkY / 100) * canvasHeight - watermarkHeight / 2;

    // 边界限制
    x = Math.max(0, Math.min(x, canvasWidth - watermarkWidth));
    y = Math.max(0, Math.min(y, canvasHeight - watermarkHeight));

    return { x, y };
  };

  // 鼠标拖动处理
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewRef.current) return;
    setIsDragging(true);
    updateWatermarkPosition(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !previewRef.current) return;
    updateWatermarkPosition(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateWatermarkPosition = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // 限制在 0-100 范围内
    setWatermarkX(Math.max(0, Math.min(100, x)));
    setWatermarkY(Math.max(0, Math.min(100, y)));
  };


  const applyWatermark = () => {
    if (!originalImage) {
      showMessage('请先上传图片', 'error');
      return;
    }

    if (watermarkType === 'text' && !watermarkText.trim()) {
      showMessage('请输入水印文字', 'error');
      return;
    }

    if (watermarkType === 'image' && !watermarkImageUrl) {
      showMessage('请上传水印图片', 'error');
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current || document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        showMessage('水印添加失败', 'error');
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      // 绘制原图
      ctx.drawImage(img, 0, 0);

      if (watermarkType === 'text') {
        // 文字水印
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = textColor;
        ctx.globalAlpha = opacity / 100;

        // 测量文字尺寸
        const metrics = ctx.measureText(watermarkText);
        const textWidth = metrics.width;
        const textHeight = fontSize;

        const pos = getPosition(canvas.width, canvas.height, textWidth, textHeight);

        // 保存当前状态
        ctx.save();
        
        // 移动到文字中心位置进行旋转
        const centerX = pos.x + textWidth / 2;
        const centerY = pos.y + textHeight / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-centerX, -centerY);

        // 绘制文字
        ctx.fillText(watermarkText, pos.x, pos.y + textHeight);

        // 恢复状态
        ctx.restore();

        // 重置透明度
        ctx.globalAlpha = 1;

        const watermarkedDataUrl = canvas.toDataURL('image/png');
        setWatermarkedImage(watermarkedDataUrl);
      } else if (watermarkType === 'image') {
        // 图片水印
        const watermarkImg = new Image();
        watermarkImg.onload = () => {
          // 计算水印图片尺寸
          const maxSize = watermarkImageSize;
          let wmWidth = watermarkImg.width;
          let wmHeight = watermarkImg.height;

          // 等比例缩放
          if (wmWidth > maxSize || wmHeight > maxSize) {
            const ratio = Math.min(maxSize / wmWidth, maxSize / wmHeight);
            wmWidth = wmWidth * ratio;
            wmHeight = wmHeight * ratio;
          }

          const pos = getPosition(canvas.width, canvas.height, wmWidth, wmHeight);

          ctx.globalAlpha = opacity / 100;
          
          // 保存当前状态
          ctx.save();
          
          // 移动到图片中心位置进行旋转
          const centerX = pos.x + wmWidth / 2;
          const centerY = pos.y + wmHeight / 2;
          ctx.translate(centerX, centerY);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.translate(-centerX, -centerY);
          
          ctx.drawImage(watermarkImg, pos.x, pos.y, wmWidth, wmHeight);
          
          // 恢复状态
          ctx.restore();
          
          ctx.globalAlpha = 1;

          const watermarkedDataUrl = canvas.toDataURL('image/png');
          setWatermarkedImage(watermarkedDataUrl);
        };

        watermarkImg.onerror = () => {
          showMessage('水印图片加载失败', 'error');
        };

        watermarkImg.src = watermarkImageUrl;
      }
    };

    img.onerror = () => {
      showMessage('图片加载失败', 'error');
    };

    img.src = originalImage;
  };

  // 实时预览
  useEffect(() => {
    if (originalImage) {
      applyWatermark();
    }
  }, [
    originalImage,
    watermarkType,
    watermarkText,
    fontSize,
    textColor,
    opacity,
    fontFamily,
    fontWeight,
    rotation,
    watermarkX,
    watermarkY,
    watermarkImageUrl,
    watermarkImageSize,
  ]);


  const handleDownload = () => {
    if (!watermarkedImage) return;

    const link = document.createElement('a');
    link.href = watermarkedImage;
    link.download = `watermarked_${fileName}`;
    link.click();

    showMessage('图片已下载！', 'success');
  };

  const handleReset = () => {
    // 重置所有设置到默认值
    setWatermarkType('text');
    setWatermarkText('水印文字');
    setFontSize(48);
    setTextColor('#ffffff');
    setOpacity(50);
    setFontFamily('Arial');
    setFontWeight(400);
    setRotation(0);
    setWatermarkImageUrl('');
    setWatermarkImageSize(100);
    setWatermarkX(90);
    setWatermarkY(90);
    showMessage('已重置为默认设置', 'success');
  };

  const handleClear = () => {
    setOriginalImage('');
    setWatermarkedImage('');
    setFileName('');
    handleReset();
  };

  return (
    <Container maxWidth="lg">
      <ToolDetailHeader
        title="图片水印"
        description="为图片添加文字或图片水印，支持自定义样式和位置，所有处理都在浏览器本地完成"
        toolPath="/media/image/watermark"
      />


      {/* 上传图片（仅在未上传时显示） */}
      {!originalImage && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            上传图片
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <ImageUploadBox onFileSelect={handleFileSelect} />
        </Paper>
      )}

      {/* 已上传图片后显示紧凑的设置和预览 */}
      {originalImage && (
        <Grid container spacing={2}>
          {/* 左侧：水印设置 */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, position: 'sticky', top: 16 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  水印设置
                </Typography>
                <Box>
                  <Tooltip title="重新上传图片">
                    <IconButton size="small" onClick={() => setOriginalImage('')}>
                      <CloudUpload />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="重置设置">
                    <IconButton size="small" onClick={handleReset}>
                      <RestartAlt />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              {fileName && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  📄 {fileName}
                </Typography>
              )}

              <Stack spacing={3}>
                {/* 水印类型 */}
                <Box>
                  <Typography variant="body2" gutterBottom fontWeight={500}>
                    类型
                  </Typography>
                  <ToggleButtonGroup
                    value={watermarkType}
                    exclusive
                    onChange={(_, value) => value && setWatermarkType(value)}
                    fullWidth
                    size="small"
                  >
                    <ToggleButton value="text">
                      <TextFields sx={{ fontSize: 18, mr: 0.5 }} />
                      文字
                    </ToggleButton>
                    <ToggleButton value="image">
                      <ImageIcon sx={{ fontSize: 18, mr: 0.5 }} />
                      图片
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                {/* 文字水印设置 */}
                {watermarkType === 'text' && (
                  <>
                    <TextField
                      label="文字内容"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      fullWidth
                      size="small"
                    />

                    <FormControl fullWidth size="small">
                      <InputLabel>字体</InputLabel>
                      <Select
                        value={fontFamily}
                        onChange={(e: SelectChangeEvent) => setFontFamily(e.target.value)}
                        label="字体"
                      >
                        {fontOptions.map((font) => (
                          <MenuItem key={font.value} value={font.value}>
                            {font.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <ColorPicker
                      label="文字颜色"
                      value={textColor}
                      onChange={setTextColor}
                      fullWidth
                    />

                    <Box>
                      <Typography variant="body2" gutterBottom>
                        字号：<strong>{fontSize}px</strong>
                      </Typography>
                      <Slider
                        value={fontSize}
                        onChange={(_, value) => setFontSize(value as number)}
                        min={12}
                        max={200}
                        size="small"
                        valueLabelDisplay="auto"
                      />
                    </Box>

                    <FormControl fullWidth size="small">
                      <InputLabel>字重</InputLabel>
                      <Select
                        value={fontWeight}
                        onChange={(e: SelectChangeEvent<number>) => setFontWeight(Number(e.target.value))}
                        label="字重"
                      >
                        {fontWeightOptions.map((weight) => (
                          <MenuItem key={weight.value} value={weight.value}>
                            {weight.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </>
                )}

                {/* 图片水印设置 */}
                {watermarkType === 'image' && (
                  <>
                    {!watermarkImageUrl ? (
                      <Box>
                        <Typography variant="body2" gutterBottom fontWeight={500}>
                          上传水印图片
                        </Typography>
                        <ImageUploadBox onFileSelect={handleWatermarkImageSelect} />
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="body2" gutterBottom fontWeight={500}>
                          水印图片
                        </Typography>
                        <Box sx={{ textAlign: 'center', mb: 1 }}>
                          <img
                            src={watermarkImageUrl}
                            alt="Watermark"
                            style={{ maxWidth: '100%', maxHeight: 100, borderRadius: 4 }}
                          />
                        </Box>
                        <Button
                          size="small"
                          fullWidth
                          variant="outlined"
                          onClick={() => setWatermarkImageUrl('')}
                        >
                          更换图片
                        </Button>
                      </Box>
                    )}

                    {watermarkImageUrl && (
                      <Box>
                        <Typography variant="body2" gutterBottom>
                          大小：<strong>{watermarkImageSize}px</strong>
                        </Typography>
                        <Slider
                          value={watermarkImageSize}
                          onChange={(_, value) => setWatermarkImageSize(value as number)}
                          min={50}
                          max={500}
                          size="small"
                          valueLabelDisplay="auto"
                        />
                      </Box>
                    )}
                  </>
                )}

                {/* 透明度 */}
                <Box>
                  <Typography variant="body2" gutterBottom>
                    透明度：<strong>{opacity}%</strong>
                  </Typography>
                  <Slider
                    value={opacity}
                    onChange={(_, value) => setOpacity(value as number)}
                    min={0}
                    max={100}
                    size="small"
                    valueLabelDisplay="auto"
                  />
                </Box>

                {/* 旋转角度 */}
                <Box>
                  <Typography variant="body2" gutterBottom>
                    旋转角度：<strong>{rotation}°</strong>
                  </Typography>
                  <Slider
                    value={rotation}
                    onChange={(_, value) => setRotation(value as number)}
                    min={-180}
                    max={180}
                    step={1}
                    size="small"
                    valueLabelDisplay="auto"
                  />
                </Box>

                <Divider />

                {/* 位置设置 */}
                <FormControl fullWidth size="small">
                  <InputLabel>水印位置</InputLabel>
                  <Select
                    value={getCurrentPosition()}
                    onChange={(e: SelectChangeEvent) => handlePresetPosition(e.target.value as PresetPosition)}
                    label="水印位置"
                  >
                    {positionPresets.map((preset) => (
                      <MenuItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </MenuItem>
                    ))}
                    <MenuItem value="custom" disabled>
                      <em>自定义位置（拖动调整）</em>
                    </MenuItem>
                  </Select>
                </FormControl>

                <Divider />

                {/* 操作按钮 */}
                <Stack spacing={1}>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={handleDownload}
                    disabled={!watermarkedImage}
                    fullWidth
                  >
                    下载图片
                  </Button>
                  <Button variant="outlined" onClick={handleClear} fullWidth size="small">
                    清空重来
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Grid>

          {/* 右侧：预览区域（可拖动） */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                预览效果
                <Chip label="拖动调整位置" size="small" color="primary" sx={{ ml: 2 }} />
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box
                ref={previewRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                sx={{
                  border: '2px dashed',
                  borderColor: isDragging ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  p: 1,
                  textAlign: 'center',
                  bgcolor: 'background.default',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  position: 'relative',
                  transition: 'border-color 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
              >
                {watermarkedImage && (
                  <img
                    src={watermarkedImage}
                    alt="Watermarked"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 'calc(100vh - 250px)',
                      display: 'block',
                      margin: '0 auto',
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}
                  />
                )}
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                💡 提示：在图片上点击并拖动鼠标可调整水印位置
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Toast 提示 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

