import React, { useState } from 'react';
import {
Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  Divider,
  Grid,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  Stack,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import {
  Delete,
  Image as ImageIcon,
} from '@mui/icons-material';
import { PDFDocument } from 'pdf-lib';

interface ImageItem {
  id: number;
  file: File;
  url: string;
}

export const ImageToPdfTool: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const nextIdRef = React.useRef(1);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      setError('请选择图片文件');
      return;
    }

    const newImages = imageFiles.map(file => ({
      id: nextIdRef.current++,
      file,
      url: URL.createObjectURL(file),
    }));

    setImages(prev => [...prev, ...newImages]);
    setError('');
  };

  const handleDeleteImage = (id: number) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.url);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const handleGeneratePdf = async () => {
    if (images.length === 0) {
      setError('请先添加图片');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const pdfDoc = await PDFDocument.create();

      for (const image of images) {
        const arrayBuffer = await image.file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        let embeddedImage;
        if (image.file.type === 'image/png') {
          embeddedImage = await pdfDoc.embedPng(uint8Array);
        } else if (image.file.type === 'image/jpeg' || image.file.type === 'image/jpg') {
          embeddedImage = await pdfDoc.embedJpg(uint8Array);
        } else {
          // 对于其他格式，先转换为 PNG
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = image.url;
          });

          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0);
          
          const pngBlob = await new Promise<Blob>((resolve) => {
            canvas.toBlob(blob => resolve(blob!), 'image/png');
          });
          
          const pngArrayBuffer = await pngBlob.arrayBuffer();
          embeddedImage = await pdfDoc.embedPng(new Uint8Array(pngArrayBuffer));
        }

        const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: embeddedImage.width,
          height: embeddedImage.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'images_to_pdf.pdf';
      link.click();
      
      URL.revokeObjectURL(url);
      
      setSuccess(`成功生成 PDF（${images.length} 张图片）！`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('生成失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setProcessing(false);
    }
  };

  const handleClear = () => {
    images.forEach(img => URL.revokeObjectURL(img.url));
    setImages([]);
  };

  return (
    <Container maxWidth="lg">
      <ToolDetailHeader
        title="图片转 PDF"
        description="将多张图片合并为一个 PDF 文件"
        toolPath="/tools/pdf/image-to-pdf"
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
          添加图片
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box
          onClick={() => document.getElementById('image-file-input')?.click()}
          sx={{
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: 'background.paper',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
        >
          <input
            id="image-file-input"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          <Stack spacing={2} alignItems="center">
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'primary.main',
                color: 'white',
              }}
            >
              <ImageIcon sx={{ fontSize: 48 }} />
            </Box>
            <Typography variant="h6">点击或拖拽图片到此处</Typography>
            <Typography variant="body2" color="text.secondary">
              支持 JPG、PNG、GIF、WebP 等格式，可一次选择多张
            </Typography>
          </Stack>
        </Box>

        {images.length > 0 && (
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleGeneratePdf}
              disabled={processing}
              size="large"
            >
              {processing ? '生成中...' : `生成 PDF（${images.length} 张图片）`}
            </Button>
            <Button variant="outlined" onClick={handleClear}>
              清空
            </Button>
          </Stack>
        )}
      </Paper>

      {images.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            已添加的图片 ({images.length} 张)
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            {images.map((image, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
                <Card>
                  <CardMedia
                    component="img"
                    image={image.url}
                    alt={image.file.name}
                    sx={{
                      height: 200,
                      objectFit: 'contain',
                      bgcolor: 'grey.100',
                    }}
                  />
                  <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      第 {index + 1} 张
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteImage(image.id)}
                      title="删除"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Container>
  );
};

