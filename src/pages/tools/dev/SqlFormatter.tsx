import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Divider,
  Menu,
  ListItemText,
  ListItemButton,
  Drawer,
  List,
  ListItem,
} from '@mui/material';
import {
  ContentCopy,
  Delete,
  Download,
  History,
  Code,
  Close,
  CheckCircle,
} from '@mui/icons-material';
import { format, SqlLanguage } from 'sql-formatter';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { nanoid } from 'nanoid';

interface FormatOptions {
  language: SqlLanguage;
  indent: string;
  keywordCase: 'upper' | 'lower' | 'preserve';
  linesBetweenQueries: number;
}

interface HistoryRecord {
  id: string;
  input: string;
  output: string;
  timestamp: number;
  options: FormatOptions;
}

// SQL 示例
const SQL_EXAMPLES = {
  'simple-select': {
    name: '简单查询',
    sql: `select u.id,u.name,u.email,u.created_at from users u where u.status='active' and u.role='admin' order by u.created_at desc limit 10`,
  },
  'complex-join': {
    name: '复杂 JOIN',
    sql: `select u.id,u.name,o.order_id,o.total,p.product_name from users u left join orders o on u.id=o.user_id left join order_items oi on o.order_id=oi.order_id left join products p on oi.product_id=p.id where u.status='active' and o.created_at>'2024-01-01' group by u.id,o.order_id having count(oi.id)>1 order by o.total desc`,
  },
  'subquery': {
    name: '子查询',
    sql: `select * from users where id in (select user_id from orders where total>1000) and status='active'`,
  },
  'create-table': {
    name: 'CREATE TABLE',
    sql: `create table users(id int primary key auto_increment,name varchar(100) not null,email varchar(255) unique,created_at timestamp default current_timestamp,updated_at timestamp default current_timestamp on update current_timestamp)`,
  },
  'insert': {
    name: 'INSERT 语句',
    sql: `insert into users(name,email,role,status) values('John Doe','john@example.com','admin','active'),('Jane Smith','jane@example.com','user','active')`,
  },
  'update': {
    name: 'UPDATE 语句',
    sql: `update users set status='inactive',updated_at=now() where last_login_at<date_sub(now(),interval 6 month) and status='active'`,
  },
};

