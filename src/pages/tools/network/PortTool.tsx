import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  InputAdornment,
  Alert,
  Divider,
} from '@mui/material';
import { Search, Security, Warning } from '@mui/icons-material';

interface PortInfo {
  port: number;
  service: string;
  description: string;
  protocol: string;
  risk: 'low' | 'medium' | 'high';
  category: string;
}

const COMMON_PORTS: PortInfo[] = [
  // Web 服务
  { port: 80, service: 'HTTP', description: '超文本传输协议，Web 服务器默认端口', protocol: 'TCP', risk: 'low', category: 'Web' },
  { port: 443, service: 'HTTPS', description: '安全超文本传输协议，加密的 Web 服务', protocol: 'TCP', risk: 'low', category: 'Web' },
  { port: 8080, service: 'HTTP Alternate', description: 'HTTP 备用端口，常用于开发测试', protocol: 'TCP', risk: 'low', category: 'Web' },
  { port: 8443, service: 'HTTPS Alternate', description: 'HTTPS 备用端口', protocol: 'TCP', risk: 'low', category: 'Web' },
  { port: 3000, service: 'Node.js', description: 'Node.js 开发服务器常用端口', protocol: 'TCP', risk: 'medium', category: 'Web' },
  { port: 5000, service: 'Flask', description: 'Flask 开发服务器默认端口', protocol: 'TCP', risk: 'medium', category: 'Web' },

  // 邮件服务
  { port: 25, service: 'SMTP', description: '简单邮件传输协议', protocol: 'TCP', risk: 'medium', category: '邮件' },
  { port: 110, service: 'POP3', description: '邮局协议版本 3', protocol: 'TCP', risk: 'medium', category: '邮件' },
  { port: 143, service: 'IMAP', description: 'Internet 邮件访问协议', protocol: 'TCP', risk: 'medium', category: '邮件' },
  { port: 465, service: 'SMTPS', description: 'SMTP over SSL/TLS', protocol: 'TCP', risk: 'low', category: '邮件' },
  { port: 587, service: 'SMTP', description: 'SMTP 邮件提交端口', protocol: 'TCP', risk: 'low', category: '邮件' },
  { port: 993, service: 'IMAPS', description: 'IMAP over SSL/TLS', protocol: 'TCP', risk: 'low', category: '邮件' },
  { port: 995, service: 'POP3S', description: 'POP3 over SSL/TLS', protocol: 'TCP', risk: 'low', category: '邮件' },

  // 文件传输
  { port: 20, service: 'FTP Data', description: 'FTP 数据传输端口', protocol: 'TCP', risk: 'high', category: '文件传输' },
  { port: 21, service: 'FTP', description: '文件传输协议控制端口', protocol: 'TCP', risk: 'high', category: '文件传输' },
  { port: 22, service: 'SSH/SFTP', description: '安全外壳协议，加密远程登录和文件传输', protocol: 'TCP', risk: 'medium', category: '文件传输' },
  { port: 69, service: 'TFTP', description: '简单文件传输协议', protocol: 'UDP', risk: 'high', category: '文件传输' },
  { port: 445, service: 'SMB', description: 'Windows 文件共享', protocol: 'TCP', risk: 'high', category: '文件传输' },

  // 数据库
  { port: 3306, service: 'MySQL', description: 'MySQL 数据库默认端口', protocol: 'TCP', risk: 'high', category: '数据库' },
  { port: 5432, service: 'PostgreSQL', description: 'PostgreSQL 数据库默认端口', protocol: 'TCP', risk: 'high', category: '数据库' },
  { port: 1433, service: 'MSSQL', description: 'Microsoft SQL Server', protocol: 'TCP', risk: 'high', category: '数据库' },
  { port: 27017, service: 'MongoDB', description: 'MongoDB 数据库默认端口', protocol: 'TCP', risk: 'high', category: '数据库' },
  { port: 6379, service: 'Redis', description: 'Redis 缓存数据库', protocol: 'TCP', risk: 'high', category: '数据库' },
  { port: 5984, service: 'CouchDB', description: 'CouchDB 数据库', protocol: 'TCP', risk: 'high', category: '数据库' },

  // 远程访问
  { port: 23, service: 'Telnet', description: '远程登录服务（不安全）', protocol: 'TCP', risk: 'high', category: '远程访问' },
  { port: 3389, service: 'RDP', description: 'Windows 远程桌面协议', protocol: 'TCP', risk: 'medium', category: '远程访问' },
  { port: 5900, service: 'VNC', description: '虚拟网络计算，远程桌面', protocol: 'TCP', risk: 'medium', category: '远程访问' },

  // DNS 和网络
  { port: 53, service: 'DNS', description: '域名系统', protocol: 'TCP/UDP', risk: 'low', category: 'DNS/网络' },
  { port: 67, service: 'DHCP Server', description: 'DHCP 服务器端口', protocol: 'UDP', risk: 'low', category: 'DNS/网络' },
  { port: 68, service: 'DHCP Client', description: 'DHCP 客户端端口', protocol: 'UDP', risk: 'low', category: 'DNS/网络' },

  // 代理和 VPN
  { port: 1080, service: 'SOCKS', description: 'SOCKS 代理服务器', protocol: 'TCP', risk: 'medium', category: '代理/VPN' },
  { port: 8888, service: 'HTTP Proxy', description: 'HTTP 代理服务器', protocol: 'TCP', risk: 'medium', category: '代理/VPN' },
  { port: 1194, service: 'OpenVPN', description: 'OpenVPN 默认端口', protocol: 'UDP', risk: 'low', category: '代理/VPN' },

  // 其他服务
  { port: 161, service: 'SNMP', description: '简单网络管理协议', protocol: 'UDP', risk: 'high', category: '其他' },
  { port: 514, service: 'Syslog', description: '系统日志', protocol: 'UDP', risk: 'medium', category: '其他' },
  { port: 9200, service: 'Elasticsearch', description: 'Elasticsearch 搜索引擎', protocol: 'TCP', risk: 'high', category: '其他' },
  { port: 11211, service: 'Memcached', description: 'Memcached 缓存服务', protocol: 'TCP', risk: 'high', category: '其他' },
];

