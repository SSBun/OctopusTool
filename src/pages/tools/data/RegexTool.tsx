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
  FormGroup,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Pattern, Clear } from '@mui/icons-material';

export const RegexTool: React.FC = () => {
  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState('');
  const [flags, setFlags] = useState({ g: true, i: false, m: false });
  const [matches, setMatches] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isMatch, setIsMatch] = useState<boolean | null>(null);

  const handleTest = () => {
    setError('');
    setMatches([]);
    setIsMatch(null);

    if (!pattern || !testString) return;

    try {
      const flagString = Object.entries(flags)
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join('');
      
      const regex = new RegExp(pattern, flagString);
      const matchResults = testString.match(regex);
      
      if (matchResults) {
        setMatches(matchResults);
        setIsMatch(true);
      } else {
        setIsMatch(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '正则表达式错误');
      setIsMatch(null);
    }
  };

  const handleClear = () => {
    setPattern('');
    setTestString('');
    setMatches([]);
    setError('');
    setIsMatch(null);
  };

  const handleExample = () => {
    setPattern('\\d{3}-\\d{4}-\\d{4}');
    setTestString('联系电话：010-1234-5678，备用电话：021-8765-4321');
  };

  const commonPatterns = [
    { label: '邮箱', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
    { label: '手机号', pattern: '1[3-9]\\d{9}' },
    { label: '身份证', pattern: '\\d{17}[\\dXx]' },
    { label: 'IP地址', pattern: '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}' },
    { label: 'URL', pattern: 'https?://[\\w\\-]+(\\.[\\w\\-]+)+[/#?]?.*' },
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          正则表达式测试工具
        </Typography>
        <Typography color="text.secondary" paragraph>
          在线测试和调试正则表达式
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<Pattern />}
          onClick={handleTest}
          disabled={!pattern || !testString}
        >
          测试匹配
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

      {isMatch !== null && (
        <Alert severity={isMatch ? 'success' : 'info'} sx={{ mb: 3 }}>
          {isMatch ? `匹配成功！找到 ${matches.length} 个匹配项` : '没有匹配项'}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              正则表达式
            </Typography>
            <TextField
              fullWidth
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="输入正则表达式，例如：\d{3}-\d{4}"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                },
              }}
            />
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={flags.g}
                    onChange={(e) => setFlags({ ...flags, g: e.target.checked })}
                  />
                }
                label="全局匹配 (g)"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={flags.i}
                    onChange={(e) => setFlags({ ...flags, i: e.target.checked })}
                  />
                }
                label="忽略大小写 (i)"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={flags.m}
                    onChange={(e) => setFlags({ ...flags, m: e.target.checked })}
                  />
                }
                label="多行模式 (m)"
              />
            </FormGroup>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              测试字符串
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={15}
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="输入要测试的字符串"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                },
              }}
            />
          </Paper>
        </Box>

        <Box>
          {matches.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                匹配结果
              </Typography>
              <List>
                {matches.map((match, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText
                      primary={`匹配 ${index + 1}`}
                      secondary={match}
                      secondaryTypographyProps={{
                        sx: {
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                          color: 'primary.main',
                          wordBreak: 'break-all',
                        },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              常用正则
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {commonPatterns.map((item, index) => (
                <Chip
                  key={index}
                  label={item.label}
                  onClick={() => setPattern(item.pattern)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

