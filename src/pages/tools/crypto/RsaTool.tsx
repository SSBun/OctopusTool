import React, { useState } from 'react';
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
  Tabs,
  Tab,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import {
  Lock,
  LockOpen,
  ContentCopy,
  Clear,
  VpnKey,
  Refresh,
} from '@mui/icons-material';
import forge from 'node-forge';

type KeySize = 1024 | 2048 | 4096;
type PaddingScheme = 'PKCS1' | 'OAEP';
type Encoding = 'UTF-8' | 'Base64' | 'Hex';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const RsaTool: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  
  // 加密/解密输入输出
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  
  // 配置选项
  const [encoding, setEncoding] = useState<Encoding>('UTF-8');
  const [paddingScheme, setPaddingScheme] = useState<PaddingScheme>('PKCS1');
  const [keySize, setKeySize] = useState<KeySize>(2048);
  
  // 状态
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // 生成密钥对
  const handleGenerateKeyPair = async () => {
    setError('');
    setSuccess('');
    setIsGenerating(true);

    try {
      // 使用 Web Worker 在后台生成密钥对（模拟异步）
      await new Promise((resolve) => setTimeout(resolve, 100));

      const keypair = forge.pki.rsa.generateKeyPair({ bits: keySize, workers: -1 });
      
      const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
      const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);

      setPublicKey(publicKeyPem);
      setPrivateKey(privateKeyPem);
      setSuccess(`成功生成 ${keySize} 位 RSA 密钥对！`);
    } catch (e) {
      setError(e instanceof Error ? e.message : '密钥生成失败');
    } finally {
      setIsGenerating(false);
    }
  };

  // 公钥加密
  const handleEncrypt = () => {
    setError('');
    setSuccess('');

    try {
      if (!input) {
        throw new Error('请输入要加密的内容');
      }
      if (!publicKey) {
        throw new Error('请输入公钥或生成密钥对');
      }

      // 解析公钥
      const pubKey = forge.pki.publicKeyFromPem(publicKey);

      // 检查数据长度限制
      const maxBytes = paddingScheme === 'PKCS1' 
        ? Math.floor(keySize / 8) - 11  // PKCS#1 开销为 11 字节
        : Math.floor(keySize / 8) - 42; // OAEP with SHA-256 开销约 42 字节
      
      const inputBytes = forge.util.encodeUtf8(input);
      if (inputBytes.length > maxBytes) {
        throw new Error(
          `输入数据过长！当前: ${inputBytes.length} 字节，最大: ${maxBytes} 字节 (${keySize} 位密钥 + ${paddingScheme})`
        );
      }

      // 根据填充方案加密
      let encrypted: string;
      if (paddingScheme === 'PKCS1') {
        // PKCS#1 v1.5 填充
        encrypted = pubKey.encrypt(inputBytes, 'RSAES-PKCS1-V1_5');
      } else {
        // OAEP 填充（更安全）
        encrypted = pubKey.encrypt(inputBytes, 'RSA-OAEP', {
          md: forge.md.sha256.create(),
          mgf1: {
            md: forge.md.sha256.create()
          }
        });
      }

      // 转换为 Base64
      const encryptedBase64 = forge.util.encode64(encrypted);
      setOutput(encryptedBase64);
      setSuccess('加密成功！');
    } catch (e) {
      setError(e instanceof Error ? e.message : '加密失败，请检查公钥格式和输入内容');
      setOutput('');
    }
  };

  // 私钥解密
  const handleDecrypt = () => {
    setError('');
    setSuccess('');

    try {
      if (!input) {
        throw new Error('请输入要解密的内容');
      }
      if (!privateKey) {
        throw new Error('请输入私钥或生成密钥对');
      }

      // 解析私钥
      const privKey = forge.pki.privateKeyFromPem(privateKey);

      // 从 Base64 解码
      let encryptedBytes: string;
      try {
        encryptedBytes = forge.util.decode64(input.trim());
      } catch (e) {
        throw new Error('密文格式错误，请确保输入的是有效的 Base64 编码');
      }

      // 根据填充方案解密
      let decryptedBytes: string;
      if (paddingScheme === 'PKCS1') {
        // PKCS#1 v1.5 填充
        decryptedBytes = privKey.decrypt(encryptedBytes, 'RSAES-PKCS1-V1_5');
      } else {
        // OAEP 填充（更安全）
        decryptedBytes = privKey.decrypt(encryptedBytes, 'RSA-OAEP', {
          md: forge.md.sha256.create(),
          mgf1: {
            md: forge.md.sha256.create()
          }
        });
      }

      // 将字节转换回 UTF-8 字符串
      const decrypted = forge.util.decodeUtf8(decryptedBytes);
      
      if (!decrypted) {
        throw new Error('解密失败，请检查私钥、填充方案和密文是否正确匹配');
      }

      setOutput(decrypted);
      setSuccess('解密成功！');
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : '解密失败';
      if (errorMsg.includes('Invalid') || errorMsg.includes('invalid')) {
        setError('解密失败：密钥、填充方案或密文不匹配。请确保使用相同的密钥对和填充方案。');
      } else {
        setError(errorMsg);
      }
      setOutput('');
    }
  };

  const handleCopy = async (text: string) => {
    if (text) {
      await navigator.clipboard.writeText(text);
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

  const handleClearKeys = () => {
    setPublicKey('');
    setPrivateKey('');
    setError('');
    setSuccess('');
  };

  const handleExample = async () => {
    setError('');
    setSuccess('');
    setIsGenerating(true);

    try {
      // 生成真实的示例密钥对
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048, workers: -1 });
      
      const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
      const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);

      setPublicKey(publicKeyPem);
      setPrivateKey(privateKeyPem);
      setInput('Hello, World! 这是一个RSA加密测试。');
      setPaddingScheme('PKCS1');
      setKeySize(2048);
      setSuccess('已加载示例密钥对和测试文本，可以点击"公钥加密"进行测试');
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载示例失败');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSwap = () => {
    const temp = input;
    setInput(output);
    setOutput(temp);
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader
        title="RSA 加密/解密工具"
        description="专业的 RSA 非对称加密工具，支持密钥生成、公钥加密、私钥解密"
        toolPath="/tools/crypto/rsa"
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="加密/解密" icon={<Lock />} iconPosition="start" />
          <Tab label="密钥管理" icon={<VpnKey />} iconPosition="start" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {/* 配置面板 */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
            加密配置
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="字符编码"
                value={encoding}
                onChange={(e) => setEncoding(e.target.value as Encoding)}
                size="small"
              >
                <MenuItem value="UTF-8">UTF-8</MenuItem>
                <MenuItem value="Base64">Base64</MenuItem>
                <MenuItem value="Hex">Hex</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                填充方案
              </Typography>
              <RadioGroup
                row
                value={paddingScheme}
                onChange={(e) => setPaddingScheme(e.target.value as PaddingScheme)}
              >
                <FormControlLabel value="PKCS1" control={<Radio size="small" />} label="PKCS#1" />
                <FormControlLabel value="OAEP" control={<Radio size="small" />} label="OAEP" />
              </RadioGroup>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Alert severity="info" sx={{ py: 0.5 }}>
                RSA 加密数据大小受密钥长度限制
              </Alert>
            </Grid>
          </Grid>
        </Paper>

        {/* 操作按钮 */}
        <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Lock />}
            onClick={handleEncrypt}
            disabled={!input || !publicKey}
          >
            公钥加密
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<LockOpen />}
            onClick={handleDecrypt}
            disabled={!input || !privateKey}
          >
            私钥解密
          </Button>
          <Button
            variant="outlined"
            startIcon={<ContentCopy />}
            onClick={() => handleCopy(output)}
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
          <Button 
            variant="text" 
            onClick={handleExample}
            disabled={isGenerating}
          >
            {isGenerating ? '生成密钥中...' : '加载示例'}
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

        {/* 密钥输入区域 */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  公钥 (Public Key)
                </Typography>
                <Button
                  size="small"
                  startIcon={<ContentCopy />}
                  onClick={() => handleCopy(publicKey)}
                  disabled={!publicKey}
                >
                  复制
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <TextField
                fullWidth
                multiline
                rows={8}
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="-----BEGIN PUBLIC KEY-----&#10;请输入 PEM 格式的公钥或生成密钥对&#10;-----END PUBLIC KEY-----"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                  },
                }}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  私钥 (Private Key)
                </Typography>
                <Button
                  size="small"
                  startIcon={<ContentCopy />}
                  onClick={() => handleCopy(privateKey)}
                  disabled={!privateKey}
                >
                  复制
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <TextField
                fullWidth
                multiline
                rows={8}
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;请输入 PEM 格式的私钥或生成密钥对&#10;-----END RSA PRIVATE KEY-----"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                  },
                }}
              />
            </Paper>
          </Grid>
        </Grid>

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
              rows={12}
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
              rows={12}
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
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* 密钥生成面板 */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
            生成 RSA 密钥对
          </Typography>

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="密钥长度"
                value={keySize}
                onChange={(e) => setKeySize(Number(e.target.value) as KeySize)}
                size="small"
              >
                <MenuItem value={1024}>1024 bits（不推荐）</MenuItem>
                <MenuItem value={2048}>2048 bits（推荐）</MenuItem>
                <MenuItem value={4096}>4096 bits（高安全）</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                fullWidth
                startIcon={isGenerating ? <Refresh className="rotating" /> : <VpnKey />}
                onClick={handleGenerateKeyPair}
                disabled={isGenerating}
                size="large"
              >
                {isGenerating ? '生成中...' : '生成密钥对'}
              </Button>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Clear />}
                onClick={handleClearKeys}
                size="large"
              >
                清空密钥
              </Button>
            </Grid>
          </Grid>

          {keySize === 1024 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              ⚠️ 1024 位密钥安全性较低，不推荐用于生产环境。建议使用 2048 或 4096 位密钥。
            </Alert>
          )}

          {keySize === 4096 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              ℹ️ 4096 位密钥提供最高安全性，但生成速度较慢，加密解密也会更慢。
            </Alert>
          )}
        </Paper>

        {/* 成功/错误提示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* 生成的密钥显示 */}
        {(publicKey || privateKey) && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    公钥 (Public Key)
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<ContentCopy />}
                    onClick={() => handleCopy(publicKey)}
                    disabled={!publicKey}
                  >
                    复制
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <TextField
                  fullWidth
                  multiline
                  rows={18}
                  value={publicKey}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    },
                  }}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    私钥 (Private Key)
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<ContentCopy />}
                    onClick={() => handleCopy(privateKey)}
                    disabled={!privateKey}
                  >
                    复制
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <TextField
                  fullWidth
                  multiline
                  rows={18}
                  value={privateKey}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    },
                  }}
                />
                <Alert severity="warning" sx={{ mt: 2 }}>
                  ⚠️ 私钥非常重要，请妥善保管，不要泄露给他人！
                </Alert>
              </Paper>
            </Grid>
          </Grid>
        )}
      </TabPanel>

      {/* 使用说明 */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          使用说明
        </Typography>
        <Typography variant="body2" color="text.secondary" component="div">
          <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
            <li>
              <strong>RSA 非对称加密：</strong>使用公钥加密，私钥解密。公钥可以公开，私钥必须保密
            </li>
            <li>
              <strong>密钥生成：</strong>在"密钥管理"标签页中生成新的密钥对，推荐使用 2048 位或更高
            </li>
            <li>
              <strong>加密流程：</strong>
              <ol style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                <li>在"密钥管理"中生成密钥对，或输入已有的公钥</li>
                <li>在"加密/解密"标签页的输入框中输入要加密的内容</li>
                <li>点击"公钥加密"按钮</li>
                <li>加密结果以 Base64 格式显示在输出框中</li>
              </ol>
            </li>
            <li>
              <strong>解密流程：</strong>
              <ol style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                <li>确保有对应的私钥</li>
                <li>在输入框中输入 Base64 格式的密文</li>
                <li>点击"私钥解密"按钮</li>
                <li>原始内容将显示在输出框中</li>
              </ol>
            </li>
            <li>
              <strong>填充方案：</strong>
              <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                <li>PKCS#1：经典填充方案，兼容性好</li>
                <li>OAEP：更安全的填充方案（推荐）</li>
              </ul>
            </li>
            <li>
              <strong>数据大小限制：</strong>
              <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                <li>1024 位密钥：最大加密 117 字节（PKCS#1）或 86 字节（OAEP）</li>
                <li>2048 位密钥：最大加密 245 字节（PKCS#1）或 214 字节（OAEP）</li>
                <li>4096 位密钥：最大加密 501 字节（PKCS#1）或 470 字节（OAEP）</li>
              </ul>
            </li>
            <li>
              <strong>安全建议：</strong>
              <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                <li>私钥必须妥善保管，不要通过网络传输或存储在不安全的地方</li>
                <li>对于大量数据，建议使用 RSA 加密对称密钥，然后用对称加密（如 AES）加密数据</li>
                <li>定期更换密钥对，特别是在私钥可能泄露的情况下</li>
              </ul>
            </li>
          </ul>
        </Typography>
      </Paper>

      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .rotating {
          animation: rotate 1s linear infinite;
        }
      `}</style>
    </Container>
  );
};

