import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  CheckCircle,
  Error as ErrorIcon,
  Info,
  Clear,
  DataObject,
} from '@mui/icons-material';

interface ValidationResult {
  valid: boolean;
  error?: string;
  lineNumber?: number;
  details?: {
    type: string;
    keys: number;
    depth: number;
    size: number;
  };
}

export const JsonValidator: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [autoValidate, setAutoValidate] = useState(false);

  const getJsonDepth = (obj: any, depth = 0): number => {
    if (obj !== null && typeof obj === 'object') {
      const depths = Object.values(obj).map((val) => getJsonDepth(val, depth + 1));
      return Math.max(depth, ...depths);
    }
    return depth;
  };

  const countKeys = (obj: any): number => {
    if (obj !== null && typeof obj === 'object') {
      const keys = Object.keys(obj).length;
      const childKeys = Object.values(obj).reduce(
        (sum: number, val) => sum + countKeys(val),
        0
      );
      return keys + childKeys;
    }
    return 0;
  };

  const handleValidate = () => {
    if (!input.trim()) {
      setResult(null);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const type = Array.isArray(parsed) ? '数组' : typeof parsed === 'object' ? '对象' : typeof parsed;
      
      setResult({
        valid: true,
        details: {
          type,
          keys: countKeys(parsed),
          depth: getJsonDepth(parsed),
          size: new Blob([input]).size,
        },
      });
    } catch (e) {
      const error = e as SyntaxError;
      let lineNumber: number | undefined;
      
      // 尝试提取行号
      const match = error.message.match(/position (\d+)/);
      if (match) {
        const position = parseInt(match[1]);
        lineNumber = input.substring(0, position).split('\n').length;
      }

      setResult({
        valid: false,
        error: error.message,
        lineNumber,
      });
    }
  };

  useEffect(() => {
    if (autoValidate && input) {
      const timer = setTimeout(handleValidate, 500);
      return () => clearTimeout(timer);
    }
  }, [input, autoValidate]);

  const handleClear = () => {
    setInput('');
    setResult(null);
  };

  const handleExample = () => {
    const example = `{
  "name": "JSON Validator",
  "version": "1.0.0",
  "features": ["validation", "formatting", "error detection"],
  "settings": {
    "autoValidate": true,
    "theme": "dark"
  }
}`;
    setInput(example);
  };

  const handleInvalidExample = () => {
    const invalid = `{
  "name": "Invalid JSON",
  "missing": "comma"
  "error": "here"
}`;
    setInput(invalid);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          JSON 验证工具
        </Typography>
        <Typography color="text.secondary" paragraph>
          验证 JSON 格式是否正确，并提供详细的错误信息
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<CheckCircle />}
          onClick={handleValidate}
          disabled={!input}
        >
          验证
        </Button>
        <Button variant="outlined" startIcon={<Clear />} onClick={handleClear}>
          清空
        </Button>
        <Button variant="text" onClick={handleExample}>
          正确示例
        </Button>
        <Button variant="text" onClick={handleInvalidExample}>
          错误示例
        </Button>
        <Chip
          label={autoValidate ? '自动验证：开' : '自动验证：关'}
          onClick={() => setAutoValidate(!autoValidate)}
          color={autoValidate ? 'primary' : 'default'}
          sx={{ ml: 'auto' }}
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            JSON 输入
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={20}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="粘贴或输入要验证的 JSON 数据"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              },
            }}
          />
        </Paper>

        <Box>
          {result && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                验证结果
              </Typography>
              
              {result.valid ? (
                <>
                  <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2 }}>
                    JSON 格式正确！
                  </Alert>
                  
                  {result.details && (
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <DataObject color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="数据类型"
                          secondary={result.details.type}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Info color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="键数量"
                          secondary={`${result.details.keys} 个`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Info color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="嵌套深度"
                          secondary={`${result.details.depth} 层`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Info color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="数据大小"
                          secondary={`${result.details.size} 字节`}
                        />
                      </ListItem>
                    </List>
                  )}
                </>
              ) : (
                <>
                  <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 2 }}>
                    JSON 格式错误
                  </Alert>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                      错误信息：
                    </Typography>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark' ? '#2d1b1b' : '#fff5f5',
                        border: '1px solid',
                        borderColor: 'error.main',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', color: 'error.main' }}
                      >
                        {result.error}
                      </Typography>
                      {result.lineNumber && (
                        <Typography
                          variant="body2"
                          sx={{ mt: 1, color: 'text.secondary' }}
                        >
                          可能在第 {result.lineNumber} 行附近
                        </Typography>
                      )}
                    </Paper>
                  </Box>
                </>
              )}
            </Paper>
          )}

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              使用提示
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="• 粘贴 JSON 数据到左侧输入框"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="• 点击验证按钮或开启自动验证"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="• 查看验证结果和详细信息"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="• 错误信息会指出具体问题位置"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            </List>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

