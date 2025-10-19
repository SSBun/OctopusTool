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

interface Tool {
  name: string;
  description: string;
  path: string;
  category: string;
  icon: string;
}

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

// 所有工具的数据
const ALL_TOOLS: Tool[] = [
  // 编程开发
  { name: 'JSON 格式化', description: '格式化和美化 JSON 数据', path: '/tools/json/formatter', category: '编程开发', icon: '📝' },
  { name: 'JSON 压缩', description: '压缩 JSON 数据，移除空格和换行', path: '/tools/json/minify', category: '编程开发', icon: '🗜️' },
  { name: 'JSON 验证', description: '验证 JSON 格式并显示详细信息', path: '/tools/json/validator', category: '编程开发', icon: '✅' },
  
  // 加密安全
  { name: 'MD5 加密', description: '计算文本的 MD5 哈希值', path: '/tools/crypto/md5', category: '加密安全', icon: '🔐' },
  { name: 'SHA 系列', description: 'SHA-1, SHA-256, SHA-384, SHA-512 哈希', path: '/tools/crypto/hash', category: '加密安全', icon: '🛡️' },
  { name: 'AES 加密解密', description: '专业的 AES 加密解密工具', path: '/tools/crypto/aes', category: '加密安全', icon: '🔒' },
  { name: 'RSA 加密解密', description: 'RSA 非对称加密工具', path: '/tools/crypto/rsa', category: '加密安全', icon: '🔑' },
  { name: 'HMAC 签名', description: '基于哈希的消息认证码', path: '/tools/crypto/hmac', category: '加密安全', icon: '✍️' },
  { name: 'Base64 编码', description: 'Base64 编码和解码', path: '/tools/encoding/base64', category: '加密安全', icon: '🔤' },
  { name: 'URL 编码', description: 'URL 编码和解码', path: '/tools/encoding/url', category: '加密安全', icon: '🔗' },
  { name: 'Unicode 转换', description: 'Unicode 和文本互相转换', path: '/tools/encoding/unicode', category: '加密安全', icon: '🌐' },
  { name: 'HTML 实体', description: 'HTML 实体编码和解码', path: '/tools/encoding/html', category: '加密安全', icon: '🏷️' },
  
  // 数据处理
  { name: '时间戳转换', description: '时间戳和日期时间互转', path: '/tools/data/timestamp', category: '数据处理', icon: '⏰' },
  { name: '正则表达式', description: '在线测试正则表达式', path: '/tools/data/regex', category: '数据处理', icon: '🔍' },
  { name: '颜色转换', description: 'RGB, HEX, HSL 颜色格式转换', path: '/tools/data/color', category: '数据处理', icon: '🎨' },
  { name: '单位转换', description: '长度、重量、温度单位转换', path: '/tools/data/unit', category: '数据处理', icon: '📏' },
  { name: '二维码/条形码', description: '二维码生成、解析和条形码生成', path: '/tools/data/qrbarcode', category: '数据处理', icon: '📱' },
  
  // 网络工具
  { name: 'IP 地址查询', description: '查询公网 IP 和地理位置信息', path: '/tools/network/ip', category: '网络工具', icon: '🌍' },
  { name: 'Ping 测试', description: '测试网站连通性和延迟', path: '/tools/network/ping', category: '网络工具', icon: '📡' },
  { name: 'HTTP 请求测试', description: '在线发送 HTTP 请求', path: '/tools/network/http', category: '网络工具', icon: '🌐' },
  { name: 'URL 解析器', description: '解析 URL 的各个组成部分', path: '/tools/network/url', category: '网络工具', icon: '🔗' },
  { name: 'User Agent 解析', description: '解析浏览器和设备信息', path: '/tools/network/ua', category: '网络工具', icon: '💻' },
  { name: 'HTTP 状态码', description: '查询 HTTP 状态码含义', path: '/tools/network/status', category: '网络工具', icon: 'ℹ️' },
  { name: '端口查询', description: '查询常见网络端口信息', path: '/tools/network/port', category: '网络工具', icon: '🔌' },
  { name: 'Curl 命令工具', description: '生成和解析 curl 命令', path: '/tools/network/curl', category: '网络工具', icon: '⚡' },
  
  // 文本处理
  { name: '文本对比', description: '比较两段文本的差异', path: '/tools/text/diff', category: '文本处理', icon: '📊' },
  { name: '大小写转换', description: '转换文本大小写和命名风格', path: '/tools/text/case', category: '文本处理', icon: '🔤' },
  { name: '文本统计', description: '统计字符数、单词数等信息', path: '/tools/text/stats', category: '文本处理', icon: '📈' },
  { name: '去重工具', description: '删除文本中的重复行', path: '/tools/text/dedupe', category: '文本处理', icon: '🧹' },
  { name: '密码生成器', description: '生成安全的随机密码', path: '/tools/text/password', category: '文本处理', icon: '🔐' },
  { name: 'UUID 生成器', description: '生成全局唯一标识符', path: '/tools/text/uuid', category: '文本处理', icon: '🆔' },
  { name: '查找替换', description: '批量查找和替换文本', path: '/tools/text/replace', category: '文本处理', icon: '🔄' },
  { name: '文本排序', description: '按字母、数字或长度排序', path: '/tools/text/sort', category: '文本处理', icon: '🔢' },
  { name: 'Lorem Ipsum', description: '生成占位文本', path: '/tools/text/lorem', category: '文本处理', icon: '📝' },
  { name: 'CSV 转换', description: 'CSV 与 JSON 互相转换', path: '/tools/text/csv', category: '文本处理', icon: '📊' },
  
  // 文档工具
  { name: 'PDF 信息', description: '查看 PDF 文件的详细信息（页数、大小、元数据等）', path: '/tools/pdf/info', category: '文档工具', icon: 'ℹ️' },
  { name: 'PDF 转图片', description: '将 PDF 的每一页导出为图片（PNG/JPG）', path: '/tools/pdf/to-image', category: '文档工具', icon: '🖼️' },
  { name: '图片转 PDF', description: '将多张图片合并为一个 PDF 文件', path: '/tools/pdf/from-image', category: '文档工具', icon: '📄' },
  { name: 'PDF 合并', description: '将多个 PDF 文件合并为一个', path: '/tools/pdf/merge', category: '文档工具', icon: '📑' },
  { name: 'PDF 拆分', description: '按页拆分 PDF 或提取指定页面', path: '/tools/pdf/split', category: '文档工具', icon: '✂️' },
  { name: 'PDF 压缩', description: '压缩 PDF 文件大小，优化图片质量', path: '/tools/pdf/compress', category: '文档工具', icon: '🗜️' },
  
  // 媒体工具
  { name: '视频截图', description: '从视频中截取任意帧，保存为图片', path: '/media/video/screenshot', category: '媒体工具', icon: '📸' },
  { name: '视频信息', description: '查看视频的详细信息（分辨率、时长等）', path: '/media/video/info', category: '媒体工具', icon: 'ℹ️' },
  { name: '视频帧提取', description: '批量提取视频关键帧', path: '/media/video/frames', category: '媒体工具', icon: '🎞️' },
  { name: 'GIF 制作', description: '从视频片段生成 GIF 动图', path: '/media/video/gif', category: '媒体工具', icon: '🎬' },
  { name: '音频信息', description: '查看音频文件详细信息', path: '/media/audio/info', category: '媒体工具', icon: 'ℹ️' },
  { name: '音频波形', description: '显示音频波形和频谱分析', path: '/media/audio/waveform', category: '媒体工具', icon: '📊' },
  { name: '音频录制', description: '使用麦克风录制音频', path: '/media/audio/record', category: '媒体工具', icon: '🎙️' },
  { name: '音频裁剪', description: '裁剪音频片段，导出为 WAV', path: '/media/audio/trim', category: '媒体工具', icon: '✂️' },
  { name: '图片压缩', description: '压缩图片大小，支持自定义质量', path: '/media/image/compress', category: '媒体工具', icon: '🗜️' },
  { name: '格式转换', description: '转换图片格式（JPG, PNG, WebP 等）', path: '/media/image/convert', category: '媒体工具', icon: '🔄' },
  { name: '图片裁剪', description: '裁剪图片为指定尺寸', path: '/media/image/crop', category: '媒体工具', icon: '✂️' },
  { name: '图片缩放', description: '调整图片尺寸和比例', path: '/media/image/resize', category: '媒体工具', icon: '📐' },
  { name: 'Base64 转换', description: '图片和 Base64 互相转换', path: '/media/image/base64', category: '媒体工具', icon: '🖼️' },
  { name: '图片信息', description: '查看图片的详细信息', path: '/media/image/info', category: '媒体工具', icon: 'ℹ️' },
];

export const SearchDialog: React.FC<SearchDialogProps> = ({ open, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  // 模糊搜索
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return ALL_TOOLS;

    const query = searchQuery.toLowerCase();
    return ALL_TOOLS.filter((tool) => {
      const nameMatch = tool.name.toLowerCase().includes(query);
      const descMatch = tool.description.toLowerCase().includes(query);
      const categoryMatch = tool.category.toLowerCase().includes(query);
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
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Typography sx={{ fontSize: '1.5rem' }}>{tool.icon}</Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" fontWeight={600}>
                          {tool.name}
                        </Typography>
                        <Chip label={tool.category} size="small" />
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

