import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Alert,
  Tooltip,
  Dialog as ConfirmDialog,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  Close,
  Add,
  Edit,
  Delete,
  CheckCircle,
  RadioButtonUnchecked,
  Storage,
  Key,
  Code,
} from '@mui/icons-material';
import { useAIConfig } from '../contexts/AIConfigContext';
import { AIConfigForm } from './AIConfigForm';
import { AIConfig, AIConfigFormData } from '../types/ai';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onClose }) => {
  const { configs, addConfig, updateConfig, deleteConfig, setActiveConfig } = useAIConfig();
  
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AIConfig | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<AIConfig | null>(null);

  const handleAddConfig = () => {
    setEditingConfig(null);
    setFormDialogOpen(true);
  };

  const handleEditConfig = (config: AIConfig) => {
    setEditingConfig(config);
    setFormDialogOpen(true);
  };

  const handleDeleteClick = (config: AIConfig) => {
    setConfigToDelete(config);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (configToDelete) {
      deleteConfig(configToDelete.id);
      setDeleteConfirmOpen(false);
      setConfigToDelete(null);
    }
  };

  const handleFormSubmit = (formData: AIConfigFormData) => {
    if (editingConfig) {
      // 更新现有配置
      updateConfig(editingConfig.id, formData);
    } else {
      // 添加新配置
      addConfig(formData);
    }
    setFormDialogOpen(false);
    setEditingConfig(null);
  };

  const handleFormCancel = () => {
    setFormDialogOpen(false);
    setEditingConfig(null);
  };

  const handleActivate = (config: AIConfig) => {
    setActiveConfig(config.id);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">AI 配置管理</Typography>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent
          sx={{
            // 自定义滚动条样式（主题适配）
            '&::-webkit-scrollbar': {
              width: '8px',
            },
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
          }}
        >
          <Box sx={{ py: 2 }}>
            {/* 说明 */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                配置多个 AI 模型，可在不同工具中灵活切换使用。所有配置数据安全地存储在本地浏览器中。
              </Typography>
            </Alert>

            {/* 添加按钮 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">配置列表</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddConfig}
              >
                添加配置
              </Button>
            </Box>

            {/* 配置列表 */}
            {configs.length === 0 ? (
              <Card variant="outlined" sx={{ textAlign: 'center', py: 6 }}>
                <Typography color="text.secondary" gutterBottom>
                  还没有配置
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  点击"添加配置"按钮创建第一个 AI 配置
                </Typography>
              </Card>
            ) : (
              <Stack spacing={2}>
                {configs.map((config) => (
                  <Card
                    key={config.id}
                    variant="outlined"
                    sx={{
                      borderColor: config.isActive ? 'primary.main' : undefined,
                      borderWidth: config.isActive ? 2 : 1,
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        {/* 左侧：配置信息 */}
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Storage fontSize="small" color="primary" />
                            <Typography variant="h6">
                              {config.name}
                            </Typography>
                            {config.isActive && (
                              <Chip label="激活" color="success" size="small" />
                            )}
                          </Box>

                          <Stack spacing={0.5}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                # {config.provider}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Code fontSize="small" sx={{ fontSize: 14 }} color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {config.model}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Key fontSize="small" sx={{ fontSize: 14 }} color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {config.apiKey ? `${config.apiKey.substring(0, 10)}...` : 'API key not configured'}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>

                        {/* 右侧：操作按钮 */}
                        <Stack direction="row" spacing={1}>
                          {!config.isActive && (
                            <Tooltip title="设为激活">
                              <IconButton
                                size="small"
                                onClick={() => handleActivate(config)}
                                color="default"
                              >
                                <RadioButtonUnchecked />
                              </IconButton>
                            </Tooltip>
                          )}
                          {config.isActive && (
                            <Tooltip title="当前激活">
                              <IconButton size="small" color="success" disabled>
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="编辑">
                            <IconButton
                              size="small"
                              onClick={() => handleEditConfig(config)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="删除">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(config)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* 添加/编辑配置对话框 */}
      <Dialog open={formDialogOpen} onClose={handleFormCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {editingConfig ? '编辑配置' : '添加新配置'}
            </Typography>
            <IconButton onClick={handleFormCancel} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <AIConfigForm
              initialData={editingConfig ? {
                name: editingConfig.name,
                provider: editingConfig.provider,
                apiKey: editingConfig.apiKey,
                baseUrl: editingConfig.baseUrl,
                model: editingConfig.model,
              } : undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              submitLabel={editingConfig ? '保存' : '添加'}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <ConfirmDialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            确定要删除配置 "<strong>{configToDelete?.name}</strong>" 吗？
            <br />
            此操作无法撤销。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>取消</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            删除
          </Button>
        </DialogActions>
      </ConfirmDialog>
    </>
  );
};
