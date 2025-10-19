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
  Tabs,
  Tab,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { ContentCopy, Download } from '@mui/icons-material';
import { ImageUploadBox } from '../../../components/ImageUploadBox';

export const Base64Tool: React.FC = () => {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [imageFile, setImageFile] = useState<string>('');
  const [base64String, setBase64String] = useState<string>('');
  const [decodedImage, setDecodedImage] = useState<string>('');
  const [fileName, setFileName] = useState<string>('image.png');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    setFileName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageFile(result);
      setBase64String(result);
      setSuccess('图片已转换为 Base64！');
      setTimeout(() => setSuccess(''), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleBase64Change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBase64String(event.target.value);
    setDecodedImage('');
  };

  const handleDecode = () => {
    if (!base64String.trim()) {
      setError('请输入 Base64 字符串');
      return;
    }

    try {
      // 验证是否是有效的 Base64 图片
      if (!base64String.startsWith('data:image/')) {
        setError('请输入有效的图片 Base64 字符串（需要以 data:image/ 开头）');
        return;
      }

      setDecodedImage(base64String);
      setSuccess('Base64 已解码为图片！');
      setTimeout(() => setSuccess(''), 3000);
      setError('');
    } catch (err) {
      setError('Base64 解码失败');
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('已复制到剪贴板！');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('复制失败');
    }
  };

  const handleDownload = () => {
    if (!decodedImage) return;

    const link = document.createElement('a');
    link.href = decodedImage;
    link.download = fileName;
    link.click();

    setSuccess('图片已下载！');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleClear = () => {
    setImageFile('');
    setBase64String('');
    setDecodedImage('');
    setFileName('image.png');
  };

  return (
    <Container maxWidth="lg">
      <ToolDetailHeader
        title="Base64 转换"
        description="图片与 Base64 编码互相转换，方便在网页中嵌入图片"
        toolPath="/media/image/base64"
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

      <Paper sx={{ p: 2, mb: 3 }}>
        <Tabs value={mode === 'encode' ? 0 : 1} onChange={(_, v) => setMode(v === 0 ? 'encode' : 'decode')}>
          <Tab label="图片转 Base64" />
          <Tab label="Base64 转图片" />
        </Tabs>
      </Paper>

      {/* 图片转 Base64 */}
      {mode === 'encode' && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              上传图片
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <ImageUploadBox onFileSelect={handleFileSelect} />

            {imageFile && (
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'success.main',
                  borderRadius: 1,
                  p: 2,
                  textAlign: 'center',
                  bgcolor: 'background.default',
                  mt: 2,
                }}
              >
                <img
                  src={imageFile}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: 300, display: 'block', margin: '0 auto' }}
                />
              </Box>
            )}
          </Paper>

          {base64String && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Base64 结果
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ContentCopy />}
                  onClick={() => handleCopy(base64String)}
                >
                  复制
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <TextField
                fullWidth
                multiline
                rows={10}
                value={base64String}
                InputProps={{ readOnly: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                  },
                }}
              />

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button variant="outlined" onClick={handleClear}>
                  清空
                </Button>
              </Stack>
            </Paper>
          )}
        </>
      )}

      {/* Base64 转图片 */}
      {mode === 'decode' && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              输入 Base64
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2}>
              <TextField
                fullWidth
                multiline
                rows={10}
                value={base64String}
                onChange={handleBase64Change}
                placeholder="粘贴 Base64 字符串（以 data:image/ 开头）"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                  },
                }}
              />

              <Button
                variant="contained"
                onClick={handleDecode}
                disabled={!base64String.trim()}
              >
                解码为图片
              </Button>
            </Stack>
          </Paper>

          {decodedImage && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                解码结果
              </Typography>
              <Divider sx={{ mb: 3 }} />

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
                  src={decodedImage}
                  alt="Decoded"
                  style={{ maxWidth: '100%', maxHeight: 400, display: 'block', margin: '0 auto' }}
                />
              </Box>

              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={handleDownload}
                >
                  下载图片
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

