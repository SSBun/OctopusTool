import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  Box,
  Chip,
  Typography,
  Divider,
} from '@mui/material';
import { Search, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ALL_TOOLS } from '../data/allTools';

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({ open, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  // 模糊搜索（只显示可用的工具）
  const searchResults = useMemo(() => {
    const availableTools = ALL_TOOLS.filter((tool) => tool.status === '可用');
    
    if (!searchQuery.trim()) return availableTools;

    const query = searchQuery.toLowerCase();
    return availableTools.filter((tool) => {
      const nameMatch = tool.title.toLowerCase().includes(query);
      const descMatch = tool.description.toLowerCase().includes(query);
      const categoryMatch = tool.category?.toLowerCase().includes(query);
      return nameMatch || descMatch || categoryMatch;
    });
  }, [searchQuery]);

  // 重置选中索引
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // 重置搜索
  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && searchResults[selectedIndex]) {
      handleNavigate(searchResults[selectedIndex].path);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          position: 'fixed',
          top: 100,
          m: 0,
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <TextField
          fullWidth
          autoFocus
          placeholder="搜索工具... (支持工具名称、描述、分类)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                border: 'none',
              },
            },
            '& input': {
              fontSize: '1.1rem',
              py: 2,
            },
          }}
        />

        <Divider />

        {searchResults.length > 0 ? (
          <List sx={{ maxHeight: 400, overflow: 'auto', py: 1 }}>
            {searchResults.map((tool, index) => (
              <ListItem key={tool.path} disablePadding>
                <ListItemButton
                  selected={index === selectedIndex}
                  onClick={() => handleNavigate(tool.path)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '& .MuiChip-root': {
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'inherit',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', '& svg': { fontSize: 24 } }}>
                      {tool.icon}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" fontWeight={600}>
                          {tool.title}
                        </Typography>
                        {tool.category && <Chip label={tool.category} size="small" />}
                      </Box>
                    }
                    secondary={tool.description}
                    secondaryTypographyProps={{
                      sx: {
                        color: index === selectedIndex ? 'inherit' : 'text.secondary',
                        opacity: index === selectedIndex ? 0.9 : 1,
                      },
                    }}
                  />
                  <ListItemIcon sx={{ minWidth: 30, justifyContent: 'flex-end' }}>
                    <ArrowForward fontSize="small" />
                  </ListItemIcon>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">未找到匹配的工具</Typography>
            <Typography variant="caption" color="text.secondary">
              尝试使用其他关键词搜索
            </Typography>
          </Box>
        )}

        <Divider />

        <Box sx={{ p: 1.5, bgcolor: 'background.default', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary">
            <kbd style={{ padding: '2px 6px', borderRadius: '3px', background: 'rgba(0,0,0,0.1)' }}>↑↓</kbd> 导航
          </Typography>
          <Typography variant="caption" color="text.secondary">
            <kbd style={{ padding: '2px 6px', borderRadius: '3px', background: 'rgba(0,0,0,0.1)' }}>Enter</kbd> 选择
          </Typography>
          <Typography variant="caption" color="text.secondary">
            <kbd style={{ padding: '2px 6px', borderRadius: '3px', background: 'rgba(0,0,0,0.1)' }}>Esc</kbd> 关闭
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
