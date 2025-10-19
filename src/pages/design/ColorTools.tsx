import React from 'react';
import { ToolListPage } from '../../components/ToolListPage';
import { ALL_TOOLS } from '../../data/allTools';

export const ColorTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => 
    tool.path === '/tools/design/color-converter' ||
    tool.path === '/tools/design/gradient-generator'
  );

  return (
    <ToolListPage
      title="颜色工具"
      description="颜色转换、渐变色生成等工具"
      tools={tools}
    />
  );
};

