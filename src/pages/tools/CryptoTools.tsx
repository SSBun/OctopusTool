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
import { Lock, VpnKey, Security, Fingerprint, Shield } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const CryptoTools: React.FC = () => {
  const navigate = useNavigate();

  const tools = [
    {
      icon: <Fingerprint sx={{ fontSize: 40 }} />,
      title: 'MD5 加密',
      description: '计算文本的 MD5 哈希值，支持多种输出格式',
      path: '/tools/crypto/md5',
      status: '可用',
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'SHA 系列',
      description: 'SHA-1, SHA-256, SHA-384, SHA-512 哈希计算',
      path: '/tools/crypto/hash',
      status: '可用',
    },
    {
      icon: <Lock sx={{ fontSize: 40 }} />,
      title: 'AES 加密/解密',
      description: '专业的 AES 加密解密工具，支持多种模式和填充方式',
      path: '/tools/crypto/aes',
      status: '可用',
    },
    {
      icon: <VpnKey sx={{ fontSize: 40 }} />,
      title: 'RSA 加密/解密',
      description: '专业的 RSA 非对称加密工具，支持密钥生成和管理',
      path: '/tools/crypto/rsa',
      status: '可用',
    },
    {
      icon: <Shield sx={{ fontSize: 40 }} />,
      title: 'HMAC 签名',
      description: '基于哈希的消息认证码，验证消息完整性和真实性',
      path: '/tools/crypto/hmac',
      status: '可用',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          加密解密工具
        </Typography>
        <Typography color="text.secondary" paragraph>
          各种加密算法和哈希计算工具
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
                    color={tool.status === '可用' ? 'success.main' : tool.status === '计划中' ? 'text.secondary' : 'warning.main'} 
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

