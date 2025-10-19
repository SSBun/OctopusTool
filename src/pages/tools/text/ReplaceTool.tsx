import React, { useState, useMemo } from 'react';
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
  FormControlLabel,
  Checkbox,
  Chip,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { ContentCopy, Clear } from '@mui/icons-material';

export const ReplaceTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [globalReplace, setGlobalReplace] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const result = useMemo(() => {
    if (!input || !findText) return input;

    try {
      if (useRegex) {
        const flags = `${globalReplace ? 'g' : ''}${caseSensitive ? '' : 'i'}`;
        const regex = new RegExp(findText, flags);
        return input.replace(regex, replaceText);
      } else {
        if (globalReplace) {
          const flags = caseSensitive ? 'g' : 'gi';
          const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
          return input.replace(regex, replaceText);
        } else {
          const index = caseSensitive
            ? input.indexOf(findText)
            : input.toLowerCase().indexOf(findText.toLowerCase());
          if (index === -1) return input;
          return input.substring(0, index) + replaceText + input.substring(index + findText.length);
        }
      }
    } catch (err) {
      setError(useRegex ? '正则表达式语法错误' : '替换失败');
      return input;
    }
  }, [input, findText, replaceText, useRegex, caseSensitive, globalReplace]);

  const matchCount = useMemo(() => {
    if (!input || !findText) return 0;
    try {
      if (useRegex) {
        const flags = `g${caseSensitive ? '' : 'i'}`;
        const regex = new RegExp(findText, flags);
        const matches = input.match(regex);
        return matches ? matches.length : 0;
      } else {
        const flags = caseSensitive ? 'g' : 'gi';
        const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
        const matches = input.match(regex);
        return matches ? matches.length : 0;
      }
    } catch {
      return 0;
    }
  }, [input, findText, useRegex, caseSensitive]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setSuccess('已复制到剪贴板！');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleClear = () => {
    setInput('');
    setFindText('');
    setReplaceText('');
  };

  const handleExample = () => {
    setInput('Hello World! Hello Universe! hello everyone!');
    setFindText('hello');
    setReplaceText('Hi');
    setUseRegex(false);
    setCaseSensitive(false);
  };

  return (
    <Container maxWidth="lg">
      <ToolDetailHeader
        title="查找替换工具"
        description="批量查找和替换文本，支持正则表达式"
        toolPath="/tools/text/replace"
      />

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* 选项 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          查找和替换
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="查找内容"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder={useRegex ? '输入正则表达式' : '输入要查找的文本'}
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="替换为"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="输入替换后的文本"
            />
          </Grid>
          <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
            {matchCount > 0 && (
              <Chip label={`找到 ${matchCount} 处`} color="primary" />
            )}
          </Grid>
        </Grid>

        <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 1 }}>
          <FormControlLabel
            control={<Checkbox checked={useRegex} onChange={(e) => setUseRegex(e.target.checked)} />}
            label="使用正则表达式"
          />
          <FormControlLabel
            control={<Checkbox checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} />}
            label="区分大小写"
          />
          <FormControlLabel
            control={<Checkbox checked={globalReplace} onChange={(e) => setGlobalReplace(e.target.checked)} />}
            label="全局替换"
          />
        </Stack>
      </Paper>

      {/* 输入输出 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                原始文本
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="outlined" startIcon={<Clear />} onClick={handleClear}>
                  清空
                </Button>
                <Button size="small" variant="text" onClick={handleExample}>
                  示例
                </Button>
              </Stack>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <TextField
              fullWidth
              multiline
              rows={15}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入要处理的文本..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                },
              }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                替换结果
              </Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<ContentCopy />}
                onClick={handleCopy}
                disabled={!result}
              >
                复制
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <TextField
              fullWidth
              multiline
              rows={15}
              value={result}
              InputProps={{ readOnly: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.02)',
                },
              }}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* 使用说明 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          使用说明
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>基础替换：</strong>
              <br />
              • 不启用正则表达式时，进行字面量匹配
              <br />
              • 支持区分/不区分大小写
              <br />
              • 可选择替换首次出现或全部出现
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>正则表达式：</strong>
              <br />
              • 启用后可使用正则表达式语法
              <br />
              • 例如：\d+ 匹配数字，[a-z]+ 匹配字母
              <br />
              • 支持捕获组和反向引用
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

