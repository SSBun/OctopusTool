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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Mic,
  Stop,
  Download,
  PlayArrow,
  Pause,
  Delete,
} from '@mui/icons-material';

interface Recording {
  id: number;
  blob: Blob;
  url: string;
  duration: number;
  timestamp: Date;
}

type AudioFormat = 'webm' | 'mp4' | 'ogg';

export const RecorderTool: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [audioFormat, setAudioFormat] = useState<AudioFormat>('webm');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioRefs = useRef<Map<number, HTMLAudioElement>>(new Map());
  const nextIdRef = useRef<number>(1);

  const getMimeType = (format: AudioFormat): string => {
    const mimeTypes = {
      webm: 'audio/webm',
      mp4: 'audio/mp4',
      ogg: 'audio/ogg',
    };
    return mimeTypes[format];
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getMimeType(audioFormat);
      const options = MediaRecorder.isTypeSupported(mimeType)
        ? { mimeType }
        : undefined;

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: getMimeType(audioFormat) });
        const url = URL.createObjectURL(blob);
        const duration = (Date.now() - startTimeRef.current) / 1000;

        const newRecording: Recording = {
          id: nextIdRef.current++,
          blob,
          url,
          duration,
          timestamp: new Date(),
        };

        setRecordings((prev) => [...prev, newRecording]);
        setSuccess('录音完成！');
        setTimeout(() => setSuccess(''), 3000);
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();

      timerRef.current = setInterval(() => {
        setRecordingTime((Date.now() - startTimeRef.current) / 1000);
      }, 100);
    } catch (err) {
      console.error(err);
      setError('无法访问麦克风：' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  };

  const handlePlay = (id: number) => {
    const audio = audioRefs.current.get(id);
    if (!audio) return;

    if (playingId === id) {
      audio.pause();
      setPlayingId(null);
    } else {
      // 暂停其他正在播放的
      audioRefs.current.forEach((a, audioId) => {
        if (audioId !== id) {
          a.pause();
        }
      });

      audio.play();
      setPlayingId(id);
    }
  };

  const handleDownload = (recording: Recording) => {
    const link = document.createElement('a');
    link.href = recording.url;
    const timestamp = recording.timestamp.toISOString().replace(/[:.]/g, '-');
    link.download = `recording_${timestamp}.${audioFormat}`;
    link.click();

    setSuccess('录音已下载！');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDelete = (id: number) => {
    setRecordings((prev) => prev.filter((r) => r.id !== id));
    audioRefs.current.delete(id);
  };

  const handleFormatChange = (event: SelectChangeEvent) => {
    setAudioFormat(event.target.value as AudioFormat);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      recordings.forEach((r) => URL.revokeObjectURL(r.url));
    };
  }, [recordings]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          音频录制
        </Typography>
        <Typography color="text.secondary" paragraph>
          使用麦克风录制音频，保存为文件
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
          录音控制
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel>输出格式</InputLabel>
            <Select
              value={audioFormat}
              onChange={handleFormatChange}
              label="输出格式"
              disabled={isRecording}
            >
              <MenuItem value="webm">WebM (推荐)</MenuItem>
              <MenuItem value="mp4">MP4</MenuItem>
              <MenuItem value="ogg">OGG</MenuItem>
            </Select>
          </FormControl>

          {isRecording && (
            <Box>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                <Chip
                  label="录音中"
                  color="error"
                  size="small"
                  icon={<Mic />}
                />
                <Typography variant="h5" color="error.main" fontFamily="monospace">
                  {formatTime(recordingTime)}
                </Typography>
              </Stack>
              <LinearProgress color="error" />
            </Box>
          )}

          <Stack direction="row" spacing={2}>
            {!isRecording ? (
              <Button
                variant="contained"
                color="error"
                size="large"
                startIcon={<Mic />}
                onClick={startRecording}
              >
                🎙️ 开始录音
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<Stop />}
                onClick={stopRecording}
              >
                ⏹️ 停止录音
              </Button>
            )}
          </Stack>

          <Alert severity="info">
            <Typography variant="caption">
              💡 <strong>提示：</strong>首次录音需要授权麦克风访问权限。录音文件将保存在浏览器中，不会上传到服务器。
            </Typography>
          </Alert>
        </Stack>
      </Paper>

      {recordings.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            录音列表 ({recordings.length} 条)
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={2}>
            {recordings.map((recording) => {
              const audio = audioRefs.current.get(recording.id) || new Audio(recording.url);
              if (!audioRefs.current.has(recording.id)) {
                audio.onended = () => setPlayingId(null);
                audioRefs.current.set(recording.id, audio);
              }

              return (
                <Paper key={recording.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handlePlay(recording.id)}
                      startIcon={playingId === recording.id ? <Pause /> : <PlayArrow />}
                    >
                      {playingId === recording.id ? '暂停' : '播放'}
                    </Button>
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        录音 #{recording.id}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        时长: {formatTime(recording.duration)} • {formatDate(recording.timestamp)}
                      </Typography>
                    </Box>

                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleDownload(recording)}
                      startIcon={<Download />}
                    >
                      下载
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() => handleDelete(recording.id)}
                      startIcon={<Delete />}
                    >
                      删除
                    </Button>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        </Paper>
      )}
    </Container>
  );
};

