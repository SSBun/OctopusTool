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
import { Code, CompressOutlined, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const JsonTools: React.FC = () => {
  const navigate = useNavigate();

  const tools = [
    {
      icon: <Code sx={{ fontSize: 40 }} />,
      title: 'JSON 格式化',
      description: '美化和格式化 JSON 数据，使其更易读',
      path: '/tools/json/formatter',
      status: '可用',
    },
    {
      icon: <CompressOutlined sx={{ fontSize: 40 }} />,
      title: 'JSON 压缩',
      description: '压缩 JSON 数据，移除空格和换行',
      path: '/tools/json/minify',
      status: '可用',
    },
    {
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
      title: 'JSON 验证',
      description: '验证 JSON 格式是否正确',
      path: '/tools/json/validator',
      status: '可用',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          JSON 工具
        </Typography>
        <Typography color="text.secondary" paragraph>
          处理和操作 JSON 数据的实用工具
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
                onClick={() => navigate(tool.path)}
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
                  <Typography variant="caption" color="success.main" fontWeight={500}>
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

