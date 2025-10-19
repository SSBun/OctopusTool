import React, { useState, useEffect } from 'react';
import {
Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { Schedule, Clear, CheckCircle, Refresh } from '@mui/icons-material';

export const TimestampTool: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [timestampInput, setTimestampInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [timestampUnit, setTimestampUnit] = useState<'ms' | 's'>('ms');
  const [timestampResult, setTimestampResult] = useState('');
  const [dateResult, setDateResult] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTimestampToDate = () => {
    try {
      const timestamp =
        timestampUnit === 's'
          ? parseInt(timestampInput) * 1000
          : parseInt(timestampInput);
      const date = new Date(timestamp);
      setTimestampResult(date.toLocaleString('zh-CN', { hour12: false }));
    } catch {
      setTimestampResult('无效的时间戳');
    }
  };

  const handleDateToTimestamp = () => {
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) {
        setDateResult('无效的日期格式');
        return;
      }
      const timestamp = timestampUnit === 's' ? Math.floor(date.getTime() / 1000) : date.getTime();
      setDateResult(timestamp.toString());
    } catch {
      setDateResult('无效的日期格式');
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  const handleUseCurrentTime = () => {
    const timestamp = timestampUnit === 's' ? Math.floor(currentTime / 1000) : currentTime;
    setTimestampInput(timestamp.toString());
  };

  return (
    <Container maxWidth="lg">
      <ToolDetailHeader
        title="时间戳转换工具"
        description="时间戳和日期时间相互转换"
        toolPath="/tools/data/timestamp"
      />

      {copied && (
        <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
          已复制到剪贴板！
        </Alert>
      )}

      {/* 当前时间 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          当前时间
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              本地时间
            </Typography>
            <Typography variant="h6">
              {new Date(currentTime).toLocaleString('zh-CN', { hour12: false })}
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box>
            <Typography variant="body2" color="text.secondary">
              时间戳（毫秒）
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontFamily: 'monospace', cursor: 'pointer' }}
              onClick={() => handleCopy(currentTime.toString())}
            >
              {currentTime}
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box>
            <Typography variant="body2" color="text.secondary">
              时间戳（秒）
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontFamily: 'monospace', cursor: 'pointer' }}
              onClick={() => handleCopy(Math.floor(currentTime / 1000).toString())}
            >
              {Math.floor(currentTime / 1000)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* 单位选择 */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          时间戳单位：
        </Typography>
        <ToggleButtonGroup
          value={timestampUnit}
          exclusive
          onChange={(_, value) => value && setTimestampUnit(value)}
          size="small"
        >
          <ToggleButton value="ms">毫秒</ToggleButton>
          <ToggleButton value="s">秒</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* 时间戳转日期 */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            时间戳 → 日期时间
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              label={`时间戳（${timestampUnit === 'ms' ? '毫秒' : '秒'}）`}
              value={timestampInput}
              onChange={(e) => setTimestampInput(e.target.value)}
              placeholder="输入时间戳"
              sx={{ '& .MuiOutlinedInput-root': { fontFamily: 'monospace' } }}
            />
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleUseCurrentTime}
              sx={{ minWidth: 'fit-content' }}
            >
              当前
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<Schedule />}
              onClick={handleTimestampToDate}
              disabled={!timestampInput}
              fullWidth
            >
              转换
            </Button>
            <Button variant="outlined" startIcon={<Clear />} onClick={() => {
              setTimestampInput('');
              setTimestampResult('');
            }}>
              清空
            </Button>
          </Box>
          {timestampResult && (
            <Paper
              sx={{
                p: 2,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa',
                cursor: 'pointer',
              }}
              onClick={() => handleCopy(timestampResult)}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                转换结果：
              </Typography>
              <Typography variant="h6">{timestampResult}</Typography>
            </Paper>
          )}
        </Paper>

        {/* 日期转时间戳 */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            日期时间 → 时间戳
          </Typography>
          <TextField
            fullWidth
            label="日期时间"
            type="datetime-local"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<Schedule />}
              onClick={handleDateToTimestamp}
              disabled={!dateInput}
              fullWidth
            >
              转换
            </Button>
            <Button variant="outlined" startIcon={<Clear />} onClick={() => {
              setDateInput('');
              setDateResult('');
            }}>
              清空
            </Button>
          </Box>
          {dateResult && (
            <Paper
              sx={{
                p: 2,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa',
                cursor: 'pointer',
              }}
              onClick={() => handleCopy(dateResult)}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                转换结果（{timestampUnit === 'ms' ? '毫秒' : '秒'}）：
              </Typography>
              <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                {dateResult}
              </Typography>
            </Paper>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

