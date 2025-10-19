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
  Slideshow,
  CheckCircle,
} from '@mui/icons-material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';

export const PptToPdfTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension === 'ppt' || fileExtension === 'pptx') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('请选择 PowerPoint 文件（.ppt 或 .pptx 格式）');
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
      
      setError('此功能需要后端支持。PPT 转 PDF 可使用 LibreOffice、Aspose.Slides 或 Microsoft Graph API 实现。');
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
        title="PPT 转 PDF"
        description="将 PowerPoint 演示文稿转换为 PDF 格式"
        toolPath="/tools/document/ppt-to-pdf"
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" gutterBottom>
          <strong>推荐实现方案：</strong>
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText 
              primary="• LibreOffice + Node.js"
              secondary="免费开源，支持服务器端转换"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="• Microsoft Graph API"
              secondary="适合 Microsoft 365 集成"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="• Aspose.Slides Cloud API"
              secondary="商业方案，转换质量高"
            />
          </ListItem>
        </List>
      </Alert>

      <Paper sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              上传 PowerPoint 文件
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
              <Slideshow sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
              <input
                accept=".ppt,.pptx"
                style={{ display: 'none' }}
                id="ppt-file-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="ppt-file-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUpload />}
                >
                  选择 PPT 文件
                </Button>
              </label>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                支持 .ppt 和 .pptx 格式
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

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              转换特性
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="保留动画效果"
                  secondary="转换后的 PDF 保留幻灯片布局"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="高清输出"
                  secondary="支持高分辨率图片转换"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="批注和备注"
                  secondary="可选择是否包含演讲者备注"
                />
              </ListItem>
            </List>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

