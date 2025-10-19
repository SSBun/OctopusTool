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
  ListItemText,
} from '@mui/material';
import {
  CloudUpload,
  Download,
  PictureAsPdf,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';

export const PdfToExcelTool: React.FC = () => {
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
      
      setError('此功能需要后端支持。PDF 转 Excel 通常使用 Tabula (Python)、Camelot 或专业的表格识别 API。');
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
        title="PDF 转 Excel"
        description="将 PDF 表格转换为 Excel 格式"
        toolPath="/tools/document/pdf-to-excel"
      />

      <Alert severity="warning" sx={{ mb: 3 }} icon={<Warning />}>
        <Typography variant="body2" gutterBottom>
          <strong>重要提示：</strong>
        </Typography>
        <Typography variant="body2">
          PDF 转 Excel 的转换质量取决于 PDF 中表格的结构。包含清晰表格边框的 PDF 转换效果最佳。
          扫描版 PDF 需要先进行 OCR 识别。
        </Typography>
      </Alert>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" gutterBottom>
          <strong>推荐实现方案：</strong>
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText 
              primary="• Python: Tabula-py"
              secondary="专门用于提取 PDF 表格，基于 Java Tabula"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="• Python: Camelot"
              secondary="高精度表格提取，支持复杂表格"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="• 商业 API: Adobe PDF Services、Aspose.PDF"
              secondary="支持复杂表格和多种格式"
            />
          </ListItem>
        </List>
      </Alert>

      <Paper sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              上传包含表格的 PDF 文件
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
                id="pdf-to-excel-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="pdf-to-excel-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUpload />}
                >
                  选择 PDF 文件
                </Button>
              </label>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                最适合包含表格的 PDF 文档
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
              {converting ? '转换中...' : '转换为 Excel'}
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
              转换建议
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="✓ 适合的 PDF 类型"
                  secondary="包含清晰表格边框的 PDF，财务报表、数据统计表等"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="✗ 不适合的 PDF 类型"
                  secondary="纯文本 PDF、图片扫描件（需先 OCR）、复杂多栏布局"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="转换后处理"
                  secondary="建议在 Excel 中检查数据对齐和格式，必要时手动调整"
                />
              </ListItem>
            </List>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

