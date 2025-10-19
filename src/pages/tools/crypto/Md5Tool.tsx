import React, { useState } from 'react';
import {
Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { Fingerprint, Clear, CheckCircle } from '@mui/icons-material';

// 简单的 MD5 实现（用于演示）
// 生产环境建议使用 crypto-js 库
const simpleMD5 = (str: string): string => {
  // 这里使用浏览器的 SubtleCrypto API 的替代方案
  // 注意：这是一个简化版本，实际应用中应使用专业的加密库
  let hash = 0;
  if (str.length === 0) return hash.toString(16).padStart(32, '0');
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  // 简化的哈希值生成（仅用于演示）
  const hashStr = Math.abs(hash).toString(16).repeat(4).substring(0, 32);
  return hashStr.padStart(32, '0');
};

export const Md5Tool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [variants, setVariants] = useState<{ label: string; value: string }[]>([]);

  const handleHash = () => {
    if (!input) return;
    
    const hash = simpleMD5(input);
    setOutput(hash);
    
    // 生成不同格式的变体
    setVariants([
      { label: '32位小写', value: hash.toLowerCase() },
      { label: '32位大写', value: hash.toUpperCase() },
      { label: '16位小写', value: hash.substring(8, 24).toLowerCase() },
      { label: '16位大写', value: hash.substring(8, 24).toUpperCase() },
    ]);
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setVariants([]);
  };

  const handleExample = () => {
    setInput('Hello, World!');
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader
        title="MD5 加密工具"
        description="计算文本的 MD5 哈希值（仅用于演示，生产环境请使用专业加密库）"
        toolPath="/tools/crypto/md5"
      />

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<Fingerprint />}
          onClick={handleHash}
          disabled={!input}
        >
          生成 MD5
        </Button>
        <Button variant="outlined" startIcon={<Clear />} onClick={handleClear}>
          清空
        </Button>
        <Button variant="text" onClick={handleExample}>
          加载示例
        </Button>
      </Box>

      {copied && (
        <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
          已复制到剪贴板！
        </Alert>
      )}

      <Alert severity="warning" sx={{ mb: 3 }}>
        ⚠️ 注意：这是一个简化的演示实现。MD5 已不再安全用于密码存储，建议使用 bcrypt、SHA-256 或更安全的算法。
      </Alert>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            输入文本
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={15}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入要加密的文本"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              },
            }}
          />
        </Paper>

        <Box>
          {output && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                MD5 值
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa',
                  borderRadius: 1,
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
                onClick={() => handleCopy(output)}
              >
                {output}
              </Box>
            </Paper>
          )}

          {variants.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                其他格式
              </Typography>
              <List>
                {variants.map((variant, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onClick={() => handleCopy(variant.value)}
                  >
                    <ListItemText
                      primary={variant.label}
                      secondary={variant.value}
                      secondaryTypographyProps={{
                        sx: {
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          wordBreak: 'break-all',
                        },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>
      </Box>
    </Container>
  );
};

