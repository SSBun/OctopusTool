import React, { useState } from 'react';
import {
Container,
  Typography,
  Box,
  Paper,
  Alert,
  Divider,
  Grid,
  Chip,
  Stack,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import {
  Videocam,
  AspectRatio,
  Speed,
  Storage,
  AccessTime,
  Code,
} from '@mui/icons-material';
import { ImageUploadBox } from '../../../components/ImageUploadBox';

interface VideoInfo {
  fileName: string;
  fileSize: number;
  duration: number;
  width: number;
  height: number;
  aspectRatio: string;
  videoCodec: string;
  audioCodec: string;
  fileType: string;
  bitrate: number;
}

export const VideoInfoTool: React.FC = () => {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [error, setError] = useState('');

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBitrate = (bps: number): string => {
    if (bps === 0) return '未知';
    const kbps = bps / 1000;
    if (kbps < 1000) {
      return `${kbps.toFixed(0)} kbps`;
    }
    return `${(kbps / 1000).toFixed(2)} Mbps`;
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('请选择视频文件');
      return;
    }

    setError('');
    const url = URL.createObjectURL(file);

    // 创建视频元素读取信息
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      // 计算宽高比
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const divisor = gcd(video.videoWidth, video.videoHeight);
      const aspectRatio = `${video.videoWidth / divisor}:${video.videoHeight / divisor}`;

      // 计算比特率
      const bitrate = file.size * 8 / video.duration;

      const info: VideoInfo = {
        fileName: file.name,
        fileSize: file.size,
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        aspectRatio,
        videoCodec: '无法检测（需要服务器端）',
        audioCodec: '无法检测（需要服务器端）',
        fileType: file.type,
        bitrate,
      };

      setVideoInfo(info);
      URL.revokeObjectURL(url);
    };

    video.onerror = () => {
      setError('无法读取视频信息');
      URL.revokeObjectURL(url);
    };

    video.src = url;
  };

  const InfoCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    color?: string;
  }> = ({ icon, label, value, color = 'primary.main' }) => (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        height: '100%',
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 1,
          bgcolor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h6" fontWeight={600} sx={{ wordBreak: 'break-all' }}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Container maxWidth="lg">
      <ToolDetailHeader
        title="视频信息查看"
        description="查看视频的详细信息，包括分辨率、时长、大小等"
        toolPath="/media/video/info"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          上传视频
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <ImageUploadBox onFileSelect={handleFileSelect} accept="video/*" />

        {videoInfo && (
          <Box sx={{ mt: 3 }}>
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Chip
                label="已加载"
                color="success"
                size="small"
              />
              <Chip
                label={videoInfo.fileName}
                variant="outlined"
                size="small"
              />
            </Stack>
          </Box>
        )}
      </Paper>

      {videoInfo && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              基本信息
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <InfoCard
                  icon={<AspectRatio />}
                  label="分辨率"
                  value={`${videoInfo.width} × ${videoInfo.height}`}
                  color="primary.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InfoCard
                  icon={<AccessTime />}
                  label="时长"
                  value={formatDuration(videoInfo.duration)}
                  color="success.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InfoCard
                  icon={<Storage />}
                  label="文件大小"
                  value={formatSize(videoInfo.fileSize)}
                  color="warning.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InfoCard
                  icon={<Videocam />}
                  label="宽高比"
                  value={videoInfo.aspectRatio}
                  color="info.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InfoCard
                  icon={<Speed />}
                  label="比特率"
                  value={formatBitrate(videoInfo.bitrate)}
                  color="error.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InfoCard
                  icon={<Code />}
                  label="文件类型"
                  value={videoInfo.fileType || '未知'}
                  color="secondary.main"
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                详细信息
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  文件名
                </Typography>
                <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                  {videoInfo.fileName}
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  视频编码
                </Typography>
                <Typography variant="body1">
                  {videoInfo.videoCodec}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  💡 浏览器环境无法直接读取编码信息，请使用桌面版 FFmpeg 或 MediaInfo 查看
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  音频编码
                </Typography>
                <Typography variant="body1">
                  {videoInfo.audioCodec}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </>
      )}
    </Container>
  );
};

