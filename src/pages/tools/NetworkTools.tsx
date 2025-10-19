import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
  Grid,
} from '@mui/material';
import {
  Public,
  Http,
  Link,
  Devices,
  Info,
  NetworkCheck,
  NetworkPing,
  Terminal,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const NetworkTools: React.FC = () => {
  const navigate = useNavigate();

  const tools = [
    {
      icon: <Public sx={{ fontSize: 40 }} />,
      title: 'IP 地址查询',
      description: '查询本机 IP、公网 IP 和地理位置信息',
      path: '/tools/network/ip',
      status: '可用',
    },
    {
      icon: <Http sx={{ fontSize: 40 }} />,
      title: 'HTTP 请求测试',
      description: '在线发送 HTTP 请求，测试 API 接口',
      path: '/tools/network/http',
      status: '可用',
    },
    {
      icon: <Link sx={{ fontSize: 40 }} />,
      title: 'URL 解析器',
      description: '解析 URL 各个组成部分和参数',
      path: '/tools/network/url',
      status: '可用',
    },
    {
      icon: <Devices sx={{ fontSize: 40 }} />,
      title: 'User Agent 解析',
      description: '解析浏览器和设备信息',
      path: '/tools/network/ua',
      status: '可用',
    },
    {
      icon: <Info sx={{ fontSize: 40 }} />,
      title: 'HTTP 状态码',
      description: '查询 HTTP 状态码含义和说明',
      path: '/tools/network/status',
      status: '可用',
    },
    {
      icon: <NetworkCheck sx={{ fontSize: 40 }} />,
      title: '端口检查',
      description: '检查常见端口开放状态',
      path: '/tools/network/port',
      status: '可用',
    },
    {
      icon: <NetworkPing sx={{ fontSize: 40 }} />,
      title: 'Ping 测试',
      description: '测试主流平台的网络连通性和延迟',
      path: '/tools/network/ping',
      status: '可用',
    },
    {
      icon: <Terminal sx={{ fontSize: 40 }} />,
      title: 'Curl 命令工具',
      description: '生成和解析 curl 命令，快速构建 HTTP 请求',
      path: '/tools/network/curl',
      status: '可用',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          网络工具
        </Typography>
        <Typography color="text.secondary" paragraph>
          实用的网络诊断、分析和测试工具
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {tools.map((tool, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
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
              <CardActionArea
                sx={{ p: 3, minHeight: 200, height: '100%' }}
                onClick={() => tool.path && navigate(tool.path)}
                disabled={!tool.path}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      color: 'white',
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: 'primary.main',
                      mx: 'auto',
                    }}
                  >
                    {tool.icon}
                  </Box>
                  <Typography variant="h6" component="h2" gutterBottom fontWeight={600}>
                    {tool.title}
                  </Typography>
                  <Typography color="text.secondary" variant="body2" paragraph sx={{ mb: 2 }}>
                    {tool.description}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={tool.status === '可用' ? 'success.main' : 'warning.main'}
                    fontWeight={500}
                  >
                    {tool.status}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

