import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  useTheme,
  Button,
  Chip,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Menu as MenuIcon,
  Search as SearchIcon,
  GitHub as GitHubIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { SearchDialog } from '../components/SearchDialog';

interface HeaderProps {
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleTheme, onToggleSidebar, onOpenSettings }) => {
  const theme = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);

  // 快捷键支持 Ctrl/Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          color: theme.palette.mode === 'dark' ? 'inherit' : 'text.primary',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onToggleSidebar}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
            <Box
              component="img"
              src={`${import.meta.env.BASE_URL}octopus.svg`}
              alt="Octopus Logo"
              sx={{
                width: 36,
                height: 36,
                display: 'inline-block',
                // 浮动动画
                animation: 'float 3s ease-in-out infinite',
                '@keyframes float': {
                  '0%, 100%': {
                    transform: 'translateY(0px)',
                  },
                  '50%': {
                    transform: 'translateY(-6px)',
                  },
                },
                // 悬停效果
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.15) rotate(5deg)',
                  animation: 'none', // 悬停时停止浮动
                  cursor: 'pointer',
                },
              }}
            />
            <Typography variant="h6" noWrap component="div">
              Octopus Dev Tools
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* 搜索按钮 */}
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={() => setSearchOpen(true)}
              sx={{
                color: 'inherit',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                display: { xs: 'none', sm: 'flex' },
                textTransform: 'none',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
              endIcon={
                <Chip
                  label="⌘K"
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    px: 0.5,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'inherit',
                    borderRadius: '4px',
                    '& .MuiChip-label': {
                      px: 0.75,
                      py: 0,
                    },
                  }}
                />
              }
            >
              搜索工具
            </Button>

            {/* 移动端搜索图标 */}
            <IconButton
              onClick={() => setSearchOpen(true)}
              color="inherit"
              sx={{ display: { xs: 'flex', sm: 'none' } }}
              aria-label="search"
            >
              <SearchIcon />
            </IconButton>

            {/* GitHub 图标 */}
            <IconButton
              onClick={() => window.open('https://github.com/SSBun/OctopusTool', '_blank')}
              color="inherit"
              sx={{ 
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
              aria-label="github repository"
            >
              <GitHubIcon />
            </IconButton>

            {/* 设置按钮 */}
            <IconButton 
              onClick={onOpenSettings} 
              color="inherit" 
              sx={{ 
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
              aria-label="settings"
            >
              <SettingsIcon />
            </IconButton>

            {/* 主题切换 */}
            <IconButton 
              onClick={onToggleTheme} 
              color="inherit" 
              sx={{ 
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
              aria-label="toggle theme"
            >
              {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 搜索对话框 */}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

