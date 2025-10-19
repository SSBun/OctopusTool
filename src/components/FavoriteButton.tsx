import React from 'react';
import { Button } from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';
import { useFavorites } from '../contexts/FavoritesContext';

interface FavoriteButtonProps {
  toolPath: string;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  toolPath,
  size = 'medium',
  fullWidth = false,
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isToolFavorite = isFavorite(toolPath);

  return (
    <Button
      variant={isToolFavorite ? 'contained' : 'outlined'}
      color={isToolFavorite ? 'warning' : 'inherit'}
      startIcon={isToolFavorite ? <Star /> : <StarBorder />}
      onClick={() => toggleFavorite(toolPath)}
      size={size}
      fullWidth={fullWidth}
    >
      {isToolFavorite ? '已收藏' : '收藏'}
    </Button>
  );
};

