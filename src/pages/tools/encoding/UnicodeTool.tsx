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
import { TextFields, ContentCopy, Clear, CheckCircle } from '@mui/icons-material';

type Mode = 'encode' | 'decode';

export const UnicodeTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<Mode>('encode');
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    setError('');
    try {
      if (mode === 'encode') {
        // 转换为 Unicode 编码
        const encoded = input
          .split('')
          .map((char) => {
            const code = char.charCodeAt(0);
            return code > 127 ? `\\u${code.toString(16).padStart(4, '0')}` : char;
          })
          .join('');
        setOutput(encoded);
      } else {
        // 从 Unicode 编码转回文本
        const decoded = input.replace(/\\u([\dA-Fa-f]{4})/g, (_, code) => {
          return String.fromCharCode(parseInt(code, 16));
        });
        setOutput(decoded);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败');
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
      setInput('你好世界！Hello World!');
    } else {
      setInput('\\u4f60\\u597d\\u4e16\\u754c\\uff01Hello World!');
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Unicode 转换工具
        </Typography>
        <Typography color="text.secondary" paragraph>
          Unicode 和普通文本相互转换
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, value) => value && setMode(value)}
          size="small"
        >
          <ToggleButton value="encode">文本 → Unicode</ToggleButton>
          <ToggleButton value="decode">Unicode → 文本</ToggleButton>
        </ToggleButtonGroup>

        <Button
          variant="contained"
          startIcon={<TextFields />}
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
            输入 ({mode === 'encode' ? '普通文本' : 'Unicode 编码'})
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={20}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'encode'
                ? '输入要转换为 Unicode 的文本'
                : '输入 Unicode 编码（如 \\u4f60\\u597d）'
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
            输出 ({mode === 'encode' ? 'Unicode 编码' : '普通文本'})
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

      <Paper sx={{ p: 3, mt: 3, bgcolor: 'primary.main', opacity: 0.9 }}>
        <Typography variant="body2" color="white" fontWeight={500}>
          💡 提示：Unicode 编码格式为 \uXXXX，其中 XXXX 为 16 进制字符编码
        </Typography>
      </Paper>
    </Container>
  );
};

