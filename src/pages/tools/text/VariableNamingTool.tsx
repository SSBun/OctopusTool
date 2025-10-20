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
} from '@mui/material';
import {
  ContentCopy,
  Refresh,
  Settings as SettingsIcon,
  CheckCircle,
  TrendingUp,
  Code,
  Psychology,
} from '@mui/icons-material';
import { useAIConfig } from '../../../contexts/AIConfigContext';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
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
  reasons: {
    clarity: string;
    convention: string;
    meaning: string;
  };
}

// AI 响应结构
const suggestionSchema = z.object({
  suggestions: z.array(
    z.object({
      name: z.string(),
      score: z.number().min(0).max(100),
      reasons: z.object({
        clarity: z.string(),
        convention: z.string(),
        meaning: z.string(),
      }),
    })
  ),
});

export const VariableNamingTool: React.FC = () => {
  const { config, isConfigured } = useAIConfig();
  const [description, setDescription] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [namingStyle, setNamingStyle] = useState('camelCase');
  const [nameLength, setNameLength] = useState('medium');
  const [useAbbreviation, setUseAbbreviation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<CandidateSuggestion[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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
3. 评分理由，包含三个维度：
   - clarity: 名称的清晰度和可读性
   - convention: 是否符合编程规范和最佳实践
   - meaning: 名称是否准确表达了变量的含义

请确保生成的变量名：
- 符合指定的命名风格
- 语义明确，见名知意
- 遵循编程最佳实践
- 避免过于通用或模糊的名称`;

      // 调用 AI SDK
      const { object } = await generateObject({
        model: openai(config.model, {
          baseURL: config.baseUrl,
          apiKey: config.apiKey,
        }),
        schema: suggestionSchema,
        prompt,
      });

      // 按分数排序
      const sortedSuggestions = object.suggestions.sort((a, b) => b.score - a.score);
      setSuggestions(sortedSuggestions);
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

            {/* 生成按钮 */}
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

              {suggestions.map((suggestion, index) => (
                <Card key={index} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" component="code" sx={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>
                            {suggestion.name}
                          </Typography>
                          {index === 0 && <Chip label="推荐" color="success" size="small" />}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={`评分: ${suggestion.score}`}
                            color={getScoreColor(suggestion.score) as 'success' | 'info' | 'warning' | 'error'}
                            size="small"
                          />
                          <LinearProgress
                            variant="determinate"
                            value={suggestion.score}
                            sx={{ flex: 1, height: 6, borderRadius: 3 }}
                            color={getScoreColor(suggestion.score) as 'success' | 'info' | 'warning' | 'error'}
                          />
                        </Box>
                      </Box>
                      <Tooltip title={copiedIndex === index ? '已复制!' : '复制'}>
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(suggestion.name, index)}
                          color={copiedIndex === index ? 'success' : 'default'}
                        >
                          {copiedIndex === index ? <CheckCircle /> : <ContentCopy />}
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          🔍 清晰度
                        </Typography>
                        <Typography variant="body2">{suggestion.reasons.clarity}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          📐 规范性
                        </Typography>
                        <Typography variant="body2">{suggestion.reasons.convention}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          💡 语义性
                        </Typography>
                        <Typography variant="body2">{suggestion.reasons.meaning}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Container>
  );
};

