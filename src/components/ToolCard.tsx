import React from 'react';
import {
  Card,
  CardActionArea,
  CardContent,
  Box,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../contexts/FavoritesContext';
import { Tool } from '../types/tool';

interface ToolCardProps {
  tool: Tool;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isToolFavorite = isFavorite(tool.path);
  const isAvailable = tool.status === '可用';

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(tool.path);
  };

  const handleCardClick = () => {
    if (isAvailable) {
      navigate(tool.path);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        transition: 'all 0.3s ease',
        opacity: isAvailable ? 1 : 0.6,
        '&:hover': {
          transform: isAvailable ? 'translateY(-4px)' : 'none',
          boxShadow: (theme) =>
            isAvailable
              ? theme.palette.mode === 'dark'
                ? '0 8px 16px 0 rgb(0 0 0 / 0.4)'
                : '0 8px 16px 0 rgb(0 0 0 / 0.15)'
              : 'none',
        },
      }}
    >
      {/* 收藏按钮 */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1,
        }}
      >
        <Tooltip title={isToolFavorite ? '取消收藏' : '添加到收藏'}>
          <IconButton
            size="small"
            onClick={handleFavoriteClick}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': {
                bgcolor: 'background.paper',
                transform: 'scale(1.1)',
              },
            }}
          >
            {isToolFavorite ? (
              <Star sx={{ color: 'warning.main', fontSize: 20 }} />
            ) : (
              <StarBorder sx={{ fontSize: 20 }} />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* 卡片内容 */}
      <CardActionArea
        onClick={handleCardClick}
        disabled={!isAvailable}
        sx={{
          height: '100%',
          cursor: isAvailable ? 'pointer' : 'not-allowed',
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Box
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderRadius: 2,
                p: 1,
                display: 'flex',
                mr: 2,
              }}
            >
              {tool.icon}
            </Box>
            <Box sx={{ flex: 1, pr: 1 }}>
              <Typography variant="h6" component="div">
                {tool.title}
              </Typography>
              <Typography
                variant="caption"
                color={tool.status === '可用' ? 'success.main' : 'warning.main'}
                sx={{ fontWeight: 'bold' }}
              >
                {tool.status}
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {tool.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

