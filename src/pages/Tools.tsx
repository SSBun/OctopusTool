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
import { Code, Transform, Lock, DataObject } from '@mui/icons-material';

export const Tools: React.FC = () => {
  const toolCategories = [
    {
      icon: <Code sx={{ fontSize: 40 }} />,
      title: 'JSON 工具',
      description: 'JSON 格式化、压缩、验证',
      count: 3,
    },
    {
      icon: <Transform sx={{ fontSize: 40 }} />,
      title: '编码转换',
      description: 'Base64、URL 编解码',
      count: 4,
    },
    {
      icon: <Lock sx={{ fontSize: 40 }} />,
      title: '加密解密',
      description: 'MD5、SHA、AES 等加密',
      count: 5,
    },
    {
      icon: <DataObject sx={{ fontSize: 40 }} />,
      title: '数据处理',
      description: '时间戳、正则表达式测试',
      count: 3,
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          开发工具
        </Typography>
        <Typography color="text.secondary" paragraph>
          选择一个工具分类开始使用
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {toolCategories.map((category, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
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
              <CardActionArea sx={{ p: 3, minHeight: 220, height: '100%' }}>
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
                    {category.icon}
                  </Box>
                  <Typography variant="h6" component="h2" gutterBottom fontWeight={600}>
                    {category.title}
                  </Typography>
                  <Typography color="text.secondary" variant="body2" paragraph sx={{ mb: 2 }}>
                    {category.description}
                  </Typography>
                  <Typography variant="caption" color="primary.main" fontWeight={500}>
                    {category.count} 个工具
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box 
        sx={{ 
          mt: 4, 
          p: 3, 
          bgcolor: 'primary.main', 
          borderRadius: 3,
          opacity: 0.9,
        }}
      >
        <Typography variant="body2" color="white" fontWeight={500}>
          💡 提示：更多工具正在开发中，敬请期待！
        </Typography>
      </Box>
    </Container>
  );
};
