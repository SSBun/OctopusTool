import React, { useState } from 'react';
import {
Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Stack,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import {
  Delete,
  ArrowUpward,
  ArrowDownward,
  Add,
} from '@mui/icons-material';
import { PDFDocument } from 'pdf-lib';

interface PdfFile {
  id: number;
  file: File;
  numPages: number;
}

export const PdfMergeTool: React.FC = () => {
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const nextIdRef = React.useRef(1);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const pdfFilesOnly = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFilesOnly.length === 0) {
      setError('请选择 PDF 文件');
      return;
    }

    setError('');

    // 获取每个PDF的页数
    const newPdfFiles: PdfFile[] = [];
    for (const file of pdfFilesOnly) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        newPdfFiles.push({
          id: nextIdRef.current++,
          file,
          numPages: pdfDoc.getPageCount(),
        });
      } catch (err) {
        console.error(`无法读取 ${file.name}:`, err);
      }
    }

    setPdfFiles(prev => [...prev, ...newPdfFiles]);
  };

  const handleDelete = (id: number) => {
    setPdfFiles(prev => prev.filter(pdf => pdf.id !== id));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setPdfFiles(prev => {
      const newFiles = [...prev];
      [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
      return newFiles;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === pdfFiles.length - 1) return;
    setPdfFiles(prev => {
      const newFiles = [...prev];
      [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
      return newFiles;
    });
  };

  const handleMerge = async () => {
    if (pdfFiles.length < 2) {
      setError('请至少添加 2 个 PDF 文件');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const mergedPdf = await PDFDocument.create();

      for (const pdfFile of pdfFiles) {
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged.pdf';
      link.click();
      
      URL.revokeObjectURL(url);
      
      setSuccess(`成功合并 ${pdfFiles.length} 个 PDF 文件！`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('合并失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setProcessing(false);
    }
  };

  const totalPages = pdfFiles.reduce((sum, pdf) => sum + pdf.numPages, 0);

  return (
    <Container maxWidth="lg">
      <ToolDetailHeader
        title="PDF 合并"
        description="将多个 PDF 文件合并为一个，可调整顺序"
        toolPath="/tools/pdf/merge"
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
          添加 PDF 文件
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => document.getElementById('pdf-merge-input')?.click()}
          size="large"
        >
          选择 PDF 文件
        </Button>

        <input
          id="pdf-merge-input"
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {pdfFiles.length > 0 && (
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleMerge}
              disabled={processing || pdfFiles.length < 2}
              size="large"
            >
              {processing ? '合并中...' : `合并 PDF（${pdfFiles.length} 个文件，共 ${totalPages} 页）`}
            </Button>
            <Button variant="outlined" onClick={() => setPdfFiles([])}>
              清空
            </Button>
          </Stack>
        )}
      </Paper>

      {pdfFiles.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            文件列表 ({pdfFiles.length} 个)
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <List>
            {pdfFiles.map((pdf, index) => (
              <ListItem
                key={pdf.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                }}
                secondaryAction={
                  <Box>
                    <IconButton
                      edge="end"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <ArrowUpward />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === pdfFiles.length - 1}
                    >
                      <ArrowDownward />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(pdf.id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={`${index + 1}. ${pdf.file.name}`}
                  secondary={`${pdf.numPages} 页`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
};

