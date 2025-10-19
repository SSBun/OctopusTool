import React, { useState, useEffect } from 'react';
import {
Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Stack,
  Divider,
  Grid,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { ContentCopy, Clear, Link as LinkIcon } from '@mui/icons-material';

interface ParsedUrl {
  href: string;
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
  host: string;
  searchParams: Record<string, string>;
}

export const UrlParserTool: React.FC = () => {
  const [url, setUrl] = useState('');
  const [parsed, setParsed] = useState<ParsedUrl | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (url.trim()) {
      handleParse();
    } else {
      setParsed(null);
    }
  }, [url]);

  const handleParse = () => {
    if (!url.trim()) {
      setError('请输入 URL');
      return;
    }

    try {
      const urlObj = new URL(url);
      const searchParams: Record<string, string> = {};
      urlObj.searchParams.forEach((value, key) => {
        searchParams[key] = value;
      });

      setParsed({
        href: urlObj.href,
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        port: urlObj.port || '(默认)',
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash,
        origin: urlObj.origin,
        host: urlObj.host,
        searchParams,
      });
      setError('');
    } catch (err) {
      setError('无效的 URL 格式。请确保包含协议（如 http:// 或 https://）');
      setParsed(null);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSuccess('已复制到剪贴板！');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleClear = () => {
    setUrl('');
    setParsed(null);
    setError('');
  };

  const handleExample = () => {
    setUrl('https://www.example.com:8080/path/to/page?name=value&foo=bar#section');
  };

  return (
    <Container maxWidth="lg">
      <ToolDetailHeader
        title="URL 解析器"
        description="解析 URL 的各个组成部分，包括协议、域名、路径、参数等"
        toolPath="/tools/network/url-parser"
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

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          输入 URL
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Stack spacing={2}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.example.com:8080/path?param=value#hash"
            helperText="请输入完整的 URL（包含协议）"
          />

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<Clear />} onClick={handleClear}>
              清空
            </Button>
            <Button variant="text" onClick={handleExample}>
              加载示例
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {parsed && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                基本信息
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, width: '30%' }}>完整 URL (href)</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ flex: 1, wordBreak: 'break-all' }}>
                          {parsed.href}
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<ContentCopy />}
                          onClick={() => handleCopy(parsed.href)}
                        >
                          复制
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>协议 (protocol)</TableCell>
                    <TableCell>{parsed.protocol}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>主机名 (hostname)</TableCell>
                    <TableCell>{parsed.hostname}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>端口 (port)</TableCell>
                    <TableCell>{parsed.port}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>主机 (host)</TableCell>
                    <TableCell>{parsed.host}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>源 (origin)</TableCell>
                    <TableCell>{parsed.origin}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>路径 (pathname)</TableCell>
                    <TableCell>{parsed.pathname || '/'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>查询字符串 (search)</TableCell>
                    <TableCell>{parsed.search || '(无)'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>哈希 (hash)</TableCell>
                    <TableCell>{parsed.hash || '(无)'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {Object.keys(parsed.searchParams).length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                查询参数 (Query Parameters)
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <TableContainer>
                <Table>
                  <TableBody>
                    {Object.entries(parsed.searchParams).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell sx={{ fontWeight: 600, width: '40%' }}>{key}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ flex: 1, wordBreak: 'break-all' }}>
                              {value}
                            </Typography>
                            <Button
                              size="small"
                              startIcon={<ContentCopy />}
                              onClick={() => handleCopy(value)}
                            >
                              复制
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </>
      )}

      {!parsed && !error && (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            bgcolor: 'background.default',
          }}
        >
          <LinkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography color="text.secondary">
            输入 URL 后将自动解析其组成部分
          </Typography>
        </Paper>
      )}

      {/* 使用说明 */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          URL 组成部分说明
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>protocol:</strong> 协议（如 https:）
              <br />
              <strong>hostname:</strong> 主机名（如 www.example.com）
              <br />
              <strong>port:</strong> 端口号（如 8080）
              <br />
              <strong>host:</strong> 主机（hostname + port）
              <br />
              <strong>origin:</strong> 源（protocol + host）
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>pathname:</strong> 路径（如 /path/to/page）
              <br />
              <strong>search:</strong> 查询字符串（如 ?name=value）
              <br />
              <strong>hash:</strong> 哈希/锚点（如 #section）
              <br />
              <strong>href:</strong> 完整的 URL
              <br />
              <strong>searchParams:</strong> 解析后的查询参数
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

