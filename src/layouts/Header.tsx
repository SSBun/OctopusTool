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
} from '@mui/icons-material';
import { SearchDialog } from '../components/SearchDialog';

interface HeaderProps {
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleTheme, onToggleSidebar }) => {
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
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            🐙 Octopus Dev Tools
          </Typography>

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

            <IconButton onClick={onToggleTheme} color="inherit" aria-label="toggle theme">
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

