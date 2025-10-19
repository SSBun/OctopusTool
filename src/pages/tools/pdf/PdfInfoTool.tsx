import React, { useState } from 'react';
import {
Container,
  Typography,
  Box,
  Paper,
  Alert,
  Divider,
  Grid,
  Stack,
} from '@mui/material';
import { ToolDetailHeader } from '../../../components/ToolDetailHeader';
import {
  PictureAsPdf,
  AccessTime,
  Storage,
  Description,
  Person,
  Today,
} from '@mui/icons-material';
import { PdfUploadBox } from '../../../components/PdfUploadBox';
import * as pdfjsLib from 'pdfjs-dist';

// 配置 PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs';

interface PdfInfo {
  fileName: string;
  fileSize: number;
  numPages: number;
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
}

export const PdfInfoTool: React.FC = () => {
  const [pdfInfo, setPdfInfo] = useState<PdfInfo | null>(null);
  const [error, setError] = useState('');

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '未知';
    
    // PDF 日期格式: D:YYYYMMDDHHmmSS
    if (dateString.startsWith('D:')) {
      const year = dateString.substring(2, 6);
      const month = dateString.substring(6, 8);
      const day = dateString.substring(8, 10);
      const hour = dateString.substring(10, 12);
      const minute = dateString.substring(12, 14);
      return `${year}-${month}-${day} ${hour}:${minute}`;
    }
    
    try {
      return new Date(dateString).toLocaleString('zh-CN');
    } catch {
      return dateString;
    }
  };

  const handleFileSelect = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('请选择 PDF 文件');
      return;
    }

    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument(arrayBuffer);
      const pdf = await loadingTask.promise;
      
      const metadata = await pdf.getMetadata();
      const info = metadata.info;

      const pdfData: PdfInfo = {
        fileName: file.name,
        fileSize: file.size,
        numPages: pdf.numPages,
        title: info.Title || undefined,
        author: info.Author || undefined,
        subject: info.Subject || undefined,
        creator: info.Creator || undefined,
        producer: info.Producer || undefined,
        creationDate: info.CreationDate || undefined,
        modificationDate: info.ModDate || undefined,
      };

      setPdfInfo(pdfData);
    } catch (err) {
      console.error(err);
      setError('无法读取 PDF 文件信息：' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  const InfoCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    color?: string;
  }> = ({ icon, label, value, color = 'error.main' }) => (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        height: '100%',
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 1,
          bgcolor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography 
          variant="h6" 
          fontWeight={600} 
          sx={{ 
            wordBreak: 'break-all',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {value}
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Container maxWidth="lg">
      <ToolDetailHeader
        title="PDF 信息查看"
        description="查看 PDF 文件的详细信息和元数据"
        toolPath="/tools/pdf/info"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          上传 PDF
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <PdfUploadBox onFileSelect={handleFileSelect} />
      </Paper>

      {pdfInfo && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              基本信息
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <InfoCard
                  icon={<Description />}
                  label="页数"
                  value={`${pdfInfo.numPages} 页`}
                  color="error.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InfoCard
                  icon={<Storage />}
                  label="文件大小"
                  value={formatSize(pdfInfo.fileSize)}
                  color="success.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InfoCard
                  icon={<PictureAsPdf />}
                  label="文件名"
                  value={pdfInfo.fileName}
                  color="primary.main"
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              文档元数据
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2}>
              {pdfInfo.title && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    标题
                  </Typography>
                  <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                    {pdfInfo.title}
                  </Typography>
                </Box>
              )}
              
              {pdfInfo.author && (
                <>
                  <Divider />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person fontSize="small" color="action" />
                    <Box flex={1}>
                      <Typography variant="caption" color="text.secondary">
                        作者
                      </Typography>
                      <Typography variant="body1">{pdfInfo.author}</Typography>
                    </Box>
                  </Box>
                </>
              )}

              {pdfInfo.subject && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      主题
                    </Typography>
                    <Typography variant="body1">{pdfInfo.subject}</Typography>
                  </Box>
                </>
              )}

              {(pdfInfo.creator || pdfInfo.producer) && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      创建工具
                    </Typography>
                    <Typography variant="body2">
                      {pdfInfo.creator && `创建者: ${pdfInfo.creator}`}
                      {pdfInfo.creator && pdfInfo.producer && <br />}
                      {pdfInfo.producer && `生成器: ${pdfInfo.producer}`}
                    </Typography>
                  </Box>
                </>
              )}

              {(pdfInfo.creationDate || pdfInfo.modificationDate) && (
                <>
                  <Divider />
                  <Grid container spacing={2}>
                    {pdfInfo.creationDate && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Today fontSize="small" color="action" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              创建时间
                            </Typography>
                            <Typography variant="body2">
                              {formatDate(pdfInfo.creationDate)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                    {pdfInfo.modificationDate && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTime fontSize="small" color="action" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              修改时间
                            </Typography>
                            <Typography variant="body2">
                              {formatDate(pdfInfo.modificationDate)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </>
              )}
            </Stack>
          </Paper>
        </>
      )}
    </Container>
  );
};

