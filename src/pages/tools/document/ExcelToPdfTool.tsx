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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  CloudUpload,
  Download,
  TableChart,
  CheckCircle,
} from '@mui/icons-material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';

export const ExcelToPdfTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');
  const [options, setOptions] = useState({
    fitToPage: true,
    includeGridlines: false,
    landscapeMode: false,
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension === 'xls' || fileExtension === 'xlsx') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('请选择 Excel 文件（.xls 或 .xlsx 格式）');
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
      
      setError('此功能需要后端支持。Excel 转 PDF 可使用 Apache POI、ExcelJS + PDFKit 或商业 API 实现。');
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
        title="Excel 转 PDF"
        description="将 Excel 表格转换为 PDF 格式"
        toolPath="/tools/document/excel-to-pdf"
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          推荐的实现方案：
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText 
              primary="• Node.js: ExcelJS + PDFKit / Puppeteer"
              secondary="开源免费方案"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="• Python: openpyxl + ReportLab"
              secondary="适合批量处理"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="• 商业 API: Aspose.Cells、CloudConvert"
              secondary="企业级方案"
            />
          </ListItem>
        </List>
      </Alert>

      <Paper sx={{ p: 4 }}>
        <Stack spacing={3}>
          {/* 文件上传 */}
          <Box>
            <Typography variant="h6" gutterBottom>
              上传 Excel 文件
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
              <TableChart sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <input
                accept=".xls,.xlsx"
                style={{ display: 'none' }}
                id="excel-file-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="excel-file-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUpload />}
                >
                  选择 Excel 文件
                </Button>
              </label>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                支持 .xls 和 .xlsx 格式
              </Typography>
            </Box>

            {file && (
              <Alert severity="success" icon={<CheckCircle />} sx={{ mt: 2 }}>
                已选择文件: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </Alert>
            )}
          </Box>

          {/* 转换选项 */}
          <Box>
            <Typography variant="h6" gutterBottom>
              转换选项
            </Typography>
            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.fitToPage}
                    onChange={(e) => setOptions({ ...options, fitToPage: e.target.checked })}
                  />
                }
                label="自适应页面大小"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeGridlines}
                    onChange={(e) => setOptions({ ...options, includeGridlines: e.target.checked })}
                  />
                }
                label="包含网格线"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.landscapeMode}
                    onChange={(e) => setOptions({ ...options, landscapeMode: e.target.checked })}
                  />
                }
                label="横向模式"
              />
            </Stack>
          </Box>

          {/* 操作按钮 */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleConvert}
              disabled={!file || converting}
              fullWidth
            >
              {converting ? '转换中...' : '转换为 PDF'}
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
        </Stack>
      </Paper>
    </Container>
  );
};

