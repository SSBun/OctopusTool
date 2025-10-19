import React, { useState } from 'react';
import {
Container,
  Typography,
  Box,
  Paper,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  InputAdornment,
  Divider,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import { Search, CheckCircle, Info, Warning, Error as ErrorIcon } from '@mui/icons-material';

interface StatusCode {
  code: number;
  message: string;
  description: string;
  category: '1xx' | '2xx' | '3xx' | '4xx' | '5xx';
}

const STATUS_CODES: StatusCode[] = [
  // 1xx - 信息响应
  { code: 100, message: 'Continue', description: '继续。客户端应继续其请求', category: '1xx' },
  { code: 101, message: 'Switching Protocols', description: '切换协议。服务器根据客户端请求切换协议', category: '1xx' },
  { code: 102, message: 'Processing', description: '处理中。服务器已收到并正在处理请求', category: '1xx' },

  // 2xx - 成功响应
  { code: 200, message: 'OK', description: '请求成功。常见于 GET、POST 请求成功后', category: '2xx' },
  { code: 201, message: 'Created', description: '已创建。成功请求并创建了新的资源', category: '2xx' },
  { code: 202, message: 'Accepted', description: '已接受。已经接受请求，但未完成处理', category: '2xx' },
  { code: 204, message: 'No Content', description: '无内容。服务器成功处理，但未返回内容', category: '2xx' },
  { code: 206, message: 'Partial Content', description: '部分内容。服务器成功处理了部分 GET 请求', category: '2xx' },

  // 3xx - 重定向
  { code: 300, message: 'Multiple Choices', description: '多种选择。请求的资源有多种选择', category: '3xx' },
  { code: 301, message: 'Moved Permanently', description: '永久移动。请求的资源已永久移动到新位置', category: '3xx' },
  { code: 302, message: 'Found', description: '临时移动。资源临时从不同的 URI 响应请求', category: '3xx' },
  { code: 303, message: 'See Other', description: '查看其他位置。使用 GET 方法查看其他地址', category: '3xx' },
  { code: 304, message: 'Not Modified', description: '未修改。所请求的资源未修改，可使用缓存', category: '3xx' },
  { code: 307, message: 'Temporary Redirect', description: '临时重定向。请求应使用相同方法重定向', category: '3xx' },
  { code: 308, message: 'Permanent Redirect', description: '永久重定向。资源已永久移动', category: '3xx' },

  // 4xx - 客户端错误
  { code: 400, message: 'Bad Request', description: '错误的请求。服务器无法理解请求的格式', category: '4xx' },
  { code: 401, message: 'Unauthorized', description: '未授权。请求要求身份验证', category: '4xx' },
  { code: 403, message: 'Forbidden', description: '禁止访问。服务器拒绝请求', category: '4xx' },
  { code: 404, message: 'Not Found', description: '未找到。服务器找不到请求的资源', category: '4xx' },
  { code: 405, message: 'Method Not Allowed', description: '方法不允许。请求方法不被允许', category: '4xx' },
  { code: 406, message: 'Not Acceptable', description: '不可接受。无法根据请求的内容特性提供资源', category: '4xx' },
  { code: 408, message: 'Request Timeout', description: '请求超时。服务器等待请求时超时', category: '4xx' },
  { code: 409, message: 'Conflict', description: '冲突。请求与服务器当前状态冲突', category: '4xx' },
  { code: 410, message: 'Gone', description: '已删除。请求的资源已永久删除', category: '4xx' },
  { code: 413, message: 'Payload Too Large', description: '请求实体过大。服务器拒绝处理过大的请求', category: '4xx' },
  { code: 414, message: 'URI Too Long', description: 'URI 过长。请求的 URI 过长', category: '4xx' },
  { code: 415, message: 'Unsupported Media Type', description: '不支持的媒体类型', category: '4xx' },
  { code: 429, message: 'Too Many Requests', description: '请求过多。用户在给定时间内发送了太多请求', category: '4xx' },

  // 5xx - 服务器错误
  { code: 500, message: 'Internal Server Error', description: '服务器内部错误。服务器遇到错误，无法完成请求', category: '5xx' },
  { code: 501, message: 'Not Implemented', description: '未实现。服务器不支持请求的功能', category: '5xx' },
  { code: 502, message: 'Bad Gateway', description: '错误的网关。服务器作为网关或代理，从上游服务器收到无效响应', category: '5xx' },
  { code: 503, message: 'Service Unavailable', description: '服务不可用。服务器暂时过载或维护', category: '5xx' },
  { code: 504, message: 'Gateway Timeout', description: '网关超时。作为网关或代理的服务器未及时收到响应', category: '5xx' },
  { code: 505, message: 'HTTP Version Not Supported', description: 'HTTP 版本不受支持', category: '5xx' },
];

export const StatusCodeTool: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCodes = STATUS_CODES.filter(
    (status) =>
      status.code.toString().includes(searchTerm) ||
      status.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      status.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '1xx':
        return 'info';
      case '2xx':
        return 'success';
      case '3xx':
        return 'primary';
      case '4xx':
        return 'warning';
      case '5xx':
        return 'error';
      default:
        return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '1xx':
        return <Info />;
      case '2xx':
        return <CheckCircle />;
      case '3xx':
        return <Info />;
      case '4xx':
        return <Warning />;
      case '5xx':
        return <ErrorIcon />;
      default:
        return null;
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case '1xx':
        return '信息响应 - 表示请求已被接收，继续处理';
      case '2xx':
        return '成功响应 - 表示请求已被成功接收、理解并接受';
      case '3xx':
        return '重定向 - 需要进一步操作以完成请求';
      case '4xx':
        return '客户端错误 - 请求包含语法错误或无法完成请求';
      case '5xx':
        return '服务器错误 - 服务器在处理请求过程中发生错误';
      default:
        return '';
    }
  };

  const groupedCodes = ['1xx', '2xx', '3xx', '4xx', '5xx'].map((category) => ({
    category,
    codes: filteredCodes.filter((code) => code.category === category),
  }));

  return (
    <Container maxWidth="lg">
      <ToolDetailHeader
        title="HTTP 状态码查询"
        description="查询 HTTP 响应状态码的含义和说明"
        toolPath="/tools/network/status-code"
      />

      {/* 搜索框 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="搜索状态码或描述..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* 状态码列表 */}
      {groupedCodes.map(
        (group) =>
          group.codes.length > 0 && (
            <Box key={group.category} sx={{ mb: 4 }}>
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  {getCategoryIcon(group.category)}
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {group.category} 状态码
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getCategoryDescription(group.category)}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Grid container spacing={2}>
                {group.codes.map((status) => (
                  <Grid item xs={12} sm={6} md={4} key={status.code}>
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
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <Chip
                            label={status.code}
                            color={getCategoryColor(status.category)}
                            sx={{ fontWeight: 600, fontSize: '1rem' }}
                          />
                        </Stack>
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                          {status.message}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {status.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )
      )}

      {filteredCodes.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography color="text.secondary">
            未找到匹配的状态码，请尝试其他关键词
          </Typography>
        </Paper>
      )}

      {/* 使用说明 */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          状态码分类说明
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Chip label="1xx" color="info" size="small" sx={{ mb: 1 }} />
              <Typography variant="body2">
                <strong>信息响应</strong>
                <br />
                表示请求已被接收，继续处理
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Chip label="2xx" color="success" size="small" sx={{ mb: 1 }} />
              <Typography variant="body2">
                <strong>成功响应</strong>
                <br />
                请求已成功被服务器接收、理解并处理
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Chip label="3xx" color="primary" size="small" sx={{ mb: 1 }} />
              <Typography variant="body2">
                <strong>重定向</strong>
                <br />
                需要进一步操作以完成请求
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Chip label="4xx" color="warning" size="small" sx={{ mb: 1 }} />
              <Typography variant="body2">
                <strong>客户端错误</strong>
                <br />
                请求包含错误或无法完成
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Chip label="5xx" color="error" size="small" sx={{ mb: 1 }} />
              <Typography variant="body2">
                <strong>服务器错误</strong>
                <br />
                服务器在处理请求时发生错误
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

