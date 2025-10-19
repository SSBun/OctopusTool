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
  VideoLibrary,
  ContentCut,
  AspectRatio,
  Speed,
  Transform,
  Audiotrack,
  Image,
  Info,
  Collections,
  Gif,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const VideoTools: React.FC = () => {
  const navigate = useNavigate();

  const tools = [
    {
      icon: <Image sx={{ fontSize: 40 }} />,
      title: '视频截图',
      description: '从视频中截取任意帧，保存为图片',
      path: '/media/video/screenshot',
      status: '可用',
    },
    {
      icon: <Info sx={{ fontSize: 40 }} />,
      title: '视频信息',
      description: '查看视频的详细信息（分辨率、时长等）',
      path: '/media/video/info',
      status: '可用',
    },
    {
      icon: <Collections sx={{ fontSize: 40 }} />,
      title: '帧提取',
      description: '批量提取视频关键帧',
      path: '/media/video/frames',
      status: '可用',
    },
    {
      icon: <Gif sx={{ fontSize: 40 }} />,
      title: 'GIF 制作',
      description: '从视频片段生成 GIF 动图',
      path: '/media/video/gif',
      status: '可用',
    },
    {
      icon: <ContentCut sx={{ fontSize: 40 }} />,
      title: '视频裁剪',
      description: '裁剪视频片段，精确到秒',
      path: '/media/video/cut',
      status: '即将推出',
    },
    {
      icon: <AspectRatio sx={{ fontSize: 40 }} />,
      title: '分辨率调整',
      description: '调整视频分辨率和尺寸',
      path: '/media/video/resize',
      status: '即将推出',
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: '速度调整',
      description: '调整视频播放速度',
      path: '/media/video/speed',
      status: '即将推出',
    },
    {
      icon: <Transform sx={{ fontSize: 40 }} />,
      title: '格式转换',
      description: '转换视频格式（MP4, AVI, MOV 等）',
      path: '/media/video/convert',
      status: '即将推出',
    },
    {
      icon: <Audiotrack sx={{ fontSize: 40 }} />,
      title: '提取音频',
      description: '从视频中提取音频轨道',
      path: '/media/video/extract-audio',
      status: '即将推出',
    },
    {
      icon: <VideoLibrary sx={{ fontSize: 40 }} />,
      title: '视频合并',
      description: '合并多个视频文件',
      path: '/media/video/merge',
      status: '即将推出',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          视频处理工具
        </Typography>
        <Typography color="text.secondary" paragraph>
          强大的视频处理工具集，支持压缩、裁剪、转换等多种功能
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

