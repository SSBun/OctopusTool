import React, { useState } from 'react';
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
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import { Download } from '@mui/icons-material';
import { ImageUploadBox } from '../../../components/ImageUploadBox';

export const ResizeTool: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string>('');
  const [resizedImage, setResizedImage] = useState<string>('');
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [maintainAspect, setMaintainAspect] = useState<boolean>(true);
  const [presetSize, setPresetSize] = useState<string>('custom');
  const [fileName, setFileName] = useState<string>('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const presetSizes = [
    { value: 'custom', label: '自定义' },
    { value: '1920x1080', label: '1920x1080 (Full HD)' },
    { value: '1280x720', label: '1280x720 (HD)' },
    { value: '800x600', label: '800x600' },
    { value: '640x480', label: '640x480' },
    { value: '320x240', label: '320x240' },
  ];

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    setFileName(file.name);
    setError('');
    setResizedImage('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setOriginalWidth(img.width);
        setOriginalHeight(img.height);
        setWidth(img.width.toString());
        setHeight(img.height.toString());
        setOriginalImage(result);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handlePresetChange = (event: SelectChangeEvent) => {
    const preset = event.target.value;
    setPresetSize(preset);

    if (preset !== 'custom') {
      const [w, h] = preset.split('x').map(Number);
      setWidth(w.toString());
      setHeight(h.toString());
    }
  };

  const handleWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = event.target.value;
    setWidth(newWidth);
    setPresetSize('custom');

    if (maintainAspect && originalWidth && originalHeight) {
      const aspectRatio = originalWidth / originalHeight;
      const newHeight = Math.round(parseInt(newWidth) / aspectRatio);
      if (!isNaN(newHeight)) {
        setHeight(newHeight.toString());
      }
    }
  };

  const handleHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = event.target.value;
    setHeight(newHeight);
    setPresetSize('custom');

    if (maintainAspect && originalWidth && originalHeight) {
      const aspectRatio = originalWidth / originalHeight;
      const newWidth = Math.round(parseInt(newHeight) * aspectRatio);
      if (!isNaN(newWidth)) {
        setWidth(newWidth.toString());
      }
    }
  };

  const handleResize = () => {
    if (!originalImage) {
      setError('请先选择图片');
      return;
    }

    const targetWidth = parseInt(width);
    const targetHeight = parseInt(height);

    if (isNaN(targetWidth) || isNaN(targetHeight) || targetWidth <= 0 || targetHeight <= 0) {
      setError('请输入有效的宽度和高度');
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('缩放失败');
        return;
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const resizedDataUrl = canvas.toDataURL('image/png');
      setResizedImage(resizedDataUrl);
      setSuccess(`成功缩放为 ${targetWidth}x${targetHeight}！`);
      setTimeout(() => setSuccess(''), 3000);
    };

    img.onerror = () => {
      setError('图片加载失败');
    };

    img.src = originalImage;
  };

  const handleDownload = () => {
    if (!resizedImage) return;

    const link = document.createElement('a');
    link.href = resizedImage;
    link.download = `resized_${width}x${height}_${fileName}`;
    link.click();

    setSuccess('图片已下载！');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleClear = () => {
    setOriginalImage('');
    setResizedImage('');
    setOriginalWidth(0);
    setOriginalHeight(0);
    setWidth('');
    setHeight('');
    setFileName('');
    setPresetSize('custom');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          图片缩放
        </Typography>
        <Typography color="text.secondary" paragraph>
          调整图片尺寸，支持按比例缩放和自定义尺寸
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          上传图片
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <ImageUploadBox onFileSelect={handleFileSelect} />

        {fileName && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>文件名：</strong>{fileName}
            </Typography>
            <Typography variant="body2">
              <strong>原始尺寸：</strong>{originalWidth} x {originalHeight} 像素
            </Typography>
          </Alert>
        )}
      </Paper>

      {originalImage && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              缩放设置
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel>预设尺寸</InputLabel>
                <Select
                  value={presetSize}
                  onChange={handlePresetChange}
                  label="预设尺寸"
                >
                  {presetSizes.map((preset) => (
                    <MenuItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack direction="row" spacing={2}>
                <TextField
                  label="宽度"
                  type="number"
                  value={width}
                  onChange={handleWidthChange}
                  fullWidth
                  InputProps={{ inputProps: { min: 1 } }}
                />
                <TextField
                  label="高度"
                  type="number"
                  value={height}
                  onChange={handleHeightChange}
                  fullWidth
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Stack>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={maintainAspect}
                    onChange={(e) => setMaintainAspect(e.target.checked)}
                  />
                }
                label="保持宽高比"
              />

              <Button
                variant="contained"
                onClick={handleResize}
                disabled={!originalImage || !width || !height}
              >
                开始缩放
              </Button>
            </Stack>
          </Paper>

          {resizedImage && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                缩放结果
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                {/* 原图 */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    原图 ({originalWidth}x{originalHeight})
                  </Typography>
                  <Box
                    sx={{
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 2,
                      textAlign: 'center',
                      bgcolor: 'background.default',
                    }}
                  >
                    <img
                      src={originalImage}
                      alt="Original"
                      style={{ maxWidth: '100%', maxHeight: 400, display: 'block', margin: '0 auto' }}
                    />
                  </Box>
                </Box>

                {/* 缩放后 */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    缩放后 ({width}x{height})
                  </Typography>
                  <Box
                    sx={{
                      border: '2px dashed',
                      borderColor: 'success.main',
                      borderRadius: 1,
                      p: 2,
                      textAlign: 'center',
                      bgcolor: 'background.default',
                    }}
                  >
                    <img
                      src={resizedImage}
                      alt="Resized"
                      style={{ maxWidth: '100%', maxHeight: 400, display: 'block', margin: '0 auto' }}
                    />
                  </Box>
                </Box>
              </Stack>

              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={handleDownload}
                  disabled={!resizedImage}
                >
                  下载缩放后图片
                </Button>
                <Button variant="outlined" onClick={handleClear}>
                  清空
                </Button>
              </Stack>
            </Paper>
          )}
        </>
      )}
    </Container>
  );
};

