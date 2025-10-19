/**
 * 色卡库工具
 */

import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
  Snackbar,
  Alert,
  alpha,
} from '@mui/material';
import { ContentCopy, CheckCircle } from '@mui/icons-material';
import chroma from 'chroma-js';
import { ToolDetailHeader } from '../../components/ToolDetailHeader';

// Material Design 色板
const MATERIAL_COLORS = {
  red: ['#FFEBEE', '#FFCDD2', '#EF9A9A', '#E57373', '#EF5350', '#F44336', '#E53935', '#D32F2F', '#C62828', '#B71C1C'],
  pink: ['#FCE4EC', '#F8BBD0', '#F48FB1', '#F06292', '#EC407A', '#E91E63', '#D81B60', '#C2185B', '#AD1457', '#880E4F'],
  purple: ['#F3E5F5', '#E1BEE7', '#CE93D8', '#BA68C8', '#AB47BC', '#9C27B0', '#8E24AA', '#7B1FA2', '#6A1B9A', '#4A148C'],
  deepPurple: ['#EDE7F6', '#D1C4E9', '#B39DDB', '#9575CD', '#7E57C2', '#673AB7', '#5E35B1', '#512DA8', '#4527A0', '#311B92'],
  indigo: ['#E8EAF6', '#C5CAE9', '#9FA8DA', '#7986CB', '#5C6BC0', '#3F51B5', '#3949AB', '#303F9F', '#283593', '#1A237E'],
  blue: ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5', '#1976D2', '#1565C0', '#0D47A1'],
  lightBlue: ['#E1F5FE', '#B3E5FC', '#81D4FA', '#4FC3F7', '#29B6F6', '#03A9F4', '#039BE5', '#0288D1', '#0277BD', '#01579B'],
  cyan: ['#E0F7FA', '#B2EBF2', '#80DEEA', '#4DD0E1', '#26C6DA', '#00BCD4', '#00ACC1', '#0097A7', '#00838F', '#006064'],
  teal: ['#E0F2F1', '#B2DFDB', '#80CBC4', '#4DB6AC', '#26A69A', '#009688', '#00897B', '#00796B', '#00695C', '#004D40'],
  green: ['#E8F5E9', '#C8E6C9', '#A5D6A7', '#81C784', '#66BB6A', '#4CAF50', '#43A047', '#388E3C', '#2E7D32', '#1B5E20'],
  lightGreen: ['#F1F8E9', '#DCEDC8', '#C5E1A5', '#AED581', '#9CCC65', '#8BC34A', '#7CB342', '#689F38', '#558B2F', '#33691E'],
  lime: ['#F9FBE7', '#F0F4C3', '#E6EE9C', '#DCE775', '#D4E157', '#CDDC39', '#C0CA33', '#AFB42B', '#9E9D24', '#827717'],
  yellow: ['#FFFDE7', '#FFF9C4', '#FFF59D', '#FFF176', '#FFEE58', '#FFEB3B', '#FDD835', '#FBC02D', '#F9A825', '#F57F17'],
  amber: ['#FFF8E1', '#FFECB3', '#FFE082', '#FFD54F', '#FFCA28', '#FFC107', '#FFB300', '#FFA000', '#FF8F00', '#FF6F00'],
  orange: ['#FFF3E0', '#FFE0B2', '#FFCC80', '#FFB74D', '#FFA726', '#FF9800', '#FB8C00', '#F57C00', '#EF6C00', '#E65100'],
  deepOrange: ['#FBE9E7', '#FFCCBC', '#FFAB91', '#FF8A65', '#FF7043', '#FF5722', '#F4511E', '#E64A19', '#D84315', '#BF360C'],
  brown: ['#EFEBE9', '#D7CCC8', '#BCAAA4', '#A1887F', '#8D6E63', '#795548', '#6D4C41', '#5D4037', '#4E342E', '#3E2723'],
  grey: ['#FAFAFA', '#F5F5F5', '#EEEEEE', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#757575', '#616161', '#424242', '#212121'],
  blueGrey: ['#ECEFF1', '#CFD8DC', '#B0BEC5', '#90A4AE', '#78909C', '#607D8B', '#546E7A', '#455A64', '#37474F', '#263238'],
};

// Flat UI Colors
const FLAT_COLORS = [
  { name: 'Turquoise', color: '#1abc9c' },
  { name: 'Emerald', color: '#2ecc71' },
  { name: 'Peter River', color: '#3498db' },
  { name: 'Amethyst', color: '#9b59b6' },
  { name: 'Wet Asphalt', color: '#34495e' },
  { name: 'Green Sea', color: '#16a085' },
  { name: 'Nephritis', color: '#27ae60' },
  { name: 'Belize Hole', color: '#2980b9' },
  { name: 'Wisteria', color: '#8e44ad' },
  { name: 'Midnight Blue', color: '#2c3e50' },
  { name: 'Sun Flower', color: '#f1c40f' },
  { name: 'Carrot', color: '#e67e22' },
  { name: 'Alizarin', color: '#e74c3c' },
  { name: 'Clouds', color: '#ecf0f1' },
  { name: 'Concrete', color: '#95a5a6' },
  { name: 'Orange', color: '#f39c12' },
  { name: 'Pumpkin', color: '#d35400' },
  { name: 'Pomegranate', color: '#c0392b' },
  { name: 'Silver', color: '#bdc3c7' },
  { name: 'Asbestos', color: '#7f8c8d' },
];

// 品牌色
const BRAND_COLORS = [
  { name: 'Facebook', color: '#1877f2' },
  { name: 'Twitter', color: '#1da1f2' },
  { name: 'Instagram', color: '#e4405f' },
  { name: 'LinkedIn', color: '#0077b5' },
  { name: 'YouTube', color: '#ff0000' },
  { name: 'WhatsApp', color: '#25d366' },
  { name: 'TikTok', color: '#000000' },
  { name: 'Snapchat', color: '#fffc00' },
  { name: 'Pinterest', color: '#e60023' },
  { name: 'Reddit', color: '#ff4500' },
  { name: 'Spotify', color: '#1db954' },
  { name: 'Netflix', color: '#e50914' },
  { name: 'Amazon', color: '#ff9900' },
  { name: 'Google', color: '#4285f4' },
  { name: 'Apple', color: '#000000' },
  { name: 'Microsoft', color: '#00a4ef' },
];

export const ColorSwatches: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [copyMessage, setCopyMessage] = useState('');

  const copyColor = (color: string, name?: string) => {
    navigator.clipboard.writeText(color);
    setCopyMessage(name ? `已复制 ${name}: ${color}` : `已复制 ${color}`);
  };

  // 获取文字颜色（黑或白）
  const getTextColor = (bgColor: string) => {
    try {
      const luminance = chroma(bgColor).luminance();
      return luminance > 0.5 ? '#000000' : '#ffffff';
    } catch {
      return '#000000';
    }
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader
        title="色卡库"
        description="Material Design、Flat UI 等流行配色方案"
        toolPath="/tools/design/color-swatches"
      />

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab label="Material Design" />
          <Tab label="Flat UI Colors" />
          <Tab label="品牌色" />
        </Tabs>
      </Paper>

      {/* Material Design 色板 */}
      {tabValue === 0 && (
        <Box>
          {Object.entries(MATERIAL_COLORS).map(([name, colors]) => (
            <Paper key={name} sx={{ mb: 3, p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize' }}>
                {name.replace(/([A-Z])/g, ' $1').trim()}
              </Typography>
              <Grid container spacing={1}>
                {colors.map((color, index) => (
                  <Grid item key={index}>
                    <Tooltip title={`${color} - ${index === 0 ? '50' : index * 100}`}>
                      <Box
                        onClick={() => copyColor(color)}
                        sx={{
                          width: 80,
                          height: 80,
                          backgroundColor: color,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            zIndex: 10,
                            boxShadow: 3,
                          },
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: getTextColor(color),
                            opacity: 0.8,
                            fontWeight: 600,
                          }}
                        >
                          {index === 0 ? '50' : index * 100}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          ))}
        </Box>
      )}

      {/* Flat UI Colors */}
      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            灵感来自 Flat UI Design，简洁明快的配色方案
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {FLAT_COLORS.map((item) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={item.name}>
                <Tooltip title={`点击复制 ${item.color}`}>
                  <Paper
                    onClick={() => copyColor(item.color, item.name)}
                    sx={{
                      cursor: 'pointer',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        height: 100,
                        backgroundColor: item.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconButton
                        sx={{
                          color: getTextColor(item.color),
                          backgroundColor: alpha(
                            getTextColor(item.color) === '#ffffff' ? '#fff' : '#000',
                            0.1
                          ),
                        }}
                      >
                        <ContentCopy />
                      </IconButton>
                    </Box>
                    <Box sx={{ p: 1.5 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {item.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        fontFamily="monospace"
                        color="text.secondary"
                      >
                        {item.color}
                      </Typography>
                    </Box>
                  </Paper>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* 品牌色 */}
      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            流行品牌的主色调
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {BRAND_COLORS.map((item) => (
              <Grid item xs={6} sm={4} md={3} key={item.name}>
                <Tooltip title={`点击复制 ${item.color}`}>
                  <Paper
                    onClick={() => copyColor(item.color, item.name)}
                    sx={{
                      cursor: 'pointer',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        height: 100,
                        backgroundColor: item.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconButton
                        sx={{
                          color: getTextColor(item.color),
                          backgroundColor: alpha(
                            getTextColor(item.color) === '#ffffff' ? '#fff' : '#000',
                            0.1
                          ),
                        }}
                      >
                        <ContentCopy />
                      </IconButton>
                    </Box>
                    <Box sx={{ p: 1.5, textAlign: 'center' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {item.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        fontFamily="monospace"
                        color="text.secondary"
                      >
                        {item.color}
                      </Typography>
                    </Box>
                  </Paper>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

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

