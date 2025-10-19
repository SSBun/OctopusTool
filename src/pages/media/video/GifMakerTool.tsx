import React, { useState, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Stack,
  Alert,
  Divider,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  SelectChangeEvent,
} from '@mui/material';
import { Download, PlayArrow, Pause } from '@mui/icons-material';
import { ImageUploadBox } from '../../../components/ImageUploadBox';
import GIF from 'gif.js';

type GifQuality = 'high' | 'medium' | 'low';

export const GifMakerTool: React.FC = () => {
  const [videoFile, setVideoFile] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(5);
  const [fps, setFps] = useState<number>(10);
  const [quality, setQuality] = useState<GifQuality>('medium');
  const [gifUrl, setGifUrl] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const qualitySettings = {
    high: { width: 480, quality: 10, label: '高质量 (480p)' },
    medium: { width: 320, quality: 20, label: '中等质量 (320p)' },
    low: { width: 240, quality: 30, label: '低质量 (240p)' },
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('请选择视频文件');
      return;
    }

    setFileName(file.name);
    setError('');
    setGifUrl('');
    setCurrentTime(0);
    setStartTime(0);

    const url = URL.createObjectURL(file);
    setVideoFile(url);
  };

  const handleVideoLoad = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      setEndTime(Math.min(5, dur));
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (_event: Event, value: number | number[]) => {
    const time = value as number;
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleStartTimeChange = (_event: Event, value: number | number[]) => {
    const time = value as number;
    setStartTime(time);
    if (time >= endTime) {
      setEndTime(Math.min(time + 1, duration));
    }
  };

  const handleEndTimeChange = (_event: Event, value: number | number[]) => {
    const time = value as number;
    setEndTime(time);
    if (time <= startTime) {
      setStartTime(Math.max(time - 1, 0));
    }
  };

  const handleQualityChange = (event: SelectChangeEvent) => {
    setQuality(event.target.value as GifQuality);
  };

  const captureFrame = async (time: number, targetWidth: number): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current || !canvasRef.current) {
        reject(new Error('Video or canvas not ready'));
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Cannot get canvas context'));
        return;
      }

      video.currentTime = time;

      video.onseeked = () => {
        // 计算缩放后的尺寸
        const scale = targetWidth / video.videoWidth;
        canvas.width = targetWidth;
        canvas.height = Math.floor(video.videoHeight * scale);

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        resolve(imageData);
      };

      video.onerror = () => {
        reject(new Error('Failed to seek video'));
      };
    });
  };

  const handleGenerateGif = async () => {
    if (!videoRef.current) {
      setError('请先加载视频');
      return;
    }

    const clipDuration = endTime - startTime;
    if (clipDuration <= 0) {
      setError('结束时间必须大于开始时间');
      return;
    }

    if (clipDuration > 10) {
      setError('片段时长不能超过10秒（性能限制）');
      return;
    }

    setGenerating(true);
    setError('');
    setProgress(0);

    try {
      const settings = qualitySettings[quality];
      const frameCount = Math.floor(clipDuration * fps);
      const delay = 1000 / fps;

      // 创建 GIF 编码器
      const gif = new GIF({
        workers: 2,
        quality: settings.quality,
        width: settings.width,
        workerScript: '/Octopus/gif.worker.js', // 需要配置 worker 路径
      });

      gif.on('progress', (p: number) => {
        setProgress(p * 100);
      });

      // 捕获帧
      for (let i = 0; i < frameCount; i++) {
        const time = startTime + (i * clipDuration / frameCount);
        const imageData = await captureFrame(time, settings.width);
        gif.addFrame(imageData, { delay });
      }

      // 渲染 GIF
      gif.on('finished', (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        setGifUrl(url);
        setSuccess('GIF 生成成功！');
        setTimeout(() => setSuccess(''), 3000);
        setGenerating(false);
      });

      gif.render();
    } catch (err) {
      console.error(err);
      setError('生成失败：' + (err instanceof Error ? err.message : '未知错误'));
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!gifUrl) return;

    const link = document.createElement('a');
    link.href = gifUrl;
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    link.download = `${nameWithoutExt}.gif`;
    link.click();

    setSuccess('GIF 已下载！');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleClear = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (videoFile) {
      URL.revokeObjectURL(videoFile);
    }
    if (gifUrl) {
      URL.revokeObjectURL(gifUrl);
    }
    setVideoFile('');
    setFileName('');
    setDuration(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setStartTime(0);
    setEndTime(5);
    setGifUrl('');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          GIF 制作
        </Typography>
        <Typography color="text.secondary" paragraph>
          从视频片段生成 GIF 动图
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          💡 <strong>提示：</strong>建议片段时长不超过 10 秒，以获得最佳性能和文件大小。
        </Typography>
      </Alert>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          上传视频
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <ImageUploadBox onFileSelect={handleFileSelect} accept="video/*" />

        {fileName && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>文件名：</strong>{fileName}
            </Typography>
          </Alert>
        )}
      </Paper>

      {videoFile && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              视频预览
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box
              sx={{
                border: '2px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden',
                bgcolor: 'black',
                mb: 2,
              }}
            >
              <video
                ref={videoRef}
                src={videoFile}
                onLoadedMetadata={handleVideoLoad}
                onTimeUpdate={handleTimeUpdate}
                style={{
                  width: '100%',
                  maxHeight: 400,
                  display: 'block',
                }}
              />
            </Box>

            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="outlined"
                  onClick={handlePlayPause}
                  startIcon={isPlaying ? <Pause /> : <PlayArrow />}
                >
                  {isPlaying ? '暂停' : '播放'}
                </Button>
                <Typography variant="body2" color="text.secondary">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Typography>
              </Stack>

              <Box sx={{ px: 2 }}>
                <Slider
                  value={currentTime}
                  min={0}
                  max={duration}
                  step={0.1}
                  onChange={handleSeek}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => formatTime(value)}
                />
              </Box>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              GIF 设置
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={3}>
              <Box>
                <Typography gutterBottom>
                  开始时间: {formatTime(startTime)}
                </Typography>
                <Slider
                  value={startTime}
                  onChange={handleStartTimeChange}
                  min={0}
                  max={duration}
                  step={0.1}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => formatTime(value)}
                />
              </Box>

              <Box>
                <Typography gutterBottom>
                  结束时间: {formatTime(endTime)}
                </Typography>
                <Slider
                  value={endTime}
                  onChange={handleEndTimeChange}
                  min={0}
                  max={duration}
                  step={0.1}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => formatTime(value)}
                />
              </Box>

              <Typography variant="body2" color="text.secondary">
                片段时长: {(endTime - startTime).toFixed(1)} 秒
              </Typography>

              <Box>
                <Typography gutterBottom>
                  帧率: {fps} FPS
                </Typography>
                <Slider
                  value={fps}
                  onChange={(_, value) => setFps(value as number)}
                  min={5}
                  max={30}
                  step={5}
                  marks
                  valueLabelDisplay="auto"
                />
                <Typography variant="caption" color="text.secondary">
                  帧率越高，动画越流畅，但文件也越大
                </Typography>
              </Box>

              <FormControl fullWidth>
                <InputLabel>质量</InputLabel>
                <Select
                  value={quality}
                  onChange={handleQualityChange}
                  label="质量"
                  disabled={generating}
                >
                  <MenuItem value="high">{qualitySettings.high.label}</MenuItem>
                  <MenuItem value="medium">{qualitySettings.medium.label}</MenuItem>
                  <MenuItem value="low">{qualitySettings.low.label}</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                onClick={handleGenerateGif}
                disabled={generating}
                size="large"
              >
                {generating ? '生成中...' : '🎬 生成 GIF'}
              </Button>

              {generating && (
                <Box>
                  <LinearProgress variant="determinate" value={progress} />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    正在生成 GIF... {Math.round(progress)}%
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>

          {gifUrl && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  生成结果
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={handleDownload}
                  >
                    下载 GIF
                  </Button>
                  <Button variant="outlined" onClick={handleClear}>
                    清空
                  </Button>
                </Stack>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'success.main',
                  borderRadius: 1,
                  p: 2,
                  textAlign: 'center',
                  bgcolor: 'background.default',
                }}
              >
                <img
                  src={gifUrl}
                  alt="Generated GIF"
                  style={{ maxWidth: '100%', display: 'block', margin: '0 auto' }}
                />
              </Box>
            </Paper>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </>
      )}
    </Container>
  );
};

