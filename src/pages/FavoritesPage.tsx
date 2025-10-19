import React, { useMemo } from 'react';
import { Container, Typography, Box, Grid, Alert } from '@mui/material';
import { Star } from '@mui/icons-material';
import { ToolCard } from '../components/ToolCard';
import { useFavorites } from '../contexts/FavoritesContext';
import { ALL_TOOLS } from '../data/allTools';

export const FavoritesPage: React.FC = () => {
  const { favorites } = useFavorites();

  const favoriteTools = useMemo(() => {
    return ALL_TOOLS.filter((tool) => favorites.has(tool.path));
  }, [favorites]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Star sx={{ fontSize: 40, color: 'warning.main' }} />
          <Typography variant="h4" component="h1">
            我的收藏
          </Typography>
        </Box>
        <Typography color="text.secondary" paragraph>
          这里是您收藏的所有工具，方便快速访问常用功能
        </Typography>
      </Box>

      {favoriteTools.length === 0 ? (
        <Alert severity="info" sx={{ mt: 4 }}>
          您还没有收藏任何工具。点击工具卡片右上角的星标即可收藏！
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {favoriteTools.map((tool, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <ToolCard tool={tool} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