export const PortTool: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPorts = COMMON_PORTS.filter(
    (port) =>
      port.port.toString().includes(searchTerm) ||
      port.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      port.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'low':
        return '低风险';
      case 'medium':
        return '中风险';
      case 'high':
        return '高风险';
      default:
        return '';
    }
  };

  const categories = Array.from(new Set(COMMON_PORTS.map((p) => p.category)));
  const groupedPorts = categories.map((category) => ({
    category,
    ports: filteredPorts.filter((port) => port.category === category),
  }));

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          常见端口查询
        </Typography>
        <Typography color="text.secondary" paragraph>
          查询常见网络端口的服务、协议和安全风险信息
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>说明：</strong> 由于浏览器安全限制，无法直接扫描网络端口。
        本工具提供常见端口的参考信息，帮助了解各端口的用途和风险等级。
      </Alert>

      {/* 搜索框 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="搜索端口号或服务名称..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          共收录 {COMMON_PORTS.length} 个常见端口
        </Typography>
      </Paper>

      {/* 端口列表 */}
      {groupedPorts.map(
        (group) =>
          group.ports.length > 0 && (
            <Box key={group.category} sx={{ mb: 4 }}>
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                <Typography variant="h6" fontWeight={600}>
                  {group.category}
                </Typography>
              </Paper>

              <Grid container spacing={2}>
                {group.ports.map((port) => (
                  <Grid item xs={12} sm={6} md={4} key={port.port}>
                    <Card
                      sx={{
                        height: '100%',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: (theme) =>
                            theme.palette.mode === 'dark'
                              ? '0 8px 16px 0 rgb(0 0 0 / 0.4)'
                              : '0 8px 16px 0 rgb(0 0 0 / 0.15)',
                        },
                      }}
                    >
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <Chip
                            label={`端口 ${port.port}`}
                            color="primary"
                            sx={{ fontWeight: 600 }}
                          />
                          <Chip
                            label={port.protocol}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>

                        <Typography variant="h6" gutterBottom fontWeight={600}>
                          {port.service}
                        </Typography>

                        <Divider sx={{ my: 1 }} />

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {port.description}
                        </Typography>

                        <Stack direction="row" spacing={1} alignItems="center">
                          {port.risk === 'high' ? <Warning fontSize="small" /> : <Security fontSize="small" />}
                          <Chip
                            label={getRiskLabel(port.risk)}
                            color={getRiskColor(port.risk)}
                            size="small"
                          />
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )
      )}

      {filteredPorts.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography color="text.secondary">
            未找到匹配的端口，请尝试其他关键词
          </Typography>
        </Paper>
      )}

      {/* 安全提示 */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          安全建议
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: 'success.main', color: 'white', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                低风险端口
              </Typography>
              <Typography variant="body2">
                通常是标准服务端口，已有成熟的安全实践。建议使用加密协议（如 HTTPS、SSH）。
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: 'warning.main', color: 'white', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                中风险端口
              </Typography>
              <Typography variant="body2">
                需要额外的安全配置。建议限制访问 IP，启用防火墙规则，定期更新服务。
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: 'error.main', color: 'white', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                高风险端口
              </Typography>
              <Typography variant="body2">
                容易成为攻击目标。强烈建议不要暴露在公网，使用强密码，启用加密，定期监控日志。
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

