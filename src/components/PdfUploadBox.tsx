import React, { useState } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { CloudUpload, PictureAsPdf } from '@mui/icons-material';

interface PdfUploadBoxProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  multiple?: boolean;
  title?: string;
  description?: string;
}

export const PdfUploadBox: React.FC<PdfUploadBoxProps> = ({
  onFileSelect,
  accept = 'application/pdf',
  multiple = false,
  title,
  description,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <Box
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        position: 'relative',
        border: '2px dashed',
        borderColor: isDragging ? 'primary.main' : 'divider',
        borderRadius: 2,
        p: 4,
        textAlign: 'center',
        cursor: 'pointer',
        bgcolor: isDragging ? 'action.hover' : 'background.paper',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'action.hover',
        },
      }}
      onClick={() => document.getElementById('pdf-file-input')?.click()}
    >
      <input
        id="pdf-file-input"
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <Stack spacing={2} alignItems="center">
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'error.main',
            color: 'white',
          }}
        >
          {isDragging ? (
            <CloudUpload sx={{ fontSize: 48 }} />
          ) : (
            <PictureAsPdf sx={{ fontSize: 48 }} />
          )}
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            {isDragging 
              ? '松开鼠标上传PDF' 
              : title || '点击或拖拽PDF到此处'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description || '支持 PDF 格式文件'}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

