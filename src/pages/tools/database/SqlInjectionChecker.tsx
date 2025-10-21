import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Alert,
  Chip,
  Stack,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
} from '@mui/material';
import {
  Security,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
  Code,
  LightbulbOutlined,
  BugReport,
} from '@mui/icons-material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';

interface SecurityIssue {
  type: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  recommendation: string;
  pattern?: string;
}

export const SqlInjectionChecker: React.FC = () => {
  const [sqlInput, setSqlInput] = useState('');
  const [issues, setIssues] = useState<SecurityIssue[]>([]);
  const [securityScore, setSecurityScore] = useState<number | null>(null);
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  const analyzeSql = () => {
    const foundIssues: SecurityIssue[] = [];
    let score = 100;

    // 1. 检测常见的 SQL 注入模式
    const injectionPatterns = [
      {
        pattern: /'.*OR.*'.*=.*'/i,
        issue: {
          type: 'critical' as const,
          title: '检测到典型的 SQL 注入模式',
          description: '发现类似 "OR \'1\'=\'1\'" 的危险模式，这是最常见的 SQL 注入攻击手法',
          recommendation: '使用参数化查询（Prepared Statements）替代字符串拼接',
          pattern: "例如: WHERE username = 'admin' OR '1'='1'",
        },
        scoreDeduction: 40,
      },
      {
        pattern: /;\s*(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE)\s+/i,
        issue: {
          type: 'critical' as const,
          title: '检测到潜在的破坏性注入',
          description: '发现分号后跟随破坏性 SQL 语句（DROP、DELETE 等），可能导致数据丢失',
          recommendation: '严格过滤用户输入，禁止分号和多语句执行',
          pattern: '例如: \'; DROP TABLE users; --',
        },
        scoreDeduction: 50,
      },
      {
        pattern: /--|\#|\/\*/,
        issue: {
          type: 'high' as const,
          title: '检测到 SQL 注释符',
          description: '发现注释符号（--、#、/*），常用于绕过后续的 SQL 验证逻辑',
          recommendation: '过滤或转义注释符号，或使用参数化查询',
          pattern: '例如: \' OR 1=1 --',
        },
        scoreDeduction: 25,
      },
      {
        pattern: /UNION\s+SELECT/i,
        issue: {
          type: 'high' as const,
          title: '检测到 UNION 注入尝试',
          description: '发现 UNION SELECT 语句，可能用于提取额外的数据',
          recommendation: '使用参数化查询，并限制查询权限',
          pattern: '例如: \' UNION SELECT password FROM users --',
        },
        scoreDeduction: 30,
      },
      {
        pattern: /\bEXEC\b|\bEXECUTE\b/i,
        issue: {
          type: 'critical' as const,
          title: '检测到动态 SQL 执行',
          description: '发现 EXEC/EXECUTE 语句，可能执行任意 SQL 代码',
          recommendation: '避免动态 SQL 执行，使用白名单验证',
          pattern: '例如: EXEC(@sql)',
        },
        scoreDeduction: 35,
      },
    ];

    injectionPatterns.forEach(({ pattern, issue, scoreDeduction }) => {
      if (pattern.test(sqlInput)) {
        foundIssues.push(issue);
        score -= scoreDeduction;
      }
    });

    // 2. 检测字符串拼接风险
    if (/\+\s*'|'\s*\+|CONCAT\s*\(/i.test(sqlInput) && /WHERE|AND|OR/i.test(sqlInput)) {
      foundIssues.push({
        type: 'medium',
        title: '检测到字符串拼接',
        description: '在 WHERE 子句中使用字符串拼接可能导致注入风险',
        recommendation: '使用参数化查询或预编译语句',
        pattern: '例如: "SELECT * FROM users WHERE id = \'" + userId + "\'"',
      });
      score -= 15;
    }

    // 3. 检测缺少引号转义
    if (/'[^']*'[^']*'/.test(sqlInput) && !/ESCAPE/i.test(sqlInput)) {
      foundIssues.push({
        type: 'medium',
        title: '引号使用可能存在风险',
        description: '多重引号嵌套时，如果没有正确转义，可能被利用',
        recommendation: '使用参数化查询，或确保所有单引号都被正确转义',
      });
      score -= 10;
    }

    // 4. 检测宽松的比较
    if (/=\s*['"].*%['"]|LIKE\s*['"]%/i.test(sqlInput)) {
      foundIssues.push({
        type: 'low',
        title: '检测到宽松的模式匹配',
        description: '使用 LIKE \'%...%\' 可能导致性能问题和信息泄露',
        recommendation: '限制通配符的使用范围，使用全文搜索或精确匹配',
      });
      score -= 5;
    }

    // 5. 检测是否使用了参数化标记（好的实践）
    if (/\?|:\w+|@\w+|\$\d+/.test(sqlInput)) {
      foundIssues.push({
        type: 'info',
        title: '✅ 检测到参数化占位符',
        description: '发现参数化查询标记（?、:param、@param、$1 等），这是良好的安全实践',
        recommendation: '继续保持使用参数化查询，确保所有用户输入都通过参数传递',
      });
      score += 10; // 加分
    }

    // 6. 检测是否有明显的硬编码凭证
    if (/password\s*=\s*['"][^'"]+['"]/i.test(sqlInput)) {
      foundIssues.push({
        type: 'high',
        title: '检测到硬编码密码',
        description: '在 SQL 中直接包含密码是严重的安全风险',
        recommendation: '从配置文件或环境变量中读取凭证，不要硬编码',
      });
      score -= 20;
    }

    // 确保分数在 0-100 之间
    score = Math.max(0, Math.min(100, score));

    setIssues(foundIssues);
    setSecurityScore(score);
    setIsAnalyzed(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 60) return '中等';
    if (score >= 40) return '较差';
    return '危险';
  };

  const getIssueIcon = (type: SecurityIssue['type']) => {
    switch (type) {
      case 'critical':
        return <ErrorIcon color="error" />;
      case 'high':
        return <Warning color="error" />;
      case 'medium':
        return <Warning color="warning" />;
      case 'low':
        return <Warning color="info" />;
      case 'info':
        return <CheckCircle color="success" />;
    }
  };

  const getIssueColor = (type: SecurityIssue['type']) => {
    switch (type) {
      case 'critical':
        return 'error';
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      case 'info':
        return 'success';
    }
  };

  const handleClear = () => {
    setSqlInput('');
    setIssues([]);
    setSecurityScore(null);
    setIsAnalyzed(false);
  };

  const loadExample = (type: 'safe' | 'vulnerable') => {
    if (type === 'safe') {
      setSqlInput(
        `-- 安全的参数化查询示例\nSELECT id, username, email \nFROM users \nWHERE username = ? AND status = 'active'\nLIMIT 10;`
      );
    } else {
      setSqlInput(
        `-- 危险的 SQL 注入示例（仅用于测试）\nSELECT * FROM users WHERE username = 'admin' OR '1'='1' --' AND password = 'anything';`
      );
    }
  };

  return (
    <Container maxWidth="xl">
      <ToolDetailHeader
        title="SQL 注入检测"
        description="分析 SQL 语句的安全风险，检测潜在的注入漏洞"
        toolPath="/tools/database/sql-injection-checker"
      />

      <Grid container spacing={3}>
        {/* 输入区 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Code /> SQL 语句输入
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={18}
              value={sqlInput}
              onChange={(e) => setSqlInput(e.target.value)}
              placeholder="在此粘贴或输入 SQL 语句..."
              sx={{
                mb: 2,
                '& .MuiInputBase-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                },
              }}
            />
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button variant="contained" onClick={analyzeSql} disabled={!sqlInput.trim()} startIcon={<Security />}>
                检测注入风险
              </Button>
              <Button variant="outlined" onClick={handleClear}>
                清空
              </Button>
              <Button variant="outlined" onClick={() => loadExample('safe')} size="small">
                加载安全示例
              </Button>
              <Button variant="outlined" onClick={() => loadExample('vulnerable')} size="small" color="error">
                加载危险示例
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* 结果区 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BugReport /> 检测结果
            </Typography>

            {!isAnalyzed ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Security sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">输入 SQL 语句后点击"检测注入风险"</Typography>
              </Box>
            ) : (
              <>
                {/* 安全评分 */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2">安全评分</Typography>
                    <Chip
                      label={`${securityScore} / 100 - ${getScoreLabel(securityScore!)}`}
                      color={getScoreColor(securityScore!)}
                      size="small"
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={securityScore!}
                    color={getScoreColor(securityScore!)}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>

                {/* 风险统计 */}
                <Box sx={{ mb: 3 }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      label={`严重: ${issues.filter((i) => i.type === 'critical').length}`}
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                    <Chip
                      label={`高危: ${issues.filter((i) => i.type === 'high').length}`}
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                    <Chip
                      label={`中等: ${issues.filter((i) => i.type === 'medium').length}`}
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                    <Chip
                      label={`低危: ${issues.filter((i) => i.type === 'low').length}`}
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  </Stack>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* 问题列表 */}
                {issues.length === 0 ? (
                  <Alert severity="success" icon={<CheckCircle />}>
                    <Typography variant="subtitle2">未发现明显的安全风险！</Typography>
                    <Typography variant="body2">
                      该 SQL 语句看起来比较安全，但请确保：
                      <br />• 所有用户输入都使用参数化查询
                      <br />• 数据库账户权限最小化
                      <br />• 启用了 SQL 防火墙或 WAF
                    </Typography>
                  </Alert>
                ) : (
                  <List
                    sx={{
                      maxHeight: 400,
                      overflowY: 'auto',
                      '&::-webkit-scrollbar': { width: '8px' },
                      '&::-webkit-scrollbar-track': {
                        backgroundColor: (theme) =>
                          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: (theme) => theme.palette.primary.main,
                        borderRadius: '4px',
                        '&:hover': {
                          backgroundColor: (theme) => theme.palette.primary.dark,
                        },
                      },
                    }}
                  >
                    {issues.map((issue, index) => (
                      <React.Fragment key={index}>
                        <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                          <ListItemIcon sx={{ mt: 0.5 }}>{getIssueIcon(issue.type)}</ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                  {issue.title}
                                </Typography>
                                <Chip label={issue.type.toUpperCase()} size="small" color={getIssueColor(issue.type)} />
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                  {issue.description}
                                </Typography>
                                {issue.pattern && (
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      mt: 1,
                                      p: 1,
                                      bgcolor: 'action.hover',
                                      borderRadius: 1,
                                      fontFamily: 'monospace',
                                      fontSize: '0.75rem',
                                    }}
                                  >
                                    {issue.pattern}
                                  </Typography>
                                )}
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 1 }}>
                                  <LightbulbOutlined fontSize="small" color="primary" sx={{ mt: 0.3 }} />
                                  <Typography variant="body2" color="primary.main">
                                    <strong>建议：</strong>
                                    {issue.recommendation}
                                  </Typography>
                                </Box>
                              </>
                            }
                          />
                        </ListItem>
                        {index < issues.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 底部提示 */}
      <Box sx={{ mt: 3 }}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>使用提示：</strong>
          </Typography>
          <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
            <li>本工具基于常见的 SQL 注入模式进行静态分析，无法检测所有漏洞</li>
            <li>即使评分较高，也应该始终使用参数化查询（Prepared Statements）</li>
            <li>建议结合动态测试工具（如 SQLMap）进行全面的安全测试</li>
            <li>永远不要信任用户输入，使用白名单验证而非黑名单过滤</li>
          </Typography>
        </Alert>
      </Box>
    </Container>
  );
};

