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
  Compress,
  Transform,
  Crop,
  PhotoSizeSelectLarge,
  DataObject,
  Info,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const ImageTools: React.FC = () => {
  const navigate = useNavigate();

  const tools = [
    {
      icon: <Compress sx={{ fontSize: 40 }} />,
      title: '图片压缩',
      description: '压缩图片大小，支持自定义质量，保持视觉效果',
      path: '/media/image/compress',
      status: '可用',
    },
    {
      icon: <Transform sx={{ fontSize: 40 }} />,
      title: '格式转换',
      description: '支持 JPG、PNG、WebP、GIF 等格式互转',
      path: '/media/image/convert',
      status: '可用',
    },
    {
      icon: <Crop sx={{ fontSize: 40 }} />,
      title: '图片裁剪',
      description: '自由裁剪、按比例裁剪（16:9, 4:3, 1:1 等）',
      path: '/media/image/crop',
      status: '可用',
    },
    {
      icon: <PhotoSizeSelectLarge sx={{ fontSize: 40 }} />,
      title: '图片缩放',
      description: '调整图片尺寸，按比例或自定义宽高',
      path: '/media/image/resize',
      status: '可用',
    },
    {
      icon: <DataObject sx={{ fontSize: 40 }} />,
      title: 'Base64 转换',
      description: '图片与 Base64 编码互相转换',
      path: '/media/image/base64',
      status: '可用',
    },
    {
      icon: <Info sx={{ fontSize: 40 }} />,
      title: '图片信息',
      description: '查看图片尺寸、大小、格式等详细信息',
      path: '/media/image/info',
      status: '可用',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          图片处理工具
        </Typography>
        <Typography color="text.secondary" paragraph>
          实用的图片处理工具集，支持压缩、转换、裁剪等多种功能
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
                  transform: tool.path ? 'translateY(-4px)' : 'none',
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

