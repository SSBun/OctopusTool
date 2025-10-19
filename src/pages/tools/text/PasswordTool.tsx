import React, { useState, useEffect } from 'react';
import {
Container,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  Alert,
  Stack,
  Slider,
  FormControlLabel,
  Checkbox,
  Divider,
  LinearProgress,
  Chip,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { ContentCopy, Refresh, VpnKey } from '@mui/icons-material';

export const PasswordTool: React.FC = () => {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [passwords, setPasswords] = useState<string[]>([]);
  const [success, setSuccess] = useState('');

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = '';
    if (includeUppercase) chars += uppercase;
    if (includeLowercase) chars += lowercase;
    if (includeNumbers) chars += numbers;
    if (includeSymbols) chars += symbols;

    if (!chars) {
      setPassword('');
      return '';
    }

    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const calculateStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 20;
    if (pwd.length >= 12) strength += 20;
    if (pwd.length >= 16) strength += 10;
    if (/[a-z]/.test(pwd)) strength += 15;
    if (/[A-Z]/.test(pwd)) strength += 15;
    if (/[0-9]/.test(pwd)) strength += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 10;
    return Math.min(strength, 100);
  };

  const getStrengthLabel = (strength: number) => {
    if (strength < 40) return { label: '弱', color: 'error' as const };
    if (strength < 70) return { label: '中等', color: 'warning' as const };
    return { label: '强', color: 'success' as const };
  };

  const handleGenerate = () => {
    const newPassword = generatePassword();
    setPassword(newPassword);
  };

  const handleGenerateMultiple = () => {
    const newPasswords = Array.from({ length: 10 }, () => generatePassword());
    setPasswords(newPasswords);
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSuccess('已复制到剪贴板！');
    setTimeout(() => setSuccess(''), 2000);
  };

  useEffect(() => {
    handleGenerate();
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

  const strength = calculateStrength(password);
  const strengthInfo = getStrengthLabel(strength);

  return (
    <Container maxWidth="md">
      <ToolDetailHeader
        title="密码生成器"
        description="生成安全的随机密码，可自定义长度和字符类型"
        toolPath="/tools/text/password"
      />

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* 生成的密码 */}
      <Paper sx={{ p: 4, mb: 3, textAlign: 'center' }}>
        <VpnKey sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'monospace',
            wordBreak: 'break-all',
            mb: 2,
            p: 2,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            borderRadius: 1,
          }}
        >
          {password || '-'}
        </Typography>

        {password && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                密码强度:
              </Typography>
              <Chip label={strengthInfo.label} color={strengthInfo.color} size="small" />
            </Box>
            <LinearProgress
              variant="determinate"
              value={strength}
              color={strengthInfo.color}
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Box>
        )}

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="contained" startIcon={<Refresh />} onClick={handleGenerate}>
            重新生成
          </Button>
          <Button variant="outlined" startIcon={<ContentCopy />} onClick={() => handleCopy(password)} disabled={!password}>
            复制密码
          </Button>
        </Stack>
      </Paper>

      {/* 配置选项 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          密码配置
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            密码长度: {length}
          </Typography>
          <Slider
            value={length}
            onChange={(_, value) => setLength(value as number)}
            min={4}
            max={64}
            marks={[
              { value: 8, label: '8' },
              { value: 16, label: '16' },
              { value: 32, label: '32' },
              { value: 64, label: '64' },
            ]}
            valueLabelDisplay="auto"
          />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControlLabel
              control={<Checkbox checked={includeUppercase} onChange={(e) => setIncludeUppercase(e.target.checked)} />}
              label="大写字母 (A-Z)"
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel
              control={<Checkbox checked={includeLowercase} onChange={(e) => setIncludeLowercase(e.target.checked)} />}
              label="小写字母 (a-z)"
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel
              control={<Checkbox checked={includeNumbers} onChange={(e) => setIncludeNumbers(e.target.checked)} />}
              label="数字 (0-9)"
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel
              control={<Checkbox checked={includeSymbols} onChange={(e) => setIncludeSymbols(e.target.checked)} />}
              label="特殊符号 (!@#$)"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* 批量生成 */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            批量生成
          </Typography>
          <Button variant="outlined" size="small" onClick={handleGenerateMultiple}>
            生成 10 个密码
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {passwords.length > 0 ? (
          <Grid container spacing={1}>
            {passwords.map((pwd, index) => (
              <Grid item xs={12} key={index}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: 'background.default',
                  }}
                >
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{pwd}</Typography>
                  <Button size="small" startIcon={<ContentCopy />} onClick={() => handleCopy(pwd)}>
                    复制
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary" textAlign="center" py={4}>
            点击"生成 10 个密码"按钮批量生成
          </Typography>
        )}
      </Paper>

      {/* 安全提示 */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>安全提示：</strong>
          <br />
          • 密码长度至少 12 位，建议 16 位以上
          <br />
          • 混合使用大小写字母、数字和特殊符号
          <br />
          • 不要在多个网站使用相同密码
          <br />• 建议使用密码管理器保存密码
        </Typography>
      </Alert>
    </Container>
  );
};

