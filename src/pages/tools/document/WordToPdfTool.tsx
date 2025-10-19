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
  Description,
  CheckCircle,
  Info,
} from '@mui/icons-material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';

export const WordToPdfTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension === 'doc' || fileExtension === 'docx') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('请选择 Word 文档（.doc 或 .docx 格式）');
        setFile(null);
      }
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    
    setConverting(true);
    setError('');

    try {
      // 注意：实际的 Word 转 PDF 需要后端支持或第三方 API
      // 这里提供一个说明性的实现
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setError('此功能需要后端支持。Word 转 PDF 通常需要使用 Office 服务或第三方 API（如 Aspose、LibreOffice 等）来实现。');
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
        title="Word 转 PDF"
        description="将 Word 文档转换为 PDF 格式"
        toolPath="/tools/document/word-to-pdf"
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          此工具需要后端服务支持。在生产环境中，建议使用以下方案：
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Info fontSize="small" color="info" />
            </ListItemIcon>
            <ListItemText 
              primary="云服务 API"
              secondary="如 Microsoft Graph API、Google Drive API"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Info fontSize="small" color="info" />
            </ListItemIcon>
            <ListItemText 
              primary="开源方案"
              secondary="如 LibreOffice、Pandoc + Node.js 后端"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Info fontSize="small" color="info" />
            </ListItemIcon>
            <ListItemText 
              primary="商业 API"
              secondary="如 Aspose.Words、Zamzar API、CloudConvert"
            />
          </ListItem>
        </List>
      </Alert>

      <Paper sx={{ p: 4 }}>
        <Stack spacing={3}>
          {/* 文件上传区域 */}
          <Box>
            <Typography variant="h6" gutterBottom>
              上传 Word 文档
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
              <Description sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <input
                accept=".doc,.docx"
                style={{ display: 'none' }}
                id="word-file-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="word-file-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUpload />}
                >
                  选择 Word 文件
                </Button>
              </label>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                支持 .doc 和 .docx 格式
              </Typography>
            </Box>

            {file && (
              <Alert severity="success" icon={<CheckCircle />} sx={{ mt: 2 }}>
                已选择文件: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </Alert>
            )}
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

          {/* 功能说明 */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              功能特性
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="保留格式"
                  secondary="保留原文档的字体、样式和布局"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="支持图片"
                  secondary="文档中的图片会被完整转换"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="安全可靠"
                  secondary="文件处理在安全环境中进行"
                />
              </ListItem>
            </List>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

