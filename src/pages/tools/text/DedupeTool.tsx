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
  ToggleButtonGroup,
  ToggleButton,
  Chip,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { ContentCopy, Clear, FilterList } from '@mui/icons-material';

type DedupeMode = 'keep-first' | 'keep-last' | 'keep-all';
type SortMode = 'none' | 'asc' | 'desc';

export const DedupeTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [dedupeMode, setDedupeMode] = useState<DedupeMode>('keep-first');
  const [sortMode, setSortMode] = useState<SortMode>('none');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [success, setSuccess] = useState('');

  const result = useMemo(() => {
    if (!input.trim()) return '';

    let lines = input.split('\n');

    // 去重处理
    const seen = new Set<string>();
    const dedupedLines: string[] = [];

    if (dedupeMode === 'keep-last') {
      lines = lines.reverse();
    }

    for (const line of lines) {
      const compareKey = caseSensitive ? line : line.toLowerCase();
      if (!seen.has(compareKey)) {
        seen.add(compareKey);
        dedupedLines.push(line);
      }
    }

    if (dedupeMode === 'keep-last') {
      dedupedLines.reverse();
    }

    // 排序处理
    if (sortMode === 'asc') {
      dedupedLines.sort((a, b) => (caseSensitive ? a.localeCompare(b) : a.toLowerCase().localeCompare(b.toLowerCase())));
    } else if (sortMode === 'desc') {
      dedupedLines.sort((a, b) => (caseSensitive ? b.localeCompare(a) : b.toLowerCase().localeCompare(a.toLowerCase())));
    }

    return dedupedLines.join('\n');
  }, [input, dedupeMode, sortMode, caseSensitive]);

  const stats = useMemo(() => {
    const original = input.split('\n').filter((line) => line.trim()).length;
    const deduped = result.split('\n').filter((line) => line.trim()).length;
    const removed = original - deduped;
    return { original, deduped, removed };
  }, [input, result]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setSuccess('已复制到剪贴板！');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleClear = () => {
    setInput('');
  };

  const handleExample = () => {
    setInput('apple\nbanana\napple\norange\nbanana\ngrape\napple\nkiwi\norange');
  };

  return (
    <Container maxWidth="lg">
      <ToolDetailHeader
        title="去重工具"
        description="删除文本中的重复行，保持数据唯一性"
        toolPath="/tools/text/dedupe"
      />

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* 配置选项 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          去重选项
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>
              保留模式
            </Typography>
            <ToggleButtonGroup
              value={dedupeMode}
              exclusive
              onChange={(_, value) => value && setDedupeMode(value)}
              fullWidth
              size="small"
            >
              <ToggleButton value="keep-first">保留首次出现</ToggleButton>
              <ToggleButton value="keep-last">保留最后出现</ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>
              排序方式
            </Typography>
            <ToggleButtonGroup
              value={sortMode}
              exclusive
              onChange={(_, value) => value !== null && setSortMode(value)}
              fullWidth
              size="small"
            >
              <ToggleButton value="none">不排序</ToggleButton>
              <ToggleButton value="asc">升序</ToggleButton>
              <ToggleButton value="desc">降序</ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant={caseSensitive ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setCaseSensitive(!caseSensitive)}
            >
              区分大小写
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* 输入输出区域 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
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
              rows={15}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="每行输入一条数据..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                },
              }}
            />

            <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
              <FilterList fontSize="small" />
              <Typography variant="caption" color="text.secondary">
                总共 {stats.original} 行
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                去重结果
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

            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={`保留 ${stats.deduped} 行`} color="success" size="small" />
              <Chip label={`删除 ${stats.removed} 行`} color="error" size="small" />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 使用说明 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          使用说明
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • 每行一条数据，工具会自动删除重复的行
          <br />
          • <strong>保留首次出现</strong>：保留第一次出现的行，删除后续重复项
          <br />
          • <strong>保留最后出现</strong>：保留最后一次出现的行，删除之前的重复项
          <br />
          • <strong>区分大小写</strong>：开启后 "Apple" 和 "apple" 会被视为不同的行
          <br />• 可以选择对结果进行排序（升序或降序）
        </Typography>
      </Paper>
    </Container>
  );
};

