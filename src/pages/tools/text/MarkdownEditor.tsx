import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Grid,
  Button,
  Stack,
} from '@mui/material';
import { ContentCopy, Clear, Download, Visibility } from '@mui/icons-material';
import { marked } from 'marked';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';

// 配置 marked
marked.setOptions({
  breaks: true, // 支持换行
  gfm: true, // 支持 GitHub Flavored Markdown
});

export const MarkdownEditor: React.FC = () => {
  const [markdown, setMarkdown] = useState('# Hello Markdown\n\n开始编辑你的 Markdown 文档...\n\n## 特性\n\n- 实时预览\n- 支持 GitHub Flavored Markdown\n- 代码高亮\n\n## 代码示例\n\n```javascript\nfunction hello() {\n  console.log("Hello, World!");\n}\n```\n\n## 表格\n\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| A   | B   | C   |\n| 1   | 2   | 3   |\n');
  const [html, setHtml] = useState('');
  const [copied, setCopied] = useState(false);

  // 实时更新预览
  useEffect(() => {
    try {
      const rendered = marked(markdown) as string;
      setHtml(rendered);
    } catch (error) {
      console.error('Markdown 解析错误:', error);
    }
  }, [markdown]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setMarkdown('');
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtml = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown 文档</title>
  <style>
    body {
      max-width: 900px;
      margin: 40px auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    pre {
      background: #f4f4f4;
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
    }
    pre code {
      background: none;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #ddd;
      padding-left: 16px;
      color: #666;
      margin: 16px 0;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 16px 0;
    }
    table th, table td {
      border: 1px solid #ddd;
      padding: 8px 12px;
      text-align: left;
    }
    table th {
      background: #f4f4f4;
      font-weight: bold;
    }
    img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
${html}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader
        title="Markdown 编辑器"
        description="实时编辑和预览 Markdown 文档，支持 GitHub Flavored Markdown"
        toolPath="/tools/text/markdown-editor"
      />

      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={copied ? <Visibility /> : <ContentCopy />}
            onClick={handleCopy}
            color={copied ? 'success' : 'primary'}
          >
            {copied ? '已复制' : '复制 Markdown'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleDownload}
          >
            下载 .md
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleDownloadHtml}
          >
            下载 HTML
          </Button>
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={handleClear}
            color="error"
          >
            清空
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              编辑器
            </Typography>
            <TextField
              multiline
              fullWidth
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="在此输入 Markdown..."
              sx={{
                flex: 1,
                '& .MuiInputBase-root': {
                  height: '100%',
                  alignItems: 'flex-start',
                  fontFamily: '"Courier New", monospace',
                  fontSize: '14px',
                },
                '& textarea': {
                  height: '100% !important',
                  overflow: 'auto !important',
                },
              }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: '70vh', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              预览
            </Typography>
            <Box
              sx={{
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  marginTop: 2,
                  marginBottom: 1,
                  fontWeight: 600,
                },
                '& h1': { fontSize: '2rem' },
                '& h2': { fontSize: '1.5rem' },
                '& h3': { fontSize: '1.25rem' },
                '& p': {
                  marginBottom: 1,
                },
                '& code': {
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.9em',
                },
                '& pre': {
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  padding: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  marginY: 2,
                },
                '& pre code': {
                  backgroundColor: 'transparent',
                  padding: 0,
                },
                '& blockquote': {
                  borderLeft: '4px solid',
                  borderColor: 'primary.main',
                  paddingLeft: 2,
                  marginY: 2,
                  color: 'text.secondary',
                },
                '& table': {
                  borderCollapse: 'collapse',
                  width: '100%',
                  marginY: 2,
                },
                '& table th, & table td': {
                  border: '1px solid',
                  borderColor: 'divider',
                  padding: 1,
                },
                '& table th': {
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  fontWeight: 600,
                },
                '& ul, & ol': {
                  paddingLeft: 3,
                  marginY: 1,
                },
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 1,
                },
                '& a': {
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                },
              }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

