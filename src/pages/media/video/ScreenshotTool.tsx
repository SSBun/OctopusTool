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
  Grid,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { Download, PlayArrow, Pause, Delete, ZoomIn } from '@mui/icons-material';
import { ImageUploadBox } from '../../../components/ImageUploadBox';

interface Screenshot {
  id: number;
  dataUrl: string;
  time: number;
}

export const ScreenshotTool: React.FC = () => {
  const [videoFile, setVideoFile] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextIdRef = useRef<number>(1);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('请选择视频文件');
      return;
    }

    setFileName(file.name);
    setError('');
    setScreenshots([]);
    setCurrentTime(0);
    nextIdRef.current = 1;

    const url = URL.createObjectURL(file);
    setVideoFile(url);
  };

  const handleVideoLoad = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
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

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('无法截图');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setError('无法获取 Canvas 上下文');
      return;
    }

    // 设置 canvas 尺寸为视频尺寸
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 绘制当前帧
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 转换为 base64
    const dataUrl = canvas.toDataURL('image/png');
    
    // 添加到截图列表
    const newScreenshot: Screenshot = {
      id: nextIdRef.current++,
      dataUrl,
      time: currentTime,
    };
    setScreenshots((prev) => [...prev, newScreenshot]);

    setSuccess('截图成功！');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDownloadSingle = (screenshot: Screenshot) => {
    const link = document.createElement('a');
    link.href = screenshot.dataUrl;
    const timestamp = Math.floor(screenshot.time);
    link.download = `screenshot_${fileName}_${timestamp}s.png`;
    link.click();
  };

  const handleDownloadAll = () => {
    screenshots.forEach((screenshot, index) => {
      setTimeout(() => handleDownloadSingle(screenshot), index * 100);
    });
    setSuccess('批量下载已启动！');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDeleteScreenshot = (id: number) => {
    setScreenshots((prev) => prev.filter((s) => s.id !== id));
  };

  const handlePreview = (dataUrl: string) => {
    setPreviewImage(dataUrl);
  };

  const handleClosePreview = () => {
    setPreviewImage('');
  };

  const handleClear = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (videoFile) {
      URL.revokeObjectURL(videoFile);
    }
    setVideoFile('');
    setFileName('');
    setDuration(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setScreenshots([]);
    nextIdRef.current = 1;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Container maxWidth="lg">
      <ToolDetailHeader
        title="视频截图"
        description="从视频中截取任意帧，保存为图片"
        toolPath="/media/video/screenshot"
      />

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

        <ImageUploadBox
          onFileSelect={handleFileSelect}
          accept="video/*"
        />

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
                position: 'relative',
              }}
            >
              <video
                ref={videoRef}
                src={videoFile}
                onLoadedMetadata={handleVideoLoad}
                onTimeUpdate={handleTimeUpdate}
                style={{
                  width: '100%',
                  maxHeight: 500,
                  display: 'block',
                }}
              />
            </Box>

            <Stack spacing={2} sx={{ mt: 2 }}>
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

              <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleCapture}
                  disabled={!videoFile}
                  size="large"
                  sx={{ flex: '0 1 auto' }}
                >
                  📸 截取当前画面
                </Button>
                {screenshots.length > 0 && (
                  <Button
                    variant="outlined"
                    onClick={handleDownloadAll}
                    startIcon={<Download />}
                    sx={{ flex: '0 1 auto' }}
                  >
                    下载全部 ({screenshots.length})
                  </Button>
                )}
                <Button 
                  variant="outlined" 
                  onClick={handleClear}
                  sx={{ flex: '0 1 auto' }}
                >
                  清空
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {screenshots.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                截图结果 ({screenshots.length} 张)
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                {screenshots.map((screenshot) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={screenshot.id}>
                    <Card>
                      <CardMedia
                        component="img"
                        image={screenshot.dataUrl}
                        alt={`Screenshot ${screenshot.id}`}
                        sx={{
                          height: 200,
                          objectFit: 'contain',
                          bgcolor: 'black',
                          cursor: 'pointer',
                        }}
                        onClick={() => handlePreview(screenshot.dataUrl)}
                      />
                      <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(screenshot.time)}
                        </Typography>
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => handlePreview(screenshot.dataUrl)}
                            title="预览"
                          >
                            <ZoomIn fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadSingle(screenshot)}
                            title="下载"
                          >
                            <Download fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteScreenshot(screenshot.id)}
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
        </>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* 大图预览 Dialog */}
      <Dialog
        open={!!previewImage}
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 2, bgcolor: 'black' }}>
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

