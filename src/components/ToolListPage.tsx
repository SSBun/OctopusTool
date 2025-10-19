import React from 'react';
import { Container, Typography, Box, Grid } from '@mui/material';
import { ToolCard } from './ToolCard';
import { Tool } from '../types/tool';

interface ToolListPageProps {
  title: string;
  description: string;
  tools: Tool[];
}

export const ToolListPage: React.FC<ToolListPageProps> = ({
  title,
  description,
  tools,
}) => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        <Typography color="text.secondary" paragraph>
          {description}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {tools.map((tool, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <ToolCard tool={tool} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

