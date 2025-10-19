import React from 'react';
import { ToolListPage } from '../../../components/ToolListPage';
import { ALL_TOOLS } from '../../../data/allTools';

export const DesignTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => 
    tool.path === '/tools/data/gradient-generator' ||
    tool.path === '/tools/data/shadow-generator'
  );

  return (
    <ToolListPage
      title="设计辅助"
      description="CSS 样式和设计相关工具"
      tools={tools}
    />
  );
};

