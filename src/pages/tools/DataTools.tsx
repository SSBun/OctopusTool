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
import { Schedule, Pattern, ColorLens, Calculate, QrCode2 } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const DataTools: React.FC = () => {
  const navigate = useNavigate();

  const tools = [
    {
      icon: <Schedule sx={{ fontSize: 40 }} />,
      title: '时间戳转换',
      description: '时间戳和日期时间相互转换',
      path: '/tools/data/timestamp',
      status: '可用',
    },
    {
      icon: <Pattern sx={{ fontSize: 40 }} />,
      title: '正则表达式测试',
      description: '在线测试和调试正则表达式',
      path: '/tools/data/regex',
      status: '可用',
    },
    {
      icon: <ColorLens sx={{ fontSize: 40 }} />,
      title: '颜色转换',
      description: 'RGB, HEX, HSL 等颜色格式转换',
      path: '/tools/data/color',
      status: '可用',
    },
    {
      icon: <Calculate sx={{ fontSize: 40 }} />,
      title: '单位转换',
      description: '长度、重量、温度等单位转换',
      path: '/tools/data/unit',
      status: '可用',
    },
    {
      icon: <QrCode2 sx={{ fontSize: 40 }} />,
      title: '二维码/条形码',
      description: '二维码生成、解析和条形码生成工具',
      path: '/tools/data/qrbarcode',
      status: '可用',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          数据处理工具
        </Typography>
        <Typography color="text.secondary" paragraph>
          日常开发中常用的数据处理和转换工具
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

