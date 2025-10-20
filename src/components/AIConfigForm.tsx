import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  SelectChangeEvent,
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { AIProvider, AIConfigFormData, DEFAULT_CONFIGS, AITestResult } from '../types/ai';
import { createAIService } from '../services/aiService';

interface AIConfigFormProps {
  initialData?: Partial<AIConfigFormData>;
  onSubmit: (data: AIConfigFormData) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export const AIConfigForm: React.FC<AIConfigFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = '保存',
}) => {
  const [formData, setFormData] = useState<AIConfigFormData>({
    name: initialData?.name || '',
    provider: initialData?.provider || 'openai',
    apiKey: initialData?.apiKey || '',
    baseUrl: initialData?.baseUrl || DEFAULT_CONFIGS.openai.baseUrl!,
    model: initialData?.model || DEFAULT_CONFIGS.openai.model!,
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [testResult, setTestResult] = useState<AITestResult | null>(null);
  const [testing, setTesting] = useState(false);

  const handleProviderChange = (e: SelectChangeEvent) => {
    const provider = e.target.value as AIProvider;
    const defaults = DEFAULT_CONFIGS[provider];
    
    setFormData({
      ...formData,
      provider,
      baseUrl: defaults.baseUrl || '',
      model: defaults.model || '',
    });
  };

  const handleTest = async () => {
    // 验证必填字段
    if (!formData.apiKey || !formData.baseUrl || !formData.model) {
      setTestResult({
        success: false,
        message: '请填写完整的配置信息',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const testConfig = {
        id: 'test',
        ...formData,
        isActive: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const service = createAIService(testConfig);
      const result = await service.testConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : '测试失败',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证
    if (!formData.name.trim()) {
      setTestResult({ success: false, message: '请输入配置名称' });
      return;
    }
    if (!formData.apiKey.trim()) {
      setTestResult({ success: false, message: '请输入 API Key' });
      return;
    }
    if (!formData.baseUrl.trim()) {
      setTestResult({ success: false, message: '请输入 Base URL' });
      return;
    }
    if (!formData.model.trim()) {
      setTestResult({ success: false, message: '请输入模型名称' });
      return;
    }

    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        {/* 配置名称 */}
        <TextField
          required
          fullWidth
          label="配置名称"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="例如: OpenAI GPT-4"
          helperText="为这个配置取一个易于识别的名称"
        />

        {/* 服务提供商 */}
        <FormControl fullWidth>
          <InputLabel>服务提供商</InputLabel>
          <Select
            value={formData.provider}
            label="服务提供商"
            onChange={handleProviderChange}
          >
            <MenuItem value="openai">OpenAI</MenuItem>
            <MenuItem value="azure">Azure OpenAI</MenuItem>
            <MenuItem value="anthropic">Anthropic Claude</MenuItem>
            <MenuItem value="custom">自定义</MenuItem>
          </Select>
        </FormControl>

        {/* Base URL */}
        <TextField
          required
          fullWidth
          label="API Base URL"
          value={formData.baseUrl}
          onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
          placeholder="https://api.openai.com/v1"
          helperText="API 的基础 URL"
        />

        {/* API Key */}
        <TextField
          required
          fullWidth
          label="API Key"
          type={showApiKey ? 'text' : 'password'}
          value={formData.apiKey}
          onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
          placeholder="sk-..."
          helperText="您的 API 密钥将安全地存储在本地浏览器中"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowApiKey(!showApiKey)}
                  edge="end"
                  size="small"
                >
                  {showApiKey ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* 模型名称 */}
        <TextField
          required
          fullWidth
          label="模型名称"
          value={formData.model}
          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          placeholder="gpt-4o-mini"
          helperText="使用的模型名称"
        />

        {/* 测试结果 */}
        {testResult && (
          <Alert 
            severity={testResult.success ? 'success' : 'error'}
            icon={testResult.success ? <CheckCircle /> : <ErrorIcon />}
          >
            {testResult.message}
          </Alert>
        )}

        {/* 操作按钮 */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={onCancel} variant="outlined" color="inherit">
            取消
          </Button>
          <Button
            onClick={handleTest}
            variant="outlined"
            disabled={testing}
            startIcon={testing ? <CircularProgress size={16} /> : undefined}
          >
            {testing ? '测试中...' : '测试连接'}
          </Button>
          <Button type="submit" variant="contained">
            {submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

