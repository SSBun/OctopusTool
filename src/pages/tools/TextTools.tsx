import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
  Grid,
} from '@mui/material';
import {
  CompareArrows,
  TextFields,
  Analytics,
  FilterList,
  VpnKey,
  Fingerprint,
  FindReplace,
  Sort,
  Article,
  TableChart,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const TextTools: React.FC = () => {
  const navigate = useNavigate();

  const tools = [
    {
      icon: <CompareArrows sx={{ fontSize: 40 }} />,
      title: '文本对比',
      description: '比较两段文本的差异，高亮显示不同之处',
      path: '/tools/text/diff',
      status: '可用',
    },
    {
      icon: <TextFields sx={{ fontSize: 40 }} />,
      title: '大小写转换',
      description: '转换文本的大小写格式，支持多种命名风格',
      path: '/tools/text/case',
      status: '可用',
    },
    {
      icon: <Analytics sx={{ fontSize: 40 }} />,
      title: '文本统计',
      description: '统计字符数、单词数、行数等信息',
      path: '/tools/text/stats',
      status: '可用',
    },
    {
      icon: <FilterList sx={{ fontSize: 40 }} />,
      title: '去重工具',
      description: '删除文本中的重复行，保持唯一性',
      path: '/tools/text/dedupe',
      status: '可用',
    },
    {
      icon: <VpnKey sx={{ fontSize: 40 }} />,
      title: '密码生成器',
      description: '生成安全的随机密码，可自定义规则',
      path: '/tools/text/password',
      status: '可用',
    },
    {
      icon: <Fingerprint sx={{ fontSize: 40 }} />,
      title: 'UUID 生成器',
      description: '生成全局唯一标识符 (UUID)',
      path: '/tools/text/uuid',
      status: '可用',
    },
    {
      icon: <FindReplace sx={{ fontSize: 40 }} />,
      title: '查找替换',
      description: '批量查找和替换文本，支持正则表达式',
      path: '/tools/text/replace',
      status: '可用',
    },
    {
      icon: <Sort sx={{ fontSize: 40 }} />,
      title: '文本排序',
      description: '按字母、数字或长度对文本行排序',
      path: '/tools/text/sort',
      status: '可用',
    },
    {
      icon: <Article sx={{ fontSize: 40 }} />,
      title: 'Lorem Ipsum',
      description: '生成占位文本，用于设计和开发',
      path: '/tools/text/lorem',
      status: '可用',
    },
    {
      icon: <TableChart sx={{ fontSize: 40 }} />,
      title: 'CSV 转换',
      description: 'CSV 与 JSON 互相转换',
      path: '/tools/text/csv',
      status: '可用',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          文本处理工具
        </Typography>
        <Typography color="text.secondary" paragraph>
          强大的文本处理、转换和生成工具
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {tools.map((tool, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '0 8px 16px 0 rgb(0 0 0 / 0.4)'
                      : '0 8px 16px 0 rgb(0 0 0 / 0.15)',
                },
              }}
            >
              <CardActionArea
                sx={{ p: 3, minHeight: 200, height: '100%' }}
                onClick={() => tool.path && navigate(tool.path)}
                disabled={!tool.path}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      color: 'white',
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: 'primary.main',
                      mx: 'auto',
                    }}
                  >
                    {tool.icon}
                  </Box>
                  <Typography variant="h6" component="h2" gutterBottom fontWeight={600}>
                    {tool.title}
                  </Typography>
                  <Typography color="text.secondary" variant="body2" paragraph sx={{ mb: 2 }}>
                    {tool.description}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={tool.status === '可用' ? 'success.main' : 'warning.main'}
                    fontWeight={500}
                  >
                    {tool.status}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

