import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Divider,
  Alert,
  Chip,
  Grid,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { ContentCopy, Clear, DevicesOther } from '@mui/icons-material';

interface ParsedUA {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  isBot: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export const UserAgentTool: React.FC = () => {
  const [userAgent, setUserAgent] = useState('');
  const [parsed, setParsed] = useState<ParsedUA | null>(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // 自动加载当前浏览器的 User Agent
    setUserAgent(navigator.userAgent);
  }, []);

  useEffect(() => {
    if (userAgent.trim()) {
      handleParse();
    }
  }, [userAgent]);

  const parseUserAgent = (ua: string): ParsedUA => {
    const result: ParsedUA = {
      browser: 'Unknown',
      browserVersion: '',
      os: 'Unknown',
      osVersion: '',
      device: 'Unknown',
      isBot: false,
      isMobile: false,
      isTablet: false,
      isDesktop: false,
    };

    // 检测机器人
    const botPatterns = /bot|crawler|spider|crawling|googlebot|bingbot|slurp|duckduckbot/i;
    result.isBot = botPatterns.test(ua);

    // 检测操作系统
    if (/Windows NT 10.0/.test(ua)) {
      result.os = 'Windows';
      result.osVersion = '10';
    } else if (/Windows NT 6.3/.test(ua)) {
      result.os = 'Windows';
      result.osVersion = '8.1';
    } else if (/Windows NT 6.2/.test(ua)) {
      result.os = 'Windows';
      result.osVersion = '8';
    } else if (/Windows NT 6.1/.test(ua)) {
      result.os = 'Windows';
      result.osVersion = '7';
    } else if (/Mac OS X ([\d_]+)/.test(ua)) {
      result.os = 'macOS';
      const match = ua.match(/Mac OS X ([\d_]+)/);
      if (match) {
        result.osVersion = match[1].replace(/_/g, '.');
      }
    } else if (/Android ([\d.]+)/.test(ua)) {
      result.os = 'Android';
      const match = ua.match(/Android ([\d.]+)/);
      if (match) result.osVersion = match[1];
    } else if (/iPhone OS ([\d_]+)/.test(ua)) {
      result.os = 'iOS';
      const match = ua.match(/iPhone OS ([\d_]+)/);
      if (match) {
        result.osVersion = match[1].replace(/_/g, '.');
      }
    } else if (/iPad.*OS ([\d_]+)/.test(ua)) {
      result.os = 'iPadOS';
      const match = ua.match(/iPad.*OS ([\d_]+)/);
      if (match) {
        result.osVersion = match[1].replace(/_/g, '.');
      }
    } else if (/Linux/.test(ua)) {
      result.os = 'Linux';
    }

    // 检测浏览器
    if (/Edg\/([\d.]+)/.test(ua)) {
      result.browser = 'Microsoft Edge';
      const match = ua.match(/Edg\/([\d.]+)/);
      if (match) result.browserVersion = match[1];
    } else if (/Chrome\/([\d.]+)/.test(ua) && !/Edg/.test(ua)) {
      result.browser = 'Chrome';
      const match = ua.match(/Chrome\/([\d.]+)/);
      if (match) result.browserVersion = match[1];
    } else if (/Firefox\/([\d.]+)/.test(ua)) {
      result.browser = 'Firefox';
      const match = ua.match(/Firefox\/([\d.]+)/);
      if (match) result.browserVersion = match[1];
    } else if (/Safari\/([\d.]+)/.test(ua) && !/Chrome/.test(ua) && !/Edg/.test(ua)) {
      result.browser = 'Safari';
      const match = ua.match(/Version\/([\d.]+)/);
      if (match) result.browserVersion = match[1];
    } else if (/Opera|OPR\/([\d.]+)/.test(ua)) {
      result.browser = 'Opera';
      const match = ua.match(/(?:Opera|OPR)\/([\d.]+)/);
      if (match) result.browserVersion = match[1];
    }

    // 检测设备类型
    result.isMobile = /Mobile|Android|iPhone/.test(ua) && !/iPad|Tablet/.test(ua);
    result.isTablet = /iPad|Tablet|PlayBook/.test(ua);
    result.isDesktop = !result.isMobile && !result.isTablet;

    if (result.isMobile) {
      result.device = 'Mobile';
    } else if (result.isTablet) {
      result.device = 'Tablet';
    } else if (result.isDesktop) {
      result.device = 'Desktop';
    }

    return result;
  };

