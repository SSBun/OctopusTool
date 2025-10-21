import React, { useState, useEffect } from 'react';
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
  Card,
  CardContent,
  IconButton,
  Tooltip,
  LinearProgress,
  Collapse,
  SelectChangeEvent,
  Divider,
} from '@mui/material';
import {
  ContentCopy,
  Psychology,
  CheckCircle,
  ExpandMore,
  Star,
  StarBorder,
  Lightbulb,
  Speed,
  Warning,
} from '@mui/icons-material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { useAIConfig } from '../../../contexts/AIConfigContext';
import { createAIService } from '../../../services/aiService';
import { z } from 'zod';

interface SqlSuggestion {
  sql: string;
  score: number;
  explanation: string;
  pros: string[];
  cons: string[];
  performance: string;
  indexes: string[];
}

const suggestionSchema = z.object({
  suggestions: z.array(
    z.object({
      sql: z.string(),
      score: z.number().min(0).max(100),
      explanation: z.string(),
      pros: z.array(z.string()),
      cons: z.array(z.string()),
      performance: z.string(),
      indexes: z.array(z.string()),
    })
  ),
});

export const AiSqlGenerator: React.FC = () => {
  const { configs, getConfigById } = useAIConfig();
  const [selectedConfigId, setSelectedConfigId] = useState('');
  const [description, setDescription] = useState('');
  const [database, setDatabase] = useState('mysql');
  const [tableSchema, setTableSchema] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SqlSuggestion[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const activeConfig = configs.find((c) => c.isActive);
    if (activeConfig) {
      setSelectedConfigId(activeConfig.id);
    } else if (configs.length > 0) {
      setSelectedConfigId(configs[0].id);
    }
  }, [configs]);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setSnackbarMessage('请输入需求描述');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const selectedConfig = getConfigById(selectedConfigId);
    if (!selectedConfig || !selectedConfig.apiKey) {
      setSnackbarMessage('请先在设置中配置 AI 模型');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    setSuggestions([]);

    try {
      const aiService = createAIService(selectedConfig);
      if (!aiService) {
        throw new Error('无法创建 AI 服务');
      }

      const prompt = `你是一个专业的 SQL 查询专家。请根据以下需求生成 3 个不同的 SQL 查询方案：

需求描述：${description}

目标数据库：${database.toUpperCase()}
${tableSchema.trim() ? `\n表结构信息：\n${tableSchema}\n` : ''}

要求：
1. 生成 3 个不同的 SQL 查询方案（从简单到复杂，或不同的实现思路）
2. 每个方案需要包含：
   - sql: 完整的 SQL 查询语句（符合 ${database.toUpperCase()} 语法）
   - score: 推荐评分（0-100），综合考虑性能、可读性、安全性
   - explanation: 简短解释这个查询的思路和特点
   - pros: 优点列表（2-3 条）
   - cons: 缺点列表（1-2 条）
   - performance: 性能评估（"优秀"、"良好"、"中等"、"较差"）
   - indexes: 建议创建的索引（数组，如 ["users(email)", "orders(user_id, created_at)"]）

3. 确保 SQL 语句：
   - 使用参数化占位符（? 或 :param）而非硬编码值
   - 符合 ${database.toUpperCase()} 的语法和函数
   - 考虑性能优化（适当使用索引、避免 N+1 查询）
   - 遵循安全最佳实践（防止 SQL 注入）

请直接返回 JSON 格式，不要包含任何其他解释文字。`;

      const result = await aiService.generateObject(prompt, suggestionSchema, { temperature: 0.7 });
      const sortedSuggestions = result.suggestions.sort((a, b) => b.score - a.score);
      setSuggestions(sortedSuggestions);
      setExpandedIndex(0);

      setSnackbarMessage('SQL 查询生成成功！');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('生成失败:', error);
      setSnackbarMessage(`生成失败: ${error instanceof Error ? error.message : String(error)}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (sql: string) => {
    try {
      await navigator.clipboard.writeText(sql);
      setSnackbarMessage('SQL 已复制到剪贴板');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage('复制失败');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const loadExample = () => {
    setDescription('查询最近 30 天内订单金额超过 1000 元的活跃用户，并统计他们的订单总数和总金额');
    setTableSchema(`-- users 表
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- orders 表
CREATE TABLE orders (
  order_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);`);
  };

  const getPerformanceColor = (performance: string) => {
    if (performance === '优秀') return 'success';
    if (performance === '良好') return 'info';
    if (performance === '中等') return 'warning';
    return 'error';
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader
        title="AI SQL 生成器"
        description="自然语言生成 SQL 查询，智能优化建议"
        toolPath="/tools/database/ai-sql-generator"
      />

      <Box sx={{ mb: 3 }}>
        {/* 配置区 */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
            生成配置
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>AI 模型配置</InputLabel>
              <Select
                value={selectedConfigId}
                label="AI 模型配置"
                onChange={(e: SelectChangeEvent) => setSelectedConfigId(e.target.value)}
                disabled={configs.length === 0}
              >
                {configs.length === 0 ? (
                  <MenuItem value="" disabled>
                    请先添加 AI 配置
                  </MenuItem>
                ) : (
                  configs.map((config) => (
                    <MenuItem key={config.id} value={config.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>{config.name}</Typography>
                        {config.isActive && (
                          <Chip label="默认" size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem' }} />
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                          {config.model}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>目标数据库</InputLabel>
              <Select value={database} label="目标数据库" onChange={(e) => setDatabase(e.target.value)}>
                <MenuItem value="mysql">MySQL</MenuItem>
                <MenuItem value="postgresql">PostgreSQL</MenuItem>
                <MenuItem value="sqlite">SQLite</MenuItem>
                <MenuItem value="sqlserver">SQL Server</MenuItem>
                <MenuItem value="oracle">Oracle</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" onClick={loadExample}>
              加载示例
            </Button>
          </Stack>
        </Paper>

        {/* 输入区 */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
            需求描述
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="用自然语言描述你的需求，例如：查询最近30天注册的活跃用户及其订单统计"
            sx={{ mb: 2 }}
          />
          <Typography variant="subtitle2" gutterBottom sx={{ mb: 1, fontWeight: 600 }}>
            表结构信息（可选，但强烈推荐）
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={tableSchema}
            onChange={(e) => setTableSchema(e.target.value)}
            placeholder="粘贴 CREATE TABLE 语句或表结构说明，帮助 AI 更准确地生成查询..."
            sx={{
              '& .MuiInputBase-root': {
                fontFamily: 'monospace',
                fontSize: '0.9rem',
              },
              // 主题适配的滚动条样式（强制规范）
              '& textarea': {
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
              },
            }}
          />
        </Paper>

        {/* 操作按钮 */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Psychology />}
            onClick={handleGenerate}
            disabled={loading || !description.trim() || configs.length === 0}
          >
            {loading ? '生成中...' : '生成 SQL'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setDescription('');
              setTableSchema('');
              setSuggestions([]);
            }}
          >
            清空
          </Button>
        </Box>

        {/* 加载指示器 */}
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* 结果区 */}
        {suggestions.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CheckCircle color="success" />
              生成结果 ({suggestions.length} 个方案)
            </Typography>
            {suggestions.map((suggestion, index) => {
              const isExpanded = expandedIndex === index;
              return (
                <Card key={index} sx={{ mb: 2, border: index === 0 ? '2px solid' : '1px solid', borderColor: index === 0 ? 'primary.main' : 'divider' }}>
                  <CardContent sx={{ pb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          {index === 0 ? <Star color="primary" /> : <StarBorder color="action" />}
                          <Typography variant="h6">
                            方案 {index + 1}
                            {index === 0 && ' (推荐)'}
                          </Typography>
                          <Chip label={`评分: ${suggestion.score}`} color={suggestion.score >= 80 ? 'success' : suggestion.score >= 60 ? 'info' : 'warning'} size="small" />
                          <Chip label={`性能: ${suggestion.performance}`} color={getPerformanceColor(suggestion.performance)} size="small" variant="outlined" />
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {suggestion.explanation}
                        </Typography>
                      </Box>
                      <Box>
                        <Tooltip title="复制 SQL">
                          <IconButton size="small" onClick={() => handleCopy(suggestion.sql)}>
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={isExpanded ? '收起详情' : '展开详情'}>
                          <IconButton
                            size="small"
                            onClick={() => setExpandedIndex(isExpanded ? null : index)}
                            sx={{
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.3s',
                            }}
                          >
                            <ExpandMore fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* SQL 代码 */}
                    <Box
                      sx={{
                        p: 2,
                        backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(0, 255, 0, 0.05)' : 'rgba(0, 128, 0, 0.05)'),
                        borderRadius: 1,
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        mb: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      {suggestion.sql}
                    </Box>

                    {/* 详细信息 */}
                    <Collapse in={isExpanded}>
                      <Divider sx={{ mb: 2 }} />
                      <Stack spacing={2}>
                        {/* 优点 */}
                        <Box>
                          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.85rem', fontWeight: 600 }}>
                            <CheckCircle sx={{ fontSize: '1rem' }} color="success" /> 优点
                          </Typography>
                          <Box component="ul" sx={{ pl: 2, m: 0 }}>
                            {suggestion.pros.map((pro, i) => (
                              <Typography key={i} component="li" variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                                {pro}
                              </Typography>
                            ))}
                          </Box>
                        </Box>

                        {/* 缺点 */}
                        {suggestion.cons.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.85rem', fontWeight: 600 }}>
                              <Warning sx={{ fontSize: '1rem' }} color="warning" /> 缺点
                            </Typography>
                            <Box component="ul" sx={{ pl: 2, m: 0 }}>
                              {suggestion.cons.map((con, i) => (
                                <Typography key={i} component="li" variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                                  {con}
                                </Typography>
                              ))}
                            </Box>
                          </Box>
                        )}

                        {/* 索引建议 */}
                        {suggestion.indexes.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.85rem', fontWeight: 600 }}>
                              <Speed sx={{ fontSize: '1rem' }} color="primary" /> 建议索引
                            </Typography>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                              {suggestion.indexes.map((index, i) => (
                                <Chip key={i} label={index} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }} />
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </Stack>
                    </Collapse>
                  </CardContent>
                </Card>
              );
            })}
          </>
        )}

        {/* 空状态 */}
        {!loading && suggestions.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Psychology sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary" gutterBottom>
              描述你的需求，AI 将生成专业的 SQL 查询
            </Typography>
            <Typography variant="body2" color="text.secondary">
              提供表结构信息可以获得更准确的结果
            </Typography>
          </Paper>
        )}

        {/* 使用提示 */}
        <Box sx={{ mt: 3 }}>
          <Alert severity="info" icon={<Lightbulb />}>
            <Typography variant="body2">
              <strong>使用提示：</strong>
            </Typography>
            <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
              <li>提供详细的需求描述和表结构信息，可以获得更准确的 SQL 查询</li>
              <li>AI 生成的 SQL 仅供参考，使用前请仔细检查和测试</li>
              <li>注意索引建议，合理的索引可以显著提升查询性能</li>
              <li>生成的查询使用了参数化占位符，实际使用时请根据你的框架调整</li>
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

