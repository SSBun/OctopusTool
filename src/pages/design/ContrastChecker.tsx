/**
 * 对比度检查器工具
 */

import React, { useState, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { CheckCircle, Cancel, Info } from '@mui/icons-material';
import chroma from 'chroma-js';
import { ToolDetailHeader } from '../../components/ToolDetailHeader';
import { ColorPicker } from '../../components/ColorPicker';

export const ContrastChecker: React.FC = () => {
  const [foreground, setForeground] = useState('#000000');
  const [background, setBackground] = useState('#ffffff');

  // 计算对比度
  const contrastRatio = useMemo(() => {
    try {
      return chroma.contrast(foreground, background);
    } catch {
      return 0;
    }
  }, [foreground, background]);

  // WCAG 标准检查
  const wcagResults = useMemo(() => {
    return {
      normalText: {
        aa: contrastRatio >= 4.5,
        aaa: contrastRatio >= 7,
      },
      largeText: {
        aa: contrastRatio >= 3,
        aaa: contrastRatio >= 4.5,
      },
      ui: {
        aa: contrastRatio >= 3,
      },
    };
  }, [contrastRatio]);

  // 状态标签组件
  const StatusChip = ({ pass }: { pass: boolean }) => (
    <Chip
      icon={pass ? <CheckCircle /> : <Cancel />}
      label={pass ? '通过' : '不通过'}
      color={pass ? 'success' : 'error'}
      size="small"
    />
  );

  // 获取评级
  const getRating = () => {
    if (contrastRatio >= 7) return { text: '优秀', color: 'success', score: 'AAA' };
    if (contrastRatio >= 4.5) return { text: '良好', color: 'success', score: 'AA' };
    if (contrastRatio >= 3) return { text: '及格', color: 'warning', score: 'AA大字' };
    return { text: '不合格', color: 'error', score: '失败' };
  };

  const rating = getRating();

  // 推荐建议
  const getRecommendations = () => {
    const recommendations = [];
    if (!wcagResults.normalText.aa) {
      recommendations.push('当前对比度不适合用于正文（需要 4.5:1）');
      recommendations.push('可以加深前景色或调亮背景色');
    }
    if (!wcagResults.largeText.aa) {
      recommendations.push('当前对比度不适合用于大字体（需要 3:1）');
    }
    if (wcagResults.normalText.aaa) {
      recommendations.push('✅ 对比度优秀，适合所有文本类型');
    }
    return recommendations;
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader
        title="对比度检查器"
        description="WCAG 无障碍对比度检测和评估"
        toolPath="/tools/design/contrast-checker"
      />

      <Grid container spacing={4}>
        {/* 左侧：颜色输入和预览 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              颜色设置
            </Typography>

            {/* 前景色 */}
            <Box sx={{ mb: 3 }}>
              <ColorPicker
                label="前景色（文字颜色）"
                value={foreground}
                onChange={setForeground}
                helperText="点击色块可打开颜色选择器"
              />
            </Box>

            {/* 背景色 */}
            <Box>
              <ColorPicker
                label="背景色"
                value={background}
                onChange={setBackground}
                helperText="点击色块可打开颜色选择器"
              />
            </Box>
          </Paper>

          {/* 预览 */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              效果预览
            </Typography>

            {/* 正常文本 */}
            <Box
              sx={{
                mb: 2,
                p: 3,
                backgroundColor: background,
                color: foreground,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="body1" gutterBottom>
                这是正常大小的文本示例（16px）
              </Typography>
              <Typography variant="body2">
                The quick brown fox jumps over the lazy dog.
              </Typography>
            </Box>

            {/* 大文本 */}
            <Box
              sx={{
                mb: 2,
                p: 3,
                backgroundColor: background,
                color: foreground,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ fontSize: '24px' }}>
                这是大号文本示例（24px加粗）
              </Typography>
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '18px' }}>
                Large Text Example (18px+ Bold)
              </Typography>
            </Box>

            {/* UI 组件 */}
            <Box
              sx={{
                p: 3,
                backgroundColor: background,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box
                sx={{
                  display: 'inline-block',
                  px: 3,
                  py: 1,
                  backgroundColor: foreground,
                  color: background,
                  borderRadius: 1,
                }}
              >
                <Typography variant="button">按钮示例</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* 右侧：对比度结果 */}
        <Grid item xs={12} md={6}>
          {/* 对比度比例 */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              对比度比例
            </Typography>
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Typography variant="h2" color={`${rating.color}.main`} fontWeight="bold">
                {contrastRatio.toFixed(2)}:1
              </Typography>
              <Chip
                label={rating.text}
                color={rating.color as any}
                sx={{ mt: 2, fontSize: '1.1rem', px: 2, py: 2 }}
              />
            </Box>
          </Paper>

          {/* WCAG 检查结果 */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              WCAG 2.1 标准检查
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>使用场景</TableCell>
                    <TableCell align="center">AA级</TableCell>
                    <TableCell align="center">AAA级</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        正常文本
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ≥ 4.5:1 / ≥ 7:1
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <StatusChip pass={wcagResults.normalText.aa} />
                    </TableCell>
                    <TableCell align="center">
                      <StatusChip pass={wcagResults.normalText.aaa} />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        大号文本
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ≥ 3:1 / ≥ 4.5:1
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <StatusChip pass={wcagResults.largeText.aa} />
                    </TableCell>
                    <TableCell align="center">
                      <StatusChip pass={wcagResults.largeText.aaa} />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        UI 组件
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ≥ 3:1
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <StatusChip pass={wcagResults.ui.aa} />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="caption" color="text.secondary">
                        无要求
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* 建议 */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              优化建议
            </Typography>
            {getRecommendations().map((rec, index) => (
              <Alert
                key={index}
                severity={rec.startsWith('✅') ? 'success' : 'info'}
                sx={{ mb: 1 }}
                icon={rec.startsWith('✅') ? <CheckCircle /> : <Info />}
              >
                {rec}
              </Alert>
            ))}
          </Paper>

          {/* WCAG 说明 */}
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              📚 WCAG 标准说明
            </Typography>
            <Typography variant="body2" component="div">
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>
                  <strong>AA级</strong>: 最低合规标准，适用于大多数场景
                </li>
                <li>
                  <strong>AAA级</strong>: 最高标准，推荐用于重要内容
                </li>
                <li>
                  <strong>大号文本</strong>: 18pt+ 或 14pt+ 加粗
                </li>
                <li>
                  <strong>正常文本</strong>: 小于大号文本的所有文字
                </li>
              </ul>
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Container>
  );
};

