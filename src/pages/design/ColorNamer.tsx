/**
 * 颜色命名工具
 */

import React, { useState, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { CheckCircle, ContentCopy } from '@mui/icons-material';
import chroma from 'chroma-js';
import { ToolDetailHeader } from '../../components/ToolDetailHeader';
import { ColorPicker } from '../../components/ColorPicker';

// 颜色名称数据库（常见颜色）
const COLOR_NAMES = [
  // 红色系
  { name: '红色', en: 'Red', hex: '#FF0000' },
  { name: '深红', en: 'Dark Red', hex: '#8B0000' },
  { name: '猩红', en: 'Crimson', hex: '#DC143C' },
  { name: '番茄红', en: 'Tomato', hex: '#FF6347' },
  { name: '珊瑚红', en: 'Coral', hex: '#FF7F50' },
  { name: '玫瑰红', en: 'Rose', hex: '#FF007F' },
  { name: '粉红', en: 'Pink', hex: '#FFC0CB' },
  { name: '樱桃红', en: 'Cherry', hex: '#DE3163' },
  
  // 橙色系
  { name: '橙色', en: 'Orange', hex: '#FFA500' },
  { name: '深橙', en: 'Dark Orange', hex: '#FF8C00' },
  { name: '橙红', en: 'Orange Red', hex: '#FF4500' },
  { name: '杏色', en: 'Apricot', hex: '#FBCEB1' },
  { name: '桃色', en: 'Peach', hex: '#FFE5B4' },
  
  // 黄色系
  { name: '黄色', en: 'Yellow', hex: '#FFFF00' },
  { name: '金色', en: 'Gold', hex: '#FFD700' },
  { name: '柠檬黄', en: 'Lemon', hex: '#FFF44F' },
  { name: '香槟色', en: 'Champagne', hex: '#F7E7CE' },
  { name: '米黄', en: 'Cream', hex: '#FFFDD0' },
  { name: '象牙白', en: 'Ivory', hex: '#FFFFF0' },
  
  // 绿色系
  { name: '绿色', en: 'Green', hex: '#008000' },
  { name: '深绿', en: 'Dark Green', hex: '#006400' },
  { name: '青绿', en: 'Cyan', hex: '#00FFFF' },
  { name: '薄荷绿', en: 'Mint', hex: '#98FF98' },
  { name: '橄榄绿', en: 'Olive', hex: '#808000' },
  { name: '翡翠绿', en: 'Emerald', hex: '#50C878' },
  { name: '松石绿', en: 'Turquoise', hex: '#40E0D0' },
  { name: '青色', en: 'Aqua', hex: '#00FFFF' },
  { name: '森林绿', en: 'Forest', hex: '#228B22' },
  { name: '草绿', en: 'Lime', hex: '#00FF00' },
  
  // 蓝色系
  { name: '蓝色', en: 'Blue', hex: '#0000FF' },
  { name: '深蓝', en: 'Dark Blue', hex: '#00008B' },
  { name: '天蓝', en: 'Sky Blue', hex: '#87CEEB' },
  { name: '海军蓝', en: 'Navy', hex: '#000080' },
  { name: '皇家蓝', en: 'Royal Blue', hex: '#4169E1' },
  { name: '钢蓝', en: 'Steel Blue', hex: '#4682B4' },
  { name: '靛蓝', en: 'Indigo', hex: '#4B0082' },
  { name: '湖蓝', en: 'Azure', hex: '#F0FFFF' },
  { name: '冰蓝', en: 'Ice Blue', hex: '#AFEEEE' },
  
  // 紫色系
  { name: '紫色', en: 'Purple', hex: '#800080' },
  { name: '紫罗兰', en: 'Violet', hex: '#EE82EE' },
  { name: '薰衣草', en: 'Lavender', hex: '#E6E6FA' },
  { name: '紫红', en: 'Magenta', hex: '#FF00FF' },
  { name: '梅红', en: 'Plum', hex: '#DDA0DD' },
  { name: '兰花紫', en: 'Orchid', hex: '#DA70D6' },
  
  // 棕色系
  { name: '棕色', en: 'Brown', hex: '#A52A2A' },
  { name: '深棕', en: 'Dark Brown', hex: '#654321' },
  { name: '栗色', en: 'Maroon', hex: '#800000' },
  { name: '赭石', en: 'Sienna', hex: '#A0522D' },
  { name: '巧克力色', en: 'Chocolate', hex: '#D2691E' },
  { name: '咖啡色', en: 'Coffee', hex: '#6F4E37' },
  { name: '小麦色', en: 'Wheat', hex: '#F5DEB3' },
  { name: '卡其色', en: 'Khaki', hex: '#F0E68C' },
  { name: '沙色', en: 'Sand', hex: '#C2B280' },
  { name: '米色', en: 'Beige', hex: '#F5F5DC' },
  
  // 灰色系
  { name: '白色', en: 'White', hex: '#FFFFFF' },
  { name: '黑色', en: 'Black', hex: '#000000' },
  { name: '灰色', en: 'Gray', hex: '#808080' },
  { name: '深灰', en: 'Dark Gray', hex: '#A9A9A9' },
  { name: '浅灰', en: 'Light Gray', hex: '#D3D3D3' },
  { name: '银色', en: 'Silver', hex: '#C0C0C0' },
  { name: '烟灰', en: 'Smoke', hex: '#F5F5F5' },
  { name: '木炭灰', en: 'Charcoal', hex: '#36454F' },
  { name: '石板灰', en: 'Slate', hex: '#708090' },
];

export const ColorNamer: React.FC = () => {
  const [inputColor, setInputColor] = useState('#3f51b5');
  const [copyMessage, setCopyMessage] = useState('');

  // 计算颜色距离
  const colorDistance = (color1: string, color2: string) => {
    try {
      const c1 = chroma(color1);
      const c2 = chroma(color2);
      return chroma.distance(c1, c2, 'lab');
    } catch {
      return Infinity;
    }
  };

  // 查找最接近的颜色
  const closestColors = useMemo(() => {
    try {
      return COLOR_NAMES.map((color) => ({
        ...color,
        distance: colorDistance(inputColor, color.hex),
        similarity: Math.max(0, 100 - colorDistance(inputColor, color.hex)),
      }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10);
    } catch {
      return [];
    }
  }, [inputColor]);

  // 获取颜色描述
  const getColorDescription = () => {
    try {
      const color = chroma(inputColor);
      const hsl = color.hsl();
      const luminance = color.luminance();
      const saturation = isNaN(hsl[1]) ? 0 : hsl[1];
      
      let description = '';
      
      // 描述明度
      if (luminance > 0.9) description += '非常亮的';
      else if (luminance > 0.7) description += '亮';
      else if (luminance > 0.3) description += '中等';
      else if (luminance > 0.1) description += '暗';
      else description += '非常暗的';
      
      // 描述饱和度
      if (saturation > 0.8) description += '鲜艳的';
      else if (saturation > 0.5) description += '饱和的';
      else if (saturation > 0.2) description += '柔和的';
      else if (saturation > 0.05) description += '浅淡的';
      else return '灰色调';
      
      // 描述色相
      const hue = isNaN(hsl[0]) ? 0 : hsl[0];
      if (hue < 15 || hue >= 345) description += '红色';
      else if (hue < 45) description += '橙红色';
      else if (hue < 65) description += '橙色';
      else if (hue < 80) description += '黄橙色';
      else if (hue < 150) description += '黄绿色';
      else if (hue < 170) description += '绿色';
      else if (hue < 200) description += '青绿色';
      else if (hue < 240) description += '蓝色';
      else if (hue < 280) description += '蓝紫色';
      else if (hue < 320) description += '紫色';
      else description += '紫红色';
      
      return description;
    } catch {
      return '无效的颜色';
    }
  };

  // 复制文本
  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyMessage(`已复制 ${label}`);
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader
        title="颜色命名工具"
        description="根据色值查找颜色名称和描述"
        toolPath="/tools/design/color-namer"
      />

      <Grid container spacing={4}>
        {/* 左侧：输入和预览 */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              颜色输入
            </Typography>

            <ColorPicker
              label="颜色输入"
              value={inputColor}
              onChange={setInputColor}
              helperText="点击色块打开颜色选择器，查找颜色名称"
            />

            {/* 颜色预览 */}
            <Box
              sx={{
                width: '100%',
                height: 200,
                backgroundColor: inputColor,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mt: 2,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  color: (() => {
                    try {
                      return chroma(inputColor).luminance() > 0.5 ? '#000' : '#fff';
                    } catch {
                      return '#000';
                    }
                  })(),
                  fontWeight: 'bold',
                }}
              >
                {closestColors[0]?.name || '颜色预览'}
              </Typography>
            </Box>
          </Paper>

          {/* 颜色描述 */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              颜色描述
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                {getColorDescription()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                最接近的颜色名称：{closestColors[0]?.name} ({closestColors[0]?.en})
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* 颜色属性 */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                颜色属性
              </Typography>
              <Grid container spacing={1}>
                {(() => {
                  try {
                    const color = chroma(inputColor);
                    const [h, s, l] = color.hsl();
                    return (
                      <>
                        <Grid item xs={6}>
                          <Chip
                            label={`色相: ${isNaN(h) ? 0 : Math.round(h)}°`}
                            size="small"
                            sx={{ width: '100%' }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Chip
                            label={`饱和度: ${Math.round((isNaN(s) ? 0 : s) * 100)}%`}
                            size="small"
                            sx={{ width: '100%' }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Chip
                            label={`亮度: ${Math.round((isNaN(l) ? 0 : l) * 100)}%`}
                            size="small"
                            sx={{ width: '100%' }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Chip
                            label={`光度: ${Math.round(color.luminance() * 100)}%`}
                            size="small"
                            sx={{ width: '100%' }}
                          />
                        </Grid>
                      </>
                    );
                  } catch {
                    return null;
                  }
                })()}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* 右侧：最接近的颜色列表 */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              最接近的颜色名称
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              按相似度排序（基于 LAB 色彩空间距离）
            </Typography>

            <List>
              {closestColors.map((color, index) => (
                <React.Fragment key={index}>
                  <ListItem
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 1,
                      mb: 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: (theme) => theme.palette.action.hover,
                      },
                    }}
                    onClick={() => copyText(color.hex, color.name)}
                  >
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        backgroundColor: color.hex,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        mr: 2,
                        flexShrink: 0,
                      }}
                    />
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">
                            {color.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {color.en}
                          </Typography>
                          {index === 0 && (
                            <Chip
                              label="最接近"
                              size="small"
                              color="primary"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" fontFamily="monospace">
                            {color.hex}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            相似度: {color.similarity.toFixed(1)}%
                          </Typography>
                        </Box>
                      }
                    />
                    <ContentCopy sx={{ color: 'text.secondary' }} />
                  </ListItem>
                  {index < closestColors.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            {/* 使用说明 */}
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                💡 使用提示
              </Typography>
              <Typography variant="body2" component="div">
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>输入任何 HEX 颜色值查找名称</li>
                  <li>相似度基于 LAB 色彩空间计算，更接近人眼感知</li>
                  <li>点击颜色条目可复制其 HEX 值</li>
                  <li>颜色名称包含中英文对照</li>
                </ul>
              </Typography>
            </Alert>
          </Paper>
        </Grid>
      </Grid>

      {/* 复制成功提示 */}
      <Snackbar
        open={!!copyMessage}
        autoHideDuration={2000}
        onClose={() => setCopyMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setCopyMessage('')}
          severity="success"
          icon={<CheckCircle />}
          sx={{ width: '100%' }}
        >
          {copyMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

