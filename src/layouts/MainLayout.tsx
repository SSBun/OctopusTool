import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  useMediaQuery,
  useTheme,
  Collapse,
} from '@mui/material';
import {
  Home,
  Code,
  Transform,
  Lock,
  DataObject,
  Public,
  TextFields,
  VideoLibrary,
  AudioFile,
  Image,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './Header';

const drawerWidth = 240;

interface MainLayoutProps {
  onToggleTheme: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ onToggleTheme }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(true);
  const [mediaOpen, setMediaOpen] = useState(true);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleToolsToggle = () => {
    setToolsOpen(!toolsOpen);
  };

  const handleMediaToggle = () => {
    setMediaOpen(!mediaOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const toolCategories = [
    { label: 'JSON 工具', icon: <Code />, path: '/tools/json' },
    { label: '编码转换', icon: <Transform />, path: '/tools/encoding' },
    { label: '加密解密', icon: <Lock />, path: '/tools/crypto' },
    { label: '数据处理', icon: <DataObject />, path: '/tools/data' },
    { label: '网络工具', icon: <Public />, path: '/tools/network' },
    { label: '文本处理', icon: <TextFields />, path: '/tools/text' },
  ];

  const mediaCategories = [
    { label: '视频处理', icon: <VideoLibrary />, path: '/media/video' },
    { label: '音频处理', icon: <AudioFile />, path: '/media/audio' },
    { label: '图片处理', icon: <Image />, path: '/media/image' },
  ];

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {/* 首页 */}
        <ListItem disablePadding>
          <ListItemButton
            selected={location.pathname === '/'}
            onClick={() => handleNavigation('/')}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Home />
            </ListItemIcon>
            <ListItemText primary="首页" />
          </ListItemButton>
        </ListItem>

        {/* 工具分类 - 可折叠菜单 */}
        <ListItem disablePadding>
          <ListItemButton onClick={handleToolsToggle}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Code />
            </ListItemIcon>
            <ListItemText primary="开发工具" />
            {toolsOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        
        {/* 工具子菜单 */}
        <Collapse in={toolsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {toolCategories.map((category) => (
              <ListItemButton
                key={category.path}
                sx={{ pl: 4 }}
                selected={location.pathname === category.path}
                onClick={() => handleNavigation(category.path)}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {category.icon}
                </ListItemIcon>
                <ListItemText primary={category.label} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        {/* 音视频工具 - 可折叠菜单 */}
        <ListItem disablePadding>
          <ListItemButton onClick={handleMediaToggle}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <VideoLibrary />
            </ListItemIcon>
            <ListItemText primary="音视频工具" />
            {mediaOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        
        {/* 音视频子菜单 */}
        <Collapse in={mediaOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {mediaCategories.map((category) => (
              <ListItemButton
                key={category.path}
                sx={{ pl: 4 }}
                selected={location.pathname === category.path}
                onClick={() => handleNavigation(category.path)}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {category.icon}
                </ListItemIcon>
                <ListItemText primary={category.label} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <Header onToggleTheme={onToggleTheme} onToggleSidebar={handleDrawerToggle} />
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};
