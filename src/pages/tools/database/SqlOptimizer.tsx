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
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  SelectChangeEvent,
} from '@mui/material';
import {
  Speed,
  Psychology,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  TrendingUp,
  Code,
  Lightbulb,
  Storage,
  Timeline,
  ExpandMore,
  ContentCopy,
} from '@mui/icons-material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { useAIConfig } from '../../../contexts/AIConfigContext';
import { createAIService } from '../../../services/aiService';
import { z } from 'zod';

interface PerformanceIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  solution: string;
}

interface IndexRecommendation {
  table: string;
  columns: string[];
  type: 'btree' | 'hash' | 'composite';
  reason: string;
  estimatedImprovement: string;
}

interface OptimizationResult {
  originalScore: number;
  optimizedScore: number;
  improvement: number;
  optimizedSql: string;
  issues: PerformanceIssue[];
  indexRecommendations: IndexRecommendation[];
  executionPlanAnalysis: string;
  bestPractices: string[];
}

const optimizationSchema = z.object({
  originalScore: z.number().min(0).max(100),
  optimizedScore: z.number().min(0).max(100),
  improvement: z.number(),
  optimizedSql: z.string(),
  issues: z.array(
    z.object({
      severity: z.enum(['critical', 'high', 'medium', 'low']),
      title: z.string(),
      description: z.string(),
      impact: z.string(),
      solution: z.string(),
    })
  ),
  indexRecommendations: z.array(
    z.object({
      table: z.string(),
      columns: z.array(z.string()),
      type: z.enum(['btree', 'hash', 'composite']),
      reason: z.string(),
      estimatedImprovement: z.string(),
    })
  ),
  executionPlanAnalysis: z.string(),
  bestPractices: z.array(z.string()),
});

