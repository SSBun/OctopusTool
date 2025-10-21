import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Stack,
  Divider,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  IconButton,
  FormControlLabel,
  Switch,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import {
  Send,
  Clear,
  ContentCopy,
  DeleteOutline,
  LinkOff,
  Link as LinkIcon,
} from '@mui/icons-material';
import mqtt from 'mqtt';

interface Message {
  id: string;
  topic: string;
  payload: string;
  timestamp: Date;
  type: 'received' | 'sent';
  qos?: number;
}

interface Subscription {
  topic: string;
  qos: 0 | 1 | 2;
}

interface PublicBroker {
  name: string;
  url: string;
  description: string;
}

const PUBLIC_BROKERS: PublicBroker[] = [
  {
    name: 'HiveMQ',
    url: 'ws://broker.hivemq.com:8000/mqtt',
    description: '稳定可靠，推荐使用',
  },
  {
    name: 'Eclipse',
    url: 'ws://mqtt.eclipseprojects.io:80/mqtt',
    description: 'Eclipse 基金会维护',
  },
  {
    name: 'Mosquitto',
    url: 'ws://test.mosquitto.org:8080/mqtt',
    description: '轻量级测试服务器',
  },
];

export const MqttTool: React.FC = () => {
  // 连接配置
  const [brokerUrl, setBrokerUrl] = useState('ws://broker.hivemq.com:8000/mqtt');
  const [clientId, setClientId] = useState(`mqtt_client_${Math.random().toString(16).slice(2, 10)}`);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [useAuth, setUseAuth] = useState(false);
  const [cleanSession, setCleanSession] = useState(true);
  const [keepalive, setKeepalive] = useState(60);

  // 订阅配置
  const [subscribeTopic, setSubscribeTopic] = useState('test/topic');
  const [subscribeQos, setSubscribeQos] = useState<0 | 1 | 2>(0);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  // 发布配置
  const [publishTopic, setPublishTopic] = useState('test/topic');
  const [publishMessage, setPublishMessage] = useState('');
  const [publishQos, setPublishQos] = useState<0 | 1 | 2>(0);
  const [publishRetain, setPublishRetain] = useState(false);

  // 消息列表
  const [messages, setMessages] = useState<Message[]>([]);

  // 连接状态
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('未连接');

  // UI状态 - Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  // MQTT客户端引用
  const clientRef = useRef<mqtt.MqttClient | null>(null);

  // 组件卸载时断开连接
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.end(true);
      }
    };
  }, []);

  const addMessage = (topic: string, payload: string, type: 'received' | 'sent', qos?: number) => {
    const newMessage: Message = {
      id: `${Date.now()}_${Math.random()}`,
      topic,
      payload,
      timestamp: new Date(),
      type,
      qos,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const showSuccess = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const showError = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleConnect = async () => {
    if (!brokerUrl.trim()) {
      showError('请输入 Broker URL');
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('正在连接...');

    try {
      const options: mqtt.IClientOptions = {
        clientId,
        clean: cleanSession,
        keepalive,
        reconnectPeriod: 0, // 禁用自动重连
      };

      if (useAuth && username) {
        options.username = username;
        options.password = password;
      }

      // 创建MQTT客户端
      const client = mqtt.connect(brokerUrl, options);

      client.on('connect', () => {
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionStatus('已连接');
        showSuccess('成功连接到 MQTT 服务器！');
      });

      client.on('reconnect', () => {
        setConnectionStatus('正在重连...');
      });

      client.on('close', () => {
        setIsConnected(false);
        setConnectionStatus('连接已关闭');
      });

      client.on('disconnect', () => {
        setIsConnected(false);
        setConnectionStatus('连接已断开');
      });

      client.on('offline', () => {
        setConnectionStatus('离线');
      });

      client.on('error', (err: Error) => {
        showError(`连接错误：${err.message}`);
        setIsConnected(false);
        setIsConnecting(false);
        setConnectionStatus('连接失败');
        if (clientRef.current) {
          clientRef.current.end(true);
          clientRef.current = null;
        }
      });

      client.on('message', (topic: string, payload: Buffer, packet: mqtt.IPublishPacket) => {
        const message = payload.toString();
        addMessage(topic, message, 'received', packet.qos);
      });

      clientRef.current = client;

    } catch (err) {
      showError(`连接失败：${err instanceof Error ? err.message : '未知错误'}`);
      setIsConnecting(false);
      setConnectionStatus('连接失败');
    }
  };

  const handleDisconnect = () => {
    if (clientRef.current) {
      try {
        clientRef.current.end(false, {}, () => {
          setIsConnected(false);
          setConnectionStatus('已断开');
          setSubscriptions([]);
          showSuccess('已断开连接');
        });
        clientRef.current = null;
      } catch (err) {
        showError(`断开失败：${err instanceof Error ? err.message : '未知错误'}`);
      }
    }
  };

  const handleSubscribe = () => {
    if (!subscribeTopic.trim()) {
      showError('请输入订阅主题');
      return;
    }

    if (!isConnected || !clientRef.current) {
      showError('请先连接到 MQTT 服务器');
      return;
    }

    // 检查是否已订阅
    if (subscriptions.some((sub) => sub.topic === subscribeTopic)) {
      showError('该主题已订阅');
      return;
    }

    clientRef.current.subscribe(subscribeTopic, { qos: subscribeQos }, (err, granted) => {
      if (err) {
        showError(`订阅失败：${err.message}`);
      } else if (granted && granted.length > 0) {
        const grantedQos = granted[0].qos;
        // QoS 128 表示订阅失败
        if (grantedQos === 128) {
          showError(`订阅失败：服务器拒绝了订阅请求`);
        } else if (grantedQos === 0 || grantedQos === 1 || grantedQos === 2) {
          setSubscriptions((prev) => [...prev, { topic: subscribeTopic, qos: grantedQos }]);
          showSuccess(`已订阅主题：${subscribeTopic} (QoS: ${grantedQos})`);
        }
      }
    });
  };

  const handleUnsubscribe = (topic: string) => {
    if (!isConnected || !clientRef.current) {
      showError('未连接到服务器');
      return;
    }

    clientRef.current.unsubscribe(topic, {}, (err) => {
      if (err) {
        showError(`取消订阅失败：${err.message}`);
      } else {
        setSubscriptions((prev) => prev.filter((sub) => sub.topic !== topic));
        showSuccess(`已取消订阅：${topic}`);
      }
    });
  };

  const handlePublish = () => {
    if (!publishTopic.trim()) {
      showError('请输入发布主题');
      return;
    }

    if (!publishMessage.trim()) {
      showError('请输入消息内容');
      return;
    }

    if (!isConnected || !clientRef.current) {
      showError('请先连接到 MQTT 服务器');
      return;
    }

    const options = {
      qos: publishQos,
      retain: publishRetain,
    };

    clientRef.current.publish(publishTopic, publishMessage, options, (err) => {
      if (err) {
        showError(`发布失败：${err.message}`);
      } else {
        addMessage(publishTopic, publishMessage, 'sent', publishQos);
        showSuccess('消息已发送');
        // 清空消息内容
        setPublishMessage('');
      }
    });
  };

  const handleClearMessages = () => {
    setMessages([]);
    showSuccess('消息已清空');
  };

  const handleCopyMessage = (payload: string) => {
    navigator.clipboard.writeText(payload);
    showSuccess('消息已复制');
  };

  const handleCopyAllMessages = () => {
    const text = messages
      .map((msg) => `[${formatTime(msg.timestamp)}] ${msg.type === 'sent' ? '发送' : '接收'} - ${msg.topic}\n${msg.payload}`)
      .join('\n\n---\n\n');
    navigator.clipboard.writeText(text);
    showSuccess('所有消息已复制');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour12: false });
  };

  const getStatusColor = () => {
    if (isConnected) return 'success';
    if (isConnecting) return 'warning';
    return 'default';
  };

  const handleSelectBroker = (broker: PublicBroker) => {
    setBrokerUrl(broker.url);
    showSuccess(`已选择 ${broker.name} 服务器`);
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader
        title="MQTT 客户端"
        description="连接 MQTT 服务器，订阅主题、发送消息，支持 WebSocket 连接（基于 mqtt.js）"
        toolPath="/tools/network/mqtt"
      />

      <Grid container spacing={3}>
        {/* 左侧：配置面板 */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                连接配置
              </Typography>
              <Chip label={connectionStatus} color={getStatusColor()} size="small" />
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2}>
              <Box>
                <TextField
                  label="Broker URL"
                  value={brokerUrl}
                  onChange={(e) => setBrokerUrl(e.target.value)}
                  placeholder="ws://broker.hivemq.com:8000/mqtt"
                  fullWidth
                  size="small"
                  disabled={isConnected || isConnecting}
                  helperText="支持 ws:// 或 wss:// 协议"
                />
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ width: '100%', mb: 0.5 }}>
                    快速选择：
                  </Typography>
                  {PUBLIC_BROKERS.map((broker) => (
                    <Chip
                      key={broker.name}
                      label={broker.name}
                      size="small"
                      onClick={() => handleSelectBroker(broker)}
                      disabled={isConnected || isConnecting}
                      color={brokerUrl === broker.url ? 'primary' : 'default'}
                      variant={brokerUrl === broker.url ? 'filled' : 'outlined'}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: (theme) => 
                            brokerUrl === broker.url 
                              ? theme.palette.primary.dark 
                              : theme.palette.action.hover,
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <TextField
                label="Client ID"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                fullWidth
                size="small"
                disabled={isConnected || isConnecting}
              />

              <TextField
                label="Keepalive (秒)"
                type="number"
                value={keepalive}
                onChange={(e) => setKeepalive(Number(e.target.value))}
                fullWidth
                size="small"
                disabled={isConnected || isConnecting}
                inputProps={{ min: 0, max: 65535 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={useAuth}
                    onChange={(e) => setUseAuth(e.target.checked)}
                    disabled={isConnected || isConnecting}
                  />
                }
                label="使用认证"
              />

              {useAuth && (
                <>
                  <TextField
                    label="用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    fullWidth
                    size="small"
                    disabled={isConnected || isConnecting}
                  />

                  <TextField
                    label="密码"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    size="small"
                    disabled={isConnected || isConnecting}
                  />
                </>
              )}

              <FormControlLabel
                control={
                  <Switch
                    checked={cleanSession}
                    onChange={(e) => setCleanSession(e.target.checked)}
                    disabled={isConnected || isConnecting}
                  />
                }
                label="Clean Session"
              />

              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<LinkIcon />}
                  onClick={handleConnect}
                  disabled={isConnected || isConnecting}
                  fullWidth
                >
                  {isConnecting ? '连接中...' : '连接'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LinkOff />}
                  onClick={handleDisconnect}
                  disabled={!isConnected}
                  fullWidth
                >
                  断开
                </Button>
              </Stack>
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom fontWeight={600}>
              订阅主题
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <TextField
                label="主题"
                value={subscribeTopic}
                onChange={(e) => setSubscribeTopic(e.target.value)}
                placeholder="例如：test/topic 或 sensor/+"
                fullWidth
                size="small"
                disabled={!isConnected}
                helperText="支持通配符：+ (单层) 和 # (多层)"
              />

              <TextField
                select
                label="QoS"
                value={subscribeQos}
                onChange={(e) => setSubscribeQos(Number(e.target.value) as 0 | 1 | 2)}
                fullWidth
                size="small"
                disabled={!isConnected}
              >
                <MenuItem value={0}>0 - 最多一次</MenuItem>
                <MenuItem value={1}>1 - 至少一次</MenuItem>
                <MenuItem value={2}>2 - 恰好一次</MenuItem>
              </TextField>

              <Button
                variant="contained"
                onClick={handleSubscribe}
                disabled={!isConnected}
                fullWidth
              >
                订阅
              </Button>

              {subscriptions.length > 0 && (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    已订阅的主题 ({subscriptions.length})：
                  </Typography>
                  <List dense sx={{ bgcolor: 'background.default', borderRadius: 1, maxHeight: 200, overflow: 'auto' }}>
                    {subscriptions.map((sub) => (
                      <ListItem
                        key={sub.topic}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleUnsubscribe(sub.topic)}
                          >
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={sub.topic}
                          secondary={`QoS: ${sub.qos}`}
                          primaryTypographyProps={{ fontSize: '0.875rem' }}
                          secondaryTypographyProps={{ fontSize: '0.75rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* 右侧：发布和消息 */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              发布消息
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2}>
              <TextField
                label="主题"
                value={publishTopic}
                onChange={(e) => setPublishTopic(e.target.value)}
                placeholder="例如：test/topic"
                fullWidth
                size="small"
                disabled={!isConnected}
              />

              <TextField
                label="消息内容"
                value={publishMessage}
                onChange={(e) => setPublishMessage(e.target.value)}
                placeholder="输入要发送的消息（支持 JSON、文本等）"
                multiline
                rows={4}
                fullWidth
                disabled={!isConnected}
                sx={{
                  // 主题适配的滚动条样式
                  '& textarea': {
                    '&::-webkit-scrollbar': { width: '8px' },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(0, 0, 0, 0.05)',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: (theme) => theme.palette.primary.main,
                      borderRadius: '4px',
                      '&:hover': {
                        backgroundColor: (theme) => theme.palette.primary.dark,
                      },
                    },
                  },
                }}
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    select
                    label="QoS"
                    value={publishQos}
                    onChange={(e) => setPublishQos(Number(e.target.value) as 0 | 1 | 2)}
                    fullWidth
                    size="small"
                    disabled={!isConnected}
                  >
                    <MenuItem value={0}>0 - 最多一次</MenuItem>
                    <MenuItem value={1}>1 - 至少一次</MenuItem>
                    <MenuItem value={2}>2 - 恰好一次</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={publishRetain}
                        onChange={(e) => setPublishRetain(e.target.checked)}
                        disabled={!isConnected}
                      />
                    }
                    label="保留消息 (Retain)"
                    sx={{ mt: 1 }}
                  />
                </Grid>
              </Grid>

              <Button
                variant="contained"
                startIcon={<Send />}
                onClick={handlePublish}
                disabled={!isConnected}
                fullWidth
              >
                发送消息
              </Button>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                消息记录 ({messages.length})
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  startIcon={<ContentCopy />}
                  onClick={handleCopyAllMessages}
                  disabled={messages.length === 0}
                >
                  全部复制
                </Button>
                <Button
                  size="small"
                  startIcon={<Clear />}
                  onClick={handleClearMessages}
                  disabled={messages.length === 0}
                >
                  清空
                </Button>
              </Stack>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Box
              sx={{
                height: 450,
                overflow: 'auto',
                bgcolor: 'background.default',
                borderRadius: 1,
                p: 2,
                // 主题适配的滚动条样式
                '&::-webkit-scrollbar': { width: '8px' },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: (theme) => theme.palette.primary.main,
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.primary.dark,
                  },
                },
              }}
            >
              {messages.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  暂无消息
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {messages.map((msg) => (
                    <Paper
                      key={msg.id}
                      sx={{
                        p: 1.5,
                        bgcolor: 'background.paper',
                        borderLeft: 3,
                        borderColor: msg.topic === 'system'
                          ? 'info.main'
                          : msg.type === 'sent' 
                            ? 'primary.main' 
                            : 'success.main',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: msg.topic === 'system' ? 'info.main' : msg.type === 'sent' ? 'primary.main' : 'success.main',
                              fontWeight: 600 
                            }}
                          >
                            {msg.topic === 'system' ? '系统' : msg.type === 'sent' ? '发送' : '接收'}
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {msg.topic}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(msg.timestamp)}
                          </Typography>
                          {msg.topic !== 'system' && (
                            <IconButton size="small" onClick={() => handleCopyMessage(msg.payload)} sx={{ p: 0.5 }}>
                              <ContentCopy fontSize="small" sx={{ fontSize: 16 }} />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                          fontSize: '0.8rem',
                          color: 'text.secondary',
                        }}
                      >
                        {msg.payload}
                      </Typography>
                  </Paper>
                ))}
                </Stack>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 使用说明 */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'info.lighter' }}>
        <Typography variant="h6" gutterBottom fontWeight={600} color="info.main">
          💡 使用说明
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" component="div" color="text.secondary">
          <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li>点击"快速选择"按钮选择公共测试服务器，或手动输入 MQTT Broker 地址</li>
            <li>配置连接参数（Client ID、Keepalive、认证信息等）</li>
            <li>点击"连接"按钮连接到 MQTT 服务器</li>
            <li>连接成功后，在"订阅主题"区域输入要监听的主题（支持通配符 + 和 #）</li>
            <li>在"发布消息"区域输入主题和消息内容，配置 QoS 和 Retain 选项，点击"发送"</li>
            <li>消息记录会实时显示接收和发送的消息，支持复制和清空</li>
          </ol>
          
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              公共测试服务器：
            </Typography>
            <Stack spacing={1}>
              {PUBLIC_BROKERS.map((broker) => (
                <Box key={broker.name}>
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                    • {broker.name}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', ml: 2, color: 'text.secondary' }}>
                    {broker.url}
                  </Typography>
                  <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary', fontSize: '0.7rem' }}>
                    {broker.description}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.lighter', borderRadius: 1, border: '1px solid', borderColor: 'warning.main' }}>
            <Typography variant="body2" fontWeight={600} gutterBottom color="warning.dark">
              ⚠️ 注意事项：
            </Typography>
            <Typography variant="body2" component="div" color="warning.dark" sx={{ fontSize: '0.75rem' }}>
              • 浏览器环境只能使用 WebSocket 协议（ws:// 或 wss://）<br />
              • 不支持原生 MQTT 协议（tcp://）<br />
              • 某些公共服务器可能不稳定，建议使用自己的 MQTT Broker<br />
              • Clean Session 设为 false 时，客户端重连后会恢复之前的订阅
            </Typography>
          </Box>
        </Typography>
      </Paper>

      {/* Toast 提示 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};
