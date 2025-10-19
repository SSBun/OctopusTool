import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { SwapHoriz, ContentCopy, Clear, CheckCircle } from '@mui/icons-material';

type Mode = 'encode' | 'decode';

export const Base64Tool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<Mode>('encode');
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    setError('');
    try {
      if (mode === 'encode') {
        const encoded = btoa(unescape(encodeURIComponent(input)));
        setOutput(encoded);
      } else {
        const decoded = decodeURIComponent(escape(atob(input)));
        setOutput(decoded);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败，请检查输入内容');
      setOutput('');
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
  };

  const handleExample = () => {
    if (mode === 'encode') {
      setInput('Hello, World! 你好世界！');
    } else {
      setInput('SGVsbG8sIFdvcmxkISDkvaDlpb3kuJbnlYzvvIE=');
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Base64 编解码工具
        </Typography>
        <Typography color="text.secondary" paragraph>
          对文本进行 Base64 编码和解码，支持 UTF-8 字符
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, value) => value && setMode(value)}
          size="small"
        >
          <ToggleButton value="encode">编码</ToggleButton>
          <ToggleButton value="decode">解码</ToggleButton>
        </ToggleButtonGroup>

        <Button
          variant="contained"
          startIcon={<SwapHoriz />}
          onClick={handleConvert}
          disabled={!input}
        >
          转换
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
            输入 ({mode === 'encode' ? '原始文本' : 'Base64 字符串'})
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={20}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'encode'
                ? '输入要编码的文本'
                : '输入要解码的 Base64 字符串'
            }
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
            输出 ({mode === 'encode' ? 'Base64 字符串' : '原始文本'})
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={20}
            value={output}
            InputProps={{
              readOnly: true,
            }}
            placeholder="转换结果将显示在这里"
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

