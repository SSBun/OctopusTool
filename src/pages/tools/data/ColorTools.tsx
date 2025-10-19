import React from 'react';
import { ToolListPage } from '../../../components/ToolListPage';
import { ALL_TOOLS } from '../../../data/allTools';

export const ColorTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => 
    tool.path === '/tools/data/color-converter'
  );

  return (
    <ToolListPage
      title="颜色工具"
      description="RGB, HEX, HSL 等颜色格式转换"
      tools={tools}
    />
  );
};
