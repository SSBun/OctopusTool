import React, { useState, useEffect } from 'react';
import {
Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  Stack,
  Slider,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { ContentCopy, Refresh } from '@mui/icons-material';

type Unit = 'paragraphs' | 'sentences' | 'words';

export const LoremTool: React.FC = () => {
  const [unit, setUnit] = useState<Unit>('paragraphs');
  const [count, setCount] = useState(3);
  const [text, setText] = useState('');
  const [success, setSuccess] = useState('');

  const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation',
    'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat',
    'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit', 'esse',
    'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat',
    'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt',
    'mollit', 'anim', 'id', 'est', 'laborum',
  ];

  const generateWord = () => {
    return loremWords[Math.floor(Math.random() * loremWords.length)];
  };

  const generateSentence = () => {
    const wordCount = Math.floor(Math.random() * 10) + 5;
    const sentence = [];
    for (let i = 0; i < wordCount; i++) {
      sentence.push(generateWord());
    }
    return sentence[0].charAt(0).toUpperCase() + sentence[0].slice(1) + ' ' + sentence.slice(1).join(' ') + '.';
  };

  const generateParagraph = () => {
    const sentenceCount = Math.floor(Math.random() * 4) + 3;
    const sentences = [];
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence());
    }
    return sentences.join(' ');
  };

  const generate = () => {
    let result = '';

    if (unit === 'words') {
      const words = [];
      for (let i = 0; i < count; i++) {
        words.push(generateWord());
      }
      result = words.join(' ');
    } else if (unit === 'sentences') {
      const sentences = [];
      for (let i = 0; i < count; i++) {
        sentences.push(generateSentence());
      }
      result = sentences.join(' ');
    } else {
      const paragraphs = [];
      for (let i = 0; i < count; i++) {
        paragraphs.push(generateParagraph());
      }
      result = paragraphs.join('\n\n');
    }

    setText(result);
  };

  useEffect(() => {
    generate();
  }, [unit, count]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setSuccess('已复制到剪贴板！');
    setTimeout(() => setSuccess(''), 2000);
  };

  const unitLabels = {
    paragraphs: '段落',
    sentences: '句子',
    words: '单词',
  };

  const maxValues = {
    paragraphs: 10,
    sentences: 50,
    words: 200,
  };

  return (
    <Container maxWidth="md">
      <ToolDetailHeader
        title="Lorem Ipsum 生成器"
        description="生成占位文本，用于设计和开发演示"
        toolPath="/tools/text/lorem"
      />

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* 配置 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          生成配置
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            单位类型
          </Typography>
          <ToggleButtonGroup
            value={unit}
            exclusive
            onChange={(_, value) => value && setUnit(value)}
            fullWidth
            size="small"
          >
            <ToggleButton value="paragraphs">段落</ToggleButton>
            <ToggleButton value="sentences">句子</ToggleButton>
            <ToggleButton value="words">单词</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            数量: {count} {unitLabels[unit]}
          </Typography>
          <Slider
            value={count}
            onChange={(_, value) => setCount(value as number)}
            min={1}
            max={maxValues[unit]}
            marks={[
              { value: 1, label: '1' },
              { value: Math.floor(maxValues[unit] / 2), label: String(Math.floor(maxValues[unit] / 2)) },
              { value: maxValues[unit], label: String(maxValues[unit]) },
            ]}
            valueLabelDisplay="auto"
          />
        </Box>

        <Button variant="contained" startIcon={<Refresh />} onClick={generate} fullWidth>
          重新生成
        </Button>
      </Paper>

      {/* 生成的文本 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            生成的文本
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ContentCopy />}
            onClick={handleCopy}
            disabled={!text}
          >
            复制
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Box
          sx={{
            minHeight: 300,
            maxHeight: 500,
            overflowY: 'auto',
            p: 3,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.02)',
            borderRadius: 1,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: 1.8,
          }}
        >
          <Typography sx={{ textAlign: 'justify' }}>{text}</Typography>
        </Box>

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {text.split(' ').length} 个单词
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {text.length} 个字符
          </Typography>
        </Stack>
      </Paper>

      {/* 说明 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          关于 Lorem Ipsum
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Lorem Ipsum 是印刷和排版行业的标准占位文本，自 1500 年代以来一直被使用。
          <br />
          <br />• 用于在设计阶段填充内容，展示页面布局
          <br />• 不会因实际内容分散注意力，专注于视觉设计
          <br />• 字符分布接近实际文本，便于评估版式效果
          <br />• 广泛应用于网页设计、平面设计和印刷出版
        </Typography>
      </Paper>
    </Container>
  );
};

