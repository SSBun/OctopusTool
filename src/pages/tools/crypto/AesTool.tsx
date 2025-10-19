import React, { useState, useEffect } from 'react';
import {
Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Alert,
  MenuItem,
  Grid,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { Lock, LockOpen, ContentCopy, Clear, Info } from '@mui/icons-material';
import CryptoJS from 'crypto-js';

type CipherMode = 'CBC' | 'ECB' | 'CFB' | 'OFB' | 'CTR';
type PaddingMode = 'Pkcs7' | 'NoPadding' | 'ZeroPadding' | 'Iso10126' | 'Iso97971' | 'AnsiX923';
type KeySize = 128 | 192 | 256;
type Encoding = 'UTF-8' | 'Latin1' | 'Hex' | 'Base64';

export const AesTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [key, setKey] = useState('');
  const [iv, setIv] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 配置选项
  const [encoding, setEncoding] = useState<Encoding>('UTF-8');
  const [mode, setMode] = useState<CipherMode>('CBC');
  const [padding, setPadding] = useState<PaddingMode>('Pkcs7');
  const [keySize, setKeySize] = useState<KeySize>(128);

  // 当模式改变时，更新 IV 的必要性提示
  useEffect(() => {
    if (mode === 'ECB') {
      setIv(''); // ECB 模式不需要 IV
    }
  }, [mode]);

  // 获取 CryptoJS 模式
  const getCipherMode = (modeStr: CipherMode) => {
    const modes: Record<CipherMode, any> = {
      CBC: CryptoJS.mode.CBC,
      ECB: CryptoJS.mode.ECB,
      CFB: CryptoJS.mode.CFB,
      OFB: CryptoJS.mode.OFB,
      CTR: CryptoJS.mode.CTR,
    };
    return modes[modeStr];
  };

  // 获取 CryptoJS 填充方式
  const getPaddingMode = (paddingStr: PaddingMode) => {
    const paddings: Record<PaddingMode, any> = {
      Pkcs7: CryptoJS.pad.Pkcs7,
      NoPadding: CryptoJS.pad.NoPadding,
      ZeroPadding: CryptoJS.pad.ZeroPadding,
      Iso10126: CryptoJS.pad.Iso10126,
      Iso97971: CryptoJS.pad.Iso97971,
      AnsiX923: CryptoJS.pad.AnsiX923,
    };
    return paddings[paddingStr];
  };

  // 处理密钥，确保长度符合要求
  const processKey = (keyStr: string): CryptoJS.lib.WordArray => {
    const keyBytes = keySize / 8;
    let processedKey = CryptoJS.enc.Utf8.parse(keyStr);
    
    // 如果密钥长度不够，用零填充
    if (processedKey.sigBytes < keyBytes) {
      const padding = CryptoJS.lib.WordArray.create(new Array(keyBytes - processedKey.sigBytes));
      processedKey = processedKey.concat(padding);
    } else if (processedKey.sigBytes > keyBytes) {
      // 如果密钥过长，截断
      processedKey = CryptoJS.lib.WordArray.create(processedKey.words.slice(0, keyBytes / 4));
    }
    
    return processedKey;
  };

  // 处理 IV
  const processIV = (ivStr: string): CryptoJS.lib.WordArray | undefined => {
    if (mode === 'ECB' || !ivStr) {
      return undefined;
    }
    
    let processedIV = CryptoJS.enc.Utf8.parse(ivStr);
    
    // AES 的 IV 固定为 16 字节（128位）
    if (processedIV.sigBytes < 16) {
      const padding = CryptoJS.lib.WordArray.create(new Array(16 - processedIV.sigBytes));
      processedIV = processedIV.concat(padding);
    } else if (processedIV.sigBytes > 16) {
      processedIV = CryptoJS.lib.WordArray.create(processedIV.words.slice(0, 4));
    }
    
    return processedIV;
  };

  // 加密
  const handleEncrypt = () => {
    setError('');
    setSuccess('');
    
    try {
      if (!input) {
        throw new Error('请输入要加密的内容');
      }
      if (!key) {
        throw new Error('请输入密钥');
      }
      if (mode !== 'ECB' && !iv) {
        throw new Error(`${mode} 模式需要初始化向量（IV）`);
      }

      const processedKey = processKey(key);
      const processedIV = processIV(iv);

      const encrypted = CryptoJS.AES.encrypt(input, processedKey, {
        mode: getCipherMode(mode),
        padding: getPaddingMode(padding),
        iv: processedIV,
      });

      setOutput(encrypted.toString());
      setSuccess('加密成功！');
    } catch (e) {
      setError(e instanceof Error ? e.message : '加密失败');
      setOutput('');
    }
  };

  // 解密
  const handleDecrypt = () => {
    setError('');
    setSuccess('');
    
    try {
      if (!input) {
        throw new Error('请输入要解密的内容');
      }
      if (!key) {
        throw new Error('请输入密钥');
      }
      if (mode !== 'ECB' && !iv) {
        throw new Error(`${mode} 模式需要初始化向量（IV）`);
      }

      const processedKey = processKey(key);
      const processedIV = processIV(iv);

      const decrypted = CryptoJS.AES.decrypt(input, processedKey, {
        mode: getCipherMode(mode),
        padding: getPaddingMode(padding),
        iv: processedIV,
      });

      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedText) {
        throw new Error('解密失败，请检查密钥、IV 和加密文本是否正确');
      }

      setOutput(decryptedText);
      setSuccess('解密成功！');
    } catch (e) {
      setError(e instanceof Error ? e.message : '解密失败');
      setOutput('');
    }
  };

  const handleCopy = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      setSuccess('已复制到剪贴板！');
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
    setSuccess('');
  };

  const handleExample = () => {
    setInput('Hello, World! 你好世界！');
    setKey('mySecretKey123456');
    setIv('myInitVector1234');
    setMode('CBC');
    setPadding('Pkcs7');
    setKeySize(128);
  };

  const handleSwap = () => {
    const temp = input;
    setInput(output);
    setOutput(temp);
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader
        title="AES 加密/解密工具"
        description="专业的 AES（高级加密标准）加密解密工具，支持多种模式和填充方式"
        toolPath="/tools/crypto/aes"
      />

      {/* 配置面板 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
          加密配置
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="字符编码"
              value={encoding}
              onChange={(e) => setEncoding(e.target.value as Encoding)}
              size="small"
            >
              <MenuItem value="UTF-8">UTF-8</MenuItem>
              <MenuItem value="Latin1">Latin1</MenuItem>
              <MenuItem value="Hex">Hex</MenuItem>
              <MenuItem value="Base64">Base64</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="加密模式"
              value={mode}
              onChange={(e) => setMode(e.target.value as CipherMode)}
              size="small"
            >
              <MenuItem value="CBC">CBC</MenuItem>
              <MenuItem value="ECB">ECB</MenuItem>
              <MenuItem value="CFB">CFB</MenuItem>
              <MenuItem value="OFB">OFB</MenuItem>
              <MenuItem value="CTR">CTR</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="填充方式"
              value={padding}
              onChange={(e) => setPadding(e.target.value as PaddingMode)}
              size="small"
            >
              <MenuItem value="Pkcs7">PKCS7</MenuItem>
              <MenuItem value="NoPadding">NoPadding</MenuItem>
              <MenuItem value="ZeroPadding">ZeroPadding</MenuItem>
              <MenuItem value="Iso10126">Iso10126</MenuItem>
              <MenuItem value="Iso97971">Iso97971</MenuItem>
              <MenuItem value="AnsiX923">AnsiX923</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="密钥长度"
              value={keySize}
              onChange={(e) => setKeySize(Number(e.target.value) as KeySize)}
              size="small"
            >
              <MenuItem value={128}>128 bits</MenuItem>
              <MenuItem value={192}>192 bits</MenuItem>
              <MenuItem value={256}>256 bits</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="密钥 (KEY)"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={`请输入密钥（${keySize} bits = ${keySize / 8} 字节）`}
              size="small"
              helperText={`当前密钥长度: ${key.length} 字节，需要: ${keySize / 8} 字节`}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="初始化向量 (IV)"
              value={iv}
              onChange={(e) => setIv(e.target.value)}
              placeholder={mode === 'ECB' ? 'ECB 模式不需要 IV' : '请输入 IV（16 字节）'}
              disabled={mode === 'ECB'}
              size="small"
              helperText={
                mode === 'ECB'
                  ? 'ECB 模式不使用 IV'
                  : `当前 IV 长度: ${iv.length} 字节，需要: 16 字节`
              }
            />
          </Grid>
        </Grid>

        {mode === 'ECB' && (
          <Alert severity="warning" sx={{ mt: 2 }} icon={<Info />}>
            ⚠️ ECB 模式不够安全，不推荐用于生产环境。建议使用 CBC 或 CTR 模式。
          </Alert>
        )}
      </Paper>

      {/* 操作按钮 */}
      <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Lock />}
          onClick={handleEncrypt}
          disabled={!input || !key || (mode !== 'ECB' && !iv)}
        >
          加密
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<LockOpen />}
          onClick={handleDecrypt}
          disabled={!input || !key || (mode !== 'ECB' && !iv)}
        >
          解密
        </Button>
        <Button
          variant="outlined"
          startIcon={<ContentCopy />}
          onClick={handleCopy}
          disabled={!output}
        >
          复制结果
        </Button>
        <Button variant="outlined" startIcon={<Clear />} onClick={handleClear}>
          清空
        </Button>
        <Button variant="outlined" onClick={handleSwap} disabled={!input && !output}>
          交换输入输出
        </Button>
        <Button variant="text" onClick={handleExample}>
          加载示例
        </Button>
      </Stack>

      {/* 错误提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* 成功提示 */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* 输入输出区域 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              输入内容
            </Typography>
            <Chip label={`${input.length} 字符`} size="small" />
          </Box>
          <Divider sx={{ mb: 2 }} />
          <TextField
            fullWidth
            multiline
            rows={18}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请输入要加密或解密的内容..."
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              },
            }}
          />
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              输出结果
            </Typography>
            <Chip label={`${output.length} 字符`} size="small" color="primary" />
          </Box>
          <Divider sx={{ mb: 2 }} />
          <TextField
            fullWidth
            multiline
            rows={18}
            value={output}
            InputProps={{
              readOnly: true,
            }}
            placeholder="加密或解密的结果将显示在这里..."
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              },
            }}
          />
        </Paper>
      </Box>

      {/* 使用说明 */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          使用说明
        </Typography>
        <Typography variant="body2" color="text.secondary" component="div">
          <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
            <li>
              <strong>加密模式：</strong>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>CBC（Cipher Block Chaining）：最常用，需要 IV，每个块依赖前一个块</li>
                <li>ECB（Electronic Codebook）：最简单但不安全，不需要 IV，不推荐使用</li>
                <li>CFB（Cipher Feedback）：流密码模式，需要 IV</li>
                <li>OFB（Output Feedback）：流密码模式，需要 IV</li>
                <li>CTR（Counter）：计数器模式，需要 IV，可并行处理</li>
              </ul>
            </li>
            <li>
              <strong>密钥长度：</strong>AES 支持 128、192、256 位密钥，长度越长越安全但速度越慢
            </li>
            <li>
              <strong>初始化向量（IV）：</strong>除 ECB 外其他模式都需要 IV，长度固定为 16 字节（128 位）
            </li>
            <li>
              <strong>填充方式：</strong>当数据长度不是块大小的整数倍时，使用填充方式补齐
            </li>
            <li>
              <strong>注意：</strong>加密和解密必须使用相同的密钥、IV、模式和填充方式
            </li>
          </ul>
        </Typography>
      </Paper>
    </Container>
  );
};

