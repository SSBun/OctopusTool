import React, { useState } from 'react';
import {
Container,
  Typography,
  Box,
  Paper,
  Button,
  Stack,
  Slider,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { Download } from '@mui/icons-material';
import { ImageUploadBox } from '../../../components/ImageUploadBox';

export const CompressTool: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string>('');
  const [compressedImage, setCompressedImage] = useState<string>('');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [quality, setQuality] = useState<number>(80);
  const [fileName, setFileName] = useState<string>('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    setFileName(file.name);
    setOriginalSize(file.size);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setOriginalImage(result);
      compressImage(result, quality);
    };
    reader.readAsDataURL(file);
  };

  const compressImage = (imageDataUrl: string, qualityValue: number) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      // 压缩图片
      const compressedDataUrl = canvas.toDataURL('image/jpeg', qualityValue / 100);
      setCompressedImage(compressedDataUrl);

      // 计算压缩后大小
      const base64Length = compressedDataUrl.split(',')[1].length;
      const padding = (compressedDataUrl.split(',')[1].match(/=/g) || []).length;
      const size = (base64Length * 3) / 4 - padding;
      setCompressedSize(size);
    };
    img.src = imageDataUrl;
  };

  const handleQualityChange = (_event: Event, newValue: number | number[]) => {
    const newQuality = newValue as number;
    setQuality(newQuality);
    if (originalImage) {
      compressImage(originalImage, newQuality);
    }
  };

  const handleDownload = () => {
    if (!compressedImage) return;

    const link = document.createElement('a');
    link.href = compressedImage;
    link.download = `compressed_${fileName}`;
    link.click();

    setSuccess('图片已下载！');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleClear = () => {
    setOriginalImage('');
    setCompressedImage('');
    setOriginalSize(0);
    setCompressedSize(0);
    setFileName('');
    setQuality(80);
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const compressionRatio = originalSize > 0 ? ((1 - compressedSize / originalSize) * 100).toFixed(1) : '0';

  return (
    <Container maxWidth="lg">
      <ToolDetailHeader
        title="图片压缩"
        description="在线压缩图片大小，支持自定义质量，所有处理都在浏览器本地完成，安全可靠"
        toolPath="/media/image/compress"
      />

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
              压缩设置
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ px: 2 }}>
              <Typography gutterBottom>
                压缩质量：<strong>{quality}%</strong>
              </Typography>
              <Slider
                value={quality}
                onChange={handleQualityChange}
                min={1}
                max={100}
                marks={[
                  { value: 1, label: '1%' },
                  { value: 50, label: '50%' },
                  { value: 100, label: '100%' },
                ]}
                valueLabelDisplay="auto"
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                提示：质量越低，文件越小，但画质会下降
              </Typography>
            </Box>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                压缩结果
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  label={`压缩率: ${compressionRatio}%`}
                  color="success"
                  size="small"
                />
              </Stack>
            </Box>
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
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  大小：{formatSize(originalSize)}
                </Typography>
              </Box>

              {/* 压缩后 */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  压缩后
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
                    src={compressedImage}
                    alt="Compressed"
                    style={{ maxWidth: '100%', maxHeight: 400, display: 'block', margin: '0 auto' }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  大小：{formatSize(compressedSize)}
                  <Typography component="span" color="success.main" sx={{ ml: 1 }}>
                    (减小 {formatSize(originalSize - compressedSize)})
                  </Typography>
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleDownload}
                disabled={!compressedImage}
              >
                下载压缩后图片
              </Button>
              <Button variant="outlined" onClick={handleClear}>
                清空
              </Button>
            </Stack>
          </Paper>
        </>
      )}
    </Container>
  );
};

