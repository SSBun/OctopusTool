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
  ContentCut,
  VolumeUp,
  GraphicEq,
  Transform,
  Merge,
  Info,
  Mic,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const AudioTools: React.FC = () => {
  const navigate = useNavigate();

  const tools = [
    {
      icon: <Info sx={{ fontSize: 40 }} />,
      title: '音频信息',
      description: '查看音频文件详细信息',
      path: '/media/audio/info',
      status: '可用',
    },
    {
      icon: <GraphicEq sx={{ fontSize: 40 }} />,
      title: '波形可视化',
      description: '显示音频波形和频谱分析',
      path: '/media/audio/waveform',
      status: '可用',
    },
    {
      icon: <Mic sx={{ fontSize: 40 }} />,
      title: '音频录制',
      description: '使用麦克风录制音频',
      path: '/media/audio/record',
      status: '可用',
    },
    {
      icon: <ContentCut sx={{ fontSize: 40 }} />,
      title: '音频裁剪',
      description: '裁剪音频片段，导出为 WAV',
      path: '/media/audio/trim',
      status: '可用',
    },
    {
      icon: <Compress sx={{ fontSize: 40 }} />,
      title: '音频压缩',
      description: '压缩音频文件大小，保持音质',
      path: '/media/audio/compress',
      status: '即将推出',
    },
    {
      icon: <Transform sx={{ fontSize: 40 }} />,
      title: '格式转换',
      description: '转换音频格式（MP3, WAV, AAC 等）',
      path: '/media/audio/convert',
      status: '即将推出',
    },
    {
      icon: <VolumeUp sx={{ fontSize: 40 }} />,
      title: '音量调整',
      description: '调整音频音量大小',
      path: '/media/audio/volume',
      status: '即将推出',
    },
    {
      icon: <Merge sx={{ fontSize: 40 }} />,
      title: '音频合并',
      description: '合并多个音频文件',
      path: '/media/audio/merge',
      status: '即将推出',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          音频处理工具
        </Typography>
        <Typography color="text.secondary" paragraph>
          专业的音频处理工具集，支持压缩、裁剪、转换等多种功能
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