  const handleParse = () => {
    if (!userAgent.trim()) return;
    const result = parseUserAgent(userAgent);
    setParsed(result);
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSuccess('已复制到剪贴板！');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleClear = () => {
    setUserAgent('');
    setParsed(null);
  };

  const handleLoadCurrent = () => {
    setUserAgent(navigator.userAgent);
  };

  const handleExample = () => {
    setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
    );
  };

  return (
    <Container maxWidth="lg">
      <ToolDetailHeader
        title="User Agent 解析器"
        description="解析浏览器 User Agent 字符串，识别浏览器、操作系统和设备类型"
        toolPath="/tools/network/user-agent"
      />

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          User Agent 字符串
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Stack spacing={2}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="User Agent"
            value={userAgent}
            onChange={(e) => setUserAgent(e.target.value)}
            placeholder="输入 User Agent 字符串"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              },
            }}
          />

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<ContentCopy />}
              onClick={() => handleCopy(userAgent)}
              disabled={!userAgent}
            >
              复制
            </Button>
            <Button variant="outlined" startIcon={<Clear />} onClick={handleClear}>
              清空
            </Button>
            <Button variant="text" onClick={handleLoadCurrent}>
              当前浏览器
            </Button>
            <Button variant="text" onClick={handleExample}>
              示例
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {parsed && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            解析结果
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {/* 浏览器信息 */}
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  浏览器
                </Typography>
                <Typography variant="h5" gutterBottom>
                  {parsed.browser}
                </Typography>
                {parsed.browserVersion && (
                  <Chip label={`版本: ${parsed.browserVersion}`} size="small" />
                )}
              </Paper>
            </Grid>

            {/* 操作系统 */}
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  操作系统
                </Typography>
                <Typography variant="h5" gutterBottom>
                  {parsed.os}
                </Typography>
                {parsed.osVersion && (
                  <Chip label={`版本: ${parsed.osVersion}`} size="small" />
                )}
              </Paper>
            </Grid>

            {/* 设备类型 */}
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  设备类型
                </Typography>
                <Typography variant="h5" gutterBottom>
                  {parsed.device}
                </Typography>
                <Stack direction="row" spacing={1}>
                  {parsed.isMobile && <Chip label="移动设备" size="small" color="primary" />}
                  {parsed.isTablet && <Chip label="平板设备" size="small" color="primary" />}
                  {parsed.isDesktop && <Chip label="桌面设备" size="small" color="primary" />}
                </Stack>
              </Paper>
            </Grid>

            {/* 其他特征 */}
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  其他特征
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  {parsed.isBot ? (
                    <Chip label="机器人/爬虫" size="small" color="warning" />
                  ) : (
                    <Chip label="真实用户" size="small" color="success" />
                  )}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      )}

      {!parsed && (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            bgcolor: 'background.default',
          }}
        >
          <DevicesOther sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography color="text.secondary">
            输入 User Agent 字符串后将自动解析
          </Typography>
        </Paper>
      )}

      {/* 使用说明 */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          使用说明
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • <strong>User Agent</strong> 是浏览器发送给服务器的标识字符串
          <br />
          • 包含浏览器类型、版本、操作系统、设备等信息
          <br />
          • 可用于网站统计、兼容性检测、设备识别等场景
          <br />
          • 点击"当前浏览器"可查看您正在使用的浏览器信息
          <br />• 注意：User Agent 可以被伪造，不应作为唯一的识别依据
        </Typography>
      </Paper>
    </Container>
  );
};

