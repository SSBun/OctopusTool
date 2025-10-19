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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { Download } from '@mui/icons-material';
import { ImageUploadBox } from '../../../components/ImageUploadBox';

type ImageFormat = 'jpeg' | 'png' | 'webp';

export const ConvertTool: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string>('');
  const [convertedImage, setConvertedImage] = useState<string>('');
  const [originalFormat, setOriginalFormat] = useState<string>('');
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('png');
  const [fileName, setFileName] = useState<string>('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    const format = file.type.split('/')[1];
    setFileName(file.name.split('.').slice(0, -1).join('.'));
    setOriginalFormat(format.toUpperCase());
    setError('');
    setConvertedImage('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setOriginalImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleFormatChange = (event: SelectChangeEvent) => {
    setTargetFormat(event.target.value as ImageFormat);
    setConvertedImage('');
  };

  const handleConvert = () => {
    if (!originalImage) {
      setError('请先选择图片');
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('转换失败');
        return;
      }

      ctx.drawImage(img, 0, 0);

      // 转换为目标格式
      const mimeType = `image/${targetFormat}`;
      const quality = targetFormat === 'jpeg' ? 0.92 : 1;
      const convertedDataUrl = canvas.toDataURL(mimeType, quality);

      setConvertedImage(convertedDataUrl);
      setSuccess(`成功转换为 ${targetFormat.toUpperCase()} 格式！`);
      setTimeout(() => setSuccess(''), 3000);
    };

    img.onerror = () => {
      setError('图片加载失败');
    };

    img.src = originalImage;
  };

  const handleDownload = () => {
    if (!convertedImage) return;

    const link = document.createElement('a');
    link.href = convertedImage;
    link.download = `${fileName}.${targetFormat}`;
    link.click();

    setSuccess('图片已下载！');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleClear = () => {
    setOriginalImage('');
    setConvertedImage('');
    setOriginalFormat('');
    setFileName('');
    setTargetFormat('png');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          图片格式转换
        </Typography>
        <Typography color="text.secondary" paragraph>
          支持 JPG、PNG、WebP 等格式互转，所有处理都在浏览器本地完成
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
              <strong>当前格式：</strong>{originalFormat}
            </Typography>
          </Alert>
        )}
      </Paper>

      {originalImage && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              转换设置
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>目标格式</InputLabel>
                <Select
                  value={targetFormat}
                  onChange={handleFormatChange}
                  label="目标格式"
                >
                  <MenuItem value="jpeg">JPEG (.jpg)</MenuItem>
                  <MenuItem value="png">PNG (.png)</MenuItem>
                  <MenuItem value="webp">WebP (.webp)</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                onClick={handleConvert}
                disabled={!originalImage}
              >
                开始转换
              </Button>
            </Stack>

            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                <strong>格式说明：</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                • JPEG：适合照片，文件较小，但不支持透明背景
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                • PNG：支持透明背景，适合图标和截图，文件较大
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                • WebP：新一代格式，文件小，质量高，但部分浏览器不支持
              </Typography>
            </Box>
          </Paper>

          {convertedImage && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                转换结果
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                {/* 原图 */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    原图 ({originalFormat})
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

                {/* 转换后 */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    转换后 ({targetFormat.toUpperCase()})
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
                      src={convertedImage}
                      alt="Converted"
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
                  disabled={!convertedImage}
                >
                  下载转换后图片
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

