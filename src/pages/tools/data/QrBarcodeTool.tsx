import React, { useState, useRef, useEffect } from 'react';
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
  Stack,
  Tabs,
  Tab,
  Slider,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import {
  QrCode2,
  QrCodeScanner,
  Download,
  ContentCopy,
  Clear,
  CameraAlt,
  Upload,
  ViewInAr,
} from '@mui/icons-material';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { Html5Qrcode } from 'html5-qrcode';

type QRErrorLevel = 'L' | 'M' | 'Q' | 'H';
type BarcodeFormat = 'CODE128' | 'EAN13' | 'EAN8' | 'UPC' | 'CODE39' | 'ITF14';

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

export const QrBarcodeTool: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  // 二维码生成
  const [qrText, setQrText] = useState('');
  const [qrSize, setQrSize] = useState(256);
  const [qrErrorLevel, setQrErrorLevel] = useState<QRErrorLevel>('M');
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#FFFFFF');
  const [qrDataUrl, setQrDataUrl] = useState('');

  // 二维码解析
  const [scanResult, setScanResult] = useState('');
  const [scanError, setScanError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCode = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 条形码生成
  const [barcodeText, setBarcodeText] = useState('');
  const [barcodeFormat, setBarcodeFormat] = useState<BarcodeFormat>('CODE128');
  const [barcodeWidth, setBarcodeWidth] = useState(2);
  const [barcodeHeight, setBarcodeHeight] = useState(100);
  const barcodeRef = useRef<SVGSVGElement>(null);

  // 状态
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // 生成二维码
  useEffect(() => {
    if (qrText) {
      generateQRCode();
    } else {
      setQrDataUrl('');
    }
  }, [qrText, qrSize, qrErrorLevel, qrColor, qrBgColor]);

  const generateQRCode = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(qrText, {
        errorCorrectionLevel: qrErrorLevel,
        width: qrSize,
        margin: 1,
        color: {
          dark: qrColor,
          light: qrBgColor,
        },
      });
      setQrDataUrl(dataUrl);
      setError('');
    } catch (err) {
      setError('二维码生成失败：' + (err instanceof Error ? err.message : '未知错误'));
      setQrDataUrl('');
    }
  };

  // 生成条形码
  useEffect(() => {
    if (barcodeText && barcodeRef.current) {
      generateBarcode();
    }
  }, [barcodeText, barcodeFormat, barcodeWidth, barcodeHeight]);

  const generateBarcode = () => {
    try {
      if (!barcodeRef.current) return;

      JsBarcode(barcodeRef.current, barcodeText, {
        format: barcodeFormat,
        width: barcodeWidth,
        height: barcodeHeight,
        displayValue: true,
        fontSize: 14,
        textMargin: 5,
      });
      setError('');
    } catch (err) {
      setError('条形码生成失败：' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  // 下载二维码
  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `qrcode-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccess('二维码已下载！');
    setTimeout(() => setSuccess(''), 2000);
  };

  // 复制二维码文本
  const handleCopyQRText = async () => {
    if (qrText) {
      await navigator.clipboard.writeText(qrText);
      setSuccess('已复制到剪贴板！');
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  // 上传图片解析二维码
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setScanError('');
    setScanResult('');

    try {
      // 创建临时的扫描器实例用于文件扫描
      // 使用唯一的 ID 避免与摄像头扫描冲突
      const scannerId = 'qr-reader-temp';
      
      // 创建临时容器
      const tempDiv = document.createElement('div');
      tempDiv.id = scannerId;
      tempDiv.style.display = 'none';
      document.body.appendChild(tempDiv);
      
      try {
        const scanner = new Html5Qrcode(scannerId);
        const result = await scanner.scanFile(file, true);
        setScanResult(result);
        setSuccess('二维码解析成功！');
        
        // 清理
        await scanner.clear();
      } finally {
        // 移除临时容器
        if (tempDiv.parentNode) {
          tempDiv.parentNode.removeChild(tempDiv);
        }
      }
      
      // 重置文件输入，允许重新上传同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setScanError('解析失败：' + (err instanceof Error ? err.message : '无法识别二维码'));
      
      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 启动摄像头扫描
  const startCameraScan = async () => {
    try {
      if (!html5QrCode.current) {
        html5QrCode.current = new Html5Qrcode('qr-reader');
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      };

      await html5QrCode.current.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          setScanResult(decodedText);
          setSuccess('扫描成功！');
          stopCameraScan();
        },
        () => {
          // 扫描中的错误可以忽略
        }
      );

      setIsScanning(true);
      setScanError('');
    } catch (err) {
      setScanError('无法启动摄像头：' + (err instanceof Error ? err.message : '请检查摄像头权限'));
      setIsScanning(false);
    }
  };

  // 停止摄像头扫描
  const stopCameraScan = async () => {
    try {
      if (html5QrCode.current) {
        await html5QrCode.current.stop();
        setIsScanning(false);
      }
    } catch (err) {
      console.error('停止扫描失败:', err);
    }
  };

  // 清理扫描器
  useEffect(() => {
    return () => {
      if (html5QrCode.current && isScanning) {
        html5QrCode.current.stop().catch(() => {
          // 忽略停止时的错误
        });
      }
    };
  }, [isScanning]);

  // 下载条形码
  const handleDownloadBarcode = () => {
    if (!barcodeRef.current) return;

    const svgData = new XMLSerializer().serializeToString(barcodeRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `barcode-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setSuccess('条形码已下载！');
    setTimeout(() => setSuccess(''), 2000);
  };

  // 示例数据
  const handleQRExample = () => {
    setQrText('https://github.com');
    setQrSize(256);
    setQrErrorLevel('M');
  };

  const handleBarcodeExample = () => {
    setBarcodeText('1234567890128');
    setBarcodeFormat('EAN13');
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader
        title="二维码/条形码工具"
        description="专业的二维码生成、解析和条形码生成工具"
        toolPath="/tools/data/qrbarcode"
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="二维码生成" icon={<QrCode2 />} iconPosition="start" />
          <Tab label="二维码解析" icon={<QrCodeScanner />} iconPosition="start" />
          <Tab label="条形码生成" icon={<ViewInAr />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* 成功/错误提示 */}
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

      {/* 二维码生成 */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* 配置面板 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                二维码配置
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Stack spacing={3}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="内容"
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  placeholder="输入要生成二维码的文本、URL 或其他内容..."
                  helperText={`${qrText.length} 字符`}
                />

                <Box>
                  <Typography gutterBottom>大小: {qrSize}px</Typography>
                  <Slider
                    value={qrSize}
                    onChange={(_, value) => setQrSize(value as number)}
                    min={128}
                    max={512}
                    step={64}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>

                <TextField
                  select
                  fullWidth
                  label="容错级别"
                  value={qrErrorLevel}
                  onChange={(e) => setQrErrorLevel(e.target.value as QRErrorLevel)}
                  size="small"
                >
                  <MenuItem value="L">L - 7% 容错</MenuItem>
                  <MenuItem value="M">M - 15% 容错（推荐）</MenuItem>
                  <MenuItem value="Q">Q - 25% 容错</MenuItem>
                  <MenuItem value="H">H - 30% 容错</MenuItem>
                </TextField>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="color"
                      label="前景色"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="color"
                      label="背景色"
                      value={qrBgColor}
                      onChange={(e) => setQrBgColor(e.target.value)}
                      size="small"
                    />
                  </Grid>
                </Grid>

                <Alert severity="info">
                  <strong>提示：</strong>
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    <li>容错级别越高，二维码越复杂，但损坏后仍可读取</li>
                    <li>深色前景 + 浅色背景效果最佳</li>
                    <li>二维码大小影响扫描距离</li>
                  </ul>
                </Alert>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={handleDownloadQR}
                    disabled={!qrDataUrl}
                    fullWidth
                  >
                    下载二维码
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ContentCopy />}
                    onClick={handleCopyQRText}
                    disabled={!qrText}
                    fullWidth
                  >
                    复制内容
                  </Button>
                </Stack>

                <Button variant="text" onClick={handleQRExample}>
                  加载示例
                </Button>
              </Stack>
            </Paper>
          </Grid>

          {/* 预览面板 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                二维码预览
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {qrDataUrl ? (
                <Box>
                  <Box
                    sx={{
                      display: 'inline-block',
                      p: 2,
                      bgcolor: 'background.default',
                      borderRadius: 2,
                      boxShadow: 1,
                    }}
                  >
                    <img
                      src={qrDataUrl}
                      alt="QR Code"
                      style={{ display: 'block', maxWidth: '100%' }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {qrSize} × {qrSize} 像素
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default',
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <QrCode2 sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary">
                      输入内容后将自动生成二维码
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* 二维码解析 */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                扫描二维码
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Stack spacing={3}>
                {/* 扫描区域 */}
                <Box
                  id="qr-reader"
                  sx={{
                    width: '100%',
                    minHeight: 300,
                    bgcolor: 'background.default',
                    borderRadius: 2,
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {!isScanning && !scanResult && (
                    <Box sx={{ textAlign: 'center' }}>
                      <QrCodeScanner sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                      <Typography color="text.secondary">
                        上传图片或使用摄像头扫描
                      </Typography>
                    </Box>
                  )}
                </Box>

                {scanError && (
                  <Alert severity="error" onClose={() => setScanError('')}>
                    {scanError}
                  </Alert>
                )}

                {/* 操作按钮 */}
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<Upload />}
                    onClick={() => fileInputRef.current?.click()}
                    fullWidth
                  >
                    上传图片
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  
                  {isScanning ? (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={stopCameraScan}
                      fullWidth
                    >
                      停止扫描
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<CameraAlt />}
                      onClick={startCameraScan}
                      fullWidth
                    >
                      摄像头扫描
                    </Button>
                  )}
                </Stack>

                <Alert severity="info">
                  <strong>使用说明：</strong>
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    <li>支持上传图片文件进行解析</li>
                    <li>支持使用设备摄像头实时扫描</li>
                    <li>确保二维码清晰可见，光线充足</li>
                  </ul>
                </Alert>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                扫描结果
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {scanResult ? (
                <Box>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    ✅ 扫描成功！
                  </Alert>
                  <TextField
                    fullWidth
                    multiline
                    rows={10}
                    value={scanResult}
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        backgroundColor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.02)',
                      },
                    }}
                  />
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ContentCopy />}
                      onClick={async () => {
                        await navigator.clipboard.writeText(scanResult);
                        setSuccess('已复制到剪贴板！');
                        setTimeout(() => setSuccess(''), 2000);
                      }}
                      fullWidth
                    >
                      复制结果
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Clear />}
                      onClick={() => setScanResult('')}
                      fullWidth
                    >
                      清空
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 300,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default',
                    borderRadius: 2,
                  }}
                >
                  <Typography color="text.secondary">
                    扫描结果将显示在这里
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* 条形码生成 */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                条形码配置
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="内容"
                  value={barcodeText}
                  onChange={(e) => setBarcodeText(e.target.value)}
                  placeholder="输入条形码内容（数字或文本）..."
                  helperText={`${barcodeText.length} 字符`}
                />

                <TextField
                  select
                  fullWidth
                  label="条形码格式"
                  value={barcodeFormat}
                  onChange={(e) => setBarcodeFormat(e.target.value as BarcodeFormat)}
                  size="small"
                >
                  <MenuItem value="CODE128">CODE 128（推荐，支持所有字符）</MenuItem>
                  <MenuItem value="EAN13">EAN-13（13位数字）</MenuItem>
                  <MenuItem value="EAN8">EAN-8（8位数字）</MenuItem>
                  <MenuItem value="UPC">UPC（12位数字）</MenuItem>
                  <MenuItem value="CODE39">CODE 39（字母+数字）</MenuItem>
                  <MenuItem value="ITF14">ITF-14（14位数字）</MenuItem>
                </TextField>

                <Box>
                  <Typography gutterBottom>条宽: {barcodeWidth}px</Typography>
                  <Slider
                    value={barcodeWidth}
                    onChange={(_, value) => setBarcodeWidth(value as number)}
                    min={1}
                    max={5}
                    step={0.5}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>

                <Box>
                  <Typography gutterBottom>高度: {barcodeHeight}px</Typography>
                  <Slider
                    value={barcodeHeight}
                    onChange={(_, value) => setBarcodeHeight(value as number)}
                    min={50}
                    max={200}
                    step={10}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>

                <Alert severity="warning">
                  <strong>格式要求：</strong>
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    <li>EAN-13: 必须是 13 位数字</li>
                    <li>EAN-8: 必须是 8 位数字</li>
                    <li>UPC: 必须是 12 位数字</li>
                    <li>CODE 128: 支持所有 ASCII 字符</li>
                  </ul>
                </Alert>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={handleDownloadBarcode}
                    disabled={!barcodeText}
                    fullWidth
                  >
                    下载条形码
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ContentCopy />}
                    onClick={async () => {
                      if (barcodeText) {
                        await navigator.clipboard.writeText(barcodeText);
                        setSuccess('已复制到剪贴板！');
                        setTimeout(() => setSuccess(''), 2000);
                      }
                    }}
                    disabled={!barcodeText}
                    fullWidth
                  >
                    复制内容
                  </Button>
                </Stack>

                <Button variant="text" onClick={handleBarcodeExample}>
                  加载示例
                </Button>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                条形码预览
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {barcodeText ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 300,
                    bgcolor: 'background.default',
                    borderRadius: 2,
                    p: 3,
                  }}
                >
                  <svg ref={barcodeRef}></svg>
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 300,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default',
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <ViewInAr sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary">
                      输入内容后将自动生成条形码
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* 使用说明 */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          使用说明
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              二维码生成
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 支持任意文本、URL、联系方式等<br />
              • 可自定义大小、颜色和容错级别<br />
              • 容错级别越高越能抵抗损坏<br />
              • 下载为 PNG 图片格式
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              二维码解析
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 上传二维码图片进行解析<br />
              • 使用摄像头实时扫描二维码<br />
              • 支持 PNG、JPG 等常见格式<br />
              • 确保二维码清晰完整
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              条形码生成
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 支持多种条形码格式<br />
              • 可调节条宽和高度<br />
              • 自动显示文本内容<br />
              • 下载为 SVG 矢量格式
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

