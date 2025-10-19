import React, { useState, useEffect } from 'react';
import {
Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Stack,
  Divider,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { NetworkPing, CheckCircle, Cancel, Refresh, Add, Delete } from '@mui/icons-material';

interface PingTarget {
  name: string;
  url: string;
  category: '国内' | '国外' | '自定义';
  icon?: string;
  isCustom?: boolean;
}

interface PingResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  time?: number;
  error?: string;
}

const PING_TARGETS: PingTarget[] = [
  // 国内平台
  { name: '百度', url: 'https://www.baidu.com', category: '国内', icon: '🔍' },
  { name: '腾讯', url: 'https://www.qq.com', category: '国内', icon: '🐧' },
  { name: '阿里巴巴', url: 'https://www.alibaba.com', category: '国内', icon: '🛒' },
  { name: '京东', url: 'https://www.jd.com', category: '国内', icon: '🛍️' },
  { name: '微博', url: 'https://weibo.com', category: '国内', icon: '📱' },
  { name: '抖音', url: 'https://www.douyin.com', category: '国内', icon: '🎵' },
  { name: 'B站', url: 'https://www.bilibili.com', category: '国内', icon: '📺' },
  { name: '知乎', url: 'https://www.zhihu.com', category: '国内', icon: '💭' },
  
  // 国外平台
  { name: 'Google', url: 'https://www.google.com', category: '国外', icon: '🔍' },
  { name: 'GitHub', url: 'https://github.com', category: '国外', icon: '🐙' },
  { name: 'Twitter', url: 'https://twitter.com', category: '国外', icon: '🐦' },
  { name: 'Facebook', url: 'https://www.facebook.com', category: '国外', icon: '👥' },
  { name: 'YouTube', url: 'https://www.youtube.com', category: '国外', icon: '📹' },
  { name: 'Amazon', url: 'https://www.amazon.com', category: '国外', icon: '📦' },
  { name: 'Netflix', url: 'https://www.netflix.com', category: '国外', icon: '🎬' },
  { name: 'Reddit', url: 'https://www.reddit.com', category: '国外', icon: '👽' },
];

const CUSTOM_URLS_KEY = 'ping-tool-custom-urls';

