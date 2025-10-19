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
  const [developmentOpen, setDevelopmentOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [dataOpen, setDataOpen] = useState(false);
  const [networkOpen, setNetworkOpen] = useState(false);
  const [textOpen, setTextOpen] = useState(false);
  const [documentOpen, setDocumentOpen] = useState(false);
  const [designOpen, setDesignOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDevelopmentToggle = () => {
    setDevelopmentOpen(!developmentOpen);
  };

  const handleSecurityToggle = () => {
    setSecurityOpen(!securityOpen);
  };

  const handleDataToggle = () => {
    setDataOpen(!dataOpen);
  };

  const handleNetworkToggle = () => {
    setNetworkOpen(!networkOpen);
  };

  const handleTextToggle = () => {
    setTextOpen(!textOpen);
  };

  const handleDocumentToggle = () => {
    setDocumentOpen(!documentOpen);
  };

  const handleDesignToggle = () => {
    setDesignOpen(!designOpen);
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

  // 编程开发
  const developmentCategories = [
    { label: 'JSON 工具', icon: <Code />, path: '/tools/json' },
    { label: '代码格式化', icon: <DataObject />, path: '/tools/dev/format' },
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
    { label: 'HTTP 工具', icon: <Http />, path: '/tools/network/http' },
    { label: 'URL 工具', icon: <Link />, path: '/tools/network/url' },
    { label: '网络诊断', icon: <NetworkCheck />, path: '/tools/network/diagnostic' },
    { label: '网络参考', icon: <Info />, path: '/tools/network/reference' },
  ];

  // 文本处理
  const textCategories = [
    { label: '文本编辑', icon: <Edit />, path: '/tools/text/edit' },
    { label: '文本分析', icon: <Analytics />, path: '/tools/text/analysis' },
    { label: '随机生成', icon: <Casino />, path: '/tools/text/generate' },
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
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              // 美化滚动条
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: (theme) => 
                  theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.2)' 
                    : 'rgba(0, 0, 0, 0.2)',
                borderRadius: '4px',
                transition: 'background-color 0.3s ease',
                '&:hover': {
                  backgroundColor: (theme) => 
                    theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.3)' 
                      : 'rgba(0, 0, 0, 0.3)',
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
              // 美化滚动条
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: (theme) => 
                  theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.2)' 
                    : 'rgba(0, 0, 0, 0.2)',
                borderRadius: '4px',
                transition: 'background-color 0.3s ease',
                '&:hover': {
                  backgroundColor: (theme) => 
                    theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.3)' 
                      : 'rgba(0, 0, 0, 0.3)',
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
          // 美化主内容区域滚动条
          '&::-webkit-scrollbar': {
            width: '10px',
            height: '10px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: (theme) => 
              theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.2)' 
                : 'rgba(0, 0, 0, 0.2)',
            borderRadius: '5px',
            transition: 'background-color 0.3s ease',
            '&:hover': {
              backgroundColor: (theme) => 
                theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.3)' 
                  : 'rgba(0, 0, 0, 0.3)',
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
