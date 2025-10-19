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
  Chip,
  Divider,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { Compare, Clear, SwapHoriz } from '@mui/icons-material';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber: number;
}

export const DiffTool: React.FC = () => {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [success, setSuccess] = useState('');

  const diffResult = useMemo(() => {
    if (!text1 && !text2) return null;

    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const result: DiffLine[] = [];
    
    const maxLines = Math.max(lines1.length, lines2.length);
    
    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';
      
      if (line1 === line2) {
        result.push({ type: 'unchanged', content: line1, lineNumber: i + 1 });
      } else {
        if (line1) {
          result.push({ type: 'removed', content: line1, lineNumber: i + 1 });
        }
        if (line2) {
          result.push({ type: 'added', content: line2, lineNumber: i + 1 });
        }
      }
    }
    
    return result;
  }, [text1, text2]);

  const stats = useMemo(() => {
    if (!diffResult) return null;
    
    const added = diffResult.filter(d => d.type === 'added').length;
    const removed = diffResult.filter(d => d.type === 'removed').length;
    const unchanged = diffResult.filter(d => d.type === 'unchanged').length;
    
    return { added, removed, unchanged };
  }, [diffResult]);

  const handleSwap = () => {
    const temp = text1;
    setText1(text2);
    setText2(temp);
    setSuccess('已交换两个文本框的内容');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleClear = () => {
    setText1('');
    setText2('');
  };

  const handleExample = () => {
    setText1('Hello World\nThis is line 2\nThis is line 3\nAnother line');
    setText2('Hello World\nThis is modified line 2\nThis is line 3\nNew line added');
  };

  const getLineColor = (type: string) => {
    switch (type) {
      case 'added':
        return 'rgba(46, 160, 67, 0.2)';
      case 'removed':
        return 'rgba(248, 81, 73, 0.2)';
      default:
        return 'transparent';
    }
  };

  const getLinePrefix = (type: string) => {
    switch (type) {
      case 'added':
        return '+ ';
      case 'removed':
        return '- ';
      default:
        return '  ';
    }
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader
        title="文本对比工具"
        description="比较两段文本的差异，逐行对比并高亮显示"
        toolPath="/tools/text/diff"
      />

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* 操作按钮 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<Compare />}
            disabled={!text1 && !text2}
            onClick={() => {}}
          >
            开始对比
          </Button>
          <Button variant="outlined" startIcon={<SwapHoriz />} onClick={handleSwap}>
            交换内容
          </Button>
          <Button variant="outlined" startIcon={<Clear />} onClick={handleClear}>
            清空
          </Button>
          <Button variant="text" onClick={handleExample}>
            加载示例
          </Button>
        </Stack>
      </Paper>

      {/* 输入区域 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              原始文本
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TextField
              fullWidth
              multiline
              rows={15}
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              placeholder="输入原始文本..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {text1.split('\n').length} 行, {text1.length} 字符
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              对比文本
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TextField
              fullWidth
              multiline
              rows={15}
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              placeholder="输入要对比的文本..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {text2.split('\n').length} 行, {text2.length} 字符
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* 对比结果 */}
      {diffResult && stats && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              对比结果
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip label={`新增 ${stats.added} 行`} color="success" size="small" />
              <Chip label={`删除 ${stats.removed} 行`} color="error" size="small" />
              <Chip label={`未改变 ${stats.unchanged} 行`} size="small" variant="outlined" />
            </Stack>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Box
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              whiteSpace: 'pre',
              overflowX: 'auto',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.02)',
              p: 2,
              borderRadius: 1,
              maxHeight: 600,
              overflowY: 'auto',
            }}
          >
            {diffResult.map((line, index) => (
              <Box
                key={index}
                sx={{
                  backgroundColor: getLineColor(line.type),
                  px: 1,
                  py: 0.5,
                  borderLeft: line.type !== 'unchanged' ? '3px solid' : 'none',
                  borderLeftColor: line.type === 'added' ? 'success.main' : 'error.main',
                  color: line.type === 'added' ? 'success.main' : line.type === 'removed' ? 'error.main' : 'text.primary',
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                    mr: 2,
                    display: 'inline-block',
                    width: 40,
                  }}
                >
                  {line.lineNumber}
                </Typography>
                <Typography component="span" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  {getLinePrefix(line.type)}
                  {line.content}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {!diffResult && (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            bgcolor: 'background.default',
          }}
        >
          <Compare sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography color="text.secondary">
            在上方输入两段文本，即可自动显示对比结果
          </Typography>
        </Paper>
      )}

      {/* 使用说明 */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          使用说明
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • 在左侧输入原始文本，在右侧输入要对比的文本
          <br />
          • 绿色高亮表示新增的行（在对比文本中存在）
          <br />
          • 红色高亮表示删除的行（在原始文本中存在）
          <br />
          • 未高亮的行表示两个文本中完全相同
          <br />
          • 点击"交换内容"可以快速对调两个文本框的内容
        </Typography>
      </Paper>
    </Container>
  );
};

