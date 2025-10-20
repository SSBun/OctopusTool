import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  LinearProgress,
  SelectChangeEvent,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Divider,
} from '@mui/material';
import {
  ContentCopy,
  Refresh,
  Settings as SettingsIcon,
  CheckCircle,
  TrendingUp,
  Code,
  Psychology,
  ExpandMore,
  History,
  Close,
  Delete,
  Translate,
} from '@mui/icons-material';
import { useAIConfig } from '../../../contexts/AIConfigContext';
import { createActiveAIService } from '../../../services/aiService';
import { z } from 'zod';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';

// 命名风格选项
const NAMING_STYLES = [
  { value: 'camelCase', label: '驼峰命名 (camelCase)' },
  { value: 'PascalCase', label: '帕斯卡命名 (PascalCase)' },
  { value: 'snake_case', label: '蛇形命名 (snake_case)' },
  { value: 'kebab-case', label: '短横线命名 (kebab-case)' },
  { value: 'UPPER_CASE', label: '全大写 (UPPER_CASE)' },
];

// 命名长度选项
const NAME_LENGTHS = [
  { value: 'short', label: '简短 (1-2 个单词)' },
  { value: 'medium', label: '中等 (2-3 个单词)' },
  { value: 'long', label: '详细 (3-5 个单词)' },
];

// 候选结果接口
interface CandidateSuggestion {
  name: string;
  score: number;
  wordBreakdown: {
    words: string[];        // 拆分的单词
    translations: string[]; // 对应的中文翻译
    explanation: string;    // 整体解释
  };
  reasons: {
    clarity: string;
    convention: string;
    meaning: string;
  };
}

// 历史记录接口
interface HistoryRecord {
  id: string;
  timestamp: number;
  description: string;
  additionalContext: string;
  namingStyle: string;
  nameLength: string;
  useAbbreviation: boolean;
  suggestions: CandidateSuggestion[];
}

// AI 响应结构
const suggestionSchema = z.object({
  suggestions: z.array(
    z.object({
      name: z.string(),
      score: z.number().min(0).max(100),
      wordBreakdown: z.object({
        words: z.array(z.string()),
        translations: z.array(z.string()),
        explanation: z.string(),
      }),
      reasons: z.object({
        clarity: z.string(),
        convention: z.string(),
        meaning: z.string(),
      }),
    })
  ),
});

// 历史记录存储 key
const HISTORY_STORAGE_KEY = 'variable-naming-history';
const MAX_HISTORY_ITEMS = 50; // 最多保存50条历史

// 历史记录工具函数
const loadHistory = (): HistoryRecord[] => {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
};

const saveHistory = (history: HistoryRecord[]) => {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save history:', error);
  }
};

const addHistoryRecord = (record: Omit<HistoryRecord, 'id' | 'timestamp'>) => {
  const history = loadHistory();
  const newRecord: HistoryRecord = {
    ...record,
    id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
    timestamp: Date.now(),
  };
  
  // 添加到开头，保持最新的在前面
  const updatedHistory = [newRecord, ...history].slice(0, MAX_HISTORY_ITEMS);
  saveHistory(updatedHistory);
  return newRecord;
};

