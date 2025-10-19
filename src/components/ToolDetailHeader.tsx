import React from 'react';
import { Box, Typography } from '@mui/material';
import { FavoriteButton } from './FavoriteButton';

interface ToolDetailHeaderProps {
  title: string;
  description: string;
  toolPath: string;
}

export const ToolDetailHeader: React.FC<ToolDetailHeaderProps> = ({
  title,
  description,
  toolPath,
}) => {
  return (
    <Box sx={{ my: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            {title}
          </Typography>
          <Typography color="text.secondary" paragraph>
            {description}
          </Typography>
        </Box>
        <FavoriteButton toolPath={toolPath} />
      </Box>
    </Box>
  );
};

