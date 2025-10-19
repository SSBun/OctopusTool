import React, { useState, useMemo } from 'react';
import {
Container,
  Typography,
  Box,
  Paper,
  TextField,
  Grid,
  Card,
  CardContent,
  Stack,
  Button,
  Divider,
  LinearProgress,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import {
  FormatListNumbered,
  Subject,
  TextFields,
  Timer,
  Notes,
  Numbers,
  Clear,
} from '@mui/icons-material';

export const StatsTool: React.FC = () => {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split('\n').length : 0;
    const paragraphs = text.trim()
      ? text
          .trim()
          .split(/\n\n+/)
          .filter((p) => p.trim()).length
      : 0;
    const sentences = text.trim()
      ? text.split(/[.!?]+/).filter((s) => s.trim()).length
      : 0;

    // 阅读时间估算（假设每分钟阅读 200 个单词）
    const readingTimeMinutes = words / 200;
    const readingTime =
      readingTimeMinutes < 1
        ? `${Math.ceil(readingTimeMinutes * 60)} 秒`
        : `${Math.ceil(readingTimeMinutes)} 分钟`;

    // 字符频率统计
    const charFrequency: Record<string, number> = {};
    for (const char of text.toLowerCase()) {
      if (char.match(/[a-z0-9\u4e00-\u9fa5]/)) {
        charFrequency[char] = (charFrequency[char] || 0) + 1;
      }
    }
    const topChars = Object.entries(charFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // 单词频率统计
    const wordFrequency: Record<string, number> = {};
    const words_list = text
      .toLowerCase()
      .match(/\b[\w\u4e00-\u9fa5]+\b/g) || [];
    for (const word of words_list) {
      if (word.length > 1) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    }
    const topWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      characters,
      charactersNoSpaces,
      words,
      lines,
      paragraphs,
      sentences,
      readingTime,
      topChars,
      topWords,
    };
  }, [text]);

  const handleClear = () => {
    setText('');
  };

  const handleExample = () => {
    setText(
      '这是一个示例文本。\n\n它包含多个段落和句子。Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
    );
  };

  const statCards = [
    { icon: <TextFields />, label: '字符数', value: stats.characters, color: '#1976d2' },
    { icon: <Subject />, label: '字符数（无空格）', value: stats.charactersNoSpaces, color: '#2196f3' },
    { icon: <FormatListNumbered />, label: '单词数', value: stats.words, color: '#9c27b0' },
    { icon: <Notes />, label: '行数', value: stats.lines, color: '#ff9800' },
    { icon: <Numbers />, label: '段落数', value: stats.paragraphs, color: '#4caf50' },
    { icon: <Subject />, label: '句子数', value: stats.sentences, color: '#f44336' },
  ];

  return (
    <Container maxWidth="lg">
      <ToolDetailHeader
        title="文本统计工具"
        description="统计文本的字符数、单词数、行数等详细信息"
        toolPath="/tools/text/stats"
      />

      {/* 输入区域 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            输入文本
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
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="在这里输入或粘贴文本..."
          sx={{
            '& .MuiOutlinedInput-root': {
              fontFamily: 'monospace',
              fontSize: '0.9rem',
            },
          }}
        />
      </Paper>

      {/* 基础统计 */}
      <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
        基础统计
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={6} sm={4} md={2} key={index}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ color: stat.color, mb: 1 }}>{stat.icon}</Box>
                <Typography variant="h4" fontWeight={600} sx={{ mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 阅读时间 */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Timer sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h6" fontWeight={600}>
              预计阅读时间
            </Typography>
            <Typography variant="h4" fontWeight={600}>
              {stats.readingTime}
            </Typography>
            <Typography variant="caption">
              基于平均每分钟 200 个单词的阅读速度
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* 频率统计 */}
      <Grid container spacing={3}>
        {/* 字符频率 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              字符频率 TOP 10
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {stats.topChars.length > 0 ? (
              <Box>
                {stats.topChars.map(([char, count], index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        "{char}"
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {count} 次
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(count / stats.topChars[0][1]) * 100}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary" textAlign="center" py={4}>
                暂无数据
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* 单词频率 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              单词频率 TOP 10
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {stats.topWords.length > 0 ? (
              <Box>
                {stats.topWords.map(([word, count], index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {word}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {count} 次
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(count / stats.topWords[0][1]) * 100}
                      sx={{ height: 8, borderRadius: 1 }}
                      color="secondary"
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary" textAlign="center" py={4}>
                暂无数据
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 使用说明 */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          功能说明
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • <strong>字符数</strong>：包括所有字符（含空格、标点符号）
          <br />
          • <strong>字符数（无空格）</strong>：不包括空格的字符数
          <br />
          • <strong>单词数</strong>：按空格分隔的单词数量
          <br />
          • <strong>行数</strong>：文本的总行数（含空行）
          <br />
          • <strong>段落数</strong>：由空行分隔的段落数量
          <br />
          • <strong>句子数</strong>：由句号、问号、感叹号分隔的句子数量
          <br />• <strong>阅读时间</strong>：基于平均阅读速度（每分钟 200 单词）估算
        </Typography>
      </Paper>
    </Container>
  );
};

