import React, { useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import { 
  Code, 
  Speed, 
  Security, 
  CheckCircle, 
  Schedule,
  Category,
  Build,
} from '@mui/icons-material';
import { ALL_TOOLS } from '../data/allTools';

export const Home: React.FC = () => {
  // 统计工具数量
  const toolStats = useMemo(() => {
    const total = ALL_TOOLS.length;
    const available = ALL_TOOLS.filter(tool => tool.status === '可用').length;
    const planned = ALL_TOOLS.filter(tool => tool.status === '计划中').length;
    
    // 按分类统计
    const categories = new Set(ALL_TOOLS.map(tool => tool.category));
    const categoryCount = categories.size;
    
    // 统计各分类的工具数量
    const categoryStats = Array.from(categories).map(category => ({
      name: category,
      count: ALL_TOOLS.filter(tool => tool.category === category).length,
      available: ALL_TOOLS.filter(tool => tool.category === category && tool.status === '可用').length,
    })).sort((a, b) => b.count - a.count);
    
    return {
      total,
      available,
      planned,
      categoryCount,
      categoryStats,
      completionRate: Math.round((available / total) * 100),
    };
  }, []);

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

      {/* 工具数量统计 */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              textAlign: 'center', 
              p: 2,
              background: (theme) => 
                theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            <CardContent>
              <Build sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h3" fontWeight={700}>
                {toolStats.total}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                工具总数
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              textAlign: 'center', 
              p: 2,
              background: (theme) => 
                theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                  : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
            }}
          >
            <CardContent>
              <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h3" fontWeight={700}>
                {toolStats.available}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                可用工具
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              textAlign: 'center', 
              p: 2,
              background: (theme) => 
                theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                  : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
            }}
          >
            <CardContent>
              <Category sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h3" fontWeight={700}>
                {toolStats.categoryCount}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                工具分类
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              textAlign: 'center', 
              p: 2,
              background: (theme) => 
                theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
                  : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              color: 'white',
            }}
          >
            <CardContent>
              <Schedule sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h3" fontWeight={700}>
                {toolStats.completionRate}%
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                完成进度
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 分类统计 */}
      <Box 
        sx={{ 
          mb: 4,
          p: 3, 
          bgcolor: 'background.paper', 
          borderRadius: 3,
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
          📊 分类统计
        </Typography>
        <Grid container spacing={2}>
          {toolStats.categoryStats.map((cat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box 
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'action.selected',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" fontWeight={500}>
                    {cat.name}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip 
                      label={`${cat.available}/${cat.count}`} 
                      size="small" 
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          💡 共 {toolStats.categoryCount} 个分类，{toolStats.available} 个工具可用，{toolStats.planned} 个工具计划中
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mt: 2 }}>
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
