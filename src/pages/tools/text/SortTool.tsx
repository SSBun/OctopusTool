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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { ContentCopy, Clear } from '@mui/icons-material';

type SortOrder = 'asc' | 'desc';
type SortBy = 'alphabetical' | 'numerical' | 'length';

export const SortTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [sortBy, setSortBy] = useState<SortBy>('alphabetical');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [success, setSuccess] = useState('');

  const result = useMemo(() => {
    if (!input.trim()) return '';

    let lines = input.split('\n');

    if (removeEmpty) {
      lines = lines.filter((line) => line.trim());
    }

    const sorted = [...lines].sort((a, b) => {
      let compareResult = 0;

      switch (sortBy) {
        case 'alphabetical':
          const aStr = caseSensitive ? a : a.toLowerCase();
          const bStr = caseSensitive ? b : b.toLowerCase();
          compareResult = aStr.localeCompare(bStr);
          break;

        case 'numerical':
          const aNum = parseFloat(a) || 0;
          const bNum = parseFloat(b) || 0;
          compareResult = aNum - bNum;
          break;

        case 'length':
          compareResult = a.length - b.length;
          break;
      }

      return sortOrder === 'asc' ? compareResult : -compareResult;
    });

    return sorted.join('\n');
  }, [input, sortOrder, sortBy, caseSensitive, removeEmpty]);

  const stats = {
    original: input.split('\n').length,
    sorted: result.split('\n').filter((line) => line.trim()).length,
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setSuccess('已复制到剪贴板！');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleClear = () => {
    setInput('');
  };

  const handleExample = () => {
    setInput('Zebra\nApple\nMango\nBanana\n10\n2\n100\nOrange\n1');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          文本排序工具
        </Typography>
        <Typography color="text.secondary" paragraph>
          按字母、数字或长度对文本行进行排序
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* 排序选项 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          排序选项
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>
              排序方式
            </Typography>
            <ToggleButtonGroup
              value={sortBy}
              exclusive
              onChange={(_, value) => value && setSortBy(value)}
              fullWidth
              size="small"
            >
              <ToggleButton value="alphabetical">字母顺序</ToggleButton>
              <ToggleButton value="numerical">数字大小</ToggleButton>
              <ToggleButton value="length">长度</ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>
              排序方向
            </Typography>
            <ToggleButtonGroup
              value={sortOrder}
              exclusive
              onChange={(_, value) => value && setSortOrder(value)}
              fullWidth
              size="small"
            >
              <ToggleButton value="asc">升序 (A→Z)</ToggleButton>
              <ToggleButton value="desc">降序 (Z→A)</ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={caseSensitive}
                    onChange={(e) => setCaseSensitive(e.target.checked)}
                  />
                }
                label="区分大小写"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={removeEmpty}
                    onChange={(e) => setRemoveEmpty(e.target.checked)}
                  />
                }
                label="移除空行"
              />
            </Stack>
          </Grid>
        </Grid>
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
              placeholder="每行输入一条数据..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                },
              }}
            />

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              共 {stats.original} 行
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                排序结果
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

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              共 {stats.sorted} 行
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* 使用说明 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          使用说明
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • <strong>字母顺序</strong>：按照字母顺序排序，支持中英文
          <br />
          • <strong>数字大小</strong>：将每行作为数字排序（非数字行按 0 处理）
          <br />
          • <strong>按长度</strong>：按照每行字符数排序
          <br />
          • <strong>升序</strong>：从小到大（A→Z, 0→9, 短→长）
          <br />
          • <strong>降序</strong>：从大到小（Z→A, 9→0, 长→短）
          <br />
          • <strong>区分大小写</strong>：开启后 "A" 和 "a" 会被区别对待
          <br />• <strong>移除空行</strong>：自动删除空白行
        </Typography>
      </Paper>
    </Container>
  );
};

