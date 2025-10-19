import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
} from '@mui/material';
import { Code, Speed, Security } from '@mui/icons-material';

export const Home: React.FC = () => {
  const features = [
    {
      icon: <Code sx={{ fontSize: 40 }} />,
      title: '丰富的工具',
      description: '提供各种常用的开发工具，覆盖编码、调试、格式化等多个场景',
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: '快速响应',
      description: '基于 Vite 构建，开发体验流畅，运行速度快',
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: '本地运行',
      description: '所有工具都在浏览器本地运行，保护您的数据隐私',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          欢迎使用 Octopus Dev Tools
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center" paragraph>
          一个为开发者打造的工具聚合平台
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, my: 3 }}>
          <Chip label="React" color="primary" />
          <Chip label="TypeScript" color="primary" />
          <Chip label="Material-UI" color="primary" />
          <Chip label="Vite" color="primary" />
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mt: 4 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                textAlign: 'center', 
                p: 3,
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
                <Box 
                  sx={{ 
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    color: 'white',
                    mx: 'auto',
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box 
        sx={{ 
          mt: 6, 
          p: 4, 
          bgcolor: 'background.paper', 
          borderRadius: 3,
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h5" gutterBottom fontWeight={600}>
          快速开始
        </Typography>
        <Typography paragraph color="text.secondary" sx={{ mb: 2 }}>
          从左侧菜单选择您需要的工具分类，开始使用各种开发工具。
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>
          💡 所有工具均在您的浏览器本地运行，无需担心数据安全问题。
        </Typography>
      </Box>
    </Container>
  );
};
