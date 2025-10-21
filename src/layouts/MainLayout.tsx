import React, { useState, useEffect } from 'react';
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
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Home,
  Star,
  Code,
  Lock,
  DataObject,
  Public,
  TextFields,
  Description,
  Image,
  VideoLibrary,
  AudioFile,
  PermMedia,
  Schedule,
  Pattern,
  QrCode2,
  ColorLens,
  Http,
  Link,
  NetworkCheck,
  Info,
  Edit,
  Analytics,
  Casino,
  ExpandLess,
  ExpandMore,
  PictureAsPdf,
  Sync,
  Palette,
  SwapHoriz as SwapHorizIcon,
  Settings,
  Storage,
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { SettingsDialog } from '../components/SettingsDialog';

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
  const [settingsOpen, setSettingsOpen] = useState(false);

  // 从 localStorage 读取初始状态
  const getStoredState = (key: string, defaultValue: boolean = false): boolean => {
    try {
      const stored = localStorage.getItem(`nav-${key}`);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [developmentOpen, setDevelopmentOpen] = useState(() => getStoredState('development'));
  const [databaseOpen, setDatabaseOpen] = useState(() => getStoredState('database'));
  const [securityOpen, setSecurityOpen] = useState(() => getStoredState('security'));
  const [dataOpen, setDataOpen] = useState(() => getStoredState('data'));
  const [networkOpen, setNetworkOpen] = useState(() => getStoredState('network'));
  const [textOpen, setTextOpen] = useState(() => getStoredState('text'));
  const [documentOpen, setDocumentOpen] = useState(() => getStoredState('document'));
  const [designOpen, setDesignOpen] = useState(() => getStoredState('design'));
  const [mediaOpen, setMediaOpen] = useState(() => getStoredState('media'));

  // 保存状态到 localStorage
  const saveState = (key: string, value: boolean) => {
    try {
      localStorage.setItem(`nav-${key}`, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save navigation state:', error);
    }
  };

  // 根据当前路由自动展开相应分类
  useEffect(() => {
    const path = location.pathname;
    
    if (path.startsWith('/tools/json') || path.startsWith('/tools/dev/format')) {
      setDevelopmentOpen(true);
      saveState('development', true);
    } else if (path.startsWith('/tools/database/')) {
      setDatabaseOpen(true);
      saveState('database', true);
    } else if (path.startsWith('/tools/crypto') || path.startsWith('/tools/encoding')) {
      setSecurityOpen(true);
      saveState('security', true);
    } else if (path.startsWith('/tools/data/')) {
      setDataOpen(true);
      saveState('data', true);
    } else if (path.startsWith('/tools/network/')) {
      setNetworkOpen(true);
      saveState('network', true);
    } else if (path.startsWith('/tools/text/')) {
      setTextOpen(true);
      saveState('text', true);
    } else if (path.startsWith('/tools/pdf') || path.startsWith('/tools/document/')) {
      setDocumentOpen(true);
      saveState('document', true);
    } else if (path.startsWith('/tools/design/')) {
      setDesignOpen(true);
      saveState('design', true);
    } else if (path.startsWith('/media/')) {
      setMediaOpen(true);
      saveState('media', true);
    }
  }, [location.pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDevelopmentToggle = () => {
    const newState = !developmentOpen;
    setDevelopmentOpen(newState);
    saveState('development', newState);
  };

  const handleDatabaseToggle = () => {
    const newState = !databaseOpen;
    setDatabaseOpen(newState);
    saveState('database', newState);
  };

  const handleSecurityToggle = () => {
    const newState = !securityOpen;
    setSecurityOpen(newState);
    saveState('security', newState);
  };

  const handleDataToggle = () => {
    const newState = !dataOpen;
    setDataOpen(newState);
    saveState('data', newState);
  };

  const handleNetworkToggle = () => {
    const newState = !networkOpen;
    setNetworkOpen(newState);
    saveState('network', newState);
  };

  const handleTextToggle = () => {
    const newState = !textOpen;
    setTextOpen(newState);
    saveState('text', newState);
  };

  const handleDocumentToggle = () => {
    const newState = !documentOpen;
    setDocumentOpen(newState);
    saveState('document', newState);
  };

  const handleDesignToggle = () => {
    const newState = !designOpen;
    setDesignOpen(newState);
    saveState('design', newState);
  };

  const handleMediaToggle = () => {
    const newState = !mediaOpen;
    setMediaOpen(newState);
    saveState('media', newState);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // 编程开发
  const developmentCategories = [
    { label: 'JSON 工具', icon: <Code />, path: '/tools/json' },
    { label: '代码格式化', icon: <DataObject />, path: '/tools/dev/format' },
    { label: '数据库工具', icon: <Storage />, path: '/tools/database' },
  ];

  // 加密安全
  const securityCategories = [
    { label: '加密解密', icon: <Lock />, path: '/tools/crypto' },
    { label: '编码转换', icon: <Sync />, path: '/tools/encoding' },
  ];

  // 数据处理
  const dataCategories = [
    { label: '时间日期', icon: <Schedule />, path: '/tools/data/time' },
    { label: '数据转换', icon: <SwapHorizIcon />, path: '/tools/data/convert' },
    { label: '正则工具', icon: <Pattern />, path: '/tools/data/regex' },
    { label: '二维码工具', icon: <QrCode2 />, path: '/tools/data/qrcode' },
    { label: '开发工具', icon: <Code />, path: '/tools/data/dev' },
  ];

  // 网络工具
  const networkCategories = [
    { label: '请求测试', icon: <Http />, path: '/tools/network/http' },
    { label: 'URL 工具', icon: <Link />, path: '/tools/network/url' },
    { label: '网络诊断', icon: <NetworkCheck />, path: '/tools/network/diagnostic' },
    { label: '网络参考', icon: <Info />, path: '/tools/network/reference' },
  ];

  // 文本处理
  const textCategories = [
    { label: '文本编辑', icon: <Edit />, path: '/tools/text/edit' },
    { label: '文本分析', icon: <Analytics />, path: '/tools/text/analysis' },
    { label: '文本生成', icon: <Casino />, path: '/tools/text/generate' },
  ];

  // 文档工具
  const documentCategories = [
    { label: 'PDF 工具', icon: <PictureAsPdf />, path: '/tools/pdf' },
    { label: '文件转换', icon: <SwapHorizIcon />, path: '/tools/document/convert' },
  ];

  // 设计工具
  const designCategories = [
    { label: '颜色工具', icon: <ColorLens />, path: '/tools/design/color' },
    { label: 'CSS 工具', icon: <Palette />, path: '/tools/design/css' },
  ];

  // 媒体工具
  const mediaCategories = [
    { label: '图片处理', icon: <Image />, path: '/media/image' },
    { label: '视频处理', icon: <VideoLibrary />, path: '/media/video' },
    { label: '音频处理', icon: <AudioFile />, path: '/media/audio' },
  ];

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar />
      <List 
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto',
          // 自定义滚动条样式（主题适配 - 低调版）
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: (theme) => theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.03)' 
              : 'rgba(0, 0, 0, 0.03)',
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

        {/* 我的收藏 */}
        <ListItem disablePadding>
          <ListItemButton
            selected={location.pathname === '/favorites'}
            onClick={() => handleNavigation('/favorites')}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Star sx={{ color: location.pathname === '/favorites' ? 'warning.main' : 'inherit' }} />
            </ListItemIcon>
            <ListItemText primary="我的收藏" />
          </ListItemButton>
        </ListItem>

        {/* 编程开发 */}
        <ListItem disablePadding>
          <ListItemButton onClick={handleDevelopmentToggle}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Code />
            </ListItemIcon>
            <ListItemText primary="编程开发" />
            {developmentOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={developmentOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {developmentCategories.map((category) => (
              <ListItemButton
                key={category.path}
                sx={{ 
                  pl: 5,
                  py: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                  },
                  '&.Mui-selected': {
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                    '&:hover': {
                      color: 'primary.dark',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.dark',
                      },
                    },
                  },
                }}
                selected={location.pathname === category.path}
                onClick={() => handleNavigation(category.path)}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {category.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={category.label}
                  primaryTypographyProps={{ 
                    fontSize: '0.875rem',
                    fontWeight: location.pathname === category.path ? 600 : 400,
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        {/* 加密安全 */}
        <ListItem disablePadding>
          <ListItemButton onClick={handleSecurityToggle}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Lock />
            </ListItemIcon>
            <ListItemText primary="加密安全" />
            {securityOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={securityOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {securityCategories.map((category) => (
              <ListItemButton
                key={category.path}
                sx={{ 
                  pl: 5,
                  py: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                  },
                  '&.Mui-selected': {
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                    '&:hover': {
                      color: 'primary.dark',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.dark',
                      },
                    },
                  },
                }}
                selected={location.pathname === category.path}
                onClick={() => handleNavigation(category.path)}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {category.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={category.label}
                  primaryTypographyProps={{ 
                    fontSize: '0.875rem',
                    fontWeight: location.pathname === category.path ? 600 : 400,
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        {/* 数据处理 */}
        <ListItem disablePadding>
          <ListItemButton onClick={handleDataToggle}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <DataObject />
            </ListItemIcon>
            <ListItemText primary="数据处理" />
            {dataOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={dataOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {dataCategories.map((category) => (
              <ListItemButton
                key={category.path}
                sx={{ 
                  pl: 5,
                  py: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                  },
                  '&.Mui-selected': {
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                    '&:hover': {
                      color: 'primary.dark',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.dark',
                      },
                    },
                  },
                }}
                selected={location.pathname === category.path}
                onClick={() => handleNavigation(category.path)}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {category.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={category.label}
                  primaryTypographyProps={{ 
                    fontSize: '0.875rem',
                    fontWeight: location.pathname === category.path ? 600 : 400,
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        {/* 网络工具 */}
        <ListItem disablePadding>
          <ListItemButton onClick={handleNetworkToggle}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Public />
            </ListItemIcon>
            <ListItemText primary="网络工具" />
            {networkOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={networkOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {networkCategories.map((category) => (
              <ListItemButton
                key={category.path}
                sx={{ 
                  pl: 5,
                  py: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                  },
                  '&.Mui-selected': {
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                    '&:hover': {
                      color: 'primary.dark',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.dark',
                      },
                    },
                  },
                }}
                selected={location.pathname === category.path}
                onClick={() => handleNavigation(category.path)}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {category.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={category.label}
                  primaryTypographyProps={{ 
                    fontSize: '0.875rem',
                    fontWeight: location.pathname === category.path ? 600 : 400,
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        {/* 文本处理 */}
        <ListItem disablePadding>
          <ListItemButton onClick={handleTextToggle}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <TextFields />
            </ListItemIcon>
            <ListItemText primary="文本处理" />
            {textOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={textOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {textCategories.map((category) => (
              <ListItemButton
                key={category.path}
                sx={{ 
                  pl: 5,
                  py: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                  },
                  '&.Mui-selected': {
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                    '&:hover': {
                      color: 'primary.dark',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.dark',
                      },
                    },
                  },
                }}
                selected={location.pathname === category.path}
                onClick={() => handleNavigation(category.path)}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {category.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={category.label}
                  primaryTypographyProps={{ 
                    fontSize: '0.875rem',
                    fontWeight: location.pathname === category.path ? 600 : 400,
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        {/* 文档工具 */}
        <ListItem disablePadding>
          <ListItemButton onClick={handleDocumentToggle}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Description />
            </ListItemIcon>
            <ListItemText primary="文档工具" />
            {documentOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={documentOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {documentCategories.map((category) => (
              <ListItemButton
                key={category.path}
                sx={{ 
                  pl: 5,
                  py: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                  },
                  '&.Mui-selected': {
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                    '&:hover': {
                      color: 'primary.dark',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.dark',
                      },
                    },
                  },
                }}
                selected={location.pathname === category.path}
                onClick={() => handleNavigation(category.path)}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {category.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={category.label}
                  primaryTypographyProps={{ 
                    fontSize: '0.875rem',
                    fontWeight: location.pathname === category.path ? 600 : 400,
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        {/* 设计工具 */}
        <ListItem disablePadding>
          <ListItemButton onClick={handleDesignToggle}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Palette />
            </ListItemIcon>
            <ListItemText primary="设计工具" />
            {designOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={designOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {designCategories.map((category) => (
              <ListItemButton
                key={category.path}
                sx={{ 
                  pl: 5,
                  py: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                  },
                  '&.Mui-selected': {
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                    '&:hover': {
                      color: 'primary.dark',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.dark',
                      },
                    },
                  },
                }}
                selected={location.pathname === category.path}
                onClick={() => handleNavigation(category.path)}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {category.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={category.label}
                  primaryTypographyProps={{ 
                    fontSize: '0.875rem',
                    fontWeight: location.pathname === category.path ? 600 : 400,
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        {/* 媒体工具 */}
        <ListItem disablePadding>
          <ListItemButton onClick={handleMediaToggle}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <PermMedia />
            </ListItemIcon>
            <ListItemText primary="媒体工具" />
            {mediaOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={mediaOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {mediaCategories.map((category) => (
              <ListItemButton
                key={category.path}
                sx={{ 
                  pl: 5,
                  py: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                  },
                  '&.Mui-selected': {
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                    '&:hover': {
                      color: 'primary.dark',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.dark',
                      },
                    },
                  },
                }}
                selected={location.pathname === category.path}
                onClick={() => handleNavigation(category.path)}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {category.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={category.label}
                  primaryTypographyProps={{ 
                    fontSize: '0.875rem',
                    fontWeight: location.pathname === category.path ? 600 : 400,
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <Header 
        onToggleTheme={onToggleTheme} 
        onToggleSidebar={handleDrawerToggle}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      
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
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
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
                backgroundColor: (theme) => theme.palette.primary.main,
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.primary.dark,
                },
              },
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
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
                backgroundColor: (theme) => theme.palette.primary.main,
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.primary.dark,
                },
              },
            },
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
          // 自定义滚动条样式（主题适配）
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: (theme) => theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.05)' 
              : 'rgba(0, 0, 0, 0.05)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: (theme) => theme.palette.primary.main,
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: (theme) => theme.palette.primary.dark,
            },
          },
          '&::-webkit-scrollbar-corner': {
            backgroundColor: 'transparent',
          },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};
