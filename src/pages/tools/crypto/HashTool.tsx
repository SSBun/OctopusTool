import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Security, ContentCopy, Clear, CheckCircle } from '@mui/icons-material';

type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

export const HashTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-256');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleHash = async () => {
    if (!input) return;
    
    setLoading(true);
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer = await crypto.subtle.digest(algorithm, data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setOutput(hashHex);
    } catch (error) {
      console.error('Hash error:', error);
      setOutput('');
    }
    setLoading(false);
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
  };

  const handleExample = () => {
    setInput('Hello, World!');
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          SHA 哈希工具
        </Typography>
        <Typography color="text.secondary" paragraph>
          使用 SHA-1/SHA-256/SHA-384/SHA-512 算法计算哈希值
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>算法</InputLabel>
          <Select
            value={algorithm}
            label="算法"
            onChange={(e) => setAlgorithm(e.target.value as HashAlgorithm)}
          >
            <MenuItem value="SHA-1">SHA-1</MenuItem>
            <MenuItem value="SHA-256">SHA-256</MenuItem>
            <MenuItem value="SHA-384">SHA-384</MenuItem>
            <MenuItem value="SHA-512">SHA-512</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<Security />}
          onClick={handleHash}
          disabled={!input || loading}
        >
          {loading ? '计算中...' : '生成哈希'}
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

      {copied && (
        <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
          已复制到剪贴板！
        </Alert>
      )}

      {algorithm === 'SHA-1' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          ⚠️ SHA-1 已被证明不够安全，建议使用 SHA-256 或更高版本
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            输入文本
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={20}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入要计算哈希的文本"
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
            哈希值 ({algorithm})
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={20}
            value={output}
            InputProps={{
              readOnly: true,
            }}
            placeholder="哈希值将显示在这里"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa',
                wordBreak: 'break-all',
              },
            }}
          />
        </Paper>
      </Box>
    </Container>
  );
};

