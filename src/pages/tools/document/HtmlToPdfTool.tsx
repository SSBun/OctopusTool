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
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormControlLabel,
  Checkbox,
  Grid,
} from '@mui/material';
import {
  Download,
  Code,
  CheckCircle,
  PictureAsPdf,
} from '@mui/icons-material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { convertHtmlToPdf, downloadBlob } from '../../../services/pdfConversionService';

export const HtmlToPdfTool: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>示例网页</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
        }
        h1 { color: #333; }
        p { line-height: 1.6; }
    </style>
</head>
<body>
    <h1>欢迎使用 HTML 转 PDF</h1>
    <p>这是一个示例页面，你可以编辑 HTML 内容并转换为 PDF。</p>
    <h2>功能特性</h2>
    <ul>
        <li>支持完整的 CSS 样式</li>
        <li>支持自定义字体</li>
        <li>支持图片（需要 Base64 或同源）</li>
    </ul>
</body>
</html>`);
  const [url, setUrl] = useState('');
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mode, setMode] = useState<'html' | 'url'>('html');
  const [options, setOptions] = useState({
    landscape: false,
    includeBackground: true,
    margin: true,
  });

  const handleConvert = async () => {
    if (mode === 'html' && !htmlContent.trim()) {
      setError('请输入 HTML 内容');
      return;
    }
    if (mode === 'url' && !url.trim()) {
      setError('请输入 URL 地址');
      return;
    }
    
    setConverting(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'url') {
        setError('URL 转换模式需要后端支持。请使用 HTML 代码模式。');
        return;
      }

      // 使用纯前端方案转换
      const pdfBlob = await convertHtmlToPdf(htmlContent, options);
      
      // 下载 PDF
      downloadBlob(pdfBlob, 'document.pdf');
      
      setSuccess('转换成功！PDF 已开始下载。');
    } catch (err) {
      setError('转换失败: ' + (err as Error).message);
    } finally {
      setConverting(false);
    }
  };

  const handleClear = () => {
    if (mode === 'html') {
      setHtmlContent('');
    } else {
      setUrl('');
    }
    setError('');
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader
        title="HTML 转 PDF"
        description="将网页 HTML 转换为 PDF 格式"
        toolPath="/tools/document/html-to-pdf"
      />

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>✨ 纯前端实现！</strong> 此工具完全在浏览器中运行，无需后端服务器。
          支持完整的 CSS 样式、自定义字体和图片（需要 Base64 或同源）。
        </Typography>
      </Alert>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  转换模式
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant={mode === 'html' ? 'contained' : 'outlined'}
                    onClick={() => setMode('html')}
                  >
                    HTML 代码
                  </Button>
                  <Button
                    variant={mode === 'url' ? 'contained' : 'outlined'}
                    onClick={() => setMode('url')}
                  >
                    网页 URL
                  </Button>
                </Stack>
              </Box>

              {mode === 'html' ? (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    输入 HTML 代码
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={15}
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    placeholder="输入或粘贴 HTML 代码..."
                    sx={{
                      '& .MuiInputBase-root': {
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                </Box>
              ) : (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    输入网页 URL
                  </Typography>
                  <TextField
                    fullWidth
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="caption">
                      URL 转换模式需要后端支持（跨域限制）。建议使用 HTML 代码模式。
                    </Typography>
                  </Alert>
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  转换选项
                </Typography>
                <Stack spacing={1}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={options.landscape}
                        onChange={(e) => setOptions({ ...options, landscape: e.target.checked })}
                      />
                    }
                    label="横向布局"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={options.includeBackground}
                        onChange={(e) => setOptions({ ...options, includeBackground: e.target.checked })}
                      />
                    }
                    label="包含背景色"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={options.margin}
                        onChange={(e) => setOptions({ ...options, margin: e.target.checked })}
                      />
                    }
                    label="添加页边距"
                  />
                </Stack>
              </Box>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={handleConvert}
                  disabled={converting}
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
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              转换特性
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="完整 CSS 支持"
                  secondary="支持大部分 CSS，包括 Flexbox、Grid 布局"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="纯前端实现"
                  secondary="无需后端，完全在浏览器中运行"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="自定义页面大小"
                  secondary="支持 A4、Letter 等标准尺寸"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="分页控制"
                  secondary="支持 CSS page-break 属性"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Code color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="使用场景"
                  secondary="报表生成、发票打印、文档导出、网页存档"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PictureAsPdf color="error" />
                </ListItemIcon>
                <ListItemText
                  primary="输出质量"
                  secondary="高质量矢量输出，可缩放不失真"
                />
              </ListItem>
            </List>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>提示：</strong>
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="• 图片需要使用 Base64 编码或同源"
                    secondary="跨域图片可能无法显示"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="• 使用内联样式或 style 标签"
                    secondary="外部 CSS 文件可能无法加载"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="• 避免使用过于复杂的布局"
                    secondary="简单布局转换效果更好"
                  />
                </ListItem>
              </List>
            </Alert>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

