import React, { useRef, useState } from 'react';
import { Box, Button, Typography, Stack } from '@mui/material';
import { CloudUpload, Image as ImageIcon } from '@mui/icons-material';

interface ImageUploadBoxProps {
  onFileSelect: (file: File) => void;
  accept?: string;
}

export const ImageUploadBox: React.FC<ImageUploadBoxProps> = ({
  onFileSelect,
  accept = 'image/*',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

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

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // 根据 accept 属性判断文件类型
      const acceptType = accept.split('/')[0]; // 'image' or 'video'
      if (file.type.startsWith(acceptType)) {
        onFileSelect(file);
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <Box
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'divider',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          bgcolor: isDragging ? 'action.hover' : 'background.default',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <Stack spacing={2} alignItems="center">
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 2,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            {isDragging ? (
              <ImageIcon sx={{ fontSize: 48 }} />
            ) : (
              <CloudUpload sx={{ fontSize: 48 }} />
            )}
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              {isDragging 
                ? `松开鼠标上传${accept.startsWith('video') ? '视频' : accept.startsWith('audio') ? '音频' : '图片'}` 
                : `点击或拖拽${accept.startsWith('video') ? '视频' : accept.startsWith('audio') ? '音频' : '图片'}到此处`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {accept.startsWith('video') 
                ? '支持 MP4、AVI、MOV、WebM 等格式' 
                : accept.startsWith('audio')
                ? '支持 MP3、WAV、AAC、OGG、M4A 等格式'
                : '支持 JPG、PNG、GIF、WebP 等格式'}
            </Typography>
          </Box>

          <Button variant="contained" size="large" startIcon={<CloudUpload />}>
            选择{accept.startsWith('video') ? '视频' : accept.startsWith('audio') ? '音频' : '图片'}
          </Button>
        </Stack>
      </Box>
    </>
  );
};

