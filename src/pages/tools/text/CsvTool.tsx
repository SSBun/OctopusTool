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
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { ContentCopy, Clear, SwapHoriz } from '@mui/icons-material';

type Mode = 'csv-to-json' | 'json-to-csv';

export const CsvTool: React.FC = () => {
  const [mode, setMode] = useState<Mode>('csv-to-json');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const csvToJson = (csv: string) => {
    try {
      const lines = csv.trim().split('\n');
      if (lines.length < 2) throw new Error('CSV 至少需要包含标题行和数据行');

      const headers = lines[0].split(',').map((h) => h.trim());
      const data = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());
        const obj: Record<string, string> = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        data.push(obj);
      }

      return JSON.stringify(data, null, 2);
    } catch (err) {
      throw new Error('CSV 格式错误：' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  const jsonToCsv = (json: string) => {
    try {
      const data = JSON.parse(json);
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('JSON 必须是非空数组');
      }

      const headers = Object.keys(data[0]);
      const csvLines = [headers.join(',')];

      for (const item of data) {
        const values = headers.map((header) => {
          const value = item[header] || '';
          // 如果值包含逗号，需要用引号包裹
          return value.toString().includes(',') ? `"${value}"` : value;
        });
        csvLines.push(values.join(','));
      }

      return csvLines.join('\n');
    } catch (err) {
      throw new Error('JSON 格式错误：' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  const handleConvert = () => {
    setError('');
    setOutput('');

    if (!input.trim()) {
      setError('请输入要转换的内容');
      return;
    }

    try {
      const result = mode === 'csv-to-json' ? csvToJson(input) : jsonToCsv(input);
      setOutput(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '转换失败');
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSuccess('已复制到剪贴板！');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const handleSwapMode = () => {
    setMode(mode === 'csv-to-json' ? 'json-to-csv' : 'csv-to-json');
    setInput(output);
    setOutput('');
  };

  const handleExample = () => {
    if (mode === 'csv-to-json') {
      setInput('Name,Age,City\nJohn,30,New York\nJane,25,London\nBob,35,Tokyo');
    } else {
      setInput(
        JSON.stringify(
          [
            { Name: 'John', Age: 30, City: 'New York' },
            { Name: 'Jane', Age: 25, City: 'London' },
            { Name: 'Bob', Age: 35, City: 'Tokyo' },
          ],
          null,
          2
        )
      );
    }
    setOutput('');
    setError('');
  };

  // 预览 CSV 数据为表格
  const csvPreview = () => {
    if (mode !== 'csv-to-json' || !input.trim()) return null;

    try {
      const lines = input.trim().split('\n');
      const headers = lines[0].split(',').map((h) => h.trim());
      const rows = lines.slice(1).map((line) => line.split(',').map((v) => v.trim()));

      return (
        <TableContainer sx={{ maxHeight: 300, mt: 2 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {headers.map((header, index) => (
                  <TableCell key={index} sx={{ fontWeight: 600 }}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    } catch {
      return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          CSV 转换工具
        </Typography>
        <Typography color="text.secondary" paragraph>
          CSV 与 JSON 格式互相转换
        </Typography>
      </Box>

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

      {/* 模式选择 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          转换模式
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Stack direction="row" spacing={2} alignItems="center">
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, value) => value && setMode(value)}
            fullWidth
          >
            <ToggleButton value="csv-to-json">CSV → JSON</ToggleButton>
            <ToggleButton value="json-to-csv">JSON → CSV</ToggleButton>
          </ToggleButtonGroup>
          <Button variant="outlined" startIcon={<SwapHoriz />} onClick={handleSwapMode}>
            交换
          </Button>
        </Stack>
      </Paper>

      {/* 输入输出 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                输入 ({mode === 'csv-to-json' ? 'CSV' : 'JSON'})
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
              rows={12}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'csv-to-json'
                  ? 'Name,Age,City\nJohn,30,New York\nJane,25,London'
                  : '[\n  {"Name": "John", "Age": 30, "City": "New York"}\n]'
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                },
              }}
            />

            {csvPreview()}

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleConvert}
              disabled={!input.trim()}
            >
              转换
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                输出 ({mode === 'csv-to-json' ? 'JSON' : 'CSV'})
              </Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<ContentCopy />}
                onClick={() => handleCopy(output)}
                disabled={!output}
              >
                复制
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <TextField
              fullWidth
              multiline
              rows={12}
              value={output}
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
              <strong>CSV → JSON:</strong>
              <br />
              • 第一行为标题行（字段名）
              <br />
              • 后续行为数据行
              <br />
              • 使用逗号分隔字段
              <br />
              • 转换为 JSON 数组格式
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>JSON → CSV:</strong>
              <br />
              • JSON 必须是对象数组
              <br />
              • 使用第一个对象的键作为 CSV 标题
              <br />
              • 每个对象转换为一行
              <br />
              • 包含逗号的值会自动加引号
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

