import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  Stack,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import { ContentCopy, Clear } from '@mui/icons-material';

type CaseType =
  | 'uppercase'
  | 'lowercase'
  | 'titlecase'
  | 'sentencecase'
  | 'camelcase'
  | 'pascalcase'
  | 'snakecase'
  | 'kebabcase'
  | 'constantcase';

export const CaseTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [success, setSuccess] = useState('');

  const convertCase = (text: string, type: CaseType): string => {
    if (!text) return '';

    switch (type) {
      case 'uppercase':
        return text.toUpperCase();

      case 'lowercase':
        return text.toLowerCase();

      case 'titlecase':
        return text
          .toLowerCase()
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

      case 'sentencecase':
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

      case 'camelcase':
        return text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
          .replace(/^[A-Z]/, (chr) => chr.toLowerCase());

      case 'pascalcase':
        return text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
          .replace(/^[a-z]/, (chr) => chr.toUpperCase());

      case 'snakecase':
        return text
          .replace(/([a-z])([A-Z])/g, '$1_$2')
          .replace(/[\s-]+/g, '_')
          .toLowerCase();

      case 'kebabcase':
        return text
          .replace(/([a-z])([A-Z])/g, '$1-$2')
          .replace(/[\s_]+/g, '-')
          .toLowerCase();

      case 'constantcase':
        return text
          .replace(/([a-z])([A-Z])/g, '$1_$2')
          .replace(/[\s-]+/g, '_')
          .toUpperCase();

      default:
        return text;
    }
  };

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setSuccess(`已复制 ${label}！`);
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleClear = () => {
    setInput('');
  };

  const handleExample = () => {
    setInput('hello world this is a text example');
  };

  const caseTypes: Array<{ type: CaseType; label: string; description: string; example: string }> = [
    {
      type: 'uppercase',
      label: '全部大写',
      description: 'UPPERCASE',
      example: 'HELLO WORLD',
    },
    {
      type: 'lowercase',
      label: '全部小写',
      description: 'lowercase',
      example: 'hello world',
    },
    {
      type: 'titlecase',
      label: '标题格式',
      description: 'Title Case',
      example: 'Hello World',
    },
    {
      type: 'sentencecase',
      label: '句子格式',
      description: 'Sentence case',
      example: 'Hello world',
    },
    {
      type: 'camelcase',
      label: '驼峰命名',
      description: 'camelCase',
      example: 'helloWorld',
    },
    {
      type: 'pascalcase',
      label: '帕斯卡命名',
      description: 'PascalCase',
      example: 'HelloWorld',
    },
    {
      type: 'snakecase',
      label: '蛇形命名',
      description: 'snake_case',
      example: 'hello_world',
    },
    {
      type: 'kebabcase',
      label: '烤串命名',
      description: 'kebab-case',
      example: 'hello-world',
    },
    {
      type: 'constantcase',
      label: '常量命名',
      description: 'CONSTANT_CASE',
      example: 'HELLO_WORLD',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          大小写转换工具
        </Typography>
        <Typography color="text.secondary" paragraph>
          转换文本的大小写格式，支持多种编程命名风格
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* 输入区域 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          输入文本
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <TextField
          fullWidth
          multiline
          rows={6}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入要转换的文本..."
          sx={{ mb: 2 }}
        />

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Clear />} onClick={handleClear}>
            清空
          </Button>
          <Button variant="text" onClick={handleExample}>
            加载示例
          </Button>
        </Stack>
      </Paper>

      {/* 转换结果 */}
      <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
        转换结果
      </Typography>

      <Grid container spacing={2}>
        {caseTypes.map((caseType) => {
          const result = convertCase(input, caseType.type);
          return (
            <Grid item xs={12} sm={6} md={4} key={caseType.type}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    {caseType.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {caseType.description}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box
                    sx={{
                      minHeight: 60,
                      p: 2,
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(0, 0, 0, 0.02)',
                      borderRadius: 1,
                      mb: 2,
                      wordBreak: 'break-all',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                    }}
                  >
                    {result || <Typography color="text.secondary">-</Typography>}
                  </Box>
                  <Button
                    size="small"
                    startIcon={<ContentCopy />}
                    onClick={() => handleCopy(result, caseType.label)}
                    disabled={!result}
                    fullWidth
                    variant="outlined"
                  >
                    复制
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* 使用说明 */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          命名风格说明
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>camelCase (驼峰命名):</strong> 首字母小写，后续单词首字母大写，常用于 JavaScript 变量
              <br />
              <strong>PascalCase (帕斯卡命名):</strong> 所有单词首字母大写，常用于类名
              <br />
              <strong>snake_case (蛇形命名):</strong> 全小写，单词用下划线连接，常用于 Python
              <br />
              <strong>kebab-case (烤串命名):</strong> 全小写，单词用连字符连接，常用于 URL 和 CSS
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>CONSTANT_CASE (常量命名):</strong> 全大写，单词用下划线连接，常用于常量
              <br />
              <strong>Title Case (标题格式):</strong> 每个单词首字母大写，常用于标题
              <br />
              <strong>Sentence case (句子格式):</strong> 首字母大写，其余小写，常用于句子
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

