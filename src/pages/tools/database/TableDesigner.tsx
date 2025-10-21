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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Grid,
} from '@mui/material';
import {
  Add,
  Delete,
  ContentCopy,
  Code,
  TableChart,
} from '@mui/icons-material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { nanoid } from 'nanoid';

interface Column {
  id: string;
  name: string;
  type: string;
  length: string;
  nullable: boolean;
  defaultValue: string;
  isPrimaryKey: boolean;
  isUnique: boolean;
  isAutoIncrement: boolean;
  comment: string;
}

interface Index {
  id: string;
  name: string;
  columns: string[];
  type: 'normal' | 'unique' | 'fulltext';
}

export const TableDesigner: React.FC = () => {
  const [tableName, setTableName] = useState('');
  const [database, setDatabase] = useState('mysql');
  const [columns, setColumns] = useState<Column[]>([
    {
      id: nanoid(),
      name: 'id',
      type: 'INT',
      length: '',
      nullable: false,
      defaultValue: '',
      isPrimaryKey: true,
      isUnique: false,
      isAutoIncrement: true,
      comment: '主键ID',
    },
  ]);
  const [indexes, setIndexes] = useState<Index[]>([]);
  const [generatedSql, setGeneratedSql] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // 数据类型选项
  const dataTypes: Record<string, string[]> = {
    mysql: ['INT', 'BIGINT', 'VARCHAR', 'TEXT', 'DATETIME', 'TIMESTAMP', 'DECIMAL', 'FLOAT', 'DOUBLE', 'TINYINT', 'BOOLEAN', 'BLOB', 'JSON', 'ENUM'],
    postgresql: ['INTEGER', 'BIGINT', 'VARCHAR', 'TEXT', 'TIMESTAMP', 'NUMERIC', 'REAL', 'DOUBLE PRECISION', 'BOOLEAN', 'BYTEA', 'JSON', 'JSONB', 'UUID'],
    sqlserver: ['INT', 'BIGINT', 'NVARCHAR', 'NTEXT', 'DATETIME2', 'DECIMAL', 'FLOAT', 'BIT', 'VARBINARY', 'UNIQUEIDENTIFIER'],
    sqlite: ['INTEGER', 'TEXT', 'REAL', 'BLOB'],
  };

  const addColumn = () => {
    setColumns([
      ...columns,
      {
        id: nanoid(),
        name: '',
        type: dataTypes[database][0],
        length: '',
        nullable: true,
        defaultValue: '',
        isPrimaryKey: false,
        isUnique: false,
        isAutoIncrement: false,
        comment: '',
      },
    ]);
  };

  const updateColumn = (id: string, field: keyof Column, value: string | boolean) => {
    setColumns(columns.map((col) => (col.id === id ? { ...col, [field]: value } : col)));
  };

  const deleteColumn = (id: string) => {
    if (columns.length === 1) {
      setSnackbarMessage('至少保留一个字段');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    setColumns(columns.filter((col) => col.id !== id));
  };

  const addIndex = () => {
    setIndexes([
      ...indexes,
      {
        id: nanoid(),
        name: '',
        columns: [],
        type: 'normal',
      },
    ]);
  };

  const updateIndex = (id: string, field: keyof Index, value: string | string[]) => {
    setIndexes(indexes.map((idx) => (idx.id === id ? { ...idx, [field]: value } : idx)));
  };

  const deleteIndex = (id: string) => {
    setIndexes(indexes.filter((idx) => idx.id !== id));
  };

  const generateSql = () => {
    if (!tableName.trim()) {
      setSnackbarMessage('请输入表名');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (columns.some((col) => !col.name.trim())) {
      setSnackbarMessage('所有字段都必须有名称');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    let sql = '';

    if (database === 'mysql') {
      sql = generateMySqlDdl();
    } else if (database === 'postgresql') {
      sql = generatePostgreSqlDdl();
    } else if (database === 'sqlserver') {
      sql = generateSqlServerDdl();
    } else if (database === 'sqlite') {
      sql = generateSqliteDdl();
    }

    setGeneratedSql(sql);
    setSnackbarMessage('SQL 生成成功！');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const generateMySqlDdl = () => {
    const lines: string[] = [];
    lines.push(`CREATE TABLE \`${tableName}\` (`);

    // 字段定义
    const columnDefs = columns.map((col) => {
      let def = `  \`${col.name}\` ${col.type}`;
      if (col.length && ['VARCHAR', 'DECIMAL'].includes(col.type)) {
        def += `(${col.length})`;
      }
      if (!col.nullable) def += ' NOT NULL';
      if (col.isAutoIncrement) def += ' AUTO_INCREMENT';
      if (col.defaultValue) {
        if (['INT', 'BIGINT', 'TINYINT', 'DECIMAL', 'FLOAT', 'DOUBLE'].includes(col.type)) {
          def += ` DEFAULT ${col.defaultValue}`;
        } else {
          def += ` DEFAULT '${col.defaultValue}'`;
        }
      }
      if (col.comment) def += ` COMMENT '${col.comment}'`;
      return def;
    });
    lines.push(columnDefs.join(',\n'));

    // 主键
    const primaryKeys = columns.filter((col) => col.isPrimaryKey);
    if (primaryKeys.length > 0) {
      lines.push(`,\n  PRIMARY KEY (${primaryKeys.map((col) => `\`${col.name}\``).join(', ')})`);
    }

    // 唯一索引
    const uniqueColumns = columns.filter((col) => col.isUnique && !col.isPrimaryKey);
    uniqueColumns.forEach((col) => {
      lines.push(`,\n  UNIQUE KEY \`uk_${col.name}\` (\`${col.name}\`)`);
    });

    // 自定义索引
    indexes.forEach((idx) => {
      if (idx.columns.length > 0 && idx.name) {
        const keyType = idx.type === 'unique' ? 'UNIQUE KEY' : idx.type === 'fulltext' ? 'FULLTEXT KEY' : 'KEY';
        lines.push(`,\n  ${keyType} \`${idx.name}\` (${idx.columns.map((c) => `\`${c}\``).join(', ')})`);
      }
    });

    lines.push('\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
    return lines.join('');
  };

  const generatePostgreSqlDdl = () => {
    const lines: string[] = [];
    lines.push(`CREATE TABLE "${tableName}" (`);

    // 字段定义
    const columnDefs = columns.map((col) => {
      let def = `  "${col.name}" ${col.type}`;
      if (col.length && ['VARCHAR'].includes(col.type)) {
        def += `(${col.length})`;
      }
      if (!col.nullable) def += ' NOT NULL';
      if (col.defaultValue) {
        if (['INTEGER', 'BIGINT', 'NUMERIC', 'REAL'].includes(col.type)) {
          def += ` DEFAULT ${col.defaultValue}`;
        } else {
          def += ` DEFAULT '${col.defaultValue}'`;
        }
      }
      return def;
    });
    lines.push(columnDefs.join(',\n'));

    // 主键
    const primaryKeys = columns.filter((col) => col.isPrimaryKey);
    if (primaryKeys.length > 0) {
      lines.push(`,\n  PRIMARY KEY (${primaryKeys.map((col) => `"${col.name}"`).join(', ')})`);
    }

    lines.push('\n);');

    // 注释
    columns.forEach((col) => {
      if (col.comment) {
        lines.push(`\nCOMMENT ON COLUMN "${tableName}"."${col.name}" IS '${col.comment}';`);
      }
    });

    // 索引
    const uniqueColumns = columns.filter((col) => col.isUnique && !col.isPrimaryKey);
    uniqueColumns.forEach((col) => {
      lines.push(`\nCREATE UNIQUE INDEX idx_${col.name} ON "${tableName}" ("${col.name}");`);
    });

    indexes.forEach((idx) => {
      if (idx.columns.length > 0 && idx.name) {
        const uniqueKeyword = idx.type === 'unique' ? 'UNIQUE ' : '';
        lines.push(`\nCREATE ${uniqueKeyword}INDEX ${idx.name} ON "${tableName}" (${idx.columns.map((c) => `"${c}"`).join(', ')});`);
      }
    });

    return lines.join('');
  };

  const generateSqlServerDdl = () => {
    const lines: string[] = [];
    lines.push(`CREATE TABLE [${tableName}] (`);

    // 字段定义
    const columnDefs = columns.map((col) => {
      let def = `  [${col.name}] ${col.type}`;
      if (col.length && ['NVARCHAR'].includes(col.type)) {
        def += `(${col.length})`;
      }
      if (col.isAutoIncrement) def += ' IDENTITY(1,1)';
      if (!col.nullable) def += ' NOT NULL';
      if (col.defaultValue) {
        if (['INT', 'BIGINT', 'DECIMAL', 'FLOAT'].includes(col.type)) {
          def += ` DEFAULT ${col.defaultValue}`;
        } else {
          def += ` DEFAULT '${col.defaultValue}'`;
        }
      }
      return def;
    });
    lines.push(columnDefs.join(',\n'));

    // 主键
    const primaryKeys = columns.filter((col) => col.isPrimaryKey);
    if (primaryKeys.length > 0) {
      lines.push(`,\n  PRIMARY KEY (${primaryKeys.map((col) => `[${col.name}]`).join(', ')})`);
    }

    lines.push('\n);');
    return lines.join('');
  };

  const generateSqliteDdl = () => {
    const lines: string[] = [];
    lines.push(`CREATE TABLE "${tableName}" (`);

    // 字段定义
    const columnDefs = columns.map((col) => {
      let def = `  "${col.name}" ${col.type}`;
      if (col.isPrimaryKey) def += ' PRIMARY KEY';
      if (col.isAutoIncrement) def += ' AUTOINCREMENT';
      if (!col.nullable) def += ' NOT NULL';
      if (col.defaultValue) {
        def += ` DEFAULT '${col.defaultValue}'`;
      }
      return def;
    });
    lines.push(columnDefs.join(',\n'));

    lines.push('\n);');
    return lines.join('');
  };

  const handleCopy = async () => {
    if (!generatedSql) {
      setSnackbarMessage('请先生成 SQL');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    try {
      await navigator.clipboard.writeText(generatedSql);
      setSnackbarMessage('SQL 已复制到剪贴板');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage('复制失败');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleClear = () => {
    setTableName('');
    setColumns([
      {
        id: nanoid(),
        name: 'id',
        type: 'INT',
        length: '',
        nullable: false,
        defaultValue: '',
        isPrimaryKey: true,
        isUnique: false,
        isAutoIncrement: true,
        comment: '主键ID',
      },
    ]);
    setIndexes([]);
    setGeneratedSql('');
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader title="表结构设计器" description="可视化建表工具，生成 CREATE TABLE 语句" toolPath="/tools/database/table-designer" />

      <Box sx={{ mb: 3 }}>
        {/* 配置区 */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="表名" value={tableName} onChange={(e) => setTableName(e.target.value)} placeholder="例如: users" />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>数据库类型</InputLabel>
                <Select value={database} label="数据库类型" onChange={(e) => setDatabase(e.target.value)}>
                  <MenuItem value="mysql">MySQL</MenuItem>
                  <MenuItem value="postgresql">PostgreSQL</MenuItem>
                  <MenuItem value="sqlserver">SQL Server</MenuItem>
                  <MenuItem value="sqlite">SQLite</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* 字段设计 */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TableChart /> 字段设计
            </Typography>
            <Button startIcon={<Add />} variant="outlined" onClick={addColumn} size="small">
              添加字段
            </Button>
          </Box>
          <TableContainer
            sx={{
              maxHeight: 400,
              overflowY: 'auto',
              '&::-webkit-scrollbar': { width: '8px', height: '8px' },
              '&::-webkit-scrollbar-track': {
                backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'),
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
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>字段名</TableCell>
                  <TableCell>类型</TableCell>
                  <TableCell>长度</TableCell>
                  <TableCell>可空</TableCell>
                  <TableCell>默认值</TableCell>
                  <TableCell>主键</TableCell>
                  <TableCell>唯一</TableCell>
                  <TableCell>自增</TableCell>
                  <TableCell>备注</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {columns.map((col) => (
                  <TableRow key={col.id}>
                    <TableCell>
                      <TextField size="small" value={col.name} onChange={(e) => updateColumn(col.id, 'name', e.target.value)} placeholder="字段名" />
                    </TableCell>
                    <TableCell>
                      <Select size="small" value={col.type} onChange={(e) => updateColumn(col.id, 'type', e.target.value)} sx={{ minWidth: 100 }}>
                        {dataTypes[database].map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <TextField size="small" value={col.length} onChange={(e) => updateColumn(col.id, 'length', e.target.value)} placeholder="长度" sx={{ width: 70 }} />
                    </TableCell>
                    <TableCell>
                      <Checkbox size="small" checked={col.nullable} onChange={(e) => updateColumn(col.id, 'nullable', e.target.checked)} />
                    </TableCell>
                    <TableCell>
                      <TextField size="small" value={col.defaultValue} onChange={(e) => updateColumn(col.id, 'defaultValue', e.target.value)} placeholder="默认" />
                    </TableCell>
                    <TableCell>
                      <Checkbox size="small" checked={col.isPrimaryKey} onChange={(e) => updateColumn(col.id, 'isPrimaryKey', e.target.checked)} />
                    </TableCell>
                    <TableCell>
                      <Checkbox size="small" checked={col.isUnique} onChange={(e) => updateColumn(col.id, 'isUnique', e.target.checked)} disabled={col.isPrimaryKey} />
                    </TableCell>
                    <TableCell>
                      <Checkbox size="small" checked={col.isAutoIncrement} onChange={(e) => updateColumn(col.id, 'isAutoIncrement', e.target.checked)} disabled={!col.isPrimaryKey} />
                    </TableCell>
                    <TableCell>
                      <TextField size="small" value={col.comment} onChange={(e) => updateColumn(col.id, 'comment', e.target.value)} placeholder="备注" />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => deleteColumn(col.id)} color="error">
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* 索引设计 */}
        {database !== 'sqlite' && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">索引设计</Typography>
              <Button startIcon={<Add />} variant="outlined" onClick={addIndex} size="small">
                添加索引
              </Button>
            </Box>
            {indexes.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                暂无索引，点击"添加索引"创建
              </Typography>
            ) : (
              <Stack spacing={2}>
                {indexes.map((idx) => (
                  <Box key={idx.id} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField size="small" label="索引名" value={idx.name} onChange={(e) => updateIndex(idx.id, 'name', e.target.value)} placeholder="idx_xxx" sx={{ minWidth: 150 }} />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>类型</InputLabel>
                      <Select value={idx.type} label="类型" onChange={(e) => updateIndex(idx.id, 'type', e.target.value)}>
                        <MenuItem value="normal">普通</MenuItem>
                        <MenuItem value="unique">唯一</MenuItem>
                        {database === 'mysql' && <MenuItem value="fulltext">全文</MenuItem>}
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ flex: 1 }}>
                      <InputLabel>包含字段</InputLabel>
                      <Select
                        multiple
                        value={idx.columns}
                        label="包含字段"
                        onChange={(e) => updateIndex(idx.id, 'columns', e.target.value as string[])}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={value} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        {columns.map((col) => (
                          <MenuItem key={col.id} value={col.name}>
                            {col.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <IconButton size="small" onClick={() => deleteIndex(idx.id)} color="error">
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        )}

        {/* 操作按钮 */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button variant="contained" startIcon={<Code />} onClick={generateSql} disabled={!tableName.trim()}>
            生成 SQL
          </Button>
          <Button variant="outlined" startIcon={<ContentCopy />} onClick={handleCopy} disabled={!generatedSql}>
            复制 SQL
          </Button>
          <Button variant="outlined" onClick={handleClear} color="error">
            清空
          </Button>
        </Box>

        {/* 生成的 SQL */}
        {generatedSql && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              生成的 CREATE TABLE 语句
            </Typography>
            <Box
              sx={{
                p: 2,
                backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(0, 255, 0, 0.05)' : 'rgba(0, 128, 0, 0.05)'),
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {generatedSql}
            </Box>
          </Paper>
        )}

        {/* 使用提示 */}
        <Box sx={{ mt: 3 }}>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>使用提示：</strong>
            </Typography>
            <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
              <li>主键字段会自动设置为 NOT NULL</li>
              <li>VARCHAR 类型建议设置长度，例如 255</li>
              <li>DECIMAL 类型需要设置精度，例如 10,2</li>
              <li>自增字段只能应用于整数类型的主键</li>
              <li>生成的 SQL 仅供参考，实际使用前请检查和测试</li>
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

