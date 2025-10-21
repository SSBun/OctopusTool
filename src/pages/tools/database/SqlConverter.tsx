import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Chip,
  Stack,
  Grid,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  SwapHoriz,
  ContentCopy,
  Warning,
  Info,
  CheckCircle,
} from '@mui/icons-material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';

interface ConversionWarning {
  type: 'warning' | 'info' | 'error';
  message: string;
}

export const SqlConverter: React.FC = () => {
  const [sourceDb, setSourceDb] = useState('mysql');
  const [targetDb, setTargetDb] = useState('postgresql');
  const [inputSql, setInputSql] = useState('');
  const [outputSql, setOutputSql] = useState('');
  const [warnings, setWarnings] = useState<ConversionWarning[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // 数据类型映射
  const dataTypeMapping: Record<string, Record<string, string>> = {
    mysql_to_postgresql: {
      'INT AUTO_INCREMENT': 'SERIAL',
      'BIGINT AUTO_INCREMENT': 'BIGSERIAL',
      'TINYINT(1)': 'BOOLEAN',
      'DATETIME': 'TIMESTAMP',
      'TEXT': 'TEXT',
      'MEDIUMTEXT': 'TEXT',
      'LONGTEXT': 'TEXT',
      'BLOB': 'BYTEA',
      'ENUM': 'VARCHAR', // PostgreSQL doesn't have ENUM by default
    },
    postgresql_to_mysql: {
      'SERIAL': 'INT AUTO_INCREMENT',
      'BIGSERIAL': 'BIGINT AUTO_INCREMENT',
      'BOOLEAN': 'TINYINT(1)',
      'TIMESTAMP': 'DATETIME',
      'BYTEA': 'BLOB',
    },
    mysql_to_sqlserver: {
      'AUTO_INCREMENT': 'IDENTITY(1,1)',
      'TINYINT(1)': 'BIT',
      'DATETIME': 'DATETIME2',
      'TEXT': 'NVARCHAR(MAX)',
      'MEDIUMTEXT': 'NVARCHAR(MAX)',
      'LONGTEXT': 'NVARCHAR(MAX)',
      'BLOB': 'VARBINARY(MAX)',
    },
    sqlserver_to_mysql: {
      'IDENTITY\\(1,1\\)': 'AUTO_INCREMENT',
      'BIT': 'TINYINT(1)',
      'DATETIME2': 'DATETIME',
      'NVARCHAR\\(MAX\\)': 'TEXT',
      'VARBINARY\\(MAX\\)': 'BLOB',
    },
  };

  // 函数映射
  const functionMapping: Record<string, Record<string, string>> = {
    mysql_to_postgresql: {
      'NOW()': 'CURRENT_TIMESTAMP',
      'IFNULL': 'COALESCE',
      'DATE_FORMAT': 'TO_CHAR',
      'CONCAT': '||',
      'LIMIT (\\d+)': 'LIMIT $1',
      'LIMIT (\\d+), (\\d+)': 'LIMIT $2 OFFSET $1',
    },
    postgresql_to_mysql: {
      'CURRENT_TIMESTAMP': 'NOW()',
      'COALESCE': 'IFNULL',
      'TO_CHAR': 'DATE_FORMAT',
      '\\|\\|': 'CONCAT',
      'LIMIT (\\d+) OFFSET (\\d+)': 'LIMIT $2, $1',
    },
    mysql_to_sqlserver: {
      'AUTO_INCREMENT': 'IDENTITY(1,1)',
      'IFNULL': 'ISNULL',
      'LIMIT (\\d+)': 'TOP $1',
      'NOW()': 'GETDATE()',
      'CONCAT': '+',
    },
    sqlserver_to_mysql: {
      'IDENTITY\\(1,1\\)': 'AUTO_INCREMENT',
      'ISNULL': 'IFNULL',
      'TOP (\\d+)': 'LIMIT $1',
      'GETDATE\\(\\)': 'NOW()',
    },
  };

  const convertSql = () => {
    if (!inputSql.trim()) {
      setSnackbarMessage('请输入 SQL 语句');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (sourceDb === targetDb) {
      setSnackbarMessage('源数据库和目标数据库相同，无需转换');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    let converted = inputSql;
    const conversionWarnings: ConversionWarning[] = [];
    const conversionKey = `${sourceDb}_to_${targetDb}`;

    // 应用数据类型映射
    const typeMap = dataTypeMapping[conversionKey];
    if (typeMap) {
      Object.entries(typeMap).forEach(([source, target]) => {
        const regex = new RegExp(source, 'gi');
        if (regex.test(converted)) {
          converted = converted.replace(regex, target);
          conversionWarnings.push({
            type: 'info',
            message: `数据类型 "${source}" 已转换为 "${target}"`,
          });
        }
      });
    }

    // 应用函数映射
    const funcMap = functionMapping[conversionKey];
    if (funcMap) {
      Object.entries(funcMap).forEach(([source, target]) => {
        const regex = new RegExp(source, 'gi');
        if (regex.test(converted)) {
          converted = converted.replace(regex, target);
          conversionWarnings.push({
            type: 'info',
            message: `函数/语法 "${source}" 已转换为 "${target}"`,
          });
        }
      });
    }

    // 特殊处理：引号
    if (sourceDb === 'mysql' && (targetDb === 'postgresql' || targetDb === 'sqlserver')) {
      // MySQL 使用反引号，PostgreSQL 和 SQL Server 使用双引号
      if (/`/.test(converted)) {
        converted = converted.replace(/`([^`]+)`/g, '"$1"');
        conversionWarnings.push({
          type: 'info',
          message: '反引号 (`) 已转换为双引号 (")',
        });
      }
    } else if ((sourceDb === 'postgresql' || sourceDb === 'sqlserver') && targetDb === 'mysql') {
      if (/"/.test(converted)) {
        converted = converted.replace(/"([^"]+)"/g, '`$1`');
        conversionWarnings.push({
          type: 'info',
          message: '双引号 (") 已转换为反引号 (`)',
        });
      }
    }

    // 添加通用警告
    if (conversionWarnings.length === 0) {
      conversionWarnings.push({
        type: 'warning',
        message: `未检测到需要转换的语法差异。请手动检查以下内容：数据类型、函数、存储过程、触发器等`,
      });
    }

    // 数据库特定警告
    if (sourceDb === 'mysql' && targetDb === 'postgresql') {
      if (/ENUM/i.test(inputSql)) {
        conversionWarnings.push({
          type: 'warning',
          message: 'MySQL 的 ENUM 类型在 PostgreSQL 中需要先创建自定义类型或使用 CHECK 约束',
        });
      }
    }

    if (sourceDb === 'mysql' && /LIMIT \d+, \d+/i.test(inputSql)) {
      conversionWarnings.push({
        type: 'info',
        message: 'MySQL 的 LIMIT offset, count 已转换为标准 LIMIT count OFFSET offset 语法',
      });
    }

    setOutputSql(converted);
    setWarnings(conversionWarnings);
    setSnackbarMessage('转换完成！');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleCopy = async () => {
    if (!outputSql) {
      setSnackbarMessage('没有可复制的内容');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    try {
      await navigator.clipboard.writeText(outputSql);
      setSnackbarMessage('已复制到剪贴板！');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage('复制失败');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleClear = () => {
    setInputSql('');
    setOutputSql('');
    setWarnings([]);
  };

  const swapDatabases = () => {
    const temp = sourceDb;
    setSourceDb(targetDb);
    setTargetDb(temp);
    if (outputSql) {
      setInputSql(outputSql);
      setOutputSql('');
      setWarnings([]);
    }
  };

  const loadExample = () => {
    setSourceDb('mysql');
    setTargetDb('postgresql');
    setInputSql(`-- MySQL 示例
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  is_active TINYINT(1) DEFAULT 1,
  bio TEXT,
  created_at DATETIME DEFAULT NOW(),
  INDEX idx_email (email)
);

SELECT 
  u.id,
  u.username,
  IFNULL(u.email, 'N/A') AS email,
  CONCAT(u.username, '@example.com') AS full_email,
  DATE_FORMAT(u.created_at, '%Y-%m-%d') AS formatted_date
FROM users u
WHERE u.is_active = 1
ORDER BY u.created_at DESC
LIMIT 10, 20;`);
  };

  const getWarningIcon = (type: ConversionWarning['type']) => {
    switch (type) {
      case 'error':
        return <Warning color="error" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'info':
        return <Info color="info" />;
      default:
        return <CheckCircle color="success" />;
    }
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader
        title="SQL 转换工具"
        description="MySQL、PostgreSQL、SQL Server 等方言互转"
        toolPath="/tools/database/sql-converter"
      />

      <Box sx={{ mb: 3 }}>
        {/* 数据库选择器 */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>源数据库</InputLabel>
              <Select value={sourceDb} label="源数据库" onChange={(e) => setSourceDb(e.target.value)}>
                <MenuItem value="mysql">MySQL</MenuItem>
                <MenuItem value="postgresql">PostgreSQL</MenuItem>
                <MenuItem value="sqlserver">SQL Server</MenuItem>
                <MenuItem value="oracle">Oracle</MenuItem>
                <MenuItem value="sqlite">SQLite</MenuItem>
              </Select>
            </FormControl>

            <Tooltip title="交换源和目标">
              <IconButton onClick={swapDatabases} color="primary" sx={{ bgcolor: 'action.hover' }}>
                <SwapHoriz />
              </IconButton>
            </Tooltip>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>目标数据库</InputLabel>
              <Select value={targetDb} label="目标数据库" onChange={(e) => setTargetDb(e.target.value)}>
                <MenuItem value="mysql">MySQL</MenuItem>
                <MenuItem value="postgresql">PostgreSQL</MenuItem>
                <MenuItem value="sqlserver">SQL Server</MenuItem>
                <MenuItem value="oracle">Oracle</MenuItem>
                <MenuItem value="sqlite">SQLite</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {/* 输入输出区域 */}
        <Grid container spacing={2}>
          {/* 输入区 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  源 SQL ({sourceDb.toUpperCase()})
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip label={`${inputSql.length} 字符`} size="small" variant="outlined" />
                </Stack>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={20}
                value={inputSql}
                onChange={(e) => setInputSql(e.target.value)}
                placeholder="在此粘贴或输入源 SQL 语句..."
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
                  转换后的 SQL ({targetDb.toUpperCase()})
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip label={`${outputSql.length} 字符`} size="small" variant="outlined" color="primary" />
                </Stack>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={20}
                value={outputSql}
                InputProps={{
                  readOnly: true,
                }}
                placeholder="转换后的 SQL 将显示在此..."
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(0, 255, 0, 0.05)' : 'rgba(0, 128, 0, 0.05)'),
                  },
                }}
              />
            </Paper>
          </Grid>
        </Grid>

        {/* 操作按钮 */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="contained" startIcon={<SwapHoriz />} onClick={convertSql} disabled={!inputSql.trim() || sourceDb === targetDb}>
            转换
          </Button>
          <Button variant="outlined" startIcon={<ContentCopy />} onClick={handleCopy} disabled={!outputSql}>
            复制结果
          </Button>
          <Button variant="outlined" onClick={handleClear} color="error">
            清空
          </Button>
          <Divider orientation="vertical" flexItem />
          <Button variant="outlined" onClick={loadExample}>
            加载示例
          </Button>
        </Box>

        {/* 转换警告和提示 */}
        {warnings.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                转换说明 ({warnings.length})
              </Typography>
              <List dense>
                {warnings.map((warning, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 36 }}>{getWarningIcon(warning.type)}</ListItemIcon>
                      <ListItemText
                        primary={warning.message}
                        primaryTypographyProps={{
                          variant: 'body2',
                          color: warning.type === 'error' ? 'error' : warning.type === 'warning' ? 'warning.main' : 'text.primary',
                        }}
                      />
                    </ListItem>
                    {index < warnings.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Box>
        )}

        {/* 使用提示 */}
        <Box sx={{ mt: 3 }}>
          <Alert severity="warning">
            <Typography variant="body2">
              <strong>重要提示：</strong>
            </Typography>
            <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
              <li>本工具仅进行基础的语法转换，复杂的存储过程、触发器等需要手动调整</li>
              <li>转换后的 SQL 仅供参考，务必在目标数据库中测试验证</li>
              <li>不同数据库的数据类型精度、默认值可能存在差异，请仔细检查</li>
              <li>特殊函数（如全文搜索、JSON 操作等）可能需要完全重写</li>
              <li>建议使用专业的迁移工具（如 Flyway、Liquibase）进行大规模迁移</li>
            </Typography>
          </Alert>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} variant="filled" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

