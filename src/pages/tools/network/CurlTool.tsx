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
  MenuItem,
  Tabs,
  Tab,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { ContentCopy, Clear, SwapHoriz, Add, Delete } from '@mui/icons-material';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

interface Header {
  key: string;
  value: string;
}

export const CurlTool: React.FC = () => {
  const [mode, setMode] = useState<'generate' | 'parse'>('generate');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState<Header[]>([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [curlCommand, setCurlCommand] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [executing, setExecuting] = useState(false);
  const [response, setResponse] = useState('');
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [useProxy, setUseProxy] = useState(true); // 默认启用代理
  const [proxyUrl, setProxyUrl] = useState('https://api.allorigins.win/raw?url=');

  // 生成 curl 命令
  const generatedCurl = useMemo(() => {
    if (!url.trim()) return '';

    let cmd = 'curl';

    // 添加请求方法
    if (method !== 'GET') {
      cmd += ` -X ${method}`;
    }

    // 添加请求头
    headers.forEach((header) => {
      if (header.key.trim() && header.value.trim()) {
        cmd += ` \\\n  -H "${header.key}: ${header.value}"`;
      }
    });

    // 添加请求体
    if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
      const escapedBody = body.replace(/"/g, '\\"').replace(/\n/g, '');
      cmd += ` \\\n  -d "${escapedBody}"`;
    }

    // 添加 URL
    cmd += ` \\\n  "${url}"`;

    return cmd;
  }, [method, url, headers, body]);

  // 解析 curl 命令
  const parseCurl = () => {
    try {
      setError('');
      if (!curlCommand.trim()) {
        setError('请输入 curl 命令');
        return;
      }

      // 移除换行和多余空格
      const cmd = curlCommand.replace(/\\\n/g, ' ').replace(/\s+/g, ' ').trim();

      // 提取 URL
      const urlMatch = cmd.match(/"([^"]+)"(?:\s*$)/);
      if (urlMatch) {
        setUrl(urlMatch[1]);
      }

      // 提取方法
      const methodMatch = cmd.match(/-X\s+([A-Z]+)/);
      if (methodMatch) {
        setMethod(methodMatch[1] as HttpMethod);
      } else {
        setMethod('GET');
      }

      // 提取请求头
      const headerMatches = cmd.matchAll(/-H\s+"((?:[^"\\]|\\.)*)"/g);
      const parsedHeaders: Header[] = [];
      for (const match of headerMatches) {
        const headerValue = match[1].replace(/\\"/g, '"');
        const [key, value] = headerValue.split(':', 2);
        if (key && value) {
          parsedHeaders.push({ key: key.trim(), value: value.trim() });
        }
      }
      setHeaders(parsedHeaders.length > 0 ? parsedHeaders : [{ key: '', value: '' }]);

      // 提取请求体
      const dataMatch = cmd.match(/-d\s+"((?:[^"\\]|\\.)*)"/);
      if (dataMatch) {
        const unescapedBody = dataMatch[1].replace(/\\"/g, '"');
        setBody(unescapedBody);
      } else {
        setBody('');
      }

      setSuccess('curl 命令解析成功！');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('解析失败：' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSuccess('已复制到剪贴板！');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleClear = () => {
    setMethod('GET');
    setUrl('');
    setHeaders([{ key: '', value: '' }]);
    setBody('');
    setCurlCommand('');
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

  const handleExample = () => {
    setMethod('POST');
    setUrl('https://api.example.com/users');
    setHeaders([
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Authorization', value: 'Bearer token123' },
    ]);
    setBody('{"name":"John","email":"john@example.com"}');
  };

  const handleExampleCurl = () => {
    setCurlCommand(
      `curl -X POST \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer token123" \\
  -d "{\\"name\\":\\"John\\",\\"email\\":\\"john@example.com\\"}" \\
  "https://api.example.com/users"`
    );
  };

  // 在终端执行
  const handleExecuteInTerminal = async () => {
    if (!generatedCurl) {
      setError('请先配置请求参数');
      return;
    }

    // 检测操作系统
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isWindows = navigator.platform.toUpperCase().indexOf('WIN') >= 0;

    // 对于 macOS，创建 .command 文件下载
    if (isMac) {
      try {
        // 创建脚本内容
        const scriptContent = `#!/bin/bash
# Octopus Curl 命令执行脚本
# 生成时间: ${new Date().toLocaleString()}

echo "=========================================="
echo "正在执行 Curl 请求..."
echo "=========================================="
echo ""

${generatedCurl}

echo ""
echo "=========================================="
echo "请求执行完成！"
echo "=========================================="
echo ""
echo "按任意键关闭窗口..."
read -n 1
`;
        
        // 创建 Blob 并下载
        const blob = new Blob([scriptContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'curl-request.command';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setSuccess(
          '✅ 脚本已下载！\n\n' +
          '接下来请执行：\n' +
          '1. 找到下载的 curl-request.command 文件\n' +
          '2. 右键点击 → "打开方式" → "终端"\n' +
          '3. 或在终端中运行：chmod +x ~/Downloads/curl-request.command && ~/Downloads/curl-request.command'
        );
        setTimeout(() => setSuccess(''), 10000);
      } catch (err) {
        setError('下载失败，请尝试手动复制命令');
      }
    } 
    // 对于 Windows，创建 .bat 文件下载
    else if (isWindows) {
      try {
        const scriptContent = `@echo off
chcp 65001 > nul
echo ==========================================
echo 正在执行 Curl 请求...
echo ==========================================
echo.

${generatedCurl}

echo.
echo ==========================================
echo 请求执行完成！
echo ==========================================
echo.
pause
`;
        
        const blob = new Blob([scriptContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'curl-request.bat';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setSuccess(
          '✅ 脚本已下载！\n\n' +
          '接下来请执行：\n' +
          '1. 找到下载的 curl-request.bat 文件\n' +
          '2. 双击运行即可\n' +
          '3. 或右键 → "以管理员身份运行"'
        );
        setTimeout(() => setSuccess(''), 10000);
      } catch (err) {
        setError('下载失败，请尝试手动复制命令');
      }
    }
    // Linux 和其他系统
    else {
      try {
        await navigator.clipboard.writeText(generatedCurl);
        setSuccess(
          '✅ Curl 命令已复制到剪贴板！\n\n' +
          '请打开终端并粘贴命令执行'
        );
        setTimeout(() => setSuccess(''), 8000);
      } catch (err) {
        setError('复制失败，请手动复制命令');
      }
    }
  };

  // 执行请求
  const handleExecuteRequest = async () => {
    if (!url.trim()) {
      setError('请输入 URL');
      return;
    }

    setExecuting(true);
    setError('');
    setResponse('');
    setStatusCode(null);
    setResponseTime(null);

    const startTime = performance.now();

    try {
      // 处理 URL，确保有协议前缀
      let requestUrl = url.trim();
      if (!requestUrl.match(/^https?:\/\//i)) {
        requestUrl = 'https://' + requestUrl;
      }

      // 验证 URL 格式
      try {
        new URL(requestUrl);
      } catch (urlError) {
        setError('URL 格式不正确，请检查');
        setExecuting(false);
        return;
      }

      // 如果启用代理，修改请求 URL
      let finalUrl = requestUrl;
      if (useProxy) {
        finalUrl = proxyUrl + encodeURIComponent(requestUrl);
      }

      const requestHeaders: Record<string, string> = {};
      headers.forEach((header) => {
        if (header.key.trim() && header.value.trim()) {
          requestHeaders[header.key.trim()] = header.value.trim();
        }
      });

      const options: RequestInit = {
        method: useProxy ? 'GET' : method, // 代理只支持GET
        headers: useProxy ? {} : requestHeaders, // 代理不转发自定义请求头
        mode: 'cors',
      };

      // 如果使用代理，不发送请求体（代理限制）
      if (!useProxy && ['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
        options.body = body;
      }

      const res = await fetch(finalUrl, options);
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));

      setStatusCode(res.status);

      // 获取响应体
      const contentType = res.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const json = await res.json();
        setResponse(JSON.stringify(json, null, 2));
      } else {
        const text = await res.text();
        setResponse(text);
      }

      setSuccess(useProxy ? '请求执行成功！（通过代理）' : '请求执行成功！');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      let errorMessage = '请求失败：';
      
      if (err instanceof TypeError) {
        // 网络错误或CORS错误
        if (useProxy) {
          errorMessage += '网络错误或代理服务不可用。提示：';
          errorMessage += '\n• 尝试切换其他代理服务器';
          errorMessage += '\n• 检查目标 URL 是否正确';
          errorMessage += '\n• 某些网站可能阻止代理访问';
        } else {
          errorMessage += '网络错误或跨域限制（CORS）。提示：';
          errorMessage += '\n• 尝试启用上方的「CORS 代理」功能';
          errorMessage += '\n• 或使用生成的 curl 命令在终端执行';
          errorMessage += '\n• 确保目标服务器允许跨域请求';
        }
      } else if (err instanceof Error) {
        errorMessage += err.message;
      } else {
        errorMessage += '未知错误';
      }
      
      setError(errorMessage);
      setResponse('');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader
        title="Curl 命令工具"
        description="生成和解析 curl 命令，快速构建 HTTP 请求"
        toolPath="/tools/network/curl"
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

      {/* 模式切换 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Tabs value={mode === 'generate' ? 0 : 1} onChange={(_, v) => setMode(v === 0 ? 'generate' : 'parse')}>
            <Tab label="生成 Curl 命令" />
            <Tab label="解析 Curl 命令" />
          </Tabs>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SwapHoriz />}
            onClick={() => setMode(mode === 'generate' ? 'parse' : 'generate')}
          >
            切换模式
          </Button>
        </Stack>
      </Paper>

      {/* 生成模式 */}
      {mode === 'generate' && (
        <>
          {/* 代理设置 */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={useProxy}
                      onChange={(e) => setUseProxy(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        启用 CORS 代理
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        解决跨域限制，支持访问任何 API（仅 GET 请求）
                      </Typography>
                    </Box>
                  }
                />
                {useProxy && (
                  <Chip
                    label="已启用"
                    color="success"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Box>

              {useProxy && (
                <FormControl fullWidth size="small">
                  <InputLabel>代理服务器</InputLabel>
                  <Select
                    value={proxyUrl}
                    onChange={(e) => setProxyUrl(e.target.value)}
                    label="代理服务器"
                  >
                    <MenuItem value="https://api.allorigins.win/raw?url=">
                      AllOrigins (推荐) - api.allorigins.win
                    </MenuItem>
                    <MenuItem value="https://cors-anywhere.herokuapp.com/">
                      CORS Anywhere - cors-anywhere.herokuapp.com
                    </MenuItem>
                    <MenuItem value="https://api.codetabs.com/v1/proxy?quest=">
                      CodeTabs - api.codetabs.com
                    </MenuItem>
                  </Select>
                </FormControl>
              )}

              {useProxy && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  <Typography variant="caption">
                    <strong>注意：</strong>使用代理时，仅支持 GET 请求，自定义请求头和请求体将被忽略。POST/PUT 等请求请关闭代理或使用终端 curl 命令。
                  </Typography>
                </Alert>
              )}
            </Stack>
          </Paper>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    请求配置
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
                    <MenuItem value="HEAD">HEAD</MenuItem>
                    <MenuItem value="OPTIONS">OPTIONS</MenuItem>
                  </TextField>
                  <TextField
                    fullWidth
                    label="URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://api.example.com/endpoint"
                    helperText="支持完整URL（https://example.com）或简写（example.com，将自动添加 https://）"
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
                    <Stack key={index} direction="row" spacing={1} sx={{ mb: 1, alignItems: 'center' }}>
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
                        <IconButton 
                          size="small" 
                          onClick={() => handleRemoveHeader(index)}
                          sx={{
                            bgcolor: 'error.main',
                            color: 'white',
                            width: 32,
                            height: 32,
                            '&:hover': {
                              bgcolor: 'error.dark',
                            },
                          }}
                        >
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
                      rows={6}
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
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    生成的 Curl 命令
                  </Typography>
                  {useProxy && (
                    <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      🌐 使用代理模式（可跨域）
                    </Typography>
                  )}
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="success"
                    onClick={handleExecuteRequest}
                    disabled={!url.trim() || executing}
                    sx={{ flex: '0 1 auto', minWidth: 120 }}
                  >
                    {executing ? '执行中...' : useProxy ? '▶ 通过代理执行' : '▶ 执行请求'}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={handleExecuteInTerminal}
                    disabled={!generatedCurl}
                    sx={{ flex: '0 1 auto', minWidth: 100 }}
                  >
                    🖥️ 终端执行
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<ContentCopy />}
                    onClick={() => handleCopy(generatedCurl)}
                    disabled={!generatedCurl}
                    sx={{ flex: '0 1 auto', minWidth: 80 }}
                  >
                    复制
                  </Button>
                </Stack>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <TextField
                fullWidth
                multiline
                rows={12}
                value={generatedCurl}
                InputProps={{ readOnly: true }}
                placeholder="配置请求后将自动生成 curl 命令"
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

            {/* 响应结果 */}
            {(response || statusCode !== null) && (
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    响应结果
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {statusCode !== null && (
                      <Chip
                        label={`状态: ${statusCode}`}
                        color={statusCode >= 200 && statusCode < 300 ? 'success' : statusCode >= 400 ? 'error' : 'warning'}
                        size="small"
                      />
                    )}
                    {responseTime !== null && (
                      <Chip label={`${responseTime}ms`} size="small" variant="outlined" />
                    )}
                  </Stack>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Tabs value={0} sx={{ mb: 2 }}>
                  <Tab label="响应体" />
                </Tabs>

                <TextField
                  fullWidth
                  multiline
                  rows={10}
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
              </Paper>
            )}
          </Grid>
        </Grid>
        </>
      )}

      {/* 解析模式 */}
      {mode === 'parse' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Curl 命令
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="outlined" startIcon={<Clear />} onClick={handleClear}>
                    清空
                  </Button>
                  <Button size="small" variant="text" onClick={handleExampleCurl}>
                    示例
                  </Button>
                </Stack>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <TextField
                fullWidth
                multiline
                rows={15}
                value={curlCommand}
                onChange={(e) => setCurlCommand(e.target.value)}
                placeholder="粘贴 curl 命令..."
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                  },
                }}
              />

              <Button variant="contained" fullWidth onClick={parseCurl}>
                解析命令
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                解析结果
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    请求方法
                  </Typography>
                  <Chip label={method} color="primary" />
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    URL
                  </Typography>
                  <Typography
                    sx={{
                      p: 1.5,
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      wordBreak: 'break-all',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                    }}
                  >
                    {url || '(未设置)'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    请求头 ({headers.filter((h) => h.key && h.value).length} 个)
                  </Typography>
                  {headers.filter((h) => h.key && h.value).length > 0 ? (
                    headers
                      .filter((h) => h.key && h.value)
                      .map((header, index) => (
                        <Box
                          key={index}
                          sx={{
                            p: 1,
                            mb: 1,
                            bgcolor: 'background.default',
                            borderRadius: 1,
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                          }}
                        >
                          <strong>{header.key}:</strong> {header.value}
                        </Box>
                      ))
                  ) : (
                    <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      无请求头
                    </Typography>
                  )}
                </Box>

                {body && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      请求体
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      value={body}
                      InputProps={{ readOnly: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                          backgroundColor: 'background.default',
                        },
                      }}
                    />
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* 使用说明 */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          使用说明
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>生成 Curl 命令：</strong>
              <br />
              • 配置 HTTP 请求的各项参数
              <br />
              • 自动生成标准的 curl 命令
              <br />
              • 支持自定义请求头和请求体
              <br />• 一键复制到终端执行
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>解析 Curl 命令：</strong>
              <br />
              • 粘贴 curl 命令自动解析
              <br />
              • 提取 URL、方法、请求头等信息
              <br />
              • 清晰展示所有请求参数
              <br />• 方便理解和调试请求
            </Typography>
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>提示：</strong>
          <br />
          • 生成的命令使用反斜杠 (\) 进行换行，方便阅读
          <br />
          • 支持常见的 curl 选项：-X (方法)、-H (请求头)、-d (数据)
          <br />• 解析功能支持标准格式的 curl 命令
        </Alert>
      </Paper>
    </Container>
  );
};

