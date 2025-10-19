import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  Stack,
  TextField,
  Divider,
} from '@mui/material';
import { ContentCopy, Refresh, Add } from '@mui/icons-material';

export const UuidTool: React.FC = () => {
  const [uuid, setUuid] = useState('');
  const [uuidList, setUuidList] = useState<string[]>([]);
  const [count, setCount] = useState(10);
  const [success, setSuccess] = useState('');

  const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const handleGenerate = () => {
    setUuid(generateUUID());
  };

  const handleGenerateMultiple = () => {
    const newUuids = Array.from({ length: count }, () => generateUUID());
    setUuidList(newUuids);
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSuccess('已复制到剪贴板！');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(uuidList.join('\n'));
    setSuccess(`已复制全部 ${uuidList.length} 个 UUID！`);
    setTimeout(() => setSuccess(''), 2000);
  };

  React.useEffect(() => {
    handleGenerate();
  }, []);

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          UUID 生成器
        </Typography>
        <Typography color="text.secondary" paragraph>
          生成全局唯一标识符 (UUID v4)
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* 单个 UUID */}
      <Paper sx={{ p: 4, mb: 3, textAlign: 'center' }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          UUID v4
        </Typography>
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'monospace',
            mb: 3,
            p: 2,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            borderRadius: 1,
            wordBreak: 'break-all',
          }}
        >
          {uuid}
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="contained" startIcon={<Refresh />} onClick={handleGenerate}>
            重新生成
          </Button>
          <Button variant="outlined" startIcon={<ContentCopy />} onClick={() => handleCopy(uuid)}>
            复制
          </Button>
        </Stack>
      </Paper>

      {/* 批量生成 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          批量生成
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
          <TextField
            label="数量"
            type="number"
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
            inputProps={{ min: 1, max: 100 }}
            sx={{ width: 120 }}
            size="small"
          />
          <Button variant="contained" startIcon={<Add />} onClick={handleGenerateMultiple}>
            生成
          </Button>
          {uuidList.length > 0 && (
            <Button variant="outlined" startIcon={<ContentCopy />} onClick={handleCopyAll}>
              复制全部
            </Button>
          )}
        </Stack>

        {uuidList.length > 0 ? (
          <Box
            sx={{
              maxHeight: 400,
              overflowY: 'auto',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: 1,
              p: 2,
            }}
          >
            {uuidList.map((id, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1.5,
                  mb: 1,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  },
                }}
              >
                <Typography sx={{ fontFamily: 'monospace', fontSize: '0.875rem', flex: 1 }}>
                  {id}
                </Typography>
                <Button size="small" startIcon={<ContentCopy />} onClick={() => handleCopy(id)}>
                  复制
                </Button>
              </Box>
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              bgcolor: 'background.default',
              borderRadius: 1,
            }}
          >
            <Typography color="text.secondary">
              设置数量后点击"生成"按钮
            </Typography>
          </Box>
        )}
      </Paper>

      {/* 说明 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          关于 UUID
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • <strong>UUID (Universally Unique Identifier)</strong> 是全局唯一标识符
          <br />
          • UUID v4 基于随机数生成，重复概率极低
          <br />
          • 格式：xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx（36 个字符，含连字符）
          <br />
          • 常用于数据库主键、分布式系统中的唯一标识
          <br />• 不依赖中央授权，可独立生成
        </Typography>
      </Paper>
    </Container>
  );
};

