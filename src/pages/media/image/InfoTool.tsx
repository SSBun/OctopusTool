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
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { ImageUploadBox } from '../../../components/ImageUploadBox';

interface ImageInfo {
  fileName: string;
  fileSize: number;
  fileType: string;
  width: number;
  height: number;
  aspectRatio: string;
  lastModified: string;
}

export const InfoTool: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [error, setError] = useState('');

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const calculateAspectRatio = (width: number, height: number): string => {
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(width, height);
    return `${width / divisor}:${height / divisor}`;
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageUrl(result);

      const img = new Image();
      img.onload = () => {
        const info: ImageInfo = {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          width: img.width,
          height: img.height,
          aspectRatio: calculateAspectRatio(img.width, img.height),
          lastModified: new Date(file.lastModified).toLocaleString('zh-CN'),
        };
        setImageInfo(info);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setImageUrl('');
    setImageInfo(null);
  };

  return (
    <Container maxWidth="lg">
      <ToolDetailHeader
        title="图片信息"
        description="查看图片的详细信息，包括尺寸、大小、格式等"
        toolPath="/media/image/info"
      />

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
      </Paper>

      {imageInfo && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              图片预览
            </Typography>
            <Divider sx={{ mb: 3 }} />

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
                src={imageUrl}
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: 500, display: 'block', margin: '0 auto' }}
              />
            </Box>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              详细信息
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Table>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, width: '30%' }}>文件名</TableCell>
                  <TableCell>{imageInfo.fileName}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>文件大小</TableCell>
                  <TableCell>
                    {formatSize(imageInfo.fileSize)} ({imageInfo.fileSize.toLocaleString()} 字节)
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>文件类型</TableCell>
                  <TableCell>{imageInfo.fileType}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>图片尺寸</TableCell>
                  <TableCell>
                    {imageInfo.width} x {imageInfo.height} 像素
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>宽高比</TableCell>
                  <TableCell>{imageInfo.aspectRatio}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>最后修改时间</TableCell>
                  <TableCell>{imageInfo.lastModified}</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
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