export const VariableNamingTool: React.FC = () => {
  const { activeConfig, isConfigured } = useAIConfig();
  const [description, setDescription] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [namingStyle, setNamingStyle] = useState('camelCase');
  const [nameLength, setNameLength] = useState('medium');
  const [useAbbreviation, setUseAbbreviation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<CandidateSuggestion[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  // 历史记录相关状态
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>(loadHistory());

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('请输入变量描述');
      return;
    }

    if (!isConfigured) {
      setError('请先在设置中配置 AI API Key');
      return;
    }

    setLoading(true);
    setError('');
    setSuggestions([]);

    try {
      // 创建 AI 服务实例
      const aiService = createActiveAIService(activeConfig);
      if (!aiService) {
        setError('未找到激活的 AI 配置');
        return;
      }

      // 构建 prompt
      const prompt = `你是一个专业的变量命名助手。请根据以下要求生成 5 个变量名建议：

变量描述：${description}
${additionalContext ? `额外上下文：${additionalContext}` : ''}

命名要求：
- 命名风格：${namingStyle}
- 名称长度：${nameLength}
- ${useAbbreviation ? '可以使用常见缩写' : '尽量避免缩写，使用完整单词'}

对于每个建议，请提供：
1. 变量名
2. 综合评分 (0-100)
3. 单词拆分（wordBreakdown）：
   - words: 将变量名拆分成独立的单词数组（例如 getUserName -> ["get", "user", "name"]）
   - translations: 每个单词对应的中文翻译数组（例如 ["获取", "用户", "名称"]）
   - explanation: 整体含义的简短解释（例如 "获取用户名称的方法"）
4. 评分理由，包含三个维度：
   - clarity: 名称的清晰度和可读性
   - convention: 是否符合编程规范和最佳实践
   - meaning: 名称是否准确表达了变量的含义

请确保生成的变量名：
- 符合指定的命名风格
- 语义明确，见名知意
- 遵循编程最佳实践
- 避免过于通用或模糊的名称`;

      // 使用统一的 AI 服务调用
      const result = await aiService.generateObject(prompt, suggestionSchema);

      // 按分数排序
      const sortedSuggestions = result.suggestions.sort((a, b) => b.score - a.score);
      setSuggestions(sortedSuggestions);

      // 保存到历史记录
      addHistoryRecord({
        description,
        additionalContext,
        namingStyle,
        nameLength,
        useAbbreviation,
        suggestions: sortedSuggestions,
      });
      
      // 刷新历史记录列表
      setHistory(loadHistory());
    } catch (err) {
      console.error('AI 生成失败:', err);
      setError(err instanceof Error ? err.message : '生成失败，请检查配置或稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!additionalContext.trim()) {
      setError('请输入优化建议或额外上下文');
      return;
    }
    await handleGenerate();
  };

  const handleCopy = (name: string, index: number) => {
    navigator.clipboard.writeText(name);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'info';
    if (score >= 40) return 'warning';
    return 'error';
  };

  // 历史记录相关函数
  const handleLoadHistory = (record: HistoryRecord) => {
    setDescription(record.description);
    setAdditionalContext(record.additionalContext);
    setNamingStyle(record.namingStyle);
    setNameLength(record.nameLength);
    setUseAbbreviation(record.useAbbreviation);
    setSuggestions(record.suggestions);
    setHistoryDrawerOpen(false);
  };

  const handleDeleteHistory = (id: string) => {
    const updatedHistory = history.filter(h => h.id !== id);
    saveHistory(updatedHistory);
    setHistory(updatedHistory);
  };

  const handleClearHistory = () => {
    if (window.confirm('确定要清空所有历史记录吗？')) {
      saveHistory([]);
      setHistory([]);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // 小于1分钟
    if (diff < 60000) return '刚刚';
    // 小于1小时
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    // 小于1天
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    // 小于7天
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
    
    // 超过7天显示具体日期
    return date.toLocaleDateString('zh-CN', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader
        title="AI 变量命名助手"
        description="借助 AI 大语言模型生成专业的变量名建议，支持多种命名风格和自定义要求"
        toolPath="/tools/text/variable-naming"
      />

      {!isConfigured && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon fontSize="small" />
            <Typography>
              请先在左下角设置按钮中配置 AI API Key 才能使用此功能
            </Typography>
          </Box>
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* 左侧：配置面板 */}
        <Paper sx={{ p: 3, flex: '0 0 400px' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Code /> 配置选项
          </Typography>

          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* 变量描述 */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="变量描述"
              placeholder="例如：存储用户的登录状态"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              helperText="描述变量的用途和含义"
            />

            {/* 命名风格 */}
            <FormControl fullWidth>
              <InputLabel>命名风格</InputLabel>
              <Select
                value={namingStyle}
                label="命名风格"
                onChange={(e: SelectChangeEvent) => setNamingStyle(e.target.value)}
              >
                {NAMING_STYLES.map((style) => (
                  <MenuItem key={style.value} value={style.value}>
                    {style.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 名称长度 */}
            <FormControl fullWidth>
              <InputLabel>名称长度</InputLabel>
              <Select
                value={nameLength}
                label="名称长度"
                onChange={(e: SelectChangeEvent) => setNameLength(e.target.value)}
              >
                {NAME_LENGTHS.map((length) => (
                  <MenuItem key={length.value} value={length.value}>
                    {length.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 缩写选项 */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                缩写策略
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  label="完整单词"
                  color={!useAbbreviation ? 'primary' : 'default'}
                  onClick={() => setUseAbbreviation(false)}
                  sx={{ cursor: 'pointer' }}
                />
                <Chip
                  label="允许缩写"
                  color={useAbbreviation ? 'primary' : 'default'}
                  onClick={() => setUseAbbreviation(true)}
                  sx={{ cursor: 'pointer' }}
                />
              </Stack>
            </Box>

            {/* 生成按钮和历史记录按钮 */}
            <Stack direction="row" spacing={2}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleGenerate}
                disabled={loading || !isConfigured}
                startIcon={loading ? <CircularProgress size={20} /> : <Psychology />}
              >
                {loading ? '生成中...' : '生成建议'}
              </Button>
              <Tooltip title="查看历史记录">
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => setHistoryDrawerOpen(true)}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  <History />
                </Button>
              </Tooltip>
            </Stack>

            {/* 额外上下文 */}
            {suggestions.length > 0 && (
              <>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="优化建议"
                  placeholder="例如：更简短一些、更专业的术语"
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  helperText="基于当前结果提供进一步的优化要求"
                />
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleRefine}
                  disabled={loading}
                  startIcon={<Refresh />}
                >
                  重新生成
                </Button>
              </>
            )}
          </Stack>
        </Paper>

        {/* 右侧：结果展示 */}
        <Box sx={{ flex: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {loading && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress size={48} sx={{ mb: 2 }} />
              <Typography color="text.secondary">AI 正在生成建议...</Typography>
              <LinearProgress sx={{ mt: 2 }} />
            </Paper>
          )}

          {!loading && suggestions.length === 0 && !error && (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <Psychology sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                请配置选项并点击"生成建议"
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI 将为您生成专业的变量命名建议
              </Typography>
            </Paper>
          )}

          {!loading && suggestions.length > 0 && (
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">
                  生成 {suggestions.length} 个建议
                </Typography>
                <Chip icon={<TrendingUp />} label="按评分排序" size="small" />
              </Box>

              {suggestions.map((suggestion, index) => {
                const isExpanded = expandedIndex === index;
                return (
                  <Card key={index} variant="outlined">
                    <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                      {/* 主要信息 */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                        {/* 左侧：变量名和评分 */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography 
                              variant="h6" 
                              component="code" 
                              sx={{ 
                                fontFamily: 'monospace', 
                                fontSize: '1rem',
                                wordBreak: 'break-all',
                              }}
                            >
                              {suggestion.name}
                            </Typography>
                            {index === 0 && <Chip label="推荐" color="success" size="small" />}
                          </Box>
                          
                          {/* 评分条 - 更紧凑 */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={`${suggestion.score}`}
                              color={getScoreColor(suggestion.score) as 'success' | 'info' | 'warning' | 'error'}
                              size="small"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                            <LinearProgress
                              variant="determinate"
                              value={suggestion.score}
                              sx={{ flex: 1, height: 4, borderRadius: 2 }}
                              color={getScoreColor(suggestion.score) as 'success' | 'info' | 'warning' | 'error'}
                            />
                          </Box>
                        </Box>

                        {/* 右侧：操作按钮 */}
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title={copiedIndex === index ? '已复制!' : '复制'}>
                            <IconButton
                              size="small"
                              onClick={() => handleCopy(suggestion.name, index)}
                              color={copiedIndex === index ? 'success' : 'default'}
                            >
                              {copiedIndex === index ? <CheckCircle fontSize="small" /> : <ContentCopy fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={isExpanded ? '收起' : '查看理由'}>
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

                      {/* 评分理由 - 可折叠 */}
                      {isExpanded && (
                        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
                          <Stack spacing={1}>
                            {/* 单词拆分翻译 */}
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Translate sx={{ fontSize: '0.9rem' }} /> 单词拆分
                              </Typography>
                              <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {suggestion.wordBreakdown.words.map((word, idx) => (
                                  <Chip
                                    key={idx}
                                    label={`${word} → ${suggestion.wordBreakdown.translations[idx]}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.75rem', height: 22 }}
                                  />
                                ))}
                              </Box>
                              <Typography variant="body2" sx={{ fontSize: '0.8rem', mt: 0.5, color: 'text.secondary', fontStyle: 'italic' }}>
                                {suggestion.wordBreakdown.explanation}
                              </Typography>
                            </Box>
                            
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.7rem' }}>
                                🔍 清晰度
                              </Typography>
                              <Typography variant="body2" sx={{ fontSize: '0.85rem', mt: 0.25 }}>
                                {suggestion.reasons.clarity}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.7rem' }}>
                                📐 规范性
                              </Typography>
                              <Typography variant="body2" sx={{ fontSize: '0.85rem', mt: 0.25 }}>
                                {suggestion.reasons.convention}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.7rem' }}>
                                💡 语义性
                              </Typography>
                              <Typography variant="body2" sx={{ fontSize: '0.85rem', mt: 0.25 }}>
                                {suggestion.reasons.meaning}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Box>
      </Box>

      {/* 历史记录抽屉 */}
      <Drawer
        anchor="right"
        open={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 } },
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* 标题栏 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">历史记录</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {history.length > 0 && (
                <Tooltip title="清空历史">
                  <IconButton size="small" onClick={handleClearHistory} color="error">
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <IconButton size="small" onClick={() => setHistoryDrawerOpen(false)}>
                <Close fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* 历史记录列表 */}
          {history.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <History sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">暂无历史记录</Typography>
              <Typography variant="body2" color="text.secondary">
                生成变量名后会自动保存
              </Typography>
            </Box>
          ) : (
            <List sx={{ 
              px: 0,
              '&::-webkit-scrollbar': { width: '8px' },
              '&::-webkit-scrollbar-track': {
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.05)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.15)' 
                  : 'rgba(0, 0, 0, 0.15)',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.25)' 
                    : 'rgba(0, 0, 0, 0.25)',
                },
              },
            }}>
              {history.map((record, index) => (
                <React.Fragment key={record.id}>
                  <ListItem disablePadding>
                    <ListItemButton 
                      onClick={() => handleLoadHistory(record)}
                      sx={{ 
                        flexDirection: 'column', 
                        alignItems: 'flex-start',
                        py: 1.5,
                      }}
                    >
                      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 600,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {record.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(record.timestamp)}
                          </Typography>
                        </Box>
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
                      
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                        <Chip label={record.namingStyle} size="small" sx={{ fontSize: '0.7rem', height: 20 }} />
                        <Chip label={`${record.suggestions.length} 个建议`} size="small" sx={{ fontSize: '0.7rem', height: 20 }} />
                      </Box>
                      
                      {record.suggestions.length > 0 && (
                        <Box sx={{ mt: 1, width: '100%' }}>
                          <Typography variant="caption" color="text.secondary">
                            最佳建议:
                          </Typography>
                          <Typography 
                            variant="body2" 
                            component="code"
                            sx={{ 
                              fontFamily: 'monospace',
                              fontSize: '0.85rem',
                              display: 'block',
                              mt: 0.25,
                              p: 0.5,
                              bgcolor: 'action.hover',
                              borderRadius: 0.5,
                            }}
                          >
                            {record.suggestions[0].name}
                          </Typography>
                        </Box>
                      )}
                    </ListItemButton>
                  </ListItem>
                  {index < history.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Drawer>
    </Container>
  );
};

