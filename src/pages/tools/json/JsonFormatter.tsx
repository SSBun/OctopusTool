import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Alert,
  Slider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Code, ContentCopy, Clear, CheckCircle } from '@mui/icons-material';

export const JsonFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFormat = () => {
    setError('');
    try {
      const parsed = JSON.parse(input);
      let formatted: string;
      
      if (sortKeys) {
        const sortObject = (obj: any): any => {
          if (Array.isArray(obj)) {
            return obj.map(sortObject);
          } else if (obj !== null && typeof obj === 'object') {
            return Object.keys(obj)
              .sort()
              .reduce((result: any, key) => {
                result[key] = sortObject(obj[key]);
                return result;
              }, {});
          }
          return obj;
        };
        formatted = JSON.stringify(sortObject(parsed), null, indent);
      } else {
        formatted = JSON.stringify(parsed, null, indent);
      }
      
      setOutput(formatted);
    } catch (e) {
      setError(e instanceof Error ? e.message : '无效的 JSON 格式');
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
    const example = {
      name: 'John Doe',
      age: 30,
      email: 'john@example.com',
      address: { city: 'New York', country: 'USA' },
      hobbies: ['reading', 'coding', 'gaming'],
    };
    setInput(JSON.stringify(example));
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          JSON 格式化工具
        </Typography>
        <Typography color="text.secondary" paragraph>
          美化和格式化 JSON 数据，使其更易读
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<Code />}
          onClick={handleFormat}
          disabled={!input}
        >
          格式化
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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
          <Typography variant="body2" color="text.secondary">
            缩进空格：{indent}
          </Typography>
          <Slider
            value={indent}
            onChange={(_, value) => setIndent(value as number)}
            min={2}
            max={8}
            step={2}
            sx={{ width: 120 }}
            size="small"
          />
          <FormControlLabel
            control={
              <Switch checked={sortKeys} onChange={(e) => setSortKeys(e.target.checked)} />
            }
            label="排序键"
          />
        </Box>
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
            输入 JSON
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={20}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='粘贴或输入 JSON 数据，例如：{"name":"John","age":30}'
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
            格式化结果
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={20}
            value={output}
            InputProps={{
              readOnly: true,
            }}
            placeholder="格式化后的 JSON 将显示在这里"
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

