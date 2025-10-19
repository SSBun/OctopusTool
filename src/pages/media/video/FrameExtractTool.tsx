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
  Grid,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  Slider,
} from '@mui/material';
import { Download, Delete } from '@mui/icons-material';
import { ImageUploadBox } from '../../../components/ImageUploadBox';

interface ExtractedFrame {
  id: number;
  dataUrl: string;
  time: number;
}

export const FrameExtractTool: React.FC = () => {
  const [videoFile, setVideoFile] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [frameCount, setFrameCount] = useState<number>(5);
  const [extractedFrames, setExtractedFrames] = useState<ExtractedFrame[]>([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [extracting, setExtracting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('请选择视频文件');
      return;
    }

    setFileName(file.name);
    setError('');
    setExtractedFrames([]);

    const url = URL.createObjectURL(file);
    setVideoFile(url);
  };

  const handleVideoLoad = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const captureFrame = async (time: number): Promise<string> => {
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
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      };

      video.onerror = () => {
        reject(new Error('Failed to seek video'));
      };
    });
  };

  const handleExtractFrames = async () => {
    if (!videoRef.current || duration === 0) {
      setError('请先加载视频');
      return;
    }

    setExtracting(true);
    setError('');
    const frames: ExtractedFrame[] = [];

    try {
      // 计算时间间隔
      const interval = duration / (frameCount + 1);

      for (let i = 1; i <= frameCount; i++) {
        const time = interval * i;
        const dataUrl = await captureFrame(time);
        frames.push({
          id: i,
          dataUrl,
          time,
        });
      }

      setExtractedFrames(frames);
      setSuccess(`成功提取 ${frames.length} 帧！`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('提取失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setExtracting(false);
    }
  };

  const handleDownloadFrame = (frame: ExtractedFrame) => {
    const link = document.createElement('a');
    link.href = frame.dataUrl;
    const timeStr = Math.floor(frame.time).toString().padStart(4, '0');
    link.download = `${fileName}_frame_${timeStr}s.png`;
    link.click();
  };

  const handleDownloadAll = () => {
    extractedFrames.forEach((frame) => {
      setTimeout(() => handleDownloadFrame(frame), frame.id * 100);
    });
    setSuccess('批量下载已启动！');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDeleteFrame = (id: number) => {
    setExtractedFrames((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClear = () => {
    if (videoFile) {
      URL.revokeObjectURL(videoFile);
    }
    setVideoFile('');
    setFileName('');
    setDuration(0);
    setExtractedFrames([]);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          视频帧提取
        </Typography>
        <Typography color="text.secondary" paragraph>
          从视频中批量提取关键帧，保存为图片
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
            {duration > 0 && (
              <Typography variant="body2">
                <strong>时长：</strong>{formatTime(duration)}
              </Typography>
            )}
          </Alert>
        )}
      </Paper>

      {videoFile && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              提取设置
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>
                提取帧数: {frameCount}
              </Typography>
              <Slider
                value={frameCount}
                onChange={(_, value) => setFrameCount(value as number)}
                min={1}
                max={20}
                marks
                valueLabelDisplay="auto"
              />
              <Typography variant="caption" color="text.secondary">
                将从视频中均匀提取 {frameCount} 个关键帧
              </Typography>
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={handleExtractFrames}
                disabled={!duration || extracting}
                size="large"
              >
                {extracting ? '提取中...' : '📸 开始提取'}
              </Button>
              {extractedFrames.length > 0 && (
                <>
                  <Button
                    variant="outlined"
                    onClick={handleDownloadAll}
                    startIcon={<Download />}
                  >
                    下载全部
                  </Button>
                  <Button variant="outlined" onClick={handleClear}>
                    清空
                  </Button>
                </>
              )}
            </Stack>
          </Paper>

          {extractedFrames.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                提取结果 ({extractedFrames.length} 帧)
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                {extractedFrames.map((frame) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={frame.id}>
                    <Card>
                      <CardMedia
                        component="img"
                        image={frame.dataUrl}
                        alt={`Frame ${frame.id}`}
                        sx={{
                          height: 200,
                          objectFit: 'contain',
                          bgcolor: 'black',
                        }}
                      />
                      <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(frame.time)}
                        </Typography>
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadFrame(frame)}
                            title="下载"
                          >
                            <Download fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteFrame(frame.id)}
                            title="删除"
                            color="error"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {/* 隐藏的视频和画布 */}
          <video
            ref={videoRef}
            src={videoFile}
            onLoadedMetadata={handleVideoLoad}
            style={{ display: 'none' }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </>
      )}
    </Container>
  );
};

