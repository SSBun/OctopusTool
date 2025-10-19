import React, { useState, useRef, useEffect } from 'react';
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
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { PlayArrow, Pause, GraphicEq } from '@mui/icons-material';
import { ImageUploadBox } from '../../../components/ImageUploadBox';

type WaveformType = 'waveform' | 'bars';

export const WaveformTool: React.FC = () => {
  const [audioFile, setAudioFile] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [waveformType, setWaveformType] = useState<WaveformType>('waveform');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState('');
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPlayingRef = useRef<boolean>(false); // 使用 ref 避免闭包问题

  // 坐标轴边距
  const MARGIN_LEFT = 60;
  const MARGIN_BOTTOM = 50;
  const MARGIN_TOP = 20;
  const MARGIN_RIGHT = 20;

  // 设置高清晰度 Canvas
  const setupHighDPICanvas = (canvas: HTMLCanvasElement, width: number, height: number) => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    return ctx;
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError('请选择音频文件');
      return;
    }

    setFileName(file.name);
    setError('');
    setCurrentTime(0);
    setIsPlaying(false);
    isPlayingRef.current = false; // 同步更新 ref

    const url = URL.createObjectURL(file);
    setAudioFile(url);

    try {
      // 创建 Audio Context
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      // 读取音频数据用于波形显示
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      audioBufferRef.current = audioBuffer;

      // 设置高清晰度 Canvas
      if (canvasRef.current) {
        setupHighDPICanvas(canvasRef.current, 1000, 400);
      }

      // 绘制静态波形
      drawStaticWaveform(audioBuffer);
    } catch (err) {
      console.error(err);
      setError('无法处理音频文件');
    }
  };

  const setupAnalyser = () => {
    if (!audioRef.current || !audioContextRef.current) return;

    const audioContext = audioContextRef.current;
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;

    const source = audioContext.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyserRef.current = analyser;
  };

  // 绘制坐标轴（现代风格）
  const drawAxes = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const chartWidth = width - MARGIN_LEFT - MARGIN_RIGHT;
    const chartHeight = height - MARGIN_BOTTOM - MARGIN_TOP;

    // 使用更柔和的颜色和细线条
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 1;
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#94a3b8';

    // 绘制网格线（水平）
    const yLabels = [
      { value: 1.0, label: '1.0' },
      { value: 0.5, label: '0.5' },
      { value: 0, label: '0' },
      { value: -0.5, label: '-0.5' },
      { value: -1.0, label: '-1.0' }
    ];

    yLabels.forEach(({ value, label }) => {
      const y = MARGIN_TOP + chartHeight / 2 - (value * chartHeight) / 2;
      
      // 绘制网格线
      ctx.beginPath();
      ctx.strokeStyle = value === 0 ? 'rgba(148, 163, 184, 0.4)' : 'rgba(148, 163, 184, 0.15)';
      ctx.moveTo(MARGIN_LEFT, y);
      ctx.lineTo(width - MARGIN_RIGHT, y);
      ctx.stroke();
      
      // 绘制 Y 轴标签
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(label, MARGIN_LEFT - 10, y);
    });

    // 绘制网格线（垂直）和 X 轴时间标签
    const numTimeMarkers = Math.min(12, Math.ceil(duration / 5)); // 根据时长动态调整
    for (let i = 0; i <= numTimeMarkers; i++) {
      const x = MARGIN_LEFT + (chartWidth / numTimeMarkers) * i;
      const time = (duration / numTimeMarkers) * i;
      
      // 绘制垂直网格线
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
      ctx.moveTo(x, MARGIN_TOP);
      ctx.lineTo(x, height - MARGIN_BOTTOM);
      ctx.stroke();
      
      // 绘制 X 轴时间标签
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(formatTime(time), x, height - MARGIN_BOTTOM + 10);
    }

    // 绘制坐标轴边框（更细）
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(MARGIN_LEFT, MARGIN_TOP);
    ctx.lineTo(MARGIN_LEFT, height - MARGIN_BOTTOM);
    ctx.lineTo(width - MARGIN_RIGHT, height - MARGIN_BOTTOM);
    ctx.stroke();
  };

  // 绘制进度竖线（优化版）
  const drawProgressLine = (ctx: CanvasRenderingContext2D, width: number, height: number, time?: number) => {
    if (duration === 0) return;

    // 优先使用传入的时间，否则使用 state 中的时间，最后尝试从 audio 元素读取
    const currentPlayTime = time ?? currentTime ?? audioRef.current?.currentTime ?? 0;
    
    const chartWidth = width - MARGIN_LEFT - MARGIN_RIGHT;
    const progress = currentPlayTime / duration;
    const x = MARGIN_LEFT + chartWidth * progress;

    // 绘制阴影效果
    ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
    ctx.shadowBlur = 8;

    // 绘制进度线
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, MARGIN_TOP);
    ctx.lineTo(x, height - MARGIN_BOTTOM);
    ctx.stroke();

    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // 绘制顶部圆形指示器
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(x, MARGIN_TOP + 8, 7, 0, Math.PI * 2);
    ctx.fill();

    // 绘制内部白色圆点
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, MARGIN_TOP + 8, 3, 0, Math.PI * 2);
    ctx.fill();

    // 绘制底部小三角形
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(x, height - MARGIN_BOTTOM);
    ctx.lineTo(x - 5, height - MARGIN_BOTTOM + 8);
    ctx.lineTo(x + 5, height - MARGIN_BOTTOM + 8);
    ctx.closePath();
    ctx.fill();
  };

  const drawStaticWaveform = (audioBuffer: AudioBuffer) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 使用 style 尺寸而不是实际 canvas 尺寸
    const width = parseInt(canvas.style.width) || 1000;
    const height = parseInt(canvas.style.height) || 400;
    const chartWidth = width - MARGIN_LEFT - MARGIN_RIGHT;
    const chartHeight = height - MARGIN_BOTTOM - MARGIN_TOP;
    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / chartWidth);
    const amp = chartHeight / 2;

    // 清空画布
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, width, height);

    // 绘制坐标轴
    drawAxes(ctx, width, height);

    // 绘制波形（优化线条）
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#3b82f6';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    for (let i = 0; i < chartWidth; i++) {
      let min = 1.0;
      let max = -1.0;

      for (let j = 0; j < step; j++) {
        const datum = data[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }

      const x = MARGIN_LEFT + i;
      const y1 = MARGIN_TOP + chartHeight / 2 - (min * amp);
      const y2 = MARGIN_TOP + chartHeight / 2 - (max * amp);

      if (i === 0) {
        ctx.moveTo(x, y1);
      }
      ctx.lineTo(x, y1);
      ctx.lineTo(x, y2);
    }

    ctx.stroke();

    // 绘制进度线（静态波形使用当前 state 中的时间）
    drawProgressLine(ctx, width, height);
  };

  // 统一的播放动画循环（用于更新进度线和实时可视化）
  const startPlaybackAnimation = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 如果有实时分析器，准备数据数组
    let analyser: AnalyserNode | null = null;
    let bufferLength = 0;
    let dataArray: Uint8Array | null = null;

    if (analyserRef.current) {
      analyser = analyserRef.current;
      bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
    }

    const draw = () => {
      // 使用 ref 而不是 state，避免闭包捕获旧值
      if (!isPlayingRef.current) return;

      animationRef.current = requestAnimationFrame(draw);

      // 使用 style 尺寸
      const width = parseInt(canvas.style.width) || 1000;
      const height = parseInt(canvas.style.height) || 400;
      const chartWidth = width - MARGIN_LEFT - MARGIN_RIGHT;
      const chartHeight = height - MARGIN_BOTTOM - MARGIN_TOP;

      // 清空画布
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, width, height);

      // 绘制坐标轴
      drawAxes(ctx, width, height);

      // 如果有实时分析器，绘制实时可视化
      if (analyser && dataArray) {
        if (waveformType === 'waveform') {
          // 绘制实时波形
          analyser.getByteTimeDomainData(dataArray);

          ctx.lineWidth = 1.5;
          ctx.strokeStyle = '#3b82f6';
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();

          const sliceWidth = chartWidth / bufferLength;
          let x = MARGIN_LEFT;

          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = MARGIN_TOP + (v * chartHeight) / 2;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }

            x += sliceWidth;
          }

          ctx.lineTo(width - MARGIN_RIGHT, MARGIN_TOP + chartHeight / 2);
          ctx.stroke();
        } else {
          // 绘制实时频谱
          analyser.getByteFrequencyData(dataArray);

          const barCount = Math.min(bufferLength, 150);
          const barWidth = chartWidth / barCount;
          let x = MARGIN_LEFT;

          for (let i = 0; i < barCount; i++) {
            const dataIndex = Math.floor((i * bufferLength) / barCount);
            const barHeight = (dataArray[dataIndex] / 255) * chartHeight;

            const hue = (i / barCount) * 360;
            ctx.fillStyle = `hsl(${hue}, 75%, 55%)`;
            ctx.fillRect(x, height - MARGIN_BOTTOM - barHeight, barWidth - 1, barHeight);

            x += barWidth;
          }
        }
      } else {
        // 没有实时分析器，只绘制静态波形
        if (audioBufferRef.current) {
          const data = audioBufferRef.current.getChannelData(0);
          const step = Math.ceil(data.length / chartWidth);
          const amp = chartHeight / 2;

          ctx.lineWidth = 1.5;
          ctx.strokeStyle = '#3b82f6';
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();

          for (let i = 0; i < chartWidth; i++) {
            let min = 1.0;
            let max = -1.0;

            for (let j = 0; j < step; j++) {
              const datum = data[i * step + j];
              if (datum < min) min = datum;
              if (datum > max) max = datum;
            }

            const x = MARGIN_LEFT + i;
            const y1 = MARGIN_TOP + chartHeight / 2 - (min * amp);
            const y2 = MARGIN_TOP + chartHeight / 2 - (max * amp);

            if (i === 0) {
              ctx.moveTo(x, y1);
            }
            ctx.lineTo(x, y1);
            ctx.lineTo(x, y2);
          }

          ctx.stroke();
        }
      }

      // 始终绘制进度线（关键！）
      // 直接从 audio 元素读取当前时间，避免闭包捕获旧的 state 值
      const currentPlayTime = audioRef.current?.currentTime ?? 0;
      drawProgressLine(ctx, width, height, currentPlayTime);
    };

    draw();
  };

  const handleAudioLoad = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Canvas 鼠标事件处理
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !audioRef.current || duration === 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    
    const width = rect.width;
    const chartWidth = width - MARGIN_LEFT - MARGIN_RIGHT;
    
    if (x >= MARGIN_LEFT && x <= width - MARGIN_RIGHT) {
      const progress = (x - MARGIN_LEFT) / chartWidth;
      const newTime = progress * duration;
      
      audioRef.current.currentTime = Math.max(0, Math.min(newTime, duration));
      setCurrentTime(audioRef.current.currentTime);
      
      // 如果不在播放，手动更新一次静态波形显示进度线
      if (!isPlaying && audioBufferRef.current) {
        drawStaticWaveform(audioBufferRef.current);
      }
    }
  };

  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    handleCanvasClick(event);
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    handleCanvasClick(event);
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasMouseLeave = () => {
    setIsDragging(false);
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      // 暂停
      audioRef.current.pause();
      setIsPlaying(false);
      isPlayingRef.current = false; // 同步更新 ref
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // 暂停时绘制一次静态波形
      if (audioBufferRef.current) {
        drawStaticWaveform(audioBufferRef.current);
      }
    } else {
      // 播放
      // 首次播放时设置分析器
      if (!analyserRef.current) {
        setupAnalyser();
      }
      
      // 先更新 ref（这样动画循环能立即读取到正确的值）
      isPlayingRef.current = true;
      setIsPlaying(true);
      
      audioRef.current.play();
      // 使用统一的播放动画循环
      startPlaybackAnimation();
    }
  };

  const handleSeek = (_event: Event, value: number | number[]) => {
    const time = value as number;
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      
      // 如果不在播放，手动更新一次静态波形显示进度线
      if (!isPlaying && audioBufferRef.current) {
        drawStaticWaveform(audioBufferRef.current);
      }
    }
  };

  const handleWaveformTypeChange = (_event: React.MouseEvent<HTMLElement>, newType: WaveformType | null) => {
    if (newType !== null) {
      setWaveformType(newType);
    }
  };

  const handleClear = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (audioFile) {
      URL.revokeObjectURL(audioFile);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setAudioFile('');
    setFileName('');
    setDuration(0);
    setCurrentTime(0);
    setIsPlaying(false);
    isPlayingRef.current = false; // 同步更新 ref
    audioContextRef.current = null;
    analyserRef.current = null;
    audioBufferRef.current = null;
  };

  // 初始化和清理
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && audioBufferRef.current) {
        setupHighDPICanvas(canvasRef.current, 1000, 400);
        drawStaticWaveform(audioBufferRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [audioBufferRef.current]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Container maxWidth="lg">
      <ToolDetailHeader
        title="音频波形可视化"
        description="查看音频波形和频谱，实时可视化播放"
        toolPath="/media/audio/waveform"
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

        {fileName && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>文件名：</strong>{fileName}
            </Typography>
          </Alert>
        )}
      </Paper>

      {audioFile && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                可视化
              </Typography>
              <ToggleButtonGroup
                value={waveformType}
                exclusive
                onChange={handleWaveformTypeChange}
                size="small"
              >
                <ToggleButton value="waveform">
                  <GraphicEq sx={{ mr: 1 }} fontSize="small" />
                  波形
                </ToggleButton>
                <ToggleButton value="bars">
                  <GraphicEq sx={{ mr: 1 }} fontSize="small" />
                  频谱
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Box
              ref={containerRef}
              sx={{
                border: '2px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden',
                bgcolor: '#1e293b',
                position: 'relative',
              }}
            >
              <canvas
                ref={canvasRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseLeave}
                style={{
                  width: '100%',
                  height: '400px',
                  display: 'block',
                  cursor: isDragging ? 'grabbing' : 'pointer',
                }}
              />
            </Box>

            <Stack spacing={2} sx={{ mt: 3 }}>
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

              <Button variant="outlined" onClick={handleClear}>
                清空
              </Button>
            </Stack>
          </Paper>

          <audio
            ref={audioRef}
            src={audioFile}
            onLoadedMetadata={handleAudioLoad}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => {
              setIsPlaying(false);
              isPlayingRef.current = false;
              if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
              }
              // 播放结束后绘制一次静态波形
              if (audioBufferRef.current) {
                drawStaticWaveform(audioBufferRef.current);
              }
            }}
            style={{ display: 'none' }}
          />
        </>
      )}
    </Container>
  );
};