// 历史记录工具函数
const loadHistory = (): HistoryRecord[] => {
  try {
    const stored = localStorage.getItem('sql-formatter-history');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveHistory = (history: HistoryRecord[]) => {
  try {
    localStorage.setItem('sql-formatter-history', JSON.stringify(history.slice(0, 50))); // 保留最近 50 条
  } catch (error) {
    console.error('Failed to save history:', error);
  }
};

const addHistoryRecord = (record: Omit<HistoryRecord, 'id' | 'timestamp'>) => {
  const history = loadHistory();
  const newRecord: HistoryRecord = {
    ...record,
    id: nanoid(),
    timestamp: Date.now(),
  };
  history.unshift(newRecord);
  saveHistory(history);
};

export const SqlFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [compressMode, setCompressMode] = useState(false);
  const [options, setOptions] = useState<FormatOptions>({
    language: 'mysql',
    indent: '  ', // 2 spaces
    keywordCase: 'upper',
    linesBetweenQueries: 1,
  });
  
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [exampleMenuAnchor, setExampleMenuAnchor] = useState<null | HTMLElement>(null);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>(loadHistory());

  // 自动格式化
  useEffect(() => {
    if (input.trim()) {
      handleFormat();
    } else {
      setOutput('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compressMode, options]);

  const handleFormat = () => {
    if (!input.trim()) {
      setSnackbarMessage('请输入 SQL 语句');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      let formatted: string;
      
      if (compressMode) {
        // 压缩模式：移除多余空格和换行
        formatted = input
          .replace(/--.*$/gm, '') // 移除单行注释
          .replace(/\/\*[\s\S]*?\*\//g, '') // 移除多行注释
          .replace(/\s+/g, ' ') // 多个空格替换为单个
          .trim();
      } else {
        // 格式化模式
        formatted = format(input, {
          language: options.language,
          tabWidth: options.indent.length,
          useTabs: false,
          keywordCase: options.keywordCase,
          linesBetweenQueries: options.linesBetweenQueries,
        });
      }

      setOutput(formatted);
      
      // 保存到历史记录
      addHistoryRecord({
        input,
        output: formatted,
        options,
      });
      setHistory(loadHistory());

    } catch (error) {
      setSnackbarMessage(`格式化失败: ${error instanceof Error ? error.message : String(error)}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setOutput('');
    }
  };

  const handleCopy = async () => {
    if (!output) {
      setSnackbarMessage('没有可复制的内容');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    try {
      await navigator.clipboard.writeText(output);
      setSnackbarMessage('已复制到剪贴板！');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage('复制失败');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDownload = () => {
    if (!output) {
      setSnackbarMessage('没有可下载的内容');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `formatted-sql-${Date.now()}.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setSnackbarMessage('SQL 文件已下载！');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const handleLoadExample = (key: string) => {
    const example = SQL_EXAMPLES[key as keyof typeof SQL_EXAMPLES];
    if (example) {
      setInput(example.sql);
    }
    setExampleMenuAnchor(null);
  };

  const handleLoadHistory = (record: HistoryRecord) => {
    setInput(record.input);
    setOutput(record.output);
    setOptions(record.options);
    setHistoryDrawerOpen(false);
    setSnackbarMessage('已加载历史记录');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleDeleteHistory = (id: string) => {
    const newHistory = history.filter((record) => record.id !== id);
    setHistory(newHistory);
    saveHistory(newHistory);
    setSnackbarMessage('历史记录已删除');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleClearHistory = () => {
    setHistory([]);
    saveHistory([]);
    setSnackbarMessage('所有历史记录已清空');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const inputStats = {
    chars: input.length,
    lines: input.split('\n').length,
    statements: input.split(';').filter((s) => s.trim()).length,
  };

  const outputStats = {
    chars: output.length,
    lines: output.split('\n').length,
    statements: output.split(';').filter((s) => s.trim()).length,
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader
        title="SQL 格式化"
        description="美化和格式化 SQL 语句，支持多种数据库方言"
        category="代码格式化"
      />

      <Box sx={{ mb: 3 }}>
        {/* 配置选项 */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
            格式化配置
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>数据库类型</InputLabel>
                <Select
                  value={options.language}
                  label="数据库类型"
                  onChange={(e) => setOptions({ ...options, language: e.target.value as SqlLanguage })}
                >
                  <MenuItem value="sql">标准 SQL</MenuItem>
                  <MenuItem value="mysql">MySQL</MenuItem>
                  <MenuItem value="mariadb">MariaDB</MenuItem>
                  <MenuItem value="postgresql">PostgreSQL</MenuItem>
                  <MenuItem value="tsql">SQL Server (T-SQL)</MenuItem>
                  <MenuItem value="plsql">Oracle (PL/SQL)</MenuItem>
                  <MenuItem value="sqlite">SQLite</MenuItem>
                  <MenuItem value="bigquery">BigQuery</MenuItem>
                  <MenuItem value="redshift">Redshift</MenuItem>
                  <MenuItem value="snowflake">Snowflake</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>缩进</InputLabel>
                <Select
                  value={options.indent}
                  label="缩进"
                  onChange={(e) => setOptions({ ...options, indent: e.target.value })}
                >
                  <MenuItem value="  ">2 空格</MenuItem>
                  <MenuItem value="    ">4 空格</MenuItem>
                  <MenuItem value="\t">Tab</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>关键字</InputLabel>
                <Select
                  value={options.keywordCase}
                  label="关键字"
                  onChange={(e) => setOptions({ ...options, keywordCase: e.target.value as 'upper' | 'lower' | 'preserve' })}
                >
                  <MenuItem value="upper">大写</MenuItem>
                  <MenuItem value="lower">小写</MenuItem>
                  <MenuItem value="preserve">保持原样</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>语句间空行</InputLabel>
                <Select
                  value={options.linesBetweenQueries}
                  label="语句间空行"
                  onChange={(e) => setOptions({ ...options, linesBetweenQueries: Number(e.target.value) })}
                >
                  <MenuItem value={0}>无</MenuItem>
                  <MenuItem value={1}>1 行</MenuItem>
                  <MenuItem value={2}>2 行</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={compressMode}
                    onChange={(e) => setCompressMode(e.target.checked)}
                    color="primary"
                  />
                }
                label="压缩模式"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* 输入输出区域 */}
        <Grid container spacing={2}>
          {/* 输入区 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  输入 SQL
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip label={`${inputStats.chars} 字符`} size="small" variant="outlined" />
                  <Chip label={`${inputStats.lines} 行`} size="small" variant="outlined" />
                  <Chip label={`${inputStats.statements} 条语句`} size="small" variant="outlined" />
                </Stack>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={20}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="在此粘贴或输入 SQL 语句..."
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                  },
                }}
              />
            </Paper>
          </Grid>

          {/* 输出区 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  格式化结果
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip label={`${outputStats.chars} 字符`} size="small" variant="outlined" color="primary" />
                  <Chip label={`${outputStats.lines} 行`} size="small" variant="outlined" color="primary" />
                  <Chip label={`${outputStats.statements} 条语句`} size="small" variant="outlined" color="primary" />
                </Stack>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={20}
                value={output}
                InputProps={{
                  readOnly: true,
                }}
                placeholder="格式化后的 SQL 将显示在此..."
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0, 255, 0, 0.05)' : 'rgba(0, 128, 0, 0.05)',
                  },
                }}
              />
            </Paper>
          </Grid>
        </Grid>

        {/* 操作按钮 */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<Code />}
            onClick={handleFormat}
            disabled={!input.trim()}
          >
            格式化
          </Button>
          <Button
            variant="outlined"
            startIcon={<ContentCopy />}
            onClick={handleCopy}
            disabled={!output}
          >
            复制结果
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleDownload}
            disabled={!output}
          >
            下载 SQL
          </Button>
          <Button
            variant="outlined"
            startIcon={<Delete />}
            onClick={handleClear}
            color="error"
          >
            清空
          </Button>
          <Divider orientation="vertical" flexItem />
          <Button
            variant="outlined"
            onClick={(e) => setExampleMenuAnchor(e.currentTarget)}
          >
            加载示例
          </Button>
          <Button
            variant="outlined"
            startIcon={<History />}
            onClick={() => setHistoryDrawerOpen(true)}
          >
            历史记录 ({history.length})
          </Button>
        </Box>

        {/* 使用提示 */}
        <Box sx={{ mt: 3 }}>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>使用提示：</strong>
            </Typography>
            <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
              <li>支持多种数据库方言，选择对应的数据库类型可获得更好的格式化效果</li>
              <li>压缩模式将移除所有注释和多余空格，生成单行紧凑 SQL</li>
              <li>可以同时格式化多条 SQL 语句，用分号分隔即可</li>
              <li>格式化结果会自动保存到历史记录中，方便随时查看和恢复</li>
            </Typography>
          </Alert>
        </Box>
      </Box>

      {/* 示例菜单 */}
      <Menu
        anchorEl={exampleMenuAnchor}
        open={Boolean(exampleMenuAnchor)}
        onClose={() => setExampleMenuAnchor(null)}
      >
        {Object.entries(SQL_EXAMPLES).map(([key, example]) => (
          <MenuItem key={key} onClick={() => handleLoadExample(key)}>
            <ListItemText primary={example.name} />
          </MenuItem>
        ))}
      </Menu>

      {/* 历史记录抽屉 */}
      <Drawer
        anchor="right"
        open={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 500 } },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">历史记录</Typography>
            <Box>
              {history.length > 0 && (
                <Button
                  size="small"
                  color="error"
                  onClick={handleClearHistory}
                  sx={{ mr: 1 }}
                >
                  清空全部
                </Button>
              )}
              <IconButton onClick={() => setHistoryDrawerOpen(false)} size="small">
                <Close />
              </IconButton>
            </Box>
          </Box>
          {history.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <History sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">暂无历史记录</Typography>
              <Typography variant="body2" color="text.secondary">
                格式化 SQL 后会自动保存
              </Typography>
            </Box>
          ) : (
            <List
              sx={{
                maxHeight: 'calc(100vh - 140px)',
                overflowY: 'auto',
                // 主题适配的滚动条样式
                '&::-webkit-scrollbar': { width: '8px' },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark'
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
              {history.map((record, index) => (
                <React.Fragment key={record.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleLoadHistory(record)}
                      sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 1.5 }}
                    >
                      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(record.timestamp).toLocaleString('zh-CN')}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Chip label={record.options.language.toUpperCase()} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteHistory(record.id);
                            }}
                            sx={{ ml: 1 }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          width: '100%',
                          p: 1,
                          backgroundColor: 'action.hover',
                          borderRadius: 1,
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {record.input.substring(0, 100)}
                        {record.input.length > 100 ? '...' : ''}
                      </Box>
                      <Box sx={{ mt: 0.5, display: 'flex', gap: 1 }}>
                        <Chip
                          icon={<CheckCircle sx={{ fontSize: '0.9rem' }} />}
                          label={`${record.output.split('\n').length} 行`}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                        <Chip
                          label={`${record.output.length} 字符`}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                      </Box>
                    </ListItemButton>
                  </ListItem>
                  {index < history.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Drawer>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
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

