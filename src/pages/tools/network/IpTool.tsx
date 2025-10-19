import React, { useState, useEffect } from 'react';
import {
Container,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Stack,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { Public, ContentCopy, Refresh } from '@mui/icons-material';

interface IpInfo {
  ip: string;
  type: string;
  continent_code?: string;
  country?: string;
  country_code?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
}

export const IpTool: React.FC = () => {
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchIpInfo = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 使用免费的 IP API
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) {
        throw new Error('获取 IP 信息失败');
      }
      const data = await response.json();
      setIpInfo(data);
    } catch (err) {
      setError('无法获取 IP 信息：' + (err instanceof Error ? err.message : '网络错误'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIpInfo();
  }, []);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSuccess('已复制到剪贴板！');
    setTimeout(() => setSuccess(''), 2000);
  };

  return (
    <Container maxWidth="lg">
      <ToolDetailHeader
        title="IP 地址查询"
        description="查询您的公网 IP 地址和地理位置信息"
        toolPath="/tools/network/ip"
      />

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <CircularProgress />
        </Box>
      ) : ipInfo ? (
        <Grid container spacing={3}>
          {/* IP 信息卡片 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Public sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  IP 地址信息
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    公网 IP 地址
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={ipInfo.ip}
                      color="primary"
                      sx={{ fontFamily: 'monospace', fontSize: '1rem' }}
                    />
                    <Button size="small" startIcon={<ContentCopy />} onClick={() => handleCopy(ipInfo.ip)}>
                      复制
                    </Button>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    IP 类型
                  </Typography>
                  <Typography variant="body1">{ipInfo.type || 'IPv4'}</Typography>
                </Box>

                {ipInfo.isp && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      ISP 服务商
                    </Typography>
                    <Typography variant="body1">{ipInfo.isp}</Typography>
                  </Box>
                )}
              </Stack>

              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchIpInfo}
                fullWidth
                sx={{ mt: 3 }}
              >
                刷新信息
              </Button>
            </Paper>
          </Grid>

          {/* 地理位置卡片 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                地理位置信息
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                {ipInfo.country && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      国家/地区
                    </Typography>
                    <Typography variant="body1">
                      {ipInfo.country} ({ipInfo.country_code})
                    </Typography>
                  </Box>
                )}

                {ipInfo.region && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      省份/州
                    </Typography>
                    <Typography variant="body1">{ipInfo.region}</Typography>
                  </Box>
                )}

                {ipInfo.city && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      城市
                    </Typography>
                    <Typography variant="body1">{ipInfo.city}</Typography>
                  </Box>
                )}

                {ipInfo.timezone && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      时区
                    </Typography>
                    <Typography variant="body1">{ipInfo.timezone}</Typography>
                  </Box>
                )}

                {ipInfo.latitude && ipInfo.longitude && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      坐标
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {ipInfo.latitude.toFixed(4)}, {ipInfo.longitude.toFixed(4)}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>

          {/* 本机信息 */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                浏览器信息
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    浏览器语言
                  </Typography>
                  <Typography variant="body1">{navigator.language}</Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    在线状态
                  </Typography>
                  <Chip
                    label={navigator.onLine ? '在线' : '离线'}
                    color={navigator.onLine ? 'success' : 'error'}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    屏幕分辨率
                  </Typography>
                  <Typography variant="body1">
                    {window.screen.width} × {window.screen.height}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Cookie 已启用
                  </Typography>
                  <Chip
                    label={navigator.cookieEnabled ? '是' : '否'}
                    color={navigator.cookieEnabled ? 'success' : 'warning'}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      ) : null}

      {/* 使用说明 */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          使用说明
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • 本工具自动获取您的公网 IP 地址和地理位置信息
          <br />
          • 使用第三方 API 服务进行 IP 查询
          <br />
          • 地理位置信息基于 IP 地址数据库，可能存在一定偏差
          <br />
          • 点击"刷新信息"可重新获取最新数据
        </Typography>
      </Paper>
    </Container>
  );
};

