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
import { SwapHoriz, Link, Image, TextFields } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const EncodingTools: React.FC = () => {
  const navigate = useNavigate();

  const tools = [
    {
      icon: <SwapHoriz sx={{ fontSize: 40 }} />,
      title: 'Base64 编解码',
      description: '对文本进行 Base64 编码和解码，支持 UTF-8',
      path: '/tools/encoding/base64',
      status: '可用',
    },
    {
      icon: <Link sx={{ fontSize: 40 }} />,
      title: 'URL 编解码',
      description: 'URL 编码和解码工具',
      path: '/tools/encoding/url',
      status: '可用',
    },
    {
      icon: <TextFields sx={{ fontSize: 40 }} />,
      title: 'Unicode 转换',
      description: 'Unicode 和普通文本相互转换',
      path: '/tools/encoding/unicode',
      status: '可用',
    },
    {
      icon: <Image sx={{ fontSize: 40 }} />,
      title: 'HTML 实体编码',
      description: 'HTML 特殊字符编码和解码',
      path: '/tools/encoding/html',
      status: '可用',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          编码转换工具
        </Typography>
        <Typography color="text.secondary" paragraph>
          各种编码格式的转换和处理工具
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

