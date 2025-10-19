import React, { useState, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Stack,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { Download, Crop } from '@mui/icons-material';
import { ImageUploadBox } from '../../../components/ImageUploadBox';

type AspectRatio = 'free' | '1:1' | '4:3' | '16:9' | '3:2' | '2:3';

export const CropTool: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string>('');
  const [croppedImage, setCroppedImage] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('free');
  const [fileName, setFileName] = useState<string>('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const aspectRatios = [
    { value: 'free', label: '自由裁剪' },
    { value: '1:1', label: '1:1 (正方形)' },
    { value: '4:3', label: '4:3 (标准)' },
    { value: '16:9', label: '16:9 (宽屏)' },
    { value: '3:2', label: '3:2 (照片)' },
    { value: '2:3', label: '2:3 (竖屏)' },
  ];

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    setFileName(file.name);
    setError('');
    setCroppedImage('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setOriginalImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleAspectRatioChange = (event: SelectChangeEvent) => {
    setAspectRatio(event.target.value as AspectRatio);
  };

  const handleCrop = () => {
    if (!originalImage) {
      setError('请先选择图片');
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current || document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('裁剪失败');
        return;
      }

      let cropWidth = img.width;
      let cropHeight = img.height;
      let offsetX = 0;
      let offsetY = 0;

      // 根据宽高比计算裁剪尺寸
      if (aspectRatio !== 'free') {
        const [ratioW, ratioH] = aspectRatio.split(':').map(Number);
        const imgRatio = img.width / img.height;
        const targetRatio = ratioW / ratioH;

        if (imgRatio > targetRatio) {
          // 图片更宽，裁剪宽度
          cropWidth = img.height * targetRatio;
          offsetX = (img.width - cropWidth) / 2;
        } else {
          // 图片更高，裁剪高度
          cropHeight = img.width / targetRatio;
          offsetY = (img.height - cropHeight) / 2;
        }
      }

      canvas.width = cropWidth;
      canvas.height = cropHeight;

      ctx.drawImage(
        img,
        offsetX,
        offsetY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      const croppedDataUrl = canvas.toDataURL('image/png');
      setCroppedImage(croppedDataUrl);
      setSuccess(`成功裁剪为 ${aspectRatio === 'free' ? '原始尺寸' : aspectRatio}！`);
      setTimeout(() => setSuccess(''), 3000);
    };

    img.onerror = () => {
      setError('图片加载失败');
    };

    img.src = originalImage;
  };

  const handleDownload = () => {
    if (!croppedImage) return;

    const link = document.createElement('a');
    link.href = croppedImage;
    link.download = `cropped_${fileName}`;
    link.click();

    setSuccess('图片已下载！');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleClear = () => {
    setOriginalImage('');
    setCroppedImage('');
    setFileName('');
    setAspectRatio('free');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          图片裁剪
        </Typography>
        <Typography color="text.secondary" paragraph>
          支持自由裁剪和按比例裁剪（1:1, 16:9, 4:3 等）
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
          </Alert>
        )}
      </Paper>

      {originalImage && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              裁剪设置
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel>宽高比</InputLabel>
                <Select
                  value={aspectRatio}
                  onChange={handleAspectRatioChange}
                  label="宽高比"
                >
                  {aspectRatios.map((ratio) => (
                    <MenuItem key={ratio.value} value={ratio.value}>
                      {ratio.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                startIcon={<Crop />}
                onClick={handleCrop}
                disabled={!originalImage}
              >
                开始裁剪
              </Button>

              <Typography variant="caption" color="text.secondary">
                提示：裁剪会从图片中心进行，保留最大可能的区域
              </Typography>
            </Stack>
          </Paper>

          {croppedImage && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                裁剪结果
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                {/* 原图 */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    原图
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

                {/* 裁剪后 */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    裁剪后 ({aspectRatio === 'free' ? '原始尺寸' : aspectRatio})
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
                      src={croppedImage}
                      alt="Cropped"
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
                  disabled={!croppedImage}
                >
                  下载裁剪后图片
                </Button>
                <Button variant="outlined" onClick={handleClear}>
                  清空
                </Button>
              </Stack>
            </Paper>
          )}
        </>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Container>
  );
};