export const SqlOptimizer: React.FC = () => {
  const { configs, getConfigById } = useAIConfig();
  const [selectedConfigId, setSelectedConfigId] = useState('');
  const [sqlInput, setSqlInput] = useState('');
  const [database, setDatabase] = useState('mysql');
  const [tableSchema, setTableSchema] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
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

  const handleOptimize = async () => {
    if (!sqlInput.trim()) {
      setSnackbarMessage('请输入 SQL 语句');
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
    setResult(null);

    try {
      const aiService = createAIService(selectedConfig);
      if (!aiService) {
        throw new Error('无法创建 AI 服务');
      }

      const prompt = `你是一个专业的 SQL 性能优化专家。请分析以下 SQL 查询的性能问题并提供优化建议：

**目标数据库**: ${database.toUpperCase()}

**原始 SQL**:
\`\`\`sql
${sqlInput}
\`\`\`

${tableSchema.trim() ? `**表结构信息**:\n${tableSchema}\n` : ''}

**分析要求**:
1. **性能评分** (0-100):
   - originalScore: 原始 SQL 的性能评分
   - optimizedScore: 优化后的预期评分
   - improvement: 预期提升百分比

2. **优化后的 SQL**:
   - 重写并优化原始查询
   - 使用参数化占位符
   - 应用最佳实践

3. **性能问题列表** (issues):
   - severity: 'critical' | 'high' | 'medium' | 'low'
   - title: 问题标题
   - description: 详细描述
   - impact: 对性能的影响（如 "导致全表扫描，查询时间 O(n)"）
   - solution: 具体解决方案

4. **索引推荐** (indexRecommendations):
   - table: 表名
   - columns: 字段列表
   - type: 'btree' | 'hash' | 'composite'
   - reason: 推荐理由
   - estimatedImprovement: 预期提升（如 "查询速度提升 80%"）

5. **执行计划分析** (executionPlanAnalysis):
   - 简要分析查询的执行计划
   - 指出瓶颈和优化点

6. **最佳实践建议** (bestPractices):
   - 针对此类查询的通用最佳实践列表（3-5 条）

**注意事项**:
- 考虑 ${database.toUpperCase()} 特有的优化技巧
- 避免过度优化，保持代码可读性
- 索引不是越多越好，权衡写入性能
- 如果原 SQL 已经很优秀，如实说明

请直接返回 JSON 格式，不要包含任何其他解释文字。`;

      const optimization = await aiService.generateObject(prompt, optimizationSchema, { temperature: 0.5 });
      setResult(optimization);

      setSnackbarMessage('性能分析完成！');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('优化失败:', error);
      setSnackbarMessage(`优化失败: ${error instanceof Error ? error.message : String(error)}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnackbarMessage('已复制到剪贴板');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage('复制失败');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const loadExample = () => {
    setSqlInput(`SELECT u.*, o.*, p.*
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
WHERE u.email LIKE '%@example.com'
  AND o.created_at > '2024-01-01'
ORDER BY o.created_at DESC;`);

    setTableSchema(`CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  order_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getSeverityIcon = (severity: PerformanceIssue['severity']) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon color="error" />;
      case 'high':
        return <Warning color="error" />;
      case 'medium':
        return <Warning color="warning" />;
      case 'low':
        return <Warning color="info" />;
    }
  };

  const getSeverityColor = (severity: PerformanceIssue['severity']) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
    }
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader
        title="SQL 性能优化"
        description="SQL 性能分析、索引推荐、执行计划解释"
        category="数据库工具"
      />

      <Box sx={{ mb: 3 }}>
        {/* 配置区 */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
            优化配置
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
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                待优化的 SQL 语句
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={12}
                value={sqlInput}
                onChange={(e) => setSqlInput(e.target.value)}
                placeholder="粘贴需要优化的 SQL 查询..."
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                  },
                  '& textarea': {
                    '&::-webkit-scrollbar': { width: '8px' },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
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
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                表结构信息（可选，建议提供）
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={12}
                value={tableSchema}
                onChange={(e) => setTableSchema(e.target.value)}
                placeholder="粘贴 CREATE TABLE 语句或表结构说明..."
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                  },
                  '& textarea': {
                    '&::-webkit-scrollbar': { width: '8px' },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
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
          </Grid>
        </Grid>

        {/* 操作按钮 */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Psychology />}
            onClick={handleOptimize}
            disabled={loading || !sqlInput.trim() || configs.length === 0}
          >
            {loading ? '分析中...' : 'AI 性能分析'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setSqlInput('');
              setTableSchema('');
              setResult(null);
            }}
          >
            清空
          </Button>
        </Box>

        {/* 加载指示器 */}
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* 结果区 */}
        {result && (
          <>
            {/* 性能评分 */}
            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Speed color="primary" />
                性能评分对比
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      原始评分
                    </Typography>
                    <Chip
                      label={`${result.originalScore} / 100`}
                      color={getScoreColor(result.originalScore)}
                      sx={{ fontSize: '1.2rem', height: 40, px: 2 }}
                    />
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={result.originalScore}
                        color={getScoreColor(result.originalScore)}
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                    <TrendingUp sx={{ fontSize: 48, color: 'success.main', mx: 'auto', mb: 1 }} />
                    <Typography variant="h5" color="success.main" fontWeight={600}>
                      +{result.improvement}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      预期提升
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      优化后评分
                    </Typography>
                    <Chip
                      label={`${result.optimizedScore} / 100`}
                      color={getScoreColor(result.optimizedScore)}
                      sx={{ fontSize: '1.2rem', height: 40, px: 2 }}
                    />
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={result.optimizedScore}
                        color={getScoreColor(result.optimizedScore)}
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* 优化后的 SQL */}
            <Paper sx={{ p: 3, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Code color="success" />
                  优化后的 SQL
                </Typography>
                <Button size="small" startIcon={<ContentCopy />} onClick={() => handleCopy(result.optimizedSql)}>
                  复制
                </Button>
              </Box>
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
                  borderColor: 'success.main',
                }}
              >
                {result.optimizedSql}
              </Box>
            </Paper>

            {/* 性能问题 */}
            {result.issues.length > 0 && (
              <Paper sx={{ p: 3, mb: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Warning color="warning" />
                  性能问题 ({result.issues.length})
                </Typography>
                <Stack spacing={2}>
                  {result.issues.map((issue, index) => (
                    <Card key={index} variant="outlined" sx={{ border: '2px solid', borderColor: `${getSeverityColor(issue.severity)}.main` }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                          {getSeverityIcon(issue.severity)}
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {issue.title}
                              </Typography>
                              <Chip label={issue.severity.toUpperCase()} size="small" color={getSeverityColor(issue.severity)} />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {issue.description}
                            </Typography>
                            <Alert severity="warning" icon={false} sx={{ mb: 1 }}>
                              <Typography variant="body2">
                                <strong>性能影响：</strong>
                                {issue.impact}
                              </Typography>
                            </Alert>
                            <Alert severity="success" icon={<Lightbulb />}>
                              <Typography variant="body2">
                                <strong>解决方案：</strong>
                                {issue.solution}
                              </Typography>
                            </Alert>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Paper>
            )}

            {/* 索引推荐 */}
            {result.indexRecommendations.length > 0 && (
              <Paper sx={{ p: 3, mb: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Storage color="primary" />
                  索引推荐 ({result.indexRecommendations.length})
                </Typography>
                <List>
                  {result.indexRecommendations.map((idx, index) => (
                    <React.Fragment key={index}>
                      <ListItem
                        sx={{
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          bgcolor: 'action.hover',
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {idx.table} 表
                          </Typography>
                          <Chip label={idx.type.toUpperCase()} size="small" color="primary" variant="outlined" />
                        </Box>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'background.paper', p: 1, borderRadius: 1, mb: 1, width: '100%' }}>
                          CREATE INDEX idx_{idx.table}_{idx.columns.join('_')} ON {idx.table} ({idx.columns.join(', ')});
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          <strong>推荐理由：</strong>
                          {idx.reason}
                        </Typography>
                        <Chip label={`预期提升: ${idx.estimatedImprovement}`} size="small" color="success" variant="outlined" />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            )}

            {/* 执行计划分析 */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Timeline />
                  执行计划分析
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {result.executionPlanAnalysis}
                </Typography>
              </AccordionDetails>
            </Accordion>

            {/* 最佳实践 */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle />
                  最佳实践建议
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {result.bestPractices.map((practice, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText primary={practice} />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          </>
        )}

        {/* 空状态 */}
        {!loading && !result && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Speed sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary" gutterBottom>
              输入 SQL 查询，AI 将为您分析性能并提供优化建议
            </Typography>
            <Typography variant="body2" color="text.secondary">
              提供表结构信息可以获得更准确的优化方案
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
              <li>提供完整的表结构信息，包括现有索引，可以获得更准确的优化建议</li>
              <li>AI 分析基于通用的 SQL 优化原则，实际效果需要在目标环境中测试验证</li>
              <li>索引不是越多越好，过多索引会影响写入性能，请根据实际情况选择</li>
              <li>优化后的 SQL 应该在测试环境充分测试后再应用到生产环境</li>
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

