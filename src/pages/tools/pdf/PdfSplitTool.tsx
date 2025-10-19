import React, { useState } from 'react';
import {
Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  Divider,
  TextField,
  Stack,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { Download } from '@mui/icons-material';
import { PdfUploadBox } from '../../../components/PdfUploadBox';
import { PDFDocument } from 'pdf-lib';

type SplitMode = 'range' | 'single' | 'all';

export const PdfSplitTool: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [mode, setMode] = useState<SplitMode>('range');
  const [startPage, setStartPage] = useState('1');
  const [endPage, setEndPage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileSelect = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('请选择 PDF 文件');
      return;
    }

    setError('');
    setPdfFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPageCount();
      setNumPages(pages);
      setEndPage(pages.toString());
    } catch (err) {
      console.error(err);
      setError('无法读取 PDF 文件');
    }
  };

  const handleSplit = async () => {
    if (!pdfFile) {
      setError('请先上传 PDF 文件');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      if (mode === 'all') {
        // 按每一页拆分
        for (let i = 0; i < numPages; i++) {
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
          newPdf.addPage(copiedPage);

          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = `page_${i + 1}.pdf`;
          link.click();
          
          URL.revokeObjectURL(url);
        }
        setSuccess(`成功拆分为 ${numPages} 个文件！`);
      } else if (mode === 'single') {
        // 提取单页
        const pageNum = parseInt(startPage) - 1;
        if (pageNum < 0 || pageNum >= numPages) {
          setError('页码超出范围');
          return;
        }

        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum]);
        newPdf.addPage(copiedPage);

        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `page_${startPage}.pdf`;
        link.click();
        
        URL.revokeObjectURL(url);
        setSuccess(`成功提取第 ${startPage} 页！`);
      } else {
        // 提取范围
        const start = parseInt(startPage) - 1;
        const end = parseInt(endPage) - 1;

        if (start < 0 || end >= numPages || start > end) {
          setError('页码范围无效');
          return;
        }

        const newPdf = await PDFDocument.create();
        const pageIndices = Array.from({ length: end - start + 1 }, (_, i) => start + i);
        const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
        copiedPages.forEach(page => newPdf.addPage(page));

        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `pages_${startPage}_to_${endPage}.pdf`;
        link.click();
        
        URL.revokeObjectURL(url);
        setSuccess(`成功提取第 ${startPage}-${endPage} 页！`);
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('拆分失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <ToolDetailHeader
        title="PDF 拆分"
        description="提取 PDF 的指定页面或按页拆分"
        toolPath="/tools/pdf/split"
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

        <PdfUploadBox onFileSelect={handleFileSelect} />

        {numPages > 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>总页数：</strong>{numPages} 页
            </Typography>
          </Alert>
        )}
      </Paper>

      {numPages > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            拆分设置
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <RadioGroup value={mode} onChange={(e) => setMode(e.target.value as SplitMode)}>
            <FormControlLabel value="range" control={<Radio />} label="提取页面范围" />
            <FormControlLabel value="single" control={<Radio />} label="提取单页" />
            <FormControlLabel value="all" control={<Radio />} label="拆分为单页（每页一个文件）" />
          </RadioGroup>

          {mode === 'range' && (
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="起始页"
                type="number"
                value={startPage}
                onChange={(e) => setStartPage(e.target.value)}
                inputProps={{ min: 1, max: numPages }}
                sx={{ width: 150 }}
              />
              <TextField
                label="结束页"
                type="number"
                value={endPage}
                onChange={(e) => setEndPage(e.target.value)}
                inputProps={{ min: 1, max: numPages }}
                sx={{ width: 150 }}
              />
            </Stack>
          )}

          {mode === 'single' && (
            <TextField
              label="页码"
              type="number"
              value={startPage}
              onChange={(e) => setStartPage(e.target.value)}
              inputProps={{ min: 1, max: numPages }}
              sx={{ mt: 2, width: 150 }}
            />
          )}

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleSplit}
              disabled={processing}
              size="large"
              startIcon={<Download />}
            >
              {processing ? '处理中...' : '拆分 PDF'}
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

