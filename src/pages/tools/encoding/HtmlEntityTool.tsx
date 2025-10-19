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
import { Code, ContentCopy, Clear, CheckCircle } from '@mui/icons-material';

type Mode = 'encode' | 'decode';

export const HtmlEntityTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<Mode>('encode');
  const [copied, setCopied] = useState(false);

  const htmlEntities: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    ' ': '&nbsp;',
  };

  const handleConvert = () => {
    setError('');
    try {
      if (mode === 'encode') {
        // HTML 实体编码
        const encoded = input.replace(/[&<>"' ]/g, (char) => htmlEntities[char] || char);
        setOutput(encoded);
      } else {
        // HTML 实体解码
        const textarea = document.createElement('textarea');
        textarea.innerHTML = input;
        const decoded = textarea.value;
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
      setInput('<div class="example">Hello & "World"!</div>');
    } else {
      setInput('&lt;div class=&quot;example&quot;&gt;Hello &amp; &quot;World&quot;!&lt;/div&gt;');
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          HTML 实体编码工具
        </Typography>
        <Typography color="text.secondary" paragraph>
          HTML 特殊字符编码和解码
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
          startIcon={<Code />}
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
            输入 ({mode === 'encode' ? '普通文本' : 'HTML 实体'})
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={20}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'encode'
                ? '输入包含特殊字符的文本'
                : '输入 HTML 实体编码'
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
            输出 ({mode === 'encode' ? 'HTML 实体' : '普通文本'})
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

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          常用 HTML 实体
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">& → &amp;amp;</Typography>
            <Typography variant="body2" color="text.secondary">&lt; → &amp;lt;</Typography>
            <Typography variant="body2" color="text.secondary">&gt; → &amp;gt;</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">" → &amp;quot;</Typography>
            <Typography variant="body2" color="text.secondary">' → &amp;#39;</Typography>
            <Typography variant="body2" color="text.secondary">空格 → &amp;nbsp;</Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

