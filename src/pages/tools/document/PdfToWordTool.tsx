import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  LinearProgress,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CloudUpload,
  Download,
  PictureAsPdf,
  CheckCircle,
  Description,
} from '@mui/icons-material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';

export const PdfToWordTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension === 'pdf') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('请选择 PDF 文件');
        setFile(null);
      }
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    
    setConverting(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setError('此功能需要后端支持。PDF 转 Word 可使用 pdf2docx (Python)、Apache PDFBox + POI 或商业 API 实现。');
    } catch (err) {
      setError('转换失败，请重试');
    } finally {
      setConverting(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setError('');
  };

  return (
    <Container maxWidth="lg">
      <ToolDetailHeader
        title="PDF 转 Word"
        description="将 PDF 文档转换为可编辑的 Word 格式"
        toolPath="/tools/document/pdf-to-word"
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" gutterBottom>
          <strong>推荐实现方案：</strong>
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText 
              primary="• Python: pdf2docx 库"
              secondary="开源方案，适合文本密集型 PDF"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="• Java: Apache PDFBox + POI"
              secondary="企业级开源方案"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="• 商业 API: Adobe PDF Services、Aspose.PDF"
              secondary="转换质量最佳，支持复杂布局"
            />
          </ListItem>
        </List>
      </Alert>

      <Paper sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              上传 PDF 文件
            </Typography>
            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                bgcolor: 'background.default',
              }}
            >
              <PictureAsPdf sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
              <input
                accept=".pdf"
                style={{ display: 'none' }}
                id="pdf-file-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="pdf-file-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUpload />}
                >
                  选择 PDF 文件
                </Button>
              </label>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                支持标准 PDF 格式
              </Typography>
            </Box>

            {file && (
              <Alert severity="success" icon={<CheckCircle />} sx={{ mt: 2 }}>
                已选择文件: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </Alert>
            )}
          </Box>

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleConvert}
              disabled={!file || converting}
              fullWidth
            >
              {converting ? '转换中...' : '转换为 Word'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleClear}
              disabled={converting}
            >
              清空
            </Button>
          </Stack>

          {converting && <LinearProgress />}

          {error && (
            <Alert severity="warning">
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              转换说明
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Description color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="文本识别"
                  secondary="自动识别 PDF 中的文本内容"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Description color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="格式保留"
                  secondary="尽可能保留原始格式和布局"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Description color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="图片提取"
                  secondary="PDF 中的图片会被提取并嵌入 Word"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Description color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="可编辑性"
                  secondary="转换后的 Word 文档完全可编辑"
                />
              </ListItem>
            </List>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

