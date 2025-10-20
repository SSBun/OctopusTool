import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Close, Visibility, VisibilityOff, CheckCircle } from '@mui/icons-material';
import { useAIConfig } from '../contexts/AIConfigContext';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onClose }) => {
  const { config, updateConfig, isConfigured } = useAIConfig();
  const [currentTab, setCurrentTab] = useState(0);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState(config);

  // 当对话框打开时，重置表单数据
  useEffect(() => {
    if (open) {
      setFormData(config);
      setSaveSuccess(false);
    }
  }, [open, config]);

  const handleSave = () => {
    updateConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1500);
  };

  const handleReset = () => {
    setFormData({
      provider: 'openai',
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4o-mini',
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">设置</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)} sx={{ mb: 3 }}>
          <Tab label="AI 配置" />
          <Tab label="通用" disabled />
        </Tabs>

        {currentTab === 0 && (
          <Box sx={{ py: 2 }}>
            {/* AI 配置 Tab */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3 }}>
              配置 AI 服务以启用智能功能（变量命名、代码生成等）
            </Typography>

            {!isConfigured && !formData.apiKey && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                请配置 API Key 以使用 AI 功能
              </Alert>
            )}

            {saveSuccess && (
              <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
                配置已保存成功！
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Provider 选择 */}
              <FormControl fullWidth>
                <InputLabel>AI 服务商</InputLabel>
                <Select
                  value={formData.provider}
                  label="AI 服务商"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      provider: e.target.value as 'openai' | 'custom',
                    })
                  }
                >
                  <MenuItem value="openai">OpenAI</MenuItem>
                  <MenuItem value="custom">自定义</MenuItem>
                </Select>
              </FormControl>

              {/* Base URL */}
              <TextField
                fullWidth
                label="Base URL"
                value={formData.baseUrl}
                onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                placeholder="https://api.openai.com/v1"
                helperText="API 的基础 URL，支持 OpenAI 兼容的服务"
              />

              {/* API Key */}
              <TextField
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

              {/* Model */}
              <TextField
                fullWidth
                label="模型"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="gpt-4o-mini"
                helperText="使用的模型名称，如 gpt-4o-mini, gpt-4o, gpt-3.5-turbo 等"
              />

              {/* 提示信息 */}
              <Alert severity="info">
                <Typography variant="body2">
                  💡 <strong>提示：</strong>您可以使用 OpenAI 或任何兼容 OpenAI API 的服务（如
                  Azure OpenAI、本地部署的模型等）
                </Typography>
              </Alert>
            </Box>

            {/* 操作按钮 */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
              <Button onClick={handleReset} variant="outlined" color="inherit">
                重置
              </Button>
              <Button onClick={onClose} variant="outlined">
                取消
              </Button>
              <Button onClick={handleSave} variant="contained">
                保存配置
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

