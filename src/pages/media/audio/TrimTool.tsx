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
} from '@mui/material';
import {
  Download,
  PlayArrow,
  Pause,
  ContentCut,
} from '@mui/icons-material';
import { ImageUploadBox } from '../../../components/ImageUploadBox';

export const TrimTool: React.FC = () => {
  const [audioFile, setAudioFile] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [trimmedAudio, setTrimmedAudio] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError('请选择音频文件');
      return;
    }

    setFileName(file.name);
    setError('');
    setTrimmedAudio('');
    setCurrentTime(0);
    setStartTime(0);

    const url = URL.createObjectURL(file);
    setAudioFile(url);

    try {
      // 使用 Web Audio API 解码音频
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      audioBufferRef.current = audioBuffer;

      setDuration(audioBuffer.duration);
      setEndTime(audioBuffer.duration);
    } catch (err) {
      console.error(err);
      setError('无法处理音频文件');
    }
  };

  const handleAudioLoad = () => {
    if (audioRef.current && !audioBufferRef.current) {
      setDuration(audioRef.current.duration);
      setEndTime(audioRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (_event: Event, value: number | number[]) => {
    const time = value as number;
    if (audioRef.current) {
      audioRef.current.currentTime = time;
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

  const handleTrim = async () => {
    if (!audioBufferRef.current || !audioContextRef.current) {
      setError('音频数据未准备好');
      return;
    }

    const trimDuration = endTime - startTime;
    if (trimDuration <= 0) {
      setError('结束时间必须大于开始时间');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const audioContext = audioContextRef.current;
      const originalBuffer = audioBufferRef.current;
      const sampleRate = originalBuffer.sampleRate;
      const numberOfChannels = originalBuffer.numberOfChannels;

      // 计算裁剪的样本数
      const startSample = Math.floor(startTime * sampleRate);
      const endSample = Math.floor(endTime * sampleRate);
      const trimmedLength = endSample - startSample;

      // 创建新的 AudioBuffer
      const trimmedBuffer = audioContext.createBuffer(
        numberOfChannels,
        trimmedLength,
        sampleRate
      );

      // 复制每个声道的数据
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const originalData = originalBuffer.getChannelData(channel);
        const trimmedData = trimmedBuffer.getChannelData(channel);
        
        for (let i = 0; i < trimmedLength; i++) {
          trimmedData[i] = originalData[startSample + i];
        }
      }

      // 将 AudioBuffer 转换为 WAV Blob
      const wavBlob = audioBufferToWav(trimmedBuffer);
      const url = URL.createObjectURL(wavBlob);
      setTrimmedAudio(url);

      setSuccess('裁剪成功！');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('裁剪失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setProcessing(false);
    }
  };

  // 将 AudioBuffer 转换为 WAV 格式
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length * numberOfChannels * 2;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);

    // WAV 文件头
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length, true);

    // 写入音频数据
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  const handleDownload = () => {
    if (!trimmedAudio) return;

    const link = document.createElement('a');
    link.href = trimmedAudio;
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    link.download = `${nameWithoutExt}_trimmed.wav`;
    link.click();

    setSuccess('音频已下载！');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleClear = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (audioFile) {
      URL.revokeObjectURL(audioFile);
    }
    if (trimmedAudio) {
      URL.revokeObjectURL(trimmedAudio);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setAudioFile('');
    setFileName('');
    setDuration(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setStartTime(0);
    setEndTime(0);
    setTrimmedAudio('');
    audioContextRef.current = null;
    audioBufferRef.current = null;
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
          音频裁剪
        </Typography>
        <Typography color="text.secondary" paragraph>
          裁剪音频片段，导出为 WAV 格式
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
            <Typography variant="h6" gutterBottom fontWeight={600}>
              音频预览
            </Typography>
            <Divider sx={{ mb: 3 }} />

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

            <audio
              ref={audioRef}
              src={audioFile}
              onLoadedMetadata={handleAudioLoad}
              onTimeUpdate={handleTimeUpdate}
              style={{ display: 'none' }}
            />
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              裁剪设置
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
                裁剪时长: {formatTime(endTime - startTime)}
              </Typography>

              <Button
                variant="contained"
                onClick={handleTrim}
                disabled={processing}
                size="large"
                startIcon={<ContentCut />}
              >
                {processing ? '处理中...' : '✂️ 裁剪音频'}
              </Button>
            </Stack>
          </Paper>

          {trimmedAudio && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  裁剪结果
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={handleDownload}
                  >
                    下载音频
                  </Button>
                  <Button variant="outlined" onClick={handleClear}>
                    清空
                  </Button>
                </Stack>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Box
                sx={{
                  border: '2px solid',
                  borderColor: 'success.main',
                  borderRadius: 1,
                  p: 2,
                  bgcolor: 'background.default',
                }}
              >
                <audio
                  src={trimmedAudio}
                  controls
                  style={{
                    width: '100%',
                    display: 'block',
                  }}
                />
              </Box>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="caption">
                  💡 裁剪后的音频已转换为 WAV 格式，保证最佳兼容性
                </Typography>
              </Alert>
            </Paper>
          )}
        </>
      )}
    </Container>
  );
};

