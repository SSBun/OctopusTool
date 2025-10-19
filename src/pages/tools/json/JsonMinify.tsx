import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Alert,
  Chip,
} from '@mui/material';
import { CompressOutlined, ContentCopy, Clear, CheckCircle } from '@mui/icons-material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';

export const JsonMinify: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ originalSize: 0, minifiedSize: 0, savings: 0 });

  const handleMinify = () => {
    setError('');
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);

      // 计算统计信息
      const originalSize = new Blob([input]).size;
      const minifiedSize = new Blob([minified]).size;
      const savings = ((originalSize - minifiedSize) / originalSize) * 100;

      setStats({
        originalSize,
        minifiedSize,
        savings: Math.round(savings * 100) / 100,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : '无效的 JSON 格式');
      setOutput('');
      setStats({ originalSize: 0, minifiedSize: 0, savings: 0 });
    }
  };

  const handleCopy = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
    setStats({ originalSize: 0, minifiedSize: 0, savings: 0 });
  };

  const handleExample = () => {
    const example = `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001"
  },
  "hobbies": [
    "reading",
    "coding",
    "gaming"
  ],
  "isActive": true
}`;
    setInput(example);
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader
        title="JSON 压缩工具"
        description="压缩 JSON 数据，移除空格和换行，减少文件大小"
        toolPath="/tools/json/minify"
      />

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<CompressOutlined />}
          onClick={handleMinify}
          disabled={!input}
        >
          压缩
        </Button>
        <Button
          variant="outlined"
          startIcon={<ContentCopy />}
          onClick={handleCopy}
          disabled={!output}
        >
          {copied ? '已复制' : '复制结果'}
        </Button>
        <Button variant="outlined" startIcon={<Clear />} onClick={handleClear}>
          清空
        </Button>
        <Button variant="text" onClick={handleExample}>
          加载示例
        </Button>
      </Box>

      {stats.originalSize > 0 && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Chip label={`原始大小: ${stats.originalSize} 字节`} color="default" />
          <Chip label={`压缩后: ${stats.minifiedSize} 字节`} color="primary" />
          <Chip label={`节省: ${stats.savings}%`} color="success" />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {copied && (
        <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
          已复制到剪贴板！
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            输入 JSON
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={20}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="粘贴或输入要压缩的 JSON 数据"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              },
            }}
          />
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            压缩结果
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={20}
            value={output}
            InputProps={{
              readOnly: true,
            }}
            placeholder="压缩后的 JSON 将显示在这里"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa',
              },
            }}
          />
        </Paper>
      </Box>
    </Container>
  );
};

