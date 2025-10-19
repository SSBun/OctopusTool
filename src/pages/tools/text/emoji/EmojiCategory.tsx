/**
 * Emoji 分类标签组件
 */

import React from 'react';
import { Box, Tabs, Tab, Chip } from '@mui/material';
import { Star, History, Search as SearchIcon } from '@mui/icons-material';

interface Category {
  id: number;
  name: string;
  icon: string;
  count: number;
}

interface EmojiCategoryProps {
  categories: Category[];
  selectedCategory: number | 'all' | 'favorites' | 'recent';
  onCategoryChange: (category: number | 'all' | 'favorites' | 'recent') => void;
  favoritesCount: number;
  recentCount: number;
  isSearching: boolean;
}

export const EmojiCategory: React.FC<EmojiCategoryProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  favoritesCount,
  recentCount,
  isSearching,
}) => {
  const handleChange = (_event: React.SyntheticEvent, newValue: number | string) => {
    onCategoryChange(newValue as any);
  };

  if (isSearching) {
    return (
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
          <SearchIcon color="primary" />
          <Box sx={{ fontWeight: 600 }}>搜索结果</Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
      <Tabs
        value={selectedCategory}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          '& .MuiTab-root': {
            minHeight: 60,
            textTransform: 'none',
          },
        }}
      >
        <Tab
          value="all"
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span style={{ fontSize: '1.2rem' }}>🌟</span>
              <span>全部</span>
            </Box>
          }
        />
        
        {favoritesCount > 0 && (
          <Tab
            value="favorites"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Star fontSize="small" />
                <span>收藏</span>
                <Chip label={favoritesCount} size="small" />
              </Box>
            }
          />
        )}
        
        {recentCount > 0 && (
          <Tab
            value="recent"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <History fontSize="small" />
                <span>最近</span>
                <Chip label={recentCount} size="small" />
              </Box>
            }
          />
        )}

        {categories.map(category => (
          <Tab
            key={category.id}
            value={category.id}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ fontSize: '1.2rem' }}>{category.icon}</span>
                <span>{category.name}</span>
                <Chip label={category.count} size="small" />
              </Box>
            }
          />
        ))}
      </Tabs>
    </Box>
  );
};

