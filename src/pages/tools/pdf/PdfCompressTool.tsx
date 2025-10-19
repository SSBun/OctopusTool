import React, { useState } from 'react';
import {
Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  LinearProgress,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { Download } from '@mui/icons-material';
import { PdfUploadBox } from '../../../components/PdfUploadBox';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs';

export const PdfCompressTool: React.FC = () => {
  const [fileName, setFileName] = useState('');
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [quality, setQuality] = useState(0.7);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const handleQualityChange = (event: SelectChangeEvent) => {
    setQuality(Number(event.target.value));
  };

  const handleFileSelect = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('请选择 PDF 文件');
      return;
    }

    setFileName(file.name);
    setOriginalSize(file.size);
    setError('');
    setCompressedSize(0);
    setPdfUrl('');
    setProcessing(true);
    setProgress(0);

    try {
      // 读取原始 PDF
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument(arrayBuffer);
      const pdf = await loadingTask.promise;
      
      // 创建新的 PDF
      const pdfDoc = await PDFDocument.create();
      const totalPages = pdf.numPages;

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        
        // 渲染到 Canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        // 转换为 JPEG（压缩）
        const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
        const jpegData = jpegDataUrl.split(',')[1];
        const jpegBytes = Uint8Array.from(atob(jpegData), c => c.charCodeAt(0));

        // 嵌入压缩后的图片
        const embeddedImage = await pdfDoc.embedJpg(jpegBytes);
        const pdfPage = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
        pdfPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: embeddedImage.width,
          height: embeddedImage.height,
        });

        setProgress((pageNum / totalPages) * 100);
      }

      // 保存压缩后的 PDF
      const compressedPdfBytes = await pdfDoc.save();
      setCompressedSize(compressedPdfBytes.length);
      
      const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      const reduction = ((1 - compressedPdfBytes.length / file.size) * 100).toFixed(1);
      setSuccess(`压缩完成！减小了 ${reduction}%`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('压缩失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName.replace('.pdf', '_compressed.pdf');
    link.click();
  };

  return (
    <Container maxWidth="lg">
      <ToolDetailHeader
        title="PDF 压缩"
        description="通过压缩图片质量来减小 PDF 文件大小"
        toolPath="/tools/pdf/compress"
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
          压缩设置
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>压缩质量</InputLabel>
          <Select
            value={quality.toString()}
            onChange={handleQualityChange}
            label="压缩质量"
            disabled={processing}
          >
            <MenuItem value="0.5">高压缩（50%）- 文件最小</MenuItem>
            <MenuItem value="0.7">中等压缩（70%）- 推荐</MenuItem>
            <MenuItem value="0.85">轻度压缩（85%）- 质量优先</MenuItem>
          </Select>
        </FormControl>

        <PdfUploadBox onFileSelect={handleFileSelect} />

        {processing && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              正在压缩... {Math.round(progress)}%
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}
      </Paper>

      {compressedSize > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            压缩结果
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              原始大小: <strong>{formatSize(originalSize)}</strong>
            </Typography>
            <Typography variant="body1" gutterBottom>
              压缩后大小: <strong>{formatSize(compressedSize)}</strong>
            </Typography>
            <Typography variant="body1" color="success.main" fontWeight={600}>
              减小了: {((1 - compressedSize / originalSize) * 100).toFixed(1)}%
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleDownload}
            size="large"
          >
            下载压缩后的 PDF
          </Button>
        </Paper>
      )}

      <Alert severity="info">
        <Typography variant="caption">
          💡 <strong>提示：</strong>压缩通过将 PDF 中的图片转换为 JPEG 格式来减小文件大小。
          如果您的 PDF 主要包含文本，压缩效果可能不明显。
        </Typography>
      </Alert>
    </Container>
  );
};

