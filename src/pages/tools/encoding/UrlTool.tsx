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
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { Link, ContentCopy, Clear, CheckCircle } from '@mui/icons-material';

type Mode = 'encode' | 'decode';

export const UrlTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<Mode>('encode');
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    setError('');
    try {
      if (mode === 'encode') {
        const encoded = encodeURIComponent(input);
        setOutput(encoded);
      } else {
        const decoded = decodeURIComponent(input);
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
      setInput('https://example.com/search?q=编程 学习&page=1');
    } else {
      setInput('https%3A%2F%2Fexample.com%2Fsearch%3Fq%3D%E7%BC%96%E7%A8%8B%20%E5%AD%A6%E4%B9%A0%26page%3D1');
    }
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader
        title="URL 编解码工具"
        description="对 URL 进行编码和解码，处理特殊字符和中文字符"
        toolPath="/tools/encoding/url"
      />

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
          startIcon={<Link />}
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
            输入 ({mode === 'encode' ? '原始 URL' : '编码后的 URL'})
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={20}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'encode'
                ? '输入要编码的 URL 或文本'
                : '输入要解码的 URL 编码字符串'
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
            输出 ({mode === 'encode' ? '编码后的 URL' : '原始 URL'})
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
          💡 提示：URL 编码会将特殊字符转换为 %XX 格式，常用于 URL 参数传递
        </Typography>
      </Paper>
    </Container>
  );
};

