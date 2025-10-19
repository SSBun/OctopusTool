import React from 'react';
import { ToolListPage } from '../../components/ToolListPage';
import { ALL_TOOLS } from '../../data/allTools';

export const CssTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => 
    tool.path === '/tools/design/shadow-generator' ||
    tool.path === '/tools/design/border-radius' ||
    tool.path === '/tools/design/flex-generator'
  );

  return (
    <ToolListPage
      title="CSS 工具"
      description="CSS 样式生成和辅助工具"
      tools={tools}
    />
  );
};

