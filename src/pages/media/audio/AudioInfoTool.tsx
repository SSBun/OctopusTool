import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  Divider,
  Grid,
  Stack,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import {
  Audiotrack,
  AccessTime,
  Storage,
  Settings,
  GraphicEq,
  Code,
} from '@mui/icons-material';
import { ImageUploadBox } from '../../../components/ImageUploadBox';

interface AudioInfo {
  fileName: string;
  fileSize: number;
  duration: number;
  sampleRate: number;
  numberOfChannels: number;
  fileType: string;
  bitrate: number;
}

export const AudioInfoTool: React.FC = () => {
  const [audioInfo, setAudioInfo] = useState<AudioInfo | null>(null);
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
    return `${kbps.toFixed(0)} kbps`;
  };

  const getChannelName = (channels: number): string => {
    switch (channels) {
      case 1:
        return '单声道 (Mono)';
      case 2:
        return '立体声 (Stereo)';
      case 6:
        return '5.1 环绕声';
      default:
        return `${channels} 声道`;
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError('请选择音频文件');
      return;
    }

    setError('');

    try {
      // 使用 Web Audio API 获取详细信息
      const audioContext = new AudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // 计算比特率
      const bitrate = (file.size * 8) / audioBuffer.duration;

      const info: AudioInfo = {
        fileName: file.name,
        fileSize: file.size,
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate,
        numberOfChannels: audioBuffer.numberOfChannels,
        fileType: file.type,
        bitrate,
      };

      setAudioInfo(info);
      
      // 关闭 AudioContext 释放资源
      await audioContext.close();
    } catch (err) {
      console.error(err);
      setError('无法读取音频信息：' + (err instanceof Error ? err.message : '未知错误'));
    }
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
        title="音频信息查看"
        description="查看音频文件的详细信息"
        toolPath="/media/audio/info"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          上传音频
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <ImageUploadBox onFileSelect={handleFileSelect} accept="audio/*" />
      </Paper>

      {audioInfo && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              基本信息
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <InfoCard
                  icon={<AccessTime />}
                  label="时长"
                  value={formatDuration(audioInfo.duration)}
                  color="primary.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InfoCard
                  icon={<Storage />}
                  label="文件大小"
                  value={formatSize(audioInfo.fileSize)}
                  color="success.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InfoCard
                  icon={<Settings />}
                  label="采样率"
                  value={`${audioInfo.sampleRate} Hz`}
                  color="warning.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InfoCard
                  icon={<Audiotrack />}
                  label="声道"
                  value={getChannelName(audioInfo.numberOfChannels)}
                  color="info.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InfoCard
                  icon={<GraphicEq />}
                  label="比特率"
                  value={formatBitrate(audioInfo.bitrate)}
                  color="error.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InfoCard
                  icon={<Code />}
                  label="文件类型"
                  value={audioInfo.fileType || '未知'}
                  color="secondary.main"
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              详细信息
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  文件名
                </Typography>
                <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                  {audioInfo.fileName}
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  音频质量
                </Typography>
                <Typography variant="body1">
                  {audioInfo.sampleRate >= 44100
                    ? 'CD 品质或更高'
                    : audioInfo.sampleRate >= 32000
                    ? '标准品质'
                    : '低品质'}
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  技术参数
                </Typography>
                <Typography variant="body2">
                  {audioInfo.numberOfChannels} 声道 • {audioInfo.sampleRate} Hz • {formatBitrate(audioInfo.bitrate)}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </>
      )}
    </Container>
  );
};

