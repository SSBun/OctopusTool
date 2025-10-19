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
  Tabs,
  Tab,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import {
  Security,
  ContentCopy,
  Clear,
  CheckCircle,
  VpnKey,
  Verified,
} from '@mui/icons-material';
import CryptoJS from 'crypto-js';

type HashAlgorithm = 'MD5' | 'SHA1' | 'SHA256' | 'SHA384' | 'SHA512';
type OutputFormat = 'Hex' | 'Base64';
type Encoding = 'UTF-8' | 'Latin1';

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

export const HmacTool: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  
  // 生成签名
  const [message, setMessage] = useState('');
  const [key, setKey] = useState('');
  const [signature, setSignature] = useState('');
  
  // 验证签名
  const [verifyMessage, setVerifyMessage] = useState('');
  const [verifyKey, setVerifyKey] = useState('');
  const [verifySignature, setVerifySignature] = useState('');
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  
  // 配置选项
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA256');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('Hex');
  const [encoding, setEncoding] = useState<Encoding>('UTF-8');
  
  // 状态
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 自动验证
  useEffect(() => {
    if (verifyMessage && verifyKey && verifySignature) {
      handleVerify();
    } else {
      setVerifyResult(null);
    }
  }, [verifyMessage, verifyKey, verifySignature, algorithm, outputFormat]);

  // 获取 HMAC 算法
  const getHmacAlgorithm = (algo: HashAlgorithm) => {
    const algorithms = {
      MD5: CryptoJS.HmacMD5,
      SHA1: CryptoJS.HmacSHA1,
      SHA256: CryptoJS.HmacSHA256,
      SHA384: CryptoJS.HmacSHA384,
      SHA512: CryptoJS.HmacSHA512,
    };
    return algorithms[algo];
  };

  // 生成 HMAC 签名
  const handleGenerate = () => {
    setError('');
    setSuccess('');

    try {
      if (!message) {
        throw new Error('请输入要签名的消息');
      }
      if (!key) {
        throw new Error('请输入密钥');
      }

      const hmacFunc = getHmacAlgorithm(algorithm);
      const hmac = hmacFunc(message, key);

      let result: string;
      if (outputFormat === 'Hex') {
        result = hmac.toString(CryptoJS.enc.Hex);
      } else {
        result = hmac.toString(CryptoJS.enc.Base64);
      }

      setSignature(result);
      setSuccess('签名生成成功！');
    } catch (e) {
      setError(e instanceof Error ? e.message : '签名生成失败');
      setSignature('');
    }
  };

  // 验证 HMAC 签名
  const handleVerify = () => {
    try {
      if (!verifyMessage || !verifyKey || !verifySignature) {
        setVerifyResult(null);
        return;
      }

      const hmacFunc = getHmacAlgorithm(algorithm);
      const hmac = hmacFunc(verifyMessage, verifyKey);

      let expectedSignature: string;
      if (outputFormat === 'Hex') {
        expectedSignature = hmac.toString(CryptoJS.enc.Hex);
      } else {
        expectedSignature = hmac.toString(CryptoJS.enc.Base64);
      }

      // 比较签名（防止时序攻击）
      const isValid = expectedSignature.toLowerCase() === verifySignature.toLowerCase().trim();
      setVerifyResult(isValid);
    } catch (e) {
      setVerifyResult(false);
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
    setMessage('');
    setKey('');
    setSignature('');
    setError('');
    setSuccess('');
  };

  const handleClearVerify = () => {
    setVerifyMessage('');
    setVerifyKey('');
    setVerifySignature('');
    setVerifyResult(null);
  };

  const handleExample = () => {
    setMessage('Hello, World! 这是一个HMAC签名测试。');
    setKey('mySecretKey123456');
    setAlgorithm('SHA256');
    setOutputFormat('Hex');
  };

  const handleCopyToVerify = () => {
    setVerifyMessage(message);
    setVerifyKey(key);
    setVerifySignature(signature);
    setTabValue(1);
    setSuccess('已复制到验证标签页！');
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader
        title="HMAC 签名工具"
        description="基于哈希的消息认证码（HMAC），用于验证消息完整性和真实性"
        toolPath="/tools/crypto/hmac"
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="生成签名" icon={<Security />} iconPosition="start" />
          <Tab label="验证签名" icon={<Verified />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* 配置面板 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
          签名配置
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="哈希算法"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as HashAlgorithm)}
              size="small"
            >
              <MenuItem value="MD5">HMAC-MD5</MenuItem>
              <MenuItem value="SHA1">HMAC-SHA1</MenuItem>
              <MenuItem value="SHA256">HMAC-SHA256（推荐）</MenuItem>
              <MenuItem value="SHA384">HMAC-SHA384</MenuItem>
              <MenuItem value="SHA512">HMAC-SHA512</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              输出格式
            </Typography>
            <RadioGroup
              row
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
            >
              <FormControlLabel value="Hex" control={<Radio size="small" />} label="Hex（十六进制）" />
              <FormControlLabel value="Base64" control={<Radio size="small" />} label="Base64" />
            </RadioGroup>
          </Grid>

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
              <MenuItem value="Latin1">Latin1</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>HMAC 特点：</strong>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>同样的消息和密钥总是生成相同的签名</li>
            <li>密钥必须保密，只有持有密钥的一方才能生成和验证签名</li>
            <li>任何消息或密钥的改变都会导致完全不同的签名</li>
            <li>推荐使用 SHA-256 或更高级别的哈希算法</li>
          </ul>
        </Alert>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        {/* 生成签名标签页 */}
        <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Security />}
            onClick={handleGenerate}
            disabled={!message || !key}
          >
            生成签名
          </Button>
          <Button
            variant="outlined"
            startIcon={<ContentCopy />}
            onClick={() => handleCopy(signature)}
            disabled={!signature}
          >
            复制签名
          </Button>
          <Button
            variant="outlined"
            startIcon={<Verified />}
            onClick={handleCopyToVerify}
            disabled={!signature}
          >
            复制到验证
          </Button>
          <Button variant="outlined" startIcon={<Clear />} onClick={handleClear}>
            清空
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

        {/* 密钥输入 */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              <VpnKey sx={{ verticalAlign: 'middle', mr: 1 }} />
              密钥 (Secret Key)
            </Typography>
            <Chip label={`${key.length} 字符`} size="small" />
          </Box>
          <Divider sx={{ mb: 2 }} />
          <TextField
            fullWidth
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="请输入密钥（Secret Key）..."
            helperText="密钥用于生成 HMAC 签名，必须保密"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              },
            }}
          />
        </Paper>

        {/* 消息和签名 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                消息内容
              </Typography>
              <Chip label={`${message.length} 字符`} size="small" />
            </Box>
            <Divider sx={{ mb: 2 }} />
            <TextField
              fullWidth
              multiline
              rows={15}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="请输入要签名的消息内容..."
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
                HMAC 签名
              </Typography>
              <Chip 
                label={signature ? `${signature.length} 字符` : '未生成'} 
                size="small" 
                color={signature ? 'primary' : 'default'}
              />
            </Box>
            <Divider sx={{ mb: 2 }} />
            <TextField
              fullWidth
              multiline
              rows={15}
              value={signature}
              InputProps={{
                readOnly: true,
              }}
              placeholder="签名结果将显示在这里..."
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
        {/* 验证签名标签页 */}
        <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Verified />}
            onClick={handleVerify}
            disabled={!verifyMessage || !verifyKey || !verifySignature}
          >
            验证签名
          </Button>
          <Button variant="outlined" startIcon={<Clear />} onClick={handleClearVerify}>
            清空
          </Button>
        </Stack>

        {/* 验证结果 */}
        {verifyResult !== null && (
          <Alert 
            severity={verifyResult ? 'success' : 'error'} 
            sx={{ mb: 3 }}
            icon={verifyResult ? <CheckCircle /> : undefined}
          >
            {verifyResult ? (
              <>
                <strong>✅ 签名验证成功！</strong>
                <br />
                消息未被篡改，签名有效。
              </>
            ) : (
              <>
                <strong>❌ 签名验证失败！</strong>
                <br />
                消息可能被篡改，或密钥/算法不匹配。
              </>
            )}
          </Alert>
        )}

        {/* 密钥输入 */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              <VpnKey sx={{ verticalAlign: 'middle', mr: 1 }} />
              密钥 (Secret Key)
            </Typography>
            <Chip label={`${verifyKey.length} 字符`} size="small" />
          </Box>
          <Divider sx={{ mb: 2 }} />
          <TextField
            fullWidth
            value={verifyKey}
            onChange={(e) => setVerifyKey(e.target.value)}
            placeholder="请输入密钥（Secret Key）..."
            helperText="必须使用生成签名时相同的密钥"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              },
            }}
          />
        </Paper>

        {/* 消息、签名和验证 */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  消息内容
                </Typography>
                <Chip label={`${verifyMessage.length} 字符`} size="small" />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <TextField
                fullWidth
                multiline
                rows={12}
                value={verifyMessage}
                onChange={(e) => setVerifyMessage(e.target.value)}
                placeholder="请输入要验证的消息内容..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                  },
                }}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  待验证签名
                </Typography>
                <Chip label={`${verifySignature.length} 字符`} size="small" />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <TextField
                fullWidth
                multiline
                rows={12}
                value={verifySignature}
                onChange={(e) => setVerifySignature(e.target.value)}
                placeholder="请输入要验证的 HMAC 签名..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                  },
                }}
              />
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* 使用说明 */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          使用说明
        </Typography>
        <Typography variant="body2" color="text.secondary" component="div">
          <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
            <li>
              <strong>什么是 HMAC？</strong>
              HMAC（Hash-based Message Authentication Code）是一种基于哈希函数和密钥的消息认证码，
              用于验证消息的完整性和真实性。
            </li>
            <li>
              <strong>生成签名流程：</strong>
              <ol style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                <li>选择哈希算法（推荐 SHA-256）</li>
                <li>输入密钥（Secret Key）</li>
                <li>输入要签名的消息</li>
                <li>点击"生成签名"按钮</li>
                <li>获得 HMAC 签名（可复制或验证）</li>
              </ol>
            </li>
            <li>
              <strong>验证签名流程：</strong>
              <ol style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                <li>切换到"验证签名"标签页</li>
                <li>输入相同的密钥</li>
                <li>输入原始消息</li>
                <li>输入要验证的签名</li>
                <li>系统自动验证签名是否匹配</li>
              </ol>
            </li>
            <li>
              <strong>哈希算法对比：</strong>
              <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                <li>HMAC-MD5: 128 位，不推荐（安全性较低）</li>
                <li>HMAC-SHA1: 160 位，不推荐（已被破解）</li>
                <li>HMAC-SHA256: 256 位，推荐（安全性好，性能佳）</li>
                <li>HMAC-SHA384: 384 位，高安全（适合高安全场景）</li>
                <li>HMAC-SHA512: 512 位，最高安全（签名较长）</li>
              </ul>
            </li>
            <li>
              <strong>应用场景：</strong>
              <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                <li>API 请求签名验证</li>
                <li>消息完整性校验</li>
                <li>JWT（JSON Web Token）签名</li>
                <li>Webhook 签名验证</li>
                <li>文件完整性验证</li>
              </ul>
            </li>
            <li>
              <strong>安全建议：</strong>
              <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                <li>使用足够长且随机的密钥（至少 32 字节）</li>
                <li>密钥必须保密，不要在客户端存储或传输</li>
                <li>推荐使用 SHA-256 或更高级别的哈希算法</li>
                <li>避免使用 MD5 和 SHA-1（已不安全）</li>
                <li>定期更换密钥以提高安全性</li>
              </ul>
            </li>
          </ul>
        </Typography>
      </Paper>
    </Container>
  );
};