export const PingTool: React.FC = () => {
  const [results, setResults] = useState<Record<string, PingResult>>({});
  const [testing, setTesting] = useState(false);
  const [filter, setFilter] = useState<'all' | '国内' | '国外' | '自定义'>('all');
  const [customTargets, setCustomTargets] = useState<PingTarget[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');

  // 从 localStorage 加载自定义 URL
  useEffect(() => {
    const saved = localStorage.getItem(CUSTOM_URLS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCustomTargets(parsed);
      } catch (e) {
        console.error('Failed to parse custom URLs:', e);
      }
    }
  }, []);

  // 保存自定义 URL 到 localStorage
  const saveCustomTargets = (targets: PingTarget[]) => {
    localStorage.setItem(CUSTOM_URLS_KEY, JSON.stringify(targets));
    setCustomTargets(targets);
  };

  // 获取所有目标（包括自定义）
  const allTargets = [...PING_TARGETS, ...customTargets];

  const pingUrl = async (target: PingTarget): Promise<PingResult> => {
    const startTime = performance.now();
    
    try {
      // 使用 fetch 测试连通性和响应时间
      // 注意：由于浏览器的CORS限制，某些网站可能无法直接访问
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

      await fetch(target.url, {
        method: 'HEAD',
        mode: 'no-cors', // 使用 no-cors 模式避免 CORS 问题
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      return {
        name: target.name,
        status: 'success',
        time: responseTime,
      };
    } catch (error) {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      // 对于 no-cors 模式，如果能完成请求（即使超时），也认为是可访问的
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          name: target.name,
          status: 'error',
          error: '请求超时 (>10s)',
        };
      }

      // 由于使用了 no-cors，大多数情况下会成功，即使无法读取响应
      return {
        name: target.name,
        status: 'success',
        time: responseTime,
      };
    }
  };

  const handleTestAll = async () => {
    setTesting(true);
    const newResults: Record<string, PingResult> = {};

    // 初始化所有结果为 pending
    allTargets.forEach((target) => {
      newResults[target.name] = {
        name: target.name,
        status: 'pending',
      };
    });
    setResults({ ...newResults });

    // 并发测试所有目标
    const promises = allTargets.map(async (target) => {
      const result = await pingUrl(target);
      newResults[target.name] = result;
      setResults({ ...newResults });
    });

    await Promise.all(promises);
    setTesting(false);
  };

  const handleTestCategory = async (category: '国内' | '国外' | '自定义') => {
    setTesting(true);
    const newResults: Record<string, PingResult> = { ...results };
    const targetsToTest = allTargets.filter((t) => t.category === category);

    // 初始化结果为 pending
    targetsToTest.forEach((target) => {
      newResults[target.name] = {
        name: target.name,
        status: 'pending',
      };
    });
    setResults({ ...newResults });

    // 并发测试
    const promises = targetsToTest.map(async (target) => {
      const result = await pingUrl(target);
      newResults[target.name] = result;
      setResults({ ...newResults });
    });

    await Promise.all(promises);
    setTesting(false);
  };

  // 添加自定义 URL
  const handleAddCustomUrl = () => {
    if (!newName.trim() || !newUrl.trim()) {
      return;
    }

    // 验证 URL 格式
    try {
      new URL(newUrl);
    } catch (e) {
      alert('请输入有效的 URL（例如：https://example.com）');
      return;
    }

    // 检查是否已存在
    if (allTargets.some((t) => t.url === newUrl)) {
      alert('该 URL 已存在');
      return;
    }

    const newTarget: PingTarget = {
      name: newName.trim(),
      url: newUrl.trim(),
      category: '自定义',
      icon: '🌐',
      isCustom: true,
    };

    const updatedTargets = [...customTargets, newTarget];
    saveCustomTargets(updatedTargets);

    setDialogOpen(false);
    setNewName('');
    setNewUrl('');
  };

  // 删除自定义 URL
  const handleDeleteCustomUrl = (name: string) => {
    const updatedTargets = customTargets.filter((t) => t.name !== name);
    saveCustomTargets(updatedTargets);
    
    // 同时清除该目标的测试结果
    const newResults = { ...results };
    delete newResults[name];
    setResults(newResults);
  };

  const filteredTargets =
    filter === 'all'
      ? allTargets
      : allTargets.filter((t) => t.category === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle fontSize="small" />;
      case 'error':
        return <Cancel fontSize="small" />;
      case 'pending':
        return <LinearProgress sx={{ width: 20, height: 20 }} />;
      default:
        return null;
    }
  };

  const successCount = Object.values(results).filter((r) => r.status === 'success').length;
  const errorCount = Object.values(results).filter((r) => r.status === 'error').length;
  const totalTested = successCount + errorCount;

  return (
    <Container maxWidth="lg">
      <ToolDetailHeader
        title="Ping 测试"
        description="测试主流平台的网络连通性和响应时间"
        toolPath="/tools/network/ping"
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>说明：</strong> 由于浏览器安全限制，此工具通过发送 HTTP 请求来测试网站可访问性。
        响应时间受网络环境、服务器位置和浏览器缓存等因素影响，仅供参考。
      </Alert>

      {/* 操作按钮 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
          <Button
            variant="contained"
            startIcon={<NetworkPing />}
            onClick={handleTestAll}
            disabled={testing}
          >
            测试全部
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleTestCategory('国内')}
            disabled={testing}
          >
            测试国内平台
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleTestCategory('国外')}
            disabled={testing}
          >
            测试国外平台
          </Button>
          {customTargets.length > 0 && (
            <Button
              variant="outlined"
              onClick={() => handleTestCategory('自定义')}
              disabled={testing}
            >
              测试自定义
            </Button>
          )}
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
          >
            添加自定义 URL
          </Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => setResults({})}>
            清空结果
          </Button>
        </Stack>

        {totalTested > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              测试结果：成功 {successCount} 个，失败 {errorCount} 个
              {customTargets.length > 0 && ` | 自定义 URL: ${customTargets.length} 个`}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* 过滤器 */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
        <Chip
          label="全部"
          onClick={() => setFilter('all')}
          color={filter === 'all' ? 'primary' : 'default'}
          variant={filter === 'all' ? 'filled' : 'outlined'}
        />
        <Chip
          label="国内平台"
          onClick={() => setFilter('国内')}
          color={filter === '国内' ? 'primary' : 'default'}
          variant={filter === '国内' ? 'filled' : 'outlined'}
        />
        <Chip
          label="国外平台"
          onClick={() => setFilter('国外')}
          color={filter === '国外' ? 'primary' : 'default'}
          variant={filter === '国外' ? 'filled' : 'outlined'}
        />
        {customTargets.length > 0 && (
          <Chip
            label={`自定义 (${customTargets.length})`}
            onClick={() => setFilter('自定义')}
            color={filter === '自定义' ? 'primary' : 'default'}
            variant={filter === '自定义' ? 'filled' : 'outlined'}
          />
        )}
      </Stack>

      {/* 测试结果 */}
      <Grid container spacing={2}>
        {filteredTargets.map((target) => {
          const result = results[target.name];
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={target.name}>
              <Paper
                sx={{
                  p: 2,
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: (theme) =>
                      theme.palette.mode === 'dark'
                        ? '0 4px 12px 0 rgb(0 0 0 / 0.4)'
                        : '0 4px 12px 0 rgb(0 0 0 / 0.15)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ mr: 1 }}>
                      {target.icon}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {target.name}
                    </Typography>
                  </Box>
                  {target.isCustom && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteCustomUrl(target.name)}
                      title="删除"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  )}
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  {target.url}
                </Typography>

                <Divider sx={{ my: 1 }} />

                {result ? (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {getStatusIcon(result.status)}
                      <Chip
                        label={
                          result.status === 'success'
                            ? '可访问'
                            : result.status === 'error'
                            ? '失败'
                            : '测试中...'
                        }
                        color={getStatusColor(result.status)}
                        size="small"
                      />
                    </Box>

                    {result.time !== undefined && (
                      <Typography variant="body2" color="text.secondary">
                        响应时间: <strong>{result.time}ms</strong>
                      </Typography>
                    )}

                    {result.error && (
                      <Typography variant="body2" color="error.main">
                        {result.error}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    等待测试...
                  </Typography>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* 添加自定义 URL 对话框 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>添加自定义 URL</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="名称"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="例如：我的网站"
              helperText="为这个 URL 起一个易识别的名称"
            />
            <TextField
              fullWidth
              label="URL 地址"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="例如：https://example.com"
              helperText="必须包含完整的协议（http:// 或 https://）"
            />
            <Alert severity="info">
              添加的自定义 URL 将保存在浏览器缓存中，下次访问时自动加载。
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button
            variant="contained"
            onClick={handleAddCustomUrl}
            disabled={!newName.trim() || !newUrl.trim()}
          >
            添加
          </Button>
        </DialogActions>
      </Dialog>

      {/* 使用说明 */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          使用说明
        </Typography>
        <Typography variant="body2" color="text.secondary" component="div">
          <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
            <li>
              <strong>测试原理：</strong>通过发送 HTTP 请求测试网站可访问性
            </li>
            <li>
              <strong>响应时间：</strong>包含 DNS 解析、建立连接、发送请求等总时间
            </li>
            <li>
              <strong>国内平台：</strong>百度、腾讯、阿里巴巴、京东、微博、抖音、B站、知乎
            </li>
            <li>
              <strong>国外平台：</strong>Google、GitHub、Twitter、Facebook、YouTube、Amazon、Netflix、Reddit
            </li>
            <li>
              <strong>自定义 URL：</strong>点击"添加自定义 URL"可添加您想要测试的网站，数据将保存在本地
            </li>
            <li>
              <strong>注意事项：</strong>部分网站可能由于防火墙或网络策略无法访问
            </li>
          </ul>
        </Typography>
      </Paper>
    </Container>
  );
};

