import React, { useState } from 'react';
import {
Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  Alert,
  Stack,
  Divider,
  Chip,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { Send, ContentCopy, Clear, Add, Delete } from '@mui/icons-material';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface Header {
  key: string;
  value: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const HttpTool: React.FC = () => {
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState<Header[]>([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState('');
  const [responseHeaders, setResponseHeaders] = useState('');
  const [status, setStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const handleSendRequest = async () => {
    if (!url.trim()) {
      setError('请输入 URL');
      return;
    }

    setLoading(true);
    setError('');
    setResponse('');
    setResponseHeaders('');
    setStatus(null);
    setResponseTime(null);

    const startTime = performance.now();

    try {
      const requestHeaders: Record<string, string> = {};
      headers.forEach((header) => {
        if (header.key.trim() && header.value.trim()) {
          requestHeaders[header.key.trim()] = header.value.trim();
        }
      });

      const options: RequestInit = {
        method,
        headers: requestHeaders,
      };

      if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));

      setStatus(res.status);

      // 获取响应头
      const resHeaders: string[] = [];
      res.headers.forEach((value, key) => {
        resHeaders.push(`${key}: ${value}`);
      });
      setResponseHeaders(resHeaders.join('\n'));

      // 获取响应体
      const contentType = res.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const json = await res.json();
        setResponse(JSON.stringify(json, null, 2));
      } else {
        const text = await res.text();
        setResponse(text);
      }

      setSuccess('请求成功！');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('请求失败：' + (err instanceof Error ? err.message : '未知错误'));
      setResponse('');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const handleClear = () => {
    setUrl('');
    setHeaders([{ key: '', value: '' }]);
    setBody('');
    setResponse('');
    setResponseHeaders('');
    setStatus(null);
    setError('');
    setResponseTime(null);
  };

  const handleExample = () => {
    setMethod('GET');
    setUrl('https://api.github.com/users/github');
    setHeaders([{ key: 'Accept', value: 'application/json' }]);
    setBody('');
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSuccess('已复制到剪贴板！');
    setTimeout(() => setSuccess(''), 2000);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'success';
    if (status >= 300 && status < 400) return 'info';
    if (status >= 400 && status < 500) return 'warning';
    if (status >= 500) return 'error';
    return 'default';
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader
        title="HTTP 请求测试"
        description="在线发送 HTTP 请求，测试 API 接口"
        toolPath="/tools/network/http-request"
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

      <Grid container spacing={3}>
        {/* 请求配置 */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              请求配置
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={3}>
              {/* 请求方法和 URL */}
              <Stack direction="row" spacing={2}>
                <TextField
                  select
                  label="方法"
                  value={method}
                  onChange={(e) => setMethod(e.target.value as HttpMethod)}
                  sx={{ width: 120 }}
                >
                  <MenuItem value="GET">GET</MenuItem>
                  <MenuItem value="POST">POST</MenuItem>
                  <MenuItem value="PUT">PUT</MenuItem>
                  <MenuItem value="DELETE">DELETE</MenuItem>
                  <MenuItem value="PATCH">PATCH</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://api.example.com/endpoint"
                />
              </Stack>

              {/* 请求头 */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2">请求头 (Headers)</Typography>
                  <Button size="small" startIcon={<Add />} onClick={handleAddHeader}>
                    添加
                  </Button>
                </Box>
                {headers.map((header, index) => (
                  <Stack key={index} direction="row" spacing={1} sx={{ mb: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Key"
                      value={header.key}
                      onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      size="small"
                      placeholder="Value"
                      value={header.value}
                      onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                      sx={{ flex: 1 }}
                    />
                    {headers.length > 1 && (
                      <IconButton size="small" onClick={() => handleRemoveHeader(index)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                ))}
              </Box>

              {/* 请求体 */}
              {['POST', 'PUT', 'PATCH'].includes(method) && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    请求体 (Body)
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder='{"key": "value"}'
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                </Box>
              )}

              {/* 操作按钮 */}
              <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<Send />}
                  onClick={handleSendRequest}
                  disabled={loading}
                  sx={{ flex: '1 1 auto', minWidth: 120 }}
                >
                  {loading ? '发送中...' : '发送请求'}
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Clear />} 
                  onClick={handleClear}
                  sx={{ flex: '0 1 auto', minWidth: 100 }}
                >
                  清空
                </Button>
                <Button 
                  variant="text" 
                  onClick={handleExample}
                  sx={{ flex: '0 1 auto', minWidth: 100 }}
                >
                  示例
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        {/* 响应结果 */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                响应结果
              </Typography>
              {status !== null && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={`状态: ${status}`} color={getStatusColor(status)} size="small" />
                  {responseTime !== null && (
                    <Chip label={`${responseTime}ms`} size="small" variant="outlined" />
                  )}
                </Stack>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />

            {response || responseHeaders ? (
              <Box>
                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
                  <Tab label="响应体" />
                  <Tab label="响应头" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                  <Box sx={{ position: 'relative' }}>
                    <Button
                      size="small"
                      startIcon={<ContentCopy />}
                      onClick={() => handleCopy(response)}
                      sx={{ position: 'absolute', top: 0, right: 0, zIndex: 1 }}
                    >
                      复制
                    </Button>
                    <TextField
                      fullWidth
                      multiline
                      rows={20}
                      value={response}
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
                  </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Box sx={{ position: 'relative' }}>
                    <Button
                      size="small"
                      startIcon={<ContentCopy />}
                      onClick={() => handleCopy(responseHeaders)}
                      sx={{ position: 'absolute', top: 0, right: 0, zIndex: 1 }}
                    >
                      复制
                    </Button>
                    <TextField
                      fullWidth
                      multiline
                      rows={20}
                      value={responseHeaders}
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
                  </Box>
                </TabPanel>
              </Box>
            ) : (
              <Box
                sx={{
                  height: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'background.default',
                  borderRadius: 1,
                }}
              >
                <Typography color="text.secondary">
                  发送请求后，响应结果将显示在这里
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 使用说明 */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          使用说明
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • 支持 GET、POST、PUT、DELETE、PATCH 等常见 HTTP 方法
          <br />
          • 可自定义请求头（Headers）和请求体（Body）
          <br />
          • 自动检测 JSON 响应并格式化显示
          <br />
          • 显示响应状态码、响应头和响应时间
          <br />• 注意：部分网站可能因 CORS 策略限制无法直接访问
        </Typography>
      </Paper>
    </Container>
  );
};

