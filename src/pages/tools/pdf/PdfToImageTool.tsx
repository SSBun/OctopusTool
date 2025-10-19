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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  LinearProgress,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import {
  Download,
  ZoomIn,
} from '@mui/icons-material';
import { PdfUploadBox } from '../../../components/PdfUploadBox';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs';

interface PageImage {
  pageNumber: number;
  dataUrl: string;
}

type ImageFormat = 'png' | 'jpeg';

export const PdfToImageTool: React.FC = () => {
  const [images, setImages] = useState<PageImage[]>([]);
  const [fileName, setFileName] = useState('');
  const [format, setFormat] = useState<ImageFormat>('png');
  const [quality, setQuality] = useState(0.95);
  const [scale, setScale] = useState(2);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileSelect = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('请选择 PDF 文件');
      return;
    }

    setFileName(file.name.replace('.pdf', ''));
    setError('');
    setImages([]);
    setProcessing(true);
    setProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument(arrayBuffer);
      const pdf = await loadingTask.promise;
      
      const totalPages = pdf.numPages;
      const pageImages: PageImage[] = [];

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        
        pageImages.push({
          pageNumber: pageNum,
          dataUrl,
        });

        setProgress((pageNum / totalPages) * 100);
      }

      setImages(pageImages);
      setSuccess(`成功转换 ${totalPages} 页！`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('转换失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setProcessing(false);
    }
  };

  const handleFormatChange = (event: SelectChangeEvent) => {
    setFormat(event.target.value as ImageFormat);
  };

  const handleDownloadSingle = (image: PageImage) => {
    const link = document.createElement('a');
    link.href = image.dataUrl;
    const ext = format === 'png' ? 'png' : 'jpg';
    link.download = `${fileName}_page_${image.pageNumber}.${ext}`;
    link.click();
  };

  const handleDownloadAll = () => {
    images.forEach((image, index) => {
      setTimeout(() => handleDownloadSingle(image), index * 100);
    });
    setSuccess('批量下载已启动！');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handlePreview = (dataUrl: string) => {
    setPreviewImage(dataUrl);
  };

  return (
    <Container maxWidth="lg">
      <ToolDetailHeader
        title="PDF 转图片"
        description="将 PDF 的每一页转换为图片格式"
        toolPath="/tools/pdf/to-image"
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
          上传 PDF
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>输出格式</InputLabel>
              <Select
                value={format}
                onChange={handleFormatChange}
                label="输出格式"
                disabled={processing}
              >
                <MenuItem value="png">PNG（无损）</MenuItem>
                <MenuItem value="jpeg">JPEG（压缩）</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>图片质量</InputLabel>
              <Select
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                label="图片质量"
                disabled={processing}
              >
                <MenuItem value={1}>标准（1x）</MenuItem>
                <MenuItem value={2}>高清（2x）</MenuItem>
                <MenuItem value={3}>超清（3x）</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {format === 'jpeg' && (
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>压缩质量</InputLabel>
                <Select
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  label="压缩质量"
                  disabled={processing}
                >
                  <MenuItem value={0.7}>低（70%）</MenuItem>
                  <MenuItem value={0.85}>中（85%）</MenuItem>
                  <MenuItem value={0.95}>高（95%）</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>

        <PdfUploadBox onFileSelect={handleFileSelect} />

        {processing && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              正在转换... {Math.round(progress)}%
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}
      </Paper>

      {images.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              转换结果 ({images.length} 页)
            </Typography>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleDownloadAll}
            >
              下载全部
            </Button>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            {images.map((image) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={image.pageNumber}>
                <Card>
                  <CardMedia
                    component="img"
                    image={image.dataUrl}
                    alt={`Page ${image.pageNumber}`}
                    sx={{
                      height: 200,
                      objectFit: 'contain',
                      bgcolor: 'grey.100',
                      cursor: 'pointer',
                    }}
                    onClick={() => handlePreview(image.dataUrl)}
                  />
                  <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      第 {image.pageNumber} 页
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handlePreview(image.dataUrl)}
                        title="预览"
                      >
                        <ZoomIn fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadSingle(image)}
                        title="下载"
                      >
                        <Download fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* 预览对话框 */}
      {previewImage && (
        <Box
          onClick={() => setPreviewImage('')}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            p: 2,
          }}
        >
          <img
            src={previewImage}
            alt="Preview"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />
        </Box>
      )}
    </Container>
  );
};

